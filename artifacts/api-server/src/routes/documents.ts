import { Router, type IRouter } from "express";
import { db, documentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListDocumentsResponse,
  UploadDocumentBody,
  UploadDocumentResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/documents", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(documentsTable)
    .orderBy(desc(documentsTable.uploadedAt));
  const mapped = rows.map((r) => ({
    ...r,
    uploadedAt: r.uploadedAt.toISOString(),
  }));
  res.json(ListDocumentsResponse.parse(mapped));
});

router.post("/documents", async (req, res): Promise<void> => {
  const parsed = UploadDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // MySQL doesn't support .returning() — insert then re-fetch by ID
  const inserted = await db
    .insert(documentsTable)
    .values({ ...parsed.data, status: "stored" })
    .$returningId();

  const [row] = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.id, inserted[0].id));

  res.status(201).json(
    UploadDocumentResponse.parse({ ...row, uploadedAt: row.uploadedAt.toISOString() })
  );
});

export default router;
