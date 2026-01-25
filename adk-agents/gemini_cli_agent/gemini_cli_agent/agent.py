"""
Gemini CLI Agent - Agent ADK que invoca o Gemini CLI.

Este agente utiliza o CLI `gemini` como backend, executando-o via subprocess.
NAO utiliza a API diretamente - todo processamento passa pelo CLI.
"""

import logging
from typing import Optional

from .tools import invoke_gemini_cli, GEMINI_CLI_TOOL_DECLARATION
from .validation import validate_gemini_cli, GeminiCliInfo


class GeminiCliAgent:
    """
    Agente que invoca o Gemini CLI para processar tasks.

    Este agente:
    - Valida o CLI no startup (fail-fast)
    - Executa prompts via subprocess
    - NAO tem fallback para API alternativa

    Usage:
        agent = GeminiCliAgent()
        result = agent.run("Analise este codigo", files=["main.py"])
        print(result)
    """

    def __init__(
        self,
        model: str = "gemini-2.5-flash",
        timeout: int = 300,
        working_dir: Optional[str] = None
    ):
        """
        Inicializa o agente.

        Args:
            model: Modelo Gemini a usar (default: gemini-2.5-flash).
            timeout: Timeout em segundos (default: 300).
            working_dir: Diretorio de trabalho (default: cwd).
        """
        self.model = model
        self.timeout = timeout
        self.working_dir = working_dir
        self.logger = logging.getLogger("GeminiCliAgent")

        # Fail-fast: valida CLI no startup
        self.cli_info: GeminiCliInfo = validate_gemini_cli()

        self.logger.info(
            f"GeminiCliAgent inicializado: model={model}, "
            f"cli_path={self.cli_info.path}, "
            f"cli_version={self.cli_info.version}"
        )

    def run(
        self,
        prompt: str,
        files: Optional[list[str]] = None,
        model: Optional[str] = None,
        timeout: Optional[int] = None
    ) -> str:
        """
        Executa um prompt via Gemini CLI.

        Args:
            prompt: O prompt/instrucao.
            files: Arquivos para incluir como contexto.
            model: Override do modelo (opcional).
            timeout: Override do timeout (opcional).

        Returns:
            Output do Gemini CLI (string).

        Raises:
            RuntimeError: Se a execucao falhar.
        """
        self.logger.info(f"Executando prompt: {prompt[:50]}...")
        if files:
            self.logger.info(f"Arquivos: {files}")

        result = invoke_gemini_cli(
            prompt=prompt,
            files=files,
            model=model or self.model,
            timeout=timeout or self.timeout,
            working_dir=self.working_dir
        )

        if result["success"]:
            self.logger.info("Execucao bem-sucedida")
            return result["output"]
        else:
            error_msg = f"Gemini CLI falhou: {result['error']}"
            self.logger.error(error_msg)
            raise RuntimeError(error_msg)

    async def run_async(
        self,
        prompt: str,
        files: Optional[list[str]] = None,
        model: Optional[str] = None,
        timeout: Optional[int] = None
    ) -> str:
        """
        Versao async de run() para compatibilidade com FastAPI.

        Nota: A execucao do subprocess ainda e sincrona, mas permite
        uso em contextos async sem bloquear o event loop por muito tempo.
        """
        import asyncio

        # Executar em thread pool para nao bloquear
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: self.run(prompt, files, model, timeout)
        )
        return result

    def get_tool_declaration(self) -> dict:
        """Retorna a declaracao da tool para uso com ADK."""
        return GEMINI_CLI_TOOL_DECLARATION

    def health_check(self) -> dict:
        """
        Verifica saude do agente.

        Returns:
            Dict com status, cli_path, cli_version.
        """
        return {
            "status": "healthy",
            "cli_path": self.cli_info.path,
            "cli_version": self.cli_info.version,
            "model": self.model,
            "timeout": self.timeout
        }
