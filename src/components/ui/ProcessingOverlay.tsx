// src/components/ui/ProcessingOverlay.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { NeuralLattice } from './NeuralLattice';
import { SomaticLoader } from './SomaticLoader';

interface ProcessingOverlayProps {
  isVisible: boolean;
  stage?: 'analyzing' | 'generating' | 'finalizing';
  progress?: number;
}

const stageMessages = {
  analyzing: 'ANALISANDO BIO-DADOS...',
  generating: 'GERANDO CONEXAO...',
  finalizing: 'SINCRONIZANDO...'
};

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  isVisible,
  stage = 'analyzing',
  progress
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Intensified Background */}
      <div className="absolute inset-0 opacity-60">
        <NeuralLattice text="" className="w-full h-full scale-200" />
      </div>

      {/* Central Loader */}
      <div className="relative z-10">
        <SomaticLoader text={stageMessages[stage]} />

        {/* Progress Bar (if available) */}
        {progress !== undefined && (
          <div className="mt-8 w-64 mx-auto">
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-deep)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--accent-rose), var(--accent-ember))'
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-center mt-2 text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
              {progress.toFixed(0)}%
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
