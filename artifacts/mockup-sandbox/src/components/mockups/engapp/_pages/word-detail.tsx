// 7. Word Detail
//
// Deep dive: image hero, full word + translations + descriptions + tags, and a
// sticky bottom action bar with Mark Known / Bookmark / Share.

import { Bookmark, Check, Share2, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { resolveImageUrl } from "../_lib/api";
import { Eyebrow, Hairline, Pill } from "../_components/primitives";
import { PageHeader } from "../_components/page-header";
import {
  COLORS,
  FONT_SANS,
  FONT_SERIF_TC,
  POS_COLOR,
} from "../_lib/theme";
import { useEngapp } from "../_lib/store";
import type { WordCard as WordCardData } from "../_lib/types";

interface Props {
  wordId?: number;
  onBack?: () => void;
  onShare?: (id: number) => void;
}

export function WordDetailPage({ wordId, onBack, onShare }: Props) {
  const { feed, fetchWord, bookmarks, known, toggleBookmark, markKnown } = useEngapp();
  const [word, setWord] = useState<WordCardData | undefined>(
    wordId != null ? feed.find((w) => w.id === wordId) ?? feed[0] : feed[0],
  );

  useEffect(() => {
    if (wordId == null) return;
    const cached = feed.find((w) => w.id === wordId);
    if (cached) setWord(cached);
    else void fetchWord(wordId).then((w) => w && setWord(w));
  }, [wordId, feed, fetchWord]);

  if (!word) {
    return (
      <div
        className="size-full flex flex-col"
        style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
      >
        <PageHeader title="WORD" onBack={onBack} />
        <div
          className="flex-1 flex items-center justify-center"
          style={{ color: COLORS.mute, fontSize: 12, letterSpacing: 1.4 }}
        >
          NO WORD SELECTED
        </div>
      </div>
    );
  }

  const isSaved = bookmarks.includes(word.id);
  const isKnown = known.has(word.id);
  const posKey = (word.pos ?? word.posLong ?? "").replace(".", "").toLowerCase();
  const posBg = POS_COLOR[posKey] ?? COLORS.accent;
  const speak = (accent: "en-US" | "en-GB") => () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      const utter = new SpeechSynthesisUtterance(word.word);
      utter.lang = accent;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch {
      // best-effort only
    }
  };

  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader
        title={word.word.toUpperCase()}
        subtitle={word.translation ?? undefined}
        onBack={onBack}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pb-24">
        {word.primaryImage ? (
          <div
            className="w-full overflow-hidden"
            style={{ aspectRatio: "16 / 9", backgroundColor: COLORS.ink }}
          >
            <img
              src={resolveImageUrl(word.primaryImage.imageUrl)}
              alt={word.word}
              className="w-full h-full object-cover"
              style={{ filter: "contrast(1.05) saturate(0.85)" }}
            />
          </div>
        ) : (
          <div
            className="w-full"
            style={{
              aspectRatio: "16 / 9",
              background:
                "repeating-linear-gradient(45deg, #1A1A1A 0, #1A1A1A 8px, #0F0F0F 8px, #0F0F0F 16px)",
            }}
          />
        )}

        <div className="px-5 pt-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Pill bg={posBg} border>
              {word.posLong ?? word.pos ?? "WORD"}
            </Pill>
            {word.cefrLevel ? (
              <Pill bg={COLORS.accent} border>
                {word.cefrLevel}
              </Pill>
            ) : null}
            {word.frequencyRank ? (
              <Pill border>FREQ #{word.frequencyRank}</Pill>
            ) : null}
          </div>
          <h1
            className="mt-3 break-words"
            style={{
              fontFamily: FONT_SANS,
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: -2.4,
              lineHeight: 0.95,
              color: COLORS.ink,
            }}
          >
            {word.word}
            <span style={{ color: COLORS.accent }}>.</span>
          </h1>

          {(word.phoneticsIpa || word.phoneticsKk || word.syllableCount) && (
            <div
              className="mt-2 flex items-center gap-2 flex-wrap"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 13,
                fontWeight: 600,
                color: COLORS.mute,
              }}
            >
              {word.phoneticsIpa ? <span>{word.phoneticsIpa}</span> : null}
              {word.phoneticsKk ? <span>· [{word.phoneticsKk}]</span> : null}
              {word.syllableCount ? <span>· {word.syllableCount} syl</span> : null}
              <button
                onClick={speak("en-US")}
                className="ml-2 inline-flex items-center gap-1 px-2 py-0.5"
                style={{
                  border: "1.5px solid #0F0F0F",
                  color: COLORS.ink,
                  fontSize: 10,
                  letterSpacing: 1.2,
                }}
              >
                <Volume2 size={11} /> US
              </button>
              <button
                onClick={speak("en-GB")}
                className="inline-flex items-center gap-1 px-2 py-0.5"
                style={{
                  border: "1.5px solid #0F0F0F",
                  color: COLORS.ink,
                  fontSize: 10,
                  letterSpacing: 1.2,
                }}
              >
                <Volume2 size={11} /> UK
              </button>
            </div>
          )}

          {word.definitionEn ? (
            <p
              className="mt-4"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 15,
                color: COLORS.ink,
                lineHeight: 1.55,
              }}
            >
              {word.definitionEn}
            </p>
          ) : null}

          {word.translations && Object.keys(word.translations).length > 0 ? (
            <div className="mt-5">
              <Eyebrow color={COLORS.mute}>TRANSLATIONS</Eyebrow>
              <Hairline style={{ marginTop: 6, marginBottom: 8 }} />
              <div className="grid gap-1.5">
                {Object.entries(word.translations).map(([code, txt]) => (
                  <div key={code} className="flex items-baseline gap-3">
                    <span
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 9,
                        letterSpacing: 1.4,
                        color: COLORS.mute,
                        textTransform: "uppercase",
                        minWidth: 48,
                      }}
                    >
                      {code}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_SERIF_TC,
                        fontSize: 18,
                        color: COLORS.ink,
                        fontWeight: 600,
                      }}
                    >
                      {txt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {word.exampleSentence ? (
            <div className="mt-5">
              <Eyebrow color={COLORS.mute}>EXAMPLE</Eyebrow>
              <Hairline style={{ marginTop: 6, marginBottom: 8 }} />
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 15,
                  fontStyle: "italic",
                  color: COLORS.ink,
                  lineHeight: 1.5,
                }}
              >
                {word.exampleSentence}
              </p>
            </div>
          ) : null}

          {word.descriptions && word.descriptions.length > 0 ? (
            <div className="mt-5">
              <Eyebrow color={COLORS.mute}>DESCRIPTIONS</Eyebrow>
              <Hairline style={{ marginTop: 6, marginBottom: 8 }} />
              <div className="grid gap-2">
                {word.descriptions.map((d, i) => (
                  <div
                    key={i}
                    className="px-3 py-2"
                    style={{
                      border: "1px dashed #0F0F0F",
                      backgroundColor: d.tone === "snarky" ? "rgba(255,107,138,0.08)" : "transparent",
                    }}
                  >
                    <Eyebrow color={COLORS.mute}>
                      {d.languageCode} · {d.tone}
                    </Eyebrow>
                    <p
                      className="mt-1"
                      style={{
                        fontFamily: FONT_SERIF_TC,
                        fontSize: 15,
                        color: COLORS.ink,
                        lineHeight: 1.55,
                      }}
                    >
                      {d.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {(word.themeTags?.length ?? 0) +
            (word.examTags?.length ?? 0) +
            (word.sourceLists?.length ?? 0) >
          0 ? (
            <div className="mt-5">
              <Eyebrow color={COLORS.mute}>TAGS</Eyebrow>
              <Hairline style={{ marginTop: 6, marginBottom: 8 }} />
              <div className="flex flex-wrap gap-1.5">
                {(word.themeTags ?? []).map((t) => (
                  <Pill key={`t-${t}`} border>
                    {t}
                  </Pill>
                ))}
                {(word.examTags ?? []).map((t) => (
                  <Pill key={`e-${t}`} bg={COLORS.accent} border>
                    {t}
                  </Pill>
                ))}
                {(word.sourceLists ?? []).map((t) => (
                  <Pill key={`s-${t}`} border color={COLORS.mute}>
                    {t}
                  </Pill>
                ))}
              </div>
            </div>
          ) : null}

          {word.images.length > 0 ? (
            <div className="mt-5">
              <Eyebrow color={COLORS.mute}>STYLES · {word.images.length}</Eyebrow>
              <Hairline style={{ marginTop: 6, marginBottom: 8 }} />
              <div className="grid grid-cols-3 gap-2">
                {word.images.map((img) => (
                  <div
                    key={img.styleId}
                    className="overflow-hidden relative"
                    style={{
                      aspectRatio: "1 / 1",
                      border: "1.5px solid #0F0F0F",
                      backgroundColor: COLORS.ink,
                    }}
                  >
                    <img
                      src={resolveImageUrl(img.imageUrl)}
                      alt={img.styleName ?? ""}
                      className="w-full h-full object-cover"
                      style={{ filter: img.isFree ? "none" : "blur(2px) grayscale(0.6)" }}
                    />
                    <div
                      className="absolute left-1 bottom-1 px-1 py-0.5"
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: 1.2,
                        backgroundColor: COLORS.ink,
                        color: COLORS.accent,
                      }}
                    >
                      {img.isFree ? "FREE" : "LOCKED"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Sticky action bar */}
      <div
        className="absolute left-0 right-0 bottom-0 px-4 py-3 flex items-stretch gap-2"
        style={{
          backgroundColor: COLORS.card,
          borderTop: "1.5px solid #0F0F0F",
        }}
      >
        <button
          onClick={() => markKnown(word.id)}
          className="flex-1 flex items-center justify-center gap-2"
          style={{
            backgroundColor: isKnown ? COLORS.accent : COLORS.ink,
            color: isKnown ? COLORS.ink : COLORS.accent,
            border: "1.5px solid #0F0F0F",
            height: 44,
            fontFamily: FONT_SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          <Check size={14} strokeWidth={2.6} />
          {isKnown ? "KNOWN" : "MARK KNOWN"}
        </button>
        <button
          onClick={() => toggleBookmark(word.id)}
          className="flex items-center justify-center"
          style={{
            width: 56,
            border: "1.5px solid #0F0F0F",
            backgroundColor: isSaved ? COLORS.ink : "transparent",
          }}
          aria-label="Bookmark"
        >
          <Bookmark
            size={16}
            color={isSaved ? COLORS.accent : COLORS.ink}
            fill={isSaved ? COLORS.accent : "none"}
          />
        </button>
        <button
          onClick={() => onShare?.(word.id)}
          className="flex items-center justify-center"
          style={{
            width: 56,
            border: "1.5px solid #0F0F0F",
            backgroundColor: "transparent",
          }}
          aria-label="Share"
        >
          <Share2 size={16} color={COLORS.ink} />
        </button>
      </div>
    </div>
  );
}
