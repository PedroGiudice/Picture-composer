import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';

/// Status da autenticacao Google
enum GoogleAuthStatus {
  notAuthenticated,
  authenticating,
  authenticated,
  error,
}

/// Servico de integracao com Google Sign-In e Drive/Photos
class GoogleService {
  static const String _credentialsKey = 'google_credentials';
  static const String _clientIdKey = 'google_client_id';
  static const String _apiKeyKey = 'google_api_key';

  // Scopes necessarios para acessar Drive e Photos
  static const List<String> _scopes = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/photoslibrary.readonly',
  ];

  GoogleSignIn? _googleSignIn;
  GoogleSignInAccount? _currentUser;
  String? _accessToken;
  final _secureStorage = const FlutterSecureStorage();
  SharedPreferences? _prefs;

  final _statusController = StreamController<GoogleAuthStatus>.broadcast();
  Stream<GoogleAuthStatus> get statusStream => _statusController.stream;

  GoogleAuthStatus _status = GoogleAuthStatus.notAuthenticated;
  GoogleAuthStatus get status => _status;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  GoogleSignInAccount? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;

  /// Inicializar o servico
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    await _loadCredentials();
  }

  /// Carregar credenciais salvas
  Future<void> _loadCredentials() async {
    try {
      final clientId = await _secureStorage.read(key: _clientIdKey);
      final apiKey = await _secureStorage.read(key: _apiKeyKey);

      if (clientId != null) {
        _initializeGoogleSignIn(clientId);
        // Tentar autenticacao silenciosa
        await _signInSilently();
      }
    } catch (e) {
      debugPrint('Erro ao carregar credenciais: $e');
    }
  }

  /// Inicializar Google Sign-In com client ID
  void _initializeGoogleSignIn(String clientId) {
    _googleSignIn = GoogleSignIn(
      clientId: clientId,
      scopes: _scopes,
    );

    // Listener para mudancas de usuario
    _googleSignIn!.onCurrentUserChanged.listen((account) {
      _currentUser = account;
      if (account != null) {
        _updateStatus(GoogleAuthStatus.authenticated);
        _refreshAccessToken();
      } else {
        _updateStatus(GoogleAuthStatus.notAuthenticated);
      }
    });
  }

  /// Atualizar status de autenticacao
  void _updateStatus(GoogleAuthStatus newStatus) {
    _status = newStatus;
    _statusController.add(newStatus);
  }

  /// Salvar credenciais Google (Client ID e API Key)
  Future<void> saveCredentials({
    required String clientId,
    required String apiKey,
  }) async {
    await _secureStorage.write(key: _clientIdKey, value: clientId);
    await _secureStorage.write(key: _apiKeyKey, value: apiKey);
    _initializeGoogleSignIn(clientId);
  }

  /// Obter credenciais salvas
  Future<Map<String, String>?> getCredentials() async {
    final clientId = await _secureStorage.read(key: _clientIdKey);
    final apiKey = await _secureStorage.read(key: _apiKeyKey);

    if (clientId != null && apiKey != null) {
      return {
        'clientId': clientId,
        'apiKey': apiKey,
      };
    }
    return null;
  }

  /// Limpar credenciais salvas
  Future<void> clearCredentials() async {
    await _secureStorage.delete(key: _clientIdKey);
    await _secureStorage.delete(key: _apiKeyKey);
    _googleSignIn = null;
    await signOut();
  }

  /// Autenticacao silenciosa (sem UI)
  Future<bool> _signInSilently() async {
    if (_googleSignIn == null) return false;

    try {
      final account = await _googleSignIn!.signInSilently();
      if (account != null) {
        _currentUser = account;
        await _refreshAccessToken();
        _updateStatus(GoogleAuthStatus.authenticated);
        return true;
      }
    } catch (e) {
      debugPrint('Erro na autenticacao silenciosa: $e');
    }
    return false;
  }

  /// Fazer login com Google
  Future<bool> signIn() async {
    if (_googleSignIn == null) {
      _errorMessage = 'Credenciais Google nao configuradas';
      _updateStatus(GoogleAuthStatus.error);
      return false;
    }

    try {
      _updateStatus(GoogleAuthStatus.authenticating);
      _errorMessage = null;

      final account = await _googleSignIn!.signIn();
      if (account != null) {
        _currentUser = account;
        await _refreshAccessToken();
        _updateStatus(GoogleAuthStatus.authenticated);
        return true;
      } else {
        _errorMessage = 'Login cancelado pelo usuario';
        _updateStatus(GoogleAuthStatus.notAuthenticated);
        return false;
      }
    } catch (e) {
      _errorMessage = 'Erro ao fazer login: $e';
      _updateStatus(GoogleAuthStatus.error);
      debugPrint(_errorMessage);
      return false;
    }
  }

  /// Fazer logout
  Future<void> signOut() async {
    if (_googleSignIn != null) {
      await _googleSignIn!.signOut();
    }
    _currentUser = null;
    _accessToken = null;
    _updateStatus(GoogleAuthStatus.notAuthenticated);
  }

  /// Atualizar access token
  Future<void> _refreshAccessToken() async {
    if (_currentUser == null) return;

    try {
      final auth = await _currentUser!.authentication;
      _accessToken = auth.accessToken;
    } catch (e) {
      debugPrint('Erro ao obter access token: $e');
    }
  }

  /// Obter access token atual (refresh se necessario)
  Future<String?> getAccessToken() async {
    if (_currentUser == null) return null;

    // Refresh token se necessario
    if (_accessToken == null) {
      await _refreshAccessToken();
    }

    return _accessToken;
  }

  /// Buscar fotos do Google Drive
  ///
  /// NOTA: Esta funcao retorna apenas metadados das fotos.
  /// Para baixar as fotos, usar downloadDriveFile com o fileId.
  Future<List<Map<String, dynamic>>> fetchDrivePhotos({
    int maxResults = 50,
  }) async {
    final token = await getAccessToken();
    if (token == null) {
      throw Exception('Nao autenticado');
    }

    try {
      final dio = Dio();
      final response = await dio.get(
        'https://www.googleapis.com/drive/v3/files',
        queryParameters: {
          'q': "mimeType contains 'image/' and trashed=false",
          'pageSize': maxResults,
          'fields': 'files(id,name,mimeType,size,createdTime,modifiedTime,thumbnailLink)',
          'orderBy': 'modifiedTime desc',
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        final files = response.data['files'] as List;
        return files.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Erro ao buscar fotos: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Erro ao buscar fotos do Drive: $e');
      rethrow;
    }
  }

  /// Baixar arquivo do Google Drive
  Future<File?> downloadDriveFile({
    required String fileId,
    required String fileName,
    required String savePath,
  }) async {
    final token = await getAccessToken();
    if (token == null) {
      throw Exception('Nao autenticado');
    }

    try {
      final dio = Dio();
      final response = await dio.get(
        'https://www.googleapis.com/drive/v3/files/$fileId',
        queryParameters: {'alt': 'media'},
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
          responseType: ResponseType.bytes,
        ),
      );

      if (response.statusCode == 200) {
        final file = File(savePath);
        await file.writeAsBytes(response.data as List<int>);
        return file;
      } else {
        throw Exception('Erro ao baixar arquivo: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Erro ao baixar arquivo do Drive: $e');
      rethrow;
    }
  }

  /// Buscar fotos do Google Photos
  ///
  /// NOTA: Esta funcao usa Google Photos Library API.
  /// Pode requerer configuracao adicional no Google Cloud Console.
  Future<List<Map<String, dynamic>>> fetchGooglePhotos({
    int maxResults = 50,
  }) async {
    final token = await getAccessToken();
    if (token == null) {
      throw Exception('Nao autenticado');
    }

    try {
      final dio = Dio();
      final response = await dio.post(
        'https://photoslibrary.googleapis.com/v1/mediaItems:search',
        data: {
          'pageSize': maxResults,
          'filters': {
            'mediaTypeFilter': {
              'mediaTypes': ['PHOTO'],
            },
          },
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        final mediaItems = response.data['mediaItems'] as List?;
        return mediaItems?.cast<Map<String, dynamic>>() ?? [];
      } else {
        throw Exception('Erro ao buscar fotos: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Erro ao buscar fotos do Google Photos: $e');
      // Se falhar, tentar via Drive como fallback
      debugPrint('Tentando fallback para Google Drive...');
      return await fetchDrivePhotos(maxResults: maxResults);
    }
  }

  /// Baixar foto do Google Photos
  Future<File?> downloadGooglePhoto({
    required String baseUrl,
    required String fileName,
    required String savePath,
  }) async {
    final token = await getAccessToken();
    if (token == null) {
      throw Exception('Nao autenticado');
    }

    try {
      final dio = Dio();
      // Adicionar parametros de download
      final downloadUrl = '$baseUrl=d';

      final response = await dio.get(
        downloadUrl,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
          responseType: ResponseType.bytes,
        ),
      );

      if (response.statusCode == 200) {
        final file = File(savePath);
        await file.writeAsBytes(response.data as List<int>);
        return file;
      } else {
        throw Exception('Erro ao baixar foto: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Erro ao baixar foto do Google Photos: $e');
      rethrow;
    }
  }

  /// Dispose
  void dispose() {
    _statusController.close();
  }
}

/// Instancia global do servico Google
final googleService = GoogleService();
