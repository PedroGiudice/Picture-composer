import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Cloud, Loader2, Settings, FolderOpen } from 'lucide-react';
import { Button } from './Button';
import { ConfigModal } from './ConfigModal';
import { FloatingCard } from './ui/FloatingCard';
import { loadGoogleApi, openPicker, getCredentials } from '../utils/googleIntegration';
import { isTauri, listLocalPhotos, savePhotoLocally, getPhotoAsBase64, fileToBase64, getPhotosPath } from '../services/tauri';

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
  const [photosPath, setPhotosPath] = useState<string | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  // Carregar fotos locais ao iniciar (apenas no Tauri)
  useEffect(() => {
    const loadLocalPhotos = async () => {
      if (!isTauri()) return;

      setIsLoadingLocal(true);
      try {
        const path = await getPhotosPath();
        setPhotosPath(path);

        const localPhotos = await listLocalPhotos();
        if (localPhotos.length > 0) {
          // Converter fotos locais para File objects
          const loadedFiles: File[] = [];
          for (const photo of localPhotos) {
            const base64 = await getPhotoAsBase64(photo.name);
            if (base64) {
              const ext = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
              const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
              const blob = await fetch(`data:${mimeType};base64,${base64}`).then(r => r.blob());
              const file = new File([blob], photo.name, { type: mimeType });
              loadedFiles.push(file);
            }
          }
          if (loadedFiles.length > 0) {
            onUpload(loadedFiles);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar fotos locais:', error);
      } finally {
        setIsLoadingLocal(false);
      }
    };

    loadLocalPhotos();
  }, []);

  useEffect(() => {
    loadGoogleApi(() => {
      setGoogleReady(true);
    });
    setHasCreds(!!getCredentials());
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      onUpload(newFiles);

      // Salvar localmente no Tauri
      if (isTauri()) {
        for (const file of newFiles) {
          try {
            const base64 = await fileToBase64(file);
            await savePhotoLocally(file.name, base64);
          } catch (error) {
            console.error('Erro ao salvar foto localmente:', error);
          }
        }
      }
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
      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onSave={() => {
          setHasCreds(true);
          setShowConfig(false);
        }}
      />

      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Nossas Memórias
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Selecione fotos especiais de vocês dois. Vamos usar essas imagens para gerar momentos de conexão.
        </p>
        {photosPath && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <FolderOpen className="w-3 h-3" />
            <span>Fotos salvas em: <code className="bg-slate-800 px-1 py-0.5 rounded">{photosPath}</code></span>
          </div>
        )}
        {isLoadingLocal && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Carregando fotos locais...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <FloatingCard delay={0.1} className="cursor-pointer group" onClick={triggerUpload}>
          <div className="text-center py-8">
            <Upload className="mx-auto mb-4" size={48} style={{ color: 'var(--accent-rose)' }} />
            <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Upload do Dispositivo
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              JPG, PNG, WebP (max 10MB)
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
        </FloatingCard>

        <div className="relative">
          <FloatingCard
            delay={0.2}
            className={`cursor-pointer group ${!googleReady ? 'opacity-70' : ''}`}
            onClick={handleGoogleClick}
          >
            <div className="text-center py-8">
              {isGoogleLoading ? (
                <Loader2 className="mx-auto mb-4 animate-spin" size={48} style={{ color: 'var(--accent-ember)' }} />
              ) : (
                <Cloud className="mx-auto mb-4" size={48} style={{ color: 'var(--accent-ember)' }} />
              )}
              <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Google Drive & Photos
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Conectar ao cloud
              </p>
              {!googleReady && (
                <p className="text-[10px] mt-2" style={{ color: 'var(--text-dim)' }}>
                  Loading libraries...
                </p>
              )}
            </div>
          </FloatingCard>
          <button
            onClick={(e) => { e.stopPropagation(); setShowConfig(true); }}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors z-10"
            title="Configure API Keys"
          >
            <Settings
              className="w-4 h-4"
              style={{ color: hasCreds ? '#22c55e' : 'var(--text-muted)' }}
            />
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