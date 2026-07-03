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

router.get("/fna", async (req, res): Promise<void> => {
  const rows = await db.select().from(fnaTable).orderBy(desc(fnaTable.createdAt));
  const mapped = rows.map((r) => ({
    ...r,
    monthlyIncome: Number(r.monthlyIncome),
    monthlyExpenses: Number(r.monthlyExpenses),
    totalAssets: Number(r.totalAssets),
    totalLiabilities: Number(r.totalLiabilities),
    notes: r.notes ?? null,
    advisorId: r.advisorId ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
  res.json(ListFnaSubmissionsResponse.parse(mapped));
});

router.post("/fna", async (req, res): Promise<void> => {
  const parsed = CreateFnaSubmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(fnaTable)
    .values({
      ...parsed.data,
      monthlyIncome: String(parsed.data.monthlyIncome),
      monthlyExpenses: String(parsed.data.monthlyExpenses),
      totalAssets: String(parsed.data.totalAssets),
      totalLiabilities: String(parsed.data.totalLiabilities),
      status: "pending",
    })
    .returning();

  res.status(201).json(
    CreateFnaSubmissionResponse.parse({
      ...row,
      monthlyIncome: Number(row.monthlyIncome),
      monthlyExpenses: Number(row.monthlyExpenses),
      totalAssets: Number(row.totalAssets),
      totalLiabilities: Number(row.totalLiabilities),
      notes: row.notes ?? null,
      advisorId: row.advisorId ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })
  );
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

  res.json(
    GetFnaSubmissionResponse.parse({
      ...row,
      monthlyIncome: Number(row.monthlyIncome),
      monthlyExpenses: Number(row.monthlyExpenses),
      totalAssets: Number(row.totalAssets),
      totalLiabilities: Number(row.totalLiabilities),
      notes: row.notes ?? null,
      advisorId: row.advisorId ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })
  );
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

  const [row] = await db
    .update(fnaTable)
    .set({ status: body.data.status, notes: body.data.notes, updatedAt: new Date() })
    .where(eq(fnaTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "FNA not found" });
    return;
  }

  res.json(
    UpdateFnaStatusResponse.parse({
      ...row,
      monthlyIncome: Number(row.monthlyIncome),
      monthlyExpenses: Number(row.monthlyExpenses),
      totalAssets: Number(row.totalAssets),
      totalLiabilities: Number(row.totalLiabilities),
      notes: row.notes ?? null,
      advisorId: row.advisorId ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })
  );
});

export default router;
