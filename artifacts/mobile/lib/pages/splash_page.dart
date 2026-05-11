// 1. Splash / Boot

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../store/engapp_store.dart';
import '../theme/theme.dart';
import '../widgets/primitives.dart';

class SplashPage extends StatefulWidget {
  final VoidCallback onReady;
  const SplashPage({super.key, required this.onReady});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  bool _errored = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _boot());
  }

  Future<void> _boot() async {
    final store = context.read<EngappStore>();
    try {
      if (!store.ready) await store.boot();
      await Future<void>.delayed(const Duration(milliseconds: 900));
      if (mounted) widget.onReady();
    } catch (_) {
      if (mounted) setState(() => _errored = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.page,
      child: SafeArea(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  borderRadius: BorderRadius.circular(AppRadii.xl),
                  boxShadow: AppShadows.soft(y: 8, blur: 18, opacity: 0.1),
                ),
                child: Center(
                  child: Text(
                    'e',
                    style: AppFonts.display(
                      size: 56,
                      weight: FontWeight.w700,
                      color: AppColors.ink,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'EngApp',
                style: AppFonts.display(
                  size: 30,
                  weight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '單字．每天一點點',
                style: AppFonts.serif(
                  size: 14,
                  color: AppColors.mute,
                ),
              ),
              const SizedBox(height: 28),
              if (_errored)
                ChunkyButton(
                  label: 'Retry',
                  icon: Icons.refresh_rounded,
                  fullWidth: false,
                  onTap: () {
                    setState(() => _errored = false);
                    _boot();
                  },
                )
              else
                SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.2,
                    valueColor: AlwaysStoppedAnimation(AppColors.ink),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
