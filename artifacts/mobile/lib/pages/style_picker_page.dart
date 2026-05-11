// 14. Style Picker (in-app)

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/page_header.dart';
import '../widgets/primitives.dart';

class StylePickerPage extends StatelessWidget {
  final VoidCallback onBack;
  final VoidCallback onPremium;
  const StylePickerPage({super.key, required this.onBack, required this.onPremium});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<EngappStore>();
    final styles = store.styles;
    final current = store.user.preferredStyleId;

    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(
              title: 'Illustration style',
              subtitle: '可以隨時換。Premium 解鎖後也會即時生效。',
              onBack: onBack,
            ),
            Expanded(
              child: GridView.count(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.78,
                children: [
                  for (final s in styles)
                    Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () async {
                          if (!s.isFree) {
                            onPremium();
                            return;
                          }
                          await store.patchUser({'preferredStyleId': s.id});
                          await store.refreshFeed(
                            filters: store.filters.copyWith(styleSlug: s.slug),
                          );
                        },
                        borderRadius: BorderRadius.circular(AppRadii.lg),
                        child: Stack(
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                color: AppColors.card,
                                borderRadius: BorderRadius.circular(AppRadii.lg),
                                boxShadow: AppShadows.soft(y: 4, blur: 10, opacity: 0.05),
                                border: Border.all(
                                  color: current == s.id
                                      ? AppColors.ink
                                      : AppColors.hairline,
                                  width: current == s.id ? 2 : 1,
                                ),
                              ),
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Container(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                          colors: [
                                            tagPastel(s.id),
                                            tagPastel(s.id + 2),
                                          ],
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(AppRadii.md),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    s.name,
                                    style: AppFonts.sans(
                                      size: 14,
                                      weight: FontWeight.w700,
                                      color: AppColors.ink,
                                    ),
                                  ),
                                  if (s.subtitle != null)
                                    Text(
                                      s.subtitle!,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: AppFonts.serif(
                                        size: 11,
                                        color: AppColors.mute,
                                      ),
                                    ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      Pill(
                                        s.isFree ? 'Free' : 'Premium',
                                        background: s.isFree
                                            ? AppColors.accent
                                            : AppColors.ink,
                                        color: s.isFree
                                            ? AppColors.ink
                                            : AppColors.accent,
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 3),
                                      ),
                                      if (current == s.id) ...[
                                        const SizedBox(width: 6),
                                        const Pill(
                                          'Current',
                                          background: AppColors.sage,
                                          padding: EdgeInsets.symmetric(
                                              horizontal: 8, vertical: 3),
                                        ),
                                      ],
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            if (!s.isFree)
                              Positioned(
                                top: 16,
                                right: 16,
                                child: Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: const BoxDecoration(
                                    color: AppColors.ink,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.lock_rounded,
                                    color: AppColors.accent,
                                    size: 14,
                                  ),
                                ),
                              ),
                          ],
                        ),
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
