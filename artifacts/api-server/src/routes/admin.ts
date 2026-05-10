import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import {
  illustrationStylesTable,
  wordsTable,
  wordTranslationsTable,
  wordDescriptionsTable,
  wordImagesTable,
  type IllustrationStyle,
  type Word,
} from "@workspace/db";
import { and, eq, inArray } from "drizzle-orm";
import { requireAdmin } from "../middlewares/adminAuth";
import { generateWordContent, generateImage } from "../lib/nvidia";
import { uploadBufferToObjectStore } from "../lib/objectStorage";
import { logger } from "../lib/logger";
import { SEED_WORDS } from "../lib/seedWords";

const router: IRouter = Router();
router.use(requireAdmin);

const DEFAULT_STYLES: Array<{
  slug: string;
  displayName: string;
  description: string;
  isFree: boolean;
  promptPrefix: string;
  sortOrder: number;
}> = [
  {
    slug: "warm-cinematic",
    displayName: "Warm Cinematic",
    description: "Soft golden-hour cinematic photograph with shallow depth of field and warm filmic grain.",
    isFree: true,
    sortOrder: 0,
    promptPrefix:
      "Cinematic photograph, golden hour lighting, soft warm tones, shallow depth of field, 35mm film grain, intimate atmospheric mood. Subject: ",
  },
  {
    slug: "watercolor-storybook",
    displayName: "Watercolor Storybook",
    description: "Hand-painted watercolor illustration with gentle colors and soft paper texture.",
    isFree: true,
    sortOrder: 1,
    promptPrefix:
      "Hand-painted watercolor illustration, soft pastel washes, visible paper texture, gentle ink linework, dreamy children's storybook quality. Scene: ",
  },
  {
    slug: "japanese-anime",
    displayName: "Japanese Anime",
    description: "Studio-quality Japanese anime cel illustration with crisp linework and ambient lighting.",
    isFree: false,
    sortOrder: 2,
    promptPrefix:
      "High-quality Japanese anime illustration, cel-shaded, crisp linework, expressive character, soft ambient lighting, Studio Ghibli atmosphere. Scene: ",
  },
  {
    slug: "neon-noir",
    displayName: "Neon Noir",
    description: "Cyberpunk neon-lit night scene with cinematic teal and magenta glow.",
    isFree: false,
    sortOrder: 3,
    promptPrefix:
      "Neon noir cyberpunk photograph, rain-slicked street, teal and magenta neon glow, cinematic moody lighting, atmospheric haze. Scene: ",
  },
  {
    slug: "minimalist-line",
    displayName: "Minimalist Line",
    description: "Clean editorial minimalist illustration with bold flat shapes and calm palette.",
    isFree: false,
    sortOrder: 4,
    promptPrefix:
      "Minimalist editorial illustration, flat geometric shapes, two-tone calm palette of cream and terracotta, generous negative space, modern New Yorker style. Scene: ",
  },
];

// POST /api/admin/styles/seed — idempotent insert of default styles
router.post("/styles/seed", async (_req, res, next) => {
  try {
    const existing = await db.select().from(illustrationStylesTable);
    const existingSlugs = new Set(existing.map((s) => s.slug));
    const toInsert = DEFAULT_STYLES.filter((s) => !existingSlugs.has(s.slug));
    if (toInsert.length > 0) {
      await db.insert(illustrationStylesTable).values(toInsert);
    }
    const all = await db.select().from(illustrationStylesTable);
    res.json({ inserted: toInsert.length, total: all.length, styles: all });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/words — list with status
router.get("/words", async (_req, res, next) => {
  try {
    const rows = await db.select().from(wordsTable);
    res.json({ count: rows.length, words: rows });
  } catch (err) {
    next(err);
  }
});

// Word metadata that the admin can pass alongside the word string. Lets us preserve
// authoritative source-list / CEFR / frequency information from the merged universe CSV.
const wordMetaSchema = z.object({
  word: z.string().min(1).max(60),
  sourceLists: z.array(z.string()).optional(),
  frequencyRank: z.number().int().positive().optional(),
  cefrHint: z.string().optional(),
});

const generateBatchSchema = z.object({
  // Either pass plain `words` (strings) OR `wordsMeta` (with metadata). Mutually compatible:
  // wordsMeta is preferred because it preserves curated CEFR + source info.
  words: z.array(z.string().min(1).max(60)).min(1).max(50).optional(),
  wordsMeta: z.array(wordMetaSchema).min(1).max(50).optional(),
  useSeed: z.boolean().optional(),
  seedLimit: z.number().int().positive().max(200).optional(),
  styleSlugs: z.array(z.string()).optional(),
  skipExisting: z.boolean().default(true),
});

// POST /api/admin/words/generate-batch
router.post("/words/generate-batch", async (req, res, next) => {
  try {
    const parsed = generateBatchSchema.parse(req.body ?? {});

    let inputs: Array<{ word: string; sourceLists?: string[]; frequencyRank?: number; cefrHint?: string }> = [];
    if (parsed.wordsMeta && parsed.wordsMeta.length > 0) {
      inputs = parsed.wordsMeta.map((m) => ({ ...m, word: m.word.trim().toLowerCase() }));
    } else if (parsed.words && parsed.words.length > 0) {
      inputs = parsed.words.map((w) => ({ word: w.trim().toLowerCase() }));
    } else if (parsed.useSeed) {
      inputs = SEED_WORDS.slice(0, parsed.seedLimit ?? 20).map((w) => ({ word: w }));
    }
    if (inputs.length === 0) {
      res.status(400).json({ error: "Provide `words`, `wordsMeta`, or `useSeed: true`" });
      return;
    }

    // dedupe by word
    const byWord = new Map<string, (typeof inputs)[number]>();
    for (const i of inputs) if (i.word && !byWord.has(i.word)) byWord.set(i.word, i);
    inputs = [...byWord.values()];

    const styles = await loadStyles(parsed.styleSlugs);
    if (styles.length === 0) {
      res.status(400).json({ error: "No illustration styles configured. Call /api/admin/styles/seed first." });
      return;
    }

    let alreadyExisting: Set<string> = new Set();
    if (parsed.skipExisting) {
      const existing = await db
        .select({ word: wordsTable.word })
        .from(wordsTable)
        .where(inArray(wordsTable.word, inputs.map((i) => i.word)));
      alreadyExisting = new Set(existing.map((e) => e.word));
    }

    const toProcess = inputs.filter((i) => !alreadyExisting.has(i.word));

    const results: Array<{
      word: string;
      status: "ok" | "error";
      error?: string;
      wordId?: number;
      images?: number;
    }> = [];
    for (const meta of toProcess) {
      try {
        const summary = await processSingleWord(meta, styles);
        results.push({ word: meta.word, status: "ok", wordId: summary.wordId, images: summary.images });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error({ err, word: meta.word }, "Word generation failed");
        results.push({ word: meta.word, status: "error", error: msg });
      }
    }

    res.json({
      requested: inputs.length,
      skipped: alreadyExisting.size,
      processed: results.length,
      ok: results.filter((r) => r.status === "ok").length,
      failed: results.filter((r) => r.status === "error").length,
      results,
    });
  } catch (err) {
    next(err);
  }
});

const regenSchema = z.object({
  wordId: z.number().int().positive(),
  styleId: z.number().int().positive().optional(),
});

// POST /api/admin/words/regenerate-image
router.post("/words/regenerate-image", async (req, res, next) => {
  try {
    const { wordId, styleId } = regenSchema.parse(req.body);
    const wordRow = await db.select().from(wordsTable).where(eq(wordsTable.id, wordId)).limit(1);
    if (wordRow.length === 0) {
      res.status(404).json({ error: "word not found" });
      return;
    }
    const word = wordRow[0];
    const styles = await loadStyles();
    const targetStyles = styleId ? styles.filter((s) => s.id === styleId) : styles;
    if (targetStyles.length === 0) {
      res.status(404).json({ error: "style not found" });
      return;
    }

    const generated: Array<{ styleId: number; imagePath: string }> = [];
    for (const style of targetStyles) {
      const path = await generateAndStoreImage(word, style);
      generated.push({ styleId: style.id, imagePath: path });
    }
    await db
      .update(wordsTable)
      .set({ hasImages: true, status: "ready" })
      .where(eq(wordsTable.id, wordId));
    res.json({ wordId, generated });
  } catch (err) {
    next(err);
  }
});

// ---- helpers ----
async function loadStyles(slugs?: string[]): Promise<IllustrationStyle[]> {
  if (slugs && slugs.length > 0) {
    return db.select().from(illustrationStylesTable).where(inArray(illustrationStylesTable.slug, slugs));
  }
  return db.select().from(illustrationStylesTable);
}

async function processSingleWord(
  meta: { word: string; sourceLists?: string[]; frequencyRank?: number; cefrHint?: string },
  styles: IllustrationStyle[],
): Promise<{ wordId: number; images: number }> {
  const payload = await generateWordContent(meta.word, meta.cefrHint ?? null);

  const insertedWords = await db
    .insert(wordsTable)
    .values({
      word: meta.word,
      phoneticsIpa: payload.phonetics_ipa,
      phoneticsKk: payload.phonetics_kk,
      syllableCount: payload.syllable_count,
      definitionEn: payload.definition_en,
      exampleSentence: payload.example_sentence,
      sceneDescription: payload.scene_description,
      // Use authoritative CEFR hint when provided (CEFR-J), else the LLM's guess.
      cefrLevel: meta.cefrHint ?? payload.cefr_level,
      themeTags: payload.theme_tags ?? [],
      examTags: payload.exam_tags ?? [],
      sourceLists: meta.sourceLists ?? [],
      frequencyRank: meta.frequencyRank ?? null,
      status: "generating",
    })
    .returning();
  const inserted = insertedWords[0];

  // Translation: short literal Traditional Chinese
  await db.insert(wordTranslationsTable).values({
    wordId: inserted.id,
    languageCode: "zh-TW",
    translation: payload.translation_zh_tw,
  });

  // Optional descriptions: only insert when the LLM actually produced something natural.
  const descs: Array<{ languageCode: string; tone: string; descriptionText: string }> = [];
  if (payload.description_zh_tw) {
    descs.push({ languageCode: "zh-TW", tone: "neutral", descriptionText: payload.description_zh_tw });
  }
  if (payload.description_zh_hk_snarky) {
    descs.push({ languageCode: "zh-HK", tone: "snarky", descriptionText: payload.description_zh_hk_snarky });
  }
  if (descs.length > 0) {
    await db.insert(wordDescriptionsTable).values(descs.map((d) => ({ wordId: inserted.id, ...d })));
  }

  let imageCount = 0;
  for (const style of styles) {
    try {
      await generateAndStoreImage(inserted, style);
      imageCount += 1;
    } catch (err) {
      logger.error({ err, word: meta.word, styleSlug: style.slug }, "Image generation failed for style");
    }
  }

  await db
    .update(wordsTable)
    .set({ hasImages: imageCount > 0, status: imageCount > 0 ? "ready" : "needs_image" })
    .where(eq(wordsTable.id, inserted.id));

  return { wordId: inserted.id, images: imageCount };
}

async function generateAndStoreImage(word: Word, style: IllustrationStyle): Promise<string> {
  const scene = word.sceneDescription || word.definitionEn;
  const prompt = `${style.promptPrefix}${scene}`;
  const img = await generateImage({ prompt, width: 832, height: 1248, steps: 4 });
  const filename = `${word.id}_${style.id}_${Date.now()}.png`;
  const key = `images/${filename}`;
  await uploadBufferToObjectStore(key, img.buffer, "image/png");

  // upsert: delete previous record for this (word, style) then insert new
  await db
    .delete(wordImagesTable)
    .where(and(eq(wordImagesTable.wordId, word.id), eq(wordImagesTable.styleId, style.id)));

  await db.insert(wordImagesTable).values({
    wordId: word.id,
    styleId: style.id,
    imagePath: key,
    promptUsed: prompt,
    width: img.width,
    height: img.height,
  });
  return key;
}

export default router;
