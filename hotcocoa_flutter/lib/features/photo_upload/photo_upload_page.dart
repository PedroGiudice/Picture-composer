import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';
import '../../shared/services/storage_service.dart';

/// Provider for selected photos
final selectedPhotosProvider = StateProvider<List<String>>((ref) => []);

/// Photo upload page
class PhotoUploadPage extends ConsumerStatefulWidget {
  const PhotoUploadPage({super.key});

  @override
  ConsumerState<PhotoUploadPage> createState() => _PhotoUploadPageState();
}

class _PhotoUploadPageState extends ConsumerState<PhotoUploadPage> {
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadSavedPhotos();
  }

  Future<void> _loadSavedPhotos() async {
    await storageService.init();
    final photos = storageService.getSavedPhotoPaths();
    ref.read(selectedPhotosProvider.notifier).state = photos;
  }

  Future<void> _pickPhotos() async {
    setState(() => _isLoading = true);

    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.image,
        allowMultiple: true,
      );

      if (result != null) {
        for (final file in result.files) {
          if (file.path != null) {
            final savedPath = await storageService.savePhoto(File(file.path!));
            ref.read(selectedPhotosProvider.notifier).update((state) {
              return [...state, savedPath];
            });
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao selecionar fotos: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _deletePhoto(String path) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remover foto?'),
        content: const Text('Esta acao nao pode ser desfeita.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Remover'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await storageService.deletePhoto(path);
      ref.read(selectedPhotosProvider.notifier).update((state) {
        return state.where((p) => p != path).toList();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final photos = ref.watch(selectedPhotosProvider);

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Text(
              'SUAS MEMORIAS',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppColors.white30,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Selecione fotos especiais',
              style: Theme.of(context).textTheme.titleLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),

            // Photo grid or empty state
            Expanded(
              child: photos.isEmpty
                  ? _buildEmptyState()
                  : _buildPhotoGrid(photos),
            ),

            const SizedBox(height: 24),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _isLoading ? null : _pickPhotos,
                    icon: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.add_photo_alternate),
                    label: const Text('Adicionar'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: photos.isEmpty
                        ? null
                        : () => context.go(AppRoutes.viewer),
                    icon: const Icon(Icons.play_arrow),
                    label: const Text('Iniciar'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.photo_library_outlined,
            size: 80,
            color: AppColors.white20,
          ),
          const SizedBox(height: 24),
          Text(
            'Nenhuma foto selecionada',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: AppColors.white50,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Adicione fotos especiais para comecar',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.white30,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoGrid(List<String> photos) {
    return GridView.builder(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: photos.length,
      itemBuilder: (context, index) {
        final path = photos[index];
        return _PhotoTile(
          path: path,
          onDelete: () => _deletePhoto(path),
        );
      },
    );
  }
}

class _PhotoTile extends StatelessWidget {
  final String path;
  final VoidCallback onDelete;

  const _PhotoTile({
    required this.path,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.file(
            File(path),
            fit: BoxFit.cover,
            errorBuilder: (context, error, stack) {
              return Container(
                color: AppColors.white10,
                child: const Icon(
                  Icons.broken_image,
                  color: AppColors.white30,
                ),
              );
            },
          ),
        ),
        Positioned(
          top: 4,
          right: 4,
          child: IconButton(
            icon: const Icon(Icons.close, size: 20),
            style: IconButton.styleFrom(
              backgroundColor: Colors.black54,
              padding: const EdgeInsets.all(4),
            ),
            onPressed: onDelete,
          ),
        ),
      ],
    );
  }
}
