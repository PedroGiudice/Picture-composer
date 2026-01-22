// src/components/Navigation.tsx
import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Menu, Grid, Play, History, ChevronDown, MessageCircle } from 'lucide-react';
import { ConfigPanel } from './ConfigPanel';
import { useTheme } from '../context/ThemeContext';
import { AppState } from '../types';

interface NavigationProps {
  onNavigate: (view: AppState) => void;
  currentView: AppState | string;
  onChatToggle?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onNavigate, currentView, onChatToggle }) => {
  const { mode } = useTheme();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 header-mobile flex items-center"
      style={{
        background: 'rgba(10, 5, 6, 0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: 'var(--safe-area-top)'
      }}
    >
      <div className="w-full px-4 h-full flex items-center justify-between">

        {/* LOGO - compacto */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('UPLOAD')}>
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-[10px] tracking-tighter"
            style={{
              background: mode === 'HOT'
                ? 'linear-gradient(135deg, var(--accent-rose), var(--accent-ember))'
                : 'linear-gradient(135deg, #ec4899, #f59e0b)'
            }}
          >
            IO
          </div>
          <span
            className="font-bold tracking-[0.15em] text-xs uppercase"
            style={{ color: 'var(--text-primary)' }}
          >
            INTIMACY<span style={{ opacity: 0.5 }}>OS</span>
          </span>
        </div>

        {/* ACTIONS - compacto */}
        <div className="flex items-center gap-2">

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors outline-none touch-target"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  minHeight: '36px'
                }}
              >
                <Menu className="w-3.5 h-3.5 opacity-70" />
                <span className="uppercase tracking-wider hidden sm:inline">Protocolos</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] p-2 animate-slide-up-fade z-50 mr-4 mt-2"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-3)'
                }}
              >
                <DropdownMenu.Item
                  className="group flex items-center gap-3 px-3 py-3 text-sm rounded-lg cursor-pointer outline-none transition-colors touch-target"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => onNavigate('VIEWING')}
                >
                  <div
                    className="p-2 rounded transition-colors"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <Play className="w-4 h-4 fill-current" style={{ color: 'var(--accent-rose)' }} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Sessao Guiada</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Deck de Memorias</div>
                  </div>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="group flex items-center gap-3 px-3 py-3 text-sm rounded-lg cursor-pointer outline-none transition-colors mt-1 touch-target"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => onNavigate('MOSAIC_SETUP')}
                >
                  <div
                    className="p-2 rounded transition-colors"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <Grid className="w-4 h-4 fill-current" style={{ color: '#6366f1' }} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Mosaico</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Reconstrucao Visual</div>
                  </div>
                </DropdownMenu.Item>

                <DropdownMenu.Separator
                  className="h-px my-2"
                  style={{ background: 'var(--bg-elevated)' }}
                />

                <DropdownMenu.Item
                  disabled
                  className="group flex items-center gap-3 px-3 py-2 text-sm rounded-lg cursor-not-allowed opacity-50"
                  style={{ color: 'var(--text-dim)' }}
                >
                  <History className="w-4 h-4" />
                  <span>Historico (Em Breve)</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {onChatToggle && (
            <button
              onClick={onChatToggle}
              className="p-2 rounded-lg transition-colors touch-target"
              style={{ minHeight: '36px', minWidth: '36px' }}
              title="Chat com Assistente"
            >
              <MessageCircle size={18} style={{ color: 'var(--accent-rose)' }} />
            </button>
          )}

          <div
            className="w-px h-5 mx-1"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          />

          <ConfigPanel />

        </div>
      </div>
    </header>
  );
};
