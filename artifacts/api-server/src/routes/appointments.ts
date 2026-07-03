import { Router, type IRouter } from "express";
import { db, appointmentsTable, advisorsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListAppointmentsResponse,
  CreateAppointmentBody,
  CreateAppointmentResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/appointments", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(appointmentsTable)
    .orderBy(desc(appointmentsTable.date));
  const mapped = rows.map((r) => ({ ...r, notes: r.notes ?? null }));
  res.json(ListAppointmentsResponse.parse(mapped));
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [advisor] = await db
    .select()
    .from(advisorsTable)
    .where(eq(advisorsTable.id, parsed.data.advisorId));

  if (!advisor) {
    res.status(400).json({ error: "Advisor not found" });
    return;
  }

  const advisorName = advisor.name;

  const [row] = await db
    .insert(appointmentsTable)
    .values({
      ...parsed.data,
      advisorName,
      notes: parsed.data.notes ?? null,
      status: "scheduled",
    })
    .returning();

  res.status(201).json(
    CreateAppointmentResponse.parse({ ...row, notes: row.notes ?? null })
  );
});

export default router;
