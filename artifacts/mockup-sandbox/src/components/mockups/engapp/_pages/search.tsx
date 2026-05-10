// 16. Search Results
//
// The backend has no `/api/words/search?q=` endpoint yet, so the UI does a
// client-side filter on the cached feed + tries `/api/words/:id` when the
// input is purely numeric.

import { Search as SearchIcon, X } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../_lib/api";
import { Eyebrow } from "../_components/primitives";
import { PageHeader } from "../_components/page-header";
import { WordRow } from "../_components/word-row";
import { COLORS, FONT_SANS, FONT_SERIF_TC } from "../_lib/theme";
import { useEngapp } from "../_lib/store";
import type { WordCard as WordCardData } from "../_lib/types";

interface Props {
  onOpenDetail?: (id: number) => void;
  onBack?: () => void;
}

export function SearchPage({ onOpenDetail, onBack }: Props) {
  const { feed } = useEngapp();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [extra, setExtra] = useState<WordCardData[]>([]);

  const results = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return [];
    const local = feed.filter(
      (w) =>
        w.word.toLowerCase().includes(text) ||
        (w.translation ?? "").includes(text) ||
        Object.values(w.translations ?? {}).some((t) => t.includes(text)),
    );
    const fromExtra = extra.filter(
      (w) => !local.find((l) => l.id === w.id) && w.word.toLowerCase().includes(text),
    );
    return [...local, ...fromExtra];
  }, [q, feed, extra]);

  const onSubmit = async () => {
    const text = q.trim();
    if (!text) return;
    setRecent((r) => [text, ...r.filter((x) => x !== text)].slice(0, 6));
    if (/^\d+$/.test(text)) {
      try {
        const w = await api.word(parseInt(text, 10));
        setExtra((e) => [w, ...e.filter((x) => x.id !== w.id)]);
      } catch {
        // ignore — show nothing
      }
    }
  };

  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader title="SEARCH" onBack={onBack} />
      <div className="flex-none px-5 pt-3 pb-3" style={{ borderBottom: "1.5px solid #0F0F0F" }}>
        <div
          className="flex items-center gap-2 px-3"
          style={{ border: "1.5px solid #0F0F0F", height: 44 }}
        >
          <SearchIcon size={16} color={COLORS.ink} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            placeholder="Type an English word or numeric id…"
            className="flex-1 outline-none bg-transparent"
            style={{
              fontFamily: FONT_SANS,
              fontSize: 14,
              color: COLORS.ink,
            }}
          />
          {q ? (
            <button onClick={() => setQ("")}>
              <X size={14} color={COLORS.mute} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-10">
        {!q.trim() ? (
          <div className="px-5 pt-4">
            <Eyebrow color={COLORS.mute}>RECENT</Eyebrow>
            {recent.length === 0 ? (
              <div
                className="mt-2"
                style={{ fontFamily: FONT_SERIF_TC, fontSize: 14, color: COLORS.mute }}
              >
                未有搜尋紀錄。試下打 “solitude”。
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    onClick={() => setQ(r)}
                    className="px-3 py-1"
                    style={{
                      border: "1.5px solid #0F0F0F",
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: COLORS.ink,
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : results.length === 0 ? (
          <div className="px-5 pt-6 text-center">
            <Eyebrow color={COLORS.mute}>NO RESULTS</Eyebrow>
            <div
              className="mt-2"
              style={{ fontFamily: FONT_SERIF_TC, fontSize: 16, color: COLORS.ink }}
            >
              冇結果，試下其他字。
            </div>
          </div>
        ) : (
          results.map((w) => (
            <WordRow key={w.id} word={w} onClick={() => onOpenDetail?.(w.id)} />
          ))
        )}
      </div>
    </div>
  );
}
