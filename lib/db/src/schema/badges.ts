import { pgTable, serial, text, integer, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const badgesTable = pgTable("badges", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  iconKey: text("icon_key"),
  criteria: jsonb("criteria").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userBadgesTable = pgTable(
  "user_badges",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    badgeId: integer("badge_id").notNull().references(() => badgesTable.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userBadgeUnique: uniqueIndex("user_badges_user_badge_unique").on(t.userId, t.badgeId),
  }),
);

export type Badge = typeof badgesTable.$inferSelect;
export type UserBadge = typeof userBadgesTable.$inferSelect;
