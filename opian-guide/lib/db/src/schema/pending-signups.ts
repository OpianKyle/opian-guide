import { mysqlTable, int, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const pendingSignupsTable = mysqlTable("pending_signups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  verificationCodeHash: varchar("verification_code_hash", { length: 64 }).notNull(),
  attempts: int("attempts").notNull().default(0),
  resendCount: int("resend_count").notNull().default(0),
  expiresAt: timestamp("expires_at").notNull(),
  resendAvailableAt: timestamp("resend_available_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
