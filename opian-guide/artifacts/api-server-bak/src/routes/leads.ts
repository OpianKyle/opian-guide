import { Router, type IRouter } from "express";
import { db, leadsTable, leadEmailLogsTable } from "@workspace/db";
import { eq, desc, and, like, or } from "drizzle-orm";
import { requireAdvisor } from "./middleware";
import {
  createLead as createLeadRecord,
  DuplicateLeadError,
  parseLeadCreationRequest,
} from "../lib/lead-creation";

const router: IRouter = Router();

// GET /leads — returns leads assigned to the authenticated advisor
router.get("/leads", requireAdvisor, async (req, res): Promise<void> => {
  const session = req.session as unknown as Record<string, unknown>;
  const advisorId = session["userId"] as number;
  const { status, search } = req.query as { status?: string; search?: string };

  try {
    const conditions: ReturnType<typeof eq>[] = [eq(leadsTable.advisorId, advisorId)];

    if (status && status !== "all") {
      conditions.push(eq(leadsTable.status, status));
    }

    let rows = await db
      .select()
      .from(leadsTable)
      .where(and(...conditions))
      .orderBy(desc(leadsTable.createdAt));

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (l) =>
          l.email.toLowerCase().includes(q) ||
          (l.firstName ?? "").toLowerCase().includes(q) ||
          (l.lastName ?? "").toLowerCase().includes(q) ||
          (l.company ?? "").toLowerCase().includes(q),
      );
    }

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch leads");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /leads — advisors can create leads assigned to their own account
router.post("/leads", requireAdvisor, async (req, res): Promise<void> => {
  const session = req.session as unknown as Record<string, unknown>;
  const advisorId = Number(session["userId"]);
  const parsed = parseLeadCreationRequest(req.body, advisorId);
  if ("error" in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  try {
    const result = await createLeadRecord(parsed.input, parsed.sendWelcomeEmail);
    if (result.emailError) {
      req.log.warn({ err: result.emailError, leadId: result.lead.id }, "Lead created but welcome email failed");
    }
    if (result.trackingError) {
      req.log.error({ err: result.trackingError, leadId: result.lead.id }, "Failed to save lead email tracking");
    }
    res.status(201).json({
      lead: result.lead,
      emailSent: result.emailSent,
      emailMessage: result.emailMessage,
    });
  } catch (err) {
    if (err instanceof DuplicateLeadError || (err as { code?: string })?.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "A lead with this email already exists." });
      return;
    }
    req.log.error({ err }, "Failed to create advisor lead");
    res.status(500).json({ error: "Failed to create lead." });
  }
});

// PATCH /leads/:id — advisor can update status and notes on their own lead
router.patch("/leads/:id", requireAdvisor, async (req, res): Promise<void> => {
  const session = req.session as unknown as Record<string, unknown>;
  const advisorId = session["userId"] as number;
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid lead id" });
    return;
  }

  const [existing] = await db
    .select()
    .from(leadsTable)
    .where(and(eq(leadsTable.id, id), eq(leadsTable.advisorId, advisorId)));

  if (!existing) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  const { status, notes } = req.body as { status?: string; notes?: string };
  const update: Partial<typeof leadsTable.$inferInsert> = {};
  if (status) update.status = status;
  if (notes !== undefined) update.notes = notes;

  await db.update(leadsTable).set(update).where(eq(leadsTable.id, id));

  const [updated] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
  res.json(updated);
});

// GET /leads/:id/emails — email logs for a specific lead (advisor must own it)
router.get("/leads/:id/emails", requireAdvisor, async (req, res): Promise<void> => {
  const session = req.session as unknown as Record<string, unknown>;
  const advisorId = session["userId"] as number;
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid lead id" });
    return;
  }

  const [lead] = await db
    .select()
    .from(leadsTable)
    .where(and(eq(leadsTable.id, id), eq(leadsTable.advisorId, advisorId)));

  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  const logs = await db
    .select()
    .from(leadEmailLogsTable)
    .where(eq(leadEmailLogsTable.leadId, id))
    .orderBy(desc(leadEmailLogsTable.sentAt));

  res.json(logs);
});

export default router;
