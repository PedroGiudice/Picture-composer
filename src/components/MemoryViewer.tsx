// src/components/MemoryViewer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Play, Settings2, Info, AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { SomaticLoader } from './ui/SomaticLoader';
import { HeatSlider } from './ui/HeatSlider';
import { SomaticBackend, IntimacyResponse } from '../services/api';
import { OllamaService } from '../services/ollama';

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
  // Configuracao de rodadas
  const TOTAL_ROUNDS = Math.min(files.length, 10);

  // State de rodadas
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [currentRound, setCurrentRound] = useState(1);

  // State Machine: SETUP -> PROCESSING -> REVEAL
  const [viewState, setViewState] = useState<'SETUP' | 'PROCESSING' | 'REVEAL'>('SETUP');
  const [heatLevel, setHeatLevel] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Swipe state
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Inicializar rodadas com fotos aleatorias
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

  // Cleanup: revogar URLs ao desmontar
  useEffect(() => {
    return () => {
      rounds.forEach(round => {
        if (round.photoUrl) {
          URL.revokeObjectURL(round.photoUrl);
        }
      });
    };
  }, [rounds]);

  // Dados da rodada atual
  const currentRoundData = rounds[currentRound - 1];
  const photoUrl = currentRoundData?.photoUrl || '';
  const result = currentRoundData?.result || null;

  // Navegacao entre rodadas
  const handlePrevious = useCallback(() => {
    if (currentRound > 1) {
      setCurrentRound(prev => prev - 1);
      // Se a rodada anterior ja foi processada, mostra REVEAL
      const prevRound = rounds[currentRound - 2];
      if (prevRound?.result) {
        setViewState('REVEAL');
      } else {
        setViewState('SETUP');
      }
    }
  }, [currentRound, rounds]);

  const handleNext = useCallback(() => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound(prev => prev + 1);
      // Verifica se a proxima rodada ja foi processada
      const nextRound = rounds[currentRound];
      if (nextRound?.result) {
        setViewState('REVEAL');
      } else {
        setViewState('SETUP');
      }
    }
  }, [currentRound, TOTAL_ROUNDS, rounds]);

  // Touch handlers para swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSwiping) {
      setTouchEnd(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    const diff = touchStart - touchEnd;
    const threshold = 50; // pixels minimos para considerar swipe

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe para esquerda = proxima
        handleNext();
      } else {
        // Swipe para direita = anterior
        handlePrevious();
      }
    }
  };

  // Processar rodada atual
  const handleProcess = async () => {
    if (!photoUrl) return;
    setErrorMessage(null);
    setViewState('PROCESSING');

    try {
      const data = await SomaticBackend.processSession(photoUrl, heatLevel);

      let finalResult: IntimacyResponse;

      if (data.error) {
        console.warn('Modal falhou, usando Ollama fallback');
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

      // Atualizar resultado da rodada atual
      setRounds(prev => prev.map((round, idx) =>
        idx === currentRound - 1
          ? { ...round, result: finalResult }
          : round
      ));

      setViewState('REVEAL');
    } catch (e) {
      console.error('Modal error, trying Ollama:', e);

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
          idx === currentRound - 1
            ? { ...round, result: finalResult }
            : round
        ));

        setViewState('REVEAL');
      } catch (ollamaError) {
        console.error('Ollama also failed:', ollamaError);
        setErrorMessage('Nao foi possivel conectar aos servidores. Verifique sua conexao e tente novamente.');
        setViewState('SETUP');
      }
    }
  };

  // Avancar para proxima rodada apos REVEAL
  const handleNextRound = () => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound(prev => prev + 1);
      setViewState('SETUP');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto min-h-[100dvh] flex flex-col px-4 py-6 relative">

      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-4 p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 text-sm">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 active:text-red-300 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Container de Foto com Swipe */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-[var(--color-surface)] shadow-2xl"
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
              initial={{ opacity: 0, x: isSwiping ? (touchStart - touchEnd > 0 ? 50 : -50) : 0 }}
              animate={{
                opacity: 1,
                x: 0,
                filter: viewState === 'REVEAL' ? 'grayscale(0%)' : 'grayscale(50%) brightness(0.8)'
              }}
              exit={{ opacity: 0, x: isSwiping ? (touchStart - touchEnd > 0 ? -50 : 50) : 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full object-cover"
            />
          )}
        </AnimatePresence>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Indicadores de swipe (setas sutis) */}
        {currentRound > 1 && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30">
            <ChevronLeft className="w-6 h-6" />
          </div>
        )}
        {currentRound < TOTAL_ROUNDS && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30">
            <ChevronRight className="w-6 h-6" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md border ${
            viewState === 'REVEAL'
              ? 'bg-rose-900/40 border-rose-500/50 text-rose-200'
              : viewState === 'PROCESSING'
              ? 'bg-amber-900/40 border-amber-500/50 text-amber-200'
              : 'bg-slate-900/40 border-slate-700/50 text-slate-300'
          }`}>
            {viewState === 'PROCESSING' ? 'Analisando...' : viewState === 'REVEAL' ? 'Ativa' : 'Preparar'}
          </div>
        </div>
      </div>

      {/* Indicador de Progresso */}
      <div className="flex items-center justify-center gap-2 py-4">
        <span className="text-sm text-slate-400">
          Rodada {currentRound} de {TOTAL_ROUNDS}
        </span>
      </div>

      {/* Area de Conteudo */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">

          {/* STATE: SETUP */}
          {viewState === 'SETUP' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col space-y-6"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                  <Settings2 className="w-5 h-5 text-[var(--color-primary)]" />
                  Calibrar Sessao
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Selecione a intensidade para esta memoria.
                </p>
              </div>

              <div className="p-4 bg-[var(--color-surface)] border border-slate-800 rounded-xl">
                <HeatSlider value={heatLevel} onChange={setHeatLevel} />
              </div>

              <div className="flex-1" />

              <Button
                onClick={handleProcess}
                className="w-full min-h-[48px] text-base"
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                Iniciar Protocolo
              </Button>
            </motion.div>
          )}

          {/* STATE: PROCESSING */}
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

          {/* STATE: REVEAL */}
          {viewState === 'REVEAL' && result && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex-1 flex flex-col space-y-4"
            >
              {/* Card de Pergunta/Desafio */}
              <div className="p-4 rounded-xl bg-[var(--color-surface)] shadow-lg border-l-4 border-[var(--color-primary)]">
                <div className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-widest mb-2">
                  {result.challenge_title}
                </div>
                <p className="text-base text-white text-center leading-relaxed font-medium">
                  "{result.challenge_text}"
                </p>
              </div>

              {/* Rationale (colapsavel) */}
              <details className="group">
                <summary className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer list-none">
                  <Info className="w-3 h-3" />
                  <span>Ver fundamentacao</span>
                </summary>
                <div className="mt-2 p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {result.rationale}
                  </p>
                  {result?.error && (
                    <div className="mt-2 text-[9px] text-amber-500/60 uppercase tracking-wider">
                      Modo Offline (Ollama)
                    </div>
                  )}
                </div>
              </details>

              {/* Stats compactos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Duracao</p>
                  <p className="text-lg font-bold text-white">{result.duration_seconds}s</p>
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Intensidade</p>
                  <p className="text-lg font-bold text-[var(--color-primary)]">{result.intensity}/10</p>
                </div>
              </div>

              <div className="flex-1" />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Botoes de Navegacao Explicitos - Sempre visiveis exceto em PROCESSING */}
      {viewState !== 'PROCESSING' && (
        <div className="flex gap-4 mt-4 pt-4 border-t border-slate-800/50">
          <button
            onClick={handlePrevious}
            disabled={currentRound === 1}
            className="flex-1 min-h-[48px] py-3 rounded-xl bg-[var(--color-surface)] text-slate-400 font-medium disabled:opacity-40 active:scale-[0.98] transition-all duration-150 border border-slate-800"
          >
            Voltar
          </button>

          {viewState === 'REVEAL' && currentRound < TOTAL_ROUNDS ? (
            <button
              onClick={handleNextRound}
              className="flex-1 min-h-[48px] py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
            >
              Proxima Rodada
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : viewState === 'REVEAL' && currentRound === TOTAL_ROUNDS ? (
            <button
              onClick={onReset}
              className="flex-1 min-h-[48px] py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Finalizar
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentRound === TOTAL_ROUNDS}
              className="flex-1 min-h-[48px] py-3 rounded-xl bg-[var(--color-surface)] text-slate-400 font-medium disabled:opacity-40 active:scale-[0.98] transition-all duration-150 border border-slate-800"
            >
              Pular
            </button>
          )}
        </div>
      )}
    </div>
  );
};
