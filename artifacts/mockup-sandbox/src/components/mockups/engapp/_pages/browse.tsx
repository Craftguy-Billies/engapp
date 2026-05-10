// 15. Browse / Filter Picker
//
// Combine CEFR / theme / exam / source filters and apply them to the feed.

import { useState } from "react";
import { ButtonChunk, Eyebrow, Hairline, Pill } from "../_components/primitives";
import { PageHeader } from "../_components/page-header";
import { Tabbar, type TabKey } from "../_components/tabbar";
import {
  CEFR_LEVELS,
  COLORS,
  EXAMS,
  FONT_SANS,
  FONT_SERIF_TC,
  SOURCE_LISTS,
  THEMES,
} from "../_lib/theme";
import { useEngapp } from "../_lib/store";

interface Props {
  onTab?: (tab: TabKey) => void;
  onBack?: () => void;
  onApply?: () => void;
}

export function BrowsePage({ onTab, onBack, onApply }: Props) {
  const { refreshFeed, styles } = useEngapp();
  const [cefr, setCefr] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<string | undefined>(undefined);
  const [exam, setExam] = useState<string | undefined>(undefined);
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [styleSlug, setStyleSlug] = useState<string | undefined>(undefined);

  const apply = () => {
    const filters: Record<string, string> = {};
    if (cefr) filters.cefr = cefr;
    if (theme) filters.themeTag = theme;
    if (exam) filters.examTag = exam;
    if (src) filters.sourceList = src;
    if (styleSlug) filters.styleSlug = styleSlug;
    void refreshFeed(filters);
    onApply?.();
  };

  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader
        title="BROWSE"
        subtitle="Filter the feed"
        onBack={onBack}
        right={
          <button
            onClick={() => {
              setCefr(undefined);
              setTheme(undefined);
              setExam(undefined);
              setSrc(undefined);
              setStyleSlug(undefined);
            }}
            style={{
              fontFamily: FONT_SANS,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.4,
              color: COLORS.mute,
              textTransform: "uppercase",
            }}
          >
            CLEAR
          </button>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto pb-28 px-5 pt-4">
        <Section title="CEFR LEVEL">
          <ChipRow
            options={[...CEFR_LEVELS]}
            value={cefr}
            onChange={setCefr}
          />
        </Section>

        <Section title="THEME">
          <ChipRow options={[...THEMES]} value={theme} onChange={setTheme} />
        </Section>

        <Section title="EXAM">
          <ChipRow
            options={EXAMS.map((e) => e.code)}
            labels={EXAMS.map((e) => e.label)}
            value={exam}
            onChange={setExam}
          />
        </Section>

        <Section title="SOURCE LIST">
          <ChipRow options={[...SOURCE_LISTS]} value={src} onChange={setSrc} />
        </Section>

        <Section title="STYLE">
          <ChipRow
            options={styles.map((s) => s.slug)}
            labels={styles.map((s) => s.displayName)}
            value={styleSlug}
            onChange={setStyleSlug}
          />
        </Section>
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col"
        style={{ backgroundColor: COLORS.card }}
      >
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderTop: "1.5px solid #0F0F0F" }}
        >
          <ButtonChunk filled style={{ flex: 1, height: 44 }} onClick={apply}>
            APPLY FILTERS
          </ButtonChunk>
        </div>
        <Tabbar active="browse" onChange={onTab} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <Eyebrow color={COLORS.mute}>{title}</Eyebrow>
      <Hairline style={{ marginTop: 6, marginBottom: 8 }} />
      {children}
    </div>
  );
}

function ChipRow({
  options,
  labels,
  value,
  onChange,
}: {
  options: string[];
  labels?: string[];
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt, i) => {
        const active = value === opt;
        return (
          <button key={opt} onClick={() => onChange(active ? undefined : opt)}>
            <Pill
              bg={active ? COLORS.ink : "transparent"}
              color={active ? COLORS.accent : COLORS.ink}
              border
            >
              {labels?.[i] ?? opt}
            </Pill>
          </button>
        );
      })}
      {value === undefined ? (
        <span
          style={{ fontFamily: FONT_SERIF_TC, fontSize: 12, color: COLORS.mute }}
        >
          隨意
        </span>
      ) : null}
    </div>
  );
}
