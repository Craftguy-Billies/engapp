// 13. Settings

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/page_header.dart';
import '../widgets/primitives.dart';

class SettingsPage extends StatefulWidget {
  final VoidCallback? onBack;
  final VoidCallback onOpenStylePicker;
  const SettingsPage({super.key, this.onBack, required this.onOpenStylePicker});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  String? _open;

  @override
  Widget build(BuildContext context) {
    final store = context.watch<EngappStore>();
    final u = store.user;
    final preferredStyle = store.styles.firstWhere(
      (s) => s.id == u.preferredStyleId,
      orElse: () => store.styles.isNotEmpty
          ? store.styles.first
          : (throw StateError('no styles')),
    );

    final lang = uiLanguages.firstWhere(
      (l) => l.code == u.uiLanguage,
      orElse: () => uiLanguages.first,
    );
    final goal = learningGoals.firstWhere(
      (l) => l.code == u.learningGoal,
      orElse: () => learningGoals.first,
    );

    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(title: 'Settings', subtitle: '微調你的學習設定', onBack: widget.onBack),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                children: [
                  _ExpandableRow(
                    title: 'Language',
                    value: lang.native,
                    accent: AppColors.peach,
                    icon: Icons.translate_rounded,
                    open: _open == 'lang',
                    onToggle: () => setState(() => _open = _open == 'lang' ? null : 'lang'),
                    child: Column(
                      children: [
                        for (final l in uiLanguages)
                          _Pickable(
                            label: l.native,
                            subtitle: l.label,
                            selected: u.uiLanguage == l.code,
                            onTap: () => store.patchUser({'uiLanguage': l.code}),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  _ExpandableRow(
                    title: 'Daily goal',
                    value: '${u.dailyGoal} words / day',
                    accent: AppColors.butter,
                    icon: Icons.flag_rounded,
                    open: _open == 'daily',
                    onToggle: () => setState(() => _open = _open == 'daily' ? null : 'daily'),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final v in dailyGoalOptions)
                          GestureDetector(
                            onTap: () => store.patchUser({'dailyGoal': v}),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                              decoration: BoxDecoration(
                                color: u.dailyGoal == v ? AppColors.ink : AppColors.cardAlt,
                                borderRadius: BorderRadius.circular(AppRadii.pill),
                              ),
                              child: Text(
                                '$v',
                                style: AppFonts.sans(
                                  size: 14,
                                  weight: FontWeight.w700,
                                  color: u.dailyGoal == v ? AppColors.accent : AppColors.ink,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  _ExpandableRow(
                    title: 'Learning goal',
                    value: goal.label,
                    accent: AppColors.sage,
                    icon: Icons.school_rounded,
                    open: _open == 'goal',
                    onToggle: () => setState(() => _open = _open == 'goal' ? null : 'goal'),
                    child: Column(
                      children: [
                        for (final g in learningGoals)
                          _Pickable(
                            label: g.label,
                            subtitle: g.subtitle,
                            selected: u.learningGoal == g.code,
                            onTap: () => store.patchUser({'learningGoal': g.code}),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  _StaticRow(
                    title: 'Exam date',
                    value: u.examDate ?? 'Not set',
                    accent: AppColors.blush,
                    icon: Icons.event_rounded,
                  ),
                  const SizedBox(height: 10),
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: widget.onOpenStylePicker,
                      borderRadius: BorderRadius.circular(AppRadii.lg),
                      child: _StaticRow(
                        title: 'Illustration style',
                        value: preferredStyle.name,
                        accent: AppColors.lilac,
                        icon: Icons.palette_rounded,
                        trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.mute),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  _ExpandableRow(
                    title: 'TTS accent',
                    value: u.preferredTtsAccent == 'en-GB' ? 'British' : 'American',
                    accent: AppColors.sky,
                    icon: Icons.record_voice_over_rounded,
                    open: _open == 'tts',
                    onToggle: () => setState(() => _open = _open == 'tts' ? null : 'tts'),
                    child: Row(
                      children: [
                        Expanded(
                          child: _Pickable(
                            label: 'American',
                            subtitle: 'en-US',
                            selected: u.preferredTtsAccent == 'en-US',
                            onTap: () =>
                                store.patchUser({'preferredTtsAccent': 'en-US'}),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _Pickable(
                            label: 'British',
                            subtitle: 'en-GB',
                            selected: u.preferredTtsAccent == 'en-GB',
                            onTap: () =>
                                store.patchUser({'preferredTtsAccent': 'en-GB'}),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 22),
                  Text(
                    'About',
                    style: AppFonts.sans(
                      size: 12,
                      weight: FontWeight.w600,
                      color: AppColors.mute,
                      letterSpacing: 0.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  CardSurface(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'EngApp v0.1.0',
                          style: AppFonts.sans(
                            size: 13,
                            weight: FontWeight.w600,
                            color: AppColors.ink,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '由貓貓和一杯不夠的咖啡支撐。',
                          style: AppFonts.serif(size: 12, color: AppColors.mute),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ExpandableRow extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color accent;
  final bool open;
  final VoidCallback onToggle;
  final Widget child;

  const _ExpandableRow({
    required this.title,
    required this.value,
    required this.icon,
    required this.accent,
    required this.open,
    required this.onToggle,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOut,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        boxShadow: AppShadows.soft(y: 4, blur: 10, opacity: 0.04),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: onToggle,
            borderRadius: BorderRadius.circular(AppRadii.lg),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
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
                          value,
                          style: AppFonts.serif(size: 12, color: AppColors.mute),
                        ),
                      ],
                    ),
                  ),
                  AnimatedRotation(
                    turns: open ? 0.5 : 0,
                    duration: const Duration(milliseconds: 180),
                    child: const Icon(Icons.expand_more_rounded, color: AppColors.mute),
                  ),
                ],
              ),
            ),
          ),
          if (open)
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: child,
            ),
        ],
      ),
    );
  }
}

class _StaticRow extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color accent;
  final Widget? trailing;
  const _StaticRow({
    required this.title,
    required this.value,
    required this.icon,
    required this.accent,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
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
                  value,
                  style: AppFonts.serif(size: 12, color: AppColors.mute),
                ),
              ],
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

class _Pickable extends StatelessWidget {
  final String label;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;
  const _Pickable({
    required this.label,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadii.md),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: selected ? AppColors.ink : AppColors.cardAlt,
              borderRadius: BorderRadius.circular(AppRadii.md),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        label,
                        style: AppFonts.sans(
                          size: 13,
                          weight: FontWeight.w600,
                          color: selected ? AppColors.paper : AppColors.ink,
                        ),
                      ),
                      Text(
                        subtitle,
                        style: AppFonts.serif(
                          size: 11,
                          color: selected ? AppColors.muteSoft : AppColors.mute,
                        ),
                      ),
                    ],
                  ),
                ),
                if (selected)
                  const Icon(Icons.check_rounded, color: AppColors.accent, size: 18),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
