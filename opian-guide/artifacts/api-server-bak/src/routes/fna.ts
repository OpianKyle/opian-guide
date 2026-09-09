import { Router, type IRouter } from "express";
import { db, fnaTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListFnaSubmissionsResponse,
  CreateFnaSubmissionBody,
  CreateFnaSubmissionResponse,
  GetFnaSubmissionParams,
  GetFnaSubmissionResponse,
  UpdateFnaStatusParams,
  UpdateFnaStatusBody,
  UpdateFnaStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapRow(r: typeof fnaTable.$inferSelect) {
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
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

router.get("/fna", async (req, res): Promise<void> => {
  const rows = await db.select().from(fnaTable).orderBy(desc(fnaTable.createdAt));
  res.json(ListFnaSubmissionsResponse.parse(rows.map(mapRow)));
});

router.post("/fna", async (req, res): Promise<void> => {
  const parsed = CreateFnaSubmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const d = parsed.data;

  // MySQL doesn't support .returning() — insert then re-fetch by ID
  const inserted = await db
    .insert(fnaTable)
    .values({
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone,
      dob: d.dob,
      gender: d.gender,
      smoker: d.smoker,
      maritalStatus: d.maritalStatus,
      dependants: d.dependants,
      currentAge: d.currentAge,
      grossMonthlyIncome: String(d.grossMonthlyIncome),
      netMonthlyIncome: String(d.netMonthlyIncome),
      spouseIncome: String(d.spouseIncome),
      employmentType: d.employmentType,
      occupation: d.occupation,
      hasGroupBenefits: d.hasGroupBenefits,
      monthlyExpenses: String(d.monthlyExpenses),
      homeLoans: String(d.homeLoans),
      vehicleFinance: String(d.vehicleFinance),
      personalLoans: String(d.personalLoans),
      creditCards: String(d.creditCards),
      otherDebts: String(d.otherDebts),
      savings: String(d.savings),
      investments: String(d.investments),
      retirementFunds: String(d.retirementFunds),
      propertyValue: String(d.propertyValue),
      existingLifeCover: String(d.existingLifeCover),
      existingDisabilityCover: String(d.existingDisabilityCover),
      existingDreadDiseaseCover: String(d.existingDreadDiseaseCover),
      targetRetirementAge: d.targetRetirementAge,
      monthlyRetirementIncome: String(d.monthlyRetirementIncome),
      currentRetirementSavings: String(d.currentRetirementSavings),
      monthlyInvestmentBudget: String(d.monthlyInvestmentBudget),
      investmentGoal: d.investmentGoal,
      riskProfile: d.riskProfile,
      investmentHorizon: d.investmentHorizon,
      priorities: d.priorities,
      notes: d.notes,
      status: "pending",
    })
    .$returningId();

  const [row] = await db
    .select()
    .from(fnaTable)
    .where(eq(fnaTable.id, inserted[0].id));

  res.status(201).json(CreateFnaSubmissionResponse.parse(mapRow(row)));
});

router.get("/fna/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetFnaSubmissionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(fnaTable)
    .where(eq(fnaTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "FNA not found" });
    return;
  }

  res.json(GetFnaSubmissionResponse.parse(mapRow(row)));
});

router.patch("/fna/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateFnaStatusParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateFnaStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  // MySQL doesn't support .returning() — update then re-fetch by ID
  await db
    .update(fnaTable)
    .set({ status: body.data.status, notes: body.data.notes, updatedAt: new Date() })
    .where(eq(fnaTable.id, params.data.id));

  const [row] = await db
    .select()
    .from(fnaTable)
    .where(eq(fnaTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "FNA not found" });
    return;
  }

  res.json(UpdateFnaStatusResponse.parse(mapRow(row)));
});

export default router;
