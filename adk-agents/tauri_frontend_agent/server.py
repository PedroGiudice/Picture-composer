#!/usr/bin/env python3
"""
Tauri Frontend Agent Server - FastAPI server na porta 8003.

Agente especializado em desenvolvimento frontend para apps Tauri.
Usa React 19, TypeScript, TanStack Query, e APIs nativas Tauri.

Endpoints:
    GET  /health      - Status do servidor
    POST /invoke      - Invocar agente para tarefas frontend
    POST /review      - Revisar codigo frontend

Uso:
    python server.py
    # ou
    uvicorn server:app --host 0.0.0.0 --port 8003
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

from config import TauriFrontendAgentConfig, default_config
from frontend_agent.tools import read_file, write_file, list_directory, run_shell_command
from frontend_agent.agent import FrontendDeveloperAgent


# ============================================================================
# Configuracao e Logging
# ============================================================================

config = TauriFrontendAgentConfig.from_env()

logging.basicConfig(
    level=getattr(logging, config.log_level.upper()),
    format="[%(asctime)s] %(name)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("TauriFrontendAgent")


# ============================================================================
# Knowledge Base
# ============================================================================

AGENT_INSTRUCTION = """
Voce e um desenvolvedor frontend especializado em apps Tauri.
Sua missao e criar UIs que aproveitam 100% das capacidades desktop/nativas.

## Stack Tecnico
- Tauri 2.x (plugins @tauri-apps/plugin-*)
- React 19 + TypeScript 5.8+
- Vite 6.x para build
- TanStack Query para data fetching (OBRIGATORIO)
- Tailwind CSS 4.x
- tauri-specta para IPC type-safe

## Regras ABSOLUTAS

### NUNCA Fazer
- Usar `<input type="file">` (sempre `dialog.open()`)
- Usar `localStorage` (sempre `store` plugin)
- Usar `alert()` (sempre `notification` plugin)
- Usar `window.open()` (sempre `shell.open()`)
- Fazer fetch direto (sempre TanStack Query)
- Usar `any` em tipos

### SEMPRE Fazer
- Usar APIs nativas para file, clipboard, notification
- Usar TanStack Query para data fetching
- Implementar hover states e keyboard shortcuts
- Type-safe IPC via tauri-specta
- Focus states visiveis para acessibilidade

## Checklist Pre-Entrega
- Todas as interacoes de arquivo usam dialog/fs plugins?
- Data fetching usa TanStack Query?
- Keyboard shortcuts implementados?
- Hover states funcionais?
- Nenhum `any` em tipos?
- TypeScript sem erros?
"""


# ============================================================================
# Modelos Pydantic
# ============================================================================

class InvokeRequest(BaseModel):
    """Request para /invoke endpoint."""

    task: str = Field(..., description="Tarefa de desenvolvimento frontend")
    files: Optional[list[str]] = Field(
        default=None,
        description="Arquivos para contexto"
    )
    working_dir: Optional[str] = Field(
        default=None,
        description="Diretorio de trabalho"
    )


class InvokeResponse(BaseModel):
    """Response do /invoke endpoint."""

    success: bool
    output: str
    files_modified: Optional[list[str]] = None
    error: Optional[str] = None


class ReviewRequest(BaseModel):
    """Request para /review endpoint."""

    files: list[str] = Field(..., description="Arquivos para revisar")
    focus: Optional[str] = Field(
        default=None,
        description="Foco da revisao (native-apis, typescript, performance)"
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
# Tools Wrapper
# ============================================================================

def execute_tool(tool_name: str, args: dict, working_dir: Optional[str] = None) -> str:
    """Executa uma tool com os argumentos fornecidos."""
    import os

    original_cwd = os.getcwd()

    try:
        if working_dir:
            os.chdir(working_dir)

        if tool_name == "read_file":
            return read_file(args.get("filepath", ""))
        elif tool_name == "write_file":
            return write_file(args.get("filepath", ""), args.get("content", ""))
        elif tool_name == "list_directory":
            result = list_directory(args.get("directory", "."), args.get("pattern", "*"))
            return "\n".join(result) if isinstance(result, list) else str(result)
        elif tool_name == "run_shell_command":
            return run_shell_command(args.get("command", ""))
        else:
            return f"Unknown tool: {tool_name}"
    finally:
        os.chdir(original_cwd)


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
    logger.info("TAURI FRONTEND AGENT SERVER - Iniciando...")
    logger.info("=" * 60)
    logger.info(f"Porta: {config.port}")
    logger.info(f"Modelo: {config.default_model}")

    # Inicializar agente com instrucoes Tauri
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
    title="Tauri Frontend Agent Server",
    description="Agente ADK especializado em frontend Tauri/React",
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
        agent="tauri-frontend-agent",
        port=config.port,
        model=config.default_model,
        tools_available=["read_file", "write_file", "list_directory", "run_shell_command"]
    )


@app.post("/invoke", response_model=InvokeResponse)
async def invoke_agent(request: InvokeRequest):
    """
    Invoca o agente para executar uma tarefa de frontend Tauri.

    O agente tem acesso a:
    - Leitura/escrita de arquivos
    - Listagem de diretorios
    - Comandos shell (npm, bun, tsc, etc.)
    """
    logger.info(f"Invoke: {request.task[:50]}...")

    # Verificar se agente esta disponivel
    if agent is None:
        return InvokeResponse(
            success=False,
            output="",
            error="Agente nao inicializado. Verifique GOOGLE_API_KEY."
        )

    try:
        # Construir prompt com instrucoes Tauri + contexto
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

        # Executar via google-genai
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
    Revisa codigo frontend contra as regras Tauri.

    Verifica:
    - Uso de APIs nativas vs web
    - Type safety
    - Performance patterns
    """
    logger.info(f"Review: {len(request.files)} arquivos")

    issues = []

    for filepath in request.files:
        content = read_file(filepath)
        if content.startswith("Error:"):
            continue

        # Verificar anti-patterns
        anti_patterns = [
            ("input type=\"file\"", "CRITICO: Usar dialog.open() em vez de input file"),
            ("localStorage", "CRITICO: Usar @tauri-apps/plugin-store"),
            ("alert(", "CRITICO: Usar @tauri-apps/plugin-notification"),
            ("window.open(", "CRITICO: Usar shell.open()"),
            (": any", "IMPORTANTE: Remover tipo any"),
        ]

        for pattern, message in anti_patterns:
            if pattern in content:
                issues.append({
                    "file": filepath,
                    "pattern": pattern,
                    "severity": "CRITICO" if "CRITICO" in message else "IMPORTANTE",
                    "message": message
                })

    approved = len([i for i in issues if i["severity"] == "CRITICO"]) == 0

    review_text = f"""
## Review de Codigo Frontend Tauri

Arquivos analisados: {len(request.files)}
Issues encontradas: {len(issues)}
Status: {"APROVADO" if approved else "REPROVADO - Corrigir issues CRITICOS"}

### Issues:
"""
    for issue in issues:
        review_text += f"\n- [{issue['severity']}] {issue['file']}: {issue['message']}"

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
        "message": "Tauri Frontend Agent Server",
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
