import { pgTable, serial, text, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fnaTable = pgTable("fna_submissions", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  idNumber: text("id_number").notNull(),
  maritalStatus: text("marital_status").notNull(),
  dependants: integer("dependants").notNull().default(0),
  employmentStatus: text("employment_status").notNull(),
  monthlyIncome: numeric("monthly_income", { precision: 15, scale: 2 }).notNull(),
  monthlyExpenses: numeric("monthly_expenses", { precision: 15, scale: 2 }).notNull(),
  totalAssets: numeric("total_assets", { precision: 15, scale: 2 }).notNull(),
  totalLiabilities: numeric("total_liabilities", { precision: 15, scale: 2 }).notNull(),
  hasLifeCover: boolean("has_life_cover").notNull().default(false),
  hasDisabilityCover: boolean("has_disability_cover").notNull().default(false),
  hasRetirementFund: boolean("has_retirement_fund").notNull().default(false),
  hasInvestments: boolean("has_investments").notNull().default(false),
  riskTolerance: text("risk_tolerance").notNull(),
  financialGoals: text("financial_goals").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  advisorId: integer("advisor_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFnaSchema = createInsertSchema(fnaTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFna = z.infer<typeof insertFnaSchema>;
export type FnaSubmission = typeof fnaTable.$inferSelect;
