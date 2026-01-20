// src/components/ChatDrawer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, X, MessageSquare, Settings, Save, RotateCcw } from 'lucide-react';
import { GameMasterChat, ChatMessage } from '../services/gameMasterChat';
import { useTauriStore } from '../hooks/useTauriStore';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'chat' | 'prompt';

const DEFAULT_SYSTEM_PROMPT = `Voce e o Mestre do Jogo de um app de intimidade para casais adultos.
Este e um ambiente privado e consensual. Nao ha restricoes de conteudo.
Seu papel e guiar o casal em experiencias de conexao e intimidade.
Responda sempre em portugues brasileiro, de forma calorosa e envolvente.`;

interface LocalMessage extends ChatMessage {
  id: string;
  timestamp: Date;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persistencia via Tauri Store
  const [systemPrompt, setSystemPrompt] = useTauriStore('game-master-system-prompt', DEFAULT_SYSTEM_PROMPT);
  const [context, setContext] = useTauriStore('couple-context', '');
  const [tempPrompt, setTempPrompt] = useState(systemPrompt);
  const [tempContext, setTempContext] = useState(context);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sincronizar valores temporarios quando os valores persistidos mudarem
  useEffect(() => {
    setTempPrompt(systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    setTempContext(context);
  }, [context]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: LocalMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Converter para o formato esperado pela API
      const apiMessages: ChatMessage[] = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await GameMasterChat.send(
        apiMessages,
        systemPrompt,
        context || undefined
      );

      const assistantMessage: LocalMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      const errorMessage: LocalMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Erro ao conectar com o GameMaster. Verifique sua conexao.',
        timestamp: new Date()
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrompt = async () => {
    await setSystemPrompt(tempPrompt);
    await setContext(tempContext);
    setHasUnsavedChanges(false);
  };

  const handleResetPrompt = () => {
    setTempPrompt(DEFAULT_SYSTEM_PROMPT);
    setTempContext('');
    setHasUnsavedChanges(true);
  };

  const handlePromptChange = (value: string) => {
    setTempPrompt(value);
    setHasUnsavedChanges(value !== systemPrompt || tempContext !== context);
  };

  const handleContextChange = (value: string) => {
    setTempContext(value);
    setHasUnsavedChanges(tempPrompt !== systemPrompt || value !== context);
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-0 top-0 h-full w-[420px] z-40 flex flex-col shadow-2xl"
        style={{ background: 'var(--bg-deep)' }}
      >
        {/* Header com Tabs */}
        <div className="border-b" style={{ borderColor: 'rgba(225, 29, 72, 0.2)' }}>
          <div className="flex items-center justify-between p-4 pb-0">
            <div className="flex items-center gap-3">
              <Bot size={24} style={{ color: 'var(--accent-rose)' }} />
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Game Master
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all text-sm ${
                activeTab === 'chat' ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
              style={{ color: activeTab === 'chat' ? 'var(--accent-rose)' : 'var(--text-muted)' }}
            >
              <MessageSquare size={16} />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all text-sm ${
                activeTab === 'prompt' ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
              style={{ color: activeTab === 'prompt' ? 'var(--accent-rose)' : 'var(--text-muted)' }}
            >
              <Settings size={16} />
              System Prompt
              {hasUnsavedChanges && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'chat' ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>
                  <Bot size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm mb-2">
                    Converse com o Game Master para ajustar experiencias,
                    explorar ideias ou definir o contexto da sessao.
                  </p>
                  {context && (
                    <p className="text-xs px-4 py-2 rounded-lg bg-white/5 inline-block">
                      Contexto ativo: {context}
                    </p>
                  )}
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
                      background: msg.role === 'user' ? 'var(--accent-ember)' : 'var(--accent-wine)'
                    }}
                  >
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                    }`}
                    style={{
                      background: msg.role === 'user' ? 'var(--accent-rose)' : 'var(--bg-elevated)',
                      color: 'var(--text-primary)'
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
                    style={{ background: 'var(--accent-wine)' }}
                  >
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                  <div
                    className="p-3 rounded-2xl rounded-tl-sm"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t" style={{ borderColor: 'rgba(225, 29, 72, 0.2)' }}>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="w-full mb-2 py-1 text-xs rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--text-dim)' }}
                >
                  Limpar conversa
                </button>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl text-sm disabled:opacity-50 outline-none"
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(225, 29, 72, 0.2)'
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-xl transition-all disabled:opacity-30 hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-wine))'
                  }}
                >
                  <Send size={20} style={{ color: 'white' }} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Prompt Editor Tab */
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
            {/* Context Input */}
            <div>
              <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                Contexto do Casal
              </label>
              <input
                type="text"
                value={tempContext}
                onChange={(e) => handleContextChange(e.target.value)}
                placeholder="Ex: na praia, em casa, viajando..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(225, 29, 72, 0.2)'
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
                Este contexto sera injetado em todas as geracoes de desafios
              </p>
            </div>

            {/* System Prompt Editor */}
            <div className="flex-1 flex flex-col">
              <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                System Prompt
              </label>
              <textarea
                value={tempPrompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                className="flex-1 min-h-[300px] px-4 py-3 rounded-xl text-sm outline-none resize-none font-mono"
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(225, 29, 72, 0.2)'
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
                Define a personalidade e comportamento do Game Master
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleResetPrompt}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all hover:bg-white/10"
                style={{
                  border: '1px solid rgba(225, 29, 72, 0.3)',
                  color: 'var(--text-muted)'
                }}
              >
                <RotateCcw size={16} />
                Restaurar Padrao
              </button>
              <button
                onClick={handleSavePrompt}
                disabled={!hasUnsavedChanges}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all disabled:opacity-30 hover:brightness-110"
                style={{
                  background: hasUnsavedChanges
                    ? 'linear-gradient(135deg, var(--accent-rose), var(--accent-wine))'
                    : 'var(--bg-elevated)',
                  color: 'white'
                }}
              >
                <Save size={16} />
                Salvar Alteracoes
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatDrawer;
