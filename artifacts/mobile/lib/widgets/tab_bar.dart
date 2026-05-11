import 'package:flutter/material.dart';

import '../theme/theme.dart';

enum TabKey { feed, browse, revisit, saved, me }

class AppTabBar extends StatelessWidget {
  final TabKey current;
  final ValueChanged<TabKey> onTap;

  const AppTabBar({super.key, required this.current, required this.onTap});

  static const List<_TabSpec> _tabs = [
    _TabSpec(TabKey.feed, 'Feed', Icons.auto_stories_rounded),
    _TabSpec(TabKey.browse, 'Browse', Icons.filter_alt_rounded),
    _TabSpec(TabKey.revisit, 'Revisit', Icons.refresh_rounded),
    _TabSpec(TabKey.saved, 'Saved', Icons.favorite_rounded),
    _TabSpec(TabKey.me, 'Me', Icons.person_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.card,
        border: Border(top: BorderSide(color: AppColors.hairline)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            for (final t in _tabs)
              Expanded(
                child: _TabButton(
                  spec: t,
                  active: t.key == current,
                  onTap: () => onTap(t.key),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _TabSpec {
  final TabKey key;
  final String label;
  final IconData icon;
  const _TabSpec(this.key, this.label, this.icon);
}

class _TabButton extends StatelessWidget {
  final _TabSpec spec;
  final bool active;
  final VoidCallback onTap;
  const _TabButton({required this.spec, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadii.md),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 36,
                height: 28,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: active ? AppColors.accent : Colors.transparent,
                  borderRadius: BorderRadius.circular(AppRadii.pill),
                ),
                child: Icon(spec.icon, size: 18, color: AppColors.ink),
              ),
              const SizedBox(height: 2),
              Text(
                spec.label,
                style: AppFonts.sans(
                  size: 10,
                  weight: FontWeight.w600,
                  color: active ? AppColors.ink : AppColors.mute,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
