import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable, leadImportHistoryTable } from "@workspace/db";
import { eq, like, desc, and, or } from "drizzle-orm";
import { requireAdmin } from "./middleware";
import { sendMail } from "../../lib/mailer";
import { getTemplate } from "../../lib/campaign";

const router = Router();

// Helper: parse Google Sheets URL → CSV export URL
function toCSVUrl(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return null;
  const id = match[1];
  const gidMatch = url.match(/[#&?]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

// Helper: simple CSV parser (handles quoted fields)
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) || [];
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] || "").replace(/^"|"$/g, "").trim();
    });
    return row;
  });
}

// Helper: resolve column aliases
function resolveField(row: Record<string, string>, aliases: string[]): string | undefined {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== "") return row[alias];
  }
  return undefined;
}

// GET /admin/leads
router.get("/admin/leads", requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query as { status?: string; search?: string };

    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(leadsTable.status, status));
    }
    if (search) {
      conditions.push(
        or(
          like(leadsTable.email, `%${search}%`),
          like(leadsTable.firstName, `%${search}%`),
          like(leadsTable.lastName, `%${search}%`),
          like(leadsTable.company, `%${search}%`)
        )
      );
    }

    const leads = conditions.length
      ? await db.select().from(leadsTable).where(and(...conditions)).orderBy(desc(leadsTable.createdAt))
      : await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));

    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// POST /admin/leads
router.post("/admin/leads", requireAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, company, notes, advisorId } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    await db.insert(leadsTable).values({
      firstName: firstName || null,
      lastName: lastName || null,
      email,
      phone: phone || null,
      company: company || null,
      notes: notes || null,
      advisorId: advisorId || null,
      source: "manual",
      status: "new",
      emailDay: 0,
      campaignActive: true,
    });

    const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.email, email));
    res.status(201).json(lead);
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "A lead with this email already exists" });
    res.status(500).json({ error: "Failed to create lead" });
  }
});

// POST /admin/leads/import — must come before /:id
router.post("/admin/leads/import", requireAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "url is required" });

    const csvUrl = toCSVUrl(url);
    if (!csvUrl) return res.status(400).json({ error: "Invalid Google Sheets URL" });

    const response = await fetch(csvUrl);
    if (!response.ok) return res.status(400).json({ error: "Could not fetch sheet — ensure it is publicly accessible (Anyone with link)" });

    const text = await response.text();
    const rows = parseCSV(text);

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    const batch = new Date().toISOString().slice(0, 10);

    for (const row of rows) {
      const email = resolveField(row, ["email"]);
      if (!email) { skipped++; continue; }

      try {
        await db.insert(leadsTable).values({
          email,
          firstName: resolveField(row, ["first_name", "firstname", "first name"]) || null,
          lastName: resolveField(row, ["last_name", "lastname", "last name"]) || null,
          phone: resolveField(row, ["phone", "mobile", "cell"]) || null,
          company: resolveField(row, ["company", "organisation", "organization"]) || null,
          source: "import",
          status: "new",
          emailDay: 0,
          campaignActive: true,
          importBatch: batch,
        });
        imported++;
      } catch (e: any) {
        if (e?.code === "ER_DUP_ENTRY") {
          skipped++;
        } else {
          errors.push(`${email}: ${e?.message || "unknown error"}`);
        }
      }
    }

    // Log import history
    await db.insert(leadImportHistoryTable).values({
      sourceUrl: url,
      importedCount: imported,
      status: "completed",
    });

    res.json({ imported, skipped, errors });
  } catch (err: any) {
    // Still try to log a failed import
    try {
      await db.insert(leadImportHistoryTable).values({
        sourceUrl: req.body?.url || "",
        importedCount: 0,
        status: "failed",
      });
    } catch {}
    res.status(500).json({ error: err?.message || "Import failed" });
  }
});

// GET /admin/leads/import-history
router.get("/admin/leads/import-history", requireAdmin, async (req, res) => {
  try {
    const history = await db
      .select()
      .from(leadImportHistoryTable)
      .orderBy(desc(leadImportHistoryTable.createdAt))
      .limit(20);
    res.json(history);
  } catch {
    res.status(500).json({ error: "Failed to fetch import history" });
  }
});

// GET /admin/leads/:id
router.get("/admin/leads/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch {
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

// PATCH /admin/leads/:id
router.patch("/admin/leads/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { firstName, lastName, email, phone, company, status, notes, advisorId, campaignActive } = req.body;

    const updateData: Partial<typeof leadsTable.$inferInsert> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (advisorId !== undefined) updateData.advisorId = advisorId;
    if (campaignActive !== undefined) updateData.campaignActive = campaignActive;

    await db.update(leadsTable).set(updateData).where(eq(leadsTable.id, id));
    const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch {
    res.status(500).json({ error: "Failed to update lead" });
  }
});

// DELETE /admin/leads/:id
router.delete("/admin/leads/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(leadsTable).where(eq(leadsTable.id, id));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete lead" });
  }
});

// GET /admin/leads/:id/emails
router.get("/admin/leads/:id/emails", requireAdmin, async (req, res) => {
  try {
    const { leadEmailLogsTable } = await import("@workspace/db");
    const id = Number(req.params.id);
    const logs = await db
      .select()
      .from(leadEmailLogsTable)
      .where(eq(leadEmailLogsTable.leadId, id))
      .orderBy(desc(leadEmailLogsTable.sentAt));
    res.json(logs);
  } catch {
    res.status(500).json({ error: "Failed to fetch email logs" });
  }
});

export default router;
