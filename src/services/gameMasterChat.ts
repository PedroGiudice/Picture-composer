/**
 * GameMaster Chat Service
 * Comunicacao direta com o GameMaster via Modal.com
 */

const CHAT_URL = import.meta.env.VITE_MODAL_CHAT_URL ||
  "https://pedrogiudice--picture-composer-backend-a100-chat-with-game-master.modal.run";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  system_prompt?: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
}

/**
 * Servico de chat com o GameMaster
 */
export class GameMasterChat {
  /**
   * Envia mensagem para o GameMaster
   */
  static async send(
    messages: ChatMessage[],
    systemPrompt?: string,
    context?: string
  ): Promise<string> {
    const request: ChatRequest = {
      messages,
      system_prompt: systemPrompt,
      context,
    };

    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data.response;
  }

  /**
   * Envia mensagem simples (sem historico)
   */
  static async sendSimple(
    message: string,
    systemPrompt?: string,
    context?: string
  ): Promise<string> {
    return this.send(
      [{ role: 'user', content: message }],
      systemPrompt,
      context
    );
  }
}

export default GameMasterChat;
