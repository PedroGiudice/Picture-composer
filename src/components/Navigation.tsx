// src/components/Navigation.tsx
import React, { useState } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ConfigModal } from './ConfigModal';

interface NavigationProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  onBack,
  showBackButton = false
}) => {
  const { theme: mode } = useTheme();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-12 transition-colors duration-300"
        style={{
          backgroundColor: 'var(--hotcocoa-header-bg)',
          paddingTop: 'env(safe-area-inset-top)'
        }}
      >
        {/* Back Button - Left */}
        <div className="flex-1">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 active:scale-95 touch-target"
              aria-label="Voltar"
              style={{
                minWidth: '48px',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowLeft
                size={24}
                style={{ color: 'var(--hotcocoa-text-secondary)' }}
              />
            </button>
          )}
        </div>

        {/* Title + Mode Badge - Center */}
        <div className="flex items-center gap-2">
          <h1
            className="text-xl tracking-wide transition-colors duration-300"
            style={{ color: 'var(--hotcocoa-accent)' }}
          >
            HotCocoa
          </h1>
          <div
            className="px-2 py-0.5 rounded-full text-xs uppercase transition-all duration-300"
            style={{
              backgroundColor: 'var(--hotcocoa-accent)',
              color: mode === 'warm' ? '#3d2817' : '#000',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            {mode}
          </div>
        </div>

        {/* Settings Button - Right */}
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => setIsConfigOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 active:scale-95 touch-target"
            aria-label="Configuracoes"
            style={{
              minWidth: '48px',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Settings
              size={24}
              style={{ color: 'var(--hotcocoa-text-secondary)' }}
            />
          </button>
        </div>
      </header>

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </>
  );
};
