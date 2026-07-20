import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadImportHistoryTable = mysqlTable("lead_import_history", {
  id: int("id").autoincrement().primaryKey(),
  sourceUrl: varchar("source_url", { length: 1000 }),
  importedCount: int("imported_count").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("completed"), // completed, failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLeadImportHistorySchema = createInsertSchema(leadImportHistoryTable).omit({ id: true, createdAt: true });
export type InsertLeadImportHistory = z.infer<typeof insertLeadImportHistorySchema>;
export type LeadImportHistory = typeof leadImportHistoryTable.$inferSelect;
