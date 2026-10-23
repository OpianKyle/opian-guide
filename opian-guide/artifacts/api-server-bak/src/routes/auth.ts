import { Router, type IRouter } from "express";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { db, advisorsTable, adminsTable, usersTable, pendingSignupsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod/v4";
import {
  ResendClientVerificationBody,
  ResendClientVerificationResponse,
  SignupClientBody,
  SignupClientResponse,
  UnifiedLoginBody,
  UnifiedLoginResponse,
  VerifyClientEmailBody,
  VerifyClientEmailResponse,
} from "@workspace/api-zod";
import { sendMail } from "../lib/mailer";

const router: IRouter = Router();

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const LoginSchema = z.object({
  role: z.enum(["advisor", "client"]),
  email: z.string().email(),
  password: z.string().min(1),
});

const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFICATION_ATTEMPTS = 5;
const MAX_VERIFICATION_RESENDS = 5;

function createVerificationCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hashVerificationCode(email: string, code: string): string {
  const secret = process.env["SESSION_SECRET"];
  if (!secret) throw new Error("SESSION_SECRET must be set.");
  return createHmac("sha256", secret)
    .update(`${email}\u0000${code}`)
    .digest("hex");
}

function isVerificationCodeValid(email: string, code: string, storedHash: string): boolean {
  const actual = Buffer.from(hashVerificationCode(email, code), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    };
    return entities[character]!;
  });
}

function verificationEmailHtml(name: string, code: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#172033">
    <div style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border-radius:12px">
      <h1 style="font-size:22px;margin:0 0 16px">Verify your OPIAN account</h1>
      <p style="font-size:15px;line-height:1.6">Hi ${escapeHtml(name)}, enter this code to finish creating your client account:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;padding:16px;background:#f5f7fb;border-radius:8px">${code}</p>
      <p style="font-size:14px;line-height:1.6;color:#596579">This code expires in 10 minutes. If you did not request an account, you can ignore this email.</p>
    </div>
  </body>
</html>`;
}

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
  const parsed = SignupClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  try {
    const [existingUser, existingAdvisor, existingAdmin] = await Promise.all([
      db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)),
      db.select({ id: advisorsTable.id }).from(advisorsTable).where(eq(advisorsTable.email, email)),
      db.select({ id: adminsTable.id }).from(adminsTable).where(eq(adminsTable.email, email)),
    ]);

    if (existingUser.length || existingAdvisor.length || existingAdmin.length) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const now = new Date();
    const [existingPending] = await db
      .select()
      .from(pendingSignupsTable)
      .where(eq(pendingSignupsTable.email, email));

    if (existingPending && existingPending.expiresAt.getTime() > now.getTime()) {
      res.status(409).json({ error: "A verification code was already sent. Check your email or request a new one." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const code = createVerificationCode();
    const expiresAt = new Date(now.getTime() + VERIFICATION_CODE_TTL_MS);
    const resendAvailableAt = new Date(now.getTime() + RESEND_COOLDOWN_MS);
    const pendingSignup = {
      name,
      email,
      passwordHash,
      verificationCodeHash: hashVerificationCode(email, code),
      attempts: 0,
      resendCount: 0,
      expiresAt,
      resendAvailableAt,
    };

    if (existingPending) {
      await db
        .update(pendingSignupsTable)
        .set(pendingSignup)
        .where(eq(pendingSignupsTable.email, email));
    } else {
      await db.insert(pendingSignupsTable).values(pendingSignup);
    }

    try {
      await sendMail({
        to: email,
        subject: "Verify your OPIAN account",
        html: verificationEmailHtml(name, code),
      });
    } catch (err) {
      req.log.error({ err }, "Signup verification email failed");
      await db.delete(pendingSignupsTable).where(eq(pendingSignupsTable.email, email));
      res.status(503).json({ error: "We could not send the verification email. Please try again." });
      return;
    }

    res.status(202).json(SignupClientResponse.parse({
      message: "Verification code sent. Enter the 6-digit code emailed to you.",
    }));
  } catch (err) {
    req.log.error({ err }, "Signup error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/verify-email", async (req, res): Promise<void> => {
  const parsed = VerifyClientEmailBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { code } = parsed.data;

  try {
    const [pendingSignup] = await db
      .select()
      .from(pendingSignupsTable)
      .where(eq(pendingSignupsTable.email, email));

    if (!pendingSignup) {
      res.status(400).json({ error: "The verification code is invalid or has expired." });
      return;
    }

    const now = new Date();
    if (pendingSignup.expiresAt.getTime() <= now.getTime()) {
      res.status(410).json({ error: "The verification code has expired. Request a new one." });
      return;
    }

    if (pendingSignup.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      res.status(429).json({ error: "Too many attempts. Request a new verification code." });
      return;
    }

    if (!isVerificationCodeValid(email, code, pendingSignup.verificationCodeHash)) {
      const attempts = pendingSignup.attempts + 1;
      await db
        .update(pendingSignupsTable)
        .set({ attempts })
        .where(eq(pendingSignupsTable.email, email));
      if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
        res.status(429).json({ error: "Too many attempts. Request a new verification code." });
        return;
      }
      res.status(400).json({ error: "The verification code is incorrect." });
      return;
    }

    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        name: pendingSignup.name,
        email: pendingSignup.email,
        passwordHash: pendingSignup.passwordHash,
      });
      await tx
        .delete(pendingSignupsTable)
        .where(eq(pendingSignupsTable.email, pendingSignup.email));
    });

    const [newUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!newUser) {
      res.status(500).json({ error: "Email verified, but the account could not be loaded." });
      return;
    }

    const session = req.session as unknown as Record<string, unknown>;
    delete session["adminId"];
    delete session["adminName"];
    delete session["adminEmail"];
    delete session["adminRole"];
    session["userId"] = newUser.id;
    session["userName"] = newUser.name;
    session["userEmail"] = newUser.email;
    session["userRole"] = "client";

    res.json(VerifyClientEmailResponse.parse({
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: "client" },
    }));
  } catch (err) {
    req.log.error({ err }, "Email verification error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/resend-verification", async (req, res): Promise<void> => {
  const parsed = ResendClientVerificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();

  try {
    const [pendingSignup] = await db
      .select()
      .from(pendingSignupsTable)
      .where(eq(pendingSignupsTable.email, email));

    const message = "If an unverified signup exists for this email, a new code will be sent.";
    if (!pendingSignup || pendingSignup.resendCount >= MAX_VERIFICATION_RESENDS) {
      res.json(ResendClientVerificationResponse.parse({ message }));
      return;
    }

    const now = new Date();
    if (pendingSignup.resendAvailableAt.getTime() > now.getTime()) {
      res.json(ResendClientVerificationResponse.parse({ message }));
      return;
    }

    const code = createVerificationCode();
    await db
      .update(pendingSignupsTable)
      .set({
        verificationCodeHash: hashVerificationCode(email, code),
        attempts: 0,
        resendCount: pendingSignup.resendCount + 1,
        expiresAt: new Date(now.getTime() + VERIFICATION_CODE_TTL_MS),
        resendAvailableAt: new Date(now.getTime() + RESEND_COOLDOWN_MS),
      })
      .where(eq(pendingSignupsTable.email, email));

    await sendMail({
      to: email,
      subject: "Your OPIAN verification code",
      html: verificationEmailHtml(pendingSignup.name, code),
    });
    res.json(ResendClientVerificationResponse.parse({ message }));
  } catch (err) {
    req.log.error({ err }, "Verification email resend failed");
    res.status(503).json({ error: "We could not send the verification email. Please try again later." });
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
