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
    <div className="relative group aspect-square rounded-lg overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
      {url && (
        <img
          src={url}
          alt="Preview"
          className="w-full h-full object-cover opacity-90"
        />
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-1 right-1 p-1.5 rounded-full touch-target flex items-center justify-center transition-colors"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          minHeight: '32px',
          minWidth: '32px'
        }}
      >
        <X className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
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
    <div className="w-full h-full px-4 py-6 animate-fade-in relative">
      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onSave={() => {
          setHasCreds(true);
          setShowConfig(false);
        }}
      />

      {/* Header - Titulo SEM glow */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-title" style={{ color: 'var(--text-primary)' }}>
          Nossas Memorias
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          Selecione fotos especiais de voces dois
        </p>
        {photosPath && (
          <div className="flex items-center justify-center gap-2 text-xs mt-2" style={{ color: 'var(--text-dim)' }}>
            <FolderOpen className="w-3 h-3" />
            <span className="truncate max-w-[200px]">{photosPath}</span>
          </div>
        )}
        {isLoadingLocal && (
          <div className="flex items-center justify-center gap-2 text-xs mt-2" style={{ color: 'var(--text-dim)' }}>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Carregando fotos locais...</span>
          </div>
        )}
      </div>

      {/* Menu Cards - Grid 2 colunas */}
      <div className="menu-grid mb-6">
        {/* Card: Upload do Dispositivo */}
        <FloatingCard delay={0.1} className="cursor-pointer touch-target" onClick={triggerUpload}>
          <div className="text-center py-6 px-3">
            <Upload className="mx-auto mb-3" size={36} style={{ color: 'var(--accent-rose)' }} />
            <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
              Upload
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Galeria local
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

        {/* Card: Google Drive/Photos */}
        <div className="relative">
          <FloatingCard
            delay={0.2}
            className={`cursor-pointer touch-target ${!googleReady ? 'opacity-70' : ''}`}
            onClick={handleGoogleClick}
          >
            <div className="text-center py-6 px-3">
              {isGoogleLoading ? (
                <Loader2 className="mx-auto mb-3 animate-spin" size={36} style={{ color: 'var(--accent-ember)' }} />
              ) : (
                <Cloud className="mx-auto mb-3" size={36} style={{ color: 'var(--accent-ember)' }} />
              )}
              <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                Google
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Drive & Photos
              </p>
            </div>
          </FloatingCard>
          <button
            onClick={(e) => { e.stopPropagation(); setShowConfig(true); }}
            className="absolute top-2 right-2 p-2 rounded-lg transition-colors touch-target"
            style={{ minHeight: '40px', minWidth: '40px' }}
            title="Configurar API Keys"
          >
            <Settings
              className="w-4 h-4"
              style={{ color: hasCreds ? '#22c55e' : 'var(--text-muted)' }}
            />
          </button>
        </div>
      </div>

      {/* Preview das fotos selecionadas */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {files.length} fotos
            </span>
            <Button variant="outline" onClick={onClear} className="text-xs py-1 px-3 h-8">
              Limpar
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => onRemove(index)}
              />
            ))}
          </div>

          <div className="pt-4 border-t" style={{ borderColor: 'var(--bg-elevated)' }}>
            <Button onClick={onContinue} className="w-full touch-target">
              Comecar Experiencia
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8" style={{ color: 'var(--text-dim)' }}>
          <ImageIcon className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-xs">Nenhuma foto selecionada</p>
        </div>
      )}
    </div>
  );
};
