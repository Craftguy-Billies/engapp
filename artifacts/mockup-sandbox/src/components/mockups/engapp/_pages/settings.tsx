// 13. Settings — UI mirrors the brutalist editorial language: each row is a
// hairline rectangle with eyebrow label + value; tapping the row reveals the
// expanded picker inline. All changes call PATCH /api/user/me through the
// store (debounced via the optimistic update — backend-side debouncing will be
// handled later).

import { useState } from "react";
import { Eyebrow, Hairline } from "../_components/primitives";
import { PageHeader } from "../_components/page-header";
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

interface Props {
  onBack?: () => void;
  onOpenStylePicker?: () => void;
}

export function SettingsPage({ onBack, onOpenStylePicker }: Props) {
  const { user, patchUser, styles } = useEngapp();
  const [open, setOpen] = useState<string | null>(null);

  const styleName = styles.find((s) => s.id === user.preferredStyleId)?.displayName ?? "Default";
  const langLabel = LANGUAGES.find((l) => l.code === user.uiLanguage)?.label ?? user.uiLanguage;
  const goalLabel = LEARNING_GOALS.find((g) => g.code === user.learningGoal)?.label ?? user.learningGoal;

  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader title="SETTINGS" onBack={onBack} />
      <div className="flex-1 min-h-0 overflow-y-auto pb-10">
        <div className="px-5 pt-4">
          <Eyebrow color={COLORS.mute}>PREFERENCES</Eyebrow>
          <Hairline style={{ marginTop: 6, marginBottom: 10 }} />

          <Row
            label="UI LANGUAGE"
            value={langLabel}
            onClick={() => setOpen(open === "lang" ? null : "lang")}
          >
            {open === "lang" ? (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {LANGUAGES.map((l) => {
                  const active = l.code === user.uiLanguage;
                  return (
                    <button
                      key={l.code}
                      className="px-3 py-2 text-left"
                      style={{
                        border: "1.5px solid #0F0F0F",
                        backgroundColor: active ? COLORS.ink : "transparent",
                        color: active ? COLORS.accent : COLORS.ink,
                      }}
                      onClick={() => {
                        patchUser({ uiLanguage: l.code } as Partial<AppUser>);
                        setOpen(null);
                      }}
                    >
                      <div style={{ fontFamily: FONT_SERIF_TC, fontSize: 14, fontWeight: 600 }}>
                        {l.label}
                      </div>
                      <div style={{ fontSize: 9, letterSpacing: 1.4, color: active ? COLORS.accent : COLORS.mute }}>
                        {l.english}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </Row>

          <Row
            label="DAILY GOAL"
            value={`${user.dailyGoal} words`}
            onClick={() => setOpen(open === "daily" ? null : "daily")}
          >
            {open === "daily" ? (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {DAILY_GOAL_OPTIONS.map((n) => {
                  const active = n === user.dailyGoal;
                  return (
                    <button
                      key={n}
                      className="py-3"
                      style={{
                        border: "1.5px solid #0F0F0F",
                        backgroundColor: active ? COLORS.accent : "transparent",
                        fontFamily: FONT_SANS,
                        fontSize: 18,
                        fontWeight: 700,
                        letterSpacing: -0.4,
                        color: COLORS.ink,
                      }}
                      onClick={() => {
                        patchUser({ dailyGoal: n });
                        setOpen(null);
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </Row>

          <Row
            label="LEARNING GOAL"
            value={goalLabel}
            onClick={() => setOpen(open === "goal" ? null : "goal")}
          >
            {open === "goal" ? (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {LEARNING_GOALS.map((g) => {
                  const active = g.code === user.learningGoal;
                  return (
                    <button
                      key={g.code}
                      className="px-3 py-2 text-left"
                      style={{
                        border: "1.5px solid #0F0F0F",
                        backgroundColor: active ? COLORS.ink : "transparent",
                        color: active ? COLORS.accent : COLORS.ink,
                      }}
                      onClick={() => {
                        patchUser({ learningGoal: g.code as AppUser["learningGoal"] });
                        setOpen(null);
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>{g.label}</div>
                      <div
                        style={{
                          fontSize: 9,
                          letterSpacing: 1.4,
                          color: active ? COLORS.accent : COLORS.mute,
                        }}
                      >
                        {g.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </Row>

          <Row label="EXAM DATE" value={user.examDate ?? "—"} onClick={() => setOpen(open === "exam" ? null : "exam")}>
            {open === "exam" ? (
              <input
                type="date"
                value={user.examDate ?? ""}
                onChange={(e) => patchUser({ examDate: e.target.value || null } as Partial<AppUser>)}
                className="w-full mt-3 px-3 py-2"
                style={{
                  border: "1.5px solid #0F0F0F",
                  backgroundColor: "transparent",
                  fontFamily: FONT_SANS,
                  fontSize: 14,
                  color: COLORS.ink,
                }}
              />
            ) : null}
          </Row>

          <Row label="ILLUSTRATION STYLE" value={styleName} onClick={onOpenStylePicker} />

          <Row label="TTS ACCENT" value={user.preferredTtsAccent} onClick={() => setOpen(open === "tts" ? null : "tts")}>
            {open === "tts" ? (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {(["en-US", "en-GB"] as const).map((acc) => {
                  const active = acc === user.preferredTtsAccent;
                  return (
                    <button
                      key={acc}
                      className="py-3"
                      style={{
                        border: "1.5px solid #0F0F0F",
                        backgroundColor: active ? COLORS.ink : "transparent",
                        color: active ? COLORS.accent : COLORS.ink,
                        fontFamily: FONT_SANS,
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: 1.2,
                      }}
                      onClick={() => {
                        patchUser({ preferredTtsAccent: acc });
                        setOpen(null);
                      }}
                    >
                      {acc.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </Row>
        </div>

        <div className="px-5 pt-6">
          <Eyebrow color={COLORS.mute}>ABOUT</Eyebrow>
          <Hairline style={{ marginTop: 6, marginBottom: 10 }} />
          <RowStatic label="VERSION" value="0.1.0" />
          <RowStatic label="LICENSES" value="Open source" />
          <RowStatic label="DEVICE ID" value={user.deviceId ?? "—"} mono />
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  onClick,
  children,
}: {
  label: string;
  value: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3" style={{ border: "1.5px solid #0F0F0F", marginBottom: 8 }}>
      <button onClick={onClick} className="w-full flex items-center justify-between text-left">
        <div>
          <Eyebrow color={COLORS.mute}>{label}</Eyebrow>
          <div
            className="mt-1"
            style={{
              fontFamily: FONT_SANS,
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.ink,
              letterSpacing: -0.2,
            }}
          >
            {value}
          </div>
        </div>
        <span style={{ fontFamily: FONT_SANS, fontSize: 18, color: COLORS.ink }}>›</span>
      </button>
      {children}
    </div>
  );
}

function RowStatic({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="px-4 py-3" style={{ border: "1.5px solid #0F0F0F", marginBottom: 8 }}>
      <Eyebrow color={COLORS.mute}>{label}</Eyebrow>
      <div
        className="mt-1"
        style={{
          fontFamily: mono ? "ui-monospace, SFMono-Regular, monospace" : FONT_SANS,
          fontSize: mono ? 12 : 14,
          fontWeight: mono ? 500 : 700,
          color: COLORS.ink,
          letterSpacing: mono ? 0.5 : -0.2,
          wordBreak: "break-all",
        }}
      >
        {value}
      </div>
    </div>
  );
}
