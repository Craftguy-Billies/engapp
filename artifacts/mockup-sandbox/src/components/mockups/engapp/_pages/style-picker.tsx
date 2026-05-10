// 14. Style Picker (in-app)
//
// Same shape as the onboarding step but in a sticky-action layout: pick a
// style, save, and the integrated app will re-prime the feed with the new
// styleSlug.

import { Lock } from "lucide-react";
import { useState } from "react";
import { resolveImageUrl } from "../_lib/api";
import { ButtonChunk, Eyebrow, Pill } from "../_components/primitives";
import { PageHeader } from "../_components/page-header";
import { COLORS, FONT_SANS, FONT_SERIF_TC } from "../_lib/theme";
import { useEngapp } from "../_lib/store";

interface Props {
  onBack?: () => void;
  onSave?: (styleId: number) => void;
  onPaywall?: () => void;
}

export function StylePickerPage({ onBack, onSave, onPaywall }: Props) {
  const { styles, user, patchUser, refreshFeed } = useEngapp();
  const [pick, setPick] = useState<number>(user.preferredStyleId ?? styles[0]?.id ?? 1);
  const target = styles.find((s) => s.id === pick);
  const locked = target ? !target.isFree : false;

  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader
        title="STYLES"
        subtitle="Pick the look of every illustration"
        onBack={onBack}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pb-20 px-5 pt-4">
        <Eyebrow color={COLORS.mute}>FREE</Eyebrow>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {styles.filter((s) => s.isFree).map((s) => (
            <StyleCard
              key={s.id}
              style={s}
              selected={pick === s.id}
              onClick={() => setPick(s.id)}
              locked={false}
            />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Eyebrow color={COLORS.mute}>PREMIUM</Eyebrow>
          <Pill bg={COLORS.ink} color={COLORS.accent} border>
            UNLOCK
          </Pill>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {styles.filter((s) => !s.isFree).map((s) => (
            <StyleCard
              key={s.id}
              style={s}
              selected={pick === s.id}
              onClick={() => setPick(s.id)}
              locked
            />
          ))}
        </div>
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 px-4 py-3 flex items-center gap-2"
        style={{ backgroundColor: COLORS.card, borderTop: "1.5px solid #0F0F0F" }}
      >
        {locked ? (
          <ButtonChunk filled style={{ flex: 1, height: 44 }} onClick={onPaywall}>
            UNLOCK PREMIUM TO SELECT
          </ButtonChunk>
        ) : (
          <ButtonChunk
            filled
            style={{ flex: 1, height: 44 }}
            onClick={() => {
              patchUser({ preferredStyleId: pick });
              if (target?.slug) void refreshFeed({ styleSlug: target.slug });
              onSave?.(pick);
            }}
          >
            APPLY · {target?.displayName?.toUpperCase()}
          </ButtonChunk>
        )}
      </div>
    </div>
  );
}

function StyleCard({
  style,
  selected,
  locked,
  onClick,
}: {
  style: { id: number; slug: string; displayName: string; description?: string | null; exampleImageUrl?: string | null };
  selected: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left flex flex-col"
      style={{
        border: "1.5px solid #0F0F0F",
        backgroundColor: selected ? COLORS.accent : COLORS.cardAlt,
        aspectRatio: "1 / 1",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {style.exampleImageUrl ? (
        <img
          src={resolveImageUrl(style.exampleImageUrl)}
          alt={style.displayName}
          className="w-full h-full object-cover absolute inset-0"
          style={{ filter: locked ? "blur(2px) grayscale(0.4)" : "none" }}
        />
      ) : null}
      <div
        className="absolute inset-0 flex flex-col justify-end p-3"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(15,15,15,0.6) 100%)" }}
      >
        <div
          className="flex items-center gap-1"
          style={{
            fontFamily: FONT_SANS,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1.4,
            color: COLORS.accent,
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
          {style.displayName}
        </div>
        {style.description ? (
          <div
            style={{
              fontFamily: FONT_SERIF_TC,
              fontSize: 11,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {style.description}
          </div>
        ) : null}
      </div>
    </button>
  );
}
