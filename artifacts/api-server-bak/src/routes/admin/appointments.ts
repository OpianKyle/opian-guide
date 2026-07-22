import { Router, type IRouter } from "express";
import { db, appointmentsTable, advisorsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  AdminListAppointmentsResponse,
  AdminCreateAppointmentBody,
  AdminCreateAppointmentResponse,
  AdminUpdateAppointmentParams,
  AdminUpdateAppointmentBody,
  AdminUpdateAppointmentResponse,
  AdminDeleteAppointmentParams,
} from "@workspace/api-zod";
import { requireAdmin } from "./middleware";
import { serializeDates } from "../../lib/utils";

const router: IRouter = Router();

// ─── GET /api/admin/appointments ─────────────────────────────────────────────

router.get("/admin/appointments", requireAdmin, async (req, res): Promise<void> => {
  try {
    const appointments = await db.select().from(appointmentsTable).orderBy(sql`${appointmentsTable.createdAt} desc`);
    res.json(AdminListAppointmentsResponse.parse(appointments));
  } catch (err) {
    req.log.error({ err }, "Admin list appointments error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/admin/appointments ────────────────────────────────────────────

router.post("/admin/appointments", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    // Look up the advisor name since it's required by the DB schema
    const [advisor] = await db.select({ name: advisorsTable.name }).from(advisorsTable).where(eq(advisorsTable.id, parsed.data.advisorId));
    const advisorName = advisor?.name ?? "Unknown Advisor";

    const result = await db.insert(appointmentsTable).values({ ...parsed.data, advisorName });
    const insertId = (result[0] as { insertId: number }).insertId;
    const [appointment] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, insertId));
    if (!appointment) {
      res.status(500).json({ error: "Failed to create appointment" });
      return;
    }
    res.status(201).json(AdminCreateAppointmentResponse.parse(appointment));
  } catch (err) {
    req.log.error({ err }, "Admin create appointment error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /api/admin/appointments/:id ───────────────────────────────────────

router.patch("/admin/appointments/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminUpdateAppointmentParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = AdminUpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    await db.update(appointmentsTable).set(parsed.data).where(eq(appointmentsTable.id, params.data.id));
    const [appointment] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, params.data.id));
    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    res.json(AdminUpdateAppointmentResponse.parse(appointment));
  } catch (err) {
    req.log.error({ err }, "Admin update appointment error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/admin/appointments/:id ──────────────────────────────────────

router.delete("/admin/appointments/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeleteAppointmentParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    await db.delete(appointmentsTable).where(eq(appointmentsTable.id, params.data.id));
    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Admin delete appointment error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
