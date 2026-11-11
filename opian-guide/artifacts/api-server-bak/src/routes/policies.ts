import { Router, type IRouter } from "express";
import { db, policiesTable } from "@workspace/db";
import { ListPoliciesResponse } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/policies", async (req, res): Promise<void> => {
  const session = req.session as unknown as Record<string, unknown>;
  const userId = Number(session["userId"]);
  const userRole = String(session["userRole"] ?? "");
  const userName = String(session["userName"] ?? "").trim();

  if (!Number.isInteger(userId) || userId <= 0 || !["client", "advisor"].includes(userRole)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (userRole === "client" && !userName) {
    res.status(403).json({ error: "Client profile is incomplete" });
    return;
  }

  const rows = userRole === "client"
    ? await db.select().from(policiesTable).where(eq(policiesTable.clientName, userName))
    : await db.select().from(policiesTable);
  const mapped = rows.map((r) => ({
    ...r,
    coverAmount: Number(r.coverAmount),
    premium: Number(r.premium),
    renewalDate: r.renewalDate ?? null,
  }));
  res.json(ListPoliciesResponse.parse(mapped));
});

export default router;
