// Lightweight ChangeNotifier store mirroring artifacts/mockup-sandbox _lib/store.tsx.
//
// All mutating actions apply optimistically (UI updates immediately) and fire
// the network request afterwards. If the request fails, state stays the way
// the user expects it.

import 'dart:async';

import 'package:flutter/foundation.dart';

import '../api/api_client.dart';
import '../api/mock_data.dart';
import '../models/stats.dart';
import '../models/style.dart';
import '../models/user.dart';
import '../models/word.dart';

class FeedFilters {
  final String? styleSlug;
  final String? cefr;
  final String? themeTag;
  final String? examTag;

  const FeedFilters({this.styleSlug, this.cefr, this.themeTag, this.examTag});

  FeedFilters copyWith({
    String? styleSlug,
    String? cefr,
    String? themeTag,
    String? examTag,
  }) {
    return FeedFilters(
      styleSlug: styleSlug ?? this.styleSlug,
      cefr: cefr ?? this.cefr,
      themeTag: themeTag ?? this.themeTag,
      examTag: examTag ?? this.examTag,
    );
  }

  bool get isEmpty =>
      styleSlug == null && cefr == null && themeTag == null && examTag == null;
}

class EngappStore extends ChangeNotifier {
  EngappStore({required this.api});

  final EngappApi api;

  bool _ready = false;
  bool get ready => _ready;

  bool _tutorialSeen = false;
  bool get tutorialSeen => _tutorialSeen;

  AppUser _user = const AppUser(deviceId: '');
  AppUser get user => _user;

  UserStats _stats = const UserStats();
  UserStats get stats => _stats;

  List<IllustrationStyle> _styles = const [];
  List<IllustrationStyle> get styles => _styles;

  List<WordCardData> _feed = const [];
  List<WordCardData> get feed => _feed;

  final Set<int> _bookmarks = <int>{};
  Set<int> get bookmarks => _bookmarks;

  final Set<int> _known = <int>{};
  Set<int> get known => _known;

  final Map<int, WordCardData> _wordCache = <int, WordCardData>{};
  Map<int, WordCardData> get wordCache => _wordCache;

  FeedFilters _filters = const FeedFilters();
  FeedFilters get filters => _filters;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  Future<void> boot() async {
    _tutorialSeen = await api.tutorialSeen();
    _user = await api.me();
    _styles = await api.stylesList();
    _feed = await api.feed(limit: 10);
    for (final w in _feed) {
      _wordCache[w.id] = w;
    }
    _bookmarks
      ..clear()
      ..addAll(await api.bookmarkIds());
    _known
      ..clear()
      ..addAll(await api.knownIds());
    _stats = await api.stats();
    _ready = true;
    notifyListeners();
  }

  WordCardData? wordById(int id) {
    return _wordCache[id] ??
        mockWords().where((w) => w.id == id).cast<WordCardData?>().firstWhere(
              (_) => true,
              orElse: () => null,
            );
  }

  Future<void> refreshFeed({FeedFilters? filters}) async {
    if (filters != null) _filters = filters;
    _feed = await api.feed(
      limit: 10,
      styleSlug: _filters.styleSlug,
      cefr: _filters.cefr,
      themeTag: _filters.themeTag,
      examTag: _filters.examTag,
    );
    for (final w in _feed) {
      _wordCache[w.id] = w;
    }
    notifyListeners();
  }

  Future<void> fetchWord(int id) async {
    if (_wordCache.containsKey(id)) return;
    final w = await api.word(id);
    if (w != null) {
      _wordCache[w.id] = w;
      notifyListeners();
    }
  }

  bool isBookmarked(int id) => _bookmarks.contains(id);
  bool isKnown(int id) => _known.contains(id);

  Future<void> toggleBookmark(int wordId) async {
    if (_bookmarks.contains(wordId)) {
      _bookmarks.remove(wordId);
      notifyListeners();
      await api.removeBookmark(wordId);
    } else {
      _bookmarks.add(wordId);
      notifyListeners();
      await api.addBookmark(wordId);
    }
  }

  Future<void> markKnown(int wordId) async {
    _known.add(wordId);
    _stats = UserStats(
      streak: _stats.streak,
      todayCount: _stats.todayCount + 1,
      dailyGoal: _stats.dailyGoal,
      totalKnown: _stats.totalKnown + 1,
      totalBookmarked: _stats.totalBookmarked,
      projected30: _stats.projected30,
      projected90: _stats.projected90,
      recent14: _stats.recent14,
    );
    notifyListeners();
    await api.markKnown(wordId);
  }

  Future<void> markSeen(int wordId) async {
    await api.markSeen(wordId);
  }

  Future<void> markTutorialSeen() async {
    if (_tutorialSeen) return;
    _tutorialSeen = true;
    notifyListeners();
    await api.setTutorialSeen();
  }

  Future<void> patchUser(Map<String, dynamic> patch) async {
    _user = _user.copyWith(
      uiLanguage: patch['uiLanguage'] as String? ?? _user.uiLanguage,
      learningGoal: patch['learningGoal'] as String? ?? _user.learningGoal,
      dailyGoal: (patch['dailyGoal'] as num?)?.toInt() ?? _user.dailyGoal,
      examDate: patch['examDate'] as String? ?? _user.examDate,
      preferredStyleId: (patch['preferredStyleId'] as num?)?.toInt() ?? _user.preferredStyleId,
      preferredTtsAccent: patch['preferredTtsAccent'] as String? ?? _user.preferredTtsAccent,
    );
    notifyListeners();
    await api.patchMe(patch);
  }
}
