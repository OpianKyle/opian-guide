import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, leadsTable, leadEmailLogsTable } from "@workspace/db";
import { eq, desc, and, like, or } from "drizzle-orm";

const router: IRouter = Router();

function requireAdvisor(req: Request, res: Response, next: NextFunction): void {
  const session = req.session as unknown as Record<string, unknown>;
  if (!session["userId"] || session["userRole"] !== "advisor") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

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

// PATCH /leads/:id — advisor can update status and notes on their own lead
router.patch("/leads/:id", requireAdvisor, async (req, res): Promise<void> => {
  const session = req.session as unknown as Record<string, unknown>;
  const advisorId = session["userId"] as number;
  const id = parseInt(req.params.id, 10);

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
  const id = parseInt(req.params.id, 10);

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
