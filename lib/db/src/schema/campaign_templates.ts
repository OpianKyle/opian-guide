import { mysqlTable, int, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const campaignTemplatesTable = mysqlTable("campaign_templates", {
  id: int("id").autoincrement().primaryKey(),
  day: int("day").notNull().unique(),
  subject: varchar("subject", { length: 500 }).notNull(),
  bodyHtml: text("body_html").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type CampaignTemplate = typeof campaignTemplatesTable.$inferSelect;
