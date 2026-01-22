// src/components/DemoControls.tsx
import React from 'react';
import { Home, Eye, MessageCircle, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DemoControlsProps {
  currentScreen: 'home' | 'viewing' | 'mosaic' | 'chat';
  onScreenChange: (screen: 'home' | 'viewing' | 'mosaic' | 'chat') => void;
  onConfigOpen: () => void;
}

export function DemoControls({ currentScreen, onScreenChange, onConfigOpen }: DemoControlsProps) {
  const { mode } = useTheme();

  const getActiveColor = () => mode === 'warm' ? '#3d2817' : '#000';

  return (
    <div
      className="fixed bottom-20 right-4 flex flex-col gap-2 z-[60] p-3 rounded-xl shadow-lg transition-colors duration-300"
      style={{
        backgroundColor: 'var(--hotcocoa-card-bg)',
        border: '1px solid var(--hotcocoa-border)',
        borderRadius: '12px'
      }}
    >
      <div
        className="text-xs mb-2 text-center transition-colors duration-300"
        style={{ color: 'var(--hotcocoa-text-secondary)' }}
      >
        Demo
      </div>

      <button
        onClick={() => onScreenChange('home')}
        className={`p-2 rounded-lg transition-all duration-300 active:scale-95 ${currentScreen === 'home' ? 'scale-110' : 'opacity-60'}`}
        style={{
          backgroundColor: currentScreen === 'home' ? 'var(--hotcocoa-accent)' : 'transparent',
          minWidth: '48px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Home Screen"
      >
        <Home
          size={24}
          style={{
            color: currentScreen === 'home'
              ? getActiveColor()
              : 'var(--hotcocoa-text-primary)'
          }}
        />
      </button>

      <button
        onClick={() => onScreenChange('viewing')}
        className={`p-2 rounded-lg transition-all duration-300 active:scale-95 ${currentScreen === 'viewing' ? 'scale-110' : 'opacity-60'}`}
        style={{
          backgroundColor: currentScreen === 'viewing' ? 'var(--hotcocoa-accent)' : 'transparent',
          minWidth: '48px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Viewing Screen"
      >
        <Eye
          size={24}
          style={{
            color: currentScreen === 'viewing'
              ? getActiveColor()
              : 'var(--hotcocoa-text-primary)'
          }}
        />
      </button>

      <button
        onClick={() => onScreenChange('chat')}
        className={`p-2 rounded-lg transition-all duration-300 active:scale-95 ${currentScreen === 'chat' ? 'scale-110' : 'opacity-60'}`}
        style={{
          backgroundColor: currentScreen === 'chat' ? 'var(--hotcocoa-accent)' : 'transparent',
          minWidth: '48px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Chat Screen"
      >
        <MessageCircle
          size={24}
          style={{
            color: currentScreen === 'chat'
              ? getActiveColor()
              : 'var(--hotcocoa-text-primary)'
          }}
        />
      </button>

      <button
        onClick={onConfigOpen}
        className="p-2 rounded-lg transition-all duration-300 opacity-60 hover:opacity-100 active:scale-95"
        style={{
          minWidth: '48px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Open Config"
      >
        <Settings
          size={24}
          style={{
            color: 'var(--hotcocoa-text-primary)'
          }}
        />
      </button>
    </div>
  );
}
