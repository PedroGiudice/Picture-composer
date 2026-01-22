import { useState } from "react";
import { HotCocoaSlider } from "@/components/HotCocoaSlider";
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import { useTheme } from "@/context/ThemeContext";

interface ViewingScreenProps {
  photoUrl: string;
  currentRound: number;
  totalRounds: number;
  onStartProtocol: () => void;
}

export function ViewingScreen({ 
  photoUrl, 
  currentRound, 
  totalRounds,
  onStartProtocol 
}: ViewingScreenProps) {
  const [intensity, setIntensity] = useState(1);
  const { mode } = useTheme();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Photo Display Area */}
      <div 
        className="w-full flex items-center justify-center overflow-hidden relative transition-colors duration-300"
        style={{ 
          height: '45%',
          backgroundColor: 'var(--hotcocoa-bg)'
        }}
      >
        <img 
          src={photoUrl}
          alt="Memory"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Round Indicator */}
      <div 
        className="py-3 text-center transition-colors duration-300"
        style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
      >
        <span 
          className="text-sm transition-colors duration-300"
          style={{ color: 'var(--hotcocoa-text-secondary)' }}
        >
          Rodada {currentRound} de {totalRounds}
        </span>
      </div>

      {/* Control Area - MD3 Card */}
      <div 
        className="flex-1 flex flex-col px-6 pt-8 pb-24 transition-colors duration-300"
        style={{ backgroundColor: 'var(--hotcocoa-card-bg)' }}
      >
        {/* Action Title */}
        <h3 
          className="text-2xl mb-6 text-center transition-colors duration-300"
          style={{ color: 'var(--hotcocoa-accent)' }}
        >
          Calibrar Sessao
        </h3>

        {/* Subtitle */}
        <p 
          className="text-sm text-center mb-8 opacity-80 transition-colors duration-300"
          style={{ color: 'var(--hotcocoa-text-primary)' }}
        >
          Selecione a intensidade para esta memoria.
        </p>

        {/* Intensity Slider - MD3 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <label 
              className="text-sm uppercase tracking-wider transition-colors duration-300"
              style={{ color: 'var(--hotcocoa-text-secondary)' }}
            >
              Intensity Level
            </label>
            <span 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--hotcocoa-text-primary)' }}
            >
              {intensity}/10
            </span>
          </div>
          
          <HotCocoaSlider
            value={[intensity]}
            onValueChange={(values) => setIntensity(values[0])}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />

          {/* Slider Labels */}
          <div className="flex justify-between mt-2 px-1">
            <span 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--hotcocoa-text-secondary)' }}
            >
              SENSATE
            </span>
            <span 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--hotcocoa-text-secondary)' }}
            >
              SOMATIC
            </span>
          </div>
        </div>

        {/* Action Button - MD3 Filled Button */}
        <button
          onClick={onStartProtocol}
          className="w-full py-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          style={{ 
            backgroundColor: 'var(--hotcocoa-accent)',
            color: mode === 'warm' ? '#3d2817' : '#000',
            borderRadius: '12px',
            minHeight: '48px'
          }}
        >
          <PlayArrowRounded sx={{ fontSize: 24 }} />
          INICIAR PROTOCOLO
        </button>
      </div>
    </div>
  );
}