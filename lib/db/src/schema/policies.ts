import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const policiesTable = pgTable("policies", {
  id: serial("id").primaryKey(),
  policyNumber: text("policy_number").notNull(),
  type: text("type").notNull(),
  clientName: text("client_name").notNull(),
  coverAmount: numeric("cover_amount", { precision: 15, scale: 2 }).notNull(),
  premium: numeric("premium", { precision: 15, scale: 2 }).notNull(),
  status: text("status").notNull().default("active"),
  startDate: text("start_date").notNull(),
  renewalDate: text("renewal_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPolicySchema = createInsertSchema(policiesTable).omit({ id: true, createdAt: true });
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Policy = typeof policiesTable.$inferSelect;
