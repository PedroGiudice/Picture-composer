<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1-3O7JBVhrJ97rDko47y73vjBja1rAYj-

## Development Environment

**OS:** Linux Ubuntu (padrão)
**VM:** Oracle Cloud VM.Standard.E2.4 (x86_64, 4 OCPUs, 64GB RAM)

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## 🛠 Available MCP Servers & Tools

This project is equipped with several Model Context Protocol (MCP) servers to assist with development, debugging, and workflow management.

### 1. Gemini Kit (Engineering Workflow)
**Role:** The project manager and safety net. Use this for structured development and maintaining project knowledge.

*   **Key Functions:**
    *   `kit_save_learning`: Save user preferences or recurrent bugs to long-term memory.
    *   `kit_create_checkpoint` / `kit_restore_checkpoint`: Create git save points before risky changes.
    *   `kit_run_workflow`: Execute predefined workflows like `refactor`, `feature`, or `review`.
*   **When to use:**
    *   "Remember that I prefer Tailwind CSS over raw CSS."
    *   "Create a checkpoint before we refactor the core logic."
    *   "Run a code review workflow on the current changes."

### 2. Chrome DevTools (Browser Automation)
**Role:** The QA tester. Allows the agent to control a real Chrome browser instance to verify UI and functionality.

*   **Key Functions:**
    *   `navigate_page`: Open the application in the browser.
    *   `take_screenshot`: Capture the current state of the UI.
    *   `get_console_message`: Check for runtime errors in the browser console.
    *   `click` / `fill`: Interact with buttons and forms.
*   **When to use:**
    *   "Open the app and take a screenshot of the homepage."
    *   "Check the browser console for any CORS errors."
    *   "Click the upload button and verify the modal opens."

### 3. Context7 (Documentation & Research)
**Role:** The librarian. Fetches up-to-date documentation and code examples for libraries.

*   **Key Functions:**
    *   `resolve-library-id`: Find the correct documentation source.
    *   `query-docs`: Retrieve specific examples and API details.
*   **When to use:**
    *   "How do I use the new hook in React 19?"
    *   "Find documentation for the Google Picker API."

### 4. ADK Agent Extension (Agent Management)
**Role:** The multi-agent orchestrator. Manages specialized AI agents from the Google ADK ecosystem.

*   **Key Functions:**
    *   `list_adk_agents`: Find available specialized agents.
    *   `send_message_to_agent`: Delegate tasks to other agents.
*   **When to use:**
    *   "Is there an agent specialized in security auditing?"
    *   "Deploy a new helper agent for this project."