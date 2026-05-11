// 15. Browse / Filter Picker

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/page_header.dart';
import '../widgets/primitives.dart';

class BrowsePage extends StatefulWidget {
  final VoidCallback onApplied;
  final VoidCallback? onBack;
  const BrowsePage({super.key, required this.onApplied, this.onBack});

  @override
  State<BrowsePage> createState() => _BrowsePageState();
}

class _BrowsePageState extends State<BrowsePage> {
  String? _cefr;
  final Set<String> _themes = {};
  final Set<String> _exams = {};
  final Set<String> _sources = {};
  String? _style;

  @override
  void initState() {
    super.initState();
    final f = context.read<EngappStore>().filters;
    _cefr = f.cefr;
    if (f.themeTag != null) _themes.add(f.themeTag!);
    if (f.examTag != null) _exams.add(f.examTag!);
    _style = f.styleSlug;
  }

  @override
  Widget build(BuildContext context) {
    final styles = context.watch<EngappStore>().styles;
    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            PageHeader(
              title: 'Browse',
              subtitle: '挑出今天想看的方向',
              onBack: widget.onBack,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                children: [
                  _Section(
                    label: 'Level',
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final c in cefrLevels)
                          _Chip(
                            label: c,
                            selected: _cefr == c,
                            color: AppColors.butter,
                            onTap: () =>
                                setState(() => _cefr = _cefr == c ? null : c),
                          ),
                      ],
                    ),
                  ),
                  _Section(
                    label: 'Theme',
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (var i = 0; i < themesAll.length; i++)
                          _Chip(
                            label: '#${themesAll[i]}',
                            selected: _themes.contains(themesAll[i]),
                            color: tagPastel(i),
                            onTap: () => setState(() {
                              if (_themes.contains(themesAll[i])) {
                                _themes.remove(themesAll[i]);
                              } else {
                                _themes.add(themesAll[i]);
                              }
                            }),
                          ),
                      ],
                    ),
                  ),
                  _Section(
                    label: 'Exam',
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final e in examsAll)
                          _Chip(
                            label: e,
                            selected: _exams.contains(e),
                            color: AppColors.sage,
                            onTap: () => setState(() {
                              if (_exams.contains(e)) {
                                _exams.remove(e);
                              } else {
                                _exams.add(e);
                              }
                            }),
                          ),
                      ],
                    ),
                  ),
                  _Section(
                    label: 'Source list',
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final s in sourceListsAll)
                          _Chip(
                            label: s,
                            selected: _sources.contains(s),
                            color: AppColors.lilac,
                            onTap: () => setState(() {
                              if (_sources.contains(s)) {
                                _sources.remove(s);
                              } else {
                                _sources.add(s);
                              }
                            }),
                          ),
                      ],
                    ),
                  ),
                  _Section(
                    label: 'Style',
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final s in styles)
                          _Chip(
                            label: s.name,
                            selected: _style == s.slug,
                            color: AppColors.peach,
                            onTap: () => setState(
                              () => _style = _style == s.slug ? null : s.slug,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 18),
              child: Row(
                children: [
                  Expanded(
                    child: ChunkyButton(
                      label: 'Clear',
                      background: AppColors.cardAlt,
                      color: AppColors.ink,
                      onTap: () => setState(() {
                        _cefr = null;
                        _themes.clear();
                        _exams.clear();
                        _sources.clear();
                        _style = null;
                      }),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: ChunkyButton(
                      label: 'Apply filter',
                      icon: Icons.bolt_rounded,
                      onTap: () async {
                        await context.read<EngappStore>().refreshFeed(
                              filters: FeedFilters(
                                cefr: _cefr,
                                themeTag: _themes.isEmpty ? null : _themes.first,
                                examTag: _exams.isEmpty ? null : _exams.first,
                                styleSlug: _style,
                              ),
                            );
                        widget.onApplied();
                      },
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

class _Section extends StatelessWidget {
  final String label;
  final Widget child;
  const _Section({required this.label, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 6, bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SoftLabel(label),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final Color color;
  final bool selected;
  final VoidCallback onTap;
  const _Chip({
    required this.label,
    required this.color,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppColors.ink : color,
          borderRadius: BorderRadius.circular(AppRadii.pill),
          boxShadow: AppShadows.soft(y: 2, blur: 6, opacity: 0.04),
        ),
        child: Text(
          label,
          style: AppFonts.sans(
            size: 12,
            weight: FontWeight.w600,
            color: selected ? AppColors.paper : AppColors.ink,
          ),
        ),
      ),
    );
  }
}
