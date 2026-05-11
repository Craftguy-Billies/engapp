// Small reusable widgets that lean into the 'clean but cute' theme.
//
// - Pill: rounded chip with a pastel background and optional outline + dot.
// - SoftIconButton: rounded square button with subtle shadow.
// - ProgressRing: circular progress used on Stats.
// - WavyUnderline: hand-drawn-feel underline rendered with a CustomPainter.

import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../theme/theme.dart';

class Pill extends StatelessWidget {
  final String text;
  final Color? background;
  final Color? color;
  final bool outlined;
  final EdgeInsets padding;
  final IconData? icon;

  const Pill(
    this.text, {
    super.key,
    this.background,
    this.color,
    this.outlined = false,
    this.icon,
    this.padding = const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: outlined ? Colors.transparent : (background ?? AppColors.cardAlt),
        borderRadius: BorderRadius.circular(AppRadii.pill),
        border: outlined ? Border.all(color: AppColors.hairline, width: 1) : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: color ?? AppColors.ink),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            style: AppFonts.sans(
              size: 11,
              weight: FontWeight.w600,
              letterSpacing: 0.1,
              color: color ?? AppColors.ink,
            ),
          ),
        ],
      ),
    );
  }
}

class SoftIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final Color? background;
  final Color? color;
  final double size;
  final bool selected;

  const SoftIconButton({
    super.key,
    required this.icon,
    this.onTap,
    this.background,
    this.color,
    this.size = 42,
    this.selected = false,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadii.md),
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: selected
                ? AppColors.accent
                : (background ?? AppColors.card),
            borderRadius: BorderRadius.circular(AppRadii.md),
            border: Border.all(color: AppColors.hairline, width: 1),
            boxShadow: AppShadows.soft(y: 4, blur: 10, opacity: 0.04),
          ),
          child: Icon(icon, color: color ?? AppColors.ink, size: 18),
        ),
      ),
    );
  }
}

class ProgressRing extends StatelessWidget {
  final double progress; // 0..1
  final double size;
  final double stroke;
  final Color? trackColor;
  final Color? color;
  final Widget? child;

  const ProgressRing({
    super.key,
    required this.progress,
    this.size = 64,
    this.stroke = 6,
    this.trackColor,
    this.color,
    this.child,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _RingPainter(
          progress: progress.clamp(0, 1),
          stroke: stroke,
          track: trackColor ?? AppColors.hairline,
          color: color ?? AppColors.ink,
        ),
        child: Center(child: child),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  final double progress;
  final double stroke;
  final Color track;
  final Color color;
  _RingPainter({
    required this.progress,
    required this.stroke,
    required this.track,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final r = math.min(size.width, size.height) / 2 - stroke / 2;
    final c = Offset(size.width / 2, size.height / 2);

    final base = Paint()
      ..color = track
      ..strokeWidth = stroke
      ..style = PaintingStyle.stroke;
    canvas.drawCircle(c, r, base);

    if (progress <= 0) return;

    final p = Paint()
      ..color = color
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;
    canvas.drawArc(
      Rect.fromCircle(center: c, radius: r),
      -math.pi / 2,
      progress * 2 * math.pi,
      false,
      p,
    );
  }

  @override
  bool shouldRepaint(covariant _RingPainter old) =>
      old.progress != progress || old.color != color;
}

/// Hand-drawn-feel wavy underline used to highlight key text without feeling
/// mechanical.
class WavyUnderline extends StatelessWidget {
  final double width;
  final double height;
  final Color color;
  const WavyUnderline({
    super.key,
    required this.width,
    this.height = 6,
    this.color = AppColors.accent,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(width, height),
      painter: _WavyPainter(color),
    );
  }
}

class _WavyPainter extends CustomPainter {
  final Color color;
  _WavyPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = color
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;
    final path = Path();
    final h = size.height;
    path.moveTo(0, h / 2);
    const wavelength = 14.0;
    for (double x = 0; x <= size.width; x += wavelength) {
      path.quadraticBezierTo(x + wavelength / 4, 0, x + wavelength / 2, h / 2);
      path.quadraticBezierTo(x + 3 * wavelength / 4, h, x + wavelength, h / 2);
    }
    canvas.drawPath(path, p);
  }

  @override
  bool shouldRepaint(covariant _WavyPainter old) => old.color != color;
}

class StripePlaceholder extends StatelessWidget {
  final double height;
  final BorderRadius? borderRadius;
  const StripePlaceholder({super.key, this.height = 200, this.borderRadius});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: AppColors.cardAlt,
        borderRadius: borderRadius ?? BorderRadius.circular(AppRadii.lg),
      ),
      child: CustomPaint(painter: _StripesPainter()),
    );
  }
}

class _StripesPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = AppColors.muteSoft.withValues(alpha: 0.35)
      ..strokeWidth = 1;
    for (double x = -size.height; x < size.width; x += 14) {
      canvas.drawLine(Offset(x, size.height), Offset(x + size.height, 0), p);
    }
  }

  @override
  bool shouldRepaint(covariant _StripesPainter old) => false;
}

class CardSurface extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final Color? background;
  final BorderRadius? borderRadius;
  final List<BoxShadow>? shadow;
  final BoxBorder? border;

  const CardSurface({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.background,
    this.borderRadius,
    this.shadow,
    this.border,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: background ?? AppColors.card,
        borderRadius: borderRadius ?? BorderRadius.circular(AppRadii.lg),
        boxShadow: shadow ?? AppShadows.soft(),
        border: border,
      ),
      child: child,
    );
  }
}

class ChunkyButton extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback? onTap;
  final Color? background;
  final Color? color;
  final bool fullWidth;
  final double height;

  const ChunkyButton({
    super.key,
    required this.label,
    this.icon,
    this.onTap,
    this.background,
    this.color,
    this.fullWidth = true,
    this.height = 52,
  });

  @override
  Widget build(BuildContext context) {
    final btn = Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadii.pill),
        child: Container(
          height: height,
          padding: const EdgeInsets.symmetric(horizontal: 24),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: background ?? AppColors.ink,
            borderRadius: BorderRadius.circular(AppRadii.pill),
            boxShadow: AppShadows.soft(y: 6, blur: 14, opacity: 0.08),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, color: color ?? AppColors.paper, size: 16),
                const SizedBox(width: 8),
              ],
              Text(
                label,
                style: AppFonts.sans(
                  size: 14,
                  weight: FontWeight.w700,
                  letterSpacing: 0.2,
                  color: color ?? AppColors.paper,
                ),
              ),
            ],
          ),
        ),
      ),
    );
    return fullWidth ? SizedBox(width: double.infinity, child: btn) : btn;
  }
}
