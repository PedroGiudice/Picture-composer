import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';
import 'motion_background/motion_background.dart';

/// Main app shell with navigation
class AppShell extends ConsumerWidget {
  final Widget child;

  const AppShell({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('HOTCOCOA'),
        centerTitle: true,
        actions: [
          // Theme toggle
          IconButton(
            icon: Icon(
              themeMode == IntimacyMode.hot
                  ? Icons.local_fire_department
                  : Icons.favorite,
            ),
            tooltip: themeMode == IntimacyMode.hot ? 'Modo HOT' : 'Modo WARM',
            onPressed: () {
              ref.read(themeModeProvider.notifier).toggle();
            },
          ),
          // Navigation menu
          PopupMenuButton<String>(
            icon: const Icon(Icons.menu),
            onSelected: (route) => context.go(route),
            itemBuilder: (context) => [
              _buildMenuItem(
                context,
                icon: Icons.photo_library,
                title: 'Fotos',
                route: AppRoutes.upload,
              ),
              _buildMenuItem(
                context,
                icon: Icons.visibility,
                title: 'Experiencia',
                route: AppRoutes.viewer,
              ),
              _buildMenuItem(
                context,
                icon: Icons.grid_view,
                title: 'Mosaico',
                route: AppRoutes.mosaic,
              ),
              const PopupMenuDivider(),
              _buildMenuItem(
                context,
                icon: Icons.settings,
                title: 'Configuracoes',
                route: AppRoutes.config,
              ),
            ],
          ),
        ],
      ),
      body: MotionBackground(
        particleCount: 25,
        particleSpeed: 0.2,
        minRadius: 1.5,
        maxRadius: 3.5,
        minOpacity: 0.03,
        maxOpacity: 0.12,
        child: child,
      ),
    );
  }

  PopupMenuItem<String> _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String route,
  }) {
    return PopupMenuItem<String>(
      value: route,
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.white70),
          const SizedBox(width: 12),
          Text(title),
        ],
      ),
    );
  }
}
