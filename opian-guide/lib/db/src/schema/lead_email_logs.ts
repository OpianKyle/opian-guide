import { mysqlTable, int, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadEmailLogsTable = mysqlTable("lead_email_logs", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("lead_id").notNull(),
  day: int("day").notNull(),
  subject: varchar("subject", { length: 500 }),
  status: varchar("status", { length: 50 }).notNull(), // sent, failed
  error: text("error"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const insertLeadEmailLogSchema = createInsertSchema(leadEmailLogsTable).omit({ id: true, sentAt: true });
export type InsertLeadEmailLog = z.infer<typeof insertLeadEmailLogSchema>;
export type LeadEmailLog = typeof leadEmailLogsTable.$inferSelect;
