// 8. Bookmarks · 9. Known · 10. Revisit
//
// All three are list views with the same shape: title, optional empty state,
// scrolling list of WordRows that route to detail.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/word.dart';
import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/page_header.dart';
import '../widgets/word_row.dart';

class BookmarksPage extends StatelessWidget {
  final void Function(int wordId) onOpenDetail;
  final VoidCallback? onBack;
  const BookmarksPage({super.key, required this.onOpenDetail, this.onBack});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<EngappStore>();
    final ids = store.bookmarks.toList();
    final words = ids
        .map((id) => store.wordById(id))
        .whereType<WordCardData>()
        .toList();

    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(
              title: 'Saved',
              subtitle: '${words.length} 個收藏中的單字',
              onBack: onBack,
            ),
            Expanded(
              child: words.isEmpty
                  ? _EmptyHint(
                      icon: Icons.favorite_border_rounded,
                      title: 'Nothing saved yet',
                      body: '右滑卡片，喜歡的單字會出現在這裡。',
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
                      itemBuilder: (_, i) {
                        final w = words[i];
                        return Dismissible(
                          key: ValueKey('bm-${w.id}'),
                          direction: DismissDirection.endToStart,
                          background: Container(
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 22),
                            decoration: BoxDecoration(
                              color: AppColors.pop,
                              borderRadius: BorderRadius.circular(AppRadii.lg),
                            ),
                            child: const Icon(Icons.delete_outline_rounded,
                                color: AppColors.paper),
                          ),
                          onDismissed: (_) =>
                              context.read<EngappStore>().toggleBookmark(w.id),
                          child: WordRow(
                            word: w,
                            api: store.api,
                            onTap: () => onOpenDetail(w.id),
                            trailingIcon: Icons.chevron_right_rounded,
                          ),
                        );
                      },
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemCount: words.length,
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class KnownPage extends StatelessWidget {
  final void Function(int wordId) onOpenDetail;
  final VoidCallback? onBack;
  const KnownPage({super.key, required this.onOpenDetail, this.onBack});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<EngappStore>();
    final ids = store.known.toList();
    final words = ids
        .map((id) => store.wordById(id))
        .whereType<WordCardData>()
        .toList();
    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(
              title: 'Known',
              subtitle: '${words.length} 個已掌握的單字',
              onBack: onBack,
            ),
            Expanded(
              child: words.isEmpty
                  ? _EmptyHint(
                      icon: Icons.check_circle_outline_rounded,
                      title: 'No known words yet',
                      body: '上滑卡片標記「已學會」，這裡會慢慢長出來。',
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
                      itemBuilder: (_, i) {
                        final w = words[i];
                        return WordRow(
                          word: w,
                          api: store.api,
                          onTap: () => onOpenDetail(w.id),
                          trailingIcon: Icons.chevron_right_rounded,
                          badge: i % 3 == 0 ? 'due to revisit' : null,
                        );
                      },
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemCount: words.length,
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class RevisitPage extends StatelessWidget {
  final void Function(int wordId) onOpenDetail;
  final VoidCallback? onBack;
  const RevisitPage({super.key, required this.onOpenDetail, this.onBack});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<EngappStore>();
    final ids = store.known.take(4).toList();
    final words = ids
        .map((id) => store.wordById(id))
        .whereType<WordCardData>()
        .toList();
    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(
              title: 'Revisit',
              subtitle: '今天需要複習的單字',
              onBack: onBack,
            ),
            Expanded(
              child: words.isEmpty
                  ? _EmptyHint(
                      icon: Icons.bedtime_rounded,
                      title: 'Nothing due today',
                      body: '明天再回來，這裡會列出該複習的單字。',
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
                      itemBuilder: (_, i) {
                        final w = words[i];
                        return WordRow(
                          word: w,
                          api: store.api,
                          onTap: () => onOpenDetail(w.id),
                          badge: '7d cycle',
                          trailingIcon: Icons.refresh_rounded,
                          onTrailing: () =>
                              context.read<EngappStore>().markKnown(w.id),
                        );
                      },
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemCount: words.length,
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyHint extends StatelessWidget {
  final IconData icon;
  final String title;
  final String body;
  const _EmptyHint({required this.icon, required this.title, required this.body});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 36),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.blush.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(AppRadii.xl),
              ),
              child: Icon(icon, color: AppColors.ink, size: 32),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: AppFonts.display(
                size: 22,
                weight: FontWeight.w700,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              body,
              textAlign: TextAlign.center,
              style: AppFonts.serif(
                size: 13,
                color: AppColors.mute,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
