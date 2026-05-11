// First-run tutorial — demonstrates the three swipe gestures with auto-looping
// card animation. The user can also pan the card themselves; while they drag,
// the auto animation pauses. None of the practice swipes mutate state.
//
//   swipe LEFT  → already knew  (sage hint)
//   swipe RIGHT → need to memorise / save  (blush hint)
//   swipe UP    → skip  (butter hint)

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/primitives.dart';

class TutorialPage extends StatefulWidget {
  final VoidCallback onDone;
  const TutorialPage({super.key, required this.onDone});

  @override
  State<TutorialPage> createState() => _TutorialPageState();
}

enum _DemoAxis { none, horizontal, vertical }

class _TutorialPageState extends State<TutorialPage>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  int _phase = 0; // 0=left, 1=right, 2=up
  bool _userTouching = false;
  Offset _userDrag = Offset.zero;
  _DemoAxis _axis = _DemoAxis.none;

  static const double _distanceThreshold = 60;
  static const double _axisCommit = 6;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..addStatusListener((s) {
        if (s == AnimationStatus.completed) {
          setState(() => _phase = (_phase + 1) % 3);
          if (!_userTouching) _ctrl.forward(from: 0);
        }
      });
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Offset _targetForPhase(int phase, Size area) {
    final w = area.width;
    final h = area.height;
    switch (phase) {
      case 0:
        return Offset(-w * 0.9, 0); // left
      case 1:
        return Offset(w * 0.9, 0); // right
      case 2:
        return Offset(0, -h * 0.9); // up
      default:
        return Offset.zero;
    }
  }

  ({String title, String subtitle, IconData icon, Color color, String arrow})
      _phaseInfo(int phase) {
    switch (phase) {
      case 0:
        return (
          title: 'Swipe left',
          subtitle: 'Words you already know',
          icon: Icons.check_rounded,
          color: AppColors.sage,
          arrow: '←',
        );
      case 1:
        return (
          title: 'Swipe right',
          subtitle: "Words you'd like to memorise",
          icon: Icons.favorite_rounded,
          color: AppColors.blush,
          arrow: '→',
        );
      case 2:
        return (
          title: 'Swipe up',
          subtitle: 'Skip for now — see it again later',
          icon: Icons.skip_next_rounded,
          color: AppColors.butter,
          arrow: '↑',
        );
      default:
        return (
          title: '',
          subtitle: '',
          icon: Icons.swipe_rounded,
          color: AppColors.cardAlt,
          arrow: '',
        );
    }
  }

  // ── Manual practice gestures (dry-run; nothing mutates) ───────────────────

  void _onPanStart(DragStartDetails _) {
    setState(() {
      _userTouching = true;
      _userDrag = Offset.zero;
      _axis = _DemoAxis.none;
    });
    _ctrl.stop();
  }

  void _onPanUpdate(DragUpdateDetails d) {
    setState(() {
      final next = _userDrag + d.delta;
      if (_axis == _DemoAxis.none &&
          (next.dx.abs() > _axisCommit || next.dy.abs() > _axisCommit)) {
        _axis = next.dx.abs() > next.dy.abs()
            ? _DemoAxis.horizontal
            : _DemoAxis.vertical;
      }
      _userDrag = switch (_axis) {
        _DemoAxis.horizontal => Offset(next.dx, 0),
        _DemoAxis.vertical => Offset(0, next.dy),
        _DemoAxis.none => next,
      };
    });
  }

  void _onPanEnd(DragEndDetails details) {
    // Decide which phase the user's gesture demonstrated, then advance the
    // auto-loop to the NEXT phase so the labels stay synchronised.
    int? landed;
    if (_axis == _DemoAxis.horizontal) {
      if (_userDrag.dx > _distanceThreshold) {
        landed = 1; // right
      } else if (_userDrag.dx < -_distanceThreshold) {
        landed = 0; // left
      }
    } else if (_axis == _DemoAxis.vertical) {
      if (_userDrag.dy.abs() > _distanceThreshold) landed = 2; // up
    }
    setState(() {
      _userTouching = false;
      _userDrag = Offset.zero;
      _axis = _DemoAxis.none;
      if (landed != null) _phase = (landed + 1) % 3;
    });
    _ctrl.forward(from: 0);
  }

  void _onPanCancel() {
    setState(() {
      _userTouching = false;
      _userDrag = Offset.zero;
      _axis = _DemoAxis.none;
    });
    _ctrl.forward(from: 0);
  }

  Future<void> _finish() async {
    await context.read<EngappStore>().markTutorialSeen();
    widget.onDone();
  }

  @override
  Widget build(BuildContext context) {
    final info = _phaseInfo(_phase);
    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'How it works',
                    style: AppFonts.display(
                      size: 22,
                      weight: FontWeight.w700,
                      color: AppColors.ink,
                    ),
                  ),
                  TextButton(
                    onPressed: _finish,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                    ),
                    child: Text(
                      'Skip',
                      style: AppFonts.sans(
                        size: 13,
                        weight: FontWeight.w600,
                        color: AppColors.mute,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 4, 24, 10),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Three quick gestures to learn faster.',
                  style: AppFonts.serif(
                    size: 14,
                    color: AppColors.mute,
                  ),
                ),
              ),
            ),
            Expanded(
              child: LayoutBuilder(
                builder: (ctx, c) {
                  return AnimatedBuilder(
                    animation: _ctrl,
                    builder: (ctx, _) {
                      final target =
                          _targetForPhase(_phase, Size(c.maxWidth, c.maxHeight));
                      final pose = _userTouching
                          ? _Pose(offset: _userDrag, opacity: 1)
                          : _autoPose(_ctrl.value, target);
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 24, vertical: 4),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            Positioned.fill(
                              child: GestureDetector(
                                behavior: HitTestBehavior.opaque,
                                onPanStart: _onPanStart,
                                onPanUpdate: _onPanUpdate,
                                onPanEnd: _onPanEnd,
                                onPanCancel: _onPanCancel,
                                child: const SizedBox.expand(),
                              ),
                            ),
                            Transform.translate(
                              offset: pose.offset,
                              child: Transform.rotate(
                                angle: (pose.offset.dx / 900).clamp(-0.1, 0.1),
                                child: Opacity(
                                  opacity: pose.opacity,
                                  child: _DemoCard(info: info),
                                ),
                              ),
                            ),
                            // Live hint badges so the user sees which gesture
                            // they're committing to mid-drag, just like Feed.
                            if (_userTouching) ..._liveHints(),
                          ],
                        ),
                      );
                    },
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 4, 24, 4),
              child: Column(
                children: [
                  Text(
                    info.title,
                    style: AppFonts.display(
                      size: 22,
                      weight: FontWeight.w700,
                      color: AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    info.subtitle,
                    textAlign: TextAlign.center,
                    style: AppFonts.serif(
                      size: 14,
                      color: AppColors.mute,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                for (var i = 0; i < 3; i++)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      width: _phase == i ? 22 : 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: _phase == i ? AppColors.ink : AppColors.hairline,
                        borderRadius: BorderRadius.circular(AppRadii.pill),
                      ),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 18, 24, 22),
              child: ChunkyButton(
                label: 'Got it',
                icon: Icons.arrow_forward_rounded,
                onTap: _finish,
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _liveHints() {
    return [
      if (_axis == _DemoAxis.horizontal && _userDrag.dx < -24)
        const _HintLabel(
          label: 'KNOWN',
          icon: Icons.check_rounded,
          bg: AppColors.sage,
          alignment: Alignment.centerLeft,
        ),
      if (_axis == _DemoAxis.horizontal && _userDrag.dx > 24)
        const _HintLabel(
          label: 'SAVE',
          icon: Icons.favorite_rounded,
          bg: AppColors.blush,
          alignment: Alignment.centerRight,
        ),
      if (_axis == _DemoAxis.vertical && _userDrag.dy.abs() > 24)
        const _HintLabel(
          label: 'SKIP',
          icon: Icons.skip_next_rounded,
          bg: AppColors.butter,
          alignment: Alignment.topCenter,
        ),
    ];
  }
}

class _Pose {
  final Offset offset;
  final double opacity;
  const _Pose({required this.offset, required this.opacity});
}

_Pose _autoPose(double progress, Offset target) {
  if (progress < 0.5) {
    final t = Curves.easeInCubic.transform(progress / 0.5);
    return _Pose(offset: target * t, opacity: 1 - 0.3 * t);
  } else if (progress < 0.62) {
    return _Pose(offset: target, opacity: 0);
  } else {
    final t = (progress - 0.62) / 0.38;
    return _Pose(offset: Offset.zero, opacity: Curves.easeOut.transform(t));
  }
}

class _DemoCard extends StatelessWidget {
  final ({
    String title,
    String subtitle,
    IconData icon,
    Color color,
    String arrow
  }) info;
  const _DemoCard({required this.info});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      height: 360,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        boxShadow: AppShadows.soft(y: 12, blur: 30, opacity: 0.08),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Soft pastel banner with the demo arrow
          Container(
            height: 170,
            color: info.color.withValues(alpha: 0.7),
            alignment: Alignment.center,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  info.arrow,
                  style: AppFonts.display(
                    size: 64,
                    weight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 4),
                Icon(info.icon, color: AppColors.ink, size: 26),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(18, 16, 18, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'serendipity',
                        style: AppFonts.display(
                          size: 26,
                          weight: FontWeight.w700,
                          color: AppColors.ink,
                          height: 1.05,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Padding(
                        padding: EdgeInsets.only(bottom: 5),
                        child: WavyUnderline(width: 18, height: 5),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '機緣巧合',
                    style: AppFonts.serif(
                      size: 14,
                      color: AppColors.inkSoft,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      Pill('/ˌser.ənˈdɪp.ə.ti/',
                          background: AppColors.cardAlt, color: AppColors.mute),
                      Pill('B2',
                          background: AppColors.paper, color: AppColors.ink),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'A pleasant surprise; the chance discovery of something good.',
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: AppFonts.sans(
                      size: 12,
                      color: AppColors.inkSoft,
                      height: 1.45,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HintLabel extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color bg;
  final Alignment alignment;
  const _HintLabel({
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
          padding: const EdgeInsets.all(28),
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
