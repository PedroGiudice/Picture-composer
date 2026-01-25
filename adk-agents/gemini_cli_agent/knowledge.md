# Gemini CLI Agent - Knowledge Base

## Visao Geral

Este agente ADK invoca o **Gemini CLI** (`gemini`) via subprocess. Diferente de outros agentes que usam a API diretamente, este agente:

1. **Obrigatoriamente** usa o CLI instalado no sistema
2. **NAO tem fallback** para API alternativa
3. Faz **validacao fail-fast** no startup

## Comandos do Gemini CLI

### Sintaxe Basica

```bash
gemini [flags] [files...] "prompt"
```

### Flags Principais

| Flag | Descricao |
|------|-----------|
| `-y` | Auto-confirm (nao interativo) |
| `-m MODEL` | Especifica o modelo |
| `--sandbox` | Executa em sandbox seguro |

### Modelos Disponiveis

- `gemini-2.5-flash` (default, rapido)
- `gemini-2.5-pro` (mais capaz)
- `gemini-2.0-flash` (legado rapido)
- `gemini-1.5-flash` (legado)
- `gemini-1.5-pro` (legado pro)

### Exemplos de Uso

```bash
# Prompt simples
gemini -y "Explique o que e uma closure em JavaScript"

# Com arquivo
gemini -y main.py "Analise este codigo e sugira melhorias"

# Com multiplos arquivos
gemini -y src/*.ts "Resuma a arquitetura deste projeto"

# Com modelo especifico
gemini -y -m gemini-2.5-pro CLAUDE.md "Crie um resumo executivo"
```

## Integracao com Claude Code

Este agente e util para:

1. **Context offloading**: Arquivos grandes (>500 linhas)
2. **Segunda opiniao**: Validacao de decisoes arquiteturais
3. **Analise de logs**: Processamento de outputs extensos
4. **Geracao de conteudo**: Drafts, documentacao, etc.

## Endpoints do Servidor

### GET /health

Verifica status do CLI.

```json
{
  "status": "healthy",
  "cli_path": "/usr/bin/gemini",
  "cli_version": "0.25.0",
  "model": "gemini-2.5-flash",
  "timeout": 300,
  "server_port": 8002
}
```

### POST /invoke

Invoca via agente ADK (recomendado).

Request:
```json
{
  "prompt": "Analise este codigo",
  "files": ["main.py", "utils.py"],
  "model": "gemini-2.5-flash",
  "timeout": 300
}
```

Response:
```json
{
  "success": true,
  "output": "O codigo apresenta...",
  "model_used": "gemini-2.5-flash",
  "files_used": ["main.py", "utils.py"]
}
```

### POST /direct-cli

Bypass do agente (para debug).

Request:
```json
{
  "prompt": "Diga ola",
  "model": "gemini-2.5-flash"
}
```

Response:
```json
{
  "success": true,
  "output": "Ola! Como posso ajudar?",
  "error": "",
  "return_code": 0,
  "command": "gemini -y -m gemini-2.5-flash Diga ola"
}
```

## Tratamento de Erros

### CLI nao encontrado

Se o `gemini` nao estiver instalado, o servidor **NAO sobe**.

```
ERROR: FAIL-FAST: Gemini CLI nao encontrado no sistema.
Instale com: pip install google-genai-cli
```

### Timeout

Prompts longos podem exceder o timeout (default: 300s).

```json
{
  "success": false,
  "error": "Timeout apos 300s"
}
```

### Arquivo nao encontrado

Arquivos inexistentes sao ignorados (warning no log).

## Configuracao via Environment

| Variavel | Default | Descricao |
|----------|---------|-----------|
| `GEMINI_CLI_HOST` | `0.0.0.0` | Host do servidor |
| `GEMINI_CLI_PORT` | `8002` | Porta do servidor |
| `GEMINI_CLI_MODEL` | `gemini-2.5-flash` | Modelo default |
| `GEMINI_CLI_TIMEOUT` | `300` | Timeout em segundos |
| `GEMINI_CLI_WORKDIR` | (cwd) | Diretorio de trabalho |
| `GEMINI_CLI_LOG_LEVEL` | `INFO` | Nivel de log |
