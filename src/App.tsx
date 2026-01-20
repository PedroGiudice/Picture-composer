// src/App.tsx
import React, { useState } from 'react';
import { PhotoUploader } from './components/PhotoUploader';
import { MemoryViewer } from './components/MemoryViewer';
import { MosaicCreator } from './components/MosaicCreator';
import { Navigation } from './components/Navigation';
import { ChatDrawer } from './components/ChatDrawer';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { MotionBackground } from './components/ui/MotionBackground';
import { AppState } from './types';

// Inner App Component to consume ThemeContext
const IntimacyApp: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
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
    <MotionBackground intensity="subtle">
      <div className="relative min-h-screen font-monaspice overflow-hidden transition-colors duration-1000">

        <Navigation
          onNavigate={setAppState}
          currentView={appState}
          onChatToggle={() => setIsChatOpen(prev => !prev)}
        />

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

        <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </MotionBackground>
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
