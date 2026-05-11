// 12. Profile

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/page_header.dart';
import '../widgets/primitives.dart';

class ProfilePage extends StatelessWidget {
  final VoidCallback onOpenBookmarks;
  final VoidCallback onOpenKnown;
  final VoidCallback onOpenStats;
  final VoidCallback onOpenSettings;
  final VoidCallback onOpenSignIn;
  final VoidCallback onOpenPaywall;
  const ProfilePage({
    super.key,
    required this.onOpenBookmarks,
    required this.onOpenKnown,
    required this.onOpenStats,
    required this.onOpenSettings,
    required this.onOpenSignIn,
    required this.onOpenPaywall,
  });

  @override
  Widget build(BuildContext context) {
    final store = context.watch<EngappStore>();
    final user = store.user;
    final stats = store.stats;

    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(
              title: 'Me',
              subtitle: '你的學習面板。',
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 28),
                children: [
                  CardSurface(
                    padding: const EdgeInsets.all(18),
                    background: AppColors.cardAlt,
                    child: Row(
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: AppColors.accent,
                            borderRadius: BorderRadius.circular(AppRadii.pill),
                            boxShadow: AppShadows.soft(),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'e',
                            style: AppFonts.display(
                              size: 30,
                              weight: FontWeight.w700,
                              color: AppColors.ink,
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Hello, friend',
                                style: AppFonts.display(
                                  size: 20,
                                  weight: FontWeight.w700,
                                  color: AppColors.ink,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'device · ${_short(user.deviceId)}',
                                style: AppFonts.sans(
                                  size: 11,
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
                      Expanded(child: _StatChip(label: 'Streak', value: '${stats.streak}', accent: AppColors.pop, icon: Icons.local_fire_department_rounded)),
                      const SizedBox(width: 10),
                      Expanded(child: _StatChip(label: 'Known', value: '${stats.totalKnown}', accent: AppColors.sage, icon: Icons.check_rounded)),
                      const SizedBox(width: 10),
                      Expanded(child: _StatChip(label: 'Saved', value: '${stats.totalBookmarked}', accent: AppColors.blush, icon: Icons.favorite_rounded)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _Row(
                    icon: Icons.favorite_rounded,
                    accent: AppColors.blush,
                    title: 'Saved words',
                    subtitle: '${stats.totalBookmarked} 個收藏',
                    onTap: onOpenBookmarks,
                  ),
                  const SizedBox(height: 8),
                  _Row(
                    icon: Icons.check_rounded,
                    accent: AppColors.sage,
                    title: 'Known words',
                    subtitle: '${stats.totalKnown} 個已掌握',
                    onTap: onOpenKnown,
                  ),
                  const SizedBox(height: 8),
                  _Row(
                    icon: Icons.bar_chart_rounded,
                    accent: AppColors.butter,
                    title: 'Progress',
                    subtitle: '看一下這幾天的曲線',
                    onTap: onOpenStats,
                  ),
                  const SizedBox(height: 8),
                  _Row(
                    icon: Icons.settings_rounded,
                    accent: AppColors.sky,
                    title: 'Settings',
                    subtitle: '語言、目標、TTS、風格',
                    onTap: onOpenSettings,
                  ),
                  const SizedBox(height: 8),
                  _Row(
                    icon: Icons.workspace_premium_rounded,
                    accent: AppColors.accent,
                    title: 'Go premium',
                    subtitle: 'Unlock all illustration styles',
                    onTap: onOpenPaywall,
                  ),
                  const SizedBox(height: 8),
                  _Row(
                    icon: Icons.login_rounded,
                    accent: AppColors.lilac,
                    title: 'Sign in (coming soon)',
                    subtitle: '日後可跨裝置同步',
                    onTap: onOpenSignIn,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String _short(String id) =>
      id.length <= 8 ? id : '${id.substring(0, 8)}…';
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;
  final Color accent;
  final IconData icon;
  const _StatChip({
    required this.label,
    required this.value,
    required this.accent,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadii.md),
        boxShadow: AppShadows.soft(y: 4, blur: 8, opacity: 0.04),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 26,
            height: 26,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: accent,
              borderRadius: BorderRadius.circular(AppRadii.sm),
            ),
            child: Icon(icon, color: AppColors.ink, size: 14),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppFonts.display(
              size: 20,
              weight: FontWeight.w700,
              color: AppColors.ink,
            ),
          ),
          Text(
            label,
            style: AppFonts.sans(size: 10, color: AppColors.mute, weight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final IconData icon;
  final Color accent;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  const _Row({
    required this.icon,
    required this.accent,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        child: Container(
          padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(AppRadii.lg),
            boxShadow: AppShadows.soft(y: 4, blur: 10, opacity: 0.04),
          ),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: accent,
                  borderRadius: BorderRadius.circular(AppRadii.md),
                ),
                child: Icon(icon, color: AppColors.ink, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      title,
                      style: AppFonts.sans(
                        size: 14,
                        weight: FontWeight.w600,
                        color: AppColors.ink,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: AppFonts.serif(size: 12, color: AppColors.mute),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: AppColors.mute),
            ],
          ),
        ),
      ),
    );
  }
}
