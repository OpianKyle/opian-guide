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
  const mapped = advisors.map((a) => {
    let specs: string[] = [];
    if (Array.isArray(a.specializations)) {
      specs = a.specializations;
    } else if (typeof a.specializations === "string" && a.specializations) {
      try { specs = JSON.parse(a.specializations as unknown as string); } catch { specs = []; }
    }
    return { ...a, specializations: specs };
  });
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

  let specs: string[] = [];
  if (Array.isArray(advisor.specializations)) {
    specs = advisor.specializations;
  } else if (typeof advisor.specializations === "string" && advisor.specializations) {
    try { specs = JSON.parse(advisor.specializations as unknown as string); } catch { specs = []; }
  }
  res.json(GetAdvisorResponse.parse({ ...advisor, specializations: specs }));
});

export default router;
