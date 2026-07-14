import { Router, type IRouter } from "express";
import { db, adminsTable, advisorsTable, usersTable, fnaTable, appointmentsTable, policiesTable, documentsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import { requireAdmin } from "./middleware";

const router: IRouter = Router();

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────

router.get("/admin/dashboard", requireAdmin, async (req, res): Promise<void> => {
  try {
    const [[{ totalAdvisors }], [{ totalClients }], [{ totalFna }], [{ pendingFna }], [{ totalPolicies }], [{ totalAppointments }], [{ totalDocuments }]] = await Promise.all([
      db.select({ totalAdvisors: count() }).from(advisorsTable),
      db.select({ totalClients: count() }).from(usersTable),
      db.select({ totalFna: count() }).from(fnaTable),
      db.select({ pendingFna: count() }).from(fnaTable).where(eq(fnaTable.status, "pending")),
      db.select({ totalPolicies: count() }).from(policiesTable),
      db.select({ totalAppointments: count() }).from(appointmentsTable),
      db.select({ totalDocuments: count() }).from(documentsTable),
    ]);

    const [recentFna, recentAppointments] = await Promise.all([
      db.select().from(fnaTable).orderBy(sql`${fnaTable.createdAt} desc`).limit(5),
      db.select().from(appointmentsTable).orderBy(sql`${appointmentsTable.createdAt} desc`).limit(5),
    ]);

    res.json({
      totalAdvisors: Number(totalAdvisors),
      totalClients: Number(totalClients),
      totalFnaSubmissions: Number(totalFna),
      pendingFna: Number(pendingFna),
      totalPolicies: Number(totalPolicies),
      totalAppointments: Number(totalAppointments),
      totalDocuments: Number(totalDocuments),
      recentFna,
      recentAppointments,
    });
  } catch (err) {
    req.log.error({ err }, "Admin dashboard error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
