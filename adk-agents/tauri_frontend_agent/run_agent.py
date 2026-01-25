import asyncio
import os
import sys
from pathlib import Path
from tauri_frontend_agent.agent import root_agent
from google.adk.runners import InMemoryRunner
from google.genai.types import Content, Part

async def main():
    print("Starting Tauri Frontend Agent with InMemoryRunner...")
    try:
        # Read plan from file
        plan_path = Path(__file__).parent / "plan.txt"
        plan = plan_path.read_text(encoding="utf-8")
        
        # Initialize Runner
        runner = InMemoryRunner(agent=root_agent, app_name="HotCocoa")
        
        # Create session with app_name
        session = await runner.session_service.create_session(user_id="dev", app_name="HotCocoa")
        # Trying 'id' instead of 'session_id'
        sid = getattr(session, 'id', getattr(session, 'session_id', None))
        print(f"Created session with ID: {sid}")
        
        print("Executing runner.run_async(...) [Streaming]...")
        
        # Create Content object
        message = Content(role="user", parts=[Part(text=plan)])
        
        # Iterating over the async generator
        async for part in runner.run_async(
            user_id="dev",
            session_id=sid,
            new_message=message
        ):
            # Print text content of events if available
            if hasattr(part, 'text'):
                print(part.text, end="", flush=True)
            elif hasattr(part, 'content') and hasattr(part.content, 'parts'):
                for p in part.content.parts:
                    if hasattr(p, 'text'):
                        print(p.text, end="", flush=True)
            else:
                # Fallback print for debugging
                pass
            
        print("\n\nAgent Execution Complete.")
        
    except Exception as e:
        print(f"\nError running agent: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if not os.getenv("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY not set")
        sys.exit(1)
    asyncio.run(main())