// 19-21. Empty / All-caught-up, Error / Offline, Sign-in placeholder.

import { CloudOff, RefreshCcw, Sparkles, UserPlus } from "lucide-react";
import { ButtonChunk, Eyebrow, Hairline } from "../_components/primitives";
import { PageHeader } from "../_components/page-header";
import { COLORS, FONT_SANS, FONT_SERIF_TC } from "../_lib/theme";

interface BasicProps {
  onBack?: () => void;
  onRetry?: () => void;
  onPrimary?: () => void;
}

export function EmptyStatePage({ onBack, onPrimary }: BasicProps) {
  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader title="ALL CAUGHT UP" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
        <div
          className="flex items-center justify-center"
          style={{ width: 96, height: 96, backgroundColor: COLORS.accent }}
        >
          <Sparkles size={36} color={COLORS.ink} strokeWidth={2} />
        </div>
        <Eyebrow color={COLORS.mute}>NO MORE WORDS</Eyebrow>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: -1,
            color: COLORS.ink,
          }}
        >
          You're done for today.
        </div>
        <div
          style={{ fontFamily: FONT_SERIF_TC, fontSize: 14, color: COLORS.mute, maxWidth: 280 }}
        >
          冇更多新字喇。試下放鬆篩選或者複習舊字。
        </div>
        <div className="flex gap-2 mt-2">
          <ButtonChunk filled onClick={onPrimary}>RELAX FILTERS</ButtonChunk>
          <ButtonChunk>OPEN REVISIT</ButtonChunk>
        </div>
      </div>
    </div>
  );
}

export function ErrorStatePage({ onBack, onRetry }: BasicProps) {
  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader title="OFFLINE" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
        <div
          className="flex items-center justify-center"
          style={{ width: 96, height: 96, border: "1.5px solid #0F0F0F" }}
        >
          <CloudOff size={36} color={COLORS.ink} strokeWidth={2} />
        </div>
        <Eyebrow color={COLORS.mute}>CONNECTION LOST</Eyebrow>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: -1,
            color: COLORS.ink,
          }}
        >
          Can't reach the server.
        </div>
        <div
          style={{ fontFamily: FONT_SERIF_TC, fontSize: 14, color: COLORS.mute, maxWidth: 280 }}
        >
          我哋會自動重試 — 你嘅儲存、bookmark、known 標記會排住隊發送。
        </div>
        <ButtonChunk filled onClick={onRetry}>
          <span className="inline-flex items-center justify-center gap-2">
            <RefreshCcw size={12} color={COLORS.accent} /> RETRY NOW
          </span>
        </ButtonChunk>
      </div>
    </div>
  );
}

export function SignInPage({ onBack }: BasicProps) {
  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader title="SIGN IN" subtitle="Coming soon" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
        <div
          className="flex items-center justify-center"
          style={{ width: 96, height: 96, backgroundColor: COLORS.ink, color: COLORS.accent }}
        >
          <UserPlus size={36} color={COLORS.accent} strokeWidth={2} />
        </div>
        <Eyebrow color={COLORS.mute}>FUTURE FEATURE</Eyebrow>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: -1,
            color: COLORS.ink,
          }}
        >
          Sign in coming soon.
        </div>
        <div
          style={{ fontFamily: FONT_SERIF_TC, fontSize: 14, color: COLORS.mute, maxWidth: 280 }}
        >
          短期內你可以用 device id 直接用所有功能；之後我哋會加 Clerk 同步多裝置。
        </div>
        <Hairline style={{ marginTop: 18, marginBottom: 8, width: 200 }} />
        <Eyebrow color={COLORS.mute}>WHEN IT LAUNCHES</Eyebrow>
        <ul
          className="mt-1 grid gap-1 text-left"
          style={{ fontFamily: FONT_SANS, fontSize: 13, color: COLORS.ink, lineHeight: 1.5 }}
        >
          <li>· Continue with Google · Apple · Email magic link</li>
          <li>· Sync your bookmarks + streak across devices</li>
          <li>· Premium subscription tied to your account</li>
        </ul>
      </div>
    </div>
  );
}
