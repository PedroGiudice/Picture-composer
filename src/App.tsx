// src/App.tsx
import React, { useState } from 'react';
import { PhotoUploader } from './components/PhotoUploader';
import { MemoryViewer } from './components/MemoryViewer';
import { MosaicCreator } from './components/MosaicCreator';
import { Navigation } from './components/Navigation';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AppState } from './types';

// Inner App Component to consume ThemeContext
const IntimacyApp: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { mode } = useTheme();

  const handleUpload = (newFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleClear = () => {
    setUploadedFiles([]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startExperience = () => {
    if (uploadedFiles.length > 0) {
      setAppState(AppState.VIEWING);
    }
  };

  const resetExperience = () => {
    setAppState(AppState.UPLOAD);
    setUploadedFiles([]);
  };

  return (
    <div className="relative min-h-screen font-monaspice overflow-hidden bg-[var(--color-bg)] transition-colors duration-1000">
      
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-20%] right-[-10%] w-[800px] h-[800px] blur-[150px] rounded-full transition-colors duration-1000 ${mode === 'HOT' ? 'bg-orange-900/20' : 'bg-pink-500/10'}`} />
        <div className={`absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] blur-[120px] rounded-full transition-colors duration-1000 ${mode === 'HOT' ? 'bg-rose-900/30' : 'bg-amber-500/10'}`} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      <Navigation onNavigate={setAppState} currentView={appState} />

      <main className="relative z-10 pt-24 pb-12 px-6 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-7xl mx-auto">
          {appState === AppState.UPLOAD && (
            <PhotoUploader 
              files={uploadedFiles}
              onUpload={handleUpload}
              onClear={handleClear}
              onRemove={handleRemoveFile}
              onContinue={startExperience}
            />
          )}
          {appState === AppState.VIEWING && (
            <MemoryViewer 
              files={uploadedFiles}
              onReset={resetExperience}
            />
          )}
          {appState === AppState.MOSAIC_SETUP && (
            <MosaicCreator sourceFiles={uploadedFiles} />
          )}
        </div>
      </main>

      <footer className="relative z-10 w-full py-6 text-center border-t border-white/5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">
          Intimacy OS v4.0 // {mode} Mode Active
        </p>
      </footer>
    </div>
  );
};

// Root Component
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <IntimacyApp />
    </ThemeProvider>
  );
};

export default App;
