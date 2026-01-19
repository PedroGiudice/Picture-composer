import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Modelo Ollama disponivel
class OllamaModel {
  final String name;
  final String displayName;
  final int size;

  const OllamaModel({
    required this.name,
    required this.displayName,
    required this.size,
  });

  factory OllamaModel.fromJson(Map<String, dynamic> json) {
    return OllamaModel(
      name: json['name'] ?? '',
      displayName: json['name']?.split(':').first ?? '',
      size: json['size'] ?? 0,
    );
  }
}

/// Configuracoes do Ollama
class OllamaConfig {
  final String model;
  final double temperature;
  final int maxTokens;
  final double topP;
  final int topK;

  const OllamaConfig({
    this.model = 'llama2',
    this.temperature = 0.7,
    this.maxTokens = 2048,
    this.topP = 0.9,
    this.topK = 40,
  });

  Map<String, dynamic> toJson() {
    return {
      'model': model,
      'temperature': temperature,
      'num_predict': maxTokens,
      'top_p': topP,
      'top_k': topK,
    };
  }

  OllamaConfig copyWith({
    String? model,
    double? temperature,
    int? maxTokens,
    double? topP,
    int? topK,
  }) {
    return OllamaConfig(
      model: model ?? this.model,
      temperature: temperature ?? this.temperature,
      maxTokens: maxTokens ?? this.maxTokens,
      topP: topP ?? this.topP,
      topK: topK ?? this.topK,
    );
  }
}

/// Mensagem de chat
class ChatHistoryMessage {
  final String role; // 'user' ou 'assistant'
  final String content;
  final DateTime timestamp;

  const ChatHistoryMessage({
    required this.role,
    required this.content,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() {
    return {
      'role': role,
      'content': content,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory ChatHistoryMessage.fromJson(Map<String, dynamic> json) {
    return ChatHistoryMessage(
      role: json['role'] ?? 'user',
      content: json['content'] ?? '',
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
    );
  }
}

/// Service para integracao com Ollama local
class OllamaService {
  static const String baseUrl = 'http://localhost:11434';
  static const String _historyKey = 'ollama_chat_history';
  static const String _configKey = 'ollama_config';

  late final Dio _dio;
  SharedPreferences? _prefs;
  OllamaConfig _config = const OllamaConfig();
  List<ChatHistoryMessage> _history = [];

  OllamaService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(minutes: 5),
        headers: {
          'Content-Type': 'application/json',
        },
      ),
    );

    // Add logging interceptor
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: false, // Nao logar body de streaming
        error: true,
      ),
    );
  }

  /// Inicializar servico
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    await _loadConfig();
    await _loadHistory();
  }

  /// Carregar configuracoes salvas
  Future<void> _loadConfig() async {
    final configJson = _prefs?.getString(_configKey);
    if (configJson != null) {
      try {
        final map = jsonDecode(configJson) as Map<String, dynamic>;
        _config = OllamaConfig(
          model: map['model'] ?? 'llama2',
          temperature: map['temperature']?.toDouble() ?? 0.7,
          maxTokens: map['num_predict'] ?? 2048,
          topP: map['top_p']?.toDouble() ?? 0.9,
          topK: map['top_k'] ?? 40,
        );
      } catch (e) {
        print('Erro ao carregar config: $e');
      }
    }
  }

  /// Salvar configuracoes
  Future<void> saveConfig(OllamaConfig config) async {
    _config = config;
    await _prefs?.setString(_configKey, jsonEncode(config.toJson()));
  }

  /// Carregar historico de chat
  Future<void> _loadHistory() async {
    final historyJson = _prefs?.getString(_historyKey);
    if (historyJson != null) {
      try {
        final list = jsonDecode(historyJson) as List<dynamic>;
        _history = list
            .map((item) => ChatHistoryMessage.fromJson(item as Map<String, dynamic>))
            .toList();
      } catch (e) {
        print('Erro ao carregar historico: $e');
        _history = [];
      }
    }
  }

  /// Salvar historico de chat
  Future<void> _saveHistory() async {
    final historyJson = jsonEncode(
      _history.map((msg) => msg.toJson()).toList(),
    );
    await _prefs?.setString(_historyKey, historyJson);
  }

  /// Adicionar mensagem ao historico
  Future<void> addToHistory(String role, String content) async {
    _history.add(
      ChatHistoryMessage(
        role: role,
        content: content,
        timestamp: DateTime.now(),
      ),
    );
    await _saveHistory();
  }

  /// Obter historico
  List<ChatHistoryMessage> getHistory() => List.unmodifiable(_history);

  /// Limpar historico
  Future<void> clearHistory() async {
    _history.clear();
    await _prefs?.remove(_historyKey);
  }

  /// Obter configuracao atual
  OllamaConfig getConfig() => _config;

  /// Verificar se Ollama esta disponivel
  Future<bool> isAvailable() async {
    try {
      final response = await _dio.get('/api/tags');
      return response.statusCode == 200;
    } catch (e) {
      print('Ollama nao esta disponivel: $e');
      return false;
    }
  }

  /// Listar modelos disponiveis
  Future<List<OllamaModel>> listModels() async {
    try {
      final response = await _dio.get('/api/tags');

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final models = data['models'] as List<dynamic>? ?? [];

        return models
            .map((model) => OllamaModel.fromJson(model as Map<String, dynamic>))
            .toList();
      }

      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Falha ao listar modelos',
      );
    } on DioException catch (e) {
      print('Erro ao listar modelos: ${e.message}');
      rethrow;
    }
  }

  /// Gerar resposta com streaming
  ///
  /// Retorna um Stream de strings (tokens) conforme chegam do Ollama.
  /// Cada evento do stream eh um token individual da resposta.
  Stream<String> generateStream({
    required String prompt,
    bool includeHistory = true,
  }) async* {
    // Adicionar prompt ao historico
    await addToHistory('user', prompt);

    // Construir contexto com historico se solicitado
    String fullPrompt = prompt;
    if (includeHistory && _history.length > 1) {
      final contextMessages = _history
          .take(_history.length - 1) // Pegar todas exceto a ultima (que acabamos de adicionar)
          .map((msg) => '${msg.role == 'user' ? 'Usuario' : 'Assistente'}: ${msg.content}')
          .join('\n');
      fullPrompt = '$contextMessages\nUsuario: $prompt\nAssistente:';
    }

    try {
      final response = await _dio.post(
        '/api/generate',
        data: {
          'model': _config.model,
          'prompt': fullPrompt,
          'stream': true,
          'options': {
            'temperature': _config.temperature,
            'num_predict': _config.maxTokens,
            'top_p': _config.topP,
            'top_k': _config.topK,
          },
        },
        options: Options(
          responseType: ResponseType.stream,
        ),
      );

      if (response.statusCode != 200) {
        throw DioException(
          requestOptions: response.requestOptions,
          message: 'Falha na geracao: ${response.statusCode}',
        );
      }

      final stream = response.data.stream as Stream<List<int>>;
      String fullResponse = '';

      await for (final chunk in stream) {
        final lines = utf8.decode(chunk).split('\n');

        for (final line in lines) {
          if (line.trim().isEmpty) continue;

          try {
            final json = jsonDecode(line) as Map<String, dynamic>;
            final token = json['response'] as String?;

            if (token != null && token.isNotEmpty) {
              fullResponse += token;
              yield token;
            }

            // Verificar se eh a ultima resposta
            if (json['done'] == true) {
              // Adicionar resposta completa ao historico
              await addToHistory('assistant', fullResponse);
              return;
            }
          } catch (e) {
            print('Erro ao parsear linha JSON: $line');
            print('Erro: $e');
            continue;
          }
        }
      }
    } on DioException catch (e) {
      // Se Ollama nao estiver disponivel, retornar erro claro
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.connectionTimeout) {
        yield '[ERRO] Ollama nao esta rodando. Inicie o Ollama com: ollama serve';
        await addToHistory(
          'assistant',
          'Erro: Ollama nao esta disponivel. Verifique se o servico esta rodando.',
        );
      } else {
        yield '[ERRO] Falha na comunicacao com Ollama: ${e.message}';
        await addToHistory('assistant', 'Erro: ${e.message}');
      }
      rethrow;
    } catch (e) {
      yield '[ERRO] Erro inesperado: $e';
      await addToHistory('assistant', 'Erro inesperado: $e');
      rethrow;
    }
  }

  /// Gerar resposta completa (nao-streaming)
  Future<String> generate({
    required String prompt,
    bool includeHistory = true,
  }) async {
    final buffer = StringBuffer();

    try {
      await for (final token in generateStream(
        prompt: prompt,
        includeHistory: includeHistory,
      )) {
        buffer.write(token);
      }

      return buffer.toString();
    } catch (e) {
      print('Erro na geracao: $e');
      return 'Erro ao gerar resposta. Verifique se o Ollama esta rodando.';
    }
  }
}
