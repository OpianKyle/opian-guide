import { Router } from "express";
import { db } from "@workspace/db";
import { campaignTemplatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "./middleware";
import { campaignTemplates } from "../../lib/campaign";

const router = Router();

const ALL_DAYS = Array.from({ length: 31 }, (_, i) => i); // 0–30

// GET /admin/campaigns — list all 31 days with subject + customisation status
router.get("/admin/campaigns", requireAdmin, async (_req, res) => {
  try {
    const overrides = await db.select().from(campaignTemplatesTable);
    const overrideMap = new Map(overrides.map((o) => [o.day, o]));

    const list = ALL_DAYS.map((day) => {
      const override = overrideMap.get(day);
      const hardcoded = campaignTemplates[day];
      return {
        day,
        subject: override?.subject ?? hardcoded?.subject ?? `Day ${day} — Campaign Email`,
        isCustomized: !!override,
        updatedAt: override?.updatedAt ?? null,
      };
    });

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to fetch campaigns" });
  }
});

// GET /admin/campaigns/:day/preview — returns full rendered HTML for iframe preview
router.get("/admin/campaigns/:day/preview", requireAdmin, async (req, res) => {
  try {
    const day = Number(req.params.day);
    if (isNaN(day) || day < 0 || day > 30) return res.status(400).json({ error: "day must be 0–30" });

    const firstName = (req.query.name as string) || "John";

    const [override] = await db
      .select()
      .from(campaignTemplatesTable)
      .where(eq(campaignTemplatesTable.day, day));

    let html: string;
    if (override) {
      html = override.bodyHtml.replace(/\{\{firstName\}\}/g, firstName);
    } else {
      const hardcoded = campaignTemplates[day];
      if (!hardcoded) return res.status(404).json({ error: "Template not found" });
      html = hardcoded.html(firstName);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to render preview" });
  }
});

// GET /admin/campaigns/:day — get a single template (subject + raw bodyHtml for editing)
router.get("/admin/campaigns/:day", requireAdmin, async (req, res) => {
  try {
    const day = Number(req.params.day);
    if (isNaN(day) || day < 0 || day > 30) return res.status(400).json({ error: "day must be 0–30" });

    const [override] = await db
      .select()
      .from(campaignTemplatesTable)
      .where(eq(campaignTemplatesTable.day, day));

    if (override) {
      return res.json({ day, subject: override.subject, bodyHtml: override.bodyHtml, isCustomized: true });
    }

    const hardcoded = campaignTemplates[day];
    if (!hardcoded) return res.status(404).json({ error: "Template not found" });

    // Render with {{firstName}} placeholder so the editor shows it
    const bodyHtml = hardcoded.html("{{firstName}}");
    res.json({ day, subject: hardcoded.subject, bodyHtml, isCustomized: false });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to fetch template" });
  }
});

// PUT /admin/campaigns/:day — save / update a template
router.put("/admin/campaigns/:day", requireAdmin, async (req, res) => {
  try {
    const day = Number(req.params.day);
    if (isNaN(day) || day < 0 || day > 30) return res.status(400).json({ error: "day must be 0–30" });

    const { subject, bodyHtml } = req.body;
    if (!subject || !bodyHtml) return res.status(400).json({ error: "subject and bodyHtml are required" });

    // Upsert: insert or update if day already exists
    const [existing] = await db
      .select()
      .from(campaignTemplatesTable)
      .where(eq(campaignTemplatesTable.day, day));

    if (existing) {
      await db
        .update(campaignTemplatesTable)
        .set({ subject, bodyHtml })
        .where(eq(campaignTemplatesTable.day, day));
    } else {
      await db.insert(campaignTemplatesTable).values({ day, subject, bodyHtml });
    }

    res.json({ day, subject, isCustomized: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to save template" });
  }
});

// DELETE /admin/campaigns/:day — reset to default (remove DB override)
router.delete("/admin/campaigns/:day", requireAdmin, async (req, res) => {
  try {
    const day = Number(req.params.day);
    if (isNaN(day) || day < 0 || day > 30) return res.status(400).json({ error: "day must be 0–30" });

    await db.delete(campaignTemplatesTable).where(eq(campaignTemplatesTable.day, day));
    res.json({ day, isCustomized: false });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to reset template" });
  }
});

export default router;
