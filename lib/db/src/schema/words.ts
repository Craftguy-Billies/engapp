import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const wordsTable = pgTable("words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull().unique(),
  phoneticsIpa: text("phonetics_ipa"),
  phoneticsKk: text("phonetics_kk"),
  syllableCount: integer("syllable_count"),
  definitionEn: text("definition_en").notNull(),
  exampleSentence: text("example_sentence"),
  sceneDescription: text("scene_description"),
  cefrLevel: text("cefr_level"),
  themeTags: text("theme_tags").array().notNull().default([]),
  examTags: text("exam_tags").array().notNull().default([]),
  // Which curated source vocabularies this word came from: NGSL | NAWL | TSL | BSL | CEFR-J | NGSL-Spoken
  // Used to filter the feed by user's target exam (e.g. TSL = TOEIC, NAWL = IELTS/TOEFL).
  sourceLists: text("source_lists").array().notNull().default([]),
  // NGSL frequency rank when available; lower = more frequent. Used for default feed ordering.
  frequencyRank: integer("frequency_rank"),
  hasImages: boolean("has_images").notNull().default(false),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Word = typeof wordsTable.$inferSelect;
export type InsertWord = typeof wordsTable.$inferInsert;
