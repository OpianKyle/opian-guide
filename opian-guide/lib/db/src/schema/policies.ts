import { mysqlTable, int, varchar, text, decimal, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const policiesTable = mysqlTable("policies", {
  id: int("id").autoincrement().primaryKey(),
  policyNumber: varchar("policy_number", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  coverAmount: decimal("cover_amount", { precision: 15, scale: 2 }).notNull(),
  premium: decimal("premium", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  startDate: varchar("start_date", { length: 20 }).notNull(),
  renewalDate: varchar("renewal_date", { length: 20 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPolicySchema = createInsertSchema(policiesTable).omit({ id: true, createdAt: true });
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Policy = typeof policiesTable.$inferSelect;
