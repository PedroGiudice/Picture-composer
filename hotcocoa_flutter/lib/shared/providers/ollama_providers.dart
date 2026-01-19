import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/ollama_service.dart';

/// Provider para a instancia do OllamaService
final ollamaServiceProvider = Provider<OllamaService>((ref) {
  return OllamaService();
});

/// Provider para a configuracao do Ollama
final ollamaConfigProvider = StateProvider<OllamaConfig>((ref) {
  return const OllamaConfig();
});

/// Provider para os modelos disponiveis
final ollamaModelsProvider = FutureProvider<List<OllamaModel>>((ref) async {
  final service = ref.watch(ollamaServiceProvider);
  try {
    return await service.listModels();
  } catch (e) {
    print('Erro ao listar modelos: $e');
    return [];
  }
});

/// Provider para verificar disponibilidade do Ollama
final ollamaAvailabilityProvider = FutureProvider<bool>((ref) async {
  final service = ref.watch(ollamaServiceProvider);
  return await service.isAvailable();
});

/// Provider para o historico de chat
final chatHistoryProvider = StateProvider<List<ChatHistoryMessage>>((ref) {
  return [];
});

/// Provider para estado de loading
final chatLoadingProvider = StateProvider<bool>((ref) => false);

/// Provider para estado de streaming
final chatStreamingProvider = StateProvider<bool>((ref) => false);

/// Provider para a mensagem sendo construida pelo streaming
final streamingMessageProvider = StateProvider<String>((ref) => '');
