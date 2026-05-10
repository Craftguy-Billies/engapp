// Sticky top bar used on list-style pages (Bookmarks, Known, Settings, etc.).
// Hairline-bordered, capitalised eyebrow title, optional back chevron.

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { COLORS, FONT_SANS } from "../_lib/theme";

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, onBack, right }: Props) {
  return (
    <div
      className="flex-none px-5 py-4"
      style={{
        backgroundColor: COLORS.card,
        borderBottom: "1.5px solid #0F0F0F",
      }}
    >
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center"
            style={{
              width: 30,
              height: 30,
              border: "1.5px solid #0F0F0F",
              backgroundColor: "transparent",
            }}
            aria-label="Back"
          >
            <ArrowLeft size={14} color={COLORS.ink} strokeWidth={2.2} />
          </button>
        ) : null}
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.6,
              color: COLORS.ink,
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              className="mt-0.5"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 0.4,
                color: COLORS.mute,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        {right ? <div className="flex-none flex items-center gap-2">{right}</div> : null}
      </div>
    </div>
  );
}
