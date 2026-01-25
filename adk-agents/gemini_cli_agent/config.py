"""
Configuracao do Gemini CLI Agent Server.
"""

import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class GeminiCliServerConfig:
    """Configuracao do servidor ADK para Gemini CLI."""

    # Servidor
    host: str = "0.0.0.0"
    port: int = 8002

    # Gemini CLI
    default_model: str = "gemini-2.5-flash"
    default_timeout: int = 300  # 5 minutos
    working_dir: Optional[str] = None

    # Logging
    log_level: str = "INFO"

    # Modelos permitidos
    allowed_models: list[str] = field(default_factory=lambda: [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
    ])

    @classmethod
    def from_env(cls) -> "GeminiCliServerConfig":
        """Cria configuracao a partir de variaveis de ambiente."""
        return cls(
            host=os.getenv("GEMINI_CLI_HOST", "0.0.0.0"),
            port=int(os.getenv("GEMINI_CLI_PORT", "8002")),
            default_model=os.getenv("GEMINI_CLI_MODEL", "gemini-2.5-flash"),
            default_timeout=int(os.getenv("GEMINI_CLI_TIMEOUT", "300")),
            working_dir=os.getenv("GEMINI_CLI_WORKDIR"),
            log_level=os.getenv("GEMINI_CLI_LOG_LEVEL", "INFO"),
        )


# Configuracao padrao
default_config = GeminiCliServerConfig()
