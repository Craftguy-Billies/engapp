// Swipe-friendly word card used in the Feed and Revisit decks.
//
// Gestures (mirrors the spec):
//   - vertical drag up           → mark as known
//   - vertical drag down         → skip (mark seen, no API write)
//   - horizontal drag right      → bookmark
//   - horizontal drag left       → skip
//   - long-press                 → quick bookmark
//   - tap                        → open detail
//
// Rendering is null-safe: any missing field hides its section.

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../api/api_client.dart';
import '../models/word.dart';
import '../theme/theme.dart';
import 'primitives.dart';

enum SwipeAction { known, bookmark, skip }

class WordCardWidget extends StatefulWidget {
  final WordCardData word;
  final bool bookmarked;
  final bool isFirst;
  final VoidCallback? onTap;
  final VoidCallback? onAudio;
  final ValueChanged<SwipeAction>? onSwipe;
  final EngappApi api;

  const WordCardWidget({
    super.key,
    required this.word,
    required this.api,
    this.bookmarked = false,
    this.isFirst = false,
    this.onTap,
    this.onAudio,
    this.onSwipe,
  });

  @override
  State<WordCardWidget> createState() => _WordCardWidgetState();
}

class _WordCardWidgetState extends State<WordCardWidget>
    with SingleTickerProviderStateMixin {
  Offset _drag = Offset.zero;
  late final AnimationController _settle =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 240));

  @override
  void dispose() {
    _settle.dispose();
    super.dispose();
  }

  void _onPanEnd(DragEndDetails details) {
    final dx = _drag.dx;
    final dy = _drag.dy;
    SwipeAction? action;
    if (dy < -90) {
      action = SwipeAction.known;
    } else if (dx > 90) {
      action = SwipeAction.bookmark;
    } else if (dx < -90 || dy > 90) {
      action = SwipeAction.skip;
    }
    if (action != null) {
      widget.onSwipe?.call(action);
    }
    setState(() => _drag = Offset.zero);
  }

  @override
  Widget build(BuildContext context) {
    final w = widget.word;

    final angle = (_drag.dx / 24) * 0.01;
    final translate = _drag;

    return GestureDetector(
      onTap: widget.onTap,
      onLongPress: () => widget.onSwipe?.call(SwipeAction.bookmark),
      onDoubleTap: () => widget.onSwipe?.call(SwipeAction.known),
      onPanUpdate: (d) => setState(() => _drag += d.delta),
      onPanEnd: _onPanEnd,
      child: Transform.translate(
        offset: translate,
        child: Transform.rotate(
          angle: angle,
          child: Stack(
            children: [
              CardSurface(
                padding: EdgeInsets.zero,
                background: AppColors.card,
                borderRadius: BorderRadius.circular(AppRadii.xl),
                shadow: AppShadows.soft(y: 12, blur: 30, opacity: 0.08),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadii.xl),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _heroImage(w),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 18),
                        child: _meta(w),
                      ),
                    ],
                  ),
                ),
              ),
              if (widget.isFirst)
                Positioned(
                  bottom: 14,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.ink.withValues(alpha: 0.86),
                        borderRadius: BorderRadius.circular(AppRadii.pill),
                      ),
                      child: Text(
                        'swipe up · known   ·   right · save',
                        style: AppFonts.sans(
                          size: 10,
                          weight: FontWeight.w500,
                          color: AppColors.paper,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _heroImage(WordCardData w) {
    if (w.primaryImage == null || w.primaryImage!.imageUrl.isEmpty) {
      return const StripePlaceholder(height: 260, borderRadius: BorderRadius.only(
        topLeft: Radius.circular(AppRadii.xl),
        topRight: Radius.circular(AppRadii.xl),
      ));
    }
    final url = widget.api.resolveImageUrl(w.primaryImage!.imageUrl);
    return SizedBox(
      height: 260,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          CachedNetworkImage(
            imageUrl: url,
            fit: BoxFit.cover,
            placeholder: (_, __) => const StripePlaceholder(height: 260),
            errorWidget: (_, __, ___) => const StripePlaceholder(height: 260),
          ),
          Positioned(
            left: 16,
            top: 16,
            child: Row(
              children: [
                if (w.pos != null)
                  Pill(
                    w.pos!,
                    background: posColor(w.pos),
                  ),
                if (w.cefrLevel != null) ...[
                  const SizedBox(width: 6),
                  Pill(w.cefrLevel!, background: AppColors.paper),
                ],
              ],
            ),
          ),
          Positioned(
            right: 16,
            top: 16,
            child: SoftIconButton(
              icon: widget.bookmarked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
              selected: widget.bookmarked,
              onTap: () => widget.onSwipe?.call(SwipeAction.bookmark),
            ),
          ),
        ],
      ),
    );
  }

  Widget _meta(WordCardData w) {
    final descPrimary =
        w.descriptions.isNotEmpty ? w.descriptions.first.text : null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Flexible(
              child: Text(
                w.word,
                style: AppFonts.display(
                  size: 38,
                  weight: FontWeight.w600,
                  color: AppColors.ink,
                  height: 1.05,
                ),
              ),
            ),
            const SizedBox(width: 4),
            const Padding(
              padding: EdgeInsets.only(bottom: 6),
              child: WavyUnderline(width: 22, height: 6),
            ),
          ],
        ),
        const SizedBox(height: 4),
        if (w.translation != null)
          Text(
            w.translation!,
            style: AppFonts.serif(
              size: 18,
              weight: FontWeight.w500,
              color: AppColors.inkSoft,
            ),
          ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 6,
          children: [
            if (w.phoneticsIpa != null)
              Pill(
                w.phoneticsIpa!,
                background: AppColors.cardAlt,
                color: AppColors.mute,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              ),
            if (w.phoneticsKk != null)
              Pill(
                w.phoneticsKk!,
                background: AppColors.cardAlt,
                color: AppColors.mute,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              ),
            if (w.syllableCount != null) Pill('${w.syllableCount} syl', background: AppColors.cardAlt, color: AppColors.mute),
            Pill('US', icon: Icons.volume_up_rounded, background: AppColors.paper, color: AppColors.ink),
          ],
        ),
        if (w.definitionEn != null) ...[
          const SizedBox(height: 12),
          Text(
            w.definitionEn!,
            style: AppFonts.sans(
              size: 14,
              color: AppColors.inkSoft,
              height: 1.5,
            ),
          ),
        ],
        if (w.exampleSentence != null) ...[
          const SizedBox(height: 8),
          Text(
            '“${w.exampleSentence!}”',
            style: AppFonts.serif(
              size: 13,
              color: AppColors.mute,
              height: 1.5,
            ),
          ),
        ],
        if (descPrimary != null) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.butter.withValues(alpha: 0.45),
              borderRadius: BorderRadius.circular(AppRadii.md),
            ),
            child: Text(
              descPrimary,
              style: AppFonts.serif(
                size: 12,
                color: AppColors.ink,
                height: 1.5,
              ),
            ),
          ),
        ],
        if (w.themeTags.isNotEmpty || w.examTags.isNotEmpty) ...[
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              for (var i = 0; i < w.themeTags.length; i++)
                Pill('#${w.themeTags[i]}', background: tagPastel(i)),
              for (var i = 0; i < w.examTags.length; i++)
                Pill(w.examTags[i], background: AppColors.accent.withValues(alpha: 0.8)),
            ],
          ),
        ],
      ],
    );
  }
}
