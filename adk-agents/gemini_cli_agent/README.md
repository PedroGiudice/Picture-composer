# Gemini CLI ADK Agent

Servidor ADK que invoca o **Gemini CLI** via subprocess.

## Caracteristicas

- **Fail-Fast**: Servidor NAO sobe se CLI nao disponivel
- **Zero Fallback**: Sem modo API alternativo
- **Subprocess Puro**: Invocacao direta do comando `gemini`
- **Compatibilidade**: Segue padrao existente de ADK agents

## Pre-requisitos

1. **Gemini CLI instalado**:
   ```bash
   # Verificar instalacao
   which gemini && gemini --version

   # Se nao instalado:
   pip install google-genai-cli
   ```

2. **Python 3.9+**

3. **Dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

## Quick Start

```bash
# 1. Entrar no diretorio
cd adk-agents/gemini_cli_agent

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Iniciar servidor
python server.py

# 4. Testar
curl http://localhost:8002/health
```

## Endpoints

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/health` | Status do servidor e CLI |
| POST | `/invoke` | Invocar agente ADK |
| POST | `/direct-cli` | Bypass do agente (CLI direto) |

## Exemplos

### Health Check

```bash
curl http://localhost:8002/health
```

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

### Invocar Agente

```bash
curl -X POST http://localhost:8002/invoke \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Diga ola em portugues"}'
```

```json
{
  "success": true,
  "output": "Ola! Como posso ajudar voce hoje?",
  "model_used": "gemini-2.5-flash",
  "files_used": null
}
```

### Invocar com Arquivos

```bash
curl -X POST http://localhost:8002/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analise este arquivo e sugira melhorias",
    "files": ["CLAUDE.md"],
    "model": "gemini-2.5-pro"
  }'
```

### CLI Direto (Debug)

```bash
curl -X POST http://localhost:8002/direct-cli \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Ola", "model": "gemini-2.5-flash"}'
```

## Configuracao

Via variaveis de ambiente:

```bash
export GEMINI_CLI_HOST=0.0.0.0
export GEMINI_CLI_PORT=8002
export GEMINI_CLI_MODEL=gemini-2.5-flash
export GEMINI_CLI_TIMEOUT=300
export GEMINI_CLI_LOG_LEVEL=INFO

python server.py
```

## Integracao com Claude Code

Este agente e registrado em `adk_agent_list.json`:

```json
{
  "name": "gemini-cli-agent",
  "url": "http://localhost:8002"
}
```

E pode ser invocado via skill `gemini-cli` que atualiza o `skill-rules.json`.

## Estrutura

```
gemini_cli_agent/
├── gemini_cli_agent/       # Pacote Python
│   ├── __init__.py
│   ├── agent.py            # GeminiCliAgent class
│   ├── tools.py            # invoke_gemini_cli()
│   └── validation.py       # Fail-fast validation
├── server.py               # FastAPI server
├── config.py               # Configuracao
├── knowledge.md            # Knowledge base
├── requirements.txt
└── README.md
```

## Troubleshooting

### "Gemini CLI nao encontrado"

```bash
# Verificar se esta instalado
which gemini

# Instalar
pip install google-genai-cli

# Ou adicionar ao PATH se instalado em local nao-padrao
export PATH=$PATH:/caminho/para/gemini
```

### "Timeout apos 300s"

Aumente o timeout no request:

```json
{
  "prompt": "...",
  "timeout": 600
}
```

### Logs do servidor

```bash
# Aumentar verbosidade
export GEMINI_CLI_LOG_LEVEL=DEBUG
python server.py
```

## Licenca

MIT
