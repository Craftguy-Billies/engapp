// 7. Word Detail

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/page_header.dart';
import '../widgets/primitives.dart';

class WordDetailPage extends StatelessWidget {
  final int wordId;
  final VoidCallback onBack;
  final VoidCallback onShare;
  const WordDetailPage({
    super.key,
    required this.wordId,
    required this.onBack,
    required this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    final store = context.watch<EngappStore>();
    final w = store.wordById(wordId);

    if (w == null) {
      return Container(
        color: AppColors.page,
        child: SafeArea(
          child: Column(
            children: [
              PageHeader(title: 'Word', onBack: onBack),
              const Expanded(
                child: Center(
                  child: Text('Not found',
                      style: TextStyle(color: AppColors.mute)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final api = store.api;
    final bookmarked = store.isBookmarked(w.id);
    final known = store.isKnown(w.id);

    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(
              title: w.word,
              subtitle: w.translation,
              onBack: onBack,
              trailing: SoftIconButton(
                icon: Icons.ios_share_rounded,
                onTap: onShare,
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 110),
                children: [
                  if (w.primaryImage != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadii.xl),
                      child: AspectRatio(
                        aspectRatio: 4 / 5,
                        child: CachedNetworkImage(
                          imageUrl: api.resolveImageUrl(w.primaryImage!.imageUrl),
                          fit: BoxFit.cover,
                          placeholder: (_, __) => const StripePlaceholder(height: 360),
                          errorWidget: (_, __, ___) => const StripePlaceholder(height: 360),
                        ),
                      ),
                    ),
                  const SizedBox(height: 18),
                  _phoneticsRow(w),
                  if (w.definitionEn != null) ...[
                    const SizedBox(height: 18),
                    _sectionTitle('Definition'),
                    const SizedBox(height: 6),
                    CardSurface(
                      child: Text(
                        w.definitionEn!,
                        style: AppFonts.sans(
                          size: 14,
                          color: AppColors.ink,
                          height: 1.55,
                        ),
                      ),
                    ),
                  ],
                  if (w.exampleSentence != null) ...[
                    const SizedBox(height: 14),
                    _sectionTitle('Example'),
                    const SizedBox(height: 6),
                    CardSurface(
                      background: AppColors.butter.withValues(alpha: 0.5),
                      child: Text(
                        '“${w.exampleSentence!}”',
                        style: AppFonts.serif(
                          size: 14,
                          color: AppColors.ink,
                          height: 1.55,
                        ),
                      ),
                    ),
                  ],
                  if (w.translations.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    _sectionTitle('Translations'),
                    const SizedBox(height: 6),
                    CardSurface(
                      child: Column(
                        children: [
                          for (final entry in w.translations.entries) ...[
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.cardAlt,
                                    borderRadius:
                                        BorderRadius.circular(AppRadii.pill),
                                  ),
                                  child: Text(
                                    entry.key,
                                    style: AppFonts.sans(
                                      size: 10,
                                      weight: FontWeight.w600,
                                      color: AppColors.mute,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    entry.value,
                                    style: AppFonts.serif(
                                      size: 15,
                                      color: AppColors.ink,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            if (entry.key != w.translations.keys.last) ...[
                              const SizedBox(height: 10),
                              const Hairline(),
                              const SizedBox(height: 10),
                            ],
                          ],
                        ],
                      ),
                    ),
                  ],
                  if (w.descriptions.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    _sectionTitle('Descriptions'),
                    const SizedBox(height: 6),
                    for (final d in w.descriptions) ...[
                      CardSurface(
                        background: d.tone == 'snarky'
                            ? AppColors.blush.withValues(alpha: 0.5)
                            : AppColors.sage.withValues(alpha: 0.4),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Pill(d.languageCode, background: AppColors.paper),
                                const SizedBox(width: 6),
                                Pill(d.tone, background: AppColors.paper, color: AppColors.mute),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              d.text,
                              style: AppFonts.serif(
                                size: 14,
                                color: AppColors.ink,
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                  ],
                  if (w.themeTags.isNotEmpty ||
                      w.examTags.isNotEmpty ||
                      w.sourceLists.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    _sectionTitle('Tags'),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        for (var i = 0; i < w.themeTags.length; i++)
                          Pill('#${w.themeTags[i]}', background: tagPastel(i)),
                        for (final e in w.examTags)
                          Pill(e, background: AppColors.accent),
                        for (final s in w.sourceLists)
                          Pill(s, background: AppColors.cardAlt, color: AppColors.mute, outlined: false),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            _stickyActions(context, w.id, bookmarked, known),
          ],
        ),
      ),
    );
  }

  Widget _phoneticsRow(w) {
    return Wrap(
      spacing: 8,
      runSpacing: 6,
      children: [
        if (w.phoneticsIpa != null)
          Pill(w.phoneticsIpa!, background: AppColors.cardAlt, color: AppColors.mute),
        if (w.phoneticsKk != null)
          Pill(w.phoneticsKk!, background: AppColors.cardAlt, color: AppColors.mute),
        if (w.syllableCount != null)
          Pill('${w.syllableCount} syllables', background: AppColors.cardAlt, color: AppColors.mute),
        if (w.cefrLevel != null) Pill(w.cefrLevel!, background: AppColors.accent),
        Pill('US', icon: Icons.volume_up_rounded, background: AppColors.paper),
      ],
    );
  }

  Widget _sectionTitle(String label) {
    return SoftLabel(label);
  }

  Widget _stickyActions(BuildContext context, int wordId, bool bookmarked, bool known) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: BoxDecoration(
        color: AppColors.paper,
        border: Border(top: BorderSide(color: AppColors.hairline)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: ChunkyButton(
                label: known ? 'Already known' : 'Mark as known',
                icon: Icons.check_rounded,
                background: known ? AppColors.sage : AppColors.ink,
                color: known ? AppColors.ink : AppColors.paper,
                onTap: known
                    ? null
                    : () => context.read<EngappStore>().markKnown(wordId),
              ),
            ),
            const SizedBox(width: 10),
            SoftIconButton(
              icon: bookmarked
                  ? Icons.favorite_rounded
                  : Icons.favorite_border_rounded,
              selected: bookmarked,
              onTap: () => context.read<EngappStore>().toggleBookmark(wordId),
              size: 52,
            ),
          ],
        ),
      ),
    );
  }
}
