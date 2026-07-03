import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fnaTable = pgTable("fna_submissions", {
  id: serial("id").primaryKey(),

  // Step 1 – Personal Details
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dob: text("dob").notNull(),
  gender: text("gender").notNull(),
  smoker: text("smoker").notNull(),
  maritalStatus: text("marital_status").notNull(),
  dependants: integer("dependants").notNull().default(0),
  currentAge: integer("current_age").notNull().default(0),

  // Step 2 – Income & Employment
  grossMonthlyIncome: numeric("gross_monthly_income", { precision: 15, scale: 2 }).notNull(),
  netMonthlyIncome: numeric("net_monthly_income", { precision: 15, scale: 2 }).notNull().default("0"),
  spouseIncome: numeric("spouse_income", { precision: 15, scale: 2 }).notNull().default("0"),
  employmentType: text("employment_type").notNull(),
  occupation: text("occupation").notNull().default(""),
  hasGroupBenefits: text("has_group_benefits").notNull().default("no"),

  // Step 3 – Expenses & Liabilities
  monthlyExpenses: numeric("monthly_expenses", { precision: 15, scale: 2 }).notNull(),
  homeLoans: numeric("home_loans", { precision: 15, scale: 2 }).notNull().default("0"),
  vehicleFinance: numeric("vehicle_finance", { precision: 15, scale: 2 }).notNull().default("0"),
  personalLoans: numeric("personal_loans", { precision: 15, scale: 2 }).notNull().default("0"),
  creditCards: numeric("credit_cards", { precision: 15, scale: 2 }).notNull().default("0"),
  otherDebts: numeric("other_debts", { precision: 15, scale: 2 }).notNull().default("0"),

  // Step 4 – Assets & Existing Cover
  savings: numeric("savings", { precision: 15, scale: 2 }).notNull().default("0"),
  investments: numeric("investments", { precision: 15, scale: 2 }).notNull().default("0"),
  retirementFunds: numeric("retirement_funds", { precision: 15, scale: 2 }).notNull().default("0"),
  propertyValue: numeric("property_value", { precision: 15, scale: 2 }).notNull().default("0"),
  existingLifeCover: numeric("existing_life_cover", { precision: 15, scale: 2 }).notNull().default("0"),
  existingDisabilityCover: numeric("existing_disability_cover", { precision: 15, scale: 2 }).notNull().default("0"),
  existingDreadDiseaseCover: numeric("existing_dread_disease_cover", { precision: 15, scale: 2 }).notNull().default("0"),

  // Step 5 – Retirement Planning
  targetRetirementAge: integer("target_retirement_age").notNull().default(65),
  monthlyRetirementIncome: numeric("monthly_retirement_income", { precision: 15, scale: 2 }).notNull().default("0"),
  currentRetirementSavings: numeric("current_retirement_savings", { precision: 15, scale: 2 }).notNull().default("0"),

  // Step 6 – Investment Goals
  monthlyInvestmentBudget: numeric("monthly_investment_budget", { precision: 15, scale: 2 }).notNull().default("0"),
  investmentGoal: text("investment_goal").notNull().default(""),
  riskProfile: text("risk_profile").notNull(),
  investmentHorizon: integer("investment_horizon").notNull().default(10),
  priorities: text("priorities").notNull().default("[]"), // JSON array string

  // Meta
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  advisorId: integer("advisor_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFnaSchema = createInsertSchema(fnaTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFna = z.infer<typeof insertFnaSchema>;
export type FnaSubmission = typeof fnaTable.$inferSelect;
