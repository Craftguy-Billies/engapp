import { pgTable, serial, integer, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { wordsTable } from "./words";

export const userBookmarksTable = pgTable(
  "user_bookmarks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    wordId: integer("word_id").notNull().references(() => wordsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userWordUnique: uniqueIndex("user_bookmarks_user_word_unique").on(t.userId, t.wordId),
    userIdx: index("user_bookmarks_user_idx").on(t.userId),
  }),
);

export const userKnownWordsTable = pgTable(
  "user_known_words",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    wordId: integer("word_id").notNull().references(() => wordsTable.id, { onDelete: "cascade" }),
    revisitAt: timestamp("revisit_at", { withTimezone: true }),
    revisited: integer("revisited").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userWordUnique: uniqueIndex("user_known_words_user_word_unique").on(t.userId, t.wordId),
    userIdx: index("user_known_words_user_idx").on(t.userId),
    revisitIdx: index("user_known_words_revisit_idx").on(t.revisitAt),
  }),
);

export const userSeenWordsTable = pgTable(
  "user_seen_words",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    wordId: integer("word_id").notNull().references(() => wordsTable.id, { onDelete: "cascade" }),
    seenAt: timestamp("seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userWordUnique: uniqueIndex("user_seen_words_user_word_unique").on(t.userId, t.wordId),
    userSeenIdx: index("user_seen_words_user_seen_idx").on(t.userId, t.seenAt),
  }),
);

export type UserBookmark = typeof userBookmarksTable.$inferSelect;
export type UserKnownWord = typeof userKnownWordsTable.$inferSelect;
export type UserSeenWord = typeof userSeenWordsTable.$inferSelect;
