"""
Gemini CLI Agent - Invoca o Gemini CLI via subprocess.

Este pacote fornece um agente ADK que invoca obrigatoriamente o comando
`gemini` CLI, sem fallback para API alternativa.
"""

from .agent import GeminiCliAgent
from .tools import invoke_gemini_cli
from .validation import validate_gemini_cli

__all__ = ["GeminiCliAgent", "invoke_gemini_cli", "validate_gemini_cli"]
