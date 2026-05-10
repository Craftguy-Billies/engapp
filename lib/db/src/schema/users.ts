import { pgTable, serial, text, integer, timestamp, date } from "drizzle-orm/pg-core";
import { illustrationStylesTable } from "./illustrationStyles";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").unique(),
  deviceId: text("device_id").unique(),
  uiLanguage: text("ui_language").notNull().default("zh-TW"),
  preferredStyleId: integer("preferred_style_id").references(() => illustrationStylesTable.id, {
    onDelete: "set null",
  }),
  preferredTtsAccent: text("preferred_tts_accent").notNull().default("en-US"),
  learningGoal: text("learning_goal").notNull().default("casual"),
  dailyGoal: integer("daily_goal").notNull().default(5),
  examDate: date("exam_date"),
  discoveryStreakDays: integer("discovery_streak_days").notNull().default(0),
  lastActiveDate: date("last_active_date"),
  premiumUntil: timestamp("premium_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
