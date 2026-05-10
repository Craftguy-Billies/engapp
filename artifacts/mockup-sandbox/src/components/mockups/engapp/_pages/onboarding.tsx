// 2-5. Onboarding flow: Language → Exam goal → Daily goal → Style picker.
//
// Each step shares a chrome with eyebrow, big headline, one or two columns of
// option cards, and a sticky CTA. Selections call `PATCH /api/user/me`
// optimistically through the store.

import { ChevronRight, Lock } from "lucide-react";
import { useState } from "react";
import { resolveImageUrl } from "../_lib/api";
import { ButtonChunk, Eyebrow, Hairline } from "../_components/primitives";
import {
  COLORS,
  DAILY_GOAL_OPTIONS,
  FONT_SANS,
  FONT_SERIF_TC,
  LANGUAGES,
  LEARNING_GOALS,
} from "../_lib/theme";
import { useEngapp } from "../_lib/store";
import type { AppUser } from "../_lib/types";

type StepKey = "language" | "exam" | "daily" | "style";

interface Props {
  step: StepKey;
  onNext?: () => void;
  onBack?: () => void;
  /** Called when the user finishes the entire onboarding flow. */
  onFinish?: () => void;
}

export function OnboardingPage({ step, onNext, onBack, onFinish }: Props) {
  if (step === "language") return <Language onNext={onNext} onBack={onBack} />;
  if (step === "exam") return <Exam onNext={onNext} onBack={onBack} />;
  if (step === "daily") return <Daily onNext={onNext} onBack={onBack} />;
  return <StylePicker onFinish={onFinish} onBack={onBack} />;
}

function Shell({
  children,
  step,
  total,
  next,
  nextLabel = "NEXT",
  back,
  disabled,
}: {
  children: React.ReactNode;
  step: number;
  total: number;
  next?: () => void;
  nextLabel?: string;
  back?: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <div className="flex-none px-6 pt-5 pb-3 flex items-center justify-between">
        <Eyebrow color={COLORS.mute}>STEP {step} / {total}</Eyebrow>
        {back ? (
          <button
            onClick={back}
            style={{
              fontFamily: FONT_SANS,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.4,
              color: COLORS.mute,
              textTransform: "uppercase",
            }}
          >
            BACK
          </button>
        ) : null}
      </div>
      <Hairline style={{ marginInline: 24 }} />
      <div className="flex-1 min-h-0 px-6 pt-5 pb-4 overflow-y-auto">{children}</div>
      <div className="flex-none px-6 pb-6 pt-2">
        <ButtonChunk
          filled
          disabled={disabled}
          onClick={next}
          style={{ width: "100%", height: 48, fontSize: 12 }}
        >
          <span className="inline-flex items-center justify-center gap-2 w-full">
            {nextLabel}
            <ChevronRight size={14} color={COLORS.accent} strokeWidth={2.4} />
          </span>
        </ButtonChunk>
      </div>
    </div>
  );
}

function Language({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) {
  const { user, patchUser } = useEngapp();
  const [pick, setPick] = useState<string>(user.uiLanguage ?? "zh-TW");
  return (
    <Shell
      step={1}
      total={4}
      back={onBack}
      next={() => {
        patchUser({ uiLanguage: pick } as Partial<AppUser>);
        onNext?.();
      }}
    >
      <h1
        style={{
          fontFamily: FONT_SANS,
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: -1.6,
          lineHeight: 1.0,
          color: COLORS.ink,
        }}
      >
        Pick your reading language<span style={{ color: COLORS.accent }}>.</span>
      </h1>
      <p
        className="mt-2"
        style={{
          fontFamily: FONT_SERIF_TC,
          fontSize: 16,
          color: COLORS.ink,
          letterSpacing: 1,
        }}
      >
        翻譯與例句會以你揀嘅語言顯示。
      </p>
      <div className="mt-6 grid gap-2">
        {LANGUAGES.map((l) => {
          const selected = pick === l.code;
          return (
            <button
              key={l.code}
              onClick={() => setPick(l.code)}
              className="flex items-center justify-between px-4 py-3"
              style={{
                border: "1.5px solid #0F0F0F",
                backgroundColor: selected ? COLORS.ink : "transparent",
                color: selected ? COLORS.accent : COLORS.ink,
              }}
            >
              <div className="flex flex-col items-start">
                <span
                  style={{
                    fontFamily: FONT_SERIF_TC,
                    fontSize: 18,
                    fontWeight: 600,
                    color: selected ? COLORS.accent : COLORS.ink,
                  }}
                >
                  {l.label}
                </span>
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1.4,
                    color: selected ? COLORS.accent : COLORS.mute,
                    textTransform: "uppercase",
                  }}
                >
                  {l.english}
                </span>
              </div>
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  color: selected ? COLORS.accent : COLORS.mute,
                }}
              >
                {l.code}
              </span>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function Exam({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) {
  const { user, patchUser } = useEngapp();
  const [pick, setPick] = useState<AppUser["learningGoal"]>(user.learningGoal ?? "casual");
  const [date, setDate] = useState<string>(user.examDate ?? "");
  return (
    <Shell
      step={2}
      total={4}
      back={onBack}
      next={() => {
        patchUser({ learningGoal: pick, examDate: date || null } as Partial<AppUser>);
        onNext?.();
      }}
    >
      <h1
        style={{
          fontFamily: FONT_SANS,
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: -1.6,
          lineHeight: 1.0,
          color: COLORS.ink,
        }}
      >
        What's the goal<span style={{ color: COLORS.accent }}>?</span>
      </h1>
      <p
        className="mt-2"
        style={{
          fontFamily: FONT_SERIF_TC,
          fontSize: 16,
          color: COLORS.ink,
          letterSpacing: 1,
        }}
      >
        Casual = no pressure. 揀考試會幫你過濾單字。
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2">
        {LEARNING_GOALS.map((g) => {
          const selected = pick === g.code;
          return (
            <button
              key={g.code}
              onClick={() => setPick(g.code as AppUser["learningGoal"])}
              className="flex flex-col items-start px-4 py-4"
              style={{
                border: "1.5px solid #0F0F0F",
                backgroundColor: selected ? COLORS.ink : "transparent",
                color: selected ? COLORS.accent : COLORS.ink,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: -0.6,
                  color: selected ? COLORS.accent : COLORS.ink,
                }}
              >
                {g.label}
              </span>
              <span
                className="mt-1"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  color: selected ? COLORS.accent : COLORS.mute,
                }}
              >
                {g.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {pick !== "casual" ? (
        <div className="mt-5">
          <Eyebrow color={COLORS.mute}>EXAM DATE · OPTIONAL</Eyebrow>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mt-2 px-3 py-2"
            style={{
              border: "1.5px solid #0F0F0F",
              backgroundColor: "transparent",
              fontFamily: FONT_SANS,
              fontSize: 14,
              color: COLORS.ink,
            }}
          />
        </div>
      ) : null}
    </Shell>
  );
}

function Daily({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) {
  const { user, patchUser } = useEngapp();
  const [pick, setPick] = useState<number>(user.dailyGoal || 5);
  return (
    <Shell
      step={3}
      total={4}
      back={onBack}
      next={() => {
        patchUser({ dailyGoal: pick });
        onNext?.();
      }}
    >
      <h1
        style={{
          fontFamily: FONT_SANS,
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: -1.6,
          lineHeight: 1.0,
          color: COLORS.ink,
        }}
      >
        How many words a day<span style={{ color: COLORS.accent }}>?</span>
      </h1>
      <p
        className="mt-2"
        style={{
          fontFamily: FONT_SERIF_TC,
          fontSize: 16,
          color: COLORS.ink,
          letterSpacing: 1,
        }}
      >
        小數目易堅持，大數目易斷氣。
      </p>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {DAILY_GOAL_OPTIONS.map((n) => {
          const selected = pick === n;
          return (
            <button
              key={n}
              onClick={() => setPick(n)}
              className="px-2 py-6 flex flex-col items-center"
              style={{
                border: "1.5px solid #0F0F0F",
                backgroundColor: selected ? COLORS.accent : "transparent",
                color: COLORS.ink,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 36,
                  fontWeight: 700,
                  letterSpacing: -1.4,
                }}
              >
                {n}
              </span>
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  color: COLORS.ink,
                }}
              >
                /day
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 px-4 py-3" style={{ border: "1px dashed #0F0F0F" }}>
        <Eyebrow color={COLORS.mute}>PROJECTED</Eyebrow>
        <div
          className="mt-1"
          style={{
            fontFamily: FONT_SANS,
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.ink,
          }}
        >
          {pick * 30} words / 30 days · {pick * 90} words / 90 days
        </div>
      </div>
    </Shell>
  );
}

function StylePicker({ onFinish, onBack }: { onFinish?: () => void; onBack?: () => void }) {
  const { styles, user, patchUser } = useEngapp();
  const [pick, setPick] = useState<number>(user.preferredStyleId ?? styles.find((s) => s.isFree)?.id ?? 1);
  const isPremium = (id: number) => !styles.find((s) => s.id === id)?.isFree;

  return (
    <Shell
      step={4}
      total={4}
      back={onBack}
      nextLabel="START"
      next={() => {
        if (isPremium(pick)) return; // free flow only — premium routes to paywall in the integrated app
        patchUser({ preferredStyleId: pick });
        onFinish?.();
      }}
      disabled={isPremium(pick)}
    >
      <h1
        style={{
          fontFamily: FONT_SANS,
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: -1.6,
          lineHeight: 1.0,
          color: COLORS.ink,
        }}
      >
        Pick a style<span style={{ color: COLORS.accent }}>.</span>
      </h1>
      <p
        className="mt-2"
        style={{
          fontFamily: FONT_SERIF_TC,
          fontSize: 16,
          color: COLORS.ink,
          letterSpacing: 1,
        }}
      >
        每張卡都會用呢個風格畫插圖。
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {styles.map((s) => {
          const selected = pick === s.id;
          const locked = !s.isFree;
          return (
            <button
              key={s.id}
              onClick={() => setPick(s.id)}
              className="text-left flex flex-col"
              style={{
                border: "1.5px solid #0F0F0F",
                backgroundColor: selected ? COLORS.accent : COLORS.cardAlt,
                aspectRatio: "1 / 1",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {s.exampleImageUrl ? (
                <img
                  src={resolveImageUrl(s.exampleImageUrl)}
                  alt={s.displayName}
                  className="w-full h-full object-cover absolute inset-0"
                  style={{ filter: locked ? "blur(2px) grayscale(0.4)" : "none" }}
                />
              ) : null}
              <div className="absolute inset-0 flex flex-col justify-end p-3"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(15,15,15,0.6) 100%)",
                }}>
                <div
                  className="flex items-center gap-1"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 1.4,
                    color: locked ? COLORS.accent : COLORS.accent,
                    textTransform: "uppercase",
                  }}
                >
                  {locked ? <Lock size={10} color={COLORS.accent} /> : null}
                  {locked ? "PREMIUM" : "FREE"}
                </div>
                <div
                  className="mt-1"
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: -0.4,
                    color: "#FFF",
                  }}
                >
                  {s.displayName}
                </div>
                {s.description ? (
                  <div
                    className="mt-0.5"
                    style={{
                      fontFamily: FONT_SERIF_TC,
                      fontSize: 11,
                      color: "rgba(255,255,255,0.85)",
                      letterSpacing: 0.6,
                    }}
                  >
                    {s.description}
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}
