class AppUser {
  final int? id;
  final String deviceId;
  final String? clerkId;
  final String uiLanguage;
  final int? preferredStyleId;
  final String preferredTtsAccent;
  final String learningGoal;
  final int dailyGoal;
  final String? examDate;
  final int discoveryStreakDays;
  final String? lastActiveDate;
  final String? premiumUntil;

  const AppUser({
    this.id,
    required this.deviceId,
    this.clerkId,
    this.uiLanguage = 'zh-TW',
    this.preferredStyleId,
    this.preferredTtsAccent = 'en-US',
    this.learningGoal = 'casual',
    this.dailyGoal = 5,
    this.examDate,
    this.discoveryStreakDays = 0,
    this.lastActiveDate,
    this.premiumUntil,
  });

  bool get isPremium {
    if (premiumUntil == null) return false;
    return DateTime.tryParse(premiumUntil!)?.isAfter(DateTime.now()) ?? false;
  }

  AppUser copyWith({
    int? id,
    String? deviceId,
    String? clerkId,
    String? uiLanguage,
    int? preferredStyleId,
    String? preferredTtsAccent,
    String? learningGoal,
    int? dailyGoal,
    String? examDate,
    int? discoveryStreakDays,
    String? lastActiveDate,
    String? premiumUntil,
  }) {
    return AppUser(
      id: id ?? this.id,
      deviceId: deviceId ?? this.deviceId,
      clerkId: clerkId ?? this.clerkId,
      uiLanguage: uiLanguage ?? this.uiLanguage,
      preferredStyleId: preferredStyleId ?? this.preferredStyleId,
      preferredTtsAccent: preferredTtsAccent ?? this.preferredTtsAccent,
      learningGoal: learningGoal ?? this.learningGoal,
      dailyGoal: dailyGoal ?? this.dailyGoal,
      examDate: examDate ?? this.examDate,
      discoveryStreakDays: discoveryStreakDays ?? this.discoveryStreakDays,
      lastActiveDate: lastActiveDate ?? this.lastActiveDate,
      premiumUntil: premiumUntil ?? this.premiumUntil,
    );
  }

  factory AppUser.fromJson(Map<String, dynamic> j, {required String fallbackDeviceId}) {
    return AppUser(
      id: j['id'] as int?,
      deviceId: j['deviceId'] as String? ?? fallbackDeviceId,
      clerkId: j['clerkId'] as String?,
      uiLanguage: j['uiLanguage'] as String? ?? 'zh-TW',
      preferredStyleId: j['preferredStyleId'] as int?,
      preferredTtsAccent: j['preferredTtsAccent'] as String? ?? 'en-US',
      learningGoal: j['learningGoal'] as String? ?? 'casual',
      dailyGoal: (j['dailyGoal'] as num?)?.toInt() ?? 5,
      examDate: j['examDate'] as String?,
      discoveryStreakDays: (j['discoveryStreakDays'] as num?)?.toInt() ?? 0,
      lastActiveDate: j['lastActiveDate'] as String?,
      premiumUntil: j['premiumUntil'] as String?,
    );
  }
}
