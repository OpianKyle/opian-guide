import { mysqlTable, int, varchar, text, boolean, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadsTable = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("new"), // new, contacted, qualified, booked, converted, lost
  source: varchar("source", { length: 100 }).default("manual"), // manual, import
  advisorId: int("advisor_id"),
  emailDay: int("email_day").notNull().default(0), // current campaign day 0-30
  campaignActive: boolean("campaign_active").notNull().default(true),
  notes: text("notes"),
  importBatch: varchar("import_batch", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
