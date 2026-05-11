// 2-5. Onboarding — Language, Exam, Daily Goal, Style Picker

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/primitives.dart';

class _OnboardingShell extends StatelessWidget {
  final String eyebrow;
  final String title;
  final String subtitle;
  final Widget body;
  final String ctaLabel;
  final VoidCallback? onCta;
  final int step; // 1..4

  const _OnboardingShell({
    required this.eyebrow,
    required this.title,
    required this.subtitle,
    required this.body,
    required this.ctaLabel,
    required this.onCta,
    required this.step,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(22, 20, 22, 22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  for (var i = 1; i <= 4; i++) ...[
                    Expanded(
                      child: Container(
                        height: 4,
                        decoration: BoxDecoration(
                          color: i <= step ? AppColors.ink : AppColors.hairline,
                          borderRadius: BorderRadius.circular(99),
                        ),
                      ),
                    ),
                    if (i < 4) const SizedBox(width: 6),
                  ],
                ],
              ),
              const SizedBox(height: 24),
              SoftLabel(eyebrow),
              const SizedBox(height: 8),
              Text(
                title,
                style: AppFonts.display(
                  size: 30,
                  weight: FontWeight.w700,
                  color: AppColors.ink,
                  height: 1.1,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                subtitle,
                style: AppFonts.serif(size: 14, color: AppColors.mute, height: 1.5),
              ),
              const SizedBox(height: 22),
              Expanded(child: body),
              const SizedBox(height: 14),
              ChunkyButton(label: ctaLabel, onTap: onCta),
            ],
          ),
        ),
      ),
    );
  }
}

class _SelectableTile extends StatelessWidget {
  final String label;
  final String? subtitle;
  final bool selected;
  final VoidCallback onTap;
  final Color? accent;
  final IconData? icon;

  const _SelectableTile({
    required this.label,
    required this.selected,
    required this.onTap,
    this.subtitle,
    this.accent,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: selected ? AppColors.ink : AppColors.card,
            borderRadius: BorderRadius.circular(AppRadii.lg),
            boxShadow: AppShadows.soft(y: 4, blur: 10, opacity: 0.05),
            border: Border.all(
              color: selected ? AppColors.ink : AppColors.hairline,
            ),
          ),
          child: Row(
            children: [
              if (icon != null)
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: accent ?? AppColors.accentSoft,
                    borderRadius: BorderRadius.circular(AppRadii.md),
                  ),
                  child: Icon(icon, color: AppColors.ink, size: 18),
                ),
              if (icon != null) const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      label,
                      style: AppFonts.sans(
                        size: 15,
                        weight: FontWeight.w600,
                        color: selected ? AppColors.paper : AppColors.ink,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        subtitle!,
                        style: AppFonts.serif(
                          size: 12,
                          color: selected ? AppColors.muteSoft : AppColors.mute,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (selected)
                const Icon(Icons.check_rounded, color: AppColors.accent, size: 22),
            ],
          ),
        ),
      ),
    );
  }
}

class OnboardingLanguagePage extends StatefulWidget {
  final VoidCallback onNext;
  const OnboardingLanguagePage({super.key, required this.onNext});

  @override
  State<OnboardingLanguagePage> createState() => _OnboardingLanguagePageState();
}

class _OnboardingLanguagePageState extends State<OnboardingLanguagePage> {
  String _value = 'zh-TW';

  @override
  void initState() {
    super.initState();
    _value = context.read<EngappStore>().user.uiLanguage;
  }

  @override
  Widget build(BuildContext context) {
    return _OnboardingShell(
      step: 1,
      eyebrow: 'Step 1 of 4',
      title: 'Pick your language',
      subtitle: '我們會用這個語言顯示翻譯與描述。之後也可以隨時更改。',
      body: ListView.separated(
        itemBuilder: (_, i) {
          final lang = uiLanguages[i];
          return _SelectableTile(
            label: lang.native,
            subtitle: lang.label,
            selected: _value == lang.code,
            onTap: () => setState(() => _value = lang.code),
            accent: tagPastel(i),
            icon: Icons.translate_rounded,
          );
        },
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemCount: uiLanguages.length,
      ),
      ctaLabel: 'Continue',
      onCta: () async {
        await context.read<EngappStore>().patchUser({'uiLanguage': _value});
        widget.onNext();
      },
    );
  }
}

class OnboardingExamPage extends StatefulWidget {
  final VoidCallback onNext;
  const OnboardingExamPage({super.key, required this.onNext});

  @override
  State<OnboardingExamPage> createState() => _OnboardingExamPageState();
}

class _OnboardingExamPageState extends State<OnboardingExamPage> {
  String _value = 'casual';

  @override
  void initState() {
    super.initState();
    _value = context.read<EngappStore>().user.learningGoal;
  }

  @override
  Widget build(BuildContext context) {
    return _OnboardingShell(
      step: 2,
      eyebrow: 'Step 2 of 4',
      title: 'What are you studying for?',
      subtitle: '可以選一個方向。沒有也沒關係——Casual 就是慢慢學。',
      body: ListView.separated(
        itemBuilder: (_, i) {
          final g = learningGoals[i];
          return _SelectableTile(
            label: g.label,
            subtitle: g.subtitle,
            selected: _value == g.code,
            onTap: () => setState(() => _value = g.code),
            accent: tagPastel(i),
            icon: i == 0
                ? Icons.coffee_rounded
                : i == 1
                    ? Icons.flight_rounded
                    : i == 2
                        ? Icons.work_rounded
                        : Icons.school_rounded,
          );
        },
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemCount: learningGoals.length,
      ),
      ctaLabel: 'Continue',
      onCta: () async {
        await context.read<EngappStore>().patchUser({'learningGoal': _value});
        widget.onNext();
      },
    );
  }
}

class OnboardingDailyPage extends StatefulWidget {
  final VoidCallback onNext;
  const OnboardingDailyPage({super.key, required this.onNext});

  @override
  State<OnboardingDailyPage> createState() => _OnboardingDailyPageState();
}

class _OnboardingDailyPageState extends State<OnboardingDailyPage> {
  int _value = 5;

  @override
  void initState() {
    super.initState();
    _value = context.read<EngappStore>().user.dailyGoal;
  }

  @override
  Widget build(BuildContext context) {
    return _OnboardingShell(
      step: 3,
      eyebrow: 'Step 3 of 4',
      title: 'How many words per day?',
      subtitle: '一天幾個單字就好。少而持續，比一次塞滿好太多。',
      body: Column(
        children: [
          GridView.count(
            crossAxisCount: 3,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              for (var i = 0; i < dailyGoalOptions.length; i++)
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => setState(() => _value = dailyGoalOptions[i]),
                    borderRadius: BorderRadius.circular(AppRadii.lg),
                    child: Container(
                      decoration: BoxDecoration(
                        color: _value == dailyGoalOptions[i]
                            ? AppColors.ink
                            : AppColors.card,
                        borderRadius: BorderRadius.circular(AppRadii.lg),
                        boxShadow: AppShadows.soft(y: 4, blur: 8, opacity: 0.05),
                      ),
                      alignment: Alignment.center,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${dailyGoalOptions[i]}',
                            style: AppFonts.display(
                              size: 30,
                              weight: FontWeight.w700,
                              color: _value == dailyGoalOptions[i]
                                  ? AppColors.accent
                                  : AppColors.ink,
                            ),
                          ),
                          Text(
                            'words / day',
                            style: AppFonts.sans(
                              size: 10,
                              weight: FontWeight.w500,
                              color: _value == dailyGoalOptions[i]
                                  ? AppColors.paper
                                  : AppColors.mute,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.butter.withValues(alpha: 0.55),
              borderRadius: BorderRadius.circular(AppRadii.md),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.lightbulb_rounded, color: AppColors.ink, size: 16),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    '你以後每天可以重設一次。Streak 不會因此重置。',
                    style: AppFonts.serif(
                      size: 12,
                      color: AppColors.ink,
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      ctaLabel: 'Continue',
      onCta: () async {
        await context.read<EngappStore>().patchUser({'dailyGoal': _value});
        widget.onNext();
      },
    );
  }
}

class OnboardingStylePage extends StatefulWidget {
  final VoidCallback onNext;
  final VoidCallback onPremium;
  const OnboardingStylePage({super.key, required this.onNext, required this.onPremium});

  @override
  State<OnboardingStylePage> createState() => _OnboardingStylePageState();
}

class _OnboardingStylePageState extends State<OnboardingStylePage> {
  int? _value;

  @override
  void initState() {
    super.initState();
    final s = context.read<EngappStore>();
    _value = s.user.preferredStyleId ?? (s.styles.isNotEmpty ? s.styles.first.id : null);
  }

  @override
  Widget build(BuildContext context) {
    final styles = context.watch<EngappStore>().styles;
    return _OnboardingShell(
      step: 4,
      eyebrow: 'Step 4 of 4',
      title: 'Pick an illustration style',
      subtitle: 'Free styles 可以直接用。Premium 之後再升級也行。',
      body: GridView.count(
        crossAxisCount: 2,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 0.95,
        children: [
          for (final s in styles)
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () {
                  if (s.isFree) {
                    setState(() => _value = s.id);
                  } else {
                    widget.onPremium();
                  }
                },
                borderRadius: BorderRadius.circular(AppRadii.lg),
                child: Stack(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _value == s.id ? AppColors.ink : AppColors.card,
                        borderRadius: BorderRadius.circular(AppRadii.lg),
                        boxShadow: AppShadows.soft(y: 4, blur: 10, opacity: 0.06),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    tagPastel(s.id),
                                    tagPastel(s.id + 2),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(AppRadii.md),
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            s.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppFonts.sans(
                              size: 13,
                              weight: FontWeight.w600,
                              color: _value == s.id ? AppColors.paper : AppColors.ink,
                            ),
                          ),
                          Text(
                            s.isFree ? 'Free' : 'Premium',
                            style: AppFonts.sans(
                              size: 10,
                              weight: FontWeight.w500,
                              color: _value == s.id ? AppColors.muteSoft : AppColors.mute,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (!s.isFree)
                      Positioned(
                        top: 16,
                        right: 16,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: AppColors.ink,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.lock_rounded,
                              color: AppColors.accent, size: 14),
                        ),
                      ),
                  ],
                ),
              ),
            ),
        ],
      ),
      ctaLabel: 'Start swiping',
      onCta: () async {
        if (_value != null) {
          await context.read<EngappStore>().patchUser({'preferredStyleId': _value});
        }
        widget.onNext();
      },
    );
  }
}
