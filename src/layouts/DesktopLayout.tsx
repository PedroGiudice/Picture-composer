import React, { useState } from 'react';
import { Sidebar } from '@/components/desktop/Sidebar';
import { DesktopStudio } from '@/components/desktop/DesktopStudio';
import { DesktopChat } from '@/components/desktop/DesktopChat';
import { DesktopConfig } from '@/components/desktop/DesktopConfig';

export default function DesktopLayout() {
  const [currentView, setCurrentView] = useState<'studio' | 'chat' | 'config'>('studio');

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-mono transition-colors duration-500">
      {/* Sidebar - sempre visivel */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Conteudo principal - usa todo o espaco restante */}
      <main className="flex-1 overflow-hidden relative">
        {currentView === 'studio' && <DesktopStudio />}
        {currentView === 'chat' && <DesktopChat />}
        {currentView === 'config' && <DesktopConfig />}

        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
        </div>
      </main>
    </div>
  );
}
