import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/neural_lattice/neural_lattice_painter.dart';
import '../../shared/services/storage_service.dart';
import '../photo_upload/photo_upload_page.dart';
import 'mosaic_generator.dart';

/// Mosaic generation states
enum MosaicState { idle, generating, complete, error }

/// Provider for mosaic state
final mosaicStateProvider = StateProvider<MosaicState>((ref) => MosaicState.idle);

/// Provider for mosaic progress
final mosaicProgressProvider = StateProvider<double>((ref) => 0.0);

/// Mosaic page - generates a mosaic from photos
class MosaicPage extends ConsumerStatefulWidget {
  const MosaicPage({super.key});

  @override
  ConsumerState<MosaicPage> createState() => _MosaicPageState();
}

class _MosaicPageState extends ConsumerState<MosaicPage> {
  String? _generatedMosaicPath;
  String? _targetImagePath;
  final _generator = MosaicGenerator();

  Future<void> _pickTargetImage() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      allowMultiple: false,
    );

    if (result != null && result.files.single.path != null) {
      setState(() {
        _targetImagePath = result.files.single.path;
      });
    }
  }

  Future<void> _generateMosaic() async {
    final photos = ref.read(selectedPhotosProvider);
    if (photos.isEmpty || _targetImagePath == null) return;

    ref.read(mosaicStateProvider.notifier).state = MosaicState.generating;
    ref.read(mosaicProgressProvider.notifier).state = 0.0;

    try {
      // Extrai os paths das fotos
      final photoPaths = photos.map((photo) => photo.path).toList();

      // Gera o mosaico em isolate separado
      final outputPath = await _generator.generateMosaic(
        targetImagePath: _targetImagePath!,
        sourceImagePaths: photoPaths,
        onProgress: (progress) {
          // Atualiza o progresso na UI
          ref.read(mosaicProgressProvider.notifier).state = progress / 100;
        },
      );

      _generatedMosaicPath = outputPath;
      ref.read(mosaicStateProvider.notifier).state = MosaicState.complete;
    } catch (e) {
      debugPrint('Error generating mosaic: $e');
      ref.read(mosaicStateProvider.notifier).state = MosaicState.error;
    }
  }

  void _reset() {
    setState(() {
      ref.read(mosaicStateProvider.notifier).state = MosaicState.idle;
      ref.read(mosaicProgressProvider.notifier).state = 0.0;
      _generatedMosaicPath = null;
      _targetImagePath = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(mosaicStateProvider);
    final photos = ref.watch(selectedPhotosProvider);

    if (photos.isEmpty) {
      return _buildEmptyState();
    }

    return switch (state) {
      MosaicState.idle => _buildIdleState(photos),
      MosaicState.generating => _buildGeneratingState(),
      MosaicState.complete => _buildCompleteState(),
      MosaicState.error => _buildErrorState(),
    };
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.grid_view_outlined,
            size: 64,
            color: AppColors.white30,
          ),
          const SizedBox(height: 16),
          Text(
            'Nenhuma foto disponivel',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Adicione fotos para criar um mosaico',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.white50,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildIdleState(List<PhotoMetadata> photos) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Text(
            'CRIAR MOSAICO',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.white30,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Transforme suas memorias em arte',
            style: Theme.of(context).textTheme.titleLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),

          // Info card - Source photos
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.white10),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.photo_library,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${photos.length} fotos para tiles',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'Suas fotos serao usadas como tiles de cor do mosaico.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.white50,
                      ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Target image card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: _targetImagePath != null
                    ? Theme.of(context).colorScheme.primary
                    : AppColors.white10,
              ),
            ),
            child: Column(
              children: [
                if (_targetImagePath != null) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.file(
                      File(_targetImagePath!),
                      height: 150,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Imagem alvo selecionada',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                ] else ...[
                  Icon(
                    Icons.image_outlined,
                    size: 48,
                    color: AppColors.white30,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Selecione a imagem alvo',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.white50,
                        ),
                    textAlign: TextAlign.center,
                  ),
                ],
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _pickTargetImage,
                  icon: Icon(_targetImagePath != null
                      ? Icons.change_circle
                      : Icons.add_photo_alternate),
                  label: Text(_targetImagePath != null
                      ? 'Trocar imagem'
                      : 'Escolher imagem'),
                ),
              ],
            ),
          ),

          const Spacer(),

          // Generate button
          ElevatedButton.icon(
            onPressed: _targetImagePath != null ? _generateMosaic : null,
            icon: const Icon(Icons.auto_awesome),
            label: const Text('GERAR MOSAICO'),
          ),
        ],
      ),
    );
  }

  Widget _buildGeneratingState() {
    final progress = ref.watch(mosaicProgressProvider);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const NeuralLatticeWidget(text: 'GERANDO'),
          const SizedBox(height: 32),
          SizedBox(
            width: 200,
            child: Column(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: progress,
                    minHeight: 8,
                    backgroundColor: AppColors.white10,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${(progress * 100).toInt()}%',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.white50,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompleteState() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Text(
            'MOSAICO PRONTO',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.white30,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Sua arte foi criada',
            style: Theme.of(context).textTheme.titleLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),

          // Mosaic preview
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.white10),
              ),
              child: _generatedMosaicPath != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: InteractiveViewer(
                        minScale: 0.5,
                        maxScale: 4.0,
                        child: Image.file(
                          File(_generatedMosaicPath!),
                          fit: BoxFit.contain,
                        ),
                      ),
                    )
                  : Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.grid_view,
                            size: 64,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Mosaico gerado',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ],
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 24),

          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _reset,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Novo'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    if (_generatedMosaicPath != null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Salvo em: $_generatedMosaicPath'),
                          duration: const Duration(seconds: 3),
                        ),
                      );
                    }
                  },
                  icon: const Icon(Icons.check_circle),
                  label: const Text('Salvo'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 64,
            color: Colors.red,
          ),
          const SizedBox(height: 16),
          Text(
            'Erro ao gerar mosaico',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _reset,
            child: const Text('Tentar novamente'),
          ),
        ],
      ),
    );
  }
}
