import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export function DesktopConfig() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="h-full p-6">
      <h2 className="text-lg font-bold tracking-widest uppercase text-primary mb-6">Configuracoes</h2>

      <div className="space-y-6 max-w-lg">
        <div className="bg-card border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-bold tracking-widest uppercase mb-4">Tema</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme('hot')}
              className={`flex-1 py-3 rounded-lg font-bold tracking-widest text-sm transition-all ${theme === 'hot' ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
            >
              HOT
            </button>
            <button
              onClick={() => setTheme('warm')}
              className={`flex-1 py-3 rounded-lg font-bold tracking-widest text-sm transition-all ${theme === 'warm' ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
            >
              WARM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
