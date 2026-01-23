import UploadRounded from '@mui/icons-material/UploadRounded';
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded';
import { ParticleBackground } from "@/components/ParticleBackground";

interface HomeScreenProps {
  onDeviceUpload: () => void;
  onGoogleDriveUpload: () => void;
}

export function HomeScreen({ onDeviceUpload, onGoogleDriveUpload }: HomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 relative">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Title Section */}
      <div className="text-center mb-12 lg:mb-16 relative z-10">
        <h2
          className="text-3xl lg:text-5xl mb-3 lg:mb-4 transition-colors duration-300"
          style={{ color: 'var(--hotcocoa-text-primary)' }}
        >
          Nossas Memorias
        </h2>
        <p
          className="text-base lg:text-lg opacity-70 transition-colors duration-300"
          style={{ color: 'var(--hotcocoa-text-secondary)' }}
        >
          Selecione fotos para comecar
        </p>
      </div>

      {/* Upload Cards - MD3 Elevated Cards - Desktop: larger cards */}
      <div className="w-full max-w-sm lg:max-w-lg grid grid-cols-2 gap-4 lg:gap-6 mb-8 relative z-10">
        {/* Device Upload Card */}
        <button
          onClick={onDeviceUpload}
          className="flex flex-col items-center justify-center p-6 lg:p-8 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'var(--hotcocoa-card-bg)',
            minHeight: '120px',
            borderRadius: '16px'
          }}
        >
          <UploadRounded
            sx={{
              fontSize: { xs: 32, lg: 48 },
              color: 'var(--hotcocoa-accent)',
              marginBottom: '12px'
            }}
          />
          <span
            className="text-sm lg:text-base text-center transition-colors duration-300"
            style={{ color: 'var(--hotcocoa-text-primary)' }}
          >
            Dispositivo
          </span>
        </button>

        {/* Google Drive Card */}
        <button
          onClick={onGoogleDriveUpload}
          className="flex flex-col items-center justify-center p-6 lg:p-8 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'var(--hotcocoa-card-bg)',
            minHeight: '120px',
            borderRadius: '16px'
          }}
        >
          <CloudUploadRounded
            sx={{
              fontSize: { xs: 32, lg: 48 },
              color: 'var(--hotcocoa-accent)',
              marginBottom: '12px'
            }}
          />
          <span
            className="text-sm lg:text-base text-center transition-colors duration-300"
            style={{ color: 'var(--hotcocoa-text-primary)' }}
          >
            Google Drive
          </span>
          <span
            className="text-xs mt-1 opacity-60 transition-colors duration-300"
            style={{ color: 'var(--hotcocoa-text-secondary)' }}
          >
            Carregando...
          </span>
        </button>
      </div>

      {/* Config Link */}
      <button 
        className="text-sm underline opacity-80 hover:opacity-100 transition-all duration-300 mb-2 relative z-10"
        style={{ color: 'var(--hotcocoa-accent)' }}
      >
        Configurar Google API
      </button>

      {/* Bottom Status */}
      <div className="mt-4 relative z-10">
        <p 
          className="text-sm opacity-50 transition-colors duration-300"
          style={{ color: 'var(--hotcocoa-text-secondary)' }}
        >
          Nenhuma foto selecionada
        </p>
      </div>
    </div>
  );
}