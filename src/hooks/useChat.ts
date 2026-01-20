import { useState, useCallback } from 'react';
import { GameMasterChat, ChatMessage } from '../services/gameMasterChat';

export interface UseChatOptions {
  systemPrompt?: string;
  context?: string;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  setContext: (context: string) => void;
  setSystemPrompt: (prompt: string) => void;
}

/**
 * Hook para gerenciar chat com o GameMaster
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(options.systemPrompt);
  const [context, setContext] = useState(options.context);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);

    try {
      const response = await GameMasterChat.send(
        updatedMessages,
        systemPrompt,
        context
      );

      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setMessages([...updatedMessages, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [messages, systemPrompt, context]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setContext,
    setSystemPrompt,
  };
}

export default useChat;
