# Tauri Backend Agent

Agente ADK especializado em desenvolvimento backend Rust para apps Tauri.

## Stack Suportado

- Tauri 2.x
- Rust stable
- tauri-specta
- thiserror

## Quick Start

```bash
# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
python server.py

# Health check
curl http://localhost:8004/health
```

## Endpoints

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/health` | Status do servidor |
| POST | `/invoke` | Executar tarefa Rust |
| POST | `/review` | Revisar codigo |

## Exemplos

### Invocar Tarefa

```bash
curl -X POST http://localhost:8004/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Criar command para salvar arquivo com error handling",
    "files": ["src-tauri/src/commands/mod.rs"]
  }'
```

### Revisar Codigo

```bash
curl -X POST http://localhost:8004/review \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["src-tauri/src/commands/file.rs"],
    "focus": "error-handling"
  }'
```

## Regras do Agente

### Commands Corretos
```rust
// CORRETO
#[tauri::command]
async fn save_file(path: String) -> Result<(), AppError> {
    tokio::fs::write(&path, data).await?;
    Ok(())
}

// ERRADO
#[tauri::command]
fn save_file(path: String) {
    std::fs::write(&path, data).unwrap(); // PANIC!
}
```

### Error Handling
```rust
#[derive(Debug, thiserror::Error, serde::Serialize)]
pub enum AppError {
    #[error("File not found: {0}")]
    FileNotFound(String),
}
```

## Checklist
- Todos commands retornam Result?
- Errors implementam Serialize?
- Async para I/O?
- Nenhum unwrap()?
- Paths validados?

## Configuracao

```bash
export TAURI_BACKEND_HOST=0.0.0.0
export TAURI_BACKEND_PORT=8004
export TAURI_BACKEND_MODEL=gemini-2.5-flash
export TAURI_BACKEND_LOG_LEVEL=INFO
```

## Estrutura

```
tauri_backend_agent/
├── tauri_backend_agent/    # Pacote Python
│   ├── __init__.py
│   └── agent.py            # Agent ADK
├── server.py               # FastAPI server
├── config.py               # Configuracao
├── knowledge.md            # Knowledge base
├── requirements.txt
└── README.md
```
