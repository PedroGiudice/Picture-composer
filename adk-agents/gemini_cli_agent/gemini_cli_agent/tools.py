"""
Tools para invocacao do Gemini CLI via subprocess.

Este modulo contem as funcoes que invocam diretamente o comando `gemini`
sem fallback para API alternativa.
"""

import subprocess
import os
from typing import Optional


def invoke_gemini_cli(
    prompt: str,
    files: Optional[list[str]] = None,
    model: str = "gemini-2.5-flash",
    timeout: int = 300,
    working_dir: Optional[str] = None
) -> dict:
    """
    Invoca o Gemini CLI com o prompt e arquivos especificados.

    Args:
        prompt: O prompt/instrucao para o Gemini.
        files: Lista opcional de paths de arquivos para incluir no contexto.
        model: Modelo Gemini a usar (default: gemini-2.5-flash).
        timeout: Timeout em segundos (default: 300 = 5 minutos).
        working_dir: Diretorio de trabalho para execucao (default: cwd).

    Returns:
        Dict com:
            - success: bool
            - output: str (stdout do CLI)
            - error: str (stderr, se houver)
            - return_code: int
            - command: str (comando executado, para debug)

    Raises:
        subprocess.TimeoutExpired: Se exceder o timeout.
        FileNotFoundError: Se o CLI nao estiver disponivel.
    """
    # Construir comando
    # Flags:
    #   -y: Auto-confirm (nao interativo)
    #   -m: Modelo
    cmd = ["gemini", "-y", "-m", model]

    # Adicionar arquivos primeiro (como contexto)
    if files:
        for f in files:
            # Validar que arquivo existe
            file_path = os.path.join(working_dir or ".", f) if not os.path.isabs(f) else f
            if os.path.exists(file_path):
                cmd.append(file_path)
            else:
                # Avisar mas nao falhar - deixar o Gemini decidir
                pass

    # Prompt vai por ultimo
    cmd.append(prompt)

    # Executar
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=working_dir
        )

        return {
            "success": result.returncode == 0,
            "output": result.stdout,
            "error": result.stderr if result.returncode != 0 else "",
            "return_code": result.returncode,
            "command": " ".join(cmd)
        }

    except subprocess.TimeoutExpired as e:
        return {
            "success": False,
            "output": e.stdout or "" if hasattr(e, 'stdout') else "",
            "error": f"Timeout apos {timeout}s",
            "return_code": -1,
            "command": " ".join(cmd)
        }
    except FileNotFoundError:
        return {
            "success": False,
            "output": "",
            "error": "Gemini CLI nao encontrado. Execute a validacao de startup.",
            "return_code": -2,
            "command": " ".join(cmd)
        }


def invoke_gemini_cli_streaming(
    prompt: str,
    files: Optional[list[str]] = None,
    model: str = "gemini-2.5-flash",
    working_dir: Optional[str] = None
):
    """
    Invoca o Gemini CLI e retorna um generator para streaming de output.

    Yields:
        Linhas de output do Gemini conforme sao produzidas.
    """
    cmd = ["gemini", "-y", "-m", model]

    if files:
        for f in files:
            file_path = os.path.join(working_dir or ".", f) if not os.path.isabs(f) else f
            if os.path.exists(file_path):
                cmd.append(file_path)

    cmd.append(prompt)

    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        cwd=working_dir
    )

    for line in process.stdout:
        yield line

    process.wait()


# Tool declaration para ADK (formato google-genai)
GEMINI_CLI_TOOL_DECLARATION = {
    "name": "invoke_gemini_cli",
    "description": (
        "Invoca o Gemini CLI para processar prompts com arquivos opcionais. "
        "Use para analise de codigo, geracao de texto, e tarefas que requerem "
        "o modelo Gemini com contexto de arquivos locais."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "prompt": {
                "type": "string",
                "description": "O prompt ou instrucao para o Gemini processar."
            },
            "files": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Lista de paths de arquivos para incluir como contexto."
            },
            "model": {
                "type": "string",
                "description": "Modelo Gemini (default: gemini-2.5-flash).",
                "enum": [
                    "gemini-2.5-flash",
                    "gemini-2.5-pro",
                    "gemini-2.0-flash",
                    "gemini-1.5-flash",
                    "gemini-1.5-pro"
                ]
            }
        },
        "required": ["prompt"]
    }
}
