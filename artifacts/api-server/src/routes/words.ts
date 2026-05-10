import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import {
  wordsTable,
  wordTranslationsTable,
  wordDescriptionsTable,
  wordImagesTable,
  illustrationStylesTable,
  userSeenWordsTable,
} from "@workspace/db";
import { and, eq, notInArray, inArray, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

const feedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  styleSlug: z.string().optional(),
  cefr: z.string().optional(),
  themeTag: z.string().optional(),
  examTag: z.string().optional(),
});

// GET /api/words/feed — anonymous-friendly. If req.appUser is set (via identifyUser
// elsewhere), already-seen words are filtered out. Otherwise returns random ready words.
router.get("/feed", async (req, res, next) => {
  try {
    const params = feedQuerySchema.parse(req.query);

    const filters = [eq(wordsTable.hasImages, true), eq(wordsTable.status, "ready")];
    if (params.cefr) filters.push(eq(wordsTable.cefrLevel, params.cefr));
    if (params.themeTag) filters.push(sql`${params.themeTag} = ANY(${wordsTable.themeTags})`);
    if (params.examTag) filters.push(sql`${params.examTag} = ANY(${wordsTable.examTags})`);

    const userId = req.appUser?.id;
    if (userId) {
      const seen = await db
        .select({ wordId: userSeenWordsTable.wordId })
        .from(userSeenWordsTable)
        .where(eq(userSeenWordsTable.userId, userId));
      if (seen.length > 0) {
        const seenIds = seen.map((s) => s.wordId);
        filters.push(notInArray(wordsTable.id, seenIds));
      }
    }

    const whereClause = and(...filters)!;

    const rows = await db
      .select()
      .from(wordsTable)
      .where(whereClause)
      .orderBy(sql`random()`)
      .limit(params.limit);

    const wordIds = rows.map((r) => r.id);
    if (wordIds.length === 0) {
      res.json({ words: [] });
      return;
    }

    const [translations, descriptions, images, styles] = await Promise.all([
      db.select().from(wordTranslationsTable).where(inArray(wordTranslationsTable.wordId, wordIds)),
      db.select().from(wordDescriptionsTable).where(inArray(wordDescriptionsTable.wordId, wordIds)),
      db.select().from(wordImagesTable).where(inArray(wordImagesTable.wordId, wordIds)),
      db.select().from(illustrationStylesTable),
    ]);

    const result = rows.map((w) => buildWordCard(w, translations, descriptions, images, styles, params.styleSlug));
    res.json({ words: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/words/styles/list — public list of available styles
// IMPORTANT: must be registered BEFORE /:id, otherwise "styles" is parsed as id.
router.get("/styles/list", async (_req, res, next) => {
  try {
    const styles = await db
      .select()
      .from(illustrationStylesTable)
      .orderBy(desc(illustrationStylesTable.isFree), illustrationStylesTable.sortOrder);
    res.json({ styles });
  } catch (err) {
    next(err);
  }
});

// GET /api/words/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    const wordRow = await db.select().from(wordsTable).where(eq(wordsTable.id, id)).limit(1);
    if (wordRow.length === 0) {
      res.status(404).json({ error: "not found" });
      return;
    }
    const [translations, descriptions, images, styles] = await Promise.all([
      db.select().from(wordTranslationsTable).where(eq(wordTranslationsTable.wordId, id)),
      db.select().from(wordDescriptionsTable).where(eq(wordDescriptionsTable.wordId, id)),
      db.select().from(wordImagesTable).where(eq(wordImagesTable.wordId, id)),
      db.select().from(illustrationStylesTable),
    ]);
    res.json(buildWordCard(wordRow[0], translations, descriptions, images, styles));
  } catch (err) {
    next(err);
  }
});

function buildWordCard(
  w: typeof wordsTable.$inferSelect,
  translations: (typeof wordTranslationsTable.$inferSelect)[],
  descriptions: (typeof wordDescriptionsTable.$inferSelect)[],
  images: (typeof wordImagesTable.$inferSelect)[],
  styles: (typeof illustrationStylesTable.$inferSelect)[],
  preferredStyleSlug?: string,
): unknown {
  const styleById = new Map(styles.map((s) => [s.id, s]));
  const wordImages = images
    .filter((i) => i.wordId === w.id)
    .map((i) => {
      const style = styleById.get(i.styleId);
      return {
        styleId: i.styleId,
        styleSlug: style?.slug ?? null,
        styleName: style?.displayName ?? null,
        isFree: style?.isFree ?? false,
        imageUrl: `/api/images/${i.imagePath.replace(/^images\//, "")}`,
        width: i.width,
        height: i.height,
      };
    });

  const primaryImage =
    (preferredStyleSlug && wordImages.find((i) => i.styleSlug === preferredStyleSlug)) ||
    wordImages.find((i) => i.isFree) ||
    wordImages[0] ||
    null;

  // Translations are short literal forms (e.g. "孤獨"); keyed by language code.
  const wordTranslations = translations
    .filter((t) => t.wordId === w.id)
    .reduce<Record<string, string>>((acc, t) => {
      acc[t.languageCode] = t.translation;
      return acc;
    }, {});

  // Descriptions are optional richer multilingual context, keyed by `${language}.${tone}`
  // e.g. "zh-TW.neutral" → useful explanation, "zh-HK.snarky" → playful Cantonese line.
  const wordDescriptions = descriptions
    .filter((d) => d.wordId === w.id)
    .map((d) => ({ languageCode: d.languageCode, tone: d.tone, text: d.descriptionText }));

  return {
    id: w.id,
    word: w.word,
    phoneticsIpa: w.phoneticsIpa,
    phoneticsKk: w.phoneticsKk,
    syllableCount: w.syllableCount,
    definitionEn: w.definitionEn,
    exampleSentence: w.exampleSentence,
    cefrLevel: w.cefrLevel,
    themeTags: w.themeTags,
    examTags: w.examTags,
    sourceLists: w.sourceLists,
    frequencyRank: w.frequencyRank,
    translation: wordTranslations["zh-TW"] ?? null,
    translations: wordTranslations,
    descriptions: wordDescriptions,
    primaryImage,
    images: wordImages,
  };
}

export default router;
