"""
Frontend Developer Agent
Orquestra o google-genai para desenvolvimento frontend com tool execution.
"""
import logging
import json
from typing import Optional, Any

from google import genai
from google.genai import types

from config import FrontendConfig, default_config
from prompts import FRONTEND_DEV_INSTRUCTION
from tools import (
    read_file,
    write_file,
    list_directory,
    run_shell_command,
    TOOL_DECLARATIONS,
)

# Map tool names to functions
TOOL_MAP = {
    "read_file": read_file,
    "write_file": write_file,
    "list_directory": list_directory,
    "run_shell_command": run_shell_command,
}


class FrontendDeveloperAgent:
    """
    Autonomous Frontend Engineering Agent using google-genai.

    Features:
    - File system access (read, write, list)
    - Shell command execution (npm, bun, tsc, etc.)
    - Automatic tool execution loop

    Usage:
        agent = FrontendDeveloperAgent()
        result = await agent.run_task("Create a Button component")
        print(result)
    """

    def __init__(self, config: FrontendConfig = default_config):
        self.config = config
        self.logger = logging.getLogger("FrontendAgent")
        self._client: Optional[genai.Client] = None
        self._chat: Optional[Any] = None
        self._initialize()

    def _initialize(self) -> None:
        """Initialize the Gemini client."""
        self.logger.info(f"Initializing Frontend Agent with model: {self.config.model_name}")

        self._client = genai.Client()

        # Configure tools
        self._tools = types.Tool(function_declarations=TOOL_DECLARATIONS)

        self.logger.info("Frontend Agent initialized successfully")

    def _execute_tool(self, function_call: types.FunctionCall) -> str:
        """Execute a tool and return the result."""
        tool_name = function_call.name
        args = dict(function_call.args) if function_call.args else {}

        self.logger.info(f"Executing tool: {tool_name} with args: {list(args.keys())}")

        if tool_name not in TOOL_MAP:
            return json.dumps({"error": f"Unknown tool: {tool_name}"})

        try:
            result = TOOL_MAP[tool_name](**args)
            return result if isinstance(result, str) else json.dumps(result)
        except Exception as e:
            self.logger.error(f"Tool execution error: {e}")
            return json.dumps({"error": str(e)})

    async def run_task(self, user_input: str) -> str:
        """
        Execute a task with automatic tool execution loop.

        Args:
            user_input: The task instruction

        Returns:
            Final response from the agent
        """
        self.logger.info(f"Starting task: {user_input[:80]}...")

        messages = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=f"{FRONTEND_DEV_INSTRUCTION}\n\nTask: {user_input}")]
            )
        ]

        tool_calls_count = 0

        while tool_calls_count < self.config.max_iterations:
            try:
                response = self._client.models.generate_content(
                    model=self.config.model_name,
                    contents=messages,
                    config=types.GenerateContentConfig(
                        tools=[self._tools],
                        temperature=0.7,
                    )
                )
            except Exception as e:
                self.logger.error(f"Generation error: {e}")
                return f"ERROR: {str(e)}"

            # Check if response has function calls
            candidate = response.candidates[0] if response.candidates else None
            if not candidate or not candidate.content:
                return "No response generated"

            content = candidate.content
            messages.append(content)

            # Check for function calls
            function_calls = []
            text_parts = []

            # Handle case where parts is None
            parts = content.parts or []
            for part in parts:
                if part.function_call:
                    function_calls.append(part.function_call)
                elif part.text:
                    text_parts.append(part.text)

            # If no function calls, we're done
            if not function_calls:
                final_text = "\n".join(text_parts)
                self.logger.info(f"Task completed. Tool calls: {tool_calls_count}")
                return final_text

            # Execute function calls
            function_responses = []
            for fc in function_calls:
                tool_calls_count += 1
                self.logger.info(f"Tool call #{tool_calls_count}: {fc.name}")
                result = self._execute_tool(fc)
                function_responses.append(
                    types.Part.from_function_response(
                        name=fc.name,
                        response={"result": result}
                    )
                )

            # Add function results to conversation
            messages.append(
                types.Content(
                    role="user",
                    parts=function_responses
                )
            )

        self.logger.warning(f"Max iterations ({self.config.max_iterations}) reached")
        return "Task incomplete: max iterations reached"

    async def cleanup(self) -> None:
        """Cleanup resources."""
        self.logger.info("Cleaning up Frontend Agent")


async def run_frontend_task(instruction: str, config: Optional[FrontendConfig] = None) -> str:
    """
    Convenience function to run a single frontend task.
    """
    agent = FrontendDeveloperAgent(config or default_config)
    try:
        return await agent.run_task(instruction)
    finally:
        await agent.cleanup()
