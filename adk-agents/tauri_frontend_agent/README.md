# Tauri Frontend Agent

Agente ADK especializado em desenvolvimento frontend para apps Tauri.

## Stack Suportado

- Tauri 2.x
- React 19 + TypeScript 5.8+
- Vite 6.x
- TanStack Query
- Tailwind CSS 4.x
- tauri-specta

## Quick Start

```bash
# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
python server.py

# Health check
curl http://localhost:8003/health
```

## Endpoints

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/health` | Status do servidor |
| POST | `/invoke` | Executar tarefa frontend |
| POST | `/review` | Revisar codigo |

## Exemplos

### Invocar Tarefa

```bash
curl -X POST http://localhost:8003/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Criar componente FilePicker usando dialog.open()",
    "files": ["src/components/FileUpload.tsx"]
  }'
```

### Revisar Codigo

```bash
curl -X POST http://localhost:8003/review \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["src/components/FileUpload.tsx"],
    "focus": "native-apis"
  }'
```

## Regras do Agente

### NUNCA Fazer
- `<input type="file">` - Usar `dialog.open()`
- `localStorage` - Usar `store` plugin
- `alert()` - Usar `notification` plugin
- `window.open()` - Usar `shell.open()`
- `fetch` direto - Usar TanStack Query
- Tipos `any`

### SEMPRE Fazer
- APIs nativas Tauri
- TanStack Query para data fetching
- Hover states e keyboard shortcuts
- Type-safe IPC via tauri-specta

## Configuracao

```bash
export TAURI_FRONTEND_HOST=0.0.0.0
export TAURI_FRONTEND_PORT=8003
export TAURI_FRONTEND_MODEL=gemini-2.5-flash
export TAURI_FRONTEND_LOG_LEVEL=INFO
```

## Estrutura

```
tauri_frontend_agent/
├── tauri_frontend_agent/   # Pacote Python
│   ├── __init__.py
│   └── agent.py            # Agent ADK
├── server.py               # FastAPI server
├── config.py               # Configuracao
├── knowledge.md            # Knowledge base
├── requirements.txt
└── README.md
```
