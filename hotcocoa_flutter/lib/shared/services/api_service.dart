import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';

/// Response from the intimacy processing backend
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
    return IntimacyResponse(
      instructionTitlePtBr: json['instruction_title_pt_br'] ?? '',
      instructionTextPtBr: json['instruction_text_pt_br'] ?? '',
      clinicalRationalePtBr: json['clinical_rationale_pt_br'] ?? '',
      intensityMetric: json['intensity_metric'] ?? 0,
      durationSec: json['duration_sec'] ?? 120,
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
}

/// API Service for backend communication
class ApiService {
  late final Dio _dio;

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

    // Add logging interceptor for debug
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
      ),
    );
  }

  /// Process an intimacy session with an image and heat level
  Future<IntimacyResponse> processSession({
    required String imageUrl,
    required int heatLevel,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.backendUrl,
        data: {
          'image_url': imageUrl,
          'heat_level': heatLevel,
        },
      );

      if (response.statusCode == 200) {
        return IntimacyResponse.fromJson(response.data);
      }

      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Backend returned ${response.statusCode}',
      );
    } on DioException catch (e) {
      // Log error and return fallback
      print('API Error: ${e.message}');
      return IntimacyResponse.fallback(heatLevel);
    } catch (e) {
      print('Unexpected error: $e');
      return IntimacyResponse.fallback(heatLevel);
    }
  }

  /// Analyze a mosaic image and get a poetic title
  Future<String> analyzeMosaic(String imageUrl) async {
    try {
      final response = await _dio.post(
        ApiConstants.mosaicUrl,
        data: {'image_url': imageUrl},
      );

      if (response.statusCode == 200) {
        return response.data['title'] ?? 'Mosaico de Nosso Eterno Amor';
      }

      return 'Mosaico de Nossas Memorias';
    } catch (e) {
      print('Mosaic analysis error: $e');
      return 'Mosaico de Nossas Memorias (Modo Offline)';
    }
  }
}

/// Provider for the API service
final apiServiceProvider = ApiService();
