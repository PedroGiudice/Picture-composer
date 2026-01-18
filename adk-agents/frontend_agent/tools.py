"""
Frontend Agent Tools
Implementacao Python das ferramentas (File System + Stubs MCP).

O ADK precisa de funcoes Python reais. Implementamos:
- File System Tools (core capability)
- MCP Tool Stubs (placeholders para servicos externos)
"""
import os
import glob
import subprocess
from pathlib import Path
from typing import List


# =============================================================================
# FILE SYSTEM TOOLS (Core Capability)
# =============================================================================


def read_file(filepath: str) -> str:
    """
    Reads the content of a file. Use this to understand code context.

    Args:
        filepath: Path to the file to read (relative or absolute)

    Returns:
        File content as string, or error message if failed
    """
    try:
        path = Path(filepath)
        if not path.exists():
            return f"Error: File {filepath} does not exist."
        if not path.is_file():
            return f"Error: {filepath} is not a file."
        return path.read_text(encoding="utf-8")
    except PermissionError:
        return f"Error: Permission denied reading {filepath}"
    except Exception as e:
        return f"Error reading file: {str(e)}"


def write_file(filepath: str, content: str) -> str:
    """
    Writes content to a file. Creates directories if they don't exist.

    Args:
        filepath: Path where to write the file
        content: Content to write

    Returns:
        Success message or error message
    """
    try:
        path = Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return f"Success: File written to {filepath}"
    except PermissionError:
        return f"Error: Permission denied writing to {filepath}"
    except Exception as e:
        return f"Error writing file: {str(e)}"


def list_files(directory: str = ".", pattern: str = "*") -> List[str]:
    """
    Lists files in a directory matching a pattern (glob).

    Args:
        directory: Directory to search in (default: current)
        pattern: Glob pattern to match (e.g., "*.tsx", "**/*.ts")

    Returns:
        List of matching file paths (max 50 results)
    """
    try:
        search_path = os.path.join(directory, pattern)
        # Recursive search if pattern includes **
        recursive = "**" in pattern
        files = glob.glob(search_path, recursive=recursive)
        # Filter only files (not directories) and limit results
        result = [f for f in files if os.path.isfile(f)][:50]
        if not result:
            return [f"No files found matching {pattern} in {directory}"]
        return result
    except Exception as e:
        return [f"Error listing files: {str(e)}"]


def run_shell_command(command: str) -> str:
    """
    Executes a shell command (e.g., npm test, bun build).
    CAUTION: Restricted to whitelisted commands for security.

    Args:
        command: Shell command to execute

    Returns:
        Command output or error message
    """
    # Security: Whitelist of allowed command prefixes
    allowed_prefixes = [
        "ls",
        "cat",
        "echo",
        "mkdir",
        "pwd",
        "bun",
        "npm",
        "node",
        "npx",
        "tsc",
        "eslint",
        "prettier",
        "jest",
        "vitest",
    ]

    cmd_parts = command.strip().split()
    if not cmd_parts:
        return "Error: Empty command"

    cmd_name = cmd_parts[0]
    if not any(cmd_name == prefix or cmd_name.startswith(prefix + " ") for prefix in allowed_prefixes):
        return f"Error: Command '{cmd_name}' not allowed for security reasons. Allowed: {', '.join(allowed_prefixes)}"

    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=60,  # 60 second timeout
            cwd=os.getcwd(),
        )
        output = result.stdout
        if result.stderr:
            output += f"\n[STDERR]: {result.stderr}"
        if result.returncode != 0:
            output += f"\n[Exit code: {result.returncode}]"
        return output if output.strip() else "Success (no output)"
    except subprocess.TimeoutExpired:
        return "Error: Command timed out after 60 seconds"
    except Exception as e:
        return f"Error executing command: {str(e)}"


# =============================================================================
# MCP TOOL STUBS (Placeholders for External Services)
# =============================================================================
# NOTE: Connect these to your actual MCP clients (FastMCP or HTTP) if needed.
# For now, the agent will use these signatures and receive mock responses.


def mcp_magic_component_builder(description: str, style_guide: str = "default") -> str:
    """
    [MCP STUB] Generates a UI component structure based on description.
    In a real scenario, this calls the '21st.dev Magic' service.

    Args:
        description: Natural language description of the component
        style_guide: Style guide to follow (default, minimal, corporate)

    Returns:
        Generated component structure or mock response
    """
    # TODO: Connect to actual MCP magic service
    return f"[MOCK] Generated component structure for: {description} using {style_guide} style. Connect to MCP for real implementation."


def mcp_playwright_snapshot(url: str) -> str:
    """
    [MCP STUB] Takes a snapshot of a URL for visual verification.
    In a real scenario, this calls Playwright via MCP.

    Args:
        url: URL to take snapshot of

    Returns:
        Snapshot result or mock response
    """
    # TODO: Connect to actual Playwright MCP service
    return f"[MOCK] Snapshot taken for {url}. Visual regression clear. Connect to MCP for real implementation."


def mcp_browser_navigate(url: str) -> str:
    """
    [MCP STUB] Navigates browser to URL for testing.

    Args:
        url: URL to navigate to

    Returns:
        Navigation result or mock response
    """
    # TODO: Connect to actual browser MCP service
    return f"[MOCK] Navigated to {url}. Connect to MCP for real implementation."


# =============================================================================
# EXPORT LIST FOR ADK AGENT
# =============================================================================

FRONTEND_TOOLS = [
    # Core File System
    read_file,
    write_file,
    list_files,
    run_shell_command,
    # MCP Stubs (to be connected later)
    mcp_magic_component_builder,
    mcp_playwright_snapshot,
    mcp_browser_navigate,
]
