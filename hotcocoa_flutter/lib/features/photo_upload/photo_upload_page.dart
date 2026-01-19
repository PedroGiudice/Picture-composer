import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:go_router/go_router.dart';
import 'package:desktop_drop/desktop_drop.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';
import 'package:hotcocoa_flutter/core/theme/app_theme.dart';
import 'package:hotcocoa_flutter/core/router/app_router.dart';
import 'package:hotcocoa_flutter/shared/services/storage_service.dart';

/// Provider para fotos selecionadas
final selectedPhotosProvider =
    StateProvider<List<PhotoMetadata>>((ref) => []);

/// Provider para fotos marcadas no grid (para selecao multipla)
final selectedIndicesProvider = StateProvider<Set<int>>((ref) => {});

/// Provider para modo de selecao
final isSelectionModeProvider = StateProvider<bool>((ref) => false);

/// Photo upload page
class PhotoUploadPage extends ConsumerStatefulWidget {
  const PhotoUploadPage({super.key});

  @override
  ConsumerState<PhotoUploadPage> createState() => _PhotoUploadPageState();
}

class _PhotoUploadPageState extends ConsumerState<PhotoUploadPage> {
  bool _isLoading = false;
  bool _isDragging = false;
  double _uploadProgress = 0.0;
  int _totalFiles = 0;
  int _processedFiles = 0;

  @override
  void initState() {
    super.initState();
    _loadSavedPhotos();
  }

  Future<void> _loadSavedPhotos() async {
    await storageService.init();
    final photosMetadata = storageService.getAllPhotosWithMetadata();

    // Se nao houver metadados no cache, carregar dos paths
    if (photosMetadata.isEmpty) {
      final paths = storageService.getSavedPhotoPaths();
      for (final path in paths) {
        // Gerar metadados basicos para fotos existentes
        try {
          final file = File(path);
          if (await file.exists()) {
            await storageService.savePhoto(file);
          }
        } catch (e) {
          print('Erro ao processar foto $path: $e');
        }
      }
      final updatedMetadata = storageService.getAllPhotosWithMetadata();
      ref.read(selectedPhotosProvider.notifier).state = updatedMetadata;
    } else {
      ref.read(selectedPhotosProvider.notifier).state = photosMetadata;
    }
  }

  Future<void> _pickPhotos() async {
    setState(() {
      _isLoading = true;
      _processedFiles = 0;
    });

    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.image,
        allowMultiple: true,
      );

      if (result != null) {
        _totalFiles = result.files.length;

        for (int i = 0; i < result.files.length; i++) {
          final file = result.files[i];
          if (file.path != null) {
            final metadata = await storageService.savePhoto(File(file.path!));
            ref.read(selectedPhotosProvider.notifier).update((state) {
              return [...state, metadata];
            });

            setState(() {
              _processedFiles = i + 1;
              _uploadProgress = (_processedFiles / _totalFiles);
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
        setState(() {
          _isLoading = false;
          _uploadProgress = 0.0;
          _totalFiles = 0;
          _processedFiles = 0;
        });
      }
    }
  }

  Future<void> _handleDroppedFiles(List<String> paths) async {
    setState(() {
      _isLoading = true;
      _processedFiles = 0;
    });

    try {
      _totalFiles = paths.length;

      for (int i = 0; i < paths.length; i++) {
        final path = paths[i];
        final file = File(path);

        if (await file.exists()) {
          // Verificar se eh uma imagem
          final extension = path.split('.').last.toLowerCase();
          if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].contains(extension)) {
            final metadata = await storageService.savePhoto(file);
            ref.read(selectedPhotosProvider.notifier).update((state) {
              return [...state, metadata];
            });
          }
        }

        setState(() {
          _processedFiles = i + 1;
          _uploadProgress = (_processedFiles / _totalFiles);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao processar arquivos: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isDragging = false;
          _uploadProgress = 0.0;
          _totalFiles = 0;
          _processedFiles = 0;
        });
      }
    }
  }

  Future<void> _deletePhoto(PhotoMetadata metadata) async {
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
      await storageService.deletePhoto(metadata.path);
      ref.read(selectedPhotosProvider.notifier).update((state) {
        return state.where((p) => p.path != metadata.path).toList();
      });
    }
  }

  Future<void> _deleteSelectedPhotos() async {
    final selectedIndices = ref.read(selectedIndicesProvider);
    final photos = ref.read(selectedPhotosProvider);

    if (selectedIndices.isEmpty) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Remover ${selectedIndices.length} fotos?'),
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
      final photosToDelete = selectedIndices
          .map((index) => photos[index])
          .toList();

      for (final metadata in photosToDelete) {
        await storageService.deletePhoto(metadata.path);
      }

      ref.read(selectedPhotosProvider.notifier).update((state) {
        return state.where((p) => !photosToDelete.contains(p)).toList();
      });

      // Limpar selecao
      ref.read(selectedIndicesProvider.notifier).state = {};
      ref.read(isSelectionModeProvider.notifier).state = false;
    }
  }

  void _showFullScreenPreview(int initialIndex) {
    final photos = ref.read(selectedPhotosProvider);

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => _FullScreenGallery(
          photos: photos,
          initialIndex: initialIndex,
          onDelete: (metadata) async {
            await _deletePhoto(metadata);
            Navigator.pop(context);
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final photos = ref.watch(selectedPhotosProvider);
    final isSelectionMode = ref.watch(isSelectionModeProvider);
    final selectedIndices = ref.watch(selectedIndicesProvider);

    return Scaffold(
      body: DropTarget(
        onDragEntered: (details) {
          setState(() => _isDragging = true);
        },
        onDragExited: (details) {
          setState(() => _isDragging = false);
        },
        onDragDone: (details) async {
          final paths = details.files.map((file) => file.path).toList();
          await _handleDroppedFiles(paths);
        },
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header
                  _buildHeader(photos, isSelectionMode, selectedIndices),
                  const SizedBox(height: 32),

                  // Photo grid ou empty state
                  Expanded(
                    child: photos.isEmpty
                        ? _buildEmptyState()
                        : _buildPhotoGrid(photos, isSelectionMode, selectedIndices),
                  ),

                  const SizedBox(height: 24),

                  // Progress indicator
                  if (_isLoading) _buildProgressIndicator(),

                  // Action buttons
                  if (!isSelectionMode) _buildActionButtons(photos),
                  if (isSelectionMode) _buildSelectionButtons(selectedIndices),
                ],
              ),
            ),

            // Drag overlay
            if (_isDragging)
              Container(
                color: context.primaryColor.withOpacity(0.1),
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: context.surfaceColor,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: context.primaryColor,
                        width: 2,
                      ),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.cloud_upload,
                          size: 64,
                          color: context.primaryColor,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Solte as fotos aqui',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(List<PhotoMetadata> photos, bool isSelectionMode, Set<int> selectedIndices) {
    return Column(
      children: [
        Text(
          isSelectionMode
              ? '${selectedIndices.length} SELECIONADAS'
              : 'SUAS MEMORIAS',
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: AppColors.white30,
              ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          isSelectionMode
              ? 'Modo de selecao'
              : 'Selecione fotos especiais',
          style: Theme.of(context).textTheme.titleLarge,
          textAlign: TextAlign.center,
        ),
        if (photos.isNotEmpty && !isSelectionMode)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: TextButton.icon(
              onPressed: () {
                ref.read(isSelectionModeProvider.notifier).state = true;
              },
              icon: const Icon(Icons.checklist, size: 16),
              label: const Text('Selecionar'),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.white50,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildProgressIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        children: [
          LinearProgressIndicator(
            value: _uploadProgress,
            backgroundColor: AppColors.white10,
            valueColor: AlwaysStoppedAnimation<Color>(context.primaryColor),
          ),
          const SizedBox(height: 8),
          Text(
            'Processando $_processedFiles de $_totalFiles fotos...',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.white50,
                ),
          ),
        ],
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
            'Adicione fotos ou arraste-as para ca',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.white30,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoGrid(List<PhotoMetadata> photos, bool isSelectionMode, Set<int> selectedIndices) {
    return GridView.builder(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: photos.length,
      itemBuilder: (context, index) {
        final metadata = photos[index];
        final isSelected = selectedIndices.contains(index);

        return _PhotoTile(
          metadata: metadata,
          isSelectionMode: isSelectionMode,
          isSelected: isSelected,
          onTap: () {
            if (isSelectionMode) {
              ref.read(selectedIndicesProvider.notifier).update((state) {
                final newState = {...state};
                if (isSelected) {
                  newState.remove(index);
                } else {
                  newState.add(index);
                }
                return newState;
              });
            } else {
              _showFullScreenPreview(index);
            }
          },
          onLongPress: () {
            if (!isSelectionMode) {
              ref.read(isSelectionModeProvider.notifier).state = true;
              ref.read(selectedIndicesProvider.notifier).update((state) {
                return {...state, index};
              });
            }
          },
          onDelete: () => _deletePhoto(metadata),
        );
      },
    );
  }

  Widget _buildActionButtons(List<PhotoMetadata> photos) {
    return Row(
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
    );
  }

  Widget _buildSelectionButtons(Set<int> selectedIndices) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              ref.read(isSelectionModeProvider.notifier).state = false;
              ref.read(selectedIndicesProvider.notifier).state = {};
            },
            icon: const Icon(Icons.close),
            label: const Text('Cancelar'),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ElevatedButton.icon(
            onPressed: selectedIndices.isEmpty ? null : _deleteSelectedPhotos,
            icon: const Icon(Icons.delete),
            label: Text('Remover (${selectedIndices.length})'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
          ),
        ),
      ],
    );
  }
}

class _PhotoTile extends StatelessWidget {
  final PhotoMetadata metadata;
  final bool isSelectionMode;
  final bool isSelected;
  final VoidCallback onTap;
  final VoidCallback onLongPress;
  final VoidCallback onDelete;

  const _PhotoTile({
    required this.metadata,
    required this.isSelectionMode,
    required this.isSelected,
    required this.onTap,
    required this.onLongPress,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      onLongPress: onLongPress,
      child: Stack(
        fit: StackFit.expand,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.file(
              File(metadata.thumbnailPath ?? metadata.path),
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

          // Selection overlay
          if (isSelectionMode)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: isSelected
                      ? context.primaryColor.withOpacity(0.5)
                      : Colors.black26,
                ),
                child: isSelected
                    ? Center(
                        child: Icon(
                          Icons.check_circle,
                          color: AppColors.white,
                          size: 48,
                        ),
                      )
                    : null,
              ),
            ),

          // Delete button (only when not in selection mode)
          if (!isSelectionMode)
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
      ),
    );
  }
}

/// Full screen gallery viewer
class _FullScreenGallery extends StatefulWidget {
  final List<PhotoMetadata> photos;
  final int initialIndex;
  final Function(PhotoMetadata) onDelete;

  const _FullScreenGallery({
    required this.photos,
    required this.initialIndex,
    required this.onDelete,
  });

  @override
  State<_FullScreenGallery> createState() => _FullScreenGalleryState();
}

class _FullScreenGalleryState extends State<_FullScreenGallery> {
  late PageController _pageController;
  late int _currentIndex;
  bool _showInfo = false;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentPhoto = widget.photos[_currentIndex];

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Gallery
          PhotoViewGallery.builder(
            scrollPhysics: const BouncingScrollPhysics(),
            builder: (BuildContext context, int index) {
              return PhotoViewGalleryPageOptions(
                imageProvider: FileImage(File(widget.photos[index].path)),
                initialScale: PhotoViewComputedScale.contained,
                minScale: PhotoViewComputedScale.contained,
                maxScale: PhotoViewComputedScale.covered * 3.0,
                heroAttributes: PhotoViewHeroAttributes(tag: widget.photos[index].path),
              );
            },
            itemCount: widget.photos.length,
            loadingBuilder: (context, event) => Center(
              child: CircularProgressIndicator(
                value: event == null
                    ? 0
                    : event.cumulativeBytesLoaded / (event.expectedTotalBytes ?? 1),
              ),
            ),
            pageController: _pageController,
            onPageChanged: (index) {
              setState(() => _currentIndex = index);
            },
          ),

          // Top bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 8,
                left: 16,
                right: 16,
                bottom: 16,
              ),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black87,
                    Colors.transparent,
                  ],
                ),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                    color: Colors.white,
                  ),
                  Expanded(
                    child: Text(
                      '${_currentIndex + 1} / ${widget.photos.length}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: Icon(_showInfo ? Icons.info : Icons.info_outline),
                    onPressed: () {
                      setState(() => _showInfo = !_showInfo);
                    },
                    color: Colors.white,
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete),
                    onPressed: () {
                      widget.onDelete(currentPhoto);
                    },
                    color: Colors.red,
                  ),
                ],
              ),
            ),
          ),

          // Info panel
          if (_showInfo)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      Colors.black87,
                      Colors.transparent,
                    ],
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (currentPhoto.dateTaken != null)
                      _buildInfoRow(
                        Icons.calendar_today,
                        '${currentPhoto.dateTaken!.day}/${currentPhoto.dateTaken!.month}/${currentPhoto.dateTaken!.year}',
                      ),
                    if (currentPhoto.camera != null)
                      _buildInfoRow(Icons.camera_alt, currentPhoto.camera!),
                    if (currentPhoto.width != null && currentPhoto.height != null)
                      _buildInfoRow(
                        Icons.aspect_ratio,
                        '${currentPhoto.width} x ${currentPhoto.height}',
                      ),
                    _buildInfoRow(
                      Icons.storage,
                      '${(currentPhoto.fileSize / 1024 / 1024).toStringAsFixed(2)} MB',
                    ),
                    if (currentPhoto.location != null)
                      _buildInfoRow(Icons.location_on, currentPhoto.location!),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, color: Colors.white70, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
