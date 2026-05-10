// 17. Share Card Preview
//
// Pure client-side render — backend share endpoint is future work. Three
// layout variants ride on the same brutalist palette.

import { Download, Share2 } from "lucide-react";
import { useState } from "react";
import { resolveImageUrl } from "../_lib/api";
import { ButtonChunk, Eyebrow, Pill } from "../_components/primitives";
import { PageHeader } from "../_components/page-header";
import { COLORS, FONT_SANS, FONT_SERIF_TC } from "../_lib/theme";
import { useEngapp } from "../_lib/store";
import type { WordCard as WordCardData } from "../_lib/types";

type Variant = "focus" | "snarky" | "streak";

interface Props {
  wordId?: number;
  onBack?: () => void;
}

export function SharePreviewPage({ wordId, onBack }: Props) {
  const { feed, stats, user } = useEngapp();
  const word: WordCardData = (wordId != null && feed.find((w) => w.id === wordId)) || feed[0];
  const [variant, setVariant] = useState<Variant>("focus");

  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader title="SHARE" subtitle="Pick a layout" onBack={onBack} />

      <div className="flex-1 min-h-0 overflow-y-auto pb-28">
        <div className="px-5 pt-4">
          <ShareCanvas word={word} variant={variant} streak={user.discoveryStreakDays} todayCount={stats.todayCount} dailyGoal={stats.dailyGoal} />
        </div>

        <div className="px-5 pt-4">
          <Eyebrow color={COLORS.mute}>LAYOUT</Eyebrow>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(["focus", "snarky", "streak"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className="py-2"
                style={{
                  border: "1.5px solid #0F0F0F",
                  backgroundColor: variant === v ? COLORS.accent : "transparent",
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  color: COLORS.ink,
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 px-4 py-3 flex gap-2"
        style={{ backgroundColor: COLORS.card, borderTop: "1.5px solid #0F0F0F" }}
      >
        <ButtonChunk filled style={{ flex: 1, height: 44 }}>
          <span className="inline-flex items-center justify-center gap-2 w-full">
            <Share2 size={14} color={COLORS.accent} /> SHARE
          </span>
        </ButtonChunk>
        <ButtonChunk style={{ width: 56, height: 44 }}>
          <Download size={14} color={COLORS.ink} />
        </ButtonChunk>
      </div>
    </div>
  );
}

function ShareCanvas({
  word,
  variant,
  streak,
  todayCount,
  dailyGoal,
}: {
  word: WordCardData;
  variant: Variant;
  streak: number;
  todayCount: number;
  dailyGoal: number;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        aspectRatio: "4 / 5",
        backgroundColor: COLORS.card,
        border: "1.5px solid #0F0F0F",
      }}
    >
      {variant === "focus" ? (
        <FocusVariant word={word} />
      ) : variant === "snarky" ? (
        <SnarkyVariant word={word} />
      ) : (
        <StreakVariant streak={streak} todayCount={todayCount} dailyGoal={dailyGoal} word={word} />
      )}
      <div
        className="absolute left-3 bottom-2"
        style={{
          fontFamily: FONT_SANS,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1.4,
          color: COLORS.ink,
          textTransform: "uppercase",
        }}
      >
        eng字 · /{word.id}
      </div>
    </div>
  );
}

function FocusVariant({ word }: { word: WordCardData }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      {word.primaryImage ? (
        <img
          src={resolveImageUrl(word.primaryImage.imageUrl)}
          alt={word.word}
          className="w-full h-3/5 object-cover"
          style={{ filter: "contrast(1.05) saturate(0.85)" }}
        />
      ) : (
        <div
          className="w-full h-3/5"
          style={{
            background:
              "repeating-linear-gradient(45deg, #1A1A1A 0, #1A1A1A 8px, #0F0F0F 8px, #0F0F0F 16px)",
          }}
        />
      )}
      <div className="p-4 flex-1 flex flex-col justify-end" style={{ backgroundColor: COLORS.card }}>
        <h1
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
        {word.translation ? (
          <div
            className="mt-1"
            style={{
              fontFamily: FONT_SERIF_TC,
              fontSize: 26,
              fontWeight: 600,
              color: COLORS.ink,
              letterSpacing: 2,
            }}
          >
            {word.translation}
          </div>
        ) : null}
        {word.cefrLevel ? (
          <div className="mt-2">
            <Pill bg={COLORS.accent} border>
              {word.cefrLevel}
            </Pill>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SnarkyVariant({ word }: { word: WordCardData }) {
  const snarky = word.descriptions.find((d) => d.tone === "snarky" || d.languageCode === "zh-HK");
  return (
    <div className="absolute inset-0 flex flex-col p-5" style={{ backgroundColor: COLORS.ink }}>
      <Eyebrow color={COLORS.accent}>SNARKY · {word.cefrLevel ?? "—"}</Eyebrow>
      <h1
        className="mt-2"
        style={{
          fontFamily: FONT_SANS,
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: -2.6,
          lineHeight: 0.95,
          color: COLORS.accent,
        }}
      >
        {word.word}
        <span style={{ color: "#FFF" }}>.</span>
      </h1>
      <div
        className="mt-1"
        style={{
          fontFamily: FONT_SERIF_TC,
          fontSize: 30,
          fontWeight: 600,
          color: "#FFF",
          letterSpacing: 2,
        }}
      >
        {word.translation ?? "—"}
      </div>
      <p
        className="mt-auto"
        style={{
          fontFamily: FONT_SERIF_TC,
          fontSize: 18,
          fontStyle: "italic",
          color: "#FFF",
          lineHeight: 1.5,
        }}
      >
        {snarky?.text ?? "（諷刺嘅注釋仲未準備好。）"}
      </p>
    </div>
  );
}

function StreakVariant({
  word,
  streak,
  todayCount,
  dailyGoal,
}: {
  word: WordCardData;
  streak: number;
  todayCount: number;
  dailyGoal: number;
}) {
  return (
    <div className="absolute inset-0 flex flex-col p-5" style={{ backgroundColor: COLORS.accent }}>
      <Eyebrow>STREAK MILESTONE</Eyebrow>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: -4,
          lineHeight: 1,
          color: COLORS.ink,
        }}
      >
        {streak}
      </div>
      <div
        className="-mt-1"
        style={{
          fontFamily: FONT_SANS,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 1.4,
          color: COLORS.ink,
          textTransform: "uppercase",
        }}
      >
        Consecutive days
      </div>
      <div
        className="mt-auto"
        style={{
          fontFamily: FONT_SERIF_TC,
          fontSize: 16,
          fontWeight: 600,
          color: COLORS.ink,
          letterSpacing: 1.2,
        }}
      >
        今日學咗 {todayCount}/{dailyGoal} 個字
      </div>
      <div
        className="mt-1"
        style={{
          fontFamily: FONT_SANS,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.4,
          color: COLORS.ink,
        }}
      >
        TODAY · {word.word.toUpperCase()}
      </div>
    </div>
  );
}
