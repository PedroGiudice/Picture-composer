# GEMINI.md - Architecture North Star

## Project Identity

**Project:** Picture Composer (Couple's Memory Deck)
**Goal:** Dual-stack application for romantic memory curation with AI-powered intimacy experiences.

---

## Architecture

### Frontend (React/Vite)

| Component | Purpose |
|-----------|---------|
| React 19 + TypeScript | UI Framework |
| Vite 6.2 | Build tool |
| Tailwind CSS | Styling |
| MemoryViewer | Core session experience |
| MosaicCreator | Photo mosaic generation |
| PhotoUploader | Google Drive/Photos integration |

### Backend (Modal.com)

| Component | Purpose |
|-----------|---------|
| Modal A100 | GPU compute infrastructure |
| Python 3.11 | Runtime |
| vLLM | Inference engine |
| Qwen2.5-VL-7B | Vision model (scene analysis) |
| Qwen2.5-72B-AWQ | Text model (challenge generation) |

---

## Pipeline

```
[Image] -> VisionEngine -> [Scene Description] -> GameMasterEngine -> [Challenge JSON]
```

1. **VisionEngine**: Analyzes uploaded image, outputs objective scene description
2. **GameMasterEngine**: Takes scene + heat_level, generates intimacy challenge

---

## API Contracts

### POST /process_intimacy_request

**Input:**
```json
{
  "image_url": "https://...",
  "heat_level": 7
}
```

**Output:**
```json
{
  "challenge_title": "...",
  "challenge_text": "...",
  "rationale": "...",
  "duration_seconds": 180,
  "intensity": 7
}
```

### POST /process_mosaic_request

**Input:**
```json
{
  "image_url": "https://..."
}
```

**Output:**
```json
{
  "title": "..."
}
```

---

## Operational Rules

1. **Strict Typing**: No `any` in TypeScript. Pydantic required for Python.
2. **Error Handling**: Graceful fallbacks. Static questions if AI fails.
3. **Environment**: Frontend uses `import.meta.env`. Backend uses Modal Secrets.
4. **Language**: Portuguese Brazilian for all user-facing content.

---

## Known Technical Debt

- Tailwind via CDN (should be PostCSS build)
- Auth hardcoded in AuthGate.tsx
- Google creds in localStorage
- No automated tests
