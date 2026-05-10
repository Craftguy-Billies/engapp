// 12. Profile — small dashboard tying together user info + stats with quick
// jumps to other sections.

import { Bookmark, Check, Crown, Settings, Sparkles, UserPlus } from "lucide-react";
import { ButtonChunk, Eyebrow, Hairline, Pill } from "../_components/primitives";
import { PageHeader } from "../_components/page-header";
import { Tabbar, type TabKey } from "../_components/tabbar";
import { COLORS, FONT_SANS, FONT_SERIF_TC, LEARNING_GOALS } from "../_lib/theme";
import { useEngapp } from "../_lib/store";

interface Props {
  onTab?: (tab: TabKey) => void;
  onBack?: () => void;
  onSettings?: () => void;
  onSignIn?: () => void;
  onPaywall?: () => void;
  onBookmarks?: () => void;
  onKnown?: () => void;
  onStats?: () => void;
}

export function ProfilePage({
  onTab,
  onBack,
  onSettings,
  onSignIn,
  onPaywall,
  onBookmarks,
  onKnown,
  onStats,
}: Props) {
  const { user, stats } = useEngapp();
  const goalLabel =
    LEARNING_GOALS.find((g) => g.code === user.learningGoal)?.label ?? "Casual";
  const isPremium = user.premiumUntil ? new Date(user.premiumUntil) > new Date() : false;

  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader title="ME" onBack={onBack} right={<button onClick={onSettings}><Settings size={16} color={COLORS.ink} /></button>} />
      <div className="flex-1 min-h-0 overflow-y-auto pb-20">
        <div className="px-5 pt-6">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center"
              style={{
                width: 64,
                height: 64,
                backgroundColor: COLORS.ink,
                color: COLORS.accent,
                fontFamily: FONT_SANS,
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: -1,
              }}
            >
              {(user.deviceId ?? "guest").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: -0.6,
                  color: COLORS.ink,
                }}
              >
                Guest reader
              </div>
              <div
                className="truncate"
                style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: 1.2, color: COLORS.mute }}
              >
                DEVICE · {(user.deviceId ?? "—").slice(0, 12)}
              </div>
              <div className="flex gap-1.5 mt-1">
                <Pill bg={COLORS.accent} border>
                  {goalLabel}
                </Pill>
                <Pill border>{user.uiLanguage}</Pill>
                {isPremium ? (
                  <Pill bg={COLORS.ink} color={COLORS.accent} border>
                    PREMIUM
                  </Pill>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <NumStat label="STREAK" value={stats.streak} icon={<Sparkles size={12} color={COLORS.ink} />} />
            <NumStat label="KNOWN" value={stats.totalKnown} icon={<Check size={12} color={COLORS.ink} />} />
            <NumStat label="SAVED" value={stats.totalBookmarked} icon={<Bookmark size={12} color={COLORS.ink} />} />
          </div>

          <div
            className="mt-5 px-4 py-3"
            style={{ border: "1.5px solid #0F0F0F", backgroundColor: COLORS.cardAlt }}
          >
            <Eyebrow color={COLORS.mute}>ACHIEVEMENTS · COMING SOON</Eyebrow>
            <Hairline style={{ marginTop: 6, marginBottom: 8 }} />
            <div className="flex gap-2">
              {["7-day", "30-day", "first-100"].map((b) => (
                <div
                  key={b}
                  className="flex-1 flex flex-col items-center justify-center py-2"
                  style={{ border: "1px dashed #0F0F0F" }}
                >
                  <Crown size={14} color={COLORS.mute} />
                  <span
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 9,
                      letterSpacing: 1.2,
                      color: COLORS.mute,
                      textTransform: "uppercase",
                    }}
                  >
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <RowLink label="BOOKMARKS" sub="Saved words" onClick={onBookmarks} />
            <RowLink label="KNOWN WORDS" sub="Mastered list" onClick={onKnown} />
            <RowLink label="PROGRESS" sub="Streak · stats" onClick={onStats} />
            <RowLink label="SETTINGS" sub="Language · daily goal · TTS" onClick={onSettings} />
            <RowLink
              label={isPremium ? "MANAGE PREMIUM" : "GO PREMIUM"}
              sub="Unlock more illustration styles"
              onClick={onPaywall}
              accent
            />
          </div>

          <div className="mt-5">
            <ButtonChunk filled style={{ width: "100%", height: 44 }} onClick={onSignIn}>
              <span className="inline-flex items-center justify-center gap-2 w-full">
                <UserPlus size={14} color={COLORS.accent} /> SIGN IN · COMING SOON
              </span>
            </ButtonChunk>
          </div>
        </div>
      </div>
      <Tabbar active="me" onChange={onTab} />
    </div>
  );
}

function NumStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="px-3 py-3" style={{ border: "1.5px solid #0F0F0F" }}>
      <div className="flex items-center justify-between">
        <Eyebrow color={COLORS.mute}>{label}</Eyebrow>
        {icon}
      </div>
      <div
        className="mt-1"
        style={{
          fontFamily: FONT_SANS,
          fontSize: 28,
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

function RowLink({
  label,
  sub,
  onClick,
  accent,
}: {
  label: string;
  sub: string;
  onClick?: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 text-left"
      style={{
        border: "1.5px solid #0F0F0F",
        backgroundColor: accent ? COLORS.accent : "transparent",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: COLORS.ink,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: FONT_SERIF_TC,
            fontSize: 12,
            color: COLORS.mute,
            marginTop: 2,
          }}
        >
          {sub}
        </div>
      </div>
      <span style={{ fontFamily: FONT_SANS, fontSize: 14, color: COLORS.ink }}>›</span>
    </button>
  );
}
