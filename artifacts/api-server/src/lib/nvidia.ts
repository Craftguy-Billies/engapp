import { logger } from "./logger";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const LLM_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
const IMAGE_ENDPOINT = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b";

export const NVIDIA_LLM_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1";

function requireKey(): string {
  if (!NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not set in environment.");
  }
  return NVIDIA_API_KEY;
}

export interface WordContentPayload {
  phonetics_ipa: string;
  phonetics_kk: string;
  syllable_count: number;
  definition_en: string;
  example_sentence: string;
  translation_zh_tw: string;
  // Optional neutral contextual explanation in Traditional Chinese (for users who
  // want a longer "what does this word feel like" beyond the bare translation).
  // null when the bare translation is sufficient and an explanation would feel forced.
  description_zh_tw: string | null;
  // Optional snarky/playful Cantonese commentary in Traditional Chinese characters.
  // null when nothing snarky lands naturally for this word — DO NOT force it.
  // (Future: fine-tuned on user-provided Cantonese voice training data.)
  description_zh_hk_snarky: string | null;
  scene_description: string;
  theme_tags: string[];
  exam_tags: string[];
  cefr_level: string;
}

const WORD_SYSTEM_PROMPT = `You are an expert English vocabulary curator for a beautiful mobile flashcard app aimed at Traditional Chinese speakers in Hong Kong, Taiwan, and (later) Japan and Korea.

For every English word you receive, output STRICT JSON with EXACTLY these fields and no others:
{
  "phonetics_ipa": "IPA phonetic transcription with surrounding slashes, e.g. /ˈsɒlɪtjuːd/",
  "phonetics_kk": "K.K. phonetic transcription with brackets, e.g. [ˋsɑləˏtjud]",
  "syllable_count": <integer number of syllables>,
  "definition_en": "<crisp natural English definition, max 18 words, NOT dictionary-stiff>",
  "example_sentence": "<one natural contemporary sentence using the word>",
  "translation_zh_tw": "<Traditional Chinese translation of the word itself, 1-4 characters, clean, no parentheses>",
  "description_zh_tw": <null OR "<one sentence Traditional Chinese explanation that adds genuine context beyond the bare translation, max 30 characters. Use null when the bare translation already suffices.">,
  "description_zh_hk_snarky": <null OR "<short snarky/playful Cantonese commentary in Traditional Chinese characters, like an inner monologue, 8 to 22 characters. ONLY include when something snarky genuinely lands for this word — DO NOT force it. Use null when nothing snarky comes to mind. Most ordinary words should be null.">,
  "scene_description": "<English, max 50 words, ONE concrete vivid scene that makes this word's meaning instantly visible. Be direct and practical: describe people, objects, lighting, posture. Avoid abstract or poetic language. The scene must depict the word's meaning so clearly that a viewer can guess the word from the image alone.>",
  "theme_tags": ["2-4 lowercase emotional/topical tags like loneliness, ambition, comfort, nature, work, food, travel, growth"],
  "exam_tags": ["subset of TOEFL, IELTS — only include if the word commonly appears in those exams; otherwise empty array"],
  "cefr_level": "one of A1, A2, B1, B2, C1, C2"
}

Critical rules:
- Output ONLY the JSON object. No markdown fences, no commentary, no extra prose.
- description_zh_hk_snarky must be null for the majority of ordinary functional words. Only emit when genuinely witty.
- description_zh_tw should be null for words where the translation is self-explanatory.`;

export async function generateWordContent(word: string, cefrHint?: string | null): Promise<WordContentPayload> {
  const key = requireKey();
  const userMsg = cefrHint
    ? `Word: ${word}\nKnown CEFR level (use this as authoritative): ${cefrHint}`
    : `Word: ${word}`;
  const res = await fetch(LLM_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_LLM_MODEL,
      messages: [
        { role: "system", content: WORD_SYSTEM_PROMPT },
        { role: "user", content: userMsg },
      ],
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: 800,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, body: text.slice(0, 500), word }, "NVIDIA LLM request failed");
    throw new Error(`NVIDIA LLM ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("NVIDIA LLM returned no content");

  const cleaned = stripJsonFences(content);
  let parsed: WordContentPayload;
  try {
    parsed = JSON.parse(cleaned) as WordContentPayload;
  } catch {
    logger.error({ raw: content.slice(0, 500), word }, "Failed to parse NVIDIA LLM JSON");
    throw new Error(`LLM returned invalid JSON for word "${word}"`);
  }
  validateWordPayload(parsed, word);
  return parsed;
}

function stripJsonFences(s: string): string {
  let t = s.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```$/m, "");
  }
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first >= 0 && last > first) t = t.slice(first, last + 1);
  return t.trim();
}

function validateWordPayload(p: WordContentPayload, word: string): void {
  const required: (keyof WordContentPayload)[] = [
    "phonetics_ipa",
    "phonetics_kk",
    "syllable_count",
    "definition_en",
    "example_sentence",
    "translation_zh_tw",
    "scene_description",
    "cefr_level",
  ];
  for (const k of required) {
    if (p[k] === undefined || p[k] === null || (typeof p[k] === "string" && (p[k] as string).length === 0)) {
      throw new Error(`LLM payload for "${word}" missing field: ${String(k)}`);
    }
  }
  if (!Array.isArray(p.theme_tags)) p.theme_tags = [];
  if (!Array.isArray(p.exam_tags)) p.exam_tags = [];
  // Normalize "null" string and empty string to true null for optional descriptions
  for (const k of ["description_zh_tw", "description_zh_hk_snarky"] as const) {
    const v = p[k];
    if (v === undefined || v === "" || v === "null") p[k] = null;
  }
  if (typeof p.syllable_count !== "number") {
    p.syllable_count = Number(p.syllable_count) || 0;
  }
}

export interface GeneratedImage {
  buffer: Buffer;
  width: number;
  height: number;
  contentType: "image/png";
  promptUsed: string;
}

export async function generateImage(args: {
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
}): Promise<GeneratedImage> {
  const key = requireKey();
  const width = args.width ?? 832;
  const height = args.height ?? 1248;
  const body = {
    prompt: args.prompt,
    width,
    height,
    steps: args.steps ?? 4,
    seed: args.seed ?? Math.floor(Math.random() * 1_000_000),
  };

  const res = await fetch(IMAGE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, body: text.slice(0, 500) }, "NVIDIA image gen failed");
    throw new Error(`NVIDIA image ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    image?: string;
    artifacts?: Array<{ base64?: string; b64_json?: string }>;
    images?: Array<{ image?: string; b64_json?: string }>;
  };

  const base64 =
    data.image ||
    data.artifacts?.[0]?.base64 ||
    data.artifacts?.[0]?.b64_json ||
    data.images?.[0]?.image ||
    data.images?.[0]?.b64_json;

  if (!base64) {
    logger.error({ keys: Object.keys(data) }, "NVIDIA image response missing base64 field");
    throw new Error("NVIDIA image response did not contain base64 image data");
  }

  const buffer = Buffer.from(base64, "base64");
  return { buffer, width, height, contentType: "image/png", promptUsed: args.prompt };
}
