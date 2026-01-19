# Integracao Google Sign-In e Photos - HotCocoa Flutter

## Visao Geral

Implementacao da integracao com Google Sign-In, Google Drive e Google Photos para desktop (Linux/Windows/macOS) usando Flutter.

## Status da Implementacao

- **Google Sign-In**: Implementado
- **Google Drive API**: Implementado
- **Google Photos API**: Implementado com fallback para Drive
- **Autenticacao Desktop**: Implementado via OAuth 2.0
- **Armazenamento Seguro**: Implementado com flutter_secure_storage

## Arquitetura

### Services

#### GoogleService (`lib/shared/services/google_service.dart`)

Servico principal que gerencia:
- Autenticacao OAuth 2.0
- Gerenciamento de tokens
- Integracao com Google Drive API
- Integracao com Google Photos API
- Armazenamento seguro de credenciais

**Principais metodos:**
```dart
// Inicializar servico
await googleService.init();

// Salvar credenciais (Client ID + API Key)
await googleService.saveCredentials(
  clientId: 'xxx.apps.googleusercontent.com',
  apiKey: 'AIza...',
);

// Fazer login
final success = await googleService.signIn();

// Buscar fotos do Google Photos
final photos = await googleService.fetchGooglePhotos(maxResults: 100);

// Buscar fotos do Google Drive
final photos = await googleService.fetchDrivePhotos(maxResults: 100);

// Baixar foto
final file = await googleService.downloadGooglePhoto(
  baseUrl: photo['baseUrl'],
  fileName: 'photo.jpg',
  savePath: '/path/to/save',
);
```

### Providers

#### Google Providers (`lib/shared/providers/google_providers.dart`)

Providers Riverpod para state management:

- `googleServiceProvider`: Instancia do GoogleService
- `googleAuthStatusProvider`: Stream do status de autenticacao
- `googleUserProvider`: Usuario atual autenticado
- `isGoogleAuthenticatedProvider`: Booleano se esta autenticado
- `googleAuthErrorProvider`: Mensagem de erro se houver

### UI Components

#### GoogleCredentialsDialog

Dialog para configurar credenciais Google (Client ID e API Key).

- Formulario de validacao
- Armazenamento seguro
- Instrucoes de como obter credenciais

#### GooglePhotosPicker

Dialog para selecionar e importar fotos do Google.

- Grid de fotos com thumbnails
- Selecao multipla
- Progress indicator de download
- Fallback automatico Drive -> Photos

## Configuracao

### 1. Google Cloud Console

Para usar a integracao, eh necessario configurar credenciais no Google Cloud Console:

1. Acesse https://console.cloud.google.com
2. Crie um projeto novo ou selecione existente
3. Ative as APIs necessarias:
   - Google Drive API
   - Google Photos Library API
4. Crie credenciais OAuth 2.0:
   - Tipo: Desktop app
   - Copie o Client ID
5. Crie uma API Key (com restricoes recomendadas)

### 2. Scopes Necessarios

O servico solicita os seguintes scopes:

```dart
static const List<String> _scopes = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/photoslibrary.readonly',
];
```

### 3. Configuracao no App

No primeiro uso, o usuario deve:

1. Clicar em "Google Photos" na tela de upload
2. Inserir Client ID e API Key no dialog
3. Fazer login com conta Google
4. Autorizar scopes solicitados

As credenciais sao salvas de forma segura usando `flutter_secure_storage`.

## Fluxo de Autenticacao

```
Usuario clica "Google Photos"
    |
    v
Credenciais salvas?
    |
    +-- Nao --> Mostrar GoogleCredentialsDialog
    |               |
    |               v
    |           Salvar credenciais
    |               |
    +---------------+
    |
    v
Esta autenticado?
    |
    +-- Nao --> Executar signIn()
    |               |
    |               v
    |           OAuth flow (browser)
    |               |
    |               v
    |           Obter access token
    |               |
    +---------------+
    |
    v
Mostrar GooglePhotosPicker
    |
    v
Buscar fotos (Photos API)
    |
    +-- Erro? --> Fallback para Drive API
    |
    v
Usuario seleciona fotos
    |
    v
Download de fotos selecionadas
    |
    v
Importar para app
```

## Limitacoes Conhecidas

### Desktop OAuth

Em desktop, o `google_sign_in` usa um flow OAuth via browser:

1. Abre browser padrao do sistema
2. Usuario faz login no Google
3. Redireciona para localhost com token
4. App captura o token

**Limitacoes:**
- Requer browser instalado no sistema
- Pode ser bloqueado por firewalls corporativos
- Necessita configurar redirect URI no Google Console

### Google Photos API

A API do Google Photos tem algumas restricoes:

- Nao permite acesso direto a TODAS as fotos (apenas mediaItems)
- Algumas fotos podem nao estar disponiveis via API
- Thumbnails podem ter delay para carregar

**Solucao:** Implementado fallback automatico para Google Drive API, que geralmente tem melhor compatibilidade.

### Armazenamento de Tokens

Os tokens sao armazenados usando `flutter_secure_storage`:

- **Linux**: Secret Service API / libsecret
- **Windows**: Windows Credential Manager
- **macOS**: Keychain

Se o sistema nao tiver suporte a storage seguro, os tokens ficam em plaintext (nao recomendado para producao).

## Fallback para File Picker

O sistema sempre oferece fallback graceful:

1. Se Google falhar, usuario pode usar "Adicionar Local"
2. Drag & drop continua funcionando
3. Nenhuma funcionalidade core eh perdida

## Melhorias Futuras

### Implementado
- [x] Google Sign-In OAuth 2.0
- [x] Google Drive API integration
- [x] Google Photos API integration
- [x] Armazenamento seguro de credenciais
- [x] UI para configuracao de credenciais
- [x] Picker de fotos com selecao multipla
- [x] Download com progress indicator
- [x] Fallback automatico Photos -> Drive

### Pendente
- [ ] Refresh automatico de tokens expirados
- [ ] Cache de thumbnails para performance
- [ ] Paginacao para grandes bibliotecas
- [ ] Filtros de data/album no picker
- [ ] Sincronizacao bidirecional (upload)
- [ ] Suporte a Google Photos Albums API

## Troubleshooting

### Erro: "Missing Credentials"

**Causa:** Credenciais nao configuradas.

**Solucao:** Clicar em "Google Photos" e inserir Client ID e API Key no dialog.

### Erro: "Google Identity Services not initialized"

**Causa:** JavaScript GSI nao carregado (nao se aplica a desktop).

**Solucao:** Reiniciar app.

### Erro: "Failed to load photos"

**Causa:** Token expirado ou scopes insuficientes.

**Solucao:** Fazer logout e login novamente:
```dart
await googleService.signOut();
await googleService.signIn();
```

### Erro: "Download failed"

**Causa:** Arquivo pode ter sido deletado ou movido.

**Solucao:** Atualizar lista de fotos e tentar novamente.

## Seguranca

### Armazenamento de Credenciais

- Client ID e API Key armazenados em `flutter_secure_storage`
- Tokens OAuth armazenados em memoria (nao persistidos)
- Logout limpa todos os dados sensiveis

### Scopes Readonly

Todos os scopes sao **readonly**:
- `drive.readonly`: Apenas leitura
- `photoslibrary.readonly`: Apenas leitura

O app NUNCA pode:
- Deletar fotos do usuario
- Modificar fotos
- Fazer upload de novos arquivos
- Alterar permissoes

### HTTPS Only

Todas as requisicoes usam HTTPS via Dio client.

## Exemplo de Uso

```dart
import 'package:hotcocoa_flutter/shared/services/google_service.dart';

// Inicializar
await googleService.init();

// Configurar credenciais (primeira vez)
await googleService.saveCredentials(
  clientId: 'xxx.apps.googleusercontent.com',
  apiKey: 'AIza...',
);

// Login
final success = await googleService.signIn();
if (success) {
  // Buscar fotos
  final photos = await googleService.fetchGooglePhotos(maxResults: 50);

  // Baixar primeira foto
  final firstPhoto = photos.first;
  final file = await googleService.downloadGooglePhoto(
    baseUrl: firstPhoto['baseUrl'],
    fileName: firstPhoto['filename'],
    savePath: '/tmp/photo.jpg',
  );

  print('Foto baixada: ${file.path}');
}

// Logout
await googleService.signOut();
```

## Referencias

- [Google Sign-In Flutter Plugin](https://pub.dev/packages/google_sign_in)
- [Google Drive API Documentation](https://developers.google.com/drive/api/v3)
- [Google Photos API Documentation](https://developers.google.com/photos)
- [Flutter Secure Storage](https://pub.dev/packages/flutter_secure_storage)
