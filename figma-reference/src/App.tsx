import React, { useState } from 'react';
import { Camera, User, SlidersHorizontal, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme, ThemeProvider } from './context/ThemeContext';
import { HeatSlider } from './components/HeatSlider';
import { ConfigModal } from './components/ConfigModal';
import { PromptSelectorModal } from './components/PromptSelectorModal';
import { DemoControls } from './components/DemoControls';
import clsx from 'clsx';

// Main App Component Content
function AppContent() {
  const { theme } = useTheme();
  
  // App State
  const [currentView, setCurrentView] = useState<'setup' | 'chat'>('setup');
  const [showConfig, setShowConfig] = useState(false);
  const [showPersona, setShowPersona] = useState(false);
  
  // Data State
  const [intensity, setIntensity] = useState(3);
  const [context, setContext] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('poet');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Olá. Vejo que você enviou uma foto interessante. O ambiente parece íntimo. Vamos começar com algo leve?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleStartSession = () => {
    // Just move to chat for now
    setCurrentView('chat');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    setMessages([...messages, { role: 'user', content: inputMessage }]);
    setInputMessage('');
    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Interessante. Aumente a intensidade. O que você sente agora?' }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-background text-foreground overflow-hidden relative font-mono transition-colors duration-500">
      {/* Header / Logo Area */}
      <div className="pt-8 pb-4 text-center z-10">
        <h1 className="text-2xl font-bold tracking-[0.2em] uppercase text-primary">
          {theme === 'hot' ? 'HOTCOCOA' : 'WARMCOCOA'}
        </h1>
        <p className="text-[10px] text-muted-foreground tracking-[0.3em] mt-1">
          PICTURE COMPOSER
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'setup' ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col px-6 pb-24 overflow-y-auto custom-scrollbar"
            >
              {/* Image Upload Area */}
              <div className="flex-1 flex flex-col justify-center min-h-[300px]">
                <label className="relative group cursor-pointer w-full aspect-[3/4] rounded-xl border border-white/10 bg-card/50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50 hover:bg-card/80">
                  {selectedImage ? (
                    <img src={selectedImage} alt="Upload" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground group-hover:text-primary transition-colors">
                      <div className="p-4 rounded-full bg-white/5 group-hover:bg-primary/10 transition-colors">
                        <Camera size={32} />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-xs font-bold tracking-widest uppercase">Adicione uma foto</p>
                        <p className="text-[10px] opacity-60">Para o Game Master</p>
                      </div>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              {/* Controls */}
              <div className="mt-6 space-y-6">
                <HeatSlider value={intensity} onChange={setIntensity} />

                <div className="relative">
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Contexto: Jantar, Sofá..."
                    className="w-full bg-card border border-white/10 rounded-xl p-4 text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Sparkles size={16} />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartSession}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(255,107,107,0.3)] hover:shadow-[0_0_30px_rgba(255,107,107,0.5)] transition-shadow"
                >
                  Iniciar Sessão
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col px-4 pb-24"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 py-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`
                        max-w-[80%] p-3 rounded-xl text-sm leading-relaxed
                        ${msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-br-none' 
                          : 'bg-card border border-white/10 rounded-bl-none text-foreground'}
                      `}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="relative mt-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Responda ao Game Master..."
                  className="w-full bg-card border border-white/10 rounded-xl p-4 pr-12 text-sm focus:border-primary focus:outline-none"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-foreground transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              
              <button 
                onClick={() => setCurrentView('setup')}
                className="mt-4 text-[10px] text-muted-foreground hover:text-primary uppercase tracking-widest text-center"
              >
                Voltar para Configuração
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/90 to-transparent z-20 flex items-end justify-center pb-6">
        <div className="flex items-center gap-12 text-muted-foreground">
          <NavButton 
            icon={<Camera size={24} />} 
            label="Studio" 
            isActive={!showConfig && !showPersona && currentView === 'setup'} 
            onClick={() => {
              setCurrentView('setup');
              setShowConfig(false);
              setShowPersona(false);
            }} 
          />
          <NavButton 
            icon={<User size={24} />} 
            label="Persona" 
            isActive={showPersona} 
            onClick={() => setShowPersona(true)} 
          />
          <NavButton 
            icon={<SlidersHorizontal size={24} />} 
            label="Config" 
            isActive={showConfig} 
            onClick={() => setShowConfig(true)} 
          />
        </div>
      </div>

      {/* Modals */}
      <ConfigModal isOpen={showConfig} onClose={() => setShowConfig(false)} />
      <PromptSelectorModal 
        isOpen={showPersona} 
        onClose={() => setShowPersona(false)} 
        selectedPersona={selectedPersona}
        onSelectPersona={setSelectedPersona}
      />

      {/* Demo Controls */}
      <DemoControls />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
      </div>
    </div>
  );
}

const NavButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={clsx(
      "flex flex-col items-center gap-1 transition-all duration-300",
      isActive ? "text-primary scale-110" : "hover:text-foreground"
    )}
  >
    {icon}
    <span className={clsx(
      "text-[8px] uppercase tracking-widest font-bold",
      isActive ? "opacity-100" : "opacity-0"
    )}>
      {label}
    </span>
    {isActive && (
      <motion.div 
        layoutId="nav-indicator"
        className="absolute bottom-[-10px] w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_var(--color-primary)]"
      />
    )}
  </button>
);

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
