# GEMINI.md - Context & Operational Directives

## 1. Project Identity & Architecture
**Project:** "Couple's Memory Deck" (Picture-composer) + "Uncensored Somatic Backend"
**Goal:** A dual-stack application. Frontend (React) providing a romantic UI, communicating with a planned high-performance Backend (Modal/Python) for uncensored, somatically-focused AI analysis.

### Stack A: Frontend (Current Repo)
*   **Tech:** React 19, Vite, TypeScript, Tailwind CSS (Utility classes only).
*   **Key Components:** `MemoryViewer` (Session logic), `MosaicCreator` (Canvas manipulation), `PhotoUploader` (Google Picker).
*   **Integration:** Currently calls Gemini API directly (`@google/genai`). Future state: Proxy through Backend.
*   **Persona:** "Dr. Elena" - Clinical AI Sexologist. Direct, authoritative, physiological focus.

### Stack B: Backend (Specification Phase)
*   **Infrastructure:** Modal.com Serverless (GPU A100/A10G).
*   **Core Engine:** Python 3.11, vLLM, PyTorch.
*   **Models:**
    *   **Vision:** Qwen2.5-VL-7B-Instruct (Abliterated).
    *   **Text:** Midnight-Miqu-70B-v1.5-awq (or Magnum-v4-12B fallback).
*   **Protocol:** Fast, uncensored inference using NF4/AWQ quantization.

## 2. Operational Rules
1.  **Strict Typing:** `any` is forbidden in TypeScript. Pydantic models required for Python.
2.  **Safety:** `kit_create_checkpoint` BEFORE major refactors.
3.  **Environment:** Frontend uses `import.meta.env` (via Vite define). Backend uses Modal Secrets.
4.  **Error Handling:** Fail gracefully. If AI fails, fallback to static questions (`constants.ts`).

## 3. Known Issues & Debts
*   `MosaicCreator.tsx` relies on `process.env` (shimmed in `vite.config.ts`).
*   Tailwind loaded via CDN in `index.html` (should be PostCSS build).
*   No real backend integration yet; logic is split between Client-side and a text spec.

## 4. Agent Responsibilities (ADK)
*   `dev-front`: React/Vite expert. Owns UI/UX and client logic.
*   `dev-back`: Python/Modal expert. Owns the "Uncensored Pipeline" implementation.
*   `test-front`: Cypress/Jest. Validates UI flows and Dr. Elena's persona rendering.
*   `test-back`: PyTest. Validates vLLM inference, JSON schemas, and GPU memory safety.
*   `ops-cicd-front`: Vercel/Netlify deployment pipelines.
*   `ops-cicd-back`: Modal deployment, Model weight caching, Cold-start optimization.