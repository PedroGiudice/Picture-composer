"""
Fail-Fast Validation para o Gemini CLI.

Valida que o comando `gemini` esta disponivel no sistema.
Se nao encontrar, levanta RuntimeError e encerra com SystemExit(1).
"""

import shutil
import subprocess
import sys
from typing import NamedTuple


class GeminiCliInfo(NamedTuple):
    """Informacoes sobre o Gemini CLI instalado."""

    path: str
    version: str


def validate_gemini_cli() -> GeminiCliInfo:
    """
    Valida que o Gemini CLI esta disponivel.

    Returns:
        GeminiCliInfo com path e versao do CLI.

    Raises:
        RuntimeError: Se o CLI nao estiver disponivel.
        SystemExit: Termina o processo se validacao falhar.
    """
    # Verificar se o comando existe
    gemini_path = shutil.which("gemini")

    if not gemini_path:
        error_msg = (
            "FAIL-FAST: Gemini CLI nao encontrado no sistema.\n"
            "Instale com: pip install google-genai-cli\n"
            "Ou: https://github.com/google/genai-cli"
        )
        print(f"ERROR: {error_msg}", file=sys.stderr)
        raise RuntimeError(error_msg)

    # Obter versao
    try:
        result = subprocess.run(
            [gemini_path, "--version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        version = result.stdout.strip() or result.stderr.strip() or "unknown"
    except subprocess.TimeoutExpired:
        version = "timeout"
    except Exception as e:
        version = f"error: {e}"

    cli_info = GeminiCliInfo(path=gemini_path, version=version)

    print(f"Gemini CLI validado: {cli_info.path} (versao: {cli_info.version})")

    return cli_info


def fail_fast_on_startup() -> GeminiCliInfo:
    """
    Wrapper para usar no startup do servidor.
    Encerra o processo se o CLI nao estiver disponivel.

    Returns:
        GeminiCliInfo se validacao passar.
    """
    try:
        return validate_gemini_cli()
    except RuntimeError:
        sys.exit(1)
