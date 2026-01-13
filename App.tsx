import React, { useState } from 'react';
import { PhotoUploader } from './components/PhotoUploader';
import { MemoryViewer } from './components/MemoryViewer';
import { MosaicCreator } from './components/MosaicCreator';
import { AppState } from './types';
import { ROMANTIC_QUESTIONS } from './constants';
import { Heart, Grid, Upload } from 'lucide-react';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
      active 
        ? 'text-rose-500 bg-rose-500/10 border-b-2 border-rose-500' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
      <header className="w-full border-b border-slate-800 z-10 bg-slate-900/80 backdrop-blur-sm sticky top-0">
        <div className="px-6 md:px-12 py-4 flex justify-between items-center">
          <div className="font-bold text-xl tracking-tighter text-white">
            US<span className="text-rose-500">.</span>
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
              icon={<Heart className="w-4 h-4" />}
              label="Memory Deck"
            />
            <NavButton 
              active={appState === AppState.MOSAIC_SETUP} 
              onClick={() => setAppState(AppState.MOSAIC_SETUP)}
              icon={<Grid className="w-4 h-4" />}
              label="Mosaic Art"
            />
          </nav>
          <div className="text-xs font-medium tracking-widest text-slate-500 uppercase md:block hidden">
            Digital Memory Deck
          </div>
        </div>
        <div className="md:hidden flex border-t border-slate-800">
           <button 
             onClick={() => setAppState(AppState.UPLOAD)}
             className={`flex-1 py-3 text-xs font-medium flex justify-center items-center gap-2 ${appState === AppState.UPLOAD ? 'text-rose-500 bg-slate-800' : 'text-slate-400'}`}
           >
             <Upload className="w-3 h-3" /> Upload
           </button>
           <button 
             onClick={() => uploadedFiles.length > 0 ? setAppState(AppState.VIEWING) : alert('Upload photos first')}
             className={`flex-1 py-3 text-xs font-medium flex justify-center items-center gap-2 ${appState === AppState.VIEWING ? 'text-rose-500 bg-slate-800' : 'text-slate-400'}`}
           >
             <Heart className="w-3 h-3" /> Deck
           </button>
           <button 
             onClick={() => setAppState(AppState.MOSAIC_SETUP)}
             className={`flex-1 py-3 text-xs font-medium flex justify-center items-center gap-2 ${appState === AppState.MOSAIC_SETUP ? 'text-rose-500 bg-slate-800' : 'text-slate-400'}`}
           >
             <Grid className="w-3 h-3" /> Mosaic
           </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-rose-900/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none" />
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
      <footer className="w-full py-6 text-center text-slate-600 text-sm border-t border-slate-800/50">
        <p>&copy; {new Date().getFullYear()} Connection Experience.</p>
      </footer>
    </div>
  );
};

export default App;