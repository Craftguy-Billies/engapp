import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const illustrationStylesTable = pgTable("illustration_styles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  isFree: boolean("is_free").notNull().default(false),
  promptPrefix: text("prompt_prefix").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type IllustrationStyle = typeof illustrationStylesTable.$inferSelect;
export type InsertIllustrationStyle = typeof illustrationStylesTable.$inferInsert;
