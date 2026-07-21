import { Router, type IRouter } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AdminLoginBody, AdminGetSessionResponse } from "@workspace/api-zod";
import { requireAdmin } from "./middleware";

const router: IRouter = Router();

type SessionData = Record<string, unknown>;

// ─── GET /api/admin/auth/session ──────────────────────────────────────────────

router.get("/admin/auth/session", (req, res): void => {
  const session = req.session as unknown as SessionData;
  if (!session["adminId"]) {
    res.json({ admin: null });
    return;
  }
  res.json({
    admin: {
      id: session["adminId"],
      name: session["adminName"],
      email: session["adminEmail"],
      role: session["adminRole"],
    },
  });
});

// ─── POST /api/admin/auth/login ───────────────────────────────────────────────

router.post("/admin/auth/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, email));

    if (!admin) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const session = req.session as unknown as SessionData;
    session["adminId"] = admin.id;
    session["adminName"] = admin.name;
    session["adminEmail"] = admin.email;
    session["adminRole"] = admin.role;

    res.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Admin login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/admin/auth/logout ──────────────────────────────────────────────

router.post("/admin/auth/logout", requireAdmin, (req, res): void => {
  req.session.destroy((err) => {
    if (err) {
      req.log.error({ err }, "Admin logout error");
      res.status(500).json({ error: "Failed to log out" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

export default router;
