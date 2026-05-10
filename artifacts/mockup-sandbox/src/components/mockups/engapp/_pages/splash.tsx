// 1. Splash / Boot
//
// Boot the device id, fetch /user/me, /words/styles/list, /words/feed; then
// route to onboarding when uiLanguage/learningGoal look like defaults, else to
// the feed. Visually: editorial monogram + thin progress bar that fills as
// each prerequisite resolves.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { COLORS, FONT_SANS, FONT_SERIF_TC } from "../_lib/theme";
import { useEngapp } from "../_lib/store";

interface Props {
  /** Called once boot completes. The integrated `app` mockup uses this to
   *  navigate; isolated previews can leave it undefined. */
  onContinue?: (route: "onboarding" | "feed") => void;
  /** Optional override for the destination decision (used by isolated previews). */
  forceRoute?: "onboarding" | "feed";
}

export function SplashPage({ onContinue, forceRoute }: Props) {
  const { user, ready, deviceId } = useEngapp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => Math.min(0.95, p + 0.07 + Math.random() * 0.05));
    }, 130);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setProgress(1);
    const route =
      forceRoute ??
      (user.uiLanguage && user.learningGoal && user.learningGoal !== "casual"
        ? "feed"
        : user.dailyGoal && user.dailyGoal > 0 && user.preferredStyleId
          ? "feed"
          : "onboarding");
    const t = setTimeout(() => onContinue?.(route), 350);
    return () => clearTimeout(t);
  }, [ready, user, onContinue, forceRoute]);

  return (
    <div
      className="size-full flex flex-col items-stretch"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.8,
            color: COLORS.mute,
            textTransform: "uppercase",
          }}
        >
          Vocabulary, but make it editorial
        </div>
        <div className="flex items-baseline gap-1 mt-3">
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 0.9,
              color: COLORS.ink,
            }}
          >
            eng
          </span>
          <span
            style={{
              fontFamily: FONT_SERIF_TC,
              fontSize: 64,
              fontWeight: 600,
              color: COLORS.ink,
              letterSpacing: 4,
            }}
          >
            字
          </span>
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 0.9,
              color: COLORS.accent,
            }}
          >
            .
          </span>
        </div>
        <div
          className="mt-2"
          style={{
            fontFamily: FONT_SERIF_TC,
            fontSize: 14,
            letterSpacing: 6,
            color: COLORS.ink,
          }}
        >
          英語自選輯
        </div>
      </div>

      <div className="flex-none px-8 pb-10">
        <div
          className="relative"
          style={{
            height: 4,
            backgroundColor: "rgba(15,15,15,0.08)",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(progress * 100)}%` }}
            transition={{ duration: 0.25 }}
            style={{ height: "100%", backgroundColor: COLORS.ink }}
          />
        </div>
        <div
          className="mt-3 flex items-center justify-between"
          style={{
            fontFamily: FONT_SANS,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1.4,
            color: COLORS.mute,
            textTransform: "uppercase",
          }}
        >
          <span>Booting · device {deviceId.slice(0, 6)}…</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
