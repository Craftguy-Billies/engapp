// WordCard
//
// Faithful port of the Figma "Feed Card Design" Make project, adapted to the
// API shape that BACKEND_INTEGRATION.md spells out. Any field that is
// null/empty (cefrLevel, primaryImage, descriptions, translations, …) is
// hidden gracefully rather than rendered as an empty box.
//
// Gestures:
//   - Drag up  → onSwipeUp        (used as "mark known")
//   - Drag down → onSwipeDown     (used as "back")
//   - Drag left → onSwipeLeft     (used as "skip", optional)
//   - Drag right → onSwipeRight   (used as "bookmark", optional)
//   - Double-click → onDoubleTap (mark known shortcut)
//   - Long-press → onLongPress  (bookmark shortcut)
//   - Single tap → onTap         (used to open detail)

import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronUp,
  Flame,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { COLORS, FONT_SANS, FONT_SERIF_TC, POS_COLOR } from "../_lib/theme";
import { resolveImageUrl } from "../_lib/api";
import type { WordCard as WordCardData } from "../_lib/types";

interface Props {
  data: WordCardData;
  streak: number;
  index?: number;
  total?: number;
  loading?: boolean;
  saved?: boolean;
  known?: boolean;
  showSwipeHint?: boolean;
  onBack?: () => void;
  onTap?: () => void;
  onToggleBookmark?: () => void;
  onMarkKnown?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPlayAudio?: (accent: "us" | "uk") => void;
  /**
   * If provided, the card renders inside an external <motion.div> (e.g. for
   * stack animations); otherwise the gestures are wired locally.
   */
  externalDrag?: boolean;
}

const POS_LABELS: Record<string, string> = {
  n: "noun",
  v: "verb",
  adj: "adjective",
  adv: "adverb",
};

function highlightWord(sentence: string, word: string): ReactNode {
  if (!word) return sentence;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped}\\w*)`, "ig");
  const parts = sentence.split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <span
        key={i}
        style={{ fontWeight: 700, fontStyle: "normal", color: COLORS.ink }}
      >
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function WordCard({
  data,
  streak,
  index = 1,
  total = 100,
  loading = false,
  saved = false,
  known = false,
  showSwipeHint = false,
  onBack,
  onTap,
  onToggleBookmark,
  onMarkKnown,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onPlayAudio,
  externalDrag = false,
}: Props) {
  const [showKnownPing, setShowKnownPing] = useState(false);
  const [audioPulse, setAudioPulse] = useState<"us" | "uk" | null>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (known) {
      setShowKnownPing(true);
      const t = setTimeout(() => setShowKnownPing(false), 650);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [known]);

  const handlePointerDown = (e: React.PointerEvent) => {
    longPressFired.current = false;
    pressStart.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onToggleBookmark?.();
    }, 550);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pressStart.current) return;
    const dx = e.clientX - pressStart.current.x;
    const dy = e.clientY - pressStart.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }
  };
  const clearLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    pressStart.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (longPressFired.current) return;
    e.stopPropagation();
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
      handleDoubleClick();
      return;
    }
    tapTimer.current = setTimeout(() => {
      tapTimer.current = null;
      onTap?.();
    }, 220);
  };

  const handleDoubleClick = () => {
    setShowKnownPing(true);
    setTimeout(() => setShowKnownPing(false), 650);
    onMarkKnown?.();
  };

  const handleAudio = (accent: "us" | "uk") => (e: React.MouseEvent) => {
    e.stopPropagation();
    setAudioPulse(accent);
    setTimeout(() => setAudioPulse(null), 600);
    onPlayAudio?.(accent);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const utter = new SpeechSynthesisUtterance(data.word);
        utter.lang = accent === "us" ? "en-US" : "en-GB";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      } catch {
        // best-effort only
      }
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -50 || info.velocity.y < -250) onSwipeUp?.();
    else if (info.offset.y > 50 || info.velocity.y > 250) onSwipeDown?.();
    else if (info.offset.x < -50 || info.velocity.x < -250) onSwipeLeft?.();
    else if (info.offset.x > 50 || info.velocity.x > 250) onSwipeRight?.();
  };

  const posKey = (data.pos ?? data.posLong ?? "").replace(".", "").toLowerCase();
  const posBg = POS_COLOR[posKey] ?? COLORS.accent;
  const posLabel = data.posLong ?? POS_LABELS[posKey] ?? data.pos ?? "word";

  const snarky = data.descriptions.find(
    (d) => d.tone === "snarky" || d.languageCode === "zh-HK",
  );

  return (
    <motion.div
      className="relative w-full h-full overflow-hidden rounded-[28px] select-none flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
      drag={externalDrag ? false : "y"}
      dragConstraints={externalDrag ? undefined : { top: 0, bottom: 0 }}
      dragElastic={externalDrag ? undefined : 0.2}
      dragMomentum={externalDrag ? undefined : false}
      onDragEnd={externalDrag ? undefined : handleDragEnd}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={clearLongPress}
      onPointerLeave={clearLongPress}
      onPointerCancel={clearLongPress}
    >
      {/* Top bar: back · streak · CEFR · bookmark */}
      <div className="flex-none px-6 pt-5 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                border: "1.5px solid #0F0F0F",
                backgroundColor: "transparent",
              }}
              aria-label="Back"
            >
              <ArrowLeft size={14} color={COLORS.ink} strokeWidth={2.2} />
            </button>
          ) : null}
          <div className="flex items-center gap-1.5">
            <Flame size={14} color={COLORS.ink} fill={COLORS.accent} strokeWidth={2} />
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: COLORS.ink,
              }}
            >
              DAY {String(streak).padStart(3, "0")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data.cefrLevel ? (
            <div
              className="px-2 py-0.5"
              style={{
                backgroundColor: COLORS.accent,
                fontFamily: FONT_SANS,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: COLORS.ink,
              }}
            >
              {data.cefrLevel}
            </div>
          ) : null}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark?.();
            }}
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              backgroundColor: saved ? COLORS.ink : "transparent",
              border: "1.5px solid #0F0F0F",
            }}
            aria-label="Bookmark"
          >
            <Bookmark
              size={13}
              color={saved ? COLORS.accent : COLORS.ink}
              fill={saved ? COLORS.accent : "none"}
              strokeWidth={2.2}
            />
          </button>
        </div>
      </div>

      <div className="flex-none mx-6" style={{ height: 1, backgroundColor: COLORS.hairline }} />

      {/* Headline block */}
      <div className="flex-none px-6 pt-4 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2 py-0.5"
            style={{
              backgroundColor: posBg,
              fontFamily: FONT_SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.4,
              color: COLORS.ink,
              textTransform: "uppercase",
            }}
          >
            {posLabel}
          </span>
          {(data.phoneticsIpa || data.phoneticsKk || data.syllableCount) && (
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.mute,
                letterSpacing: 0.4,
              }}
            >
              {[
                data.phoneticsIpa,
                data.phoneticsKk ? `[${data.phoneticsKk}]` : null,
                data.syllableCount ? `${data.syllableCount} syl` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
          <span
            className="ml-auto"
            style={{
              fontFamily: FONT_SANS,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: COLORS.mute,
            }}
          >
            {String(index).padStart(3, "0")} / {String(total).padStart(3, "0")}
          </span>
        </div>

        {loading ? (
          <div
            className="mt-2"
            style={{ height: 56, backgroundColor: "rgba(15,15,15,0.06)", borderRadius: 4 }}
          />
        ) : (
          <h1
            className="break-words mt-2"
            style={{
              fontFamily: FONT_SANS,
              fontSize: 60,
              fontWeight: 700,
              letterSpacing: "-2.6px",
              lineHeight: 0.95,
              color: COLORS.ink,
            }}
          >
            {data.word}
            <span style={{ color: COLORS.accent }}>.</span>
          </h1>
        )}

        {!loading && (data.translation || (data.translations && Object.keys(data.translations).length > 0)) ? (
          <div className="flex items-center justify-between gap-3 mt-2">
            <div
              style={{
                fontFamily: FONT_SERIF_TC,
                fontSize: 32,
                fontWeight: 600,
                color: COLORS.ink,
                lineHeight: 1.1,
                letterSpacing: 2,
              }}
            >
              {data.translation ?? Object.values(data.translations ?? {})[0]}
            </div>
            <div className="flex items-center gap-1.5 flex-none">
              {(["us", "uk"] as const).map((accent) => {
                const active = audioPulse === accent;
                return (
                  <motion.button
                    key={accent}
                    onClick={handleAudio(accent)}
                    className="flex items-center gap-1 px-2"
                    style={{
                      height: 26,
                      backgroundColor: active ? COLORS.ink : "transparent",
                      border: "1.5px solid #0F0F0F",
                    }}
                    animate={
                      active
                        ? {
                            boxShadow: [
                              "0 0 0 0 rgba(212,255,61,0.6)",
                              "0 0 0 12px rgba(212,255,61,0)",
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 0.6 }}
                    aria-label={`${accent.toUpperCase()} accent`}
                  >
                    <Volume2 size={11} color={active ? COLORS.accent : COLORS.ink} strokeWidth={2.4} />
                    <span
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 1.2,
                        color: active ? COLORS.accent : COLORS.ink,
                      }}
                    >
                      {accent.toUpperCase()}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Image */}
      <div className="flex-none px-6 pb-3">
        <div
          className="relative overflow-hidden w-full"
          style={{ aspectRatio: "16 / 9", backgroundColor: COLORS.ink }}
        >
          {loading ? (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(110deg, #0F0F0F 30%, #2A2A2A 50%, #0F0F0F 70%)",
                backgroundSize: "200% 100%",
              }}
              animate={{ backgroundPosition: ["100% 0", "-100% 0"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
            />
          ) : data.primaryImage ? (
            <img
              src={resolveImageUrl(data.primaryImage.imageUrl)}
              alt={data.word}
              className="w-full h-full object-cover"
              style={{ filter: "contrast(1.05) saturate(0.85)" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background:
                  "repeating-linear-gradient(45deg, #1A1A1A 0, #1A1A1A 8px, #0F0F0F 8px, #0F0F0F 16px)",
                color: COLORS.accent,
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              IMAGE NOT READY
            </div>
          )}
        </div>
      </div>

      {/* Definition + example + snarky */}
      <div className="flex-1 min-h-0 px-6 pt-2 pb-16 flex flex-col gap-3 overflow-y-auto">
        {data.definitionEn ? (
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 14,
              color: COLORS.ink,
              lineHeight: 1.5,
            }}
          >
            {data.definitionEn}
          </p>
        ) : null}
        {data.exampleSentence ? (
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 14,
              fontStyle: "italic",
              color: COLORS.ink,
              lineHeight: 1.45,
            }}
          >
            {highlightWord(data.exampleSentence, data.word)}
          </p>
        ) : null}
        {snarky ? (
          <p
            style={{
              fontFamily: FONT_SERIF_TC,
              fontSize: 15,
              fontWeight: 500,
              fontStyle: "italic",
              color: COLORS.ink,
              lineHeight: 1.45,
            }}
          >
            {snarky.text}
          </p>
        ) : null}
        {(data.themeTags && data.themeTags.length > 0) ||
        (data.examTags && data.examTags.length > 0) ||
        (data.sourceLists && data.sourceLists.length > 0) ? (
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {(data.themeTags ?? []).map((t) => (
              <span
                key={`th-${t}`}
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  color: COLORS.ink,
                  border: "1px solid #0F0F0F",
                  padding: "2px 6px",
                  textTransform: "uppercase",
                }}
              >
                {t}
              </span>
            ))}
            {(data.examTags ?? []).map((t) => (
              <span
                key={`ex-${t}`}
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  color: COLORS.ink,
                  backgroundColor: COLORS.accent,
                  padding: "2px 6px",
                  textTransform: "uppercase",
                }}
              >
                {t}
              </span>
            ))}
            {(data.sourceLists ?? []).map((s) => (
              <span
                key={`src-${s}`}
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  color: COLORS.mute,
                  border: "1px dashed #888",
                  padding: "2px 6px",
                  textTransform: "uppercase",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Right-edge swipe hint */}
      <AnimatePresence>
        {showSwipeHint ? (
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5, y: [-4, 4, -4] }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.4 },
              y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <ChevronUp size={18} color={COLORS.ink} strokeWidth={2.4} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showKnownPing ? (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, times: [0, 0.45, 1] }}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: 96, height: 96, backgroundColor: COLORS.accent }}
            >
              <Check size={56} color={COLORS.ink} strokeWidth={3} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {known && !showKnownPing ? (
        <div
          className="absolute inset-0 pointer-events-none rounded-[28px]"
          style={{ boxShadow: `inset 0 0 0 2px ${COLORS.accent}` }}
        />
      ) : null}
    </motion.div>
  );
}
