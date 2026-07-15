import { Router, type IRouter } from "express";
import { db, fnaTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  AdminListFnaResponse,
  AdminGetFnaParams,
  AdminGetFnaResponse,
  AdminUpdateFnaParams,
  AdminUpdateFnaBody,
  AdminUpdateFnaResponse,
  AdminDeleteFnaParams,
} from "@workspace/api-zod";
import { requireAdmin } from "./middleware";

const router: IRouter = Router();

// MySQL decimal columns come back as strings — convert to numbers
function mapFnaRow(r: typeof fnaTable.$inferSelect) {
  return {
    ...r,
    grossMonthlyIncome: Number(r.grossMonthlyIncome),
    netMonthlyIncome: Number(r.netMonthlyIncome),
    spouseIncome: Number(r.spouseIncome),
    monthlyExpenses: Number(r.monthlyExpenses),
    homeLoans: Number(r.homeLoans),
    vehicleFinance: Number(r.vehicleFinance),
    personalLoans: Number(r.personalLoans),
    creditCards: Number(r.creditCards),
    otherDebts: Number(r.otherDebts),
    savings: Number(r.savings),
    investments: Number(r.investments),
    retirementFunds: Number(r.retirementFunds),
    propertyValue: Number(r.propertyValue),
    existingLifeCover: Number(r.existingLifeCover),
    existingDisabilityCover: Number(r.existingDisabilityCover),
    existingDreadDiseaseCover: Number(r.existingDreadDiseaseCover),
    monthlyRetirementIncome: Number(r.monthlyRetirementIncome),
    currentRetirementSavings: Number(r.currentRetirementSavings),
    monthlyInvestmentBudget: Number(r.monthlyInvestmentBudget),
    notes: r.notes ?? null,
    advisorId: r.advisorId ?? null,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
  };
}

// ─── GET /api/admin/fna ───────────────────────────────────────────────────────

router.get("/admin/fna", requireAdmin, async (req, res): Promise<void> => {
  try {
    const submissions = await db.select().from(fnaTable).orderBy(sql`${fnaTable.createdAt} desc`);
    res.json(AdminListFnaResponse.parse(submissions.map(mapFnaRow)));
  } catch (err) {
    req.log.error({ err }, "Admin list FNA error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/fna/:id ───────────────────────────────────────────────────

router.get("/admin/fna/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminGetFnaParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [submission] = await db.select().from(fnaTable).where(eq(fnaTable.id, params.data.id));
    if (!submission) {
      res.status(404).json({ error: "FNA submission not found" });
      return;
    }
    res.json(AdminGetFnaResponse.parse(mapFnaRow(submission)));
  } catch (err) {
    req.log.error({ err }, "Admin get FNA error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /api/admin/fna/:id ─────────────────────────────────────────────────

router.patch("/admin/fna/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminUpdateFnaParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = AdminUpdateFnaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    await db.update(fnaTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(fnaTable.id, params.data.id));
    const [submission] = await db.select().from(fnaTable).where(eq(fnaTable.id, params.data.id));
    if (!submission) {
      res.status(404).json({ error: "FNA submission not found" });
      return;
    }
    res.json(AdminUpdateFnaResponse.parse(mapFnaRow(submission)));
  } catch (err) {
    req.log.error({ err }, "Admin update FNA error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/admin/fna/:id ────────────────────────────────────────────────

router.delete("/admin/fna/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeleteFnaParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    await db.delete(fnaTable).where(eq(fnaTable.id, params.data.id));
    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Admin delete FNA error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
