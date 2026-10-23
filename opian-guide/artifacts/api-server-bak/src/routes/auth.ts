import { Router, type IRouter } from "express";
import { db, advisorsTable, adminsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod/v4";
import { UnifiedLoginBody, UnifiedLoginResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const LoginSchema = z.object({
  role: z.enum(["advisor", "client"]),
  email: z.string().email(),
  password: z.string().min(1),
});

// Advisor accounts are provisioned directly (there is a single advisor);
// self-service signup is client-only.
const SignupSchema = z.object({
  role: z.literal("client"),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ─── GET /api/auth/session ────────────────────────────────────────────────────

router.get("/auth/session", (req, res): void => {
  const session = req.session as unknown as Record<string, unknown>;
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

// ─── POST /api/auth/unified-login ─────────────────────────────────────────────

router.post("/auth/unified-login", async (req, res): Promise<void> => {
  const parsed = UnifiedLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const [admins, advisors, users] = await Promise.all([
      db.select().from(adminsTable).where(eq(adminsTable.email, email)),
      db.select().from(advisorsTable).where(eq(advisorsTable.email, email)),
      db.select().from(usersTable).where(eq(usersTable.email, email)),
    ]);

    const candidates = [
      ...admins.map((admin) => ({
        kind: "admin" as const,
        id: admin.id,
        name: admin.name,
        email: admin.email,
        passwordHash: admin.passwordHash,
        role: admin.role,
      })),
      ...advisors.flatMap((advisor) =>
        advisor.passwordHash
          ? [{
              kind: "advisor" as const,
              id: advisor.id,
              name: advisor.name,
              email: advisor.email,
              passwordHash: advisor.passwordHash,
            }]
          : [],
      ),
      ...users.map((user) => ({
        kind: "client" as const,
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
      })),
    ];

    const matchingAccounts = (
      await Promise.all(
        candidates.map(async (candidate) => ({
          candidate,
          valid: await bcrypt.compare(password, candidate.passwordHash),
        })),
      )
    )
      .filter((result) => result.valid)
      .map((result) => result.candidate);

    // A shared email with matching passwords is ambiguous; never guess which
    // privilege set to grant.
    if (matchingAccounts.length !== 1) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const account = matchingAccounts[0];
    const session = req.session as unknown as Record<string, unknown>;
    delete session["userId"];
    delete session["userName"];
    delete session["userEmail"];
    delete session["userRole"];
    delete session["adminId"];
    delete session["adminName"];
    delete session["adminEmail"];
    delete session["adminRole"];

    if (account.kind === "admin") {
      session["adminId"] = account.id;
      session["adminName"] = account.name;
      session["adminEmail"] = account.email;
      session["adminRole"] = account.role;

      res.json(UnifiedLoginResponse.parse({
        kind: "admin",
        admin: {
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role,
        },
      }));
      return;
    }

    session["userId"] = account.id;
    session["userName"] = account.name;
    session["userEmail"] = account.email;
    session["userRole"] = account.kind;

    res.json(UnifiedLoginResponse.parse({
      kind: "user",
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.kind,
      },
    }));
  } catch (err) {
    req.log.error({ err }, "Unified login error");
    res.status(500).json({ error: "Internal server error" });
  }
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

      const session = req.session as unknown as Record<string, unknown>;
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

      const session = req.session as unknown as Record<string, unknown>;
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

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    // Client signup — check for duplicate email
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    // MySQL doesn't support .returning() — insert then re-fetch by email
    await db.insert(usersTable).values({ name, email, passwordHash });

    const [newUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!newUser) {
      res.status(500).json({ error: "Failed to create account" });
      return;
    }

    const session = req.session as unknown as Record<string, unknown>;
    session["userId"] = newUser.id;
    session["userName"] = newUser.name;
    session["userEmail"] = newUser.email;
    session["userRole"] = "client";

    res.status(201).json({
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: "client" },
    });
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
