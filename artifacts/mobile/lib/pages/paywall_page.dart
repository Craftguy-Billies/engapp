// 18. Paywall

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/primitives.dart';

class PaywallPage extends StatelessWidget {
  final VoidCallback onBack;
  const PaywallPage({super.key, required this.onBack});

  @override
  Widget build(BuildContext context) {
    final styles = context
        .watch<EngappStore>()
        .styles
        .where((s) => !s.isFree)
        .toList();

    return Container(
      color: AppColors.ink,
      child: SafeArea(
        child: Stack(
          children: [
            ListView(
              padding: const EdgeInsets.fromLTRB(22, 22, 22, 100),
              children: [
                Row(
                  children: [
                    GestureDetector(
                      onTap: onBack,
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.inkSoft,
                          borderRadius: BorderRadius.circular(AppRadii.pill),
                        ),
                        child: const Icon(Icons.close_rounded, color: AppColors.paper, size: 18),
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius: BorderRadius.circular(AppRadii.pill),
                      ),
                      child: Text(
                        'EngApp+',
                        style: AppFonts.sans(
                          size: 11,
                          weight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Text(
                  'Unlock more\nbeautiful styles.',
                  style: AppFonts.display(
                    size: 32,
                    weight: FontWeight.w700,
                    color: AppColors.paper,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Premium 解鎖所有插畫風格，並支援未來的進階功能。一杯飲料的價錢，永久值得。',
                  style: AppFonts.serif(
                    size: 14,
                    color: AppColors.muteSoft,
                    height: 1.6,
                  ),
                ),
                const SizedBox(height: 22),
                SizedBox(
                  height: 180,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemBuilder: (_, i) {
                      final s = styles[i];
                      return Container(
                        width: 140,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.inkSoft,
                          borderRadius: BorderRadius.circular(AppRadii.lg),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: [tagPastel(s.id), tagPastel(s.id + 2)],
                                  ),
                                  borderRadius: BorderRadius.circular(AppRadii.md),
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              s.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppFonts.sans(
                                size: 12,
                                weight: FontWeight.w600,
                                color: AppColors.paper,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemCount: styles.length,
                  ),
                ),
                const SizedBox(height: 22),
                ..._benefit('All premium illustration styles'),
                ..._benefit('Daily share-card variants'),
                ..._benefit('Priority feed image generation'),
                ..._benefit('Future TTS voice picker'),
                const SizedBox(height: 22),
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.inkSoft,
                    borderRadius: BorderRadius.circular(AppRadii.lg),
                    border: Border.all(color: AppColors.accent, width: 1.5),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Yearly',
                            style: AppFonts.sans(
                              size: 14,
                              weight: FontWeight.w700,
                              color: AppColors.paper,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.accent,
                              borderRadius: BorderRadius.circular(AppRadii.pill),
                            ),
                            child: Text(
                              'best value',
                              style: AppFonts.sans(
                                size: 9,
                                weight: FontWeight.w700,
                                color: AppColors.ink,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'NT\$ 480',
                            style: AppFonts.display(
                              size: 32,
                              weight: FontWeight.w700,
                              color: AppColors.accent,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Text(
                              '/ year',
                              style: AppFonts.sans(size: 12, color: AppColors.muteSoft),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        '約等於每月 NT\$ 40，隨時可取消',
                        style: AppFonts.serif(size: 12, color: AppColors.muteSoft),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Center(
                  child: TextButton(
                    onPressed: () {},
                    child: Text(
                      'Restore purchases',
                      style: AppFonts.sans(
                        size: 12,
                        weight: FontWeight.w500,
                        color: AppColors.muteSoft,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Positioned(
              left: 22,
              right: 22,
              bottom: 22,
              child: ChunkyButton(
                label: 'Start premium',
                icon: Icons.workspace_premium_rounded,
                background: AppColors.accent,
                color: AppColors.ink,
                onTap: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _benefit(String text) => [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: AppColors.accent,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_rounded, color: AppColors.ink, size: 14),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  text,
                  style: AppFonts.sans(
                    size: 14,
                    color: AppColors.paper,
                    weight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ];
}
