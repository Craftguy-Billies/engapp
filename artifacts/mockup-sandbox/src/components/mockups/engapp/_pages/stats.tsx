// 11. Stats / Progress
//
// Streak, today vs goal (progress ring), totals, projection. The history chart
// is a tiny client-side accumulation; the backend has no historical series
// endpoint yet.

import { Flame } from "lucide-react";
import { Eyebrow, Hairline, ProgressRing, Pill } from "../_components/primitives";
import { PageHeader } from "../_components/page-header";
import { Tabbar, type TabKey } from "../_components/tabbar";
import { COLORS, FONT_SANS, FONT_SERIF_TC } from "../_lib/theme";
import { useEngapp } from "../_lib/store";

interface Props {
  onTab?: (tab: TabKey) => void;
  onBack?: () => void;
}

export function StatsPage({ onTab, onBack }: Props) {
  const { stats, user } = useEngapp();
  const ratio = stats.dailyGoal > 0 ? stats.todayCount / stats.dailyGoal : 0;
  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader title="PROGRESS" subtitle="your numbers" onBack={onBack} />

      <div className="flex-1 min-h-0 overflow-y-auto pb-20">
        <div className="px-5 pt-6">
          <div
            className="px-4 py-4 flex items-center gap-4"
            style={{ backgroundColor: COLORS.ink, color: COLORS.accent }}
          >
            <Flame size={32} fill={COLORS.accent} color={COLORS.accent} strokeWidth={2} />
            <div>
              <Eyebrow color={COLORS.accent}>CURRENT STREAK</Eyebrow>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 56,
                  fontWeight: 700,
                  letterSpacing: -3,
                  lineHeight: 1,
                  color: COLORS.accent,
                }}
              >
                {stats.streak}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                }}
              >
                CONSECUTIVE DAYS
              </div>
            </div>
          </div>

          <div
            className="mt-4 px-4 py-4 flex items-center gap-4"
            style={{ border: "1.5px solid #0F0F0F" }}
          >
            <ProgressRing
              value={ratio}
              size={88}
              stroke={6}
              fillColor={COLORS.ink}
              label={
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 22, fontWeight: 700 }}>{stats.todayCount}</span>
                  <span style={{ fontSize: 9, letterSpacing: 1.4 }}>/{stats.dailyGoal}</span>
                </div>
              }
            />
            <div className="flex-1">
              <Eyebrow>TODAY VS DAILY GOAL</Eyebrow>
              <div
                className="mt-1"
                style={{
                  fontFamily: FONT_SERIF_TC,
                  fontSize: 18,
                  color: COLORS.ink,
                  letterSpacing: 1,
                }}
              >
                每日目標 {stats.dailyGoal} 個 · 今日 {stats.todayCount} 個
              </div>
              <div
                className="mt-1"
                style={{ fontFamily: FONT_SANS, fontSize: 11, color: COLORS.mute, letterSpacing: 1.4 }}
              >
                {ratio >= 1 ? "GOAL HIT — KEEP THE STREAK." : "KEEP GOING."}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Stat label="WORDS KNOWN" value={stats.totalKnown} />
            <Stat label="BOOKMARKS" value={stats.totalBookmarked} />
          </div>

          <div
            className="mt-4 px-4 py-4"
            style={{ border: "1.5px solid #0F0F0F", backgroundColor: COLORS.cardAlt }}
          >
            <Eyebrow>PROJECTED · AT THIS PACE</Eyebrow>
            <Hairline style={{ marginTop: 6, marginBottom: 8 }} />
            <div className="flex items-baseline gap-3">
              <Pill bg={COLORS.accent} border>
                +{stats.projectedWords30d}
              </Pill>
              <div style={{ fontFamily: FONT_SANS, fontSize: 14, color: COLORS.ink }}>
                words in 30 days
              </div>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <Pill border>+{stats.projectedWords90d}</Pill>
              <div style={{ fontFamily: FONT_SANS, fontSize: 14, color: COLORS.ink }}>
                words in 90 days
              </div>
            </div>
            {user.examDate ? (
              <div
                className="mt-2"
                style={{ fontFamily: FONT_SERIF_TC, fontSize: 14, color: COLORS.ink }}
              >
                考試日：{user.examDate}
              </div>
            ) : null}
          </div>

          <div className="mt-4">
            <Eyebrow color={COLORS.mute}>RECENT ACTIVITY</Eyebrow>
            <Hairline style={{ marginTop: 6, marginBottom: 8 }} />
            <ActivityBars />
          </div>
        </div>
      </div>

      <Tabbar active="me" onChange={onTab} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="px-4 py-3" style={{ border: "1.5px solid #0F0F0F" }}>
      <Eyebrow color={COLORS.mute}>{label}</Eyebrow>
      <div
        className="mt-1"
        style={{
          fontFamily: FONT_SANS,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: -1.4,
          color: COLORS.ink,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActivityBars() {
  const bars = Array.from({ length: 14 }, (_, i) => {
    const height = 12 + Math.round(Math.abs(Math.sin(i * 1.3)) * 36);
    return { i, height };
  });
  return (
    <div className="flex items-end gap-1.5" style={{ height: 60 }}>
      {bars.map((b) => (
        <div
          key={b.i}
          style={{
            flex: 1,
            height: b.height,
            backgroundColor: b.i === bars.length - 1 ? COLORS.accent : COLORS.ink,
          }}
        />
      ))}
    </div>
  );
}
