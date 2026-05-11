// HTTP wrapper that adds the X-Device-Id header on every user-scoped call.
// Falls back to mock data on any error so design-time previews keep working.

import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

import '../models/stats.dart';
import '../models/style.dart';
import '../models/user.dart';
import '../models/word.dart';
import 'mock_data.dart';

class EngappApi {
  EngappApi._({required this.baseUrl, required this.deviceId});

  final String baseUrl;
  final String deviceId;

  static Future<EngappApi> create() async {
    final prefs = await SharedPreferences.getInstance();

    var deviceId = prefs.getString('engapp.deviceId');
    if (deviceId == null || deviceId.isEmpty) {
      deviceId = const Uuid().v4();
      await prefs.setString('engapp.deviceId', deviceId);
    }

    final stored = prefs.getString('engapp.apiBase');
    final baseUrl = (stored != null && stored.isNotEmpty)
        ? stored
        : const String.fromEnvironment(
            'ENGAPP_API_BASE',
            defaultValue: '',
          );

    return EngappApi._(baseUrl: baseUrl, deviceId: deviceId);
  }

  Future<void> setApiBase(String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('engapp.apiBase', value);
  }

  bool get hasBackend => baseUrl.isNotEmpty;

  Uri _uri(String path, [Map<String, String>? params]) {
    final root = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final norm = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$root$norm').replace(queryParameters: params);
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId,
      };

  /// Public — Healthcheck
  Future<bool> healthz() async {
    if (!hasBackend) return false;
    try {
      final res = await http.get(_uri('/healthz')).timeout(const Duration(seconds: 4));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// GET /api/words/styles/list
  Future<List<IllustrationStyle>> stylesList() async {
    if (!hasBackend) return mockStyles();
    try {
      final res = await http
          .get(_uri('/words/styles/list'), headers: _headers)
          .timeout(const Duration(seconds: 6));
      if (res.statusCode != 200) return mockStyles();
      final body = jsonDecode(res.body);
      final list = body is List ? body : (body is Map ? body['data'] as List? : null);
      if (list == null) return mockStyles();
      return list.map((e) => IllustrationStyle.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return mockStyles();
    }
  }

  /// GET /api/words/feed
  Future<List<WordCardData>> feed({
    int limit = 10,
    String? styleSlug,
    String? cefr,
    String? themeTag,
    String? examTag,
  }) async {
    if (!hasBackend) return mockWords();
    final params = <String, String>{'limit': '$limit'};
    if (styleSlug != null) params['styleSlug'] = styleSlug;
    if (cefr != null) params['cefr'] = cefr;
    if (themeTag != null) params['themeTag'] = themeTag;
    if (examTag != null) params['examTag'] = examTag;
    try {
      final res = await http
          .get(_uri('/words/feed', params), headers: _headers)
          .timeout(const Duration(seconds: 6));
      if (res.statusCode != 200) return mockWords();
      final body = jsonDecode(res.body);
      final list = body is List ? body : (body is Map ? body['data'] as List? : null);
      if (list == null) return mockWords();
      return list.map((e) => WordCardData.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return mockWords();
    }
  }

  /// GET /api/words/:id
  Future<WordCardData?> word(int id) async {
    final fallback = mockWords().where((w) => w.id == id).cast<WordCardData?>().firstWhere(
          (_) => true,
          orElse: () => null,
        );
    if (!hasBackend) return fallback;
    try {
      final res = await http.get(_uri('/words/$id'), headers: _headers).timeout(const Duration(seconds: 6));
      if (res.statusCode != 200) return fallback;
      return WordCardData.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
    } catch (_) {
      return fallback;
    }
  }

  String resolveImageUrl(String relativeOrAbsolute) {
    if (relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://')) {
      return relativeOrAbsolute;
    }
    if (!hasBackend) return relativeOrAbsolute;
    final root = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    return relativeOrAbsolute.startsWith('/') ? '$root$relativeOrAbsolute' : '$root/$relativeOrAbsolute';
  }

  /// GET /api/user/me
  Future<AppUser> me() async {
    if (!hasBackend) {
      return AppUser(
        deviceId: deviceId,
        uiLanguage: 'zh-TW',
        learningGoal: 'casual',
        dailyGoal: 5,
        preferredStyleId: 1,
        preferredTtsAccent: 'en-US',
        discoveryStreakDays: 47,
      );
    }
    try {
      final res = await http.get(_uri('/user/me'), headers: _headers).timeout(const Duration(seconds: 6));
      if (res.statusCode != 200) {
        return AppUser(deviceId: deviceId);
      }
      return AppUser.fromJson(
        jsonDecode(res.body) as Map<String, dynamic>,
        fallbackDeviceId: deviceId,
      );
    } catch (_) {
      return AppUser(deviceId: deviceId);
    }
  }

  /// PATCH /api/user/me
  Future<void> patchMe(Map<String, dynamic> patch) async {
    if (!hasBackend) return;
    try {
      await http
          .patch(_uri('/user/me'), headers: _headers, body: jsonEncode(patch))
          .timeout(const Duration(seconds: 6));
    } catch (_) {
      // swallow — optimistic UI already applied
    }
  }

  /// GET /api/user/stats
  Future<UserStats> stats() async {
    if (!hasBackend) {
      return const UserStats(
        streak: 47,
        todayCount: 3,
        dailyGoal: 5,
        totalKnown: 312,
        totalBookmarked: 84,
        projected30: 150,
        projected90: 450,
        recent14: [4, 6, 3, 5, 7, 4, 6, 5, 8, 4, 6, 5, 7, 3],
      );
    }
    try {
      final res = await http.get(_uri('/user/stats'), headers: _headers).timeout(const Duration(seconds: 6));
      if (res.statusCode != 200) return const UserStats();
      return UserStats.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
    } catch (_) {
      return const UserStats();
    }
  }

  /// GET /api/user/bookmarks
  Future<List<int>> bookmarkIds() async {
    if (!hasBackend) return [];
    try {
      final res = await http.get(_uri('/user/bookmarks'), headers: _headers).timeout(const Duration(seconds: 6));
      if (res.statusCode != 200) return [];
      final body = jsonDecode(res.body);
      final list = body is List ? body : (body is Map ? body['data'] as List? : null);
      if (list == null) return [];
      return list
          .map((e) => (e is Map ? e['wordId'] : e) as num)
          .map((n) => n.toInt())
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> addBookmark(int wordId) async {
    if (!hasBackend) return;
    try {
      await http
          .post(_uri('/user/bookmarks'),
              headers: _headers, body: jsonEncode({'wordId': wordId}))
          .timeout(const Duration(seconds: 6));
    } catch (_) {}
  }

  Future<void> removeBookmark(int wordId) async {
    if (!hasBackend) return;
    try {
      await http.delete(_uri('/user/bookmarks/$wordId'), headers: _headers).timeout(const Duration(seconds: 6));
    } catch (_) {}
  }

  /// GET /api/user/known
  Future<List<int>> knownIds() async {
    if (!hasBackend) return [];
    try {
      final res = await http.get(_uri('/user/known'), headers: _headers).timeout(const Duration(seconds: 6));
      if (res.statusCode != 200) return [];
      final body = jsonDecode(res.body);
      final list = body is List ? body : (body is Map ? body['data'] as List? : null);
      if (list == null) return [];
      return list
          .map((e) => (e is Map ? e['wordId'] : e) as num)
          .map((n) => n.toInt())
          .toList();
    } catch (_) {}
    return [];
  }

  Future<void> markKnown(int wordId) async {
    if (!hasBackend) return;
    try {
      await http
          .post(_uri('/user/known'), headers: _headers, body: jsonEncode({'wordId': wordId}))
          .timeout(const Duration(seconds: 6));
    } catch (_) {}
  }

  Future<List<int>> revisitIds() async {
    if (!hasBackend) return [];
    try {
      final res = await http.get(_uri('/user/revisit'), headers: _headers).timeout(const Duration(seconds: 6));
      if (res.statusCode != 200) return [];
      final body = jsonDecode(res.body);
      final list = body is List ? body : (body is Map ? body['data'] as List? : null);
      if (list == null) return [];
      return list
          .map((e) => (e is Map ? e['wordId'] : e) as num)
          .map((n) => n.toInt())
          .toList();
    } catch (_) {}
    return [];
  }

  Future<void> markSeen(int wordId) async {
    if (!hasBackend) return;
    try {
      await http
          .post(_uri('/user/seen'), headers: _headers, body: jsonEncode({'wordId': wordId}))
          .timeout(const Duration(seconds: 6));
    } catch (_) {}
  }
}
