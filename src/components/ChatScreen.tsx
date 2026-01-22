// src/components/ChatScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, Wifi, WifiOff } from 'lucide-react';
import { OllamaService } from '../services/ollama';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Ollama status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const online = await OllamaService.isAvailable();
      setIsOnline(online);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await OllamaService.generate(input.trim(), undefined, {
        temperature: 0.8,
        num_predict: 512
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, nao consegui processar sua mensagem. Verifique a conexao com o Ollama.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 border-b"
        style={{
          borderColor: 'var(--hotcocoa-border)',
          backgroundColor: 'var(--hotcocoa-card-bg)'
        }}
      >
        <Bot size={24} style={{ color: 'var(--hotcocoa-accent)' }} />
        <div>
          <h3 className="font-medium" style={{ color: 'var(--hotcocoa-text-primary)' }}>
            Assistente Local
          </h3>
          <div className="flex items-center gap-1 text-xs">
            {isOnline ? (
              <>
                <Wifi size={12} className="text-green-500" />
                <span className="text-green-500">Qwen 2.5 7B</span>
              </>
            ) : (
              <>
                <WifiOff size={12} className="text-red-500" />
                <span className="text-red-500">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
            <Bot size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">
              Converse com o assistente local sobre suas preferencias,
              ideias para experiencias, ou qualquer coisa!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: msg.role === 'user' ? 'var(--hotcocoa-accent)' : 'var(--hotcocoa-card-bg)'
              }}
            >
              {msg.role === 'user' ? (
                <User size={16} style={{ color: 'var(--hotcocoa-bg)' }} />
              ) : (
                <Bot size={16} style={{ color: 'var(--hotcocoa-accent)' }} />
              )}
            </div>
            <div
              className={`max-w-[75%] p-3 rounded-2xl ${
                msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
              }`}
              style={{
                background: msg.role === 'user' ? 'var(--hotcocoa-accent)' : 'var(--hotcocoa-card-bg)',
                color: msg.role === 'user' ? 'var(--hotcocoa-bg)' : 'var(--hotcocoa-text-primary)'
              }}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--hotcocoa-card-bg)' }}
            >
              <Loader2 size={16} className="animate-spin" style={{ color: 'var(--hotcocoa-accent)' }} />
            </div>
            <div
              className="p-3 rounded-2xl rounded-tl-sm"
              style={{ background: 'var(--hotcocoa-card-bg)' }}
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--hotcocoa-accent)', animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--hotcocoa-accent)', animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--hotcocoa-accent)', animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="p-4 border-t"
        style={{
          borderColor: 'var(--hotcocoa-border)',
          backgroundColor: 'var(--hotcocoa-card-bg)'
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..."
            disabled={!isOnline || isLoading}
            className="flex-1 px-4 py-3 rounded-xl text-sm disabled:opacity-50 outline-none"
            style={{
              background: 'var(--hotcocoa-bg)',
              color: 'var(--hotcocoa-text-primary)',
              border: '1px solid var(--hotcocoa-border)'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !isOnline || isLoading}
            className="p-3 rounded-xl transition-all disabled:opacity-30 hover:brightness-110"
            style={{
              background: 'var(--hotcocoa-accent)'
            }}
          >
            <Send size={20} style={{ color: 'var(--hotcocoa-bg)' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
