// Swipe-friendly word card used in the Feed and Revisit decks.
//
// Gestures:
//   - vertical drag up    → mark as known
//   - vertical drag down  → skip
//   - horizontal drag right → bookmark
//   - horizontal drag left  → skip
//   - long-press          → quick bookmark
//   - double-tap          → quick mark-known
//
// Tap does NOT open detail anymore. All actions live directly on the card.
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
  final bool known;
  final bool isFirst;
  final VoidCallback? onAudio;
  final ValueChanged<SwipeAction>? onSwipe;
  final EngappApi api;

  const WordCardWidget({
    super.key,
    required this.word,
    required this.api,
    this.bookmarked = false,
    this.known = false,
    this.isFirst = false,
    this.onAudio,
    this.onSwipe,
  });

  @override
  State<WordCardWidget> createState() => _WordCardWidgetState();
}

class _WordCardWidgetState extends State<WordCardWidget> {
  // Live drag offset while finger is down.
  Offset _drag = Offset.zero;

  // Thresholds — kept low so the gesture is forgiving on small phones.
  static const double _distanceThreshold = 60;
  static const double _velocityThreshold = 320;

  void _onPanUpdate(DragUpdateDetails d) {
    setState(() => _drag += d.delta);
  }

  void _onPanEnd(DragEndDetails details) {
    final dx = _drag.dx;
    final dy = _drag.dy;
    final vx = details.velocity.pixelsPerSecond.dx;
    final vy = details.velocity.pixelsPerSecond.dy;

    SwipeAction? action;

    final horizontalDominant = dx.abs() > dy.abs();
    if (horizontalDominant) {
      if (dx > _distanceThreshold || vx > _velocityThreshold) {
        action = SwipeAction.bookmark;
      } else if (dx < -_distanceThreshold || vx < -_velocityThreshold) {
        action = SwipeAction.skip;
      }
    } else {
      if (dy < -_distanceThreshold || vy < -_velocityThreshold) {
        action = SwipeAction.known;
      } else if (dy > _distanceThreshold || vy > _velocityThreshold) {
        action = SwipeAction.skip;
      }
    }

    if (action != null) {
      widget.onSwipe?.call(action);
    }
    setState(() => _drag = Offset.zero);
  }

  void _onPanCancel() {
    setState(() => _drag = Offset.zero);
  }

  @override
  Widget build(BuildContext context) {
    final w = widget.word;
    final angle = (_drag.dx / 600).clamp(-0.08, 0.08);
    // Visual hints baked into the card while dragging.
    final showKnownHint = _drag.dy < -24 && _drag.dy.abs() > _drag.dx.abs();
    final showSaveHint = _drag.dx > 24 && _drag.dx.abs() > _drag.dy.abs();
    final showSkipHint = (_drag.dx < -24 || _drag.dy > 24) &&
        !showKnownHint &&
        !showSaveHint;

    return GestureDetector(
      // Pan handlers must NOT also register tap — that's what causes
      // gestures to feel "stuck". We rely on the inner buttons for taps.
      behavior: HitTestBehavior.opaque,
      onLongPress: () => widget.onSwipe?.call(SwipeAction.bookmark),
      onDoubleTap: () => widget.onSwipe?.call(SwipeAction.known),
      onPanUpdate: _onPanUpdate,
      onPanEnd: _onPanEnd,
      onPanCancel: _onPanCancel,
      child: Transform.translate(
        offset: _drag,
        child: Transform.rotate(
          angle: angle,
          child: LayoutBuilder(
            builder: (context, constraints) {
              final cardH = constraints.maxHeight;
              // Hero image fills the upper portion of the card.
              final imageH = (cardH * 0.42).clamp(180.0, 320.0);
              return _CardSurface(
                child: Stack(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        SizedBox(
                          height: imageH,
                          child: _hero(w),
                        ),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(18, 14, 18, 0),
                            child: _meta(w),
                          ),
                        ),
                        _actionBar(),
                      ],
                    ),
                    if (showKnownHint)
                      _HintBadge(
                        label: 'KNOWN',
                        icon: Icons.check_rounded,
                        bg: AppColors.sage,
                        alignment: Alignment.topCenter,
                      ),
                    if (showSaveHint)
                      _HintBadge(
                        label: 'SAVED',
                        icon: Icons.favorite_rounded,
                        bg: AppColors.blush,
                        alignment: Alignment.centerRight,
                      ),
                    if (showSkipHint)
                      _HintBadge(
                        label: 'SKIP',
                        icon: Icons.skip_next_rounded,
                        bg: AppColors.cardAlt,
                        alignment: Alignment.centerLeft,
                      ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  // ── Sections ──────────────────────────────────────────────────────────────

  Widget _hero(WordCardData w) {
    final img = w.primaryImage;
    Widget inner;
    if (img == null || img.imageUrl.isEmpty) {
      inner = const StripePlaceholder(height: double.infinity);
    } else {
      inner = CachedNetworkImage(
        imageUrl: widget.api.resolveImageUrl(img.imageUrl),
        fit: BoxFit.cover,
        placeholder: (_, __) => const StripePlaceholder(height: double.infinity),
        errorWidget: (_, __, ___) =>
            const StripePlaceholder(height: double.infinity),
      );
    }
    return Stack(
      fit: StackFit.expand,
      children: [
        inner,
        Positioned(
          left: 14,
          top: 14,
          child: Row(
            children: [
              if (w.pos != null)
                Pill(w.pos!, background: posColor(w.pos)),
              if (w.cefrLevel != null) ...[
                const SizedBox(width: 6),
                Pill(w.cefrLevel!, background: AppColors.paper),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _meta(WordCardData w) {
    final descPrimary =
        w.descriptions.isNotEmpty ? w.descriptions.first.text : null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Flexible(
              child: Text(
                w.word,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppFonts.display(
                  size: 34,
                  weight: FontWeight.w700,
                  color: AppColors.ink,
                  height: 1.05,
                ),
              ),
            ),
            const SizedBox(width: 4),
            const Padding(
              padding: EdgeInsets.only(bottom: 6),
              child: WavyUnderline(width: 20, height: 6),
            ),
          ],
        ),
        if (w.translation != null) ...[
          const SizedBox(height: 2),
          Text(
            w.translation!,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppFonts.serif(
              size: 16,
              weight: FontWeight.w500,
              color: AppColors.inkSoft,
            ),
          ),
        ],
        const SizedBox(height: 8),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            if (w.phoneticsIpa != null)
              Pill(w.phoneticsIpa!, background: AppColors.cardAlt, color: AppColors.mute),
            if (w.phoneticsKk != null)
              Pill(w.phoneticsKk!, background: AppColors.cardAlt, color: AppColors.mute),
            if (w.syllableCount != null)
              Pill('${w.syllableCount} syl',
                  background: AppColors.cardAlt, color: AppColors.mute),
            Pill('US',
                icon: Icons.volume_up_rounded,
                background: AppColors.paper,
                color: AppColors.ink),
          ],
        ),
        if (w.definitionEn != null) ...[
          const SizedBox(height: 10),
          Text(
            w.definitionEn!,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AppFonts.sans(
              size: 13,
              color: AppColors.inkSoft,
              height: 1.45,
            ),
          ),
        ],
        if (descPrimary != null) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
            decoration: BoxDecoration(
              color: AppColors.butter.withValues(alpha: 0.45),
              borderRadius: BorderRadius.circular(AppRadii.sm),
            ),
            child: Text(
              descPrimary,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppFonts.serif(
                size: 12,
                color: AppColors.ink,
                height: 1.4,
              ),
            ),
          ),
        ],
        if (w.themeTags.isNotEmpty) ...[
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: [
              for (var i = 0; i < w.themeTags.length && i < 3; i++)
                Pill('#${w.themeTags[i]}', background: tagPastel(i)),
              for (var i = 0; i < w.examTags.length && i < 2; i++)
                Pill(w.examTags[i],
                    background: AppColors.accent.withValues(alpha: 0.85)),
            ],
          ),
        ],
      ],
    );
  }

  Widget _actionBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
      decoration: const BoxDecoration(
        color: AppColors.paper,
        border: Border(top: BorderSide(color: AppColors.hairline, width: 1)),
      ),
      child: Row(
        children: [
          Expanded(
            child: ChunkyButton(
              label: widget.known ? 'Already known' : 'Mark as known',
              icon: Icons.check_rounded,
              background: widget.known ? AppColors.sage : AppColors.ink,
              color: widget.known ? AppColors.ink : AppColors.paper,
              height: 46,
              onTap: widget.known
                  ? null
                  : () => widget.onSwipe?.call(SwipeAction.known),
            ),
          ),
          const SizedBox(width: 10),
          SoftIconButton(
            icon: widget.bookmarked
                ? Icons.favorite_rounded
                : Icons.favorite_border_rounded,
            selected: widget.bookmarked,
            size: 46,
            onTap: () => widget.onSwipe?.call(SwipeAction.bookmark),
          ),
        ],
      ),
    );
  }
}

class _CardSurface extends StatelessWidget {
  final Widget child;
  const _CardSurface({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        boxShadow: AppShadows.soft(y: 12, blur: 30, opacity: 0.08),
      ),
      clipBehavior: Clip.antiAlias,
      child: child,
    );
  }
}

class _HintBadge extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color bg;
  final Alignment alignment;
  const _HintBadge({
    required this.label,
    required this.icon,
    required this.bg,
    required this.alignment,
  });

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Align(
        alignment: alignment,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(AppRadii.pill),
              boxShadow: AppShadows.soft(y: 4, blur: 12, opacity: 0.1),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: AppColors.ink, size: 16),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: AppFonts.sans(
                    size: 12,
                    weight: FontWeight.w800,
                    color: AppColors.ink,
                    letterSpacing: 0.6,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
