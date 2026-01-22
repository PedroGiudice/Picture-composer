// src/App.tsx
import React, { useState } from 'react';
import { PhotoUploader } from './components/PhotoUploader';
import { MemoryViewer } from './components/MemoryViewer';
import { MosaicCreator } from './components/MosaicCreator';
import { Navigation } from './components/Navigation';
import { ThemeProvider } from './context/ThemeContext';

type Screen = 'home' | 'viewing' | 'mosaic';

const HotCocoaApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
      setCurrentScreen('viewing');
    }
  };

  const resetExperience = () => {
    setCurrentScreen('home');
    setUploadedFiles([]);
  };

  const goBack = () => {
    if (currentScreen === 'viewing' || currentScreen === 'mosaic') {
      setCurrentScreen('home');
    }
  };

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: 'var(--hotcocoa-bg)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Fixed Header */}
      <Navigation
        onBack={goBack}
        showBackButton={currentScreen !== 'home'}
      />

      {/* Main Content - starts below header (48px + safe area) */}
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ marginTop: 'calc(48px + env(safe-area-inset-top))' }}
      >
        {currentScreen === 'home' && (
          <PhotoUploader
            files={uploadedFiles}
            onUpload={handleUpload}
            onClear={handleClear}
            onRemove={handleRemoveFile}
            onContinue={startExperience}
          />
        )}

        {currentScreen === 'viewing' && (
          <MemoryViewer
            files={uploadedFiles}
            onReset={resetExperience}
          />
        )}

        {currentScreen === 'mosaic' && (
          <MosaicCreator sourceFiles={uploadedFiles} />
        )}
      </main>

      {/* Footer Version */}
      <footer
        className="py-2 text-center"
        style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
      >
        <span
          className="text-xs opacity-40"
          style={{ color: 'var(--hotcocoa-text-secondary)' }}
        >
          v0.0.1
        </span>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HotCocoaApp />
    </ThemeProvider>
  );
};

export default App;
