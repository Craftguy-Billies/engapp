// 6. Feed — vertical swipe deck

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/api_client.dart';
import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/primitives.dart';
import '../widgets/word_card.dart';

class FeedPage extends StatefulWidget {
  final void Function(int wordId) onOpenDetail;
  final VoidCallback onOpenBrowse;
  final VoidCallback onOpenSearch;
  const FeedPage({
    super.key,
    required this.onOpenDetail,
    required this.onOpenBrowse,
    required this.onOpenSearch,
  });

  @override
  State<FeedPage> createState() => _FeedPageState();
}

class _FeedPageState extends State<FeedPage> {
  int _index = 0;

  Future<void> _advance(SwipeAction action, int wordId) async {
    final store = context.read<EngappStore>();
    if (action == SwipeAction.known) {
      await store.markKnown(wordId);
    } else if (action == SwipeAction.bookmark) {
      await store.toggleBookmark(wordId);
      return; // bookmark doesn't advance the deck
    }
    await store.markSeen(wordId);
    setState(() => _index += 1);
    if (store.feed.length - _index <= 3) {
      await store.refreshFeed();
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<EngappStore>();
    final feed = store.feed;
    final visibleCount = feed.length - _index;

    if (visibleCount <= 0) {
      return _emptyDeck(onRefresh: () async {
        setState(() => _index = 0);
        await store.refreshFeed();
      });
    }

    final api = store.api;
    final words = feed.skip(_index).take(3).toList();

    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
          child: Column(
            children: [
              _topBar(store, api),
              const SizedBox(height: 12),
              Expanded(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    for (int i = words.length - 1; i >= 0; i--)
                      Positioned(
                        top: i * 8.0,
                        left: i * 4.0,
                        right: i * 4.0,
                        bottom: 0,
                        child: Opacity(
                          opacity: i == 0 ? 1 : (1 - 0.18 * i).clamp(0.2, 1),
                          child: IgnorePointer(
                            ignoring: i != 0,
                            child: WordCardWidget(
                              word: words[i],
                              api: api,
                              isFirst: i == 0 && _index == 0,
                              bookmarked: store.isBookmarked(words[i].id),
                              onTap: () => widget.onOpenDetail(words[i].id),
                              onSwipe: (action) => _advance(action, words[i].id),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _topBar(EngappStore store, EngappApi api) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(10, 6, 12, 6),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(AppRadii.pill),
            boxShadow: AppShadows.soft(y: 2, blur: 6, opacity: 0.04),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.local_fire_department_rounded,
                  color: AppColors.pop, size: 18),
              const SizedBox(width: 4),
              Text(
                '${store.stats.streak}',
                style: AppFonts.display(
                  size: 16,
                  weight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                'day streak',
                style: AppFonts.sans(
                  size: 10,
                  weight: FontWeight.w500,
                  color: AppColors.mute,
                ),
              ),
            ],
          ),
        ),
        const Spacer(),
        SoftIconButton(icon: Icons.search_rounded, onTap: widget.onOpenSearch),
        const SizedBox(width: 8),
        SoftIconButton(
          icon: Icons.filter_alt_rounded,
          onTap: widget.onOpenBrowse,
        ),
      ],
    );
  }

  Widget _emptyDeck({required Future<void> Function() onRefresh}) {
    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.accentSoft,
                    borderRadius: BorderRadius.circular(AppRadii.xl),
                  ),
                  child: const Icon(Icons.celebration_rounded,
                      size: 40, color: AppColors.ink),
                ),
                const SizedBox(height: 18),
                Text(
                  'All caught up',
                  style: AppFonts.display(
                    size: 24,
                    weight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '今天的單字看完了。明天再回來，新的會在這裡等你。',
                  textAlign: TextAlign.center,
                  style: AppFonts.serif(
                    size: 13,
                    color: AppColors.mute,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 22),
                ChunkyButton(
                  label: 'Pull more',
                  icon: Icons.refresh_rounded,
                  fullWidth: false,
                  onTap: onRefresh,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
