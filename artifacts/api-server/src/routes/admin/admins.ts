import { Router, type IRouter } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  AdminListAdminsResponse,
  AdminCreateAdminBody,
  AdminCreateAdminResponse,
  AdminUpdateAdminParams,
  AdminUpdateAdminBody,
  AdminUpdateAdminResponse,
  AdminDeleteAdminParams,
} from "@workspace/api-zod";
import { requireSuperAdmin } from "./middleware";

const router: IRouter = Router();

// ─── GET /api/admin/admins ────────────────────────────────────────────────────

router.get("/admin/admins", requireSuperAdmin, async (req, res): Promise<void> => {
  try {
    const admins = await db
      .select({ id: adminsTable.id, name: adminsTable.name, email: adminsTable.email, role: adminsTable.role, createdAt: adminsTable.createdAt })
      .from(adminsTable);
    res.json(AdminListAdminsResponse.parse(admins));
  } catch (err) {
    req.log.error({ err }, "Admin list admins error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/admin/admins ───────────────────────────────────────────────────

router.post("/admin/admins", requireSuperAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreateAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { password, ...rest } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const [existing] = await db.select().from(adminsTable).where(eq(adminsTable.email, rest.email));
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const result = await db.insert(adminsTable).values({
      ...rest,
      passwordHash,
      role: rest.role as "super_admin" | "admin",
    });
    const insertId = (result[0] as { insertId: number }).insertId;
    const [admin] = await db
      .select({ id: adminsTable.id, name: adminsTable.name, email: adminsTable.email, role: adminsTable.role, createdAt: adminsTable.createdAt })
      .from(adminsTable)
      .where(eq(adminsTable.id, insertId));

    if (!admin) {
      res.status(500).json({ error: "Failed to create admin" });
      return;
    }
    res.status(201).json(AdminCreateAdminResponse.parse(admin));
  } catch (err) {
    req.log.error({ err }, "Admin create admin error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /api/admin/admins/:id ─────────────────────────────────────────────

router.patch("/admin/admins/:id", requireSuperAdmin, async (req, res): Promise<void> => {
  const params = AdminUpdateAdminParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = AdminUpdateAdminBody.safeParse(req.body);
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
    await db.update(adminsTable).set(updates).where(eq(adminsTable.id, params.data.id));
    const [admin] = await db
      .select({ id: adminsTable.id, name: adminsTable.name, email: adminsTable.email, role: adminsTable.role, createdAt: adminsTable.createdAt })
      .from(adminsTable)
      .where(eq(adminsTable.id, params.data.id));
    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }
    res.json(AdminUpdateAdminResponse.parse(admin));
  } catch (err) {
    req.log.error({ err }, "Admin update admin error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/admin/admins/:id ────────────────────────────────────────────

router.delete("/admin/admins/:id", requireSuperAdmin, async (req, res): Promise<void> => {
  const params = AdminDeleteAdminParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    await db.delete(adminsTable).where(eq(adminsTable.id, params.data.id));
    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Admin delete admin error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
