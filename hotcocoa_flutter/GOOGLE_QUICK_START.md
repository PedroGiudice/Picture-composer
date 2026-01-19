# Google Integration Quick Start

Guia rapido para configurar e usar a integracao Google no HotCocoa Flutter.

## Passo 1: Configurar Google Cloud Console

1. Acesse https://console.cloud.google.com
2. Crie um projeto ou selecione existente
3. Ative as APIs:
   - Google Drive API
   - Photos Library API
4. Configure a tela de consentimento OAuth
5. Crie credenciais OAuth 2.0:
   - Tipo: "Aplicativo de desktop"
   - Copie o Client ID (formato: `xxxx.apps.googleusercontent.com`)
   - Copie a API Key (formato: `AIza...`)

## Passo 2: Configurar no App

1. Execute o app HotCocoa Flutter
2. Va para a tela de "Upload de Fotos"
3. Clique no botao "Google Photos"
4. No dialog que abrir, insira:
   - Client ID
   - API Key
5. Clique em "Salvar"

## Passo 3: Fazer Login

1. Clique novamente em "Google Photos"
2. Uma janela de autenticacao sera aberta
3. Faca login com sua conta Google
4. Autorize as permissoes solicitadas:
   - Ver arquivos do Google Drive
   - Ver suas fotos do Google Photos

## Passo 4: Importar Fotos

1. Apos o login, o picker de fotos abrira automaticamente
2. Selecione as fotos desejadas (clique para selecionar/desselecionar)
3. Clique em "Importar (X)" onde X eh o numero de fotos selecionadas
4. Aguarde o download (barra de progresso sera exibida)
5. Fotos aparecao no grid principal

## Solucao de Problemas

### "Credenciais Google nao configuradas"
- Configure o Client ID e API Key no dialog

### "Erro ao fazer login"
- Verifique se as APIs estao ativadas no Google Cloud Console
- Certifique-se de que o Client ID esta correto
- Verifique sua conexao com a internet

### "Erro ao buscar fotos"
- Verifique se concedeu as permissoes necessarias
- Tente fazer logout e login novamente
- Verifique as quotas da API no Google Cloud Console

### "Erro ao baixar fotos"
- Verifique sua conexao com a internet
- Certifique-se de que ha espaco em disco disponivel

## Recursos

- **Documentacao Completa**: `GOOGLE_INTEGRATION.md`
- **Limitacoes**: `docs/GOOGLE_LIMITATIONS.md`
- **Implementacao**: `docs/FASE_7_IMPLEMENTACAO.md`

## Notas Importantes

1. Suas credenciais sao armazenadas de forma segura localmente
2. NUNCA compartilhe seu Client ID e API Key publicamente
3. O app funciona offline apos o download das fotos
4. Fotos importadas sao armazenadas localmente no app

## Fallback

Se o Google Photos nao funcionar, o app automaticamente tenta buscar fotos do Google Drive. Voce pode sempre usar o upload local clicando em "Adicionar Local".
