"""
Frontend Agent Configuration
Centraliza configuracoes para evitar hardcoding.
"""
import os
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class FrontendConfig:
    """Configuration for the Frontend Developer Agent."""

    # Server
    host: str = "0.0.0.0"
    port: int = 8005

    # Model configuration (preferencia: gemini-2.5-pro, gemini-3-*-preview)
    model_name: str = "gemini-2.5-pro"

    # Working directory (sandbox for agent to work in)
    work_dir: Path = field(default_factory=lambda: Path("./work_env"))

    # Agent behavior limits
    max_iterations: int = 30  # Limite de turnos para evitar loops infinitos

    # Logging
    log_level: str = "INFO"

    # Session identifiers
    app_name: str = "frontend_workbench"
    user_id: str = "tech_director"
    session_id: str = "dev_session_01"

    def __post_init__(self):
        """Ensure work directory exists."""
        self.work_dir = Path(self.work_dir)
        self.work_dir.mkdir(parents=True, exist_ok=True)

    @classmethod
    def from_env(cls) -> "FrontendConfig":
        """Create config from environment variables."""
        return cls(
            host=os.getenv("FRONTEND_AGENT_HOST", "0.0.0.0"),
            port=int(os.getenv("FRONTEND_AGENT_PORT", "8005")),
            model_name=os.getenv("GEMINI_MODEL", os.getenv("FRONTEND_AGENT_MODEL", "gemini-2.5-pro")),
            work_dir=Path(os.getenv("FRONTEND_AGENT_WORKDIR", "./work_env")),
            max_iterations=int(os.getenv("FRONTEND_AGENT_MAX_ITER", "30")),
            log_level=os.getenv("FRONTEND_AGENT_LOG_LEVEL", "INFO"),
        )


# Instancia padrao
default_config = FrontendConfig()
