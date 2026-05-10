// Compact row for list pages (Bookmarks, Known, Search). Uses the same hairline
// editorial language as the card.

import { ChevronRight, X } from "lucide-react";
import { COLORS, FONT_SANS, FONT_SERIF_TC } from "../_lib/theme";
import { resolveImageUrl } from "../_lib/api";
import type { WordCard } from "../_lib/types";

interface Props {
  word: WordCard;
  onClick?: () => void;
  onRemove?: () => void;
  badge?: string | null;
}

export function WordRow({ word, onClick, onRemove, badge }: Props) {
  return (
    <div
      onClick={onClick}
      className="flex items-stretch gap-3 px-5 py-3 cursor-pointer"
      style={{ borderBottom: "1px solid rgba(15,15,15,0.12)" }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          flex: "none",
          backgroundColor: COLORS.ink,
          overflow: "hidden",
          borderRadius: 4,
        }}
      >
        {word.primaryImage ? (
          <img
            src={resolveImageUrl(word.primaryImage.imageUrl)}
            alt={word.word}
            className="w-full h-full object-cover"
            style={{ filter: "contrast(1.05) saturate(0.85)" }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                "repeating-linear-gradient(45deg, #1A1A1A 0, #1A1A1A 4px, #0F0F0F 4px, #0F0F0F 8px)",
            }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: -0.4,
              color: COLORS.ink,
            }}
          >
            {word.word}
          </span>
          {word.cefrLevel ? (
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.2,
                padding: "1px 5px",
                backgroundColor: COLORS.accent,
                color: COLORS.ink,
              }}
            >
              {word.cefrLevel}
            </span>
          ) : null}
          {badge ? (
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.2,
                padding: "1px 5px",
                backgroundColor: COLORS.ink,
                color: COLORS.accent,
                textTransform: "uppercase",
              }}
            >
              {badge}
            </span>
          ) : null}
        </div>
        {word.translation ? (
          <div
            style={{
              fontFamily: FONT_SERIF_TC,
              fontSize: 14,
              color: COLORS.ink,
              marginTop: 2,
              letterSpacing: 1,
            }}
          >
            {word.translation}
          </div>
        ) : null}
      </div>

      <div className="flex items-center">
        {onRemove ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              border: "1.5px solid #0F0F0F",
              backgroundColor: "transparent",
            }}
            aria-label="Remove"
          >
            <X size={13} color={COLORS.ink} strokeWidth={2.4} />
          </button>
        ) : (
          <ChevronRight size={16} color={COLORS.mute} />
        )}
      </div>
    </div>
  );
}
