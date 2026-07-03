import { Router, type IRouter } from "express";
import { db, fnaTable, policiesTable, appointmentsTable, documentsTable } from "@workspace/db";
import { eq, gte } from "drizzle-orm";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const [policies, appointments, documents, pendingFna] = await Promise.all([
    db.select().from(policiesTable).where(eq(policiesTable.status, "active")),
    db.select().from(appointmentsTable).where(eq(appointmentsTable.status, "scheduled")),
    db.select().from(documentsTable),
    db.select().from(fnaTable).where(eq(fnaTable.status, "pending")),
  ]);

  const recentActivity = [
    ...appointments.slice(0, 2).map((a) => ({
      id: a.id,
      type: "appointment",
      description: `Appointment booked with ${a.clientName}`,
      timestamp: a.createdAt.toISOString(),
    })),
    ...pendingFna.slice(0, 2).map((f) => ({
      id: f.id + 1000,
      type: "fna",
      description: `FNA submitted for ${f.clientName}`,
      timestamp: f.createdAt.toISOString(),
    })),
  ];

  res.json(
    GetDashboardSummaryResponse.parse({
      activePolicies: policies.length,
      upcomingAppointments: appointments.length,
      totalDocuments: documents.length,
      accountStatus: "Active",
      pendingFnaCount: pendingFna.length,
      recentActivity,
    })
  );
});

export default router;
