class UserStats {
  final int streak;
  final int todayCount;
  final int dailyGoal;
  final int totalKnown;
  final int totalBookmarked;
  final int projected30;
  final int projected90;
  final List<int> recent14;

  const UserStats({
    this.streak = 0,
    this.todayCount = 0,
    this.dailyGoal = 5,
    this.totalKnown = 0,
    this.totalBookmarked = 0,
    this.projected30 = 0,
    this.projected90 = 0,
    this.recent14 = const [],
  });

  factory UserStats.fromJson(Map<String, dynamic> j) {
    return UserStats(
      streak: (j['streak'] as num?)?.toInt() ?? 0,
      todayCount: (j['todayCount'] as num?)?.toInt() ?? 0,
      dailyGoal: (j['dailyGoal'] as num?)?.toInt() ?? 5,
      totalKnown: (j['totalKnown'] as num?)?.toInt() ?? 0,
      totalBookmarked: (j['totalBookmarked'] as num?)?.toInt() ?? 0,
      projected30: (j['projected30'] as num?)?.toInt() ?? 0,
      projected90: (j['projected90'] as num?)?.toInt() ?? 0,
      recent14: ((j['recent14'] as List?) ?? [])
          .map((e) => (e as num).toInt())
          .toList(),
    );
  }
}
