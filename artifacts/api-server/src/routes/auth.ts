import { Router, type IRouter } from "express";
import { db, advisorsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod/v4";

const router: IRouter = Router();

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const LoginSchema = z.object({
  role: z.enum(["advisor", "client"]),
  email: z.string().email(),
  password: z.string().min(1),
});

const SignupSchema = z.object({
  role: z.enum(["advisor", "client"]),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ─── GET /api/auth/session ────────────────────────────────────────────────────

router.get("/auth/session", (req, res): void => {
  const session = req.session as Record<string, unknown>;
  if (!session["userId"]) {
    res.json({ user: null });
    return;
  }
  res.json({
    user: {
      id: session["userId"],
      name: session["userName"],
      email: session["userEmail"],
      role: session["userRole"],
    },
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }

  const { role, email, password } = parsed.data;

  try {
    if (role === "advisor") {
      const [advisor] = await db
        .select()
        .from(advisorsTable)
        .where(eq(advisorsTable.email, email));

      if (!advisor || !advisor.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const valid = await bcrypt.compare(password, advisor.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const session = req.session as Record<string, unknown>;
      session["userId"] = advisor.id;
      session["userName"] = advisor.name;
      session["userEmail"] = advisor.email;
      session["userRole"] = "advisor";

      res.json({
        user: { id: advisor.id, name: advisor.name, email: advisor.email, role: "advisor" },
      });
    } else {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const session = req.session as Record<string, unknown>;
      session["userId"] = user.id;
      session["userName"] = user.name;
      session["userEmail"] = user.email;
      session["userRole"] = "client";

      res.json({
        user: { id: user.id, name: user.name, email: user.email, role: "client" },
      });
    }
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/signup ────────────────────────────────────────────────────

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }

  const { role, name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    if (role === "advisor") {
      // Check if advisor with this email already has an account
      const [existing] = await db
        .select()
        .from(advisorsTable)
        .where(eq(advisorsTable.email, email));

      if (!existing) {
        res.status(404).json({ error: "No advisor account found for this email. Contact your administrator." });
        return;
      }

      if (existing.passwordHash) {
        res.status(409).json({ error: "An account with this email already exists" });
        return;
      }

      const [updated] = await db
        .update(advisorsTable)
        .set({ passwordHash })
        .where(eq(advisorsTable.email, email))
        .returning();

      if (!updated) {
        res.status(500).json({ error: "Failed to create account" });
        return;
      }

      const session = req.session as Record<string, unknown>;
      session["userId"] = updated.id;
      session["userName"] = updated.name;
      session["userEmail"] = updated.email;
      session["userRole"] = "advisor";

      res.status(201).json({
        user: { id: updated.id, name: updated.name, email: updated.email, role: "advisor" },
      });
    } else {
      // Client signup — check for duplicate email
      const [existing] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

      if (existing) {
        res.status(409).json({ error: "An account with this email already exists" });
        return;
      }

      const [newUser] = await db
        .insert(usersTable)
        .values({ name, email, passwordHash })
        .returning();

      if (!newUser) {
        res.status(500).json({ error: "Failed to create account" });
        return;
      }

      const session = req.session as Record<string, unknown>;
      session["userId"] = newUser.id;
      session["userName"] = newUser.name;
      session["userEmail"] = newUser.email;
      session["userRole"] = "client";

      res.status(201).json({
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: "client" },
      });
    }
  } catch (err) {
    req.log.error({ err }, "Signup error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

router.post("/auth/logout", (req, res): void => {
  req.session.destroy((err) => {
    if (err) {
      req.log.error({ err }, "Logout error");
      res.status(500).json({ error: "Failed to log out" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

export default router;
