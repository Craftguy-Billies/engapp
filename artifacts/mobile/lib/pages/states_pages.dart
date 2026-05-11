// 19. Empty / All caught up · 20. Error / Offline · 21. Sign-in placeholder

import 'package:flutter/material.dart';

import '../theme/theme.dart';
import '../widgets/page_header.dart';
import '../widgets/primitives.dart';

class EmptyStatePage extends StatelessWidget {
  final VoidCallback onPrimary;
  final VoidCallback? onSecondary;
  final VoidCallback? onBack;
  const EmptyStatePage({
    super.key,
    required this.onPrimary,
    this.onSecondary,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return _StateScaffold(
      onBack: onBack,
      icon: Icons.celebration_rounded,
      accent: AppColors.accent,
      title: 'All caught up',
      body: '今天的單字已經看完囉。要不要鬆一下，或試試其他類別？',
      primaryLabel: 'Browse another category',
      onPrimary: onPrimary,
      secondaryLabel: 'Open settings',
      onSecondary: onSecondary,
    );
  }
}

class ErrorStatePage extends StatelessWidget {
  final VoidCallback onRetry;
  final VoidCallback? onBack;
  const ErrorStatePage({super.key, required this.onRetry, this.onBack});

  @override
  Widget build(BuildContext context) {
    return _StateScaffold(
      onBack: onBack,
      icon: Icons.wifi_off_rounded,
      accent: AppColors.pop,
      title: 'Connection lost',
      body: '我們暫時連不到伺服器。先把離線時的動作存起來，待會兒會自動補上。',
      primaryLabel: 'Retry',
      onPrimary: onRetry,
    );
  }
}

class SignInPage extends StatelessWidget {
  final VoidCallback? onBack;
  const SignInPage({super.key, this.onBack});

  @override
  Widget build(BuildContext context) {
    return _StateScaffold(
      onBack: onBack,
      icon: Icons.login_rounded,
      accent: AppColors.lilac,
      title: 'Sign in (coming soon)',
      body: '日後可以用 Clerk 同步進度到雲端。在那之前，所有資料都跟著你的裝置走。',
      primaryLabel: 'Got it',
      onPrimary: onBack ?? () {},
    );
  }
}

class _StateScaffold extends StatelessWidget {
  final IconData icon;
  final Color accent;
  final String title;
  final String body;
  final String primaryLabel;
  final VoidCallback onPrimary;
  final String? secondaryLabel;
  final VoidCallback? onSecondary;
  final VoidCallback? onBack;

  const _StateScaffold({
    required this.icon,
    required this.accent,
    required this.title,
    required this.body,
    required this.primaryLabel,
    required this.onPrimary,
    this.secondaryLabel,
    this.onSecondary,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(title: '', onBack: onBack),
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 96,
                        height: 96,
                        decoration: BoxDecoration(
                          color: accent.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(AppRadii.xl),
                        ),
                        child: Icon(icon, size: 44, color: AppColors.ink),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        title,
                        style: AppFonts.display(
                          size: 26,
                          weight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        body,
                        textAlign: TextAlign.center,
                        style: AppFonts.serif(
                          size: 14,
                          color: AppColors.mute,
                          height: 1.6,
                        ),
                      ),
                      const SizedBox(height: 24),
                      ChunkyButton(label: primaryLabel, onTap: onPrimary),
                      if (secondaryLabel != null && onSecondary != null) ...[
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: onSecondary,
                          child: Text(
                            secondaryLabel!,
                            style: AppFonts.sans(
                              size: 13,
                              weight: FontWeight.w500,
                              color: AppColors.mute,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
