import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const advisorsTable = pgTable("advisors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  initials: text("initials").notNull(),
  specializations: text("specializations").array().notNull().default([]),
  clientCount: integer("client_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdvisorSchema = createInsertSchema(advisorsTable).omit({ id: true, createdAt: true });
export type InsertAdvisor = z.infer<typeof insertAdvisorSchema>;
export type Advisor = typeof advisorsTable.$inferSelect;
