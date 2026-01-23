// src/components/MemoryViewer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RefreshCw, Info, AlertTriangle, X, ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import { SomaticLoader } from './ui/SomaticLoader';
import { HotCocoaSlider } from './ui/HotCocoaSlider';
import { SomaticBackend, IntimacyResponse } from '@/services/api';
import { OllamaService } from '@/services/ollama';
import { useTheme } from '@/context/ThemeContext';

interface MemoryViewerProps {
  files: File[];
  onReset: () => void;
}

interface RoundData {
  file: File;
  photoUrl: string;
  result: IntimacyResponse | null;
}

export const MemoryViewer: React.FC<MemoryViewerProps> = ({ files, onReset }) => {
  const { mode } = useTheme();
  const TOTAL_ROUNDS = Math.min(files.length, 10);

  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [viewState, setViewState] = useState<'SETUP' | 'PROCESSING' | 'REVEAL'>('SETUP');
  const [heatLevel, setHeatLevel] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Swipe state
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Inicializar rodadas
  useEffect(() => {
    if (files.length > 0 && rounds.length === 0) {
      const shuffled = [...files].sort(() => Math.random() - 0.5);
      const selectedFiles = shuffled.slice(0, TOTAL_ROUNDS);
      const initialRounds: RoundData[] = selectedFiles.map(file => ({
        file,
        photoUrl: URL.createObjectURL(file),
        result: null
      }));
      setRounds(initialRounds);
    }
  }, [files, rounds.length, TOTAL_ROUNDS]);

  // Cleanup URLs
  useEffect(() => {
    return () => {
      rounds.forEach(round => {
        if (round.photoUrl) URL.revokeObjectURL(round.photoUrl);
      });
    };
  }, [rounds]);

  const currentRoundData = rounds[currentRound - 1];
  const photoUrl = currentRoundData?.photoUrl || '';
  const result = currentRoundData?.result || null;

  // Navigation
  const handlePrevious = useCallback(() => {
    if (currentRound > 1) {
      setCurrentRound(prev => prev - 1);
      const prevRound = rounds[currentRound - 2];
      setViewState(prevRound?.result ? 'REVEAL' : 'SETUP');
    }
  }, [currentRound, rounds]);

  const handleNext = useCallback(() => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound(prev => prev + 1);
      const nextRound = rounds[currentRound];
      setViewState(nextRound?.result ? 'REVEAL' : 'SETUP');
    }
  }, [currentRound, TOTAL_ROUNDS, rounds]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSwiping) setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    const diff = touchStart - touchEnd;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      diff > 0 ? handleNext() : handlePrevious();
    }
  };

  // Process round
  const handleProcess = async () => {
    if (!photoUrl) return;
    setErrorMessage(null);
    setViewState('PROCESSING');

    try {
      const data = await SomaticBackend.processSession(photoUrl, heatLevel);
      let finalResult: IntimacyResponse;

      if (data.error) {
        const fallback = await OllamaService.generateFallbackChallenge(heatLevel);
        finalResult = {
          challenge_title: fallback.title,
          challenge_text: fallback.instruction,
          rationale: fallback.rationale,
          intensity: heatLevel,
          duration_seconds: 120,
          error: 'Usando Ollama local'
        };
      } else {
        finalResult = data;
      }

      setRounds(prev => prev.map((round, idx) =>
        idx === currentRound - 1 ? { ...round, result: finalResult } : round
      ));
      setViewState('REVEAL');
    } catch (e) {
      try {
        const fallback = await OllamaService.generateFallbackChallenge(heatLevel);
        const finalResult: IntimacyResponse = {
          challenge_title: fallback.title,
          challenge_text: fallback.instruction,
          rationale: fallback.rationale,
          intensity: heatLevel,
          duration_seconds: 120,
          error: 'Usando Ollama local'
        };
        setRounds(prev => prev.map((round, idx) =>
          idx === currentRound - 1 ? { ...round, result: finalResult } : round
        ));
        setViewState('REVEAL');
      } catch {
        setErrorMessage('Nao foi possivel conectar aos servidores.');
        setViewState('SETUP');
      }
    }
  };

  const handleNextRound = () => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound(prev => prev + 1);
      setViewState('SETUP');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mb-2 p-3 rounded-xl flex items-start gap-3"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)' }}
          >
            <AlertTriangle size={20} style={{ color: '#f87171' }} />
            <p className="flex-1 text-sm" style={{ color: '#fca5a5' }}>{errorMessage}</p>
            <button onClick={() => setErrorMessage(null)} className="p-1">
              <X size={16} style={{ color: '#f87171' }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Display Area - 45% */}
      <div
        className="w-full flex items-center justify-center overflow-hidden relative transition-colors duration-300"
        style={{ height: '45%', backgroundColor: 'var(--hotcocoa-bg)' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          {photoUrl && (
            <motion.img
              key={photoUrl}
              src={photoUrl}
              alt="Memoria"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                filter: viewState === 'REVEAL' ? 'grayscale(0%)' : 'grayscale(50%) brightness(0.8)'
              }}
              exit={{ opacity: 0 }}
              className="w-full h-full object-cover"
            />
          )}
        </AnimatePresence>

        {/* Swipe indicators */}
        {currentRound > 1 && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-30">
            <ChevronLeft size={24} style={{ color: 'var(--hotcocoa-text-primary)' }} />
          </div>
        )}
        {currentRound < TOTAL_ROUNDS && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30">
            <ChevronRight size={24} style={{ color: 'var(--hotcocoa-text-primary)' }} />
          </div>
        )}
      </div>

      {/* Round Indicator */}
      <div
        className="py-3 text-center transition-colors duration-300"
        style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
      >
        <span
          className="text-sm transition-colors duration-300"
          style={{ color: 'var(--hotcocoa-text-secondary)' }}
        >
          Rodada {currentRound} de {TOTAL_ROUNDS}
        </span>
      </div>

      {/* Control Area - MD3 Card - 55% */}
      <div
        className="flex-1 flex flex-col px-6 pt-6 transition-colors duration-300"
        style={{
          backgroundColor: 'var(--hotcocoa-card-bg)',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom))'
        }}
      >
        <AnimatePresence mode="wait">
          {/* SETUP State */}
          {viewState === 'SETUP' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
            >
              <h3
                className="text-2xl mb-4 text-center transition-colors duration-300 flex items-center justify-center gap-2"
                style={{ color: 'var(--hotcocoa-accent)' }}
              >
                <Settings2 size={24} />
                Calibrar Sessao
              </h3>

              <p
                className="text-sm text-center mb-6 opacity-80 transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-primary)' }}
              >
                Selecione a intensidade para esta memoria.
              </p>

              {/* Intensity Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label
                    className="text-sm uppercase tracking-wider transition-colors duration-300"
                    style={{ color: 'var(--hotcocoa-text-secondary)' }}
                  >
                    Intensity Level
                  </label>
                  <span
                    className="text-sm transition-colors duration-300"
                    style={{ color: 'var(--hotcocoa-text-primary)' }}
                  >
                    {heatLevel}/10
                  </span>
                </div>

                <HotCocoaSlider
                  value={[heatLevel]}
                  onValueChange={(values) => setHeatLevel(values[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />

                <div className="flex justify-between mt-2 px-1">
                  <span className="text-xs" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
                    SENSATE
                  </span>
                  <span className="text-xs" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
                    SOMATIC
                  </span>
                </div>
              </div>

              <div className="flex-1" />

              <button
                onClick={handleProcess}
                className="w-full py-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 touch-target"
                style={{
                  backgroundColor: 'var(--hotcocoa-accent)',
                  color: mode === 'warm' ? '#3d2817' : '#000',
                  borderRadius: '12px',
                  minHeight: '48px'
                }}
              >
                <Play size={24} />
                INICIAR PROTOCOLO
              </button>
            </motion.div>
          )}

          {/* PROCESSING State */}
          {viewState === 'PROCESSING' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <SomaticLoader text="SINCRONIZANDO..." />
            </motion.div>
          )}

          {/* REVEAL State */}
          {viewState === 'REVEAL' && result && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col space-y-4"
            >
              {/* Challenge Card */}
              <div
                className="p-4 rounded-xl shadow-lg"
                style={{
                  backgroundColor: 'var(--hotcocoa-bg)',
                  borderLeft: '4px solid var(--hotcocoa-accent)'
                }}
              >
                <div
                  className="text-xs uppercase tracking-widest mb-2"
                  style={{ color: 'var(--hotcocoa-accent)' }}
                >
                  {result.challenge_title}
                </div>
                <p
                  className="text-base text-center leading-relaxed"
                  style={{ color: 'var(--hotcocoa-text-primary)' }}
                >
                  "{result.challenge_text}"
                </p>
              </div>

              {/* Rationale */}
              <details className="group">
                <summary
                  className="flex items-center gap-2 text-xs cursor-pointer list-none"
                  style={{ color: 'var(--hotcocoa-text-secondary)' }}
                >
                  <Info size={14} />
                  <span>Ver fundamentacao</span>
                </summary>
                <div
                  className="mt-2 p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
                >
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
                    {result.rationale}
                  </p>
                  {result?.error && (
                    <div className="mt-2 text-xs uppercase tracking-wider" style={{ color: 'var(--accent-gold)', opacity: 0.6 }}>
                      Modo Offline (Ollama)
                    </div>
                  )}
                </div>
              </details>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
                >
                  <p className="text-xs uppercase" style={{ color: 'var(--hotcocoa-text-secondary)' }}>Duracao</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--hotcocoa-text-primary)' }}>{result.duration_seconds}s</p>
                </div>
                <div
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
                >
                  <p className="text-xs uppercase" style={{ color: 'var(--hotcocoa-text-secondary)' }}>Intensidade</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--hotcocoa-accent)' }}>{result.intensity}/10</p>
                </div>
              </div>

              <div className="flex-1" />

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentRound === 1}
                  className="flex-1 py-3 rounded-xl font-medium disabled:opacity-40 active:scale-95 transition-all touch-target"
                  style={{
                    backgroundColor: 'var(--hotcocoa-bg)',
                    color: 'var(--hotcocoa-text-secondary)',
                    border: '1px solid var(--hotcocoa-border)',
                    minHeight: '48px'
                  }}
                >
                  Voltar
                </button>

                {currentRound < TOTAL_ROUNDS ? (
                  <button
                    onClick={handleNextRound}
                    className="flex-1 py-3 rounded-xl font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 touch-target"
                    style={{
                      backgroundColor: 'var(--hotcocoa-accent)',
                      color: mode === 'warm' ? '#3d2817' : '#000',
                      minHeight: '48px'
                    }}
                  >
                    Proxima Rodada
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={onReset}
                    className="flex-1 py-3 rounded-xl font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 touch-target"
                    style={{
                      backgroundColor: 'var(--hotcocoa-accent)',
                      color: mode === 'warm' ? '#3d2817' : '#000',
                      minHeight: '48px'
                    }}
                  >
                    <RefreshCw size={18} />
                    Finalizar
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
