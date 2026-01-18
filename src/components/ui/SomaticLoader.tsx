// src/components/ui/SomaticLoader.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface SomaticLoaderProps {
  text?: string;
}

export const SomaticLoader: React.FC<SomaticLoaderProps> = ({ text = "ANALISANDO BIO-DADOS..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Ring - Breathing */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-rose-500/20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Middle Ring - Rotating */}
        <motion.div
          className="absolute inset-2 rounded-full border-t-2 border-rose-500/60"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner Core - Pulse */}
        <motion.div
          className="w-4 h-4 bg-rose-600 rounded-full blur-[2px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
          }}
        />
      </div>
      
      {/* Technical Text */}
      <div className="space-y-1 text-center">
        <motion.p 
          className="text-xs font-bold tracking-[0.3em] text-rose-400/80 uppercase"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
        <p className="text-[10px] text-slate-600 font-mono">
          A100 NEURAL LINK ESTABLISHED
        </p>
      </div>
    </div>
  );
};
