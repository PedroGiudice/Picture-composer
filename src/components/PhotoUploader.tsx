import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Cloud, Loader2, Settings, FolderOpen } from 'lucide-react';
import { Button } from './Button';
import { ConfigModal } from './ConfigModal';
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
    <div className="w-full max-w-md mx-auto px-4 space-y-6 relative">
      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onSave={() => {
          setHasCreds(true);
          setShowConfig(false);
        }}
      />

      {/* Header - Texto plano, sem efeitos */}
      <div className="text-center space-y-2 pt-4">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Nossas Memorias
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Selecione fotos para comecar
        </p>
        {photosPath && (
          <div
            className="flex items-center justify-center gap-2 text-xs"
            style={{ color: 'var(--text-dim)' }}
          >
            <FolderOpen className="w-3 h-3" />
            <span>
              Fotos em: <code
                className="px-1 py-0.5 rounded"
                style={{ background: 'var(--bg-surface)' }}
              >{photosPath}</code>
            </span>
          </div>
        )}
        {isLoadingLocal && (
          <div
            className="flex items-center justify-center gap-2 text-xs"
            style={{ color: 'var(--text-dim)' }}
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Carregando fotos locais...</span>
          </div>
        )}
      </div>

      {/* Grid 2 Colunas - Cards com Material Elevation */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Card Dispositivo */}
        <button
          onClick={triggerUpload}
          className="
            flex flex-col items-center justify-center
            p-6 rounded-xl
            min-h-[120px]
            transition-all duration-150
            active:scale-[0.98]
          "
          style={{
            background: 'var(--bg-surface)',
            boxShadow: 'var(--shadow-2)',
          }}
          onTouchStart={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-1)';
          }}
          onTouchEnd={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-2)';
          }}
        >
          <Upload
            className="w-8 h-8 mb-3"
            style={{ color: 'var(--accent-rose)' }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Dispositivo
          </span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="hidden"
        />

        {/* Card Google Drive */}
        <button
          onClick={handleGoogleClick}
          disabled={!googleReady}
          className={`
            flex flex-col items-center justify-center
            p-6 rounded-xl
            min-h-[120px]
            transition-all duration-150
            active:scale-[0.98]
            ${!googleReady ? 'opacity-60' : ''}
          `}
          style={{
            background: 'var(--bg-surface)',
            boxShadow: 'var(--shadow-2)',
          }}
          onTouchStart={(e) => {
            if (googleReady) {
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-1)';
            }
          }}
          onTouchEnd={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-2)';
          }}
        >
          {isGoogleLoading ? (
            <Loader2
              className="w-8 h-8 mb-3 animate-spin"
              style={{ color: 'var(--accent-ember)' }}
            />
          ) : (
            <Cloud
              className="w-8 h-8 mb-3"
              style={{ color: 'var(--accent-ember)' }}
            />
          )}
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Google Drive
          </span>
          {!googleReady && (
            <span
              className="text-[10px] mt-1"
              style={{ color: 'var(--text-dim)' }}
            >
              Carregando...
            </span>
          )}
        </button>
      </div>

      {/* Botao Configurar Google API */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowConfig(true)}
          className="
            flex items-center gap-2
            px-4 py-2
            text-sm
            rounded-lg
            transition-all duration-150
            active:scale-[0.98]
          "
          style={{
            color: hasCreds ? '#22c55e' : 'var(--text-muted)',
            background: 'transparent',
          }}
        >
          <Settings className="w-4 h-4" />
          <span>Configurar Google API</span>
        </button>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              {files.length} fotos selecionadas
            </span>
            <Button variant="outline" onClick={onClear} className="text-xs py-1 px-3 h-8">
              Limpar
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => onRemove(index)}
              />
            ))}
          </div>
          <div
            className="pt-4"
            style={{ borderTop: '1px solid var(--bg-elevated)' }}
          >
            <Button onClick={onContinue} className="w-full">
              Comecar Experiencia
            </Button>
          </div>
        </div>
      )}

      {files.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-8 space-y-2"
          style={{ color: 'var(--text-dim)' }}
        >
          <ImageIcon className="w-8 h-8 opacity-30" />
          <p className="text-sm">Nenhuma foto selecionada</p>
        </div>
      )}
    </div>
  );
};