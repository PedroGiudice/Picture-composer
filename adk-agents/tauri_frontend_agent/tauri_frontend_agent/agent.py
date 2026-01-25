from google.adk.agents import Agent
from pathlib import Path
import sys

current_dir = Path(__file__).parent
adk_agents_dir = current_dir.parent.parent
sys.path.append(str(adk_agents_dir))

from frontend_agent.tools import read_file, write_file, list_directory, run_shell_command

instruction = """
You are an expert Tauri and React frontend developer.
You are responsible for implementing frontend features for the HotCocoa application.

IMPORTANT: Before starting any task, read the 'knowledge.md' file in your directory to understand the project structure and patterns.
Use your tools to read, write, and list files.
Follow plans step-by-step.
"""

root_agent = Agent(
    name="tauri_frontend_agent",
    model="gemini-3-pro-preview",
    instruction=instruction,
    tools=[read_file, write_file, list_directory, run_shell_command]
)