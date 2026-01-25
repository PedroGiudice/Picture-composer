// src/components/PhotoUploader.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Upload, Cloud, Loader2, Settings, Image as ImageIcon, X } from 'lucide-react';
import { ParticleBackground } from './ui/ParticleBackground';
import { loadGoogleApi, openPicker, getCredentials } from '@/utils/googleIntegration';
import { isTauri, listLocalPhotos, savePhotoLocally, getPhotoAsBase64, fileToBase64 } from '@/services/tauri';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';

// Type declaration for Android JavaScript Interface
declare global {
  interface Window {
    HotCocoaPermissions?: {
      checkPermissions: () => string;
      requestPermissions: () => void;
      isAndroid: () => boolean;
      getSdkVersion: () => number;
    };
  }
}

interface PermissionStatus {
  granted: boolean;
  permission: string;
  sdkVersion: number;
}

/**
 * Check if running on Android with our custom JavaScript interface.
 */
const isAndroidWithPermissions = (): boolean => {
  return typeof window !== 'undefined' &&
         typeof window.HotCocoaPermissions !== 'undefined' &&
         typeof window.HotCocoaPermissions.isAndroid === 'function';
};

/**
 * Check current permission status on Android.
 */
const checkAndroidPermissions = (): PermissionStatus | null => {
  if (!isAndroidWithPermissions()) return null;

  try {
    const result = window.HotCocoaPermissions!.checkPermissions();
    return JSON.parse(result) as PermissionStatus;
  } catch (error) {
    console.error('[PhotoUploader] Error checking permissions:', error);
    return null;
  }
};

/**
 * Request permissions on Android and wait for result.
 * Returns a promise that resolves when permission dialog is dismissed.
 */
const requestAndroidPermissions = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isAndroidWithPermissions()) {
      resolve(true);
      return;
    }

    // Listen for permission result event
    const handleResult = (event: CustomEvent<{ granted: boolean }>) => {
      window.removeEventListener('permissionResult', handleResult as EventListener);
      resolve(event.detail.granted);
    };

    window.addEventListener('permissionResult', handleResult as EventListener);

    // Timeout after 60 seconds (user might take time to decide)
    setTimeout(() => {
      window.removeEventListener('permissionResult', handleResult as EventListener);
      // Re-check permissions in case event was missed
      const status = checkAndroidPermissions();
      resolve(status?.granted ?? false);
    }, 60000);

    // Trigger permission request
    window.HotCocoaPermissions!.requestPermissions();
  });
};

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
    <div className="relative group aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--hotcocoa-card-bg)' }}>
      {url && (
        <img
          src={url}
          alt="Preview"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-1 right-1 p-1 rounded-full transition-colors touch-target"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <X size={14} style={{ color: 'var(--hotcocoa-text-primary)' }} />
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
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  // Carregar fotos locais ao iniciar (apenas no Tauri)
  useEffect(() => {
    const loadLocalPhotos = async () => {
      if (!isTauri()) return;

      setIsLoadingLocal(true);
      try {
        const localPhotos = await listLocalPhotos();
        if (localPhotos.length > 0) {
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
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[PhotoUploader] handleFileChange triggered');
    console.log('[PhotoUploader] isTauri:', isTauri());
    console.log('[PhotoUploader] files:', e.target.files);

    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      console.log('[PhotoUploader] Processing', newFiles.length, 'files');
      onUpload(newFiles);

      // Salvar localmente no Tauri
      if (isTauri()) {
        console.log('[PhotoUploader] Saving to Tauri storage...');
        for (const file of newFiles) {
          try {
            console.log('[PhotoUploader] Converting to base64:', file.name);
            const base64 = await fileToBase64(file);
            console.log('[PhotoUploader] Saving photo:', file.name, 'base64 length:', base64.length);
            const path = await savePhotoLocally(file.name, base64);
            console.log('[PhotoUploader] Saved to:', path);
          } catch (error) {
            console.error('[PhotoUploader] Erro ao salvar foto localmente:', error);
          }
        }
      } else {
        console.log('[PhotoUploader] Not in Tauri, skipping local save');
      }
    } else {
      console.log('[PhotoUploader] No files selected');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerUpload = async () => {
    console.log('[PhotoUploader] triggerUpload, isTauri:', isTauri());

    if (isTauri()) {
      // Check Android permissions first
      if (isAndroidWithPermissions()) {
        console.log('[PhotoUploader] Android detected, checking permissions...');
        const permStatus = checkAndroidPermissions();
        console.log('[PhotoUploader] Permission status:', permStatus);

        if (permStatus && !permStatus.granted) {
          console.log('[PhotoUploader] Requesting permissions...');
          const granted = await requestAndroidPermissions();
          console.log('[PhotoUploader] Permission result:', granted);

          if (!granted) {
            // Show alert to user
            alert('Permissao negada para acessar fotos. Por favor, permita o acesso nas configuracoes do app.');
            return;
          }
        }
      }

      // Usar dialog nativo do Tauri (mais confiavel no Linux)
      try {
        console.log('[PhotoUploader] Opening Tauri file dialog...');
        const selected = await open({
          multiple: true,
          filters: [{
            name: 'Images',
            extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp']
          }]
        });

        console.log('[PhotoUploader] Dialog result:', selected);

        if (selected && selected.length > 0) {
          const paths = Array.isArray(selected) ? selected : [selected];
          const loadedFiles: File[] = [];

          for (const filePath of paths) {
            try {
              console.log('[PhotoUploader] Reading file:', filePath);
              const data = await readFile(filePath);
              const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'photo.jpg';
              const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
              const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';

              const blob = new Blob([data], { type: mimeType });
              const file = new File([blob], fileName, { type: mimeType });
              loadedFiles.push(file);

              // Salvar localmente
              const base64 = btoa(String.fromCharCode(...data));
              await savePhotoLocally(fileName, base64);
              console.log('[PhotoUploader] Saved:', fileName);
            } catch (err) {
              console.error('[PhotoUploader] Error reading file:', filePath, err);
            }
          }

          if (loadedFiles.length > 0) {
            console.log('[PhotoUploader] Loaded', loadedFiles.length, 'files');
            onUpload(loadedFiles);
          }
        }
      } catch (error) {
        console.error('[PhotoUploader] Tauri dialog error:', error);
        alert(`Erro ao abrir seletor de arquivos: ${error}`);
        // Fallback para input HTML
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }
    } else {
      console.log('[PhotoUploader] Not in Tauri, using HTML input');
      // Usar input HTML padrao (browser)
      if (fileInputRef.current) {
        fileInputRef.current.click();
      } else {
        alert('Erro: Input de arquivo nao encontrado');
      }
    }
  };

  const handleGoogleClick = () => {
    if (!googleReady) return;

    if (!getCredentials()) {
      // Will be handled by Navigation's ConfigModal
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
      console.error('Google Picker error:', err);
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 relative">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Title Section */}
      <div className="text-center mb-12 relative z-10">
        <h2
          className="text-3xl mb-3 transition-colors duration-300"
          style={{ color: 'var(--hotcocoa-text-primary)' }}
        >
          Nossas Memorias
        </h2>
        <p
          className="text-base opacity-70 transition-colors duration-300"
          style={{ color: 'var(--hotcocoa-text-secondary)' }}
        >
          Selecione fotos para comecar
        </p>
        {isLoadingLocal && (
          <div className="flex items-center justify-center gap-2 mt-2 text-xs" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
            <Loader2 size={14} className="animate-spin" />
            <span>Carregando fotos locais...</span>
          </div>
        )}
      </div>

      {/* Upload Cards - MD3 Elevated Cards */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-8 relative z-10">
        {/* Device Upload Card */}
        <button
          onClick={triggerUpload}
          className="flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 touch-target"
          style={{
            backgroundColor: 'var(--hotcocoa-card-bg)',
            minHeight: '120px',
            borderRadius: '16px'
          }}
        >
          <Upload
            size={32}
            style={{ color: 'var(--hotcocoa-accent)', marginBottom: '12px' }}
          />
          <span
            className="text-sm text-center transition-colors duration-300"
            style={{ color: 'var(--hotcocoa-text-primary)' }}
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

        {/* Google Drive Card */}
        <button
          onClick={handleGoogleClick}
          disabled={!googleReady}
          className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 touch-target ${
            !googleReady ? 'opacity-60' : ''
          }`}
          style={{
            backgroundColor: 'var(--hotcocoa-card-bg)',
            minHeight: '120px',
            borderRadius: '16px'
          }}
        >
          {isGoogleLoading ? (
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: 'var(--hotcocoa-accent)', marginBottom: '12px' }}
            />
          ) : (
            <Cloud
              size={32}
              style={{ color: 'var(--hotcocoa-accent)', marginBottom: '12px' }}
            />
          )}
          <span
            className="text-sm text-center transition-colors duration-300"
            style={{ color: 'var(--hotcocoa-text-primary)' }}
          >
            Google Drive
          </span>
          {!googleReady && (
            <span
              className="text-xs mt-1 opacity-60 transition-colors duration-300"
              style={{ color: 'var(--hotcocoa-text-secondary)' }}
            >
              Carregando...
            </span>
          )}
        </button>
      </div>

      {/* Config Link */}
      <button
        className="text-sm underline opacity-80 hover:opacity-100 transition-all duration-300 mb-2 relative z-10 flex items-center gap-2"
        style={{ color: 'var(--hotcocoa-accent)' }}
      >
        <Settings size={16} />
        Configurar Google API
      </button>

      {/* Selected Files Preview */}
      {files.length > 0 ? (
        <div className="w-full max-w-sm space-y-4 relative z-10 mt-4">
          <div className="flex items-center justify-between">
            <span
              className="text-sm"
              style={{ color: 'var(--hotcocoa-text-secondary)' }}
            >
              {files.length} fotos selecionadas
            </span>
            <button
              onClick={onClear}
              className="text-xs px-3 py-1 rounded-lg transition-all active:scale-95"
              style={{
                backgroundColor: 'var(--hotcocoa-card-bg)',
                color: 'var(--hotcocoa-text-secondary)'
              }}
            >
              Limpar
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-[120px] overflow-y-auto">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => onRemove(index)}
              />
            ))}
          </div>
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 touch-target"
            style={{
              backgroundColor: 'var(--hotcocoa-accent)',
              color: '#000',
              borderRadius: '12px',
              minHeight: '48px'
            }}
          >
            Comecar Experiencia
          </button>
        </div>
      ) : (
        <div className="mt-4 relative z-10 flex flex-col items-center">
          <ImageIcon size={32} style={{ color: 'var(--hotcocoa-text-secondary)', opacity: 0.3 }} />
          <p
            className="text-sm opacity-50 mt-2 transition-colors duration-300"
            style={{ color: 'var(--hotcocoa-text-secondary)' }}
          >
            Nenhuma foto selecionada
          </p>
        </div>
      )}
    </div>
  );
};
