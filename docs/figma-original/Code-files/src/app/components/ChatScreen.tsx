import { useState } from "react";
import SendRounded from '@mui/icons-material/SendRounded';
import { useTheme } from "@/app/contexts/ThemeContext";

export function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Ola! Eu sou o assistente HotCocoa. Como posso ajudar a personalizar sua experiencia hoje?"
    }
  ]);
  const { mode } = useTheme();

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages([...messages, { role: "user", content: message }]);
    setMessage("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Entendi! Posso ajustar as configuracoes para criar uma experiencia mais personalizada."
      }]);
    }, 1000);
  };

  return (
    <div 
      className="flex-1 flex flex-col transition-colors duration-300"
      style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
    >
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
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
            className="flex-1 px-4 py-3 rounded-xl bg-transparent border focus:outline-none transition-colors duration-300"
            style={{
              borderColor: 'var(--hotcocoa-border)',
              color: 'var(--hotcocoa-text-primary)',
              borderRadius: '12px',
              minHeight: '48px'
            }}
          />
          <button
            onClick={handleSend}
            className="p-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
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