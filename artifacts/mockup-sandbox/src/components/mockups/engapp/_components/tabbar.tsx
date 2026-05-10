// Bottom tabbar shared by feed-style screens. The labels follow the same
// uppercase / monospaced eyebrow style as the rest of the design.

import { Bookmark, Compass, Home, RotateCcw, User } from "lucide-react";
import { COLORS, FONT_SANS } from "../_lib/theme";

export type TabKey = "feed" | "browse" | "revisit" | "saved" | "me";

interface Props {
  active: TabKey;
  onChange?: (key: TabKey) => void;
}

const TABS: Array<{ key: TabKey; label: string; icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> }> = [
  { key: "feed", label: "FEED", icon: Home },
  { key: "browse", label: "BROWSE", icon: Compass },
  { key: "revisit", label: "REVISIT", icon: RotateCcw },
  { key: "saved", label: "SAVED", icon: Bookmark },
  { key: "me", label: "ME", icon: User },
];

export function Tabbar({ active, onChange }: Props) {
  return (
    <div
      className="absolute left-0 right-0 bottom-0 px-4 pb-3 pt-2 flex items-stretch justify-between gap-1"
      style={{
        backgroundColor: COLORS.card,
        borderTop: "1.5px solid #0F0F0F",
        zIndex: 5,
      }}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange?.(t.key)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-1"
            style={{
              backgroundColor: isActive ? COLORS.ink : "transparent",
              color: isActive ? COLORS.accent : COLORS.ink,
            }}
          >
            <Icon size={16} color={isActive ? COLORS.accent : COLORS.ink} strokeWidth={2} />
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.4,
              }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
