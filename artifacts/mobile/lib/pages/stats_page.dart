// 11. Stats / Progress

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/page_header.dart';
import '../widgets/primitives.dart';

class StatsPage extends StatelessWidget {
  final VoidCallback? onBack;
  const StatsPage({super.key, this.onBack});

  @override
  Widget build(BuildContext context) {
    final s = context.watch<EngappStore>().stats;
    final progress = s.dailyGoal == 0 ? 0.0 : (s.todayCount / s.dailyGoal).clamp(0.0, 1.0);

    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(
              title: 'Progress',
              subtitle: '一點一點，會看到變化的。',
              onBack: onBack,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                children: [
                  CardSurface(
                    background: AppColors.ink,
                    padding: const EdgeInsets.all(22),
                    child: Row(
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Streak',
                              style: AppFonts.sans(
                                size: 12,
                                color: AppColors.muteSoft,
                                weight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '${s.streak}',
                                  style: AppFonts.display(
                                    size: 56,
                                    weight: FontWeight.w700,
                                    color: AppColors.accent,
                                    height: 1,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 8),
                                  child: Text(
                                    'days',
                                    style: AppFonts.sans(
                                      size: 12,
                                      color: AppColors.muteSoft,
                                      weight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const Spacer(),
                        const Icon(
                          Icons.local_fire_department_rounded,
                          color: AppColors.pop,
                          size: 52,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  CardSurface(
                    child: Row(
                      children: [
                        ProgressRing(
                          progress: progress,
                          size: 86,
                          stroke: 8,
                          color: AppColors.ink,
                          trackColor: AppColors.hairline,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '${s.todayCount}/${s.dailyGoal}',
                                style: AppFonts.display(
                                  size: 18,
                                  weight: FontWeight.w700,
                                  color: AppColors.ink,
                                ),
                              ),
                              Text(
                                'today',
                                style: AppFonts.sans(
                                  size: 10,
                                  color: AppColors.mute,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 18),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Today\'s goal',
                                style: AppFonts.sans(
                                  size: 13,
                                  weight: FontWeight.w600,
                                  color: AppColors.ink,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                progress >= 1
                                    ? '達標！明天繼續。'
                                    : '再 ${s.dailyGoal - s.todayCount} 個就達標。',
                                style: AppFonts.serif(
                                  size: 12,
                                  color: AppColors.mute,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _NumStat(
                          label: 'Known',
                          value: s.totalKnown,
                          accent: AppColors.sage,
                          icon: Icons.check_rounded,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _NumStat(
                          label: 'Saved',
                          value: s.totalBookmarked,
                          accent: AppColors.blush,
                          icon: Icons.favorite_rounded,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  CardSurface(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SoftLabel('Projection'),
                        const SizedBox(height: 6),
                        Text(
                          'At this pace',
                          style: AppFonts.display(
                            size: 18,
                            weight: FontWeight.w600,
                            color: AppColors.ink,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: _ProjectionTile(
                                days: 30,
                                count: s.projected30,
                                color: AppColors.butter,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _ProjectionTile(
                                days: 90,
                                count: s.projected90,
                                color: AppColors.peach,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  if (s.recent14.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    CardSurface(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SoftLabel('Last 14 days'),
                          const SizedBox(height: 14),
                          SizedBox(
                            height: 90,
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                for (var i = 0; i < s.recent14.length; i++) ...[
                                  Expanded(
                                    child: Container(
                                      height: (s.recent14[i] / 8 * 90).clamp(6, 90),
                                      margin: const EdgeInsets.symmetric(horizontal: 2),
                                      decoration: BoxDecoration(
                                        color: tagPastel(i),
                                        borderRadius:
                                            BorderRadius.circular(AppRadii.xs),
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NumStat extends StatelessWidget {
  final String label;
  final int value;
  final Color accent;
  final IconData icon;
  const _NumStat({
    required this.label,
    required this.value,
    required this.accent,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return CardSurface(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: accent,
                  borderRadius: BorderRadius.circular(AppRadii.sm),
                ),
                child: Icon(icon, color: AppColors.ink, size: 14),
              ),
              const SizedBox(width: 8),
              SoftLabel(label),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '$value',
            style: AppFonts.display(
              size: 30,
              weight: FontWeight.w700,
              color: AppColors.ink,
            ),
          ),
          Text(
            'words',
            style: AppFonts.sans(size: 11, color: AppColors.mute),
          ),
        ],
      ),
    );
  }
}

class _ProjectionTile extends StatelessWidget {
  final int days;
  final int count;
  final Color color;
  const _ProjectionTile({required this.days, required this.count, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.55),
        borderRadius: BorderRadius.circular(AppRadii.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$days days',
            style: AppFonts.sans(
              size: 11,
              weight: FontWeight.w600,
              color: AppColors.mute,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '$count',
            style: AppFonts.display(
              size: 28,
              weight: FontWeight.w700,
              color: AppColors.ink,
            ),
          ),
          Text(
            'words',
            style: AppFonts.serif(size: 11, color: AppColors.mute),
          ),
        ],
      ),
    );
  }
}
