import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:hotcocoa_flutter/core/theme/app_theme.dart';
import 'package:hotcocoa_flutter/shared/providers/providers.dart';

/// Dialog para selecionar fotos do Google Drive/Photos
class GooglePhotosPicker extends ConsumerStatefulWidget {
  final Function(List<File>) onPhotosSelected;

  const GooglePhotosPicker({
    required this.onPhotosSelected,
    super.key,
  });

  @override
  ConsumerState<GooglePhotosPicker> createState() => _GooglePhotosPickerState();
}

class _GooglePhotosPickerState extends ConsumerState<GooglePhotosPicker> {
  List<Map<String, dynamic>> _photos = [];
  final Set<int> _selectedIndices = {};
  bool _isLoading = false;
  bool _isDownloading = false;
  String _errorMessage = '';
  int _downloadProgress = 0;
  int _totalDownloads = 0;

  @override
  void initState() {
    super.initState();
    _loadPhotos();
  }

  Future<void> _loadPhotos() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final service = ref.read(googleServiceProvider);

      // Tentar Google Photos primeiro, fallback para Drive
      List<Map<String, dynamic>> photos = [];
      try {
        photos = await service.fetchGooglePhotos(maxResults: 100);
      } catch (e) {
        debugPrint('Google Photos falhou, tentando Drive: $e');
        photos = await service.fetchDrivePhotos(maxResults: 100);
      }

      if (mounted) {
        setState(() {
          _photos = photos;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Erro ao carregar fotos: $e';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _downloadSelectedPhotos() async {
    if (_selectedIndices.isEmpty) return;

    setState(() {
      _isDownloading = true;
      _downloadProgress = 0;
      _totalDownloads = _selectedIndices.length;
      _errorMessage = '';
    });

    final service = ref.read(googleServiceProvider);
    final tempDir = await getTemporaryDirectory();
    final downloadedFiles = <File>[];

    try {
      int completed = 0;
      for (final index in _selectedIndices) {
        final photo = _photos[index];

        try {
          File? file;

          // Verificar se eh Google Photos ou Drive
          if (photo.containsKey('baseUrl')) {
            // Google Photos
            final baseUrl = photo['baseUrl'] as String;
            final fileName =
                photo['filename'] as String? ?? 'photo_$index.jpg';
            final savePath = '${tempDir.path}/$fileName';

            file = await service.downloadGooglePhoto(
              baseUrl: baseUrl,
              fileName: fileName,
              savePath: savePath,
            );
          } else if (photo.containsKey('id')) {
            // Google Drive
            final fileId = photo['id'] as String;
            final fileName = photo['name'] as String? ?? 'photo_$index.jpg';
            final savePath = '${tempDir.path}/$fileName';

            file = await service.downloadDriveFile(
              fileId: fileId,
              fileName: fileName,
              savePath: savePath,
            );
          }

          if (file != null) {
            downloadedFiles.add(file);
          }

          completed++;
          if (mounted) {
            setState(() {
              _downloadProgress = completed;
            });
          }
        } catch (e) {
          debugPrint('Erro ao baixar foto $index: $e');
        }
      }

      if (mounted) {
        Navigator.pop(context);
        widget.onPhotosSelected(downloadedFiles);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Erro ao baixar fotos: $e';
          _isDownloading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: context.surfaceColor,
      child: Container(
        width: 800,
        height: 600,
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeader(),
            const SizedBox(height: 16),
            if (_errorMessage.isNotEmpty) _buildErrorBanner(),
            if (_isLoading) _buildLoadingState(),
            if (!_isLoading && _photos.isEmpty) _buildEmptyState(),
            if (!_isLoading && _photos.isNotEmpty)
              Expanded(child: _buildPhotoGrid()),
            const SizedBox(height: 16),
            if (_isDownloading) _buildDownloadProgress(),
            if (!_isDownloading) _buildActions(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Icon(
          Icons.cloud,
          color: context.primaryColor,
          size: 32,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Google Photos',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              Text(
                _selectedIndices.isEmpty
                    ? 'Selecione fotos para importar'
                    : '${_selectedIndices.length} selecionadas',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.white50,
                    ),
              ),
            ],
          ),
        ),
        IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
      ],
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.red),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: Colors.red),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _errorMessage,
              style: const TextStyle(color: Colors.red),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.red),
            onPressed: _loadPhotos,
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Expanded(
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: context.primaryColor),
            const SizedBox(height: 16),
            Text(
              'Carregando fotos...',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.white50,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Expanded(
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.photo_library_outlined,
              size: 80,
              color: AppColors.white20,
            ),
            const SizedBox(height: 16),
            Text(
              'Nenhuma foto encontrada',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.white50,
                  ),
            ),
            const SizedBox(height: 8),
            TextButton.icon(
              onPressed: _loadPhotos,
              icon: const Icon(Icons.refresh),
              label: const Text('Tentar novamente'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoGrid() {
    return GridView.builder(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: _photos.length,
      itemBuilder: (context, index) {
        final photo = _photos[index];
        final isSelected = _selectedIndices.contains(index);

        // Obter URL da thumbnail
        String? thumbnailUrl;
        if (photo.containsKey('baseUrl')) {
          // Google Photos
          thumbnailUrl = '${photo['baseUrl']}=w300-h300';
        } else if (photo.containsKey('thumbnailLink')) {
          // Google Drive
          thumbnailUrl = photo['thumbnailLink'] as String;
        }

        return GestureDetector(
          onTap: () {
            setState(() {
              if (isSelected) {
                _selectedIndices.remove(index);
              } else {
                _selectedIndices.add(index);
              }
            });
          },
          child: Stack(
            fit: StackFit.expand,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: thumbnailUrl != null
                    ? Image.network(
                        thumbnailUrl,
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
                        loadingBuilder: (context, child, progress) {
                          if (progress == null) return child;
                          return Container(
                            color: AppColors.white10,
                            child: Center(
                              child: CircularProgressIndicator(
                                value: progress.expectedTotalBytes != null
                                    ? progress.cumulativeBytesLoaded /
                                        progress.expectedTotalBytes!
                                    : null,
                              ),
                            ),
                          );
                        },
                      )
                    : Container(
                        color: AppColors.white10,
                        child: const Icon(
                          Icons.photo,
                          color: AppColors.white30,
                        ),
                      ),
              ),
              if (isSelected)
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      color: context.primaryColor.withOpacity(0.5),
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.check_circle,
                        color: AppColors.white,
                        size: 48,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDownloadProgress() {
    return Column(
      children: [
        LinearProgressIndicator(
          value: _totalDownloads > 0 ? _downloadProgress / _totalDownloads : 0,
          backgroundColor: AppColors.white10,
          valueColor: AlwaysStoppedAnimation<Color>(context.primaryColor),
        ),
        const SizedBox(height: 8),
        Text(
          'Baixando $_downloadProgress de $_totalDownloads fotos...',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.white50,
              ),
        ),
      ],
    );
  }

  Widget _buildActions() {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ElevatedButton.icon(
            onPressed:
                _selectedIndices.isEmpty ? null : _downloadSelectedPhotos,
            icon: const Icon(Icons.download),
            label: Text(
              'Importar (${_selectedIndices.length})',
            ),
          ),
        ),
      ],
    );
  }
}
