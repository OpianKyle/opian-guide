import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  AdminListClientsResponse,
  AdminGetClientParams,
  AdminGetClientResponse,
  AdminDeleteClientParams,
} from "@workspace/api-zod";
import { requireAdmin } from "./middleware";
import { serializeDates } from "../../lib/utils";

const router: IRouter = Router();

const clientFields = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  createdAt: usersTable.createdAt,
};

// ─── GET /api/admin/clients ───────────────────────────────────────────────────

router.get("/admin/clients", requireAdmin, async (req, res): Promise<void> => {
  try {
    const clients = await db.select(clientFields).from(usersTable).orderBy(sql`${usersTable.createdAt} desc`);
    res.json(AdminListClientsResponse.parse(clients));
  } catch (err) {
    req.log.error({ err }, "Admin list clients error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/clients/:id ───────────────────────────────────────────────

router.get("/admin/clients/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminGetClientParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [client] = await db.select(clientFields).from(usersTable).where(eq(usersTable.id, params.data.id));
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.json(AdminGetClientResponse.parse(client));
  } catch (err) {
    req.log.error({ err }, "Admin get client error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/admin/clients/:id ────────────────────────────────────────────

router.delete("/admin/clients/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeleteClientParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    await db.delete(usersTable).where(eq(usersTable.id, params.data.id));
    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Admin delete client error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
