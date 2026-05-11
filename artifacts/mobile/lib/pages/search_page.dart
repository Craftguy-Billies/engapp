// 16. Search Results

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/word.dart';
import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/page_header.dart';
import '../widgets/word_row.dart';

class SearchPage extends StatefulWidget {
  final void Function(int wordId) onOpenDetail;
  final VoidCallback? onBack;
  const SearchPage({super.key, required this.onOpenDetail, this.onBack});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final _ctrl = TextEditingController();
  final List<String> _recent = ['solitude', 'serendipity', 'linger'];
  String _query = '';
  List<WordCardData> _result = const [];

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _search(String q) async {
    setState(() => _query = q);
    final store = context.read<EngappStore>();
    final lq = q.toLowerCase().trim();
    if (lq.isEmpty) {
      setState(() => _result = const []);
      return;
    }
    final local = store.wordCache.values
        .where((w) =>
            w.word.toLowerCase().contains(lq) ||
            (w.translation ?? '').contains(q))
        .toList();
    if (int.tryParse(lq) != null) {
      final id = int.parse(lq);
      final w = await store.api.word(id);
      if (w != null && !local.any((x) => x.id == w.id)) local.add(w);
    }
    setState(() => _result = local);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(title: 'Search', onBack: widget.onBack),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 14),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(AppRadii.pill),
                  border: Border.all(color: AppColors.hairline),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.search_rounded, color: AppColors.mute, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _ctrl,
                        decoration: InputDecoration(
                          hintText: 'Search by word or id...',
                          border: InputBorder.none,
                          hintStyle: AppFonts.serif(
                            size: 14,
                            color: AppColors.mute,
                          ),
                        ),
                        style: AppFonts.sans(size: 14, color: AppColors.ink),
                        onChanged: _search,
                      ),
                    ),
                    if (_query.isNotEmpty)
                      IconButton(
                        onPressed: () {
                          _ctrl.clear();
                          _search('');
                        },
                        icon: const Icon(Icons.close_rounded,
                            color: AppColors.mute, size: 16),
                      ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: _query.isEmpty
                  ? _recentList()
                  : (_result.isEmpty ? _noResults() : _list()),
            ),
          ],
        ),
      ),
    );
  }

  Widget _recentList() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
      children: [
        const SoftLabel('Recent searches'),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (var i = 0; i < _recent.length; i++)
              GestureDetector(
                onTap: () {
                  _ctrl.text = _recent[i];
                  _search(_recent[i]);
                },
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: tagPastel(i),
                    borderRadius: BorderRadius.circular(AppRadii.pill),
                  ),
                  child: Text(
                    _recent[i],
                    style: AppFonts.sans(
                      size: 12,
                      weight: FontWeight.w600,
                      color: AppColors.ink,
                    ),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 22),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.butter.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(AppRadii.lg),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.lightbulb_rounded, color: AppColors.ink, size: 18),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '可以輸入單字（例：solitude）或者單字編號（例：1247）。',
                  style: AppFonts.serif(
                    size: 12,
                    color: AppColors.ink,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _noResults() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppColors.cardAlt,
                borderRadius: BorderRadius.circular(AppRadii.xl),
              ),
              child: const Icon(Icons.search_off_rounded,
                  color: AppColors.mute, size: 28),
            ),
            const SizedBox(height: 12),
            Text(
              'Nothing found',
              style: AppFonts.display(
                size: 18,
                weight: FontWeight.w700,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '試試直接輸入單字編號，例如 1247。',
              style: AppFonts.serif(size: 12, color: AppColors.mute),
            ),
          ],
        ),
      ),
    );
  }

  Widget _list() {
    final api = context.read<EngappStore>().api;
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
      itemCount: _result.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (_, i) => WordRow(
        word: _result[i],
        api: api,
        onTap: () => widget.onOpenDetail(_result[i].id),
        trailingIcon: Icons.chevron_right_rounded,
      ),
    );
  }
}
