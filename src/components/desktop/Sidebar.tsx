import React from 'react';
import { Camera, MessageSquare, Settings } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import clsx from 'clsx';

interface SidebarProps {
  currentView: 'studio' | 'chat' | 'config';
  onNavigate: (view: 'studio' | 'chat' | 'config') => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { theme } = useTheme();

  return (
    <aside className="w-64 h-full bg-card border-r border-border/30 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border/30">
        <h1 className="text-xl font-bold tracking-[0.2em] text-primary">
          {theme === 'hot' ? 'HOTCOCOA' : 'WARMCOCOA'}
        </h1>
        <p className="text-[10px] text-muted-foreground tracking-widest">
          PICTURE COMPOSER
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <SidebarButton icon={<Camera size={20} />} label="Studio" active={currentView === 'studio'} onClick={() => onNavigate('studio')} />
        <SidebarButton icon={<MessageSquare size={20} />} label="Chat" active={currentView === 'chat'} onClick={() => onNavigate('chat')} />
        <SidebarButton icon={<Settings size={20} />} label="Configuracoes" active={currentView === 'config'} onClick={() => onNavigate('config')} />
      </nav>
    </aside>
  );
}

function SidebarButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
        active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
