/// API endpoints and constants
abstract class ApiConstants {
  /// Modal.com backend URL for intimacy processing (A100 Qwen2.5-VL + 72B)
  static const String backendUrl = String.fromEnvironment(
    'BACKEND_URL',
    defaultValue: 'https://pedrogiudice--picture-composer-backend-a100-process-intimacy-request.modal.run',
  );

  /// Modal.com backend URL for mosaic analysis (A100 Qwen2.5-VL)
  static const String mosaicUrl = String.fromEnvironment(
    'MOSAIC_URL',
    defaultValue: 'https://pedrogiudice--picture-composer-backend-a100-process-mosaic-request.modal.run',
  );

  /// Request timeout in milliseconds (60s para modelos grandes)
  static const int requestTimeout = 60000;

  /// Connection timeout in milliseconds (15s)
  static const int connectTimeout = 15000;

  /// Numero maximo de tentativas de retry
  static const int maxRetries = 3;

  /// Delay base para backoff exponencial (1s)
  static const int baseRetryDelayMs = 1000;

  /// Cache TTL em segundos (1 hora)
  static const int cacheTtlSeconds = 3600;
}

/// Romantic questions for the intimacy experience
const List<String> romanticQuestions = [
  'Qual foi o momento que voce soube que me amava?',
  'O que voce mais admira em mim?',
  'Qual foi nosso momento mais memoravel juntos?',
  'O que voce gostaria de fazer comigo que nunca fizemos?',
  'Qual foi a primeira coisa que voce notou em mim?',
  'O que te faz sentir mais conectado(a) a mim?',
  'Qual sonho voce gostaria de realizar comigo?',
  'O que voce mais sente falta quando estamos separados?',
  'Qual foi o momento mais divertido que tivemos juntos?',
  'O que te faz sentir mais amado(a) por mim?',
];
