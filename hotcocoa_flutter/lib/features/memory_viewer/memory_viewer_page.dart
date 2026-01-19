import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/neural_lattice/neural_lattice_painter.dart';
import '../../shared/widgets/heat_slider/heat_slider.dart';
import '../../shared/services/api_service.dart';
import '../../shared/services/storage_service.dart';
import '../photo_upload/photo_upload_page.dart';

/// Memory viewer states
enum ViewerState { setup, processing, reveal }

/// Provider for current viewer state
final viewerStateProvider = StateProvider<ViewerState>((ref) => ViewerState.setup);

/// Provider for heat level
final heatLevelProvider = StateProvider<int>((ref) => storageService.getHeatLevel());

/// Provider for current photo index
final currentPhotoIndexProvider = StateProvider<int>((ref) => 0);

/// Provider for API response
final intimacyResponseProvider = StateProvider<IntimacyResponse?>((ref) => null);

/// Memory viewer page - core experience
class MemoryViewerPage extends ConsumerStatefulWidget {
  const MemoryViewerPage({super.key});

  @override
  ConsumerState<MemoryViewerPage> createState() => _MemoryViewerPageState();
}

class _MemoryViewerPageState extends ConsumerState<MemoryViewerPage> {
  Timer? _revealTimer;
  int _revealCountdown = 0;

  @override
  void dispose() {
    _revealTimer?.cancel();
    super.dispose();
  }

  Future<void> _startExperience() async {
    final photos = ref.read(selectedPhotosProvider);
    if (photos.isEmpty) return;

    final heatLevel = ref.read(heatLevelProvider);
    final currentIndex = ref.read(currentPhotoIndexProvider);
    final currentPhoto = photos[currentIndex];

    // Save heat level preference
    await storageService.saveHeatLevel(heatLevel);

    // Switch to processing state
    ref.read(viewerStateProvider.notifier).state = ViewerState.processing;

    // Call API
    final response = await apiServiceProvider.processSession(
      imageUrl: currentPhoto,
      heatLevel: heatLevel,
    );

    ref.read(intimacyResponseProvider.notifier).state = response;

    // Switch to reveal state
    ref.read(viewerStateProvider.notifier).state = ViewerState.reveal;

    // Start countdown timer
    _revealCountdown = response.durationSec;
    _revealTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_revealCountdown > 0) {
        setState(() => _revealCountdown--);
      } else {
        timer.cancel();
      }
    });
  }

  void _nextPhoto() {
    final photos = ref.read(selectedPhotosProvider);
    final currentIndex = ref.read(currentPhotoIndexProvider);

    if (currentIndex < photos.length - 1) {
      ref.read(currentPhotoIndexProvider.notifier).state = currentIndex + 1;
      ref.read(viewerStateProvider.notifier).state = ViewerState.setup;
      ref.read(intimacyResponseProvider.notifier).state = null;
      _revealTimer?.cancel();
    }
  }

  void _reset() {
    ref.read(viewerStateProvider.notifier).state = ViewerState.setup;
    ref.read(intimacyResponseProvider.notifier).state = null;
    ref.read(currentPhotoIndexProvider.notifier).state = 0;
    _revealTimer?.cancel();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(viewerStateProvider);
    final photos = ref.watch(selectedPhotosProvider);

    if (photos.isEmpty) {
      return _buildEmptyState();
    }

    return switch (state) {
      ViewerState.setup => _buildSetupState(),
      ViewerState.processing => _buildProcessingState(),
      ViewerState.reveal => _buildRevealState(),
    };
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.photo_library_outlined,
            size: 64,
            color: AppColors.white30,
          ),
          const SizedBox(height: 16),
          Text(
            'Nenhuma foto disponivel',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Voltar para fotos'),
          ),
        ],
      ),
    );
  }

  Widget _buildSetupState() {
    final heatLevel = ref.watch(heatLevelProvider);
    final photos = ref.watch(selectedPhotosProvider);
    final currentIndex = ref.watch(currentPhotoIndexProvider);

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Progress indicator
          Text(
            'FOTO ${currentIndex + 1} DE ${photos.length}',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.white30,
                ),
          ),
          const SizedBox(height: 24),

          // Heat slider
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'INTENSIDADE',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: AppColors.white30,
                      ),
                ),
                const SizedBox(height: 16),
                HeatSlider(
                  value: heatLevel,
                  onChanged: (value) {
                    ref.read(heatLevelProvider.notifier).state = value;
                  },
                ),
                const SizedBox(height: 8),
                Text(
                  '$heatLevel',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                ),
              ],
            ),
          ),

          // Start button
          ElevatedButton.icon(
            onPressed: _startExperience,
            icon: const Icon(Icons.play_arrow),
            label: const Text('INICIAR EXPERIENCIA'),
          ),
        ],
      ),
    );
  }

  Widget _buildProcessingState() {
    return const Center(
      child: NeuralLatticeWidget(
        text: 'PROCESSANDO',
      ),
    );
  }

  Widget _buildRevealState() {
    final response = ref.watch(intimacyResponseProvider);
    if (response == null) return const SizedBox.shrink();

    final photos = ref.watch(selectedPhotosProvider);
    final currentIndex = ref.watch(currentPhotoIndexProvider);
    final hasMorePhotos = currentIndex < photos.length - 1;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Timer
          if (_revealCountdown > 0)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.timer_outlined),
                  const SizedBox(width: 8),
                  Text(
                    '${_revealCountdown ~/ 60}:${(_revealCountdown % 60).toString().padLeft(2, '0')}',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ],
              ),
            ),
          const SizedBox(height: 24),

          // Title
          Text(
            response.instructionTitlePtBr,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),

          // Instruction
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.white10),
            ),
            child: Text(
              response.instructionTextPtBr,
              style: Theme.of(context).textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 16),

          // Rationale
          ExpansionTile(
            title: Text(
              'Por que isso funciona?',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.white50,
                  ),
            ),
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  response.clinicalRationalePtBr,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.white70,
                      ),
                ),
              ),
            ],
          ),

          // Error message if any
          if (response.error != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: Colors.orange, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      response.error!,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.orange,
                          ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 32),

          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _reset,
                  child: const Text('Reiniciar'),
                ),
              ),
              if (hasMorePhotos) ...[
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _nextPhoto,
                    child: const Text('Proxima foto'),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
