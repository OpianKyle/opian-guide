import { Router, type IRouter, type Request } from "express";
import { db, toolkitSubmissionsTable } from "@workspace/db";
import {
  CreateToolkitSubmissionBody,
  CreateToolkitSubmissionResponse,
  GetToolkitSubmissionParams,
  GetToolkitSubmissionResponse,
  ListToolkitSubmissionsResponse,
} from "@workspace/api-zod";
import { and, desc, eq } from "drizzle-orm";
import {
  validateToolkitAnswers,
  type ToolkitAnswers,
  type ToolkitKind,
} from "@workspace/toolkit-core";

const router: IRouter = Router();

type Session = Record<string, unknown>;

function sessionFor(req: Request): Session {
  return req.session as unknown as Session;
}

function isStaff(session: Session): boolean {
  const adminId = Number(session["adminId"]);
  const advisorId = Number(session["userId"]);
  return (Number.isInteger(adminId) && adminId > 0)
    || (Number.isInteger(advisorId) && advisorId > 0 && session["userRole"] === "advisor");
}

function mapRow(row: typeof toolkitSubmissionsTable.$inferSelect) {
  const rawAnswers: unknown = row.answers;
  const answers: unknown = typeof rawAnswers === "string" ? JSON.parse(rawAnswers) : rawAnswers;
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    throw new Error("Stored toolkit answers are invalid.");
  }
  return {
    ...row,
    id: Number(row.id),
    clientId: Number(row.clientId),
    answers: answers as Record<string, unknown>,
    businessName: row.businessName ?? null,
    contactTime: row.contactTime ?? null,
    createdAt: row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : new Date(row.createdAt).toISOString(),
  };
}

router.get("/toolkits/submissions", async (req, res): Promise<void> => {
  const session = sessionFor(req);
  const clientId = Number(session["userId"]);
  const client = Number.isInteger(clientId) && clientId > 0 && session["userRole"] === "client";

  if (!client && !isStaff(session)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const rows = client
    ? await db.select().from(toolkitSubmissionsTable)
      .where(eq(toolkitSubmissionsTable.clientId, clientId))
      .orderBy(desc(toolkitSubmissionsTable.createdAt))
    : await db.select().from(toolkitSubmissionsTable)
      .orderBy(desc(toolkitSubmissionsTable.createdAt));

  res.json(ListToolkitSubmissionsResponse.parse(rows.map(mapRow)));
});

router.post("/toolkits/submissions", async (req, res): Promise<void> => {
  const session = sessionFor(req);
  const clientId = Number(session["userId"]);
  if (!Number.isInteger(clientId) || clientId < 1 || session["userRole"] !== "client") {
    res.status(401).json({ error: "Client authentication required" });
    return;
  }

  const parsed = CreateToolkitSubmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { toolkit, answers: rawAnswers } = parsed.data;
  let answers: ToolkitAnswers;
  try {
    answers = validateToolkitAnswers(toolkit as ToolkitKind, rawAnswers);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Invalid toolkit answers",
    });
    return;
  }

  const clientName = String(session["userName"] ?? "").trim().slice(0, 255);
  const clientEmail = String(session["userEmail"] ?? "").trim().slice(0, 255);
  const phone = String(answers.phone ?? "");
  if (!clientName || !clientEmail || !phone) {
    res.status(401).json({ error: "Your account details are incomplete. Please sign in again." });
    return;
  }

  const [inserted] = await db.insert(toolkitSubmissionsTable).values({
    toolkit,
    clientId,
    clientName,
    clientEmail,
    phone,
    businessName: toolkit === "business" ? String(answers.businessName ?? "") : null,
    contactTime: typeof answers.contactTime === "string" ? answers.contactTime : null,
    answers,
    status: "pending",
  }).$returningId();

  const [row] = await db.select().from(toolkitSubmissionsTable)
    .where(eq(toolkitSubmissionsTable.id, inserted.id));
  if (!row) {
    res.status(500).json({ error: "Toolkit submission was saved but could not be loaded." });
    return;
  }

  res.status(201).json(CreateToolkitSubmissionResponse.parse(mapRow(row)));
});

router.get("/toolkits/submissions/:id", async (req, res): Promise<void> => {
  const session = sessionFor(req);
  const userId = Number(session["userId"]);
  const hasUser = Number.isInteger(userId) && userId > 0;
  const hasAdmin = Number.isInteger(Number(session["adminId"])) && Number(session["adminId"]) > 0;
  if (!hasUser && !hasAdmin) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const client = session["userRole"] === "client" && hasUser;
  if (!client && !isStaff(session)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetToolkitSubmissionParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid toolkit submission id" });
    return;
  }

  const conditions = [eq(toolkitSubmissionsTable.id, params.data.id)];
  if (client) conditions.push(eq(toolkitSubmissionsTable.clientId, userId));
  const [row] = await db.select().from(toolkitSubmissionsTable)
    .where(and(...conditions));

  if (!row) {
    res.status(404).json({ error: "Toolkit submission not found" });
    return;
  }

  res.json(GetToolkitSubmissionResponse.parse(mapRow(row)));
});

export default router;
