#!/usr/bin/env python3
"""
Frontend Developer Agent - CLI Runner
Ponto de entrada CLI com tratamento de erros (Zero-Fail).

Usage:
    python main.py "Create a Button component with variants"
    python main.py --interactive  # Interactive mode
"""
import asyncio
import sys
import os
import logging
from pathlib import Path

# Add adk-agents directory to path so imports work when running directly
adk_agents_dir = Path(__file__).parent.parent
sys.path.insert(0, str(adk_agents_dir))

from dotenv import load_dotenv

from frontend_agent.agent import FrontendDeveloperAgent
from frontend_agent.config import FrontendConfig


def setup_logging(level: str = "INFO") -> None:
    """Configure logging with consistent format."""
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="[%(asctime)s] %(name)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def print_banner() -> None:
    """Print startup banner."""
    print("=" * 60)
    print("FRONTEND DEVELOPER AGENT (ADK)")
    print("Senior React/TypeScript Engineer")
    print("=" * 60)


def print_help() -> None:
    """Print usage help."""
    print(
        """
Usage:
    python main.py "<instruction>"
    python main.py --interactive

Examples:
    python main.py "Create a React Button component with variants"
    python main.py "List all .tsx files in src/components"
    python main.py "Read the file src/App.tsx and explain its structure"

Environment Variables:
    GOOGLE_API_KEY          Required. Your Google AI API key.
    FRONTEND_AGENT_MODEL    Model to use (default: gemini-2.5-flash)
    FRONTEND_AGENT_WORKDIR  Working directory (default: ./work_env)
    FRONTEND_AGENT_LOG_LEVEL Log level (default: INFO)
"""
    )


async def run_interactive() -> None:
    """Run agent in interactive mode."""
    print("\nInteractive Mode (type 'exit' or 'quit' to stop)")
    print("-" * 40)

    config = FrontendConfig.from_env()
    agent = FrontendDeveloperAgent(config)

    while True:
        try:
            user_input = input("\n> ").strip()
            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit", "q"):
                print("Goodbye!")
                break

            print("\nProcessing...")
            result = await agent.run_task(user_input)
            print("\n" + "=" * 40)
            print("RESPONSE:")
            print("=" * 40)
            print(result)

        except KeyboardInterrupt:
            print("\n\nInterrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\nError: {e}")

    await agent.cleanup()


async def run_single_task(instruction: str) -> None:
    """Run a single task and exit."""
    config = FrontendConfig.from_env()
    agent = FrontendDeveloperAgent(config)

    print(f"\n> Task: {instruction}")
    print("> Status: Working... (Tools enabled: FileSystem, Shell, MockMCP)")

    try:
        result = await agent.run_task(instruction)

        print("\n" + "=" * 60)
        print("FINAL OUTPUT")
        print("=" * 60)
        print(result)

    except Exception as e:
        print(f"\nFATAL ERROR: {e}")
        sys.exit(1)
    finally:
        await agent.cleanup()


async def main() -> None:
    """Main entry point."""
    load_dotenv()

    # Validate API Key
    if not os.getenv("GOOGLE_API_KEY"):
        print("ERROR: GOOGLE_API_KEY not found in environment.")
        print("Set it with: export GOOGLE_API_KEY='your-key-here'")
        sys.exit(1)

    setup_logging(os.getenv("FRONTEND_AGENT_LOG_LEVEL", "INFO"))

    # Parse arguments
    args = sys.argv[1:]

    if not args or args[0] in ("-h", "--help", "help"):
        print_banner()
        print_help()
        sys.exit(0)

    print_banner()

    if args[0] in ("-i", "--interactive"):
        await run_interactive()
    else:
        instruction = " ".join(args)
        await run_single_task(instruction)


if __name__ == "__main__":
    asyncio.run(main())
