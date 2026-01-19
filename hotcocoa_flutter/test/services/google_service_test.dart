import 'package:flutter_test/flutter_test.dart';
import 'package:hotcocoa_flutter/shared/services/google_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('GoogleService', () {
    late GoogleService service;

    setUp(() {
      service = GoogleService();
    });

    test('deve inicializar sem erros', () async {
      await service.init();
      expect(service.isAuthenticated, false);
    });

    test('status inicial deve ser notAuthenticated', () {
      expect(service.status, GoogleAuthStatus.notAuthenticated);
    });

    test('deve retornar null quando nao ha credenciais', () async {
      await service.init();
      final creds = await service.getCredentials();
      expect(creds, isNull);
    });

    test('deve salvar e recuperar credenciais', () async {
      await service.init();

      const testClientId = 'test-client-id.apps.googleusercontent.com';
      const testApiKey = 'test-api-key';

      await service.saveCredentials(
        clientId: testClientId,
        apiKey: testApiKey,
      );

      final creds = await service.getCredentials();
      expect(creds, isNotNull);
      expect(creds!['clientId'], testClientId);
      expect(creds['apiKey'], testApiKey);

      // Limpar apos teste
      await service.clearCredentials();
    });

    test('deve limpar credenciais corretamente', () async {
      await service.init();

      await service.saveCredentials(
        clientId: 'test-client-id',
        apiKey: 'test-api-key',
      );

      await service.clearCredentials();

      final creds = await service.getCredentials();
      expect(creds, isNull);
    });

    test('signIn deve falhar sem credenciais', () async {
      await service.init();
      final result = await service.signIn();
      expect(result, false);
      expect(service.errorMessage, isNotNull);
    });

    test('getAccessToken deve retornar null quando nao autenticado', () async {
      await service.init();
      final token = await service.getAccessToken();
      expect(token, isNull);
    });
  });

  group('GoogleAuthStatus', () {
    test('deve ter todos os estados esperados', () {
      expect(GoogleAuthStatus.values, [
        GoogleAuthStatus.notAuthenticated,
        GoogleAuthStatus.authenticating,
        GoogleAuthStatus.authenticated,
        GoogleAuthStatus.error,
      ]);
    });
  });
}
