// 18. Paywall (premium styles)

import { Check, Crown, Sparkles } from "lucide-react";
import { ButtonChunk, Eyebrow, Hairline, Pill } from "../_components/primitives";
import { PageHeader } from "../_components/page-header";
import { COLORS, FONT_SANS, FONT_SERIF_TC } from "../_lib/theme";
import { useEngapp } from "../_lib/store";
import { resolveImageUrl } from "../_lib/api";

interface Props {
  onBack?: () => void;
  onRestore?: () => void;
}

export function PaywallPage({ onBack, onRestore }: Props) {
  const { styles } = useEngapp();
  const premium = styles.filter((s) => !s.isFree);

  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.ink, fontFamily: FONT_SANS }}
    >
      <PageHeader title="UNLOCK PREMIUM" onBack={onBack} />

      <div className="flex-1 min-h-0 overflow-y-auto pb-28 px-5 pt-5">
        <Eyebrow color={COLORS.accent}>EXCLUSIVE STYLES · ALWAYS FRESH</Eyebrow>
        <h1
          className="mt-2"
          style={{
            fontFamily: FONT_SANS,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: -1.6,
            lineHeight: 1,
            color: "#FFF",
          }}
        >
          More illustrations<span style={{ color: COLORS.accent }}>.</span>
        </h1>
        <p
          className="mt-2"
          style={{ fontFamily: FONT_SERIF_TC, fontSize: 14, color: "rgba(255,255,255,0.85)" }}
        >
          每個風格都係由 AI 重新繪畫，包月解鎖全部風格。
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {premium.map((s) => (
            <div
              key={s.id}
              className="overflow-hidden relative"
              style={{ aspectRatio: "1 / 1", border: "1.5px solid #FFF" }}
            >
              {s.exampleImageUrl ? (
                <img
                  src={resolveImageUrl(s.exampleImageUrl)}
                  alt={s.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, #1A1A1A 0, #1A1A1A 8px, #0F0F0F 8px, #0F0F0F 16px)",
                  }}
                />
              )}
              <div
                className="absolute inset-0 flex flex-col justify-end p-3"
                style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(15,15,15,0.7) 100%)" }}
              >
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#FFF",
                  }}
                >
                  {s.displayName}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-5 px-4 py-4"
          style={{ border: "1.5px solid #FFF", color: "#FFF" }}
        >
          <Eyebrow color={COLORS.accent}>WHAT YOU GET</Eyebrow>
          <Hairline style={{ marginTop: 6, marginBottom: 8, backgroundColor: "rgba(255,255,255,0.4)" }} />
          {[
            "Every illustration style — current and future",
            "No locks on the feed swipe",
            "Priority for new dataset drops",
            "Save share cards in 2x resolution",
          ].map((line) => (
            <div key={line} className="flex items-center gap-2 py-1">
              <Check size={13} color={COLORS.accent} strokeWidth={2.4} />
              <span style={{ fontSize: 13, color: "#FFF" }}>{line}</span>
            </div>
          ))}
        </div>

        <div
          className="mt-4 px-4 py-4"
          style={{ border: "1.5px solid #FFF", color: "#FFF" }}
        >
          <Eyebrow color={COLORS.accent}>PRICING · PLACEHOLDER</Eyebrow>
          <Hairline style={{ marginTop: 6, marginBottom: 8, backgroundColor: "rgba(255,255,255,0.4)" }} />
          <div className="flex items-baseline gap-3">
            <Pill bg={COLORS.accent} border>
              MONTHLY
            </Pill>
            <span style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, letterSpacing: -0.6 }}>
              HK$38 / mo
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <Pill border color="#FFF">YEARLY</Pill>
            <span style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, letterSpacing: -0.6 }}>
              HK$298 / yr
            </span>
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 9,
                letterSpacing: 1.4,
                color: COLORS.accent,
                textTransform: "uppercase",
              }}
            >
              SAVE 35%
            </span>
          </div>
        </div>
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 px-4 py-3"
        style={{ backgroundColor: COLORS.ink, borderTop: "1.5px solid #FFF" }}
      >
        <ButtonChunk
          style={{
            width: "100%",
            height: 48,
            backgroundColor: COLORS.accent,
            color: COLORS.ink,
            border: "1.5px solid #FFF",
          }}
        >
          <span className="inline-flex items-center justify-center gap-2 w-full">
            <Crown size={14} color={COLORS.ink} /> START PREMIUM
          </span>
        </ButtonChunk>
        <button
          onClick={onRestore}
          className="w-full mt-2"
          style={{
            fontFamily: FONT_SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.4,
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
          }}
        >
          <Sparkles size={11} className="inline mr-1" /> RESTORE PURCHASES
        </button>
      </div>
    </div>
  );
}
