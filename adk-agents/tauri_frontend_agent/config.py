"""
Configuracao do Tauri Frontend Agent Server.
"""

import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class TauriFrontendAgentConfig:
    """Configuracao do servidor ADK para Tauri Frontend."""

    # Servidor
    host: str = "0.0.0.0"
    port: int = 8003

    # Modelo
    default_model: str = "gemini-2.5-flash"
    max_iterations: int = 20

    # Working directory
    working_dir: Optional[str] = None

    # Logging
    log_level: str = "INFO"

    # Tools permitidas
    allowed_commands: list[str] = field(default_factory=lambda: [
        "ls", "cat", "echo", "mkdir", "pwd",
        "bun", "npm", "node", "npx",
        "tsc", "eslint", "prettier",
        "jest", "vitest",
    ])

    @classmethod
    def from_env(cls) -> "TauriFrontendAgentConfig":
        """Cria configuracao a partir de variaveis de ambiente."""
        return cls(
            host=os.getenv("TAURI_FRONTEND_HOST", "0.0.0.0"),
            port=int(os.getenv("TAURI_FRONTEND_PORT", "8003")),
            default_model=os.getenv("TAURI_FRONTEND_MODEL", "gemini-2.5-flash"),
            max_iterations=int(os.getenv("TAURI_FRONTEND_MAX_ITER", "20")),
            working_dir=os.getenv("TAURI_FRONTEND_WORKDIR"),
            log_level=os.getenv("TAURI_FRONTEND_LOG_LEVEL", "INFO"),
        )


# Configuracao padrao
default_config = TauriFrontendAgentConfig()
