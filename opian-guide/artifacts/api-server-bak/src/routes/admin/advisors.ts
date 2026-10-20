import { Router, type IRouter } from "express";
import { db, advisorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  AdminListAdvisorsResponse,
  AdminGetAdvisorParams,
  AdminGetAdvisorResponse,
  AdminCreateAdvisorBody,
  AdminCreateAdvisorResponse,
  AdminUpdateAdvisorParams,
  AdminUpdateAdvisorBody,
  AdminUpdateAdvisorResponse,
  AdminDeleteAdvisorParams,
} from "@workspace/api-zod";
import { requireAdmin } from "./middleware";

const router: IRouter = Router();

// MySQL JSON columns come back as a raw string — parse for Zod
function parseSpecs(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string" && raw) {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

function mapAdvisor(a: typeof advisorsTable.$inferSelect) {
  return {
    ...a,
    specializations: parseSpecs(a.specializations),
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
  };
}

// ─── GET /api/admin/advisors ──────────────────────────────────────────────────

router.get("/admin/advisors", requireAdmin, async (req, res): Promise<void> => {
  try {
    const advisors = await db.select().from(advisorsTable);
    res.json(AdminListAdvisorsResponse.parse(advisors.map(mapAdvisor)));
  } catch (err) {
    req.log.error({ err }, "Admin list advisors error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/admin/advisors ─────────────────────────────────────────────────

router.post("/admin/advisors", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreateAdvisorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { password, ...rest } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await db.insert(advisorsTable).values({ ...rest, passwordHash });
    const insertId = (result[0] as { insertId: number }).insertId;
    const [advisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, insertId));
    if (!advisor) {
      res.status(500).json({ error: "Failed to create advisor" });
      return;
    }
    res.status(201).json(AdminCreateAdvisorResponse.parse(mapAdvisor(advisor)));
  } catch (err) {
    req.log.error({ err }, "Admin create advisor error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/advisors/:id ─────────────────────────────────────────────

router.get("/admin/advisors/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminGetAdvisorParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [advisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, params.data.id));
    if (!advisor) {
      res.status(404).json({ error: "Advisor not found" });
      return;
    }
    res.json(AdminGetAdvisorResponse.parse(mapAdvisor(advisor)));
  } catch (err) {
    req.log.error({ err }, "Admin get advisor error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /api/admin/advisors/:id ───────────────────────────────────────────

router.patch("/admin/advisors/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminUpdateAdvisorParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = AdminUpdateAdvisorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { password, ...rest } = parsed.data;
  const updates: Record<string, unknown> = { ...rest };
  if (password) {
    updates["passwordHash"] = await bcrypt.hash(password, 12);
  }

  try {
    await db.update(advisorsTable).set(updates).where(eq(advisorsTable.id, params.data.id));
    const [advisor] = await db.select().from(advisorsTable).where(eq(advisorsTable.id, params.data.id));
    if (!advisor) {
      res.status(404).json({ error: "Advisor not found" });
      return;
    }
    res.json(AdminUpdateAdvisorResponse.parse(mapAdvisor(advisor)));
  } catch (err) {
    req.log.error({ err }, "Admin update advisor error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/admin/advisors/:id ──────────────────────────────────────────

router.delete("/admin/advisors/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeleteAdvisorParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    await db.delete(advisorsTable).where(eq(advisorsTable.id, params.data.id));
    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Admin delete advisor error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
