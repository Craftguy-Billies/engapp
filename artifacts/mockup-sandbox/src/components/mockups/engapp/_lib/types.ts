// Shapes that mirror what `/api/words/feed`, `/api/words/:id`, `/api/user/*`
// return. The UI hides any field that comes back as null/empty per the
// BACKEND_INTEGRATION.md guidance.

export interface WordImage {
  styleId: number;
  styleSlug: string | null;
  styleName: string | null;
  isFree: boolean;
  imageUrl: string;
  width: number;
  height: number;
}

export interface WordDescription {
  languageCode: string;
  tone: "neutral" | "snarky" | string;
  text: string;
}

export interface WordCard {
  id: number;
  word: string;
  pos?: string | null;
  posLong?: string | null;
  phoneticsIpa: string | null;
  phoneticsKk: string | null;
  syllableCount: number | null;
  definitionEn: string | null;
  exampleSentence: string | null;
  cefrLevel: string | null;
  themeTags: string[] | null;
  examTags: string[] | null;
  sourceLists: string[] | null;
  frequencyRank: number | null;
  translation: string | null;
  translations: Record<string, string> | null;
  descriptions: WordDescription[];
  primaryImage: WordImage | null;
  images: WordImage[];
}

export interface IllustrationStyle {
  id: number;
  slug: string;
  displayName: string;
  isFree: boolean;
  description?: string | null;
  exampleImageUrl?: string | null;
}

export interface AppUser {
  id: number;
  deviceId: string | null;
  clerkId: string | null;
  uiLanguage: string;
  preferredStyleId: number | null;
  preferredTtsAccent: "en-US" | "en-GB";
  learningGoal: "casual" | "travel" | "business" | "toefl" | "ielts";
  dailyGoal: number;
  examDate: string | null;
  discoveryStreakDays: number;
  lastActiveDate: string | null;
  premiumUntil: string | null;
}

export interface UserStats {
  todayCount: number;
  dailyGoal: number;
  streak: number;
  projectedWords30d: number;
  projectedWords90d: number;
  totalKnown: number;
  totalBookmarked: number;
}

export interface BookmarkRow {
  wordId: number;
  createdAt?: string;
}

export interface KnownRow {
  wordId: number;
  revisitAt: string | null;
  revisited: boolean;
  createdAt?: string;
}

export interface FeedFilters {
  styleSlug?: string;
  cefr?: string;
  themeTag?: string;
  examTag?: string;
  limit?: number;
}
