// Local fallback dataset. Used when the backend isn't reachable so the
// mockup-sandbox stays functional in pure-design mode.
//
// Replace these once the user's real word dataset (with images) lands.

import type { AppUser, IllustrationStyle, UserStats, WordCard } from "./types";

const UNSPLASH = "https://images.unsplash.com";

export const MOCK_STYLES: IllustrationStyle[] = [
  {
    id: 1,
    slug: "warm-cinematic",
    displayName: "Warm Cinematic",
    isFree: true,
    description: "Sunset-toned, photographic mood",
  },
  {
    id: 2,
    slug: "scrapbook-tw",
    displayName: "小紅書 Scrapbook",
    isFree: true,
    description: "Sticker-collage, soft pastel",
  },
  {
    id: 3,
    slug: "threads-editorial",
    displayName: "Threads Editorial",
    isFree: false,
    description: "Minimal, monochrome, magazine layout",
  },
  {
    id: 4,
    slug: "ink-wash",
    displayName: "水墨 Ink Wash",
    isFree: false,
    description: "East-Asian ink, tonal greys",
  },
  {
    id: 5,
    slug: "neon-street",
    displayName: "Neon Street",
    isFree: false,
    description: "Hong Kong rain, vapor neon",
  },
  {
    id: 6,
    slug: "kraft-paper",
    displayName: "Kraft Paper",
    isFree: true,
    description: "Tactile, hand-drawn warmth",
  },
];

export const MOCK_USER: AppUser = {
  id: 1,
  deviceId: "mock-device",
  clerkId: null,
  uiLanguage: "zh-TW",
  preferredStyleId: 1,
  preferredTtsAccent: "en-US",
  learningGoal: "casual",
  dailyGoal: 5,
  examDate: null,
  discoveryStreakDays: 47,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  premiumUntil: null,
};

export const MOCK_STATS: UserStats = {
  todayCount: 3,
  dailyGoal: 5,
  streak: 47,
  projectedWords30d: 150,
  projectedWords90d: 450,
  totalKnown: 312,
  totalBookmarked: 84,
};

const HOLD: WordCard[] = [
  {
    id: 1247,
    word: "solitude",
    pos: "n.",
    posLong: "noun",
    phoneticsIpa: "/ˈsɒlɪtjuːd/",
    phoneticsKk: "ˋsɑləˏtjud",
    syllableCount: 3,
    definitionEn: "The state or quality of being alone, especially when peaceful or chosen.",
    exampleSentence: "She found a quiet solitude in the cabin by the lake.",
    cefrLevel: "B1",
    themeTags: ["loneliness", "reflection", "nature"],
    examTags: ["IELTS"],
    sourceLists: ["NGSL", "CEFR-J"],
    frequencyRank: 1247,
    translation: "孤獨",
    translations: { "zh-TW": "孤獨", "zh-HK": "孤獨", ja: "孤独" },
    descriptions: [
      {
        languageCode: "zh-HK",
        tone: "snarky",
        text: "一個人未必寂寞，但寂寞嘅人通常都係一個人。",
      },
    ],
    primaryImage: {
      styleId: 1,
      styleSlug: "warm-cinematic",
      styleName: "Warm Cinematic",
      isFree: true,
      imageUrl:
        UNSPLASH +
        "/photo-1473625247510-8ceb1760943f?auto=format&fit=crop&w=1200&q=80",
      width: 1200,
      height: 800,
    },
    images: [],
  },
  {
    id: 904,
    word: "ephemeral",
    pos: "adj.",
    posLong: "adjective",
    phoneticsIpa: "/ɪˈfɛm(ə)rəl/",
    phoneticsKk: "ɪˋfɛmərəl",
    syllableCount: 4,
    definitionEn: "Lasting for a very short time; fleeting.",
    exampleSentence:
      "Cherry blossoms are beautiful but ephemeral, lasting only a week.",
    cefrLevel: "C1",
    themeTags: ["nature", "reflection"],
    examTags: ["IELTS", "TOEFL"],
    sourceLists: ["NAWL", "CEFR-J"],
    frequencyRank: 5832,
    translation: "短暫的",
    translations: { "zh-TW": "短暫的", ja: "儚い" },
    descriptions: [
      {
        languageCode: "zh-HK",
        tone: "snarky",
        text: "咩都係過眼雲煙，包括你嘅零用錢。",
      },
    ],
    primaryImage: {
      styleId: 1,
      styleSlug: "warm-cinematic",
      styleName: "Warm Cinematic",
      isFree: true,
      imageUrl:
        UNSPLASH +
        "/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80",
      width: 1200,
      height: 800,
    },
    images: [],
  },
  {
    id: 2210,
    word: "serendipity",
    pos: "n.",
    posLong: "noun",
    phoneticsIpa: "/ˌsɛr(ə)nˈdɪpɪti/",
    phoneticsKk: "ˏsɛrənˋdɪpəti",
    syllableCount: 5,
    definitionEn:
      "The occurrence and development of events by chance in a happy or beneficial way.",
    exampleSentence:
      "Meeting my best friend on a delayed flight was pure serendipity.",
    cefrLevel: "C1",
    themeTags: ["emotion", "travel"],
    examTags: ["TOEFL"],
    sourceLists: ["NAWL"],
    frequencyRank: 8121,
    translation: "機緣巧合",
    translations: { "zh-TW": "機緣巧合", ja: "幸運な偶然" },
    descriptions: [],
    primaryImage: {
      styleId: 1,
      styleSlug: "warm-cinematic",
      styleName: "Warm Cinematic",
      isFree: true,
      imageUrl:
        UNSPLASH +
        "/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=1200&q=80",
      width: 1200,
      height: 800,
    },
    images: [],
  },
  {
    id: 318,
    word: "linger",
    pos: "v.",
    posLong: "verb",
    phoneticsIpa: "/ˈlɪŋɡər/",
    phoneticsKk: "ˋlɪŋgɚ",
    syllableCount: 2,
    definitionEn: "To stay in a place longer than necessary, often unwilling to leave.",
    exampleSentence: "We lingered at the table long after dinner had ended.",
    cefrLevel: "B2",
    themeTags: ["emotion", "reflection"],
    examTags: ["IELTS"],
    sourceLists: ["NGSL"],
    frequencyRank: 3104,
    translation: "逗留",
    translations: { "zh-TW": "逗留", "zh-HK": "賴住唔走" },
    descriptions: [
      {
        languageCode: "zh-HK",
        tone: "snarky",
        text: "唔走嘅人通常唔係唔捨得，係懶。",
      },
    ],
    primaryImage: {
      styleId: 1,
      styleSlug: "warm-cinematic",
      styleName: "Warm Cinematic",
      isFree: true,
      imageUrl:
        UNSPLASH +
        "/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&w=1200&q=80",
      width: 1200,
      height: 800,
    },
    images: [],
  },
  {
    id: 559,
    word: "candid",
    pos: "adj.",
    posLong: "adjective",
    phoneticsIpa: "/ˈkændɪd/",
    phoneticsKk: "ˋkændɪd",
    syllableCount: 2,
    definitionEn: "Truthful and straightforward; frank.",
    exampleSentence: "She was unusually candid about her own mistakes.",
    cefrLevel: "B2",
    themeTags: ["emotion", "relationships"],
    examTags: ["TOEIC"],
    sourceLists: ["NGSL"],
    frequencyRank: 4011,
    translation: "坦率的",
    translations: { "zh-TW": "坦率的" },
    descriptions: [],
    primaryImage: null,
    images: [],
  },
  {
    id: 781,
    word: "resilient",
    pos: "adj.",
    posLong: "adjective",
    phoneticsIpa: "/rɪˈzɪliənt/",
    phoneticsKk: "rɪˋzɪlɪənt",
    syllableCount: 3,
    definitionEn: "Able to recover quickly from difficulty; tough.",
    exampleSentence: "The team proved remarkably resilient after the early setback.",
    cefrLevel: "B2",
    themeTags: ["emotion", "business"],
    examTags: ["IELTS", "TOEFL"],
    sourceLists: ["NAWL"],
    frequencyRank: 2710,
    translation: "有韌性的",
    translations: { "zh-TW": "有韌性的", ja: "回復力のある" },
    descriptions: [],
    primaryImage: {
      styleId: 1,
      styleSlug: "warm-cinematic",
      styleName: "Warm Cinematic",
      isFree: true,
      imageUrl:
        UNSPLASH +
        "/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      width: 1200,
      height: 800,
    },
    images: [],
  },
];

export const MOCK_WORDS: WordCard[] = HOLD;
