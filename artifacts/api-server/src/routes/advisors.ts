import { Router, type IRouter } from "express";
import { db, advisorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListAdvisorsResponse,
  GetAdvisorParams,
  GetAdvisorResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/advisors", async (req, res): Promise<void> => {
  const advisors = await db.select().from(advisorsTable);
  const mapped = advisors.map((a) => ({
    ...a,
    specializations: a.specializations ?? [],
  }));
  res.json(ListAdvisorsResponse.parse(mapped));
});

router.get("/advisors/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetAdvisorParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [advisor] = await db
    .select()
    .from(advisorsTable)
    .where(eq(advisorsTable.id, params.data.id));

  if (!advisor) {
    res.status(404).json({ error: "Advisor not found" });
    return;
  }

  res.json(GetAdvisorResponse.parse({ ...advisor, specializations: advisor.specializations ?? [] }));
});

export default router;
