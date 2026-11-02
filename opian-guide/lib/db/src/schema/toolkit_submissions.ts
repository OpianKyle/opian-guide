import { index, int, json, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const toolkitSubmissionsTable = mysqlTable(
  "client_toolkit_submissions",
  {
    id: int("id").autoincrement().primaryKey(),
    toolkit: varchar("toolkit", { length: 20 }).notNull(),
    clientId: int("client_id").notNull(),
    clientName: varchar("client_name", { length: 255 }).notNull(),
    clientEmail: varchar("client_email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    businessName: varchar("business_name", { length: 255 }),
    contactTime: varchar("contact_time", { length: 100 }),
    answers: json("answers").$type<Record<string, unknown>>().notNull(),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("client_toolkit_submissions_client_created_idx").on(table.clientId, table.createdAt),
    index("client_toolkit_submissions_created_idx").on(table.createdAt),
  ],
);
