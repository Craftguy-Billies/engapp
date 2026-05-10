// 8-10. Bookmarks list, Known list, Revisit deck.
//
// All three share a list shell with an editorial header and an empty state.
// Revisit doubles as a small swipe deck (re-uses WordCard with externalDrag).

import { motion } from "framer-motion";
import { Bookmark, Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../_lib/api";
import { ButtonChunk, Eyebrow } from "../_components/primitives";
import { PageHeader } from "../_components/page-header";
import { Tabbar, type TabKey } from "../_components/tabbar";
import { WordCard } from "../_components/word-card";
import { WordRow } from "../_components/word-row";
import { COLORS, FONT_SANS, FONT_SERIF_TC } from "../_lib/theme";
import { useEngapp } from "../_lib/store";
import type { WordCard as WordCardData } from "../_lib/types";

interface ListProps {
  onOpenDetail?: (id: number) => void;
  onTab?: (tab: TabKey) => void;
  onBack?: () => void;
}

function useResolved(ids: number[]): WordCardData[] {
  const { feed, fetchWord } = useEngapp();
  const [extra, setExtra] = useState<WordCardData[]>([]);
  useEffect(() => {
    let alive = true;
    const missing = ids.filter((id) => !feed.find((f) => f.id === id));
    Promise.all(missing.map((id) => fetchWord(id))).then((rows) => {
      if (!alive) return;
      setExtra(rows.filter((r): r is WordCardData => Boolean(r)));
    });
    return () => {
      alive = false;
    };
  }, [ids, feed, fetchWord]);
  return ids
    .map((id) => feed.find((f) => f.id === id) ?? extra.find((f) => f.id === id))
    .filter((w): w is WordCardData => Boolean(w));
}

export function BookmarksPage({ onOpenDetail, onTab, onBack }: ListProps) {
  const { bookmarks, toggleBookmark } = useEngapp();
  const words = useResolved(bookmarks);
  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader
        title="BOOKMARKS"
        subtitle={`${bookmarks.length} saved word${bookmarks.length === 1 ? "" : "s"}`}
        onBack={onBack}
        right={<Eyebrow color={COLORS.mute}>{String(bookmarks.length).padStart(3, "0")}</Eyebrow>}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pb-16">
        {words.length === 0 ? (
          <EmptyInline
            icon={Bookmark}
            title="No bookmarks yet"
            sub="Long-press any feed card or swipe right to save it."
          />
        ) : (
          words.map((w) => (
            <WordRow
              key={w.id}
              word={w}
              onClick={() => onOpenDetail?.(w.id)}
              onRemove={() => toggleBookmark(w.id)}
            />
          ))
        )}
      </div>
      <Tabbar active="saved" onChange={onTab} />
    </div>
  );
}

export function KnownPage({ onOpenDetail, onTab, onBack }: ListProps) {
  const { known } = useEngapp();
  const ids = Array.from(known.keys());
  const words = useResolved(ids);
  return (
    <div
      className="size-full flex flex-col"
      style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS }}
    >
      <PageHeader
        title="KNOWN"
        subtitle={`${ids.length} word${ids.length === 1 ? "" : "s"} learned`}
        onBack={onBack}
        right={<Eyebrow color={COLORS.mute}>{String(ids.length).padStart(3, "0")}</Eyebrow>}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pb-16">
        {words.length === 0 ? (
          <EmptyInline
            icon={Check}
            title="Nothing here yet"
            sub="Swipe up on a feed card to mark it as known."
          />
        ) : (
          words.map((w) => {
            const due = known.get(w.id);
            const overdue = due ? new Date(due) <= new Date() : false;
            return (
              <WordRow
                key={w.id}
                word={w}
                onClick={() => onOpenDetail?.(w.id)}
                badge={overdue ? "REVISIT" : null}
              />
            );
          })
        )}
      </div>
      <Tabbar active="me" onChange={onTab} />
    </div>
  );
}

export function RevisitPage({ onOpenDetail, onTab, onBack }: ListProps) {
  const { feed, user, markKnown, toggleBookmark, bookmarks, known } = useEngapp();
  const [queue, setQueue] = useState<WordCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    api
      .revisit()
      .then(async (r) => {
        if (!alive) return;
        const rows = await Promise.all(
          (r?.revisit ?? []).map(async (row) => {
            const cached = feed.find((f) => f.id === row.wordId);
            if (cached) return cached;
            try {
              return await api.word(row.wordId);
            } catch {
              return null;
            }
          }),
        );
        if (!alive) return;
        const valid = rows.filter((x): x is WordCardData => Boolean(x));
        // fall back to known words if the API is offline / empty
        if (valid.length === 0) {
          setQueue(feed.slice(0, Math.min(3, feed.length)));
        } else {
          setQueue(valid);
        }
      })
      .catch(() => {
        if (!alive) return;
        setQueue(feed.slice(0, Math.min(3, feed.length)));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [feed]);

  const current = queue[index];
  const total = queue.length;

  return (
    <div
      className="size-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: COLORS.page, fontFamily: FONT_SANS }}
    >
      <PageHeader
        title="REVISIT"
        subtitle={loading ? "Loading…" : `${Math.min(index + 1, total)} / ${total}`}
        onBack={onBack}
      />

      {!current ? (
        <div className="flex-1 flex items-center justify-center px-8 text-center">
          <div>
            <Sparkles size={28} color={COLORS.mute} />
            <h2
              className="mt-3"
              style={{
                fontFamily: FONT_SANS,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -1,
                color: COLORS.ink,
              }}
            >
              Nothing due today.
            </h2>
            <p
              className="mt-1"
              style={{ fontFamily: FONT_SERIF_TC, fontSize: 14, color: COLORS.mute }}
            >
              明天再見 — 嚟過。
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 relative" style={{ paddingBottom: 60 }}>
          <motion.div
            key={current.id}
            className="absolute inset-2"
            initial={{ y: "30%", scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: "-30%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <WordCard
              data={current}
              streak={user.discoveryStreakDays}
              index={index + 1}
              total={total}
              saved={bookmarks.includes(current.id)}
              known={known.has(current.id)}
              onTap={() => onOpenDetail?.(current.id)}
              onToggleBookmark={() => toggleBookmark(current.id)}
              onMarkKnown={() => {
                markKnown(current.id);
                setIndex((i) => i + 1);
              }}
              onSwipeUp={() => {
                markKnown(current.id);
                setIndex((i) => i + 1);
              }}
              onSwipeLeft={() => setIndex((i) => i + 1)}
            />
          </motion.div>
        </div>
      )}

      <Tabbar active="revisit" onChange={onTab} />
    </div>
  );
}

function EmptyInline({
  icon: Icon,
  title,
  sub,
}: {
  icon: typeof Bookmark;
  title: string;
  sub: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-8 py-16 gap-3"
      style={{ color: COLORS.ink }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          border: "1.5px solid #0F0F0F",
        }}
      >
        <Icon size={20} color={COLORS.ink} strokeWidth={2.2} />
      </div>
      <Eyebrow color={COLORS.mute}>EMPTY</Eyebrow>
      <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 700, letterSpacing: -0.6 }}>
        {title}
      </div>
      <div
        style={{
          fontFamily: FONT_SERIF_TC,
          fontSize: 14,
          color: COLORS.mute,
          maxWidth: 260,
        }}
      >
        {sub}
      </div>
      <ButtonChunk filled>OPEN FEED</ButtonChunk>
    </div>
  );
}
