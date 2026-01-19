import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/neural_lattice/neural_lattice_painter.dart';
import '../photo_upload/photo_upload_page.dart';

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

  Future<void> _generateMosaic() async {
    final photos = ref.read(selectedPhotosProvider);
    if (photos.isEmpty) return;

    ref.read(mosaicStateProvider.notifier).state = MosaicState.generating;
    ref.read(mosaicProgressProvider.notifier).state = 0.0;

    try {
      // Simulate mosaic generation with progress
      // TODO: Implement actual mosaic generation using Isolate
      for (int i = 0; i <= 100; i += 5) {
        await Future.delayed(const Duration(milliseconds: 100));
        ref.read(mosaicProgressProvider.notifier).state = i / 100;
      }

      // For now, just use the first photo as placeholder
      _generatedMosaicPath = photos.first;
      ref.read(mosaicStateProvider.notifier).state = MosaicState.complete;
    } catch (e) {
      ref.read(mosaicStateProvider.notifier).state = MosaicState.error;
    }
  }

  void _reset() {
    ref.read(mosaicStateProvider.notifier).state = MosaicState.idle;
    ref.read(mosaicProgressProvider.notifier).state = 0.0;
    _generatedMosaicPath = null;
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

  Widget _buildIdleState(List<String> photos) {
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

          // Info card
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
                      '${photos.length} fotos selecionadas',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'O mosaico sera gerado usando suas fotos como tiles de cor.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.white50,
                      ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),

          const Spacer(),

          // Generate button
          ElevatedButton.icon(
            onPressed: _generateMosaic,
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

          // Mosaic preview (placeholder)
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.white10),
              ),
              child: Center(
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
                    const SizedBox(height: 8),
                    Text(
                      'Implementacao completa em breve',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.white50,
                          ),
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
                    // TODO: Implement save functionality
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Salvo! (simulado)')),
                    );
                  },
                  icon: const Icon(Icons.save),
                  label: const Text('Salvar'),
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
