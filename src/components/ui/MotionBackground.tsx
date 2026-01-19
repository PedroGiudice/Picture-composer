// src/components/ui/MotionBackground.tsx
import React from 'react';
import { NeuralLattice } from './NeuralLattice';

interface MotionBackgroundProps {
  children: React.ReactNode;
  intensity?: 'subtle' | 'normal' | 'intense';
}

export const MotionBackground: React.FC<MotionBackgroundProps> = ({
  children,
  intensity = 'subtle'
}) => {
  const opacityMap = {
    subtle: 'opacity-20',
    normal: 'opacity-40',
    intense: 'opacity-60'
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg-void)' }}>
      {/* Animated Background Layer */}
      <div className={`absolute inset-0 ${opacityMap[intensity]} pointer-events-none`}>
        <NeuralLattice text="" className="w-full h-full scale-150" />
      </div>

      {/* Gradient Overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(225, 29, 72, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(194, 65, 12, 0.08) 0%, transparent 40%)
          `
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
