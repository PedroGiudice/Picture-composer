// src/services/api.ts
// Service layer handling communication with the Modal.com A100 Backend

// TODO: This URL will be replaced by the actual Modal deployment URL via ENV variables
const BACKEND_URL = import.meta.env.VITE_MODAL_BACKEND_URL || "https://pedrogiudice--picture-composer-backend-a100-process-intimacy-request.modal.run";
const MOSAIC_BACKEND_URL = import.meta.env.VITE_MODAL_MOSAIC_URL || "https://pedrogiudice--picture-composer-backend-a100-process-mosaic-request.modal.run";

export interface IntimacyResponse {
  safety_validation: string;
  clinical_rationale_pt_br: string;
  instruction_title_pt_br: string;
  instruction_text_pt_br: string;
  intensity_metric: number;
  duration_sec: number;
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
      safety_validation: "Simulation Mode",
      clinical_rationale_pt_br: "Simulação de protocolo devido à ausência de conexão neural.",
      instruction_title_pt_br: "Protocolo de Contato Visual",
      instruction_text_pt_br: "Mantenham contato visual direto sem piscar excessivamente. Sincronizem a respiração até que o desconforto se torne calor.",
      intensity_metric: level,
      duration_sec: 120
    };
  }
}
