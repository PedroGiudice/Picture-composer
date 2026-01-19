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
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('UPLOAD')}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs tracking-tighter transition-colors ${mode === 'HOT' ? 'bg-gradient-to-br from-rose-600 to-orange-600' : 'bg-gradient-to-br from-pink-500 to-amber-500'}`}>
            IO
          </div>
          <span className="font-monaspice font-bold tracking-[0.2em] text-white text-sm uppercase">
            INTIMACY<span className="opacity-50">OS</span>
          </span>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-medium text-white transition-colors outline-none">
                <Menu className="w-4 h-4 opacity-70" />
                <span className="uppercase tracking-wider">Protocolos</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[220px] bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl animate-slide-up-fade z-50 mr-6 mt-2">
                <DropdownMenu.Item 
                  className="group flex items-center gap-3 px-3 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer outline-none transition-colors"
                  onClick={() => onNavigate('VIEWING')}
                >
                  <div className="p-2 rounded bg-slate-800 group-hover:bg-rose-500/20 text-slate-400 group-hover:text-rose-500 transition-colors">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="font-bold">Sessão Guiada</div>
                    <div className="text-[10px] text-slate-500 group-hover:text-slate-400">Deck de Memórias</div>
                  </div>
                </DropdownMenu.Item>

                <DropdownMenu.Item 
                  className="group flex items-center gap-3 px-3 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer outline-none transition-colors mt-1"
                  onClick={() => onNavigate('MOSAIC_SETUP')}
                >
                  <div className="p-2 rounded bg-slate-800 group-hover:bg-indigo-500/20 text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <Grid className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="font-bold">Mosaico</div>
                    <div className="text-[10px] text-slate-500 group-hover:text-slate-400">Reconstrução Visual</div>
                  </div>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-slate-800 my-2" />

                <DropdownMenu.Item disabled className="group flex items-center gap-3 px-3 py-2 text-sm text-slate-600 rounded-lg cursor-not-allowed opacity-50">
                  <History className="w-4 h-4" />
                  <span>Histórico (Em Breve)</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {onChatToggle && (
            <button
              onClick={onChatToggle}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Chat com Assistente"
            >
              <MessageCircle size={20} style={{ color: 'var(--accent-rose)' }} />
            </button>
          )}

          <div className="w-px h-6 bg-white/10 mx-1" />

          <ConfigPanel />
          
        </div>
      </div>
    </header>
  );
};
