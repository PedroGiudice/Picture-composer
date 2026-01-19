import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:hotcocoa_flutter/shared/services/google_service.dart';

/// Provider para o servico Google
final googleServiceProvider = Provider<GoogleService>((ref) {
  return googleService;
});

/// Provider para o status de autenticacao
final googleAuthStatusProvider = StreamProvider<GoogleAuthStatus>((ref) {
  final service = ref.watch(googleServiceProvider);
  return service.statusStream;
});

/// Provider para usuario atual do Google
final googleUserProvider = Provider<GoogleSignInAccount?>((ref) {
  final service = ref.watch(googleServiceProvider);
  return service.currentUser;
});

/// Provider para verificar se esta autenticado
final isGoogleAuthenticatedProvider = Provider<bool>((ref) {
  final service = ref.watch(googleServiceProvider);
  return service.isAuthenticated;
});

/// Provider para erro de autenticacao
final googleAuthErrorProvider = Provider<String?>((ref) {
  final service = ref.watch(googleServiceProvider);
  return service.errorMessage;
});
