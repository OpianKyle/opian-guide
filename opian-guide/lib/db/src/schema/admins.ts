import { mysqlTable, int, varchar, text, mysqlEnum, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Staff accounts for the internal management portal. There is no self-service
// signup for admins — accounts are provisioned by a Super Admin (or seeded
// directly), the same pattern used for the single advisor account.
export const adminsTable = mysqlTable("admins", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: mysqlEnum("role", ["super_admin", "admin"]).notNull().default("admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdminSchema = createInsertSchema(adminsTable).omit({
  id: true,
  createdAt: true,
  passwordHash: true,
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof adminsTable.$inferSelect;
