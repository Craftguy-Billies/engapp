/**
 * Seed word list — curated B1/B2 vocabulary for the initial demo content.
 *
 * Source guidance for production scale-up:
 *   1. Download the New General Service List (NGSL):
 *      http://www.newgeneralservicelist.com/  →  "NGSL+1.2+Stats.csv" (2,801 words)
 *   2. POST the words in batches of ~50 to /api/admin/words/generate-batch.
 *   3. The NVIDIA pipeline auto-fills CEFR level, themes, exam tags, and generates
 *      illustrations across all enabled styles.
 *
 * For now, this list bootstraps ~60 emotionally-rich, visually-evocative words
 * that showcase the app's aesthetic without needing any external download.
 */
export const SEED_WORDS: string[] = [
  // Solitude / introspection
  "solitude",
  "linger",
  "wander",
  "reminisce",
  "yearn",
  "ponder",
  "drift",
  // Comfort / warmth
  "cozy",
  "embrace",
  "savor",
  "cherish",
  "soothe",
  // Discovery / curiosity
  "glimpse",
  "unravel",
  "venture",
  "discover",
  "marvel",
  "curious",
  // Resilience / grit
  "persevere",
  "endure",
  "resilient",
  "thrive",
  "overcome",
  "ambitious",
  // Hesitation / doubt
  "hesitate",
  "reluctant",
  "ambivalent",
  "doubt",
  // Joy / delight
  "delight",
  "radiant",
  "elated",
  "blissful",
  "giggle",
  // Nature / atmosphere
  "drizzle",
  "breeze",
  "twilight",
  "blossom",
  "horizon",
  "dewdrop",
  // Work / focus
  "diligent",
  "deadline",
  "brainstorm",
  "commute",
  "negotiate",
  "tedious",
  // Travel / movement
  "voyage",
  "wanderlust",
  "stroll",
  "departure",
  "souvenir",
  // Food / sensory
  "crispy",
  "fragrant",
  "succulent",
  "aromatic",
  // Social / emotional
  "awkward",
  "earnest",
  "candid",
  "vulnerable",
  "empathy",
  "petty",
  "snarky",
];
