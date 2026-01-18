// src/services/ollama.ts
// Service layer for local Ollama instance on Oracle VM
// Used for personalization, request triage, and offline fallback

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || "http://64.181.162.38/api/ollama";
const OLLAMA_USER = import.meta.env.VITE_OLLAMA_USER || "hotcocoa";
const OLLAMA_PASS = import.meta.env.VITE_OLLAMA_PASS || "Chicago00@";
const MODEL_NAME = "qwen2.5:7b";

// Types for Ollama API
interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  };
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

// Couple preferences stored locally
export interface CouplePreferences {
  preferredChallengeTypes: string[];
  avoidTopics: string[];
  intensityPreference: 'gentle' | 'moderate' | 'intense';
  customContext: string;
  lastUpdated: string;
}

// Decision from triage
export interface TriageDecision {
  useLocal: boolean;
  reason: string;
  confidence: number;
}

export class OllamaService {
  private static authHeader(): string {
    return "Basic " + btoa(`${OLLAMA_USER}:${OLLAMA_PASS}`);
  }

  /**
   * Check if Ollama is reachable
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/tags`, {
        headers: { Authorization: this.authHeader() },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Generate text using local Ollama
   */
  static async generate(
    prompt: string,
    systemPrompt?: string,
    options?: OllamaGenerateRequest["options"]
  ): Promise<string> {
    const request: OllamaGenerateRequest = {
      model: MODEL_NAME,
      prompt,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 512,
        ...options,
      },
    };

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.authHeader(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data: OllamaGenerateResponse = await response.json();
    return data.response;
  }

  /**
   * Load couple preferences from local storage
   */
  static loadPreferences(): CouplePreferences | null {
    try {
      const stored = localStorage.getItem("hotcocoa_preferences");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save couple preferences to local storage
   */
  static savePreferences(prefs: CouplePreferences): void {
    localStorage.setItem("hotcocoa_preferences", JSON.stringify({
      ...prefs,
      lastUpdated: new Date().toISOString(),
    }));
  }

  /**
   * Update preferences based on session feedback
   */
  static async updatePreferencesFromFeedback(
    liked: boolean,
    challengeType: string,
    notes?: string
  ): Promise<void> {
    const prefs = this.loadPreferences() || {
      preferredChallengeTypes: [],
      avoidTopics: [],
      intensityPreference: 'moderate' as const,
      customContext: '',
      lastUpdated: new Date().toISOString(),
    };

    if (liked) {
      if (!prefs.preferredChallengeTypes.includes(challengeType)) {
        prefs.preferredChallengeTypes.push(challengeType);
      }
    } else {
      if (!prefs.avoidTopics.includes(challengeType)) {
        prefs.avoidTopics.push(challengeType);
      }
    }

    // Use Ollama to extract insights from notes
    if (notes && notes.length > 10) {
      try {
        const analysis = await this.generate(
          `Analise este feedback sobre uma experiencia de intimidade e extraia preferencias do casal em formato JSON simples:

Feedback: "${notes}"

Retorne apenas JSON com campos: "likes" (array), "dislikes" (array), "suggestions" (string).`,
          "Voce e um assistente que analisa feedback de casais. Seja discreto e respeitoso."
        );

        // Parse and merge insights
        try {
          const insights = JSON.parse(analysis);
          if (insights.likes) {
            prefs.preferredChallengeTypes.push(...insights.likes);
          }
          if (insights.dislikes) {
            prefs.avoidTopics.push(...insights.dislikes);
          }
        } catch {
          // If parsing fails, just add notes to context
          prefs.customContext += `\n${notes}`;
        }
      } catch (err) {
        console.warn("Ollama analysis failed, saving raw notes:", err);
        prefs.customContext += `\n${notes}`;
      }
    }

    this.savePreferences(prefs);
  }

  /**
   * Triage: decide whether to use local Ollama or remote Modal
   */
  static async triageRequest(
    hasImage: boolean,
    complexity: 'simple' | 'moderate' | 'complex'
  ): Promise<TriageDecision> {
    // Simple heuristics for now
    // TODO: Use Ollama to make smarter decisions

    if (hasImage) {
      // Vision tasks need Modal's VL model
      return {
        useLocal: false,
        reason: "Analise visual requer modelo VL (Modal)",
        confidence: 0.95,
      };
    }

    if (complexity === 'complex') {
      // Complex generation benefits from 72B model
      return {
        useLocal: false,
        reason: "Geracao complexa beneficia do modelo 72B (Modal)",
        confidence: 0.8,
      };
    }

    // Check if Ollama is available
    const isAvailable = await this.healthCheck();
    if (!isAvailable) {
      return {
        useLocal: false,
        reason: "Ollama indisponivel, usando Modal",
        confidence: 1.0,
      };
    }

    // Simple tasks can be handled locally
    return {
      useLocal: true,
      reason: "Tarefa simples, usando Ollama local (mais rapido)",
      confidence: 0.85,
    };
  }

  /**
   * Generate personalized prompt based on couple preferences
   */
  static async personalizePrompt(basePrompt: string): Promise<string> {
    const prefs = this.loadPreferences();
    if (!prefs) return basePrompt;

    const context = `
Preferencias do casal:
- Tipos favoritos: ${prefs.preferredChallengeTypes.join(", ") || "nenhum registrado"}
- Evitar: ${prefs.avoidTopics.join(", ") || "nenhum registrado"}
- Intensidade preferida: ${prefs.intensityPreference}
${prefs.customContext ? `- Contexto adicional: ${prefs.customContext}` : ""}
    `.trim();

    return `${context}\n\n${basePrompt}`;
  }

  /**
   * Generate a simple fallback response when Modal is unavailable
   */
  static async generateFallbackChallenge(heatLevel: number): Promise<{
    title: string;
    instruction: string;
    rationale: string;
  }> {
    const prefs = this.loadPreferences();
    const prefContext = prefs
      ? `Preferencias: ${prefs.preferredChallengeTypes.join(", ")}. Evitar: ${prefs.avoidTopics.join(", ")}.`
      : "";

    const intensityMap: Record<number, string> = {
      1: "muito gentil e romantico",
      2: "gentil com toques de sensualidade",
      3: "moderadamente sensual",
      4: "sensual e provocante",
      5: "intenso e apaixonado",
    };

    const intensity = intensityMap[Math.min(5, Math.max(1, Math.round(heatLevel / 2)))] || "moderado";

    const prompt = `Crie um desafio de intimidade para um casal.
Nivel de intensidade: ${intensity} (${heatLevel}/10)
${prefContext}

Responda em JSON com:
- title: titulo curto do desafio (max 5 palavras)
- instruction: instrucao detalhada (2-3 frases)
- rationale: justificativa breve

Seja criativo mas respeitoso. Foque em conexao emocional e fisica.`;

    try {
      const response = await this.generate(
        prompt,
        "Voce e um terapeuta de casais especializado em intimidade. Seja discreto, respeitoso e criativo."
      );

      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error("Fallback generation failed:", err);
    }

    // Ultimate fallback
    return {
      title: "Momento de Conexao",
      instruction: "Olhem nos olhos um do outro por 2 minutos em silencio. Deixem a conexao fluir naturalmente.",
      rationale: "Contato visual prolongado libera oxitocina e fortalece vinculos.",
    };
  }
}
