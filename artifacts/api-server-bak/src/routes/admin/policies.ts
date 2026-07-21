import { Router, type IRouter } from "express";
import { db, policiesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  AdminListPoliciesResponse,
  AdminCreatePolicyBody,
  AdminCreatePolicyResponse,
  AdminUpdatePolicyParams,
  AdminUpdatePolicyBody,
  AdminUpdatePolicyResponse,
  AdminDeletePolicyParams,
} from "@workspace/api-zod";
import { requireAdmin } from "./middleware";

const router: IRouter = Router();

// MySQL decimal columns come back as strings — convert to numbers for Zod
function mapPolicy(r: typeof policiesTable.$inferSelect) {
  return {
    ...r,
    coverAmount: Number(r.coverAmount),
    premium: Number(r.premium),
    renewalDate: r.renewalDate ?? null,
  };
}

// ─── GET /api/admin/policies ──────────────────────────────────────────────────

router.get("/admin/policies", requireAdmin, async (req, res): Promise<void> => {
  try {
    const policies = await db.select().from(policiesTable).orderBy(sql`${policiesTable.createdAt} desc`);
    res.json(AdminListPoliciesResponse.parse(policies.map(mapPolicy)));
  } catch (err) {
    req.log.error({ err }, "Admin list policies error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/admin/policies ─────────────────────────────────────────────────

router.post("/admin/policies", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreatePolicyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const insertData = {
      ...parsed.data,
      coverAmount: String(parsed.data.coverAmount),
      premium: String(parsed.data.premium),
    };
    const result = await db.insert(policiesTable).values(insertData);
    const insertId = (result[0] as { insertId: number }).insertId;
    const [policy] = await db.select().from(policiesTable).where(eq(policiesTable.id, insertId));
    if (!policy) {
      res.status(500).json({ error: "Failed to create policy" });
      return;
    }
    res.status(201).json(AdminCreatePolicyResponse.parse(mapPolicy(policy)));
  } catch (err) {
    req.log.error({ err }, "Admin create policy error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /api/admin/policies/:id ────────────────────────────────────────────

router.patch("/admin/policies/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminUpdatePolicyParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = AdminUpdatePolicyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.coverAmount !== undefined) updateData["coverAmount"] = String(parsed.data.coverAmount);
    if (parsed.data.premium !== undefined) updateData["premium"] = String(parsed.data.premium);
    await db.update(policiesTable).set(updateData).where(eq(policiesTable.id, params.data.id));
    const [policy] = await db.select().from(policiesTable).where(eq(policiesTable.id, params.data.id));
    if (!policy) {
      res.status(404).json({ error: "Policy not found" });
      return;
    }
    res.json(AdminUpdatePolicyResponse.parse(mapPolicy(policy)));
  } catch (err) {
    req.log.error({ err }, "Admin update policy error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/admin/policies/:id ───────────────────────────────────────────

router.delete("/admin/policies/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeletePolicyParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    await db.delete(policiesTable).where(eq(policiesTable.id, params.data.id));
    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Admin delete policy error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
