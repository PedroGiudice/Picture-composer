#!/usr/bin/env python3
"""
Gemini CLI Agent Server - FastAPI server na porta 8002.

Endpoints:
    GET  /health      - Status do servidor e Gemini CLI
    POST /invoke      - Invocar o agente ADK
    POST /direct-cli  - Bypass do agente (CLI direto)

Uso:
    python server.py
    # ou
    uvicorn server:app --host 0.0.0.0 --port 8002
"""

import logging
import sys
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import GeminiCliServerConfig, default_config
from gemini_cli_agent import GeminiCliAgent
from gemini_cli_agent.validation import fail_fast_on_startup
from gemini_cli_agent.tools import invoke_gemini_cli


# ============================================================================
# Configuracao e Logging
# ============================================================================

config = GeminiCliServerConfig.from_env()

logging.basicConfig(
    level=getattr(logging, config.log_level.upper()),
    format="[%(asctime)s] %(name)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("GeminiCliServer")


# ============================================================================
# Modelos Pydantic
# ============================================================================

class InvokeRequest(BaseModel):
    """Request para /invoke endpoint."""

    prompt: str = Field(..., description="Prompt/instrucao para o Gemini")
    files: Optional[list[str]] = Field(
        default=None,
        description="Lista de paths de arquivos para contexto"
    )
    model: Optional[str] = Field(
        default=None,
        description="Modelo Gemini (default: gemini-2.5-flash)"
    )
    timeout: Optional[int] = Field(
        default=None,
        description="Timeout em segundos (default: 300)"
    )


class InvokeResponse(BaseModel):
    """Response do /invoke endpoint."""

    success: bool
    output: str
    error: Optional[str] = None
    model_used: str
    files_used: Optional[list[str]] = None


class DirectCliRequest(BaseModel):
    """Request para /direct-cli endpoint."""

    prompt: str
    files: Optional[list[str]] = None
    model: str = "gemini-2.5-flash"
    timeout: int = 300


class DirectCliResponse(BaseModel):
    """Response do /direct-cli endpoint."""

    success: bool
    output: str
    error: str
    return_code: int
    command: str


class HealthResponse(BaseModel):
    """Response do /health endpoint."""

    status: str
    cli_path: str
    cli_version: str
    model: str
    timeout: int
    server_port: int


# ============================================================================
# Aplicacao FastAPI
# ============================================================================

# Variavel global para o agente (inicializado no startup)
agent: Optional[GeminiCliAgent] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle do servidor - fail-fast no startup."""
    global agent

    logger.info("=" * 60)
    logger.info("GEMINI CLI ADK SERVER - Iniciando...")
    logger.info("=" * 60)

    # FAIL-FAST: Valida CLI antes de subir o servidor
    logger.info("Validando Gemini CLI (fail-fast)...")
    cli_info = fail_fast_on_startup()

    # Inicializa o agente
    agent = GeminiCliAgent(
        model=config.default_model,
        timeout=config.default_timeout,
        working_dir=config.working_dir
    )

    logger.info(f"Servidor pronto em http://{config.host}:{config.port}")
    logger.info(f"Modelo default: {config.default_model}")
    logger.info(f"CLI: {cli_info.path} (v{cli_info.version})")
    logger.info("=" * 60)

    yield

    # Cleanup
    logger.info("Servidor encerrando...")


app = FastAPI(
    title="Gemini CLI ADK Server",
    description="Servidor ADK que invoca o Gemini CLI via subprocess",
    version="1.0.0",
    lifespan=lifespan
)

# CORS para permitir chamadas de outros servicos
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
    """
    Verifica saude do servidor e Gemini CLI.

    Retorna status, path e versao do CLI.
    """
    if agent is None:
        raise HTTPException(status_code=503, detail="Agente nao inicializado")

    health = agent.health_check()
    return HealthResponse(
        status=health["status"],
        cli_path=health["cli_path"],
        cli_version=health["cli_version"],
        model=health["model"],
        timeout=health["timeout"],
        server_port=config.port
    )


@app.post("/invoke", response_model=InvokeResponse)
async def invoke_agent(request: InvokeRequest):
    """
    Invoca o agente ADK para processar um prompt.

    Este endpoint usa o GeminiCliAgent que:
    - Valida inputs
    - Executa via subprocess
    - Retorna output processado
    """
    if agent is None:
        raise HTTPException(status_code=503, detail="Agente nao inicializado")

    # Validar modelo se especificado
    model = request.model or config.default_model
    if model not in config.allowed_models:
        raise HTTPException(
            status_code=400,
            detail=f"Modelo '{model}' nao permitido. Use: {config.allowed_models}"
        )

    logger.info(f"Invoke request: prompt={request.prompt[:50]}..., model={model}")

    try:
        output = await agent.run_async(
            prompt=request.prompt,
            files=request.files,
            model=model,
            timeout=request.timeout
        )

        return InvokeResponse(
            success=True,
            output=output,
            model_used=model,
            files_used=request.files
        )

    except RuntimeError as e:
        logger.error(f"Invoke falhou: {e}")
        return InvokeResponse(
            success=False,
            output="",
            error=str(e),
            model_used=model,
            files_used=request.files
        )
    except Exception as e:
        logger.exception("Erro inesperado")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/direct-cli", response_model=DirectCliResponse)
async def direct_cli(request: DirectCliRequest):
    """
    Bypass do agente - invoca o CLI diretamente.

    Use para debug ou quando precisar de controle total sobre o comando.
    Retorna output bruto do CLI incluindo return code.
    """
    logger.info(f"Direct CLI request: prompt={request.prompt[:50]}..., model={request.model}")

    # Validar modelo
    if request.model not in config.allowed_models:
        raise HTTPException(
            status_code=400,
            detail=f"Modelo '{request.model}' nao permitido. Use: {config.allowed_models}"
        )

    result = invoke_gemini_cli(
        prompt=request.prompt,
        files=request.files,
        model=request.model,
        timeout=request.timeout,
        working_dir=config.working_dir
    )

    return DirectCliResponse(
        success=result["success"],
        output=result["output"],
        error=result["error"],
        return_code=result["return_code"],
        command=result["command"]
    )


@app.get("/")
async def root():
    """Redirect para /health."""
    return {"message": "Gemini CLI ADK Server", "health": "/health", "invoke": "/invoke"}


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
