import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useTheme } from '../context/ThemeContext';
import { Settings, Cpu, Flame, Coffee } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini-api-key');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSaveKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem('gemini-api-key', val);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Config">
      <div className="space-y-8 font-mono">
        {/* Atmosfera Section */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Settings size={12} /> Atmosfera
          </h3>

          <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
            <button
              onClick={() => setTheme('warm')}
              className={`
                relative py-4 rounded-lg text-sm font-bold transition-all duration-300 overflow-hidden
                ${theme === 'warm' ? 'text-[#2d1810] bg-[#d4a574]' : 'text-muted-foreground hover:bg-white/5'}
              `}
            >
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Coffee size={16} />
                <span>WARM</span>
              </div>
            </button>

            <button
              onClick={() => setTheme('hot')}
              className={`
                relative py-4 rounded-lg text-sm font-bold transition-all duration-300 overflow-hidden
                ${theme === 'hot' ? 'text-[#1a0a0a] bg-[#ff6b6b]' : 'text-muted-foreground hover:bg-white/5'}
              `}
            >
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Flame size={16} />
                <span>HOT</span>
              </div>
            </button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-2">
            {theme === 'hot' ? 'Intenso, escuro, vermelho profundo.' : 'Aconchegante, marrom, dourado suave.'}
          </p>
        </div>

        {/* Neural Connection Section */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Cpu size={12} /> Conexao Neural
          </h3>

          <div className="space-y-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              placeholder="Gemini API Key"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none transition-colors text-foreground"
            />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              A chave e usada localmente para acessar o modelo de linguagem.
              Sua chave nunca e enviada para nossos servidores.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
