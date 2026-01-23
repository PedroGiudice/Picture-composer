# GEMINI.md - Architecture North Star

## Project Identity

**Project:** HotCocoa (formerly Picture Composer)
**Goal:** Dual-stack application (Tauri/React + Flutter) for romantic memory curation with AI-powered intimacy experiences.
**Core Philosophy:** Somatic connection through visual memories.

---

## Architecture

### Frontend (Dual-Stack)

| Platform | Tech Stack | Purpose |
|-----------|------------|---------|
| **Desktop/Mobile (Tauri)** | React 19 + Vite 6 + Tailwind 4 | Main cross-platform UI |
| **Mobile (Flutter)** | Riverpod + Dio + Animate | Native mobile experience |
| **Core Components** | Radix UI + Framer Motion | Accessible, fluid interactions |

### Backend (Modal.com)

**Architecture North Star: Backend v2 (JoyCaption + Midnight Rose)**

| Component | Purpose | Model |
|-----------|---------|-------|
| **VisionEngine** | Scene analysis & captioning | JoyCaption (Llama-3.1 based) |
| **TextEngine** | Challenge generation | Midnight Rose 70B v2.0.3 (AWQ) |
| **Inference** | Serverless GPU (A100) | vLLM Engine |

---

## Pipeline & Protocols

```
[Image] -> VisionEngine (JoyCaption) -> [Vivid Description] -> TextEngine (Midnight Rose) -> [Intimacy Challenge JSON]
```

### Modes of Experience
- **HOT:** Visceral, explicit, and direct.
- **WARM:** Deep, emotional, and romantic.

### Local Protocol (Fallback)
- **Ollama:** Local inference (Llama 3 / Mistral) when Modal is offline.

---

## Technical Standards

1. **UI System:** Material Design 3 (Figma Redesign).
2. **Safe Areas:** Strict adherence to `env(safe-area-inset-*)` for mobile/notched devices.
3. **Styling:** CSS variables via `--hotcocoa-*` with 300ms theme transitions.
4. **Data:** Tauri Rust commands for local photo/config management.
5. **Language:** Portuguese Brazilian (PT-BR) for all user-facing content.

---

## Folder Structure Highlights

- `src/`: React Frontend (Tauri-ready).
- `src-tauri/`: Rust backend for local system access.
- `hotcocoa_flutter/`: Parallel native Flutter implementation.
- `backend/`: Modal.com Python scripts (v1 and v2).
- `adk-agents/`: Autonomous development agents (Google GenAI).
- `docs/plans/`: Historical and active implementation roadmaps.

---

## Known Technical Debt & TODOs

- [ ] Complete Google Photos/Drive OAuth integration (currently hardcoded/local).
- [ ] Align Flutter version with Figma Redesign UI.
- [ ] Migrate all endpoints to Backend v2.
- [ ] Implement automated testing (Bun test/Flutter test).
- [ ] Remove Tailwind via CDN leftovers (now fully PostCSS/Vite).

