import CloseRounded from '@mui/icons-material/CloseRounded';
import LocalFireDepartmentRounded from '@mui/icons-material/LocalFireDepartmentRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const { mode, setMode } = useTheme();
  const [temperature, setTemperature] = useState(0.8);
  const [maxTokens, setMaxTokens] = useState(1024);

  // Sync local state with theme context
  useEffect(() => {
    // This ensures the local experienceMode reflects the global theme
  }, [mode]);

  const handleModeChange = (newMode: "hot" | "warm") => {
    setMode(newMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal - MD3 Elevated Card with 16dp radius */}
      <div 
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto transition-colors duration-300"
        style={{ 
          backgroundColor: 'var(--hotcocoa-card-bg)',
          borderRadius: '16px'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl transition-colors duration-300"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <SettingsRounded 
                sx={{ 
                  fontSize: 24, 
                  color: 'var(--hotcocoa-accent)' 
                }} 
              />
            </div>
            <h2 
              className="text-xl transition-colors duration-300"
              style={{ color: 'var(--hotcocoa-text-primary)' }}
            >
              System Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 active:scale-95"
            aria-label="Close"
            style={{ 
              minWidth: '48px', 
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CloseRounded 
              sx={{ 
                fontSize: 24, 
                color: 'var(--hotcocoa-text-secondary)' 
              }} 
            />
          </button>
        </div>

        {/* Experience Mode */}
        <div className="mb-8">
          <h3 
            className="text-sm uppercase tracking-wider mb-4 transition-colors duration-300"
            style={{ color: 'var(--hotcocoa-text-secondary)' }}
          >
            Experience Mode
          </h3>
          
          <div className="flex gap-3">
            {/* Hot Mode - MD3 Filled Button Card */}
            <button
              onClick={() => handleModeChange("hot")}
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 active:scale-95 ${
                mode === "hot" ? "scale-105" : "opacity-60"
              }`}
              style={{
                backgroundColor: mode === "hot" ? 'var(--hotcocoa-bg)' : 'transparent',
                borderColor: mode === "hot" ? 'var(--hotcocoa-accent)' : 'var(--hotcocoa-border)',
                borderRadius: '12px',
                minHeight: '48px'
              }}
            >
              <LocalFireDepartmentRounded 
                sx={{ 
                  fontSize: 24, 
                  color: 'var(--hotcocoa-accent)' 
                }} 
              />
              <div className="text-left">
                <div 
                  className="text-sm transition-colors duration-300"
                  style={{ color: 'var(--hotcocoa-text-primary)' }}
                >
                  HOT
                </div>
                <div 
                  className="text-xs opacity-80 transition-colors duration-300"
                  style={{ color: 'var(--hotcocoa-text-secondary)' }}
                >
                  Visceral & Explicit
                </div>
              </div>
            </button>

            {/* Warm Mode - MD3 Filled Button Card */}
            <button
              onClick={() => handleModeChange("warm")}
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 active:scale-95 ${
                mode === "warm" ? "scale-105" : "opacity-60"
              }`}
              style={{
                backgroundColor: mode === "warm" ? 'var(--hotcocoa-bg)' : 'transparent',
                borderColor: mode === "warm" ? 'var(--hotcocoa-accent)' : 'var(--hotcocoa-border)',
                borderRadius: '12px',
                minHeight: '48px'
              }}
            >
              <FavoriteRounded 
                sx={{ 
                  fontSize: 24, 
                  color: 'var(--hotcocoa-accent)' 
                }} 
              />
              <div className="text-left">
                <div 
                  className="text-sm transition-colors duration-300"
                  style={{ color: 'var(--hotcocoa-text-primary)' }}
                >
                  WARM
                </div>
                <div 
                  className="text-xs opacity-80 transition-colors duration-300"
                  style={{ color: 'var(--hotcocoa-text-secondary)' }}
                >
                  Deep & Emotional
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Model Parameters */}
        <div className="mb-6">
          <h3 
            className="text-sm uppercase tracking-wider mb-4 transition-colors duration-300"
            style={{ color: 'var(--hotcocoa-text-secondary)' }}
          >
            Model Parameters
          </h3>

          {/* Temperature - MD3 Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label 
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-primary)' }}
              >
                Temperature (Creativity)
              </label>
              <span 
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-accent)' }}
              >
                {temperature.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer transition-all duration-300"
              style={{
                background: `linear-gradient(to right, var(--hotcocoa-accent) 0%, var(--hotcocoa-accent) ${(temperature / 2) * 100}%, var(--hotcocoa-border) ${(temperature / 2) * 100}%, var(--hotcocoa-border) 100%)`
              }}
            />
          </div>

          {/* Max Tokens - MD3 Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-primary)' }}
              >
                Max Tokens (Length)
              </label>
              <span 
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-accent)' }}
              >
                {maxTokens}
              </span>
            </div>
            <input
              type="range"
              min="256"
              max="2048"
              step="256"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer transition-all duration-300"
              style={{
                background: `linear-gradient(to right, var(--hotcocoa-accent) 0%, var(--hotcocoa-accent) ${((maxTokens - 256) / (2048 - 256)) * 100}%, var(--hotcocoa-border) ${((maxTokens - 256) / (2048 - 256)) * 100}%, var(--hotcocoa-border) 100%)`
              }}
            />
          </div>
        </div>

        {/* Save Button - MD3 Filled Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ 
            backgroundColor: 'var(--hotcocoa-accent)',
            color: mode === 'warm' ? '#3d2817' : '#000',
            borderRadius: '12px',
            minHeight: '48px'
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}