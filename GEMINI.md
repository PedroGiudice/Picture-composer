# Project Context: Couple's Memory Deck (Picture-composer)

## Project Overview
This is a React-based web application designed as a romantic "Digital Memory Deck" for couples. It allows users to upload photos, view them alongside romantic questions, and create artistic photo mosaics. The application integrates with Google's Gemini API for creative content generation and Google Drive for photo selection.

### Key Features
1.  **Photo Upload:** Direct file upload or integration with Google Drive (via Google Picker).
2.  **Memory Deck:** An interactive viewing mode (`MemoryViewer`) that pairs uploaded photos with romantic questions to spark conversation.
3.  **Mosaic Creator:** A feature that takes a "target" photo and recreates it using hundreds of smaller "source" photos (the uploaded memories).
4.  **AI Integration:** Uses Google Gemini 2.0 Flash model to analyze generated mosaics and create poetic titles.

## Tech Stack
*   **Framework:** React 19 (via Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (inferred from utility classes)
*   **Icons:** Lucide React
*   **AI:** `@google/genai` (Google Gemini SDK)
*   **APIs:** Google Drive/Picker API, Google Gemini API

## Setup & Running

### Prerequisites
*   Node.js (v18+ recommended)
*   Google Cloud Console project with:
    *   Gemini API enabled (API Key required)
    *   Google Drive/Picker API enabled (Client ID & API Key required for Drive integration)

### Installation
```bash
npm install
```

### Environment Configuration
1.  Create a `.env.local` file in the root directory.
2.  Add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
    *Note: The `MosaicCreator.tsx` currently references `process.env.API_KEY`. Verify if this needs to be `import.meta.env.VITE_GEMINI_API_KEY` for Vite compatibility.*

### Development Scripts
*   **Start Dev Server:** `npm run dev`
*   **Build for Production:** `npm run build`
*   **Preview Build:** `npm run preview`

## Architecture & Key Files

### Directory Structure
*   `components/`: React UI components.
    *   `MosaicCreator.tsx`: Handles mosaic generation logic and Gemini AI calls.
    *   `PhotoUploader.tsx`: Manages file uploads.
    *   `MemoryViewer.tsx`: Display logic for the "Memory Deck" mode.
*   `utils/`: Helper functions.
    *   `mosaic.ts`: Core algorithm for generating photo mosaics.
    *   `googleIntegration.ts`: Handles Google OAuth, Drive Picker, and credential management (stored in `localStorage`).
*   `App.tsx`: Main entry point handling application state (`UPLOAD`, `VIEWING`, `MOSAIC_SETUP`).
*   `types.ts`: TypeScript definitions for App State and Memory objects.

### Data Flow
1.  **State Management:** `App.tsx` holds the global state for `uploadedFiles` and the current view (`appState`).
2.  **Mosaic Generation:** `MosaicCreator` takes `sourceFiles` (from App state) and a user-selected `targetFile`. It delegates the heavy lifting to `utils/mosaic.ts`.
3.  **AI Analysis:** Once a mosaic is generated, `MosaicCreator` converts it to Base64 and sends it to Gemini to generate a title.

## Notes for Development
*   **Google Auth:** The Google Picker integration in `utils/googleIntegration.ts` relies on dynamic credential entry (stored in LocalStorage) rather than hardcoded env vars for the Client ID/API Key.
*   **Mosaic Logic:** The mosaic generation happens client-side. Large numbers of source photos might impact performance.
