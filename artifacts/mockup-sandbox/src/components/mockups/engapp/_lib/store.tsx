// Single, lightweight global store backed by useState + a context. Keeps
// optimistic UI state for bookmarks/known/seen, plus the user object and the
// current feed deck. We deliberately avoid pulling react-query in here: the
// mockup-sandbox is a design surface and we want it to run without the full
// API-client package.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, getDeviceId } from "./api";
import type {
  AppUser,
  BookmarkRow,
  IllustrationStyle,
  KnownRow,
  UserStats,
  WordCard,
} from "./types";
import { MOCK_STATS, MOCK_STYLES, MOCK_USER, MOCK_WORDS } from "./mock";

interface State {
  user: AppUser;
  styles: IllustrationStyle[];
  feed: WordCard[];
  bookmarks: number[];
  known: Map<number, string | null>;
  stats: UserStats;
  online: boolean;
  ready: boolean;
}

interface Actions {
  refreshFeed: (filters?: Record<string, string>) => Promise<void>;
  fetchWord: (id: number) => Promise<WordCard | undefined>;
  toggleBookmark: (wordId: number) => void;
  markKnown: (wordId: number) => void;
  markSeen: (wordId: number) => void;
  patchUser: (patch: Partial<AppUser>) => void;
  resetSession: () => void;
}

type StoreShape = State & Actions & { deviceId: string };

const StoreContext = createContext<StoreShape | null>(null);

export function EngappStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser>(MOCK_USER);
  const [styles, setStyles] = useState<IllustrationStyle[]>(MOCK_STYLES);
  const [feed, setFeed] = useState<WordCard[]>(MOCK_WORDS);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [known, setKnown] = useState<Map<number, string | null>>(new Map());
  const [stats, setStats] = useState<UserStats>(MOCK_STATS);
  const [online, setOnline] = useState<boolean>(true);
  const [ready, setReady] = useState<boolean>(false);
  const wordCache = useRef<Map<number, WordCard>>(new Map());

  // Bootstrap on mount: try the API, but never block the design.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [me, stylesRes, feedRes] = await Promise.all([
          api.me().catch(() => null),
          api.stylesList().catch(() => null),
          api.feed({ limit: 10 }).catch(() => null),
        ]);
        if (!alive) return;
        if (me?.user) setUser(me.user);
        if (stylesRes?.styles?.length) setStyles(stylesRes.styles);
        if (feedRes?.words?.length) {
          setFeed(feedRes.words);
          for (const w of feedRes.words) wordCache.current.set(w.id, w);
        }
        setOnline(Boolean(me || stylesRes || feedRes));
        const [bm, kn, st] = await Promise.all([
          api.bookmarks().catch(() => null),
          api.known().catch(() => null),
          api.stats().catch(() => null),
        ]);
        if (!alive) return;
        if (bm?.bookmarks) setBookmarks(bm.bookmarks.map((b) => b.wordId));
        if (kn?.known)
          setKnown(new Map(kn.known.map((r) => [r.wordId, r.revisitAt])));
        if (st) setStats(st);
      } catch (e) {
        if (e instanceof ApiError) setOnline(false);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Prime word cache from feed.
  useEffect(() => {
    for (const w of feed) wordCache.current.set(w.id, w);
  }, [feed]);

  const refreshFeed = useCallback(
    async (filters: Record<string, string> = {}) => {
      try {
        const res = await api.feed({ limit: 10, ...filters });
        if (res?.words?.length) {
          setFeed(res.words);
          for (const w of res.words) wordCache.current.set(w.id, w);
          setOnline(true);
        }
      } catch {
        // keep existing feed if fetch fails — design must keep working.
        setOnline(false);
      }
    },
    [],
  );

  const fetchWord = useCallback(async (id: number) => {
    const cached = wordCache.current.get(id);
    if (cached) return cached;
    try {
      const w = await api.word(id);
      wordCache.current.set(id, w);
      return w;
    } catch {
      return MOCK_WORDS.find((w) => w.id === id);
    }
  }, []);

  const toggleBookmark = useCallback(
    (wordId: number) => {
      setBookmarks((prev) =>
        prev.includes(wordId) ? prev.filter((id) => id !== wordId) : [...prev, wordId],
      );
      const isBookmarked = !bookmarks.includes(wordId);
      if (isBookmarked) api.addBookmark(wordId).catch(() => undefined);
      else api.removeBookmark(wordId).catch(() => undefined);
    },
    [bookmarks],
  );

  const markKnown = useCallback((wordId: number) => {
    setKnown((prev) => {
      if (prev.has(wordId)) return prev;
      const next = new Map(prev);
      next.set(wordId, new Date(Date.now() + 7 * 86400000).toISOString());
      return next;
    });
    api.markKnown(wordId).catch(() => undefined);
  }, []);

  const markSeen = useCallback((wordId: number) => {
    api.markSeen(wordId).catch(() => undefined);
  }, []);

  const patchUser = useCallback((patch: Partial<AppUser>) => {
    setUser((prev) => ({ ...prev, ...patch }));
    api.patchMe(patch).catch(() => undefined);
  }, []);

  const resetSession = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("engapp.deviceId");
    window.location.reload();
  }, []);

  const value = useMemo<StoreShape>(
    () => ({
      user,
      styles,
      feed,
      bookmarks,
      known,
      stats,
      online,
      ready,
      deviceId: getDeviceId(),
      refreshFeed,
      fetchWord,
      toggleBookmark,
      markKnown,
      markSeen,
      patchUser,
      resetSession,
    }),
    [
      user,
      styles,
      feed,
      bookmarks,
      known,
      stats,
      online,
      ready,
      refreshFeed,
      fetchWord,
      toggleBookmark,
      markKnown,
      markSeen,
      patchUser,
      resetSession,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useEngapp(): StoreShape {
  const v = useContext(StoreContext);
  if (!v) throw new Error("useEngapp must be used inside <EngappStoreProvider>");
  return v;
}

// Convenience: a passthrough provider that also boots a single store for a
// preview that renders standalone (no shared app shell).
export function withEngapp(node: ReactNode) {
  return <EngappStoreProvider>{node}</EngappStoreProvider>;
}
