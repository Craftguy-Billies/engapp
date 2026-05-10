// PhoneFrame: centres each mockup page in a tall, mobile-shaped viewport so
// designers can review the layouts at the right aspect ratio. The actual app
// will run edge-to-edge — this frame is a sandbox-only chrome.

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { COLORS, FONT_SANS } from "../_lib/theme";
import { ensureFonts } from "../_lib/fonts";

interface Props {
  children: ReactNode;
  bg?: string;
  /**
   * When set, the inner content keeps its own background (e.g. `#FFFFFF`)
   * while the page-level chrome stays the warm beige. Falls back to `bg`.
   */
  innerBg?: string;
  /** Page name displayed inside the dotted top hint. */
  label?: string;
  /** Optional caption shown under the device. */
  caption?: ReactNode;
}

const SHELL: CSSProperties = {
  width: "min(420px, 100%)",
  height: "min(880px, 92vh)",
  position: "relative",
  borderRadius: 36,
  overflow: "hidden",
  border: "1.5px solid #0F0F0F",
  boxShadow: "0 30px 80px -30px rgba(0,0,0,0.35)",
};

export function PhoneFrame({ children, bg, innerBg, label, caption }: Props) {
  useEffect(() => {
    ensureFonts();
  }, []);
  return (
    <div
      className="size-full min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: bg ?? COLORS.page, fontFamily: FONT_SANS }}
    >
      {label ? (
        <div
          className="px-3 py-1"
          style={{
            border: "1.5px dashed #0F0F0F",
            color: COLORS.ink,
            fontFamily: FONT_SANS,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.6,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      ) : null}
      <div style={{ ...SHELL, backgroundColor: innerBg ?? COLORS.card }}>{children}</div>
      {caption ? (
        <div
          style={{
            color: COLORS.mute,
            fontFamily: FONT_SANS,
            fontSize: 11,
            letterSpacing: 0.4,
            maxWidth: 420,
            textAlign: "center",
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
}
