import React, { useState } from 'react';
import { Modal } from './Modal';
import { Crown, Feather, Dice5, Hand, Eye, Infinity as InfinityIcon, Plus, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Persona {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const PERSONAS: Persona[] = [
  { id: 'commander', name: 'O COMANDANTE', description: 'Direto, autoritário, focado em obediência.', icon: <Crown size={20} /> },
  { id: 'poet', name: 'O POETA', description: 'Lírico, emocional, focado em conexão.', icon: <Feather size={20} /> },
  { id: 'player', name: 'O JOGADOR', description: 'Divertido, imprevisível, gamificado.', icon: <Dice5 size={20} /> },
  { id: 'sensory', name: 'O SENSORIAL', description: 'Foco em tato, cheiro e sensações lentas.', icon: <Hand size={20} /> },
  { id: 'observer', name: 'O OBSERVADOR', description: 'Pede poses e descreve cenas visuais.', icon: <Eye size={20} /> },
  { id: 'tantric', name: 'O GUIA TÂNTRICO', description: 'Respiração, energia e toques sutis.', icon: <InfinityIcon size={20} /> },
];

interface PromptSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersona: string;
  onSelectPersona: (id: string) => void;
}

export const PromptSelectorModal: React.FC<PromptSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedPersona, 
  onSelectPersona 
}) => {
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [customPrompt, setCustomPrompt] = useState('');

  // Reset mode when closing
  React.useEffect(() => {
    if (!isOpen) setMode('select');
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'select' ? "Persona" : "Criar Persona"}>
      <AnimatePresence mode="wait">
        {mode === 'select' ? (
          <motion.div 
            key="select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-1 pb-4"
          >
            <p className="text-xs text-center text-muted-foreground uppercase tracking-widest mb-4">
              Defina o Game Master
            </p>
            <p className="text-xs text-center text-muted-foreground mb-6">
              Escolha a personalidade da IA que guiará sua experiência.
            </p>

            <div className="flex flex-col gap-3">
              {PERSONAS.map((persona) => {
                const isSelected = selectedPersona === persona.id;
                return (
                  <motion.button
                    key={persona.id}
                    onClick={() => onSelectPersona(persona.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-300
                      ${isSelected 
                        ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(255,107,107,0.1)]' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'}
                    `}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-2 rounded-lg ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {persona.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-sm tracking-wide ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {persona.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {persona.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
              
              <button
                onClick={() => setMode('create')}
                className="flex items-center justify-center gap-2 p-4 mt-2 rounded-xl border-2 border-dashed border-white/20 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <Plus size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">Criar Nova Persona</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col h-full"
          >
             <div className="flex-1 bg-black/20 rounded-xl border border-white/5 p-4 mb-4 min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                <MessageSquare size={48} className="text-white/10 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Descreva como você quer que o Game Master se comporte. 
                </p>
                <p className="text-xs text-white/30 mt-2">
                  "Seja sarcástico e exigente..."
                </p>
             </div>
             
             <div className="relative">
                <input 
                  type="text" 
                  className="w-full bg-card border border-white/10 rounded-xl p-4 text-sm focus:border-primary focus:outline-none"
                  placeholder="Descreva a personalidade..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
             </div>
             
             <div className="flex gap-3 mt-4">
               <button 
                 onClick={() => setMode('select')}
                 className="flex-1 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10"
               >
                 Voltar
               </button>
               <button 
                 onClick={() => {
                   // Mock saving custom persona
                   onSelectPersona('custom');
                   onClose();
                 }}
                 className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-widest"
               >
                 Criar
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};
