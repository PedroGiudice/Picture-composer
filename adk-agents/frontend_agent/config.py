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

    # Model configuration
    model_name: str = "gemini-2.5-flash"  # Otimizado para baixa latencia e function calling

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
            model_name=os.getenv("FRONTEND_AGENT_MODEL", "gemini-2.5-flash"),
            work_dir=Path(os.getenv("FRONTEND_AGENT_WORKDIR", "./work_env")),
            max_iterations=int(os.getenv("FRONTEND_AGENT_MAX_ITER", "30")),
            log_level=os.getenv("FRONTEND_AGENT_LOG_LEVEL", "INFO"),
        )


# Instancia padrao
default_config = FrontendConfig()
