// src/components/MemoryViewer.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Play, Settings2, Info } from 'lucide-react';
import { Button } from './Button';
import { SomaticLoader } from './ui/SomaticLoader';
import { HeatSlider } from './ui/HeatSlider';
import { SomaticBackend, IntimacyResponse } from '../services/api';
import { OllamaService } from '../services/ollama';

interface MemoryViewerProps {
  files: File[];
  onReset: () => void;
}

export const MemoryViewer: React.FC<MemoryViewerProps> = ({ files, onReset }) => {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  
  // State Machine: SETUP -> PROCESSING -> REVEAL
  const [viewState, setViewState] = useState<'SETUP' | 'PROCESSING' | 'REVEAL'>('SETUP');
  const [heatLevel, setHeatLevel] = useState(1);
  const [result, setResult] = useState<IntimacyResponse | null>(null);

  // Load random file on mount or reset
  useEffect(() => {
    if (files.length > 0 && !currentFile) {
      const random = files[Math.floor(Math.random() * files.length)];
      setCurrentFile(random);
      const url = URL.createObjectURL(random);
      setPhotoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [files, currentFile]);

  const handleProcess = async () => {
    if (!photoUrl) return;
    setViewState('PROCESSING');

    try {
      // Tenta Modal primeiro
      const data = await SomaticBackend.processSession(photoUrl, heatLevel);

      // Se retornou erro no campo, usa fallback
      if (data.error) {
        console.warn('Modal falhou, usando Ollama fallback');
        const fallback = await OllamaService.generateFallbackChallenge(heatLevel);
        setResult({
          instruction_title_pt_br: fallback.title,
          instruction_text_pt_br: fallback.instruction,
          clinical_rationale_pt_br: fallback.rationale,
          intensity_metric: heatLevel,
          duration_sec: 120,
          error: 'Usando Ollama local'
        });
      } else {
        setResult(data);
      }
      setViewState('REVEAL');
    } catch (e) {
      console.error('Modal error, trying Ollama:', e);

      // Fallback para Ollama
      try {
        const fallback = await OllamaService.generateFallbackChallenge(heatLevel);
        setResult({
          instruction_title_pt_br: fallback.title,
          instruction_text_pt_br: fallback.instruction,
          clinical_rationale_pt_br: fallback.rationale,
          intensity_metric: heatLevel,
          duration_sec: 120,
          error: 'Usando Ollama local'
        });
        setViewState('REVEAL');
      } catch (ollamaError) {
        console.error('Ollama also failed:', ollamaError);
        setViewState('SETUP');
      }
    }
  };

  const nextSession = () => {
    const random = files[Math.floor(Math.random() * files.length)];
    setCurrentFile(random);
    const url = URL.createObjectURL(random);
    setPhotoUrl(url);
    setViewState('SETUP');
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[85vh] flex flex-col md:flex-row gap-8 items-center justify-center p-6 relative">
      
      {/* LEFT COLUMN: VISUAL CONTEXT */}
      <motion.div 
        layout
        className="relative w-full md:w-1/2 aspect-[3/4] md:aspect-[4/5] bg-warm-950 rounded-lg overflow-hidden border border-warm-900 shadow-2xl group"
      >
        <AnimatePresence mode="wait">
          {photoUrl && (
            <motion.img
              key={photoUrl}
              src={photoUrl}
              alt="Memory"
              initial={{ opacity: 0, scale: 1.1, filter: 'grayscale(100%)' }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                filter: viewState === 'REVEAL' ? 'grayscale(0%)' : 'grayscale(100%) brightness(0.7)'
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "circOut" }}
              className="w-full h-full object-cover"
            />
          )}
        </AnimatePresence>
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-warm-950 via-transparent to-transparent opacity-80" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
           <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md border ${
             viewState === 'REVEAL' 
               ? 'bg-rose-900/30 border-rose-500/50 text-rose-200' 
               : 'bg-slate-900/30 border-slate-700/50 text-slate-400'
           }`}>
             {viewState === 'PROCESSING' ? 'Analyzing...' : viewState === 'REVEAL' ? 'Active Session' : 'Standby'}
           </div>
        </div>
      </motion.div>

      {/* RIGHT COLUMN: CONTROL & REVELATION */}
      <div className="w-full md:w-1/2 space-y-8 relative min-h-[400px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* STATE: SETUP */}
          {viewState === 'SETUP' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <Settings2 className="w-6 h-6 text-rose-500" />
                  Calibrate Session
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Select the physiological intensity for this memory intervention.
                  Dr. Elena will analyze the visual context to generate a specific challenge.
                </p>
              </div>

              <div className="p-6 bg-warm-900/20 border border-warm-800 rounded-xl backdrop-blur-sm">
                <HeatSlider value={heatLevel} onChange={setHeatLevel} />
              </div>

              <div className="pt-4 flex gap-4">
                <Button onClick={handleProcess} className="flex-1 h-14 text-lg" icon={<Play className="w-4 h-4 fill-current" />}>
                  Initialize Protocol
                </Button>
              </div>
            </motion.div>
          )}

          {/* STATE: PROCESSING */}
          {viewState === 'PROCESSING' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              <SomaticLoader text="SYNCHRONIZING..." />
            </motion.div>
          )}

          {/* STATE: REVEAL */}
          {viewState === 'REVEAL' && result && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Clinical Card */}
              <div className="relative p-8 border-l-4 border-rose-600 bg-gradient-to-r from-warm-900/40 to-transparent backdrop-blur-md">
                <div className="absolute -top-3 left-6 px-2 bg-warm-950 text-rose-500 text-xs font-bold uppercase tracking-widest">
                  {result.instruction_title_pt_br}
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight font-serif italic mb-6">
                  "{result.instruction_text_pt_br}"
                </h3>

                <div className="flex items-start gap-3 mt-8 pt-6 border-t border-white/5">
                  <Info className="w-4 h-4 text-warm-500 mt-1 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-warm-500 font-bold tracking-widest">Clinical Rationale</p>
                    <p className="text-xs text-warm-300 leading-relaxed font-mono">
                      {result.clinical_rationale_pt_br}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats / Controls */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-900/50 border border-slate-800 rounded text-center">
                   <p className="text-[10px] text-slate-500 uppercase">Duration</p>
                   <p className="text-xl font-bold text-white">{result.duration_sec}s</p>
                 </div>
                 <div className="p-4 bg-slate-900/50 border border-slate-800 rounded text-center">
                   <p className="text-[10px] text-slate-500 uppercase">Intensity</p>
                   <p className="text-xl font-bold text-rose-500">{result.intensity_metric}/10</p>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={nextSession} variant="secondary" className="flex-1" icon={<RefreshCw className="w-4 h-4" />}>
                  Next Memory
                </Button>
                <Button onClick={onReset} variant="outline" className="flex-none">
                  End
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
