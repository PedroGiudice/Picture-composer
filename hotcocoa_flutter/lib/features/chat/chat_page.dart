import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/providers/ollama_providers.dart';
import '../../shared/services/ollama_service.dart';

/// Chat message model para UI
class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final bool isStreaming;

  const ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.isStreaming = false,
  });

  ChatMessage copyWith({
    String? text,
    bool? isUser,
    DateTime? timestamp,
    bool? isStreaming,
  }) {
    return ChatMessage(
      text: text ?? this.text,
      isUser: isUser ?? this.isUser,
      timestamp: timestamp ?? this.timestamp,
      isStreaming: isStreaming ?? this.isStreaming,
    );
  }
}

/// Provider para mensagens do chat
final chatMessagesProvider = StateProvider<List<ChatMessage>>((ref) => []);

/// Chat page - Integracao com Ollama local
class ChatPage extends ConsumerStatefulWidget {
  const ChatPage({super.key});

  @override
  ConsumerState<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends ConsumerState<ChatPage> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeService();
  }

  Future<void> _initializeService() async {
    final service = ref.read(ollamaServiceProvider);
    await service.init();

    // Carregar historico salvo
    final history = service.getHistory();
    if (history.isNotEmpty) {
      final messages = history.map((msg) {
        return ChatMessage(
          text: msg.content,
          isUser: msg.role == 'user',
          timestamp: msg.timestamp,
        );
      }).toList();

      ref.read(chatMessagesProvider.notifier).state = messages;
    }

    // Carregar configuracao salva
    final config = service.getConfig();
    ref.read(ollamaConfigProvider.notifier).state = config;

    setState(() {
      _isInitialized = true;
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    _controller.clear();

    // Verificar disponibilidade do Ollama
    final service = ref.read(ollamaServiceProvider);
    final isAvailable = await service.isAvailable();

    if (!isAvailable) {
      _showErrorDialog(
        'Ollama Nao Disponivel',
        'O Ollama nao esta rodando. Inicie o servico com:\n\nollama serve',
      );
      return;
    }

    // Adicionar mensagem do usuario
    ref.read(chatMessagesProvider.notifier).update((state) => [
          ...state,
          ChatMessage(
            text: text,
            isUser: true,
            timestamp: DateTime.now(),
          ),
        ]);

    _scrollToBottom();

    // Iniciar streaming
    ref.read(chatStreamingProvider.notifier).state = true;

    // Adicionar placeholder para mensagem do assistente
    ref.read(chatMessagesProvider.notifier).update((state) => [
          ...state,
          ChatMessage(
            text: '',
            isUser: false,
            timestamp: DateTime.now(),
            isStreaming: true,
          ),
        ]);

    try {
      final stream = service.generateStream(prompt: text, includeHistory: true);
      final buffer = StringBuffer();

      await for (final token in stream) {
        buffer.write(token);

        // Atualizar a ultima mensagem com o texto acumulado
        ref.read(chatMessagesProvider.notifier).update((state) {
          final messages = List<ChatMessage>.from(state);
          if (messages.isNotEmpty && !messages.last.isUser) {
            messages[messages.length - 1] = messages.last.copyWith(
              text: buffer.toString(),
            );
          }
          return messages;
        });

        _scrollToBottom();
      }

      // Finalizar streaming
      ref.read(chatMessagesProvider.notifier).update((state) {
        final messages = List<ChatMessage>.from(state);
        if (messages.isNotEmpty && !messages.last.isUser) {
          messages[messages.length - 1] = messages.last.copyWith(
            isStreaming: false,
          );
        }
        return messages;
      });
    } catch (e) {
      // Remover mensagem placeholder em caso de erro
      ref.read(chatMessagesProvider.notifier).update((state) {
        final messages = List<ChatMessage>.from(state);
        if (messages.isNotEmpty && !messages.last.isUser) {
          messages.removeLast();
        }
        return messages;
      });

      _showErrorDialog(
        'Erro ao Gerar Resposta',
        'Ocorreu um erro ao comunicar com o Ollama:\n\n$e',
      );
    } finally {
      ref.read(chatStreamingProvider.notifier).state = false;
    }
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Theme.of(context).colorScheme.surface,
        title: Text(
          title,
          style: const TextStyle(color: AppColors.white),
        ),
        content: Text(
          message,
          style: const TextStyle(color: AppColors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'OK',
              style: TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _clearHistory() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Theme.of(context).colorScheme.surface,
        title: const Text(
          'Limpar Historico',
          style: TextStyle(color: AppColors.white),
        ),
        content: const Text(
          'Deseja realmente limpar todo o historico de conversas?',
          style: TextStyle(color: AppColors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              'Limpar',
              style: TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final service = ref.read(ollamaServiceProvider);
      await service.clearHistory();
      ref.read(chatMessagesProvider.notifier).state = [];
    }
  }

  void _showSettings() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).colorScheme.surface,
      builder: (context) => _SettingsSheet(
        onConfigChanged: (config) async {
          ref.read(ollamaConfigProvider.notifier).state = config;
          final service = ref.read(ollamaServiceProvider);
          await service.saveConfig(config);
        },
      ),
    );
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    final messages = ref.watch(chatMessagesProvider);
    final isStreaming = ref.watch(chatStreamingProvider);
    final ollamaAvailable = ref.watch(ollamaAvailabilityProvider);

    return Column(
      children: [
        // Header com status e acoes
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            border: Border(
              bottom: BorderSide(color: AppColors.white10),
            ),
          ),
          child: Row(
            children: [
              // Status do Ollama
              ollamaAvailable.when(
                data: (available) => Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: available ? Colors.green : Colors.red,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      available ? 'Ollama Online' : 'Ollama Offline',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.white50,
                          ),
                    ),
                  ],
                ),
                loading: () => const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                error: (_, __) => const Icon(
                  Icons.error_outline,
                  size: 16,
                  color: Colors.red,
                ),
              ),
              const Spacer(),
              // Botao de configuracoes
              IconButton(
                icon: const Icon(Icons.settings, size: 20),
                onPressed: _showSettings,
                color: AppColors.white50,
              ),
              // Botao de limpar historico
              IconButton(
                icon: const Icon(Icons.delete_outline, size: 20),
                onPressed: messages.isEmpty ? null : _clearHistory,
                color: messages.isEmpty ? AppColors.white20 : AppColors.white50,
              ),
            ],
          ),
        ),

        // Lista de mensagens
        Expanded(
          child: messages.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    return _MessageBubble(message: messages[index]);
                  },
                ),
        ),

        // Area de input
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            border: Border(
              top: BorderSide(color: AppColors.white10),
            ),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  decoration: InputDecoration(
                    hintText: 'Digite sua mensagem...',
                    hintStyle: TextStyle(color: AppColors.white30),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide(color: AppColors.white20),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide(color: AppColors.white20),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                  ),
                  style: const TextStyle(color: AppColors.white),
                  onSubmitted: (_) => _sendMessage(),
                  enabled: !isStreaming,
                ),
              ),
              const SizedBox(width: 12),
              IconButton(
                onPressed: isStreaming ? null : _sendMessage,
                icon: Icon(
                  Icons.send,
                  color: isStreaming
                      ? AppColors.white30
                      : Theme.of(context).colorScheme.primary,
                ),
                style: IconButton.styleFrom(
                  backgroundColor: isStreaming
                      ? AppColors.white10
                      : Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  padding: const EdgeInsets.all(12),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.chat_bubble_outline,
            size: 64,
            color: AppColors.white20,
          ),
          const SizedBox(height: 16),
          Text(
            'Inicie uma conversa com Ollama',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: AppColors.white50,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Digite uma mensagem para comecar',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.white30,
                ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final ChatMessage message;

  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.7,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isUser
                  ? Theme.of(context).colorScheme.primary
                  : Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(16),
                topRight: const Radius.circular(16),
                bottomLeft: Radius.circular(isUser ? 16 : 4),
                bottomRight: Radius.circular(isUser ? 4 : 16),
              ),
              border:
                  isUser ? null : Border.all(color: AppColors.white10),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  child: Text(
                    message.text.isEmpty ? '...' : message.text,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: isUser ? AppColors.white : AppColors.white70,
                        ),
                  ),
                ),
                if (message.isStreaming) ...[
                  const SizedBox(width: 8),
                  SizedBox(
                    width: 12,
                    height: 12,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingsSheet extends ConsumerStatefulWidget {
  final Function(OllamaConfig) onConfigChanged;

  const _SettingsSheet({required this.onConfigChanged});

  @override
  ConsumerState<_SettingsSheet> createState() => _SettingsSheetState();
}

class _SettingsSheetState extends ConsumerState<_SettingsSheet> {
  @override
  Widget build(BuildContext context) {
    final config = ref.watch(ollamaConfigProvider);
    final modelsAsync = ref.watch(ollamaModelsProvider);

    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Configuracoes do Ollama',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.white,
                ),
          ),
          const SizedBox(height: 24),

          // Selecao de modelo
          Text(
            'Modelo',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.white70,
                ),
          ),
          const SizedBox(height: 8),
          modelsAsync.when(
            data: (models) {
              if (models.isEmpty) {
                return Text(
                  'Nenhum modelo encontrado. Verifique se o Ollama esta rodando.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.white30,
                      ),
                );
              }

              return DropdownButton<String>(
                value: models.any((m) => m.name == config.model)
                    ? config.model
                    : models.first.name,
                isExpanded: true,
                dropdownColor: Theme.of(context).colorScheme.surface,
                style: const TextStyle(color: AppColors.white),
                items: models.map((model) {
                  return DropdownMenuItem(
                    value: model.name,
                    child: Text(model.displayName),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    widget.onConfigChanged(config.copyWith(model: value));
                  }
                },
              );
            },
            loading: () => const CircularProgressIndicator(),
            error: (e, _) => Text(
              'Erro ao carregar modelos: $e',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.red,
                  ),
            ),
          ),
          const SizedBox(height: 24),

          // Temperatura
          Text(
            'Temperatura: ${config.temperature.toStringAsFixed(1)}',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.white70,
                ),
          ),
          Slider(
            value: config.temperature,
            min: 0.0,
            max: 2.0,
            divisions: 20,
            onChanged: (value) {
              widget.onConfigChanged(config.copyWith(temperature: value));
            },
          ),
          const SizedBox(height: 16),

          // Max Tokens
          Text(
            'Tokens Maximos: ${config.maxTokens}',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.white70,
                ),
          ),
          Slider(
            value: config.maxTokens.toDouble(),
            min: 256,
            max: 4096,
            divisions: 15,
            onChanged: (value) {
              widget.onConfigChanged(config.copyWith(maxTokens: value.toInt()));
            },
          ),
        ],
      ),
    );
  }
}
