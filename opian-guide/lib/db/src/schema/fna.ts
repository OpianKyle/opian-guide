import { mysqlTable, int, varchar, text, decimal, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fnaTable = mysqlTable("fna_submissions", {
  id: int("id").autoincrement().primaryKey(),

  // Step 1 – Personal Details
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  dob: varchar("dob", { length: 20 }).notNull(),
  gender: varchar("gender", { length: 20 }).notNull(),
  smoker: varchar("smoker", { length: 10 }).notNull(),
  maritalStatus: varchar("marital_status", { length: 50 }).notNull(),
  dependants: int("dependants").notNull().default(0),
  currentAge: int("current_age").notNull().default(0),

  // Step 2 – Income & Employment
  grossMonthlyIncome: decimal("gross_monthly_income", { precision: 15, scale: 2 }).notNull(),
  netMonthlyIncome: decimal("net_monthly_income", { precision: 15, scale: 2 }).notNull().default("0"),
  spouseIncome: decimal("spouse_income", { precision: 15, scale: 2 }).notNull().default("0"),
  employmentType: varchar("employment_type", { length: 50 }).notNull(),
  occupation: varchar("occupation", { length: 255 }).notNull().default(""),
  hasGroupBenefits: varchar("has_group_benefits", { length: 10 }).notNull().default("no"),

  // Step 3 – Expenses & Liabilities
  monthlyExpenses: decimal("monthly_expenses", { precision: 15, scale: 2 }).notNull(),
  homeLoans: decimal("home_loans", { precision: 15, scale: 2 }).notNull().default("0"),
  vehicleFinance: decimal("vehicle_finance", { precision: 15, scale: 2 }).notNull().default("0"),
  personalLoans: decimal("personal_loans", { precision: 15, scale: 2 }).notNull().default("0"),
  creditCards: decimal("credit_cards", { precision: 15, scale: 2 }).notNull().default("0"),
  otherDebts: decimal("other_debts", { precision: 15, scale: 2 }).notNull().default("0"),

  // Step 4 – Assets & Existing Cover
  savings: decimal("savings", { precision: 15, scale: 2 }).notNull().default("0"),
  investments: decimal("investments", { precision: 15, scale: 2 }).notNull().default("0"),
  retirementFunds: decimal("retirement_funds", { precision: 15, scale: 2 }).notNull().default("0"),
  propertyValue: decimal("property_value", { precision: 15, scale: 2 }).notNull().default("0"),
  existingLifeCover: decimal("existing_life_cover", { precision: 15, scale: 2 }).notNull().default("0"),
  existingDisabilityCover: decimal("existing_disability_cover", { precision: 15, scale: 2 }).notNull().default("0"),
  existingDreadDiseaseCover: decimal("existing_dread_disease_cover", { precision: 15, scale: 2 }).notNull().default("0"),

  // Step 5 – Retirement Planning
  targetRetirementAge: int("target_retirement_age").notNull().default(65),
  monthlyRetirementIncome: decimal("monthly_retirement_income", { precision: 15, scale: 2 }).notNull().default("0"),
  currentRetirementSavings: decimal("current_retirement_savings", { precision: 15, scale: 2 }).notNull().default("0"),

  // Step 6 – Investment Goals
  monthlyInvestmentBudget: decimal("monthly_investment_budget", { precision: 15, scale: 2 }).notNull().default("0"),
  investmentGoal: varchar("investment_goal", { length: 255 }).notNull().default(""),
  riskProfile: varchar("risk_profile", { length: 50 }).notNull(),
  investmentHorizon: int("investment_horizon").notNull().default(10),
  priorities: text("priorities").notNull().default("[]"), // JSON array string

  // Meta
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  advisorId: int("advisor_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFnaSchema = createInsertSchema(fnaTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFna = z.infer<typeof insertFnaSchema>;
export type FnaSubmission = typeof fnaTable.$inferSelect;
