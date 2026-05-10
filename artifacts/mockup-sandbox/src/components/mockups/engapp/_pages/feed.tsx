// 6. Feed — the main swipe surface.
//
// Renders one card at a time with framer-motion stack transitions, pre-fetches
// the next batch when nearing end of deck, and runs optimistic actions
// (mark seen, toggle bookmark, mark known) through the store.

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Tabbar, type TabKey } from "../_components/tabbar";
import { WordCard } from "../_components/word-card";
import { COLORS, FONT_SANS } from "../_lib/theme";
import { useEngapp } from "../_lib/store";
import type { WordCard as WordCardData } from "../_lib/types";

interface Props {
  onOpenDetail?: (id: number) => void;
  onTab?: (tab: TabKey) => void;
  onBack?: () => void;
}

export function FeedPage({ onOpenDetail, onTab, onBack }: Props) {
  const { feed, user, bookmarks, known, toggleBookmark, markKnown, markSeen, refreshFeed } =
    useEngapp();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [undoState, setUndoState] = useState<{ action: string; from: number } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenSet = useRef<Set<number>>(new Set());

  const current: WordCardData | undefined = feed[index];

  useEffect(() => {
    if (current && !seenSet.current.has(current.id)) {
      seenSet.current.add(current.id);
      const t = setTimeout(() => markSeen(current.id), 1500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [current, markSeen]);

  useEffect(() => {
    if (feed.length - index <= 3) {
      void refreshFeed();
    }
  }, [feed.length, index, refreshFeed]);

  const showUndo = (action: string, from: number) => {
    setUndoState({ action, from });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndoState(null), 3500);
  };

  const advance = useCallback(() => {
    if (!current) return;
    setDirection(1);
    setIndex((i) => i + 1);
  }, [current]);

  const goBack = useCallback(() => {
    if (index === 0) return;
    setDirection(-1);
    setIndex((i) => i - 1);
  }, [index]);

  const handleKnown = () => {
    if (!current) return;
    markKnown(current.id);
    showUndo("KNOWN", index);
    advance();
  };

  const handleSkip = () => {
    if (!current) return;
    markSeen(current.id);
    showUndo("SKIP", index);
    advance();
  };

  const handleSwipeRight = () => {
    if (!current) return;
    toggleBookmark(current.id);
    showUndo(bookmarks.includes(current.id) ? "UNSAVED" : "SAVED", index);
  };

  const handleUndo = () => {
    if (!undoState) return;
    setIndex(undoState.from);
    setDirection(-1);
    setUndoState(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  if (!current) {
    return (
      <div
        className="size-full flex flex-col items-center justify-center px-8 text-center gap-3"
        style={{ backgroundColor: COLORS.card, fontFamily: FONT_SANS, color: COLORS.ink }}
      >
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.6,
            color: COLORS.mute,
            textTransform: "uppercase",
          }}
        >
          ALL CAUGHT UP
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>You're done for now.</div>
        <button
          onClick={() => void refreshFeed()}
          className="px-3 py-2"
          style={{
            border: "1.5px solid #0F0F0F",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          REFRESH FEED
        </button>
        <Tabbar active="feed" onChange={onTab} />
      </div>
    );
  }

  return (
    <div
      className="size-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: COLORS.page, fontFamily: FONT_SANS }}
    >
      <div className="flex-1 relative" style={{ paddingBottom: 60 }}>
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={current.id}
            className="absolute inset-2"
            initial={{ y: direction === 1 ? "100%" : "-100%", scale: 0.95, opacity: 0.6 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: direction === 1 ? "-100%" : "100%", scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={(_: unknown, info: PanInfo) => {
              if (info.offset.y < -50 || info.velocity.y < -250) handleKnown();
              else if (info.offset.y > 50 || info.velocity.y > 250) goBack();
              else if (info.offset.x < -50 || info.velocity.x < -250) handleSkip();
              else if (info.offset.x > 50 || info.velocity.x > 250) handleSwipeRight();
            }}
          >
            <WordCard
              externalDrag
              data={current}
              streak={user.discoveryStreakDays}
              index={index + 1}
              total={feed.length}
              saved={bookmarks.includes(current.id)}
              known={known.has(current.id)}
              showSwipeHint={index < 2}
              onBack={onBack}
              onTap={() => onOpenDetail?.(current.id)}
              onToggleBookmark={() => {
                toggleBookmark(current.id);
              }}
              onMarkKnown={handleKnown}
            />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {undoState ? (
            <motion.button
              onClick={handleUndo}
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-3"
              style={{
                bottom: 70,
                height: 32,
                backgroundColor: COLORS.ink,
                color: COLORS.accent,
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.2,
                zIndex: 35,
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <Undo2 size={13} strokeWidth={2.4} />
              UNDO ／ {undoState.action}
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <Tabbar active="feed" onChange={onTab} />
    </div>
  );
}
