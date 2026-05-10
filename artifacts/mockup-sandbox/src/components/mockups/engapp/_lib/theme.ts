// Design tokens distilled from the Figma "Feed Card Design" Make project.
// Editorial / brutalist palette: warm beige page, off-white card, true-black
// foreground, and one electric lime accent. Per-POS swatches keep the card
// recognisable across word types.

export const COLORS = {
  page: "#E8E4DC",
  card: "#F5F2EC",
  cardAlt: "#EFEAE0",
  ink: "#0F0F0F",
  inkSoft: "#1A1A1A",
  mute: "#888888",
  muteSoft: "#A8A8A8",
  hairline: "#0F0F0F",
  accent: "#D4FF3D",
  accentSoft: "#EAFFA1",
  warn: "#FFB347",
  pop: "#FF6B8A",
  cool: "#7FD8C9",
  paper: "#FFFFFF",
} as const;

export const POS_COLOR: Record<string, string> = {
  n: COLORS.accent,
  noun: COLORS.accent,
  adj: COLORS.warn,
  adjective: COLORS.warn,
  v: COLORS.pop,
  verb: COLORS.pop,
  adv: COLORS.cool,
  adverb: COLORS.cool,
};

export const FONT_SANS = "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";
export const FONT_SERIF_TC =
  '"Noto Serif TC", "Source Han Serif TC", "Noto Serif", Georgia, serif';

// CEFR ladder used to render the level chip and stats projection.
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

// Default themes/exams/source-lists used in Browse/Filter and Onboarding.
// Backend has no "list themes" endpoint yet, so we keep a curated list here.
export const THEMES = [
  "nature",
  "emotion",
  "business",
  "travel",
  "loneliness",
  "reflection",
  "city",
  "food",
  "technology",
  "relationships",
] as const;

export const EXAMS = [
  { code: "HKDSE", label: "HKDSE" },
  { code: "TOEIC", label: "TOEIC" },
  { code: "TOEFL", label: "TOEFL" },
  { code: "IELTS", label: "IELTS" },
  { code: "Eiken", label: "Eiken" },
  { code: "Suneung", label: "수능 Suneung" },
] as const;

export const SOURCE_LISTS = [
  "NGSL",
  "NAWL",
  "TSL",
  "BSL",
  "CEFR-J",
] as const;

export const LANGUAGES = [
  { code: "zh-TW", label: "繁體中文（台灣）", english: "Traditional (Taiwan)" },
  { code: "zh-HK", label: "繁體中文（香港）", english: "Traditional (Hong Kong)" },
  { code: "ja", label: "日本語", english: "Japanese" },
  { code: "ko", label: "한국어", english: "Korean" },
  { code: "en", label: "English", english: "English" },
] as const;

export const LEARNING_GOALS = [
  { code: "casual", label: "Casual", subtitle: "no pressure / 隨便看看" },
  { code: "travel", label: "Travel", subtitle: "for trips / 旅行使用" },
  { code: "business", label: "Business", subtitle: "office / 商業英語" },
  { code: "toefl", label: "TOEFL", subtitle: "exam / 托福" },
  { code: "ielts", label: "IELTS", subtitle: "exam / 雅思" },
] as const;

export const DAILY_GOAL_OPTIONS = [3, 5, 10, 20, 50] as const;
