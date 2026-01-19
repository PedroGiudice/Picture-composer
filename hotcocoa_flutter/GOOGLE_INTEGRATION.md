# Integracao Google Sign-In e Photos - HotCocoa Flutter

## Visao Geral

A integracao com Google Sign-In e Google Photos foi implementada no HotCocoa Flutter para permitir que usuarios importem fotos diretamente de suas contas Google Drive e Google Photos.

## Arquitetura

### Servicos

- **GoogleService** (`lib/shared/services/google_service.dart`)
  - Gerencia autenticacao OAuth com Google
  - Fornece acesso a Google Drive API e Photos Library API
  - Persiste credenciais de forma segura usando `flutter_secure_storage`
  - Gerencia tokens de acesso e refresh

### Providers (Riverpod)

- **googleServiceProvider**: Instancia singleton do GoogleService
- **googleAuthStatusProvider**: Stream do status de autenticacao
- **googleUserProvider**: Usuario Google atual
- **isGoogleAuthenticatedProvider**: Boolean indicando se usuario esta autenticado
- **googleAuthErrorProvider**: Mensagem de erro se houver

### Componentes UI

- **GoogleCredentialsDialog** (`lib/features/photo_upload/google_credentials_dialog.dart`)
  - Dialog para configurar Client ID e API Key
  - Valida e salva credenciais de forma segura
  - Fornece instrucoes de como obter credenciais

- **GooglePhotosPicker** (`lib/features/photo_upload/google_photos_picker.dart`)
  - Dialog para selecionar fotos do Google
  - Suporta Google Photos e Google Drive
  - Download e importacao de fotos selecionadas
  - Fallback automatico de Photos para Drive

## Configuracao

### 1. Obter Credenciais Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto novo ou selecione existente
3. Ative as seguintes APIs:
   - Google Drive API
   - Photos Library API
4. Configure a tela de consentimento OAuth
5. Crie credenciais OAuth 2.0 (Aplicativo de desktop)
6. Copie o Client ID e API Key

### 2. Configurar no Aplicativo

1. Abra o aplicativo HotCocoa Flutter
2. Na tela de upload de fotos, clique em "Google Photos"
3. Se for a primeira vez, sera aberto o dialog de credenciais
4. Cole o Client ID e API Key
5. Clique em "Salvar"

### 3. Fazer Login

Apos configurar as credenciais, o aplicativo tentara fazer login automaticamente. Se nao funcionar:

1. Clique novamente em "Google Photos"
2. Uma janela de autenticacao sera aberta
3. Faca login com sua conta Google
4. Autorize as permissoes solicitadas

## Scopes Utilizados

O aplicativo solicita os seguintes escopos:

- `openid`: Identificacao basica do usuario
- `email`: Email do usuario
- `profile`: Perfil basico do usuario
- `https://www.googleapis.com/auth/drive.readonly`: Leitura de arquivos no Drive
- `https://www.googleapis.com/auth/photoslibrary.readonly`: Leitura de fotos no Google Photos

## Fluxo de Uso

### Upload de Fotos

1. Usuario clica em "Google Photos" na tela de upload
2. Se nao autenticado, faz login
3. GooglePhotosPicker carrega fotos do Google Photos
4. Se falhar, tenta carregar do Google Drive como fallback
5. Usuario seleciona fotos desejadas
6. Fotos sao baixadas para diretorio temporario
7. Fotos sao importadas para o storage local do app

### Gerenciamento de Token

- Tokens sao armazenados em memoria durante a sessao
- Refresh automatico de tokens quando expiram
- Login silencioso na proxima sessao se credenciais validas

## Limitacoes e Consideracoes

### Desktop OAuth Flow

O `google_sign_in` package no Flutter desktop tem algumas limitacoes:

1. **Webview Requirement**: O fluxo OAuth requer uma webview integrada ou navegador externo
2. **Redirect URI**: Desktop apps usam `http://localhost` como redirect URI
3. **Client ID Desktop**: Certifique-se de criar credenciais para "Aplicativo de desktop" no Google Cloud Console

### Permissoes

- Em Linux, pode ser necessario configurar permissoes de rede
- Firewall pode bloquear o redirect do OAuth
- Antivirus pode interferir com o fluxo de autenticacao

### API Quotas

- Google Photos API tem limites de requisicoes
- Drive API tem limites de download
- Recomendado: Implementar rate limiting se necessario

### Fallback Behavior

- Se Google Photos API falhar, o app automaticamente tenta Google Drive
- Se ambos falharem, usuario pode usar upload local
- Erros sao apresentados de forma clara ao usuario

## Troubleshooting

### "Credenciais Google nao configuradas"

- Verifique se Client ID e API Key foram salvos corretamente
- Tente limpar e reconfigurar as credenciais

### "Erro ao fazer login"

- Verifique conexao com internet
- Certifique-se de que as APIs estao ativadas no Google Cloud Console
- Verifique se o Client ID corresponde a um app desktop

### "Erro ao buscar fotos"

- Verifique se as permissoes foram concedidas
- Tente fazer logout e login novamente
- Verifique quotas da API no Google Cloud Console

### "Erro ao baixar fotos"

- Verifique conexao com internet
- Certifique-se de que ha espaco em disco
- Algumas fotos podem estar corrompidas ou indisponiveis

## Seguranca

### Armazenamento de Credenciais

- Client ID e API Key sao armazenados usando `flutter_secure_storage`
- Em Linux: Usa Secret Service API (GNOME Keyring, KWallet)
- Em Windows: Usa Windows Credential Store
- Em macOS: Usa Keychain

### Tokens de Acesso

- Access tokens sao mantidos apenas em memoria
- Nao sao persistidos em disco
- Refresh automatico quando necessario

### Melhores Praticas

- NUNCA commitar credenciais no codigo
- NUNCA compartilhar Client ID/API Key publicamente
- Usar quotas e limites apropriados no Google Cloud Console
- Monitorar uso da API regularmente

## Arquivos Relevantes

```
lib/
  shared/
    services/
      google_service.dart          # Servico principal
    providers/
      google_providers.dart        # Providers Riverpod
  features/
    photo_upload/
      google_credentials_dialog.dart   # Dialog de configuracao
      google_photos_picker.dart        # Picker de fotos
      photo_upload_page.dart           # Integracao na UI
```

## Proximos Passos

### Melhorias Futuras

1. **Cache de thumbnails**: Cachear previews para melhor performance
2. **Paginacao**: Implementar scroll infinito para muitas fotos
3. **Filtros**: Permitir filtrar por data, album, etc.
4. **Albums**: Suporte a navegacao por albums
5. **Sincronizacao**: Sincronizar automaticamente novas fotos

### Alternativas

Se o Google Sign-In desktop apresentar problemas:

1. **Webview OAuth**: Implementar OAuth flow customizado com webview
2. **Browser-based**: Abrir navegador externo e capturar redirect
3. **QR Code**: Gerar QR code para autenticacao via mobile
4. **API Key only**: Usar apenas API Key para acesso publico (limitado)

## Referencias

- [Google Sign-In Flutter Package](https://pub.dev/packages/google_sign_in)
- [Google Drive API](https://developers.google.com/drive)
- [Google Photos API](https://developers.google.com/photos)
- [OAuth 2.0 for Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Flutter Secure Storage](https://pub.dev/packages/flutter_secure_storage)

## Contribuindo

Para contribuir com melhorias na integracao Google:

1. Teste em multiplas plataformas (Linux, Windows, macOS)
2. Documente limitacoes encontradas
3. Implemente fallbacks quando possivel
4. Mantenha seguranca como prioridade
5. Adicione testes quando possivel
