// Integrated app shell — Flutter port of artifacts/mockup-sandbox 00-app.tsx.
//
// One in-memory router walks all 21 pages without using the browser URL.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'pages/browse_page.dart';
import 'pages/feed_page.dart';
import 'pages/list_pages.dart';
import 'pages/onboarding_pages.dart';
import 'pages/paywall_page.dart';
import 'pages/preview_picker_page.dart';
import 'pages/profile_page.dart';
import 'pages/search_page.dart';
import 'pages/settings_page.dart';
import 'pages/share_preview_page.dart';
import 'pages/splash_page.dart';
import 'pages/states_pages.dart';
import 'pages/stats_page.dart';
import 'pages/style_picker_page.dart';
import 'pages/tutorial_page.dart';
import 'pages/word_detail_page.dart';
import 'store/engapp_store.dart';
import 'theme/theme.dart';
import 'widgets/tab_bar.dart';

enum _Route {
  splash,
  tutorial,
  onboardingLanguage,
  onboardingExam,
  onboardingDaily,
  onboardingStyle,
  feed,
  detail,
  bookmarks,
  known,
  revisit,
  stats,
  profile,
  settings,
  stylePicker,
  browse,
  search,
  sharePreview,
  paywall,
  empty,
  error,
  signin,
  previews,
}

class _RouteEntry {
  final _Route route;
  final int? wordId;
  const _RouteEntry(this.route, {this.wordId});
}

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  final List<_RouteEntry> _stack = [const _RouteEntry(_Route.splash)];
  TabKey _tab = TabKey.feed;

  _RouteEntry get _current => _stack.last;

  void _push(_RouteEntry entry) {
    setState(() {
      _stack.add(entry);
      _tab = _tabForRoute(entry.route);
    });
  }

  void _replace(_RouteEntry entry) {
    setState(() {
      _stack
        ..clear()
        ..add(entry);
      _tab = _tabForRoute(entry.route);
    });
  }

  void _pop() {
    setState(() {
      if (_stack.length > 1) _stack.removeLast();
      _tab = _tabForRoute(_current.route);
    });
  }

  void _selectTab(TabKey key) {
    switch (key) {
      case TabKey.feed:
        _replace(const _RouteEntry(_Route.feed));
        break;
      case TabKey.browse:
        _replace(const _RouteEntry(_Route.browse));
        break;
      case TabKey.revisit:
        _replace(const _RouteEntry(_Route.revisit));
        break;
      case TabKey.saved:
        _replace(const _RouteEntry(_Route.bookmarks));
        break;
      case TabKey.me:
        _replace(const _RouteEntry(_Route.profile));
        break;
    }
  }

  TabKey _tabForRoute(_Route r) {
    switch (r) {
      case _Route.feed:
      case _Route.detail:
      case _Route.sharePreview:
      case _Route.empty:
        return TabKey.feed;
      case _Route.browse:
      case _Route.search:
        return TabKey.browse;
      case _Route.revisit:
        return TabKey.revisit;
      case _Route.bookmarks:
      case _Route.known:
        return TabKey.saved;
      case _Route.profile:
      case _Route.settings:
      case _Route.stylePicker:
      case _Route.paywall:
      case _Route.signin:
      case _Route.stats:
        return TabKey.me;
      default:
        return TabKey.feed;
    }
  }

  bool _showTabs(_Route r) {
    switch (r) {
      case _Route.splash:
      case _Route.tutorial:
      case _Route.onboardingLanguage:
      case _Route.onboardingExam:
      case _Route.onboardingDaily:
      case _Route.onboardingStyle:
      case _Route.paywall:
      case _Route.error:
      case _Route.signin:
      case _Route.previews:
        return false;
      default:
        return true;
    }
  }

  Widget _buildPage() {
    final entry = _current;
    switch (entry.route) {
      case _Route.splash:
        return SplashPage(onReady: () {
          final store = context.read<EngappStore>();
          if (!store.tutorialSeen) {
            _replace(const _RouteEntry(_Route.tutorial));
            return;
          }
          final user = store.user;
          // Skip onboarding only if user has previously customised both fields.
          if (user.dailyGoal == 5 && user.uiLanguage == 'zh-TW' && user.preferredStyleId == null) {
            _replace(const _RouteEntry(_Route.onboardingLanguage));
          } else {
            _replace(const _RouteEntry(_Route.feed));
          }
        });
      case _Route.tutorial:
        return TutorialPage(onDone: () {
          final user = context.read<EngappStore>().user;
          if (user.dailyGoal == 5 && user.uiLanguage == 'zh-TW' && user.preferredStyleId == null) {
            _replace(const _RouteEntry(_Route.onboardingLanguage));
          } else {
            _replace(const _RouteEntry(_Route.feed));
          }
        });
      case _Route.onboardingLanguage:
        return OnboardingLanguagePage(
            onNext: () => _replace(const _RouteEntry(_Route.onboardingExam)));
      case _Route.onboardingExam:
        return OnboardingExamPage(
            onNext: () => _replace(const _RouteEntry(_Route.onboardingDaily)));
      case _Route.onboardingDaily:
        return OnboardingDailyPage(
            onNext: () => _replace(const _RouteEntry(_Route.onboardingStyle)));
      case _Route.onboardingStyle:
        return OnboardingStylePage(
          onNext: () => _replace(const _RouteEntry(_Route.feed)),
          onPremium: () => _push(const _RouteEntry(_Route.paywall)),
        );
      case _Route.feed:
        return FeedPage(
          onOpenBrowse: () => _push(const _RouteEntry(_Route.browse)),
          onOpenSearch: () => _push(const _RouteEntry(_Route.search)),
        );
      case _Route.detail:
        return WordDetailPage(
          wordId: entry.wordId!,
          onBack: _pop,
          onShare: () => _push(_RouteEntry(_Route.sharePreview, wordId: entry.wordId)),
        );
      case _Route.bookmarks:
        return BookmarksPage(
          onOpenDetail: (id) => _push(_RouteEntry(_Route.detail, wordId: id)),
        );
      case _Route.known:
        return KnownPage(
          onOpenDetail: (id) => _push(_RouteEntry(_Route.detail, wordId: id)),
          onBack: _pop,
        );
      case _Route.revisit:
        return RevisitPage(
          onOpenDetail: (id) => _push(_RouteEntry(_Route.detail, wordId: id)),
        );
      case _Route.stats:
        return StatsPage(onBack: _pop);
      case _Route.profile:
        return ProfilePage(
          onOpenBookmarks: () => _push(const _RouteEntry(_Route.bookmarks)),
          onOpenKnown: () => _push(const _RouteEntry(_Route.known)),
          onOpenStats: () => _push(const _RouteEntry(_Route.stats)),
          onOpenSettings: () => _push(const _RouteEntry(_Route.settings)),
          onOpenSignIn: () => _push(const _RouteEntry(_Route.signin)),
          onOpenPaywall: () => _push(const _RouteEntry(_Route.paywall)),
        );
      case _Route.settings:
        return SettingsPage(
          onBack: _pop,
          onOpenStylePicker: () => _push(const _RouteEntry(_Route.stylePicker)),
        );
      case _Route.stylePicker:
        return StylePickerPage(
          onBack: _pop,
          onPremium: () => _push(const _RouteEntry(_Route.paywall)),
        );
      case _Route.browse:
        return BrowsePage(
          onApplied: () => _replace(const _RouteEntry(_Route.feed)),
          onBack: _pop,
        );
      case _Route.search:
        return SearchPage(
          onOpenDetail: (id) => _push(_RouteEntry(_Route.detail, wordId: id)),
          onBack: _pop,
        );
      case _Route.sharePreview:
        return SharePreviewPage(wordId: entry.wordId!, onBack: _pop);
      case _Route.paywall:
        return PaywallPage(onBack: _pop);
      case _Route.empty:
        return EmptyStatePage(
          onPrimary: () => _replace(const _RouteEntry(_Route.browse)),
          onSecondary: () => _push(const _RouteEntry(_Route.settings)),
          onBack: _pop,
        );
      case _Route.error:
        return ErrorStatePage(
          onRetry: () => _replace(const _RouteEntry(_Route.splash)),
          onBack: _pop,
        );
      case _Route.signin:
        return SignInPage(onBack: _pop);
      case _Route.previews:
        return PreviewPickerPage(
          onOpen: (r) => _push(_RouteEntry(r, wordId: r == _Route.detail || r == _Route.sharePreview ? 1247 : null)),
          onBack: _pop,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final route = _current.route;
    final showTabs = _showTabs(route);
    return Stack(
      children: [
        Column(
          children: [
            Expanded(child: _buildPage()),
            if (showTabs) AppTabBar(current: _tab, onTap: _selectTab),
          ],
        ),
        Positioned(
          top: MediaQuery.of(context).padding.top + 8,
          right: 12,
          child: _PreviewsButton(
            onTap: () => _push(const _RouteEntry(_Route.previews)),
          ),
        ),
      ],
    );
  }
}

class _PreviewsButton extends StatelessWidget {
  final VoidCallback onTap;
  const _PreviewsButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadii.pill),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.ink.withValues(alpha: 0.85),
            borderRadius: BorderRadius.circular(AppRadii.pill),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.grid_view_rounded, color: AppColors.accent, size: 12),
              const SizedBox(width: 4),
              Text(
                'Previews',
                style: AppFonts.sans(
                  size: 10,
                  weight: FontWeight.w700,
                  color: AppColors.paper,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Exported route enum for the preview picker.
typedef AppRoute = _Route;
const AppRoute appRouteSplash = _Route.splash;
const AppRoute appRouteTutorial = _Route.tutorial;
const AppRoute appRouteOnboardingLanguage = _Route.onboardingLanguage;
const AppRoute appRouteOnboardingExam = _Route.onboardingExam;
const AppRoute appRouteOnboardingDaily = _Route.onboardingDaily;
const AppRoute appRouteOnboardingStyle = _Route.onboardingStyle;
const AppRoute appRouteFeed = _Route.feed;
const AppRoute appRouteDetail = _Route.detail;
const AppRoute appRouteBookmarks = _Route.bookmarks;
const AppRoute appRouteKnown = _Route.known;
const AppRoute appRouteRevisit = _Route.revisit;
const AppRoute appRouteStats = _Route.stats;
const AppRoute appRouteProfile = _Route.profile;
const AppRoute appRouteSettings = _Route.settings;
const AppRoute appRouteStylePicker = _Route.stylePicker;
const AppRoute appRouteBrowse = _Route.browse;
const AppRoute appRouteSearch = _Route.search;
const AppRoute appRouteSharePreview = _Route.sharePreview;
const AppRoute appRoutePaywall = _Route.paywall;
const AppRoute appRouteEmpty = _Route.empty;
const AppRoute appRouteError = _Route.error;
const AppRoute appRouteSignin = _Route.signin;
