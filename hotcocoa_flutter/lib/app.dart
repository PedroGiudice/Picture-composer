import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/theme_provider.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

class HotCocoaApp extends ConsumerWidget {
  const HotCocoaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'HotCocoa',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.hotTheme,
      darkTheme: AppTheme.warmTheme,
      themeMode: themeMode == IntimacyMode.hot ? ThemeMode.dark : ThemeMode.dark,
      routerConfig: router,
    );
  }
}
