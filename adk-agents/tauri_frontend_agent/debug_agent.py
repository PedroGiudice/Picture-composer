import asyncio
import os
import sys
from tauri_frontend_agent.agent import root_agent

PLAN = "Test plan"  # Short plan for debug

async def main():
    print("Starting Tauri Frontend Agent...")
    print(f"Agent type: {type(root_agent)}")
    print(f"Attributes: {dir(root_agent)}")
    
    # Try common methods if available
    if hasattr(root_agent, 'chat'):
        print("Found 'chat' method")
    if hasattr(root_agent, 'query'):
        print("Found 'query' method")
        
if __name__ == "__main__":
    if not os.getenv("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY not set")
        sys.exit(1)
    asyncio.run(main())
