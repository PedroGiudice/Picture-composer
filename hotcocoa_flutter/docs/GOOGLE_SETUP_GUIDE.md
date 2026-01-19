# Guia Rapido: Configurar Google Photos no HotCocoa

## Passo a Passo (5 minutos)

### 1. Acessar Google Cloud Console

Abra seu browser e va para: https://console.cloud.google.com

### 2. Criar ou Selecionar Projeto

**Opcao A - Criar Novo Projeto:**
1. Clique no seletor de projetos (topo da pagina)
2. Clique em "Novo Projeto"
3. Nome: "HotCocoa Flutter" (ou qualquer nome)
4. Clique em "Criar"
5. Aguarde criacao (alguns segundos)

**Opcao B - Usar Projeto Existente:**
1. Clique no seletor de projetos
2. Selecione o projeto desejado

### 3. Ativar APIs Necessarias

1. No menu lateral, va em "APIs e Servicos" > "Biblioteca"
2. Busque por "Google Drive API"
3. Clique no resultado
4. Clique em "Ativar"
5. Aguarde ativacao
6. Volte para Biblioteca
7. Busque por "Photos Library API"
8. Clique no resultado
9. Clique em "Ativar"

### 4. Configurar Tela de Consentimento OAuth

1. No menu lateral, va em "APIs e Servicos" > "Tela de consentimento OAuth"
2. Selecione "Externo" (a menos que tenha Google Workspace)
3. Clique em "Criar"
4. Preencha apenas os campos obrigatorios:
   - Nome do app: "HotCocoa"
   - Email de suporte: seu email
   - Email de contato do desenvolvedor: seu email
5. Clique em "Salvar e Continuar"
6. Em "Escopos", clique em "Adicionar ou Remover Escopos"
7. Busque e marque:
   - `.../auth/drive.readonly`
   - `.../auth/photoslibrary.readonly`
8. Clique em "Atualizar" > "Salvar e Continuar"
9. Em "Usuarios de teste", adicione seu email do Google
10. Clique em "Salvar e Continuar"
11. Revise e clique em "Voltar ao Painel"

### 5. Criar Credenciais OAuth 2.0

1. No menu lateral, va em "APIs e Servicos" > "Credenciais"
2. Clique em "Criar Credenciais" > "ID do cliente OAuth"
3. Tipo de aplicativo: "App para computador"
4. Nome: "HotCocoa Desktop" (ou qualquer nome)
5. Clique em "Criar"
6. Um popup aparecera com suas credenciais
7. **COPIE o "ID do cliente"** (algo como `xxx.apps.googleusercontent.com`)
8. Clique em "OK"

### 6. Criar API Key

1. Ainda em "Credenciais"
2. Clique em "Criar Credenciais" > "Chave de API"
3. Um popup aparecera com sua API Key
4. **COPIE a chave** (algo como `AIza...`)
5. (Recomendado) Clique em "Restringir chave"
6. Em "Restricoes de API", selecione "Restringir chave"
7. Marque:
   - Google Drive API
   - Photos Library API
8. Clique em "Salvar"

### 7. Configurar no HotCocoa

1. Abra o app HotCocoa Flutter
2. Va para a tela de Upload de Fotos
3. Clique no botao "Google Photos"
4. Um dialog aparecera
5. Cole o **Client ID** no primeiro campo
6. Cole a **API Key** no segundo campo
7. Clique em "Salvar"

### 8. Fazer Login

1. Apos salvar, o app tentara fazer login automaticamente
2. Seu browser abrira com a tela de login do Google
3. Faca login com sua conta Google
4. Autorize o acesso quando solicitado
5. O browser mostrara "Autenticacao concluida" ou similar
6. Volte para o app HotCocoa

### 9. Selecionar Fotos

1. O picker de fotos abrira automaticamente
2. Selecione as fotos desejadas (clique para marcar)
3. Clique em "Importar"
4. Aguarde o download
5. As fotos aparecerao no grid principal

## Resumo Visual

```
Google Cloud Console
    |
    v
Criar Projeto
    |
    v
Ativar APIs (Drive + Photos)
    |
    v
Configurar OAuth Consent Screen
    |
    v
Criar Client ID (Desktop app)
    |
    v
Criar API Key
    |
    v
Copiar Client ID + API Key
    |
    v
Colar no HotCocoa
    |
    v
Login com Google (browser)
    |
    v
Autorizar acesso
    |
    v
Selecionar fotos
    |
    v
Importar!
```

## Troubleshooting

### "Missing Credentials"
- Voce nao configurou Client ID e API Key ainda
- Siga os passos 5-7 acima

### "Login cancelado pelo usuario"
- Voce clicou em "Cancelar" no browser
- Tente novamente

### "Access denied" ou "Error 403"
- Adicione seu email como "Usuario de teste" (passo 4.9)
- Aguarde alguns minutos e tente novamente

### "Invalid Client ID"
- Verifique se copiou o Client ID completo
- Deve terminar em `.apps.googleusercontent.com`

### "API not enabled"
- Verifique se ativou ambas as APIs (passo 3)
- Aguarde alguns minutos para propagacao

### Browser nao abre
- Verifique se tem um browser padrao configurado
- Tente reiniciar o app

## Seguranca

- Client ID e API Key sao armazenados de forma segura
- Tokens OAuth nao sao persistidos
- Scopes sao readonly (app nao pode modificar suas fotos)
- Voce pode revogar acesso a qualquer momento em: https://myaccount.google.com/permissions

## Proximos Usos

Apos configurar uma vez:

1. Clique em "Google Photos"
2. Se autenticado, picker abre automaticamente
3. Selecione fotos
4. Importar

Nao precisa fazer login toda vez.

## Revogar Acesso

Se quiser remover o acesso:

1. Va para: https://myaccount.google.com/permissions
2. Encontre "HotCocoa" (ou nome que escolheu)
3. Clique em "Remover acesso"

No app, para limpar credenciais locais, adicione esta funcionalidade ou delete manualmente os dados do app.

## Links Uteis

- Google Cloud Console: https://console.cloud.google.com
- Gerenciar apps conectados: https://myaccount.google.com/permissions
- Documentacao Drive API: https://developers.google.com/drive
- Documentacao Photos API: https://developers.google.com/photos
