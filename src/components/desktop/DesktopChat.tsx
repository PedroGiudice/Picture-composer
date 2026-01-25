import React, { useState } from 'react';
import { Send } from 'lucide-react';

export function DesktopChat() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Ola. Vejo que voce enviou uma foto interessante. O ambiente parece intimo. Vamos comecar com algo leve?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    setMessages([...messages, { role: 'user', content: inputMessage }]);
    setInputMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Interessante. Aumente a intensidade. O que voce sente agora?' }]);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col p-6">
      <h2 className="text-lg font-bold tracking-widest uppercase text-primary mb-4">Game Master Chat</h2>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-4 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border border-white/10 rounded-bl-none'}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-4">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Responda ao Game Master..."
          className="w-full bg-card border border-white/10 rounded-xl p-4 pr-14 text-sm focus:border-primary focus:outline-none"
        />
        <button onClick={handleSendMessage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-foreground transition-colors">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
