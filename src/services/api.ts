// src/services/api.ts
// Service layer handling communication with the Modal.com Backend
// Backend v2: JoyCaption (VLM) + Midnight Rose AWQ (LLM)

const BACKEND_URL = import.meta.env.VITE_MODAL_BACKEND_URL ||
  "https://pedrogiudice--picture-composer-backend-a100-process-inti-cc48af.modal.run";
const MOSAIC_BACKEND_URL = import.meta.env.VITE_MODAL_MOSAIC_URL ||
  "https://pedrogiudice--picture-composer-backend-a100-process-mosa-f668fe.modal.run";

/**
 * Interface alinhada com o backend.py (Modal.com)
 * Campos retornados pelo GameMasterEngine
 */
export interface IntimacyResponse {
  challenge_title: string;
  challenge_text: string;
  rationale: string;
  duration_seconds: number;
  intensity: number;
  error?: string;
}

export class SomaticBackend {
  /**
   * Sends an image and heat level to the A100 Orchestrator
   */
  static async processSession(imageUrl: string, heatLevel: number): Promise<IntimacyResponse> {
    try {
      // In a real scenario with Modal, we might upload the image first or send a base64 string
      // For this refactor, we assume the backend accepts a publicly accessible URL or we'd need a storage handler.
      // Since this is a "Mega Refactor", let's handle the data correctly.
      
      // If the backend expects a URL (as defined in InputDTO), we assume the frontend 
      // has uploaded it somewhere (e.g., S3/GCS) or we send base64 if we adjust the backend.
      // For now, let's mock the fetch call structure to be ready for the endpoint.
      
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl, // NOTE: Needs a real URL strategy in prod (Presigned URL)
          heat_level: heatLevel
        }),
      });

      if (!response.ok) {
        throw new Error(`Somatic Backend Failure: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Backend Error:", error);
      // Fallback for demo purposes if backend isn't live yet
      return this.mockFallback(heatLevel);
    }
  }

  /**
   * Sends a mosaic image to the A100 Backend for poetic titling via Qwen2.5-VL
   */
  static async analyzeMosaic(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(MOSAIC_BACKEND_URL, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl })
      });
      
      if (!response.ok) throw new Error("Mosaic Analysis Failed");
      
      const data = await response.json();
      return data.title || "Mosaic of Our Eternal Bond";
    } catch (error) {
      console.error("Mosaic Backend Error:", error);
      return "Mosaic of Our Memories (Offline Mode)";
    }
  }

  private static mockFallback(level: number): IntimacyResponse {
    return {
      challenge_title: "Protocolo de Contato Visual",
      challenge_text: "Mantenham contato visual direto sem piscar excessivamente. Sincronizem a respiracao ate que o desconforto se torne calor.",
      rationale: "Simulacao de protocolo devido a ausencia de conexao com backend.",
      intensity: level,
      duration_seconds: 120,
      error: "Backend offline - usando fallback local"
    };
  }
}
