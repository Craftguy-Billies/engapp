// Tiny styled primitives (pills, hairlines, monospace tag rows, etc.) shared
// across pages. They mirror the editorial / brutalist look of the Figma
// design — sharp rectangles, thin black borders, single accent colour.

import type { CSSProperties, ReactNode } from "react";
import { COLORS, FONT_SANS } from "../_lib/theme";

export function Pill({
  children,
  bg = "transparent",
  color = COLORS.ink,
  border = true,
  uppercase = true,
  size = 10,
  style,
}: {
  children: ReactNode;
  bg?: string;
  color?: string;
  border?: boolean;
  uppercase?: boolean;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      className="inline-flex items-center"
      style={{
        backgroundColor: bg,
        color,
        border: border ? "1.5px solid #0F0F0F" : "none",
        fontFamily: FONT_SANS,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: 1.4,
        padding: "3px 8px",
        textTransform: uppercase ? "uppercase" : "none",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Hairline({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        height: 1,
        backgroundColor: COLORS.hairline,
        width: "100%",
        ...style,
      }}
    />
  );
}

export function MonoCounter({
  index,
  total,
  size = 9,
}: {
  index: number;
  total: number;
  size?: number;
}) {
  return (
    <span
      style={{
        fontFamily: FONT_SANS,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: 1.5,
        color: COLORS.mute,
      }}
    >
      {String(index).padStart(3, "0")} / {String(total).padStart(3, "0")}
    </span>
  );
}

export function Eyebrow({
  children,
  color = COLORS.ink,
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1.8,
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function ButtonChunk({
  children,
  onClick,
  active,
  filled,
  disabled,
  style,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  filled?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        fontFamily: FONT_SANS,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        padding: "10px 14px",
        border: "1.5px solid #0F0F0F",
        backgroundColor: filled ? COLORS.ink : active ? COLORS.accent : "transparent",
        color: filled ? COLORS.accent : COLORS.ink,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "default" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function ProgressRing({
  value,
  size = 96,
  stroke = 6,
  trackColor = "rgba(15,15,15,0.12)",
  fillColor = COLORS.ink,
  label,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  trackColor?: string;
  fillColor?: string;
  label?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={fillColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - clamped * c}
          strokeLinecap="butt"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {label != null ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontFamily: FONT_SANS, fontWeight: 700, color: COLORS.ink }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}

export function SectionLabel({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <div className="flex items-center justify-between" style={{ paddingTop: 12 }}>
      <Eyebrow>{children}</Eyebrow>
      {count != null ? <Eyebrow color={COLORS.mute}>{String(count).padStart(3, "0")}</Eyebrow> : null}
    </div>
  );
}
