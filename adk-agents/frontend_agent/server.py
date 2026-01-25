#!/usr/bin/env python3
"""
Frontend Agent Server - FastAPI server na porta 8005.

Agente geral de desenvolvimento frontend React/TypeScript.
Sem dependencia de Tauri - funciona para qualquer projeto web.

Endpoints:
    GET  /health      - Status do servidor
    POST /invoke      - Invocar agente para tarefas frontend
    POST /review      - Revisar codigo frontend

Uso:
    python server.py
    # ou
    uvicorn server:app --host 0.0.0.0 --port 8005
"""

import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import FrontendConfig, default_config
from tools import read_file, write_file, list_directory, run_shell_command
from agent import FrontendDeveloperAgent


# ============================================================================
# Configuracao e Logging
# ============================================================================

config = FrontendConfig.from_env()

logging.basicConfig(
    level=getattr(logging, config.log_level.upper()),
    format="[%(asctime)s] %(name)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("FrontendAgent")


# ============================================================================
# Knowledge Base
# ============================================================================

AGENT_INSTRUCTION = """
Voce e um desenvolvedor frontend senior especializado em React e TypeScript.
Sua missao e criar UIs performantes, acessiveis e bem tipadas.

## Stack Tecnico
- React 19 + TypeScript 5.8+
- Vite ou Next.js para build
- TanStack Query para data fetching
- Tailwind CSS ou MUI para styling
- TanStack Router ou React Router

## Principios Core

### 1. Performance
- Lazy load componentes pesados
- useMemo para calculos caros
- useCallback para handlers passados a children
- React.memo para componentes folha
- Code splitting por rota

### 2. Type Safety
- TypeScript strict mode
- Nenhum `any` - usar `unknown` se necessario
- Interfaces para props e responses
- Explicit return types

### 3. Data Fetching
- TanStack Query (useSuspenseQuery preferido)
- Suspense boundaries para loading states
- Error boundaries para error handling
- Cache-first approach

### 4. Acessibilidade
- Semantic HTML
- ARIA labels onde necessario
- Focus states visiveis
- Keyboard navigation
- Color contrast adequado

### 5. Organizacao
- Features isoladas em diretorios
- Hooks customizados para logica compartilhada
- Componentes pequenos e focados
- Imports com aliases (@/, ~)

## Estrutura de Feature
```
features/name/
  api/           # Queries e mutations
  components/    # Componentes da feature
  hooks/         # Hooks customizados
  types/         # Tipos da feature
  index.ts       # Public API
```

## Checklist Pre-Entrega
- TypeScript sem erros (`npm run typecheck`)?
- Lint passando (`npm run lint`)?
- Componentes acessiveis?
- Loading/error states implementados?
- Nenhum `any` no codigo?
- Memo/callback onde necessario?
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
        description="Foco (typescript, performance, accessibility)"
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
    logger.info("FRONTEND AGENT SERVER - Iniciando...")
    logger.info("=" * 60)
    logger.info(f"Porta: {config.port}")
    logger.info(f"Modelo: {config.model_name}")

    # Inicializar agente
    try:
        agent = FrontendDeveloperAgent(config)
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
    title="Frontend Agent Server",
    description="Agente ADK geral para desenvolvimento frontend React/TypeScript",
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
        agent="frontend-agent",
        port=config.port,
        model=config.model_name,
        tools_available=["read_file", "write_file", "list_directory", "run_shell_command"]
    )


@app.post("/invoke", response_model=InvokeResponse)
async def invoke_agent(request: InvokeRequest):
    """
    Invoca o agente para executar uma tarefa frontend.

    O agente tem acesso a:
    - Leitura/escrita de arquivos
    - Listagem de diretorios
    - Comandos npm/bun (build, test, lint)
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
        # Construir prompt com contexto de arquivos
        task_prompt = request.task

        if request.files:
            context_parts = []
            for f in request.files:
                content = read_file(f)
                if not content.startswith("Error:"):
                    context_parts.append(f"--- {f} ---\n{content}")

            if context_parts:
                task_prompt = f"{request.task}\n\nContexto dos arquivos:\n" + "\n\n".join(context_parts)

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
    Revisa codigo frontend.

    Verifica:
    - TypeScript (any, tipos)
    - Performance (memo, callback)
    - Acessibilidade (ARIA, semantics)
    """
    logger.info(f"Review: {len(request.files)} arquivos")

    issues = []

    for filepath in request.files:
        content = read_file(filepath)
        if content.startswith("Error:"):
            continue

        # Verificar patterns
        patterns = [
            (": any", "IMPORTANTE: Remover tipo any"),
            ("as any", "CRITICO: Remover cast para any"),
            ("// @ts-ignore", "IMPORTANTE: Resolver erro TypeScript"),
            ("// @ts-expect-error", "IMPORTANTE: Documentar razao do expect-error"),
            ("useEffect(() =>", "SUGESTAO: Verificar dependencias do useEffect"),
            ("console.log", "SUGESTAO: Remover console.log antes de prod"),
        ]

        for pattern, message in patterns:
            if pattern in content:
                count = content.count(pattern)
                severity = "CRITICO" if "CRITICO" in message else "IMPORTANTE" if "IMPORTANTE" in message else "SUGESTAO"
                issues.append({
                    "file": filepath,
                    "pattern": pattern,
                    "count": count,
                    "severity": severity,
                    "message": message
                })

    approved = len([i for i in issues if i["severity"] == "CRITICO"]) == 0

    review_text = f"""
## Review de Codigo Frontend

Arquivos analisados: {len(request.files)}
Issues encontradas: {len(issues)}
Status: {"APROVADO" if approved else "REPROVADO"}

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
        "message": "Frontend Agent Server",
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
