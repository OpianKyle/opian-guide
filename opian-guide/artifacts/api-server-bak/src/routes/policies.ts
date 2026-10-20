import { Router, type IRouter } from "express";
import { db, policiesTable } from "@workspace/db";
import { ListPoliciesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/policies", async (req, res): Promise<void> => {
  const rows = await db.select().from(policiesTable);
  const mapped = rows.map((r) => ({
    ...r,
    coverAmount: Number(r.coverAmount),
    premium: Number(r.premium),
    renewalDate: r.renewalDate ?? null,
  }));
  res.json(ListPoliciesResponse.parse(mapped));
});

export default router;
