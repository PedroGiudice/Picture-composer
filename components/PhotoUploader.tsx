import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Cloud, Loader2, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { loadGoogleApi, openPicker, getCredentials, saveCredentials, clearCredentials } from '../utils/googleIntegration';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative group aspect-square bg-slate-800">
      {url && (
        <img 
          src={url} 
          alt="Preview" 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-1 right-1 p-1 bg-black/50 text-white hover:bg-rose-600 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

interface ConfigModalProps {
  onClose: () => void;
  onSave: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ onClose, onSave }) => {
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  useEffect(() => {
    const creds = getCredentials();
    if (creds) {
      setClientId(creds.clientId);
      setApiKey(creds.apiKey);
    }
  }, []);

  const handleSave = () => {
    if (clientId && apiKey) {
      saveCredentials(clientId.trim(), apiKey.trim());
      onSave();
    }
  };

  const handleClear = () => {
    clearCredentials();
    setClientId('');
    setApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white font-space-grotesk flex items-center gap-2">
              <Settings className="w-5 h-5 text-rose-500" />
              API Configuration
            </h3>
            <p className="text-sm text-slate-400">
              To access your Google Photos/Drive, you must provide your own Google Cloud Client ID and API Key.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Client ID</label>
              <input 
                type="text" 
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="000000000-xxxx.apps.googleusercontent.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 text-slate-200 p-3 text-sm outline-none transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">API Key</label>
              <input 
                type="text" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 text-slate-200 p-3 text-sm outline-none transition-colors"
              />
            </div>
            
            <div className="bg-slate-800/50 p-4 border border-slate-800 text-xs text-slate-400 space-y-2">
              <p className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Ensure your Google Cloud Project has the <strong>Google Picker API</strong> enabled.</span>
              </p>
              <p className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Add <strong>{window.location.origin}</strong> to "Authorized JavaScript origins" in your OAuth Client settings.</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Button onClick={handleSave} className="flex-1" disabled={!clientId || !apiKey}>
              Save Credentials
            </Button>
            {getCredentials() && (
               <Button variant="secondary" onClick={handleClear} className="flex-none">
                 Clear
               </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface PhotoUploaderProps {
  files: File[];
  onUpload: (newFiles: File[]) => void;
  onClear: () => void;
  onRemove: (index: number) => void;
  onContinue: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
  files, 
  onUpload, 
  onClear,
  onRemove,
  onContinue
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [hasCreds, setHasCreds] = useState(false);

  useEffect(() => {
    loadGoogleApi(() => {
      setGoogleReady(true);
    });
    setHasCreds(!!getCredentials());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleGoogleClick = () => {
    if (!googleReady) return;
    
    if (!getCredentials()) {
      setShowConfig(true);
      return;
    }

    setIsGoogleLoading(true);
    openPicker((pickedFiles) => {
      if (pickedFiles.length > 0) {
        onUpload(pickedFiles);
      }
      setIsGoogleLoading(false);
    }).catch((err) => {
      setIsGoogleLoading(false);
      if (err.message === "Missing Credentials") {
        setShowConfig(true);
      } else {
        alert("Failed to load Google Picker. Check your API Key configuration.");
      }
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in relative">
      {showConfig && (
        <ConfigModal 
          onClose={() => setShowConfig(false)} 
          onSave={() => {
            setHasCreds(true);
            setShowConfig(false);
            // Optionally try to trigger open picker immediately? 
            // Better to let user click again to be safe.
          }} 
        />
      )}

      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Nossas Memórias
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Selecione fotos especiais de vocês dois. Vamos usar essas imagens para gerar momentos de conexão.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className="border-2 border-dashed border-slate-700 hover:border-rose-500/50 transition-colors p-8 flex flex-col items-center justify-center gap-4 bg-slate-900/50 cursor-pointer h-48"
          onClick={triggerUpload}
        >
          <div className="p-3 bg-slate-800 text-rose-500">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-200">Upload do Dispositivo</p>
            <p className="text-xs text-slate-500 mt-1">JPG, PNG Suportados</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="relative group">
           <div 
            className={`border-2 border-dashed border-slate-700 transition-colors p-8 flex flex-col items-center justify-center gap-4 bg-slate-900/50 h-48 w-full ${googleReady ? 'hover:border-blue-500/50 cursor-pointer' : 'opacity-70 cursor-wait'}`}
            onClick={handleGoogleClick}
          >
             <div className="p-3 bg-slate-800 text-blue-500 group-hover:text-blue-400 transition-colors">
              {isGoogleLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Cloud className="w-6 h-6" />}
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-200">Google Drive & Photos</p>
              <p className="text-xs text-slate-500 mt-1">Importar da nuvem</p>
            </div>
            {!googleReady && (
              <div className="absolute bottom-2 text-[10px] text-slate-600">Loading libraries...</div>
            )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowConfig(true); }}
            className="absolute top-2 right-2 p-2 text-slate-600 hover:text-white transition-colors z-10"
            title="Configure API Keys"
          >
            <Settings className={`w-4 h-4 ${hasCreds ? 'text-green-500' : 'text-slate-600'}`} />
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-sm font-medium text-slate-400">{files.length} fotos selecionadas</h3>
             <Button variant="outline" onClick={onClear} className="text-xs py-1 px-3 h-8">
               Limpar Tudo
             </Button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {files.map((file, index) => (
              <FilePreview 
                key={`${file.name}-${index}`} 
                file={file} 
                onRemove={() => onRemove(index)} 
              />
            ))}
          </div>
          <div className="flex justify-center pt-8 border-t border-slate-800">
            <Button onClick={onContinue} className="w-full md:w-auto min-w-[200px]">
              Começar Experiência
            </Button>
          </div>
        </div>
      )}
      
      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-slate-600 space-y-2">
            <ImageIcon className="w-8 h-8 opacity-20" />
            <p className="text-sm">Nenhuma foto selecionada ainda</p>
        </div>
      )}
    </div>
  );
};