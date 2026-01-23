import { useState, useRef, useEffect } from "react";
import SendRounded from '@mui/icons-material/SendRounded';
import { useTheme } from "@/context/ThemeContext";
import { GameMasterChat, ChatMessage } from "@/services/gameMasterChat";
import { getSystemPrompt } from "@/components/SystemPromptModal";

export function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ola! Estou aqui para criar experiencias de intimidade para voces. O que gostariam de explorar hoje?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { mode } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para ultima mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: message };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage("");
    setIsLoading(true);

    try {
      // Usa o system prompt configurado pelo usuario diretamente
      const systemPrompt = getSystemPrompt();

      const response = await GameMasterChat.send(
        updatedMessages,
        systemPrompt
      );

      setMessages(prev => [...prev, {
        role: "assistant",
        content: response
      }]);
    } catch (error) {
      console.error("Erro no chat:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Desculpe, houve um erro na conexao. Tente novamente em alguns instantes."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col min-h-0 transition-colors duration-300"
      style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
    >
      {/* Chat Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[80%] p-4 rounded-2xl transition-colors duration-300"
              style={{
                backgroundColor: msg.role === "user"
                  ? 'var(--hotcocoa-accent)'
                  : 'var(--hotcocoa-card-bg)',
                color: msg.role === "user"
                  ? (mode === 'warm' ? '#3d2817' : '#000')
                  : 'var(--hotcocoa-text-primary)',
                borderRadius: '16px'
              }}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className="p-4 rounded-2xl transition-colors duration-300"
              style={{
                backgroundColor: 'var(--hotcocoa-card-bg)',
                color: 'var(--hotcocoa-text-secondary)',
                borderRadius: '16px'
              }}
            >
              <p className="text-sm animate-pulse">Digitando...</p>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - MD3 */}
      <div
        className="p-4 border-t transition-colors duration-300"
        style={{
          borderColor: 'var(--hotcocoa-border)',
          backgroundColor: 'var(--hotcocoa-card-bg)'
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-transparent border focus:outline-none transition-colors duration-300 disabled:opacity-50"
            style={{
              borderColor: 'var(--hotcocoa-border)',
              color: 'var(--hotcocoa-text-primary)',
              borderRadius: '12px',
              minHeight: '48px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
            className="p-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            style={{
              backgroundColor: 'var(--hotcocoa-accent)',
              borderRadius: '12px',
              minWidth: '48px',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SendRounded
              sx={{
                fontSize: 24,
                color: mode === 'warm' ? '#3d2817' : '#000'
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
