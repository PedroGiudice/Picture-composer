"""
Configuracao do Tauri Backend Agent Server.
"""

import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class TauriBackendAgentConfig:
    """Configuracao do servidor ADK para Tauri Backend (Rust)."""

    # Servidor
    host: str = "0.0.0.0"
    port: int = 8004

    # Modelo
    default_model: str = "gemini-2.5-flash"
    max_iterations: int = 20

    # Working directory
    working_dir: Optional[str] = None

    # Logging
    log_level: str = "INFO"

    # Comandos Rust permitidos
    allowed_commands: list[str] = field(default_factory=lambda: [
        "ls", "cat", "echo", "mkdir", "pwd",
        "cargo", "rustc", "rustfmt", "clippy",
    ])

    @classmethod
    def from_env(cls) -> "TauriBackendAgentConfig":
        """Cria configuracao a partir de variaveis de ambiente."""
        return cls(
            host=os.getenv("TAURI_BACKEND_HOST", "0.0.0.0"),
            port=int(os.getenv("TAURI_BACKEND_PORT", "8004")),
            default_model=os.getenv("TAURI_BACKEND_MODEL", "gemini-2.5-flash"),
            max_iterations=int(os.getenv("TAURI_BACKEND_MAX_ITER", "20")),
            working_dir=os.getenv("TAURI_BACKEND_WORKDIR"),
            log_level=os.getenv("TAURI_BACKEND_LOG_LEVEL", "INFO"),
        )


# Configuracao padrao
default_config = TauriBackendAgentConfig()
