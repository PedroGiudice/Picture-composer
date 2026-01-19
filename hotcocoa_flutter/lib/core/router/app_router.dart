import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/memory_viewer/memory_viewer_page.dart';
import '../../features/photo_upload/photo_upload_page.dart';
import '../../features/mosaic/mosaic_page.dart';
import '../../shared/widgets/app_shell.dart';

/// Route paths
abstract class AppRoutes {
  static const home = '/';
  static const upload = '/upload';
  static const viewer = '/viewer';
  static const mosaic = '/mosaic';
  static const config = '/config';
}

/// Router provider
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.home,
    debugLogDiagnostics: true,
    routes: [
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            name: 'home',
            pageBuilder: (context, state) => _buildPage(
              key: state.pageKey,
              child: const PhotoUploadPage(),
            ),
          ),
          GoRoute(
            path: AppRoutes.upload,
            name: 'upload',
            pageBuilder: (context, state) => _buildPage(
              key: state.pageKey,
              child: const PhotoUploadPage(),
            ),
          ),
          GoRoute(
            path: AppRoutes.viewer,
            name: 'viewer',
            pageBuilder: (context, state) => _buildPage(
              key: state.pageKey,
              child: const MemoryViewerPage(),
            ),
          ),
          GoRoute(
            path: AppRoutes.mosaic,
            name: 'mosaic',
            pageBuilder: (context, state) => _buildPage(
              key: state.pageKey,
              child: const MosaicPage(),
            ),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Pagina nao encontrada',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              state.uri.toString(),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go(AppRoutes.home),
              child: const Text('Voltar ao inicio'),
            ),
          ],
        ),
      ),
    ),
  );
});

/// Custom page builder with fade transition
CustomTransitionPage<void> _buildPage({
  required LocalKey key,
  required Widget child,
}) {
  return CustomTransitionPage<void>(
    key: key,
    child: child,
    transitionDuration: const Duration(milliseconds: 300),
    reverseTransitionDuration: const Duration(milliseconds: 200),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(
        opacity: CurveTween(curve: Curves.easeInOut).animate(animation),
        child: child,
      );
    },
  );
}
