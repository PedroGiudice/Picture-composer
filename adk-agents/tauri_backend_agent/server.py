#!/usr/bin/env python3
"""
Tauri Backend Agent Server - FastAPI server na porta 8004.

Agente especializado em desenvolvimento backend Rust para apps Tauri.
Foca em commands seguros, error handling, e integracao com frontend.

Endpoints:
    GET  /health      - Status do servidor
    POST /invoke      - Invocar agente para tarefas backend
    POST /review      - Revisar codigo Rust

Uso:
    python server.py
    # ou
    uvicorn server:app --host 0.0.0.0 --port 8004
"""

import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import TauriBackendAgentConfig, default_config
from frontend_agent.tools import read_file, write_file, list_directory, run_shell_command
from frontend_agent.agent import FrontendDeveloperAgent


# ============================================================================
# Configuracao e Logging
# ============================================================================

config = TauriBackendAgentConfig.from_env()

logging.basicConfig(
    level=getattr(logging, config.log_level.upper()),
    format="[%(asctime)s] %(name)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("TauriBackendAgent")


# ============================================================================
# Knowledge Base
# ============================================================================

AGENT_INSTRUCTION = """
Voce e um desenvolvedor Rust especializado em backends Tauri.
Sua missao e criar commands eficientes, seguros e bem tipados.

## Stack Tecnico
- Tauri 2.x
- Rust stable
- tauri-specta para geracao de types
- thiserror para error handling

## Regras de Commands

### Assinatura Correta
```rust
// CORRETO: Result com error serializavel
#[tauri::command]
async fn process_file(path: String) -> Result<ProcessedData, AppError> {
    // ...
}

// INCORRETO: Panic possivel
#[tauri::command]
fn process_file(path: String) -> String {
    std::fs::read_to_string(&path).unwrap() // PANIC!
}
```

### Error Handling Obrigatorio
```rust
use thiserror::Error;
use serde::Serialize;

#[derive(Debug, Error, Serialize)]
pub enum AppError {
    #[error("File not found: {0}")]
    FileNotFound(String),
    #[error("Processing failed: {0}")]
    ProcessingError(String),
    #[error("Permission denied")]
    PermissionDenied,
}
```

## Checklist Pre-Entrega
- Todos os commands retornam Result?
- Errors implementam Serialize?
- Async para operacoes I/O?
- Nenhum unwrap() em paths de usuario?
- Nenhum panic possivel em runtime?
- Paths validados (nao aceitar "../")?

## Anti-Patterns
- ERRADO: `.unwrap()` em input de usuario
- ERRADO: `anyhow::Result` direto (nao serializavel)
- ERRADO: `vec[index]` sem bounds check
"""


# ============================================================================
# Modelos Pydantic
# ============================================================================

class InvokeRequest(BaseModel):
    """Request para /invoke endpoint."""

    task: str = Field(..., description="Tarefa de desenvolvimento Rust/Tauri")
    files: Optional[list[str]] = Field(
        default=None,
        description="Arquivos para contexto"
    )
    working_dir: Optional[str] = Field(
        default=None,
        description="Diretorio de trabalho (src-tauri/)"
    )


class InvokeResponse(BaseModel):
    """Response do /invoke endpoint."""

    success: bool
    output: str
    files_modified: Optional[list[str]] = None
    error: Optional[str] = None


class ReviewRequest(BaseModel):
    """Request para /review endpoint."""

    files: list[str] = Field(..., description="Arquivos Rust para revisar")
    focus: Optional[str] = Field(
        default=None,
        description="Foco da revisao (error-handling, security, performance)"
    )


class ReviewResponse(BaseModel):
    """Response do /review endpoint."""

    success: bool
    review: str
    issues: list[dict]
    approved: bool


class HealthResponse(BaseModel):
    """Response do /health endpoint."""

    status: str
    agent: str
    port: int
    model: str
    tools_available: list[str]


# ============================================================================
# Aplicacao FastAPI
# ============================================================================

# Agente global
agent: Optional[FrontendDeveloperAgent] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle do servidor."""
    global agent

    logger.info("=" * 60)
    logger.info("TAURI BACKEND AGENT SERVER - Iniciando...")
    logger.info("=" * 60)
    logger.info(f"Porta: {config.port}")
    logger.info(f"Modelo: {config.default_model}")

    try:
        from frontend_agent.config import FrontendConfig
        agent_config = FrontendConfig(model_name=config.default_model)
        agent = FrontendDeveloperAgent(agent_config)
        logger.info("Agente google-genai inicializado!")
    except Exception as e:
        logger.warning(f"Falha ao inicializar agente: {e}")
        agent = None

    logger.info("=" * 60)

    yield

    if agent:
        await agent.cleanup()
    logger.info("Servidor encerrando...")


app = FastAPI(
    title="Tauri Backend Agent Server",
    description="Agente ADK especializado em backend Rust/Tauri",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Endpoints
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Verifica saude do servidor."""
    return HealthResponse(
        status="healthy",
        agent="tauri-backend-agent",
        port=config.port,
        model=config.default_model,
        tools_available=["read_file", "write_file", "list_directory", "run_shell_command"]
    )


@app.post("/invoke", response_model=InvokeResponse)
async def invoke_agent(request: InvokeRequest):
    """
    Invoca o agente para executar uma tarefa de backend Rust.

    O agente tem acesso a:
    - Leitura/escrita de arquivos Rust
    - Listagem de diretorios
    - Comandos cargo (build, check, clippy)
    """
    logger.info(f"Invoke: {request.task[:50]}...")

    if agent is None:
        return InvokeResponse(
            success=False,
            output="",
            error="Agente nao inicializado. Verifique GOOGLE_API_KEY."
        )

    try:
        task_prompt = f"""{AGENT_INSTRUCTION}

Tarefa: {request.task}
"""

        if request.files:
            context_parts = []
            for f in request.files:
                content = read_file(f)
                if not content.startswith("Error:"):
                    context_parts.append(f"--- {f} ---\n{content}")

            if context_parts:
                task_prompt += "\n\nContexto dos arquivos:\n" + "\n\n".join(context_parts)

        output = await agent.run_task(task_prompt)

        return InvokeResponse(
            success=True,
            output=output,
            files_modified=[]
        )

    except Exception as e:
        logger.exception("Erro no invoke")
        return InvokeResponse(
            success=False,
            output="",
            error=str(e)
        )


@app.post("/review", response_model=ReviewResponse)
async def review_code(request: ReviewRequest):
    """
    Revisa codigo Rust contra as regras Tauri.

    Verifica:
    - Error handling (Result, thiserror)
    - Seguranca (unwrap, panic)
    - Performance (async I/O)
    """
    logger.info(f"Review: {len(request.files)} arquivos")

    issues = []

    for filepath in request.files:
        content = read_file(filepath)
        if content.startswith("Error:"):
            continue

        # Verificar anti-patterns Rust
        anti_patterns = [
            (".unwrap()", "CRITICO: Usar ? operator ou match em vez de unwrap"),
            (".expect(", "IMPORTANTE: Considerar error handling apropriado"),
            ("panic!(", "CRITICO: Evitar panic em commands"),
            ("anyhow::Result", "IMPORTANTE: Usar custom error type serializavel"),
            ("vec[", "IMPORTANTE: Usar .get() com bounds check"),
            ("\"../", "CRITICO: Possivel path traversal - validar paths"),
        ]

        for pattern, message in anti_patterns:
            if pattern in content:
                # Contar ocorrencias
                count = content.count(pattern)
                issues.append({
                    "file": filepath,
                    "pattern": pattern,
                    "count": count,
                    "severity": "CRITICO" if "CRITICO" in message else "IMPORTANTE",
                    "message": message
                })

    approved = len([i for i in issues if i["severity"] == "CRITICO"]) == 0

    review_text = f"""
## Review de Codigo Backend Rust/Tauri

Arquivos analisados: {len(request.files)}
Issues encontradas: {len(issues)}
Status: {"APROVADO" if approved else "REPROVADO - Corrigir issues CRITICOS"}

### Issues:
"""
    for issue in issues:
        review_text += f"\n- [{issue['severity']}] {issue['file']}: {issue['message']} ({issue.get('count', 1)}x)"

    return ReviewResponse(
        success=True,
        review=review_text,
        issues=issues,
        approved=approved
    )


@app.get("/")
async def root():
    """Redirect para /health."""
    return {
        "message": "Tauri Backend Agent Server",
        "health": "/health",
        "invoke": "/invoke",
        "review": "/review"
    }


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "server:app",
        host=config.host,
        port=config.port,
        reload=False,
        log_level=config.log_level.lower()
    )
