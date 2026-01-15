import React, { useState } from 'react';
import { PhotoUploader } from './components/PhotoUploader';
import { MemoryViewer } from './components/MemoryViewer';
import { MosaicCreator } from './components/MosaicCreator';
import { AppState } from './types';
import { ROMANTIC_QUESTIONS } from './constants';
import { Heart, Grid, Upload, Play } from 'lucide-react';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors ${
      active 
        ? 'text-spicy-fire bg-warm-900/50 border-b-2 border-spicy-fire' 
        : 'text-warm-400 hover:text-warm-200 hover:bg-warm-900'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
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
      setAppState(AppState.VIEWING);
    }
  };

  const resetExperience = () => {
    setAppState(AppState.UPLOAD);
    setUploadedFiles([]);
  };

  return (
    <div className="min-h-screen bg-warm-950 text-warm-50 flex flex-col font-monaspice">
      <header className="w-full border-b border-warm-900 z-10 bg-warm-950/80 backdrop-blur-sm sticky top-0">
        <div className="px-6 md:px-12 py-4 flex justify-between items-center">
          <div className="font-bold text-xl tracking-tighter text-white flex items-center gap-2">
            <span className="text-spicy-fire">DR.</span>ELENA
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <NavButton 
              active={appState === AppState.UPLOAD} 
              onClick={() => setAppState(AppState.UPLOAD)}
              icon={<Upload className="w-4 h-4" />}
              label="Upload"
            />
            <NavButton 
              active={appState === AppState.VIEWING} 
              onClick={() => uploadedFiles.length > 0 ? setAppState(AppState.VIEWING) : setAppState(AppState.UPLOAD)}
              icon={<Play className="w-4 h-4" />}
              label="Start Session"
            />
            <NavButton 
              active={appState === AppState.MOSAIC_SETUP} 
              onClick={() => setAppState(AppState.MOSAIC_SETUP)}
              icon={<Grid className="w-4 h-4" />}
              label="Mosaic Art"
            />
          </nav>
          <div className="text-[10px] font-bold tracking-widest text-warm-500 uppercase md:block hidden">
            Clinical AI Sexologist
          </div>
        </div>
        <div className="md:hidden flex border-t border-warm-900">
           <button 
             onClick={() => setAppState(AppState.UPLOAD)}
             className={`flex-1 py-3 text-xs font-medium flex justify-center items-center gap-2 ${appState === AppState.UPLOAD ? 'text-spicy-fire bg-warm-900' : 'text-warm-400'}`}
           >
             <Upload className="w-3 h-3" /> Upload
           </button>
           <button 
             onClick={() => uploadedFiles.length > 0 ? setAppState(AppState.VIEWING) : alert('Upload photos first')}
             className={`flex-1 py-3 text-xs font-medium flex justify-center items-center gap-2 ${appState === AppState.VIEWING ? 'text-spicy-fire bg-warm-900' : 'text-warm-400'}`}
           >
             <Play className="w-3 h-3" /> Session
           </button>
           <button 
             onClick={() => setAppState(AppState.MOSAIC_SETUP)}
             className={`flex-1 py-3 text-xs font-medium flex justify-center items-center gap-2 ${appState === AppState.MOSAIC_SETUP ? 'text-spicy-fire bg-warm-900' : 'text-warm-400'}`}
           >
             <Grid className="w-3 h-3" /> Mosaic
           </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-warm-800/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-spicy-fire/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="w-full relative z-0">
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
              questions={ROMANTIC_QUESTIONS}
              onReset={resetExperience}
            />
          )}
          {appState === AppState.MOSAIC_SETUP && (
            <MosaicCreator sourceFiles={uploadedFiles} />
          )}
        </div>
      </main>
      <footer className="w-full py-6 text-center text-warm-600 text-xs border-t border-warm-900/50 uppercase tracking-wider">
        <p>Therapeutic Application v3.0 // Dr. Elena AI</p>
      </footer>
    </div>
  );
};

export default App;