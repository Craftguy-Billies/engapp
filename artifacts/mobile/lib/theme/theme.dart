// Design tokens for EngApp.
//
// "Clean but cute" — pulled back from the strictly editorial look of the
// React mockups. Warm beige page, off-white cards with rounded corners +
// soft drop shadow (not hard hairlines), deep warm charcoal instead of pure
// black, and a friendlier pastel accent palette beside the hero lime.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Surfaces
  static const Color page = Color(0xFFF3EDE2); // warm cream
  static const Color card = Color(0xFFFAF6EE); // off-white
  static const Color cardAlt = Color(0xFFF1ECDF);
  static const Color paper = Color(0xFFFFFBF3);

  // Ink
  static const Color ink = Color(0xFF1B1A17); // deep warm charcoal
  static const Color inkSoft = Color(0xFF34302A);
  static const Color mute = Color(0xFF8A8073);
  static const Color muteSoft = Color(0xFFC8BFB0);
  static const Color hairline = Color(0xFFE3DCCD);

  // Accent palette
  static const Color accent = Color(0xFFD4FF3D); // hero lime
  static const Color accentSoft = Color(0xFFEBFFA9);
  static const Color peach = Color(0xFFFFC9A4);
  static const Color sage = Color(0xFFB7D3B0);
  static const Color blush = Color(0xFFFFD3D8);
  static const Color butter = Color(0xFFFFE9A8);
  static const Color sky = Color(0xFFB8DCE8);
  static const Color lilac = Color(0xFFD8C7E8);
  static const Color warn = Color(0xFFFFB347);
  static const Color pop = Color(0xFFFF8FA8);
  static const Color cool = Color(0xFF8EDED0);
}

class AppRadii {
  static const double xs = 8;
  static const double sm = 12;
  static const double md = 16;
  static const double lg = 22;
  static const double xl = 28;
  static const double pill = 999;
}

class AppShadows {
  static List<BoxShadow> soft({double y = 8, double blur = 24, double opacity = 0.06}) => [
        BoxShadow(
          color: const Color(0xFF1B1A17).withValues(alpha: opacity),
          offset: Offset(0, y),
          blurRadius: blur,
        ),
      ];

  static List<BoxShadow> sticker = [
        BoxShadow(
          color: const Color(0xFF1B1A17).withValues(alpha: 0.08),
          offset: const Offset(0, 4),
          blurRadius: 0,
        ),
      ];
}

class AppFonts {
  static TextStyle sans({
    double? size,
    FontWeight? weight,
    double? letterSpacing,
    Color? color,
    double? height,
    FontStyle? style,
    TextDecoration? decoration,
  }) {
    return GoogleFonts.inter(
      fontSize: size,
      fontWeight: weight,
      letterSpacing: letterSpacing,
      color: color,
      height: height,
      fontStyle: style,
      decoration: decoration,
    );
  }

  static TextStyle serif({
    double? size,
    FontWeight? weight,
    double? letterSpacing,
    Color? color,
    double? height,
  }) {
    return GoogleFonts.notoSerifTc(
      fontSize: size,
      fontWeight: weight,
      letterSpacing: letterSpacing,
      color: color,
      height: height,
    );
  }

  static TextStyle display({
    double? size,
    FontWeight? weight,
    Color? color,
    double? height,
    double? letterSpacing,
  }) {
    return GoogleFonts.fraunces(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
    );
  }
}

/// Small mixed-case label that replaces the all-caps editorial eyebrow.
class SoftLabel extends StatelessWidget {
  final String text;
  final Color? color;
  final double size;
  const SoftLabel(this.text, {super.key, this.color, this.size = 11});

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: AppFonts.sans(
        size: size,
        weight: FontWeight.w500,
        letterSpacing: 0.2,
        color: color ?? AppColors.mute,
      ),
    );
  }
}

class Hairline extends StatelessWidget {
  final double height;
  final Color? color;
  const Hairline({super.key, this.height = 1, this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      color: color ?? AppColors.hairline,
    );
  }
}

const List<String> cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const List<String> themesAll = [
  'nature',
  'business',
  'emotion',
  'loneliness',
  'reflection',
  'travel',
  'food',
  'love',
  'time',
  'work',
  'family',
  'art',
];

const List<String> examsAll = [
  'HKDSE',
  'TOEIC',
  'TOEFL',
  'IELTS',
  'Eiken',
  'Suneung',
];

const List<String> sourceListsAll = ['NGSL', 'NAWL', 'TSL', 'BSL', 'CEFR-J'];

const List<int> dailyGoalOptions = [3, 5, 10, 20, 50];

class LearningGoal {
  final String code;
  final String label;
  final String subtitle;
  const LearningGoal(this.code, this.label, this.subtitle);
}

const List<LearningGoal> learningGoals = [
  LearningGoal('casual', 'Casual', '無壓力 · 慢慢學'),
  LearningGoal('travel', 'Travel', '旅遊實用'),
  LearningGoal('business', 'Business', '商務英語'),
  LearningGoal('toefl', 'TOEFL', '托福備考'),
  LearningGoal('ielts', 'IELTS', '雅思備考'),
];

class UiLanguage {
  final String code;
  final String label;
  final String native;
  const UiLanguage(this.code, this.label, this.native);
}

const List<UiLanguage> uiLanguages = [
  UiLanguage('zh-TW', 'Traditional Chinese', '繁體中文（台灣）'),
  UiLanguage('zh-HK', 'Cantonese', '繁體中文（香港）'),
  UiLanguage('ja', 'Japanese', '日本語'),
  UiLanguage('ko', 'Korean', '한국어'),
  UiLanguage('en', 'English', 'English'),
];

Color posColor(String? pos) {
  switch (pos) {
    case 'n':
    case 'noun':
      return AppColors.sage;
    case 'adj':
      return AppColors.butter;
    case 'v':
    case 'verb':
      return AppColors.blush;
    case 'adv':
      return AppColors.sky;
    default:
      return AppColors.sage;
  }
}

/// Rotating pastel for chip-style tags so groups of tags look friendly rather
/// than uniform.
Color tagPastel(int index) {
  const palette = [
    AppColors.peach,
    AppColors.sage,
    AppColors.blush,
    AppColors.butter,
    AppColors.sky,
    AppColors.lilac,
  ];
  return palette[index % palette.length];
}
