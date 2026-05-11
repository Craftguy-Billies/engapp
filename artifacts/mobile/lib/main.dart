import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'api/api_client.dart';
import 'app.dart';
import 'store/engapp_store.dart';
import 'theme/theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Allow google_fonts to fetch fonts in environments where it can't bundle them.
  GoogleFonts.config.allowRuntimeFetching = true;
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));
  final api = await EngappApi.create();
  runApp(EngappRoot(api: api));
}

class EngappRoot extends StatelessWidget {
  final EngappApi api;
  const EngappRoot({super.key, required this.api});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => EngappStore(api: api),
      child: MaterialApp(
        title: 'EngApp',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          scaffoldBackgroundColor: AppColors.page,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.ink,
            primary: AppColors.ink,
            secondary: AppColors.accent,
            surface: AppColors.card,
          ),
          textTheme: GoogleFonts.interTextTheme(),
          splashColor: AppColors.accent.withValues(alpha: 0.15),
          highlightColor: AppColors.accent.withValues(alpha: 0.1),
        ),
        home: const Scaffold(body: AppShell()),
      ),
    );
  }
}
