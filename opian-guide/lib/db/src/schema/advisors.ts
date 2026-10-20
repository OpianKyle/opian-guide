import { mysqlTable, int, varchar, text, json, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const advisorsTable = mysqlTable("advisors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  initials: varchar("initials", { length: 10 }).notNull(),
  specializations: json("specializations").$type<string[]>().notNull().default([]),
  clientCount: int("client_count").notNull().default(0),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdvisorSchema = createInsertSchema(advisorsTable).omit({ id: true, createdAt: true });
export type InsertAdvisor = z.infer<typeof insertAdvisorSchema>;
export type Advisor = typeof advisorsTable.$inferSelect;
