from google.adk.agents import Agent
from pathlib import Path
import sys

current_dir = Path(__file__).parent
adk_agents_dir = current_dir.parent.parent
sys.path.append(str(adk_agents_dir))

from frontend_agent.tools import read_file, write_file, list_directory, run_shell_command

knowledge_path = current_dir.parent / "knowledge.md"
knowledge = ""
if knowledge_path.exists():
    knowledge = knowledge_path.read_text(encoding="utf-8")

instruction = f"""
You are an expert Tauri and Rust backend developer.
You are responsible for implementing backend features and system integrations for the HotCocoa application.

Your knowledge base includes:
{knowledge}

You have access to the file system tools to read, write, and list files.
You can also run shell commands.

When asked to implement a plan, follow it step-by-step.
"""

root_agent = Agent(
    name="tauri_backend_agent",
    model="gemini-3-pro-preview",
    instruction=instruction,
    tools=[read_file, write_file, list_directory, run_shell_command]
)
