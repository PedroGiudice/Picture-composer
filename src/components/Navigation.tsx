// src/components/Navigation.tsx
import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { ConfigPanel } from './ConfigPanel';
import { AppState } from '../types';

interface NavigationProps {
  onNavigate: (view: AppState) => void;
  currentView: AppState | string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  onNavigate,
  currentView,
  onBack,
  showBackButton = true
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onNavigate('UPLOAD');
    }
  };

  return (
    <header
      className="
        fixed top-0 left-0 right-0
        h-12
        flex items-center justify-between
        px-4
        bg-[var(--bg-void)]/95
        backdrop-blur-sm
        border-b border-white/5
        z-50
        safe-area-top
      "
    >
      {/* Back Button - Left */}
      <div className="w-10">
        {showBackButton && currentView !== 'UPLOAD' ? (
          <button
            onClick={handleBack}
            className="
              w-10 h-10
              flex items-center justify-center
              rounded-full
              active:bg-white/10
              transition-colors duration-150
            "
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>

      {/* Title - Center */}
      <h1
        className="
          text-base font-semibold
          text-[var(--text-primary)]
          font-monaspice
          tracking-wide
        "
      >
        HotCocoa
      </h1>

      {/* Settings Button - Right */}
      <div className="w-10">
        <ConfigPanel />
      </div>
    </header>
  );
};
