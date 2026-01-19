import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/api_constants.dart';

/// Response from the intimacy processing backend
/// Mapeia a resposta do backend Modal.com (Qwen2.5-VL + 72B-AWQ)
class IntimacyResponse {
  final String instructionTitlePtBr;
  final String instructionTextPtBr;
  final String clinicalRationalePtBr;
  final int intensityMetric;
  final int durationSec;
  final String? visualDescription;
  final String? visionModelUsed;
  final String? textModelUsed;
  final String? error;

  const IntimacyResponse({
    required this.instructionTitlePtBr,
    required this.instructionTextPtBr,
    required this.clinicalRationalePtBr,
    required this.intensityMetric,
    required this.durationSec,
    this.visualDescription,
    this.visionModelUsed,
    this.textModelUsed,
    this.error,
  });

  factory IntimacyResponse.fromJson(Map<String, dynamic> json) {
    // Backend retorna challenge_title, challenge_text, rationale
    // Mapear para nomes snake_case esperados pelo modelo Dart
    return IntimacyResponse(
      instructionTitlePtBr: json['challenge_title'] ?? json['instruction_title_pt_br'] ?? '',
      instructionTextPtBr: json['challenge_text'] ?? json['instruction_text_pt_br'] ?? '',
      clinicalRationalePtBr: json['rationale'] ?? json['clinical_rationale_pt_br'] ?? '',
      intensityMetric: json['intensity'] ?? json['intensity_metric'] ?? 0,
      durationSec: json['duration_seconds'] ?? json['duration_sec'] ?? 120,
      visualDescription: json['visual_description'],
      visionModelUsed: json['vision_model_used'],
      textModelUsed: json['text_model_used'],
      error: json['error'],
    );
  }

  factory IntimacyResponse.fallback(int heatLevel) {
    return IntimacyResponse(
      instructionTitlePtBr: 'Protocolo de Contato Visual',
      instructionTextPtBr:
          'Mantenham contato visual direto sem piscar excessivamente. Sincronizem a respiracao ate que o desconforto se torne calor.',
      clinicalRationalePtBr:
          'Simulacao de protocolo devido a ausencia de conexao com backend.',
      intensityMetric: heatLevel,
      durationSec: 120,
      error: 'Backend offline - usando fallback local',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'instruction_title_pt_br': instructionTitlePtBr,
      'instruction_text_pt_br': instructionTextPtBr,
      'clinical_rationale_pt_br': clinicalRationalePtBr,
      'intensity_metric': intensityMetric,
      'duration_sec': durationSec,
      'visual_description': visualDescription,
      'vision_model_used': visionModelUsed,
      'text_model_used': textModelUsed,
      'error': error,
    };
  }
}

/// Cache entry com timestamp para TTL
class _CacheEntry {
  final IntimacyResponse response;
  final DateTime timestamp;

  _CacheEntry(this.response, this.timestamp);

  bool isExpired() {
    final now = DateTime.now();
    final age = now.difference(timestamp).inSeconds;
    return age > ApiConstants.cacheTtlSeconds;
  }

  Map<String, dynamic> toJson() {
    return {
      'response': response.toJson(),
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory _CacheEntry.fromJson(Map<String, dynamic> json) {
    return _CacheEntry(
      IntimacyResponse.fromJson(json['response'] as Map<String, dynamic>),
      DateTime.parse(json['timestamp'] as String),
    );
  }
}

/// API Service para comunicacao com o backend Modal.com
/// Features:
/// - Retry com backoff exponencial (3 tentativas)
/// - Cache de respostas com TTL de 1 hora
/// - Timeout configuravel (60s para modelos grandes)
/// - Fallback graceful em caso de erro
/// - Conversao de imagem para base64
class ApiService {
  late final Dio _dio;
  final Map<String, _CacheEntry> _memoryCache = {};

  ApiService() {
    _dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(milliseconds: ApiConstants.connectTimeout),
        receiveTimeout: const Duration(milliseconds: ApiConstants.requestTimeout),
        headers: {
          'Content-Type': 'application/json',
        },
      ),
    );

    // Logging interceptor para debug
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: false, // Evitar logs gigantes de base64
        error: true,
      ),
    );
  }

  /// Gera hash SHA256 para chave de cache
  String _generateCacheKey({
    required String imageBase64,
    required int heatLevel,
    String? question,
    String? theme,
  }) {
    final input = '$imageBase64|$heatLevel|${question ?? ''}|${theme ?? ''}';
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  /// Busca resposta no cache (memoria + SharedPreferences)
  Future<IntimacyResponse?> _getFromCache(String cacheKey) async {
    // Verifica cache em memoria
    final memEntry = _memoryCache[cacheKey];
    if (memEntry != null && !memEntry.isExpired()) {
      print('[ApiService] Cache hit (memory): $cacheKey');
      return memEntry.response;
    }

    // Verifica cache persistente
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedJson = prefs.getString('cache_$cacheKey');
      if (cachedJson != null) {
        final entry = _CacheEntry.fromJson(
          jsonDecode(cachedJson) as Map<String, dynamic>,
        );
        if (!entry.isExpired()) {
          print('[ApiService] Cache hit (persistent): $cacheKey');
          _memoryCache[cacheKey] = entry; // Promover para memoria
          return entry.response;
        } else {
          // Remover cache expirado
          await prefs.remove('cache_$cacheKey');
        }
      }
    } catch (e) {
      print('[ApiService] Cache read error: $e');
    }

    return null;
  }

  /// Salva resposta no cache (memoria + SharedPreferences)
  Future<void> _saveToCache(String cacheKey, IntimacyResponse response) async {
    final entry = _CacheEntry(response, DateTime.now());
    _memoryCache[cacheKey] = entry;

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('cache_$cacheKey', jsonEncode(entry.toJson()));
      print('[ApiService] Cached: $cacheKey');
    } catch (e) {
      print('[ApiService] Cache write error: $e');
    }
  }

  /// Converte File para base64 string
  Future<String> _fileToBase64(File imageFile) async {
    final bytes = await imageFile.readAsBytes();
    return base64Encode(bytes);
  }

  /// Retry com backoff exponencial
  /// Tenta maxRetries vezes com delay crescente: 1s, 2s, 4s
  Future<T> _retryWithBackoff<T>(
    Future<T> Function() operation, {
    int attempt = 1,
  }) async {
    try {
      return await operation();
    } catch (e) {
      if (attempt >= ApiConstants.maxRetries) {
        rethrow;
      }

      final delayMs = ApiConstants.baseRetryDelayMs * (1 << (attempt - 1));
      print('[ApiService] Retry $attempt/${ApiConstants.maxRetries} apos ${delayMs}ms');
      await Future.delayed(Duration(milliseconds: delayMs));

      return _retryWithBackoff(operation, attempt: attempt + 1);
    }
  }

  /// Processa uma sessao de intimidade com imagem e heat level
  ///
  /// Pipeline:
  /// 1. Converte imagem para base64
  /// 2. Verifica cache por hash da imagem + parametros
  /// 3. Se cache miss, envia para Modal.com (Qwen2.5-VL + 72B-AWQ)
  /// 4. Retry com backoff exponencial em caso de erro
  /// 5. Salva resposta no cache
  /// 6. Fallback graceful se tudo falhar
  Future<IntimacyResponse> processSession({
    required File imageFile,
    required int heatLevel,
    String? question,
    String? theme,
  }) async {
    try {
      // Converter imagem para base64
      final imageBase64 = await _fileToBase64(imageFile);
      final imageUrl = 'data:image/jpeg;base64,$imageBase64';

      // Gerar chave de cache
      final cacheKey = _generateCacheKey(
        imageBase64: imageBase64,
        heatLevel: heatLevel,
        question: question,
        theme: theme,
      );

      // Verificar cache
      final cached = await _getFromCache(cacheKey);
      if (cached != null) {
        return cached;
      }

      // Request para backend Modal.com
      print('[ApiService] Enviando requisicao para Modal.com (heat=$heatLevel)');
      final response = await _retryWithBackoff(() async {
        final result = await _dio.post(
          ApiConstants.backendUrl,
          data: {
            'image_url': imageUrl,
            'heat_level': heatLevel,
          },
        );

        if (result.statusCode != 200) {
          throw DioException(
            requestOptions: result.requestOptions,
            message: 'Backend retornou ${result.statusCode}',
          );
        }

        return result;
      });

      // Parse e cache
      final intimacyResponse = IntimacyResponse.fromJson(
        response.data as Map<String, dynamic>,
      );
      await _saveToCache(cacheKey, intimacyResponse);

      print('[ApiService] Resposta recebida com sucesso');
      return intimacyResponse;
    } on DioException catch (e) {
      print('[ApiService] Erro de rede: ${e.message}');
      print('[ApiService] Usando fallback local');
      return IntimacyResponse.fallback(heatLevel);
    } catch (e) {
      print('[ApiService] Erro inesperado: $e');
      print('[ApiService] Usando fallback local');
      return IntimacyResponse.fallback(heatLevel);
    }
  }

  /// Analisa uma imagem de mosaico e retorna titulo poetico
  /// Usa Qwen2.5-VL-7B no backend Modal.com
  Future<String> analyzeMosaic(File mosaicFile) async {
    try {
      // Converter imagem para base64
      final imageBase64 = await _fileToBase64(mosaicFile);
      final imageUrl = 'data:image/jpeg;base64,$imageBase64';

      print('[ApiService] Enviando mosaico para analise');
      final response = await _retryWithBackoff(() async {
        final result = await _dio.post(
          ApiConstants.mosaicUrl,
          data: {'image_url': imageUrl},
        );

        if (result.statusCode != 200) {
          throw DioException(
            requestOptions: result.requestOptions,
            message: 'Backend de mosaico retornou ${result.statusCode}',
          );
        }

        return result;
      });

      final title = (response.data as Map<String, dynamic>)['title'] as String?;
      return title ?? 'Mosaico de Nosso Eterno Amor';
    } catch (e) {
      print('[ApiService] Erro ao analisar mosaico: $e');
      return 'Mosaico de Nossas Memorias (Modo Offline)';
    }
  }

  /// Limpa cache expirado
  Future<void> clearExpiredCache() async {
    // Limpar cache em memoria
    _memoryCache.removeWhere((key, entry) => entry.isExpired());

    // Limpar cache persistente
    try {
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys().where((k) => k.startsWith('cache_'));

      for (final key in keys) {
        final cachedJson = prefs.getString(key);
        if (cachedJson != null) {
          try {
            final entry = _CacheEntry.fromJson(
              jsonDecode(cachedJson) as Map<String, dynamic>,
            );
            if (entry.isExpired()) {
              await prefs.remove(key);
              print('[ApiService] Removido cache expirado: $key');
            }
          } catch (_) {
            // Cache corrompido, remover
            await prefs.remove(key);
          }
        }
      }
    } catch (e) {
      print('[ApiService] Erro ao limpar cache: $e');
    }
  }

  /// Limpa todo o cache (util para debug)
  Future<void> clearAllCache() async {
    _memoryCache.clear();

    try {
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys().where((k) => k.startsWith('cache_'));
      for (final key in keys) {
        await prefs.remove(key);
      }
      print('[ApiService] Cache completamente limpo');
    } catch (e) {
      print('[ApiService] Erro ao limpar cache: $e');
    }
  }
}

/// Provider global para ApiService
final apiServiceProvider = ApiService();
