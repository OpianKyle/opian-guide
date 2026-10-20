import { Router, type IRouter } from "express";
import { db, documentsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  AdminListDocumentsResponse,
  AdminUpdateDocumentParams,
  AdminUpdateDocumentBody,
  AdminUpdateDocumentResponse,
  AdminDeleteDocumentParams,
} from "@workspace/api-zod";
import { requireAdmin } from "./middleware";
import { serializeDates } from "../../lib/serialize-dates";

const router: IRouter = Router();

// ─── GET /api/admin/documents ─────────────────────────────────────────────────

router.get("/admin/documents", requireAdmin, async (req, res): Promise<void> => {
  try {
    const documents = await db.select().from(documentsTable).orderBy(sql`${documentsTable.uploadedAt} desc`);
    res.json(AdminListDocumentsResponse.parse(documents));
  } catch (err) {
    req.log.error({ err }, "Admin list documents error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /api/admin/documents/:id ──────────────────────────────────────────

router.patch("/admin/documents/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminUpdateDocumentParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = AdminUpdateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    await db.update(documentsTable).set(parsed.data).where(eq(documentsTable.id, params.data.id));
    const [document] = await db.select().from(documentsTable).where(eq(documentsTable.id, params.data.id));
    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    res.json(AdminUpdateDocumentResponse.parse(document));
  } catch (err) {
    req.log.error({ err }, "Admin update document error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/admin/documents/:id ─────────────────────────────────────────

router.delete("/admin/documents/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeleteDocumentParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    await db.delete(documentsTable).where(eq(documentsTable.id, params.data.id));
    res.sendStatus(204);
  } catch (err) {
    req.log.error({ err }, "Admin delete document error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
