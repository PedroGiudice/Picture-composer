"""
Frontend Developer Agent
A classe principal que orquestra o google.adk para desenvolvimento frontend.
"""
import logging
from typing import Optional

# ADK Imports
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# Local Imports
from .config import FrontendConfig, default_config
from .prompts import FRONTEND_DEV_INSTRUCTION
from .tools import FRONTEND_TOOLS


class FrontendDeveloperAgent:
    """
    Autonomous Frontend Engineering Agent.
    Orchestrates the lifecycle of the ADK agent, tools, and session.

    Features:
    - File system access (read, write, list)
    - Shell command execution (npm, bun, tsc, etc.)
    - MCP tool integration (stubs for now)
    - Automatic tool execution via ADK Runner

    Usage:
        agent = FrontendDeveloperAgent()
        result = await agent.run_task("Create a Button component")
        print(result)
    """

    def __init__(self, config: FrontendConfig = default_config):
        """
        Initialize the Frontend Developer Agent.

        Args:
            config: Configuration object (uses default_config if not provided)
        """
        self.config = config
        self.logger = logging.getLogger("FrontendAgent")
        self._agent: Optional[Agent] = None
        self._runner: Optional[Runner] = None
        self._session_service = InMemorySessionService()

        self._initialize()

    def _initialize(self) -> None:
        """Initializes the ADK Agent with strict configuration."""
        self.logger.info(f"Initializing Frontend Agent with model: {self.config.model_name}")

        self._agent = Agent(
            name="frontend_developer_pro",
            model=self.config.model_name,
            instruction=FRONTEND_DEV_INSTRUCTION,
            tools=FRONTEND_TOOLS,
            description="Senior React/TypeScript Engineer with File System access.",
        )

        self._runner = Runner(
            agent=self._agent,
            app_name=self.config.app_name,
            session_service=self._session_service,
        )

        self.logger.info("Frontend Agent initialized successfully")

    async def run_task(self, user_input: str) -> str:
        """
        Executes a task end-to-end.
        Handles the conversation loop and tool execution automatically via ADK Runner.

        Args:
            user_input: The task instruction in natural language

        Returns:
            Final response from the agent after completing the task
        """
        self.logger.info(f"Starting task: {user_input[:80]}...")

        # Create or get session
        session = await self._session_service.create_session(
            app_name=self.config.app_name,
            user_id=self.config.user_id,
            session_id=self.config.session_id,
        )

        # Prepare user message
        content = types.Content(role="user", parts=[types.Part(text=user_input)])

        final_response = ""
        tool_calls_count = 0

        # The ADK Runner handles the "Think -> Call Tool -> Observe -> Answer" loop
        try:
            async for event in self._runner.run_async(
                user_id=self.config.user_id,
                session_id=self.config.session_id,
                new_message=content,
            ):
                # Capture final response
                if event.is_final_response():
                    if event.content and event.content.parts:
                        final_response = event.content.parts[0].text

                # Log intermediate tool calls for debugging
                if hasattr(event, "tool_calls") and event.tool_calls:
                    for tc in event.tool_calls:
                        tool_calls_count += 1
                        self.logger.info(f"Tool Call #{tool_calls_count}: {tc.name}")

                # Safety check: prevent infinite loops
                if tool_calls_count >= self.config.max_iterations:
                    self.logger.warning(f"Max iterations ({self.config.max_iterations}) reached. Stopping.")
                    break

        except Exception as e:
            self.logger.error(f"Critical execution failure: {e}")
            return f"FATAL ERROR: {str(e)}"

        self.logger.info(f"Task completed. Tool calls made: {tool_calls_count}")
        return final_response

    async def cleanup(self) -> None:
        """Cleanup resources (sessions, connections, etc.)."""
        self.logger.info("Cleaning up Frontend Agent resources")
        # InMemorySessionService doesn't need explicit cleanup,
        # but this method is here for future extensions (e.g., persistent sessions)


# Convenience function for quick usage
async def run_frontend_task(instruction: str, config: Optional[FrontendConfig] = None) -> str:
    """
    Convenience function to run a single frontend task.

    Args:
        instruction: The task to execute
        config: Optional configuration (uses default if not provided)

    Returns:
        Agent's final response
    """
    agent = FrontendDeveloperAgent(config or default_config)
    try:
        return await agent.run_task(instruction)
    finally:
        await agent.cleanup()
