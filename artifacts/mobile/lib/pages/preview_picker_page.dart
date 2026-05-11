// Dev-only screen: jump to any of the 21 numbered preview pages.
//
// Mirrors how artifacts/mockup-sandbox auto-discovers preview files via the
// mockupPreviewPlugin. This list is the equivalent index for the Flutter app.

// ignore_for_file: library_private_types_in_public_api

import 'package:flutter/material.dart';

import '../app.dart';
import '../theme/theme.dart';
import '../widgets/page_header.dart';

class PreviewEntry {
  final String number;
  final String title;
  final String subtitle;
  final AppRoute route;
  const PreviewEntry(this.number, this.title, this.subtitle, this.route);
}

const List<PreviewEntry> kPreviewIndex = [
  PreviewEntry('01', 'Splash / Boot', 'GET /user/me, /words/styles/list, /words/feed', appRouteSplash),
  PreviewEntry('01b', 'Tutorial', 'First-run swipe demo (dryRun)', appRouteTutorial),
  PreviewEntry('02', 'Onboarding · Language', 'PATCH /user/me { uiLanguage }', appRouteOnboardingLanguage),
  PreviewEntry('03', 'Onboarding · Exam Goal', 'PATCH /user/me { learningGoal }', appRouteOnboardingExam),
  PreviewEntry('04', 'Onboarding · Daily Goal', 'PATCH /user/me { dailyGoal }', appRouteOnboardingDaily),
  PreviewEntry('05', 'Onboarding · Style Picker', 'PATCH /user/me { preferredStyleId }', appRouteOnboardingStyle),
  PreviewEntry('06', 'Feed', 'GET /words/feed + seen/known/bookmarks', appRouteFeed),
  PreviewEntry('07', 'Word Detail', 'GET /words/:id', appRouteDetail),
  PreviewEntry('08', 'Bookmarks', 'GET /user/bookmarks + DELETE', appRouteBookmarks),
  PreviewEntry('09', 'Known', 'GET /user/known + GET /words/:id', appRouteKnown),
  PreviewEntry('10', 'Revisit', 'GET /user/revisit + POST /user/known', appRouteRevisit),
  PreviewEntry('11', 'Stats', 'GET /user/stats', appRouteStats),
  PreviewEntry('12', 'Profile', 'GET /user/me + GET /user/stats', appRouteProfile),
  PreviewEntry('13', 'Settings', 'PATCH /user/me (debounced)', appRouteSettings),
  PreviewEntry('14', 'Style Picker', 'PATCH preferredStyleId + refeed', appRouteStylePicker),
  PreviewEntry('15', 'Browse', 'GET /words/feed?cefr&theme&exam', appRouteBrowse),
  PreviewEntry('16', 'Search', 'GET /words/:id', appRouteSearch),
  PreviewEntry('17', 'Share Preview', 'client render', appRouteSharePreview),
  PreviewEntry('18', 'Paywall', 'GET /words/styles/list', appRoutePaywall),
  PreviewEntry('19', 'Empty State', '0-result reusable view', appRouteEmpty),
  PreviewEntry('20', 'Error State', 'connection lost retry', appRouteError),
  PreviewEntry('21', 'Sign-in', 'placeholder (Clerk)', appRouteSignin),
];

class PreviewPickerPage extends StatelessWidget {
  final void Function(AppRoute) onOpen;
  final VoidCallback onBack;
  const PreviewPickerPage({super.key, required this.onOpen, required this.onBack});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(
              title: 'Previews',
              subtitle: '所有 21 個畫面，方便個別檢視。',
              onBack: onBack,
            ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                itemCount: kPreviewIndex.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (_, i) {
                  final e = kPreviewIndex[i];
                  return Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => onOpen(e.route),
                      borderRadius: BorderRadius.circular(AppRadii.lg),
                      child: Container(
                        padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                        decoration: BoxDecoration(
                          color: AppColors.card,
                          borderRadius: BorderRadius.circular(AppRadii.lg),
                          boxShadow: AppShadows.soft(y: 2, blur: 8, opacity: 0.04),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 46,
                              height: 46,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: tagPastel(i),
                                borderRadius: BorderRadius.circular(AppRadii.md),
                              ),
                              child: Text(
                                e.number,
                                style: AppFonts.display(
                                  size: 16,
                                  weight: FontWeight.w700,
                                  color: AppColors.ink,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    e.title,
                                    style: AppFonts.sans(
                                      size: 14,
                                      weight: FontWeight.w600,
                                      color: AppColors.ink,
                                    ),
                                  ),
                                  Text(
                                    e.subtitle,
                                    style: AppFonts.serif(
                                      size: 12,
                                      color: AppColors.mute,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(Icons.chevron_right_rounded,
                                color: AppColors.mute),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
