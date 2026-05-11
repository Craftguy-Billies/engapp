import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../api/api_client.dart';
import '../models/word.dart';
import '../theme/theme.dart';
import 'primitives.dart';

class WordRow extends StatelessWidget {
  final WordCardData word;
  final EngappApi api;
  final VoidCallback? onTap;
  final VoidCallback? onTrailing;
  final IconData? trailingIcon;
  final String? badge;

  const WordRow({
    super.key,
    required this.word,
    required this.api,
    this.onTap,
    this.onTrailing,
    this.trailingIcon,
    this.badge,
  });

  @override
  Widget build(BuildContext context) {
    final img = word.primaryImage;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        child: Container(
          padding: const EdgeInsets.fromLTRB(10, 10, 14, 10),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(AppRadii.lg),
            boxShadow: AppShadows.soft(y: 4, blur: 12, opacity: 0.04),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(AppRadii.md),
                child: SizedBox(
                  width: 58,
                  height: 58,
                  child: img == null
                      ? const StripePlaceholder(height: 58)
                      : CachedNetworkImage(
                          imageUrl: api.resolveImageUrl(img.imageUrl),
                          fit: BoxFit.cover,
                          placeholder: (_, __) => const StripePlaceholder(height: 58),
                          errorWidget: (_, __, ___) => const StripePlaceholder(height: 58),
                        ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Flexible(
                          child: Text(
                            word.word,
                            overflow: TextOverflow.ellipsis,
                            style: AppFonts.display(
                              size: 18,
                              weight: FontWeight.w600,
                              color: AppColors.ink,
                            ),
                          ),
                        ),
                        if (word.cefrLevel != null) ...[
                          const SizedBox(width: 8),
                          Pill(
                            word.cefrLevel!,
                            background: AppColors.accent,
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      word.translation ?? '',
                      style: AppFonts.serif(size: 13, color: AppColors.mute),
                    ),
                    if (badge != null) ...[
                      const SizedBox(height: 6),
                      Pill(badge!, background: AppColors.peach),
                    ],
                  ],
                ),
              ),
              if (trailingIcon != null)
                IconButton(
                  onPressed: onTrailing,
                  icon: Icon(trailingIcon, color: AppColors.mute, size: 18),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
