// Integrated mockup: the full app stitched together with a tiny hash-based
// router. This is the page reviewers should hit when they want to see the
// whole experience flow from boot → onboarding → feed → detail → … →
// settings.

import { useEffect, useState } from "react";
import { PhoneFrame } from "./_components/phone-frame";
import { EngappStoreProvider } from "./_lib/store";
import { BookmarksPage, KnownPage, RevisitPage } from "./_pages/lists";
import { BrowsePage } from "./_pages/browse";
import { FeedPage } from "./_pages/feed";
import { OnboardingPage } from "./_pages/onboarding";
import { PaywallPage } from "./_pages/paywall";
import { ProfilePage } from "./_pages/profile";
import { SearchPage } from "./_pages/search";
import { SettingsPage } from "./_pages/settings";
import { SharePreviewPage } from "./_pages/share";
import { SplashPage } from "./_pages/splash";
import { StatsPage } from "./_pages/stats";
import { StylePickerPage } from "./_pages/style-picker";
import { EmptyStatePage, ErrorStatePage, SignInPage } from "./_pages/states";
import { WordDetailPage } from "./_pages/word-detail";
import type { TabKey } from "./_components/tabbar";

type Route =
  | { name: "splash" }
  | { name: "onboarding"; step: "language" | "exam" | "daily" | "style" }
  | { name: "feed" }
  | { name: "detail"; wordId: number }
  | { name: "share"; wordId: number }
  | { name: "bookmarks" }
  | { name: "known" }
  | { name: "revisit" }
  | { name: "stats" }
  | { name: "profile" }
  | { name: "settings" }
  | { name: "style" }
  | { name: "browse" }
  | { name: "search" }
  | { name: "paywall" }
  | { name: "empty" }
  | { name: "error" }
  | { name: "signin" };

function Shell() {
  const [route, setRoute] = useState<Route>({ name: "splash" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onTab = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRoute({ name: "feed" });
    };
    window.addEventListener("keydown", onTab);
    return () => window.removeEventListener("keydown", onTab);
  }, []);

  const tab = (k: TabKey) => {
    if (k === "feed") setRoute({ name: "feed" });
    else if (k === "browse") setRoute({ name: "browse" });
    else if (k === "revisit") setRoute({ name: "revisit" });
    else if (k === "saved") setRoute({ name: "bookmarks" });
    else if (k === "me") setRoute({ name: "profile" });
  };

  switch (route.name) {
    case "splash":
      return (
        <SplashPage
          onContinue={(r) =>
            setRoute(r === "feed" ? { name: "feed" } : { name: "onboarding", step: "language" })
          }
        />
      );
    case "onboarding": {
      const step = route.step;
      const next = () => {
        if (step === "language") setRoute({ name: "onboarding", step: "exam" });
        else if (step === "exam") setRoute({ name: "onboarding", step: "daily" });
        else if (step === "daily") setRoute({ name: "onboarding", step: "style" });
        else setRoute({ name: "feed" });
      };
      const back = () => {
        if (step === "exam") setRoute({ name: "onboarding", step: "language" });
        else if (step === "daily") setRoute({ name: "onboarding", step: "exam" });
        else if (step === "style") setRoute({ name: "onboarding", step: "daily" });
        else setRoute({ name: "splash" });
      };
      return (
        <OnboardingPage
          step={step}
          onNext={next}
          onBack={back}
          onFinish={() => setRoute({ name: "feed" })}
        />
      );
    }
    case "feed":
      return (
        <FeedPage
          onTab={tab}
          onBack={() => setRoute({ name: "profile" })}
          onOpenDetail={(wordId) => setRoute({ name: "detail", wordId })}
        />
      );
    case "detail":
      return (
        <WordDetailPage
          wordId={route.wordId}
          onBack={() => setRoute({ name: "feed" })}
          onShare={(id) => setRoute({ name: "share", wordId: id })}
        />
      );
    case "share":
      return (
        <SharePreviewPage
          wordId={route.wordId}
          onBack={() => setRoute({ name: "detail", wordId: route.wordId })}
        />
      );
    case "bookmarks":
      return (
        <BookmarksPage
          onTab={tab}
          onBack={() => setRoute({ name: "profile" })}
          onOpenDetail={(wordId) => setRoute({ name: "detail", wordId })}
        />
      );
    case "known":
      return (
        <KnownPage
          onTab={tab}
          onBack={() => setRoute({ name: "profile" })}
          onOpenDetail={(wordId) => setRoute({ name: "detail", wordId })}
        />
      );
    case "revisit":
      return (
        <RevisitPage
          onTab={tab}
          onBack={() => setRoute({ name: "feed" })}
          onOpenDetail={(wordId) => setRoute({ name: "detail", wordId })}
        />
      );
    case "stats":
      return <StatsPage onTab={tab} onBack={() => setRoute({ name: "profile" })} />;
    case "profile":
      return (
        <ProfilePage
          onTab={tab}
          onBack={() => setRoute({ name: "feed" })}
          onSettings={() => setRoute({ name: "settings" })}
          onSignIn={() => setRoute({ name: "signin" })}
          onPaywall={() => setRoute({ name: "paywall" })}
          onBookmarks={() => setRoute({ name: "bookmarks" })}
          onKnown={() => setRoute({ name: "known" })}
          onStats={() => setRoute({ name: "stats" })}
        />
      );
    case "settings":
      return (
        <SettingsPage
          onBack={() => setRoute({ name: "profile" })}
          onOpenStylePicker={() => setRoute({ name: "style" })}
        />
      );
    case "style":
      return (
        <StylePickerPage
          onBack={() => setRoute({ name: "settings" })}
          onSave={() => setRoute({ name: "feed" })}
          onPaywall={() => setRoute({ name: "paywall" })}
        />
      );
    case "browse":
      return (
        <BrowsePage
          onTab={tab}
          onBack={() => setRoute({ name: "feed" })}
          onApply={() => setRoute({ name: "feed" })}
        />
      );
    case "search":
      return (
        <SearchPage
          onBack={() => setRoute({ name: "feed" })}
          onOpenDetail={(wordId) => setRoute({ name: "detail", wordId })}
        />
      );
    case "paywall":
      return <PaywallPage onBack={() => setRoute({ name: "profile" })} />;
    case "empty":
      return (
        <EmptyStatePage
          onBack={() => setRoute({ name: "feed" })}
          onPrimary={() => setRoute({ name: "browse" })}
        />
      );
    case "error":
      return (
        <ErrorStatePage
          onBack={() => setRoute({ name: "feed" })}
          onRetry={() => setRoute({ name: "splash" })}
        />
      );
    case "signin":
      return <SignInPage onBack={() => setRoute({ name: "profile" })} />;
  }
}

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame
        label="00 · Full app"
        caption={
          <>
            Hash-router-free integrated preview · onboarding → feed → detail → ··· → settings ·{" "}
            <kbd>esc</kbd> jumps to feed
          </>
        }
      >
        <Shell />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
