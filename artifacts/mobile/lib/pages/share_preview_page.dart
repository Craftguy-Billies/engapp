// 17. Share Card Preview (client-side render)

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/word.dart';
import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/page_header.dart';
import '../widgets/primitives.dart';

enum ShareVariant { focus, snarky, streak }

class SharePreviewPage extends StatefulWidget {
  final int wordId;
  final VoidCallback onBack;
  const SharePreviewPage({super.key, required this.wordId, required this.onBack});

  @override
  State<SharePreviewPage> createState() => _SharePreviewPageState();
}

class _SharePreviewPageState extends State<SharePreviewPage> {
  ShareVariant _variant = ShareVariant.focus;

  @override
  Widget build(BuildContext context) {
    final store = context.watch<EngappStore>();
    final w = store.wordById(widget.wordId);

    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(
              title: 'Share',
              subtitle: '挑一張版型，存到相簿或分享出去',
              onBack: widget.onBack,
            ),
            Expanded(
              child: Center(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 220),
                  child: w == null
                      ? const Text('Not found')
                      : SizedBox(
                          key: ValueKey(_variant),
                          width: 280,
                          height: 460,
                          child: _ShareCard(word: w, variant: _variant, api: store.api),
                        ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (final v in ShareVariant.values) ...[
                    GestureDetector(
                      onTap: () => setState(() => _variant = v),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: _variant == v ? AppColors.ink : AppColors.cardAlt,
                          borderRadius: BorderRadius.circular(AppRadii.pill),
                        ),
                        child: Text(
                          v == ShareVariant.focus
                              ? 'Focus'
                              : (v == ShareVariant.snarky ? 'Snarky' : 'Streak'),
                          style: AppFonts.sans(
                            size: 12,
                            weight: FontWeight.w600,
                            color: _variant == v ? AppColors.paper : AppColors.ink,
                          ),
                        ),
                      ),
                    ),
                    if (v != ShareVariant.values.last) const SizedBox(width: 8),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 14),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 18),
              child: Row(
                children: [
                  Expanded(
                    child: ChunkyButton(
                      label: 'Save to Photos',
                      icon: Icons.download_rounded,
                      background: AppColors.cardAlt,
                      color: AppColors.ink,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ChunkyButton(
                      label: 'Share',
                      icon: Icons.ios_share_rounded,
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

class _ShareCard extends StatelessWidget {
  final WordCardData word;
  final ShareVariant variant;
  final dynamic api;
  const _ShareCard({required this.word, required this.variant, required this.api});

  @override
  Widget build(BuildContext context) {
    switch (variant) {
      case ShareVariant.focus:
        return _focus();
      case ShareVariant.snarky:
        return _snarky();
      case ShareVariant.streak:
        return _streak(context);
    }
  }

  Widget _focus() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.paper,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        boxShadow: AppShadows.soft(y: 16, blur: 32, opacity: 0.1),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadii.xl),
        child: Column(
          children: [
            Expanded(
              child: word.primaryImage == null
                  ? const StripePlaceholder(height: 280)
                  : CachedNetworkImage(
                      imageUrl: api.resolveImageUrl(word.primaryImage!.imageUrl),
                      fit: BoxFit.cover,
                      width: double.infinity,
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    word.word,
                    style: AppFonts.display(
                      size: 32,
                      weight: FontWeight.w700,
                      color: AppColors.ink,
                    ),
                  ),
                  if (word.translation != null)
                    Text(
                      word.translation!,
                      style: AppFonts.serif(
                        size: 16,
                        weight: FontWeight.w500,
                        color: AppColors.inkSoft,
                      ),
                    ),
                  const SizedBox(height: 10),
                  Text(
                    word.definitionEn ?? '',
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: AppFonts.sans(
                      size: 12,
                      color: AppColors.mute,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.accent,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'engapp · 今天又學一個',
                        style: AppFonts.sans(
                          size: 10,
                          weight: FontWeight.w600,
                          color: AppColors.mute,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _snarky() {
    final snark = word.descriptions.firstWhere(
      (d) => d.tone == 'snarky',
      orElse: () => word.descriptions.isNotEmpty
          ? word.descriptions.first
          : const _Stub(),
    );
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.ink,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        boxShadow: AppShadows.soft(y: 16, blur: 32, opacity: 0.15),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SoftLabel('snarky · today', color: AppColors.muteSoft),
          const SizedBox(height: 14),
          Text(
            word.word,
            style: AppFonts.display(
              size: 36,
              weight: FontWeight.w700,
              color: AppColors.accent,
            ),
          ),
          const SizedBox(height: 4),
          if (word.translation != null)
            Text(
              word.translation!,
              style: AppFonts.serif(
                size: 16,
                color: AppColors.paper,
              ),
            ),
          const Spacer(),
          Text(
            snark.text,
            style: AppFonts.serif(
              size: 18,
              color: AppColors.paper,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.accent,
              borderRadius: BorderRadius.circular(AppRadii.pill),
            ),
            child: Text(
              'engapp.app',
              style: AppFonts.sans(
                size: 10,
                weight: FontWeight.w700,
                color: AppColors.ink,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _streak(BuildContext context) {
    final s = context.read<EngappStore>().stats;
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.peach,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        boxShadow: AppShadows.soft(y: 16, blur: 32, opacity: 0.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SoftLabel('Streak milestone'),
          const SizedBox(height: 18),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${s.streak}',
                style: AppFonts.display(
                  size: 96,
                  weight: FontWeight.w700,
                  color: AppColors.ink,
                  height: 0.9,
                ),
              ),
              const SizedBox(width: 6),
              Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Text(
                  'days\nin a row',
                  style: AppFonts.serif(
                    size: 14,
                    color: AppColors.ink,
                    height: 1.2,
                  ),
                ),
              ),
            ],
          ),
          const Spacer(),
          Text(
            'today\'s word · ${word.word}',
            style: AppFonts.sans(
              size: 13,
              weight: FontWeight.w600,
              color: AppColors.ink,
            ),
          ),
          if (word.translation != null)
            Text(
              word.translation!,
              style: AppFonts.serif(size: 18, color: AppColors.ink),
            ),
        ],
      ),
    );
  }
}

class _Stub implements WordDescription {
  const _Stub();
  @override
  String get languageCode => 'zh-TW';
  @override
  String get text => '今日金句加載中…';
  @override
  String get tone => 'snarky';
}
