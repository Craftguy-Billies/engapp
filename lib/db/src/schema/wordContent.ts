import { pgTable, serial, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { wordsTable } from "./words";
import { illustrationStylesTable } from "./illustrationStyles";

// Short literal translation of the word in a target language (1-3 words).
// Always neutral. Always present for supported languages.
export const wordTranslationsTable = pgTable(
  "word_translations",
  {
    id: serial("id").primaryKey(),
    wordId: integer("word_id")
      .notNull()
      .references(() => wordsTable.id, { onDelete: "cascade" }),
    languageCode: text("language_code").notNull(), // zh-TW, zh-HK, ja, ko
    translation: text("translation").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    wordLangUnique: uniqueIndex("word_translations_word_lang_unique").on(t.wordId, t.languageCode),
  }),
);

// Multilingual contextual explanation in target language. Optional per-word.
// `tone` allows multiple flavors per language: neutral helpful explanation,
// or playful/snarky regional commentary (e.g. snarky Cantonese for zh-HK).
// Only generated when it adds genuine value — model may skip if it would feel forced.
export const wordDescriptionsTable = pgTable(
  "word_descriptions",
  {
    id: serial("id").primaryKey(),
    wordId: integer("word_id")
      .notNull()
      .references(() => wordsTable.id, { onDelete: "cascade" }),
    languageCode: text("language_code").notNull(), // zh-TW, zh-HK, ja, ko
    tone: text("tone").notNull().default("neutral"), // neutral | playful | snarky | formal
    descriptionText: text("description_text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    wordLangToneUnique: uniqueIndex("word_descriptions_word_lang_tone_unique").on(
      t.wordId,
      t.languageCode,
      t.tone,
    ),
  }),
);

export const wordImagesTable = pgTable(
  "word_images",
  {
    id: serial("id").primaryKey(),
    wordId: integer("word_id")
      .notNull()
      .references(() => wordsTable.id, { onDelete: "cascade" }),
    styleId: integer("style_id")
      .notNull()
      .references(() => illustrationStylesTable.id, { onDelete: "cascade" }),
    imagePath: text("image_path").notNull(),
    promptUsed: text("prompt_used"),
    width: integer("width").notNull().default(832),
    height: integer("height").notNull().default(1248),
    generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    wordStyleUnique: uniqueIndex("word_images_word_style_unique").on(t.wordId, t.styleId),
  }),
);

export type WordTranslation = typeof wordTranslationsTable.$inferSelect;
export type InsertWordTranslation = typeof wordTranslationsTable.$inferInsert;
export type WordDescription = typeof wordDescriptionsTable.$inferSelect;
export type InsertWordDescription = typeof wordDescriptionsTable.$inferInsert;
export type WordImage = typeof wordImagesTable.$inferSelect;
export type InsertWordImage = typeof wordImagesTable.$inferInsert;
