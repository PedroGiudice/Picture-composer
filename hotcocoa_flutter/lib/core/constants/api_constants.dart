/// API endpoints and constants
abstract class ApiConstants {
  /// Modal.com backend URL for intimacy processing
  static const String backendUrl = String.fromEnvironment(
    'BACKEND_URL',
    defaultValue: 'https://pedrogiudice--picture-composer-v2-process-intimacy-request.modal.run',
  );

  /// Modal.com backend URL for mosaic analysis
  static const String mosaicUrl = String.fromEnvironment(
    'MOSAIC_URL',
    defaultValue: 'https://pedrogiudice--picture-composer-v2-process-mosaic-request.modal.run',
  );

  /// Request timeout in milliseconds
  static const int requestTimeout = 60000;

  /// Connection timeout in milliseconds
  static const int connectTimeout = 15000;
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
