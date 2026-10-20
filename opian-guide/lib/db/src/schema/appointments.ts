import { mysqlTable, int, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const appointmentsTable = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientEmail: varchar("client_email", { length: 255 }).notNull(),
  advisorId: int("advisor_id").notNull(),
  advisorName: varchar("advisor_name", { length: 255 }).notNull(),
  date: varchar("date", { length: 20 }).notNull(),
  time: varchar("time", { length: 20 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true, createdAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;
