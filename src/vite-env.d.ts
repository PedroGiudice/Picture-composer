/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODAL_BACKEND_URL: string;
  readonly VITE_MODAL_MOSAIC_URL: string;
  readonly VITE_MODAL_CHAT_URL: string;
  readonly VITE_OLLAMA_URL: string;
  readonly VITE_OLLAMA_USER: string;
  readonly VITE_OLLAMA_PASS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
