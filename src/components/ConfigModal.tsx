import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import LocalFireDepartmentRounded from '@mui/icons-material/LocalFireDepartmentRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import KeyRounded from '@mui/icons-material/KeyRounded';
import { Modal } from "./Modal";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const { mode, setMode } = useTheme();
  const [temperature, setTemperature] = useState(0.8);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [apiKey, setApiKey] = useState("");

  // Sync local state with theme context if needed
  useEffect(() => {
    // This ensures the local experienceMode reflects the global theme
  }, [mode]);

  const handleModeChange = (newMode: "hot" | "warm") => {
    setMode(newMode);
  };

  const handleSave = () => {
    // Logic to save settings would go here (e.g. localStorage or context update)
    // For now, we just close the modal
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System Configuration">
      <div className="flex flex-col gap-6">
        
        {/* Experience Mode */}
        <div>
          <h3 
            className="text-sm uppercase tracking-wider mb-4 transition-colors duration-300 font-bold"
            style={{ color: 'var(--hotcocoa-text-secondary)' }}
          >
            Experience Mode
          </h3>
          
          <div className="flex gap-3">
            {/* Hot Mode */}
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
              aria-pressed={mode === "hot"}
              aria-label="Switch to Hot mode"
            >
              <LocalFireDepartmentRounded 
                sx={{ 
                  fontSize: 24, 
                  color: 'var(--hotcocoa-accent)' 
                }} 
              />
              <div className="text-left">
                <div 
                  className="text-sm font-medium transition-colors duration-300"
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

            {/* Warm Mode */}
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
              aria-pressed={mode === "warm"}
              aria-label="Switch to Warm mode"
            >
              <FavoriteRounded 
                sx={{ 
                  fontSize: 24, 
                  color: 'var(--hotcocoa-accent)' 
                }} 
              />
              <div className="text-left">
                <div 
                  className="text-sm font-medium transition-colors duration-300"
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

        {/* API Configuration */}
        <div>
          <h3 
            className="text-sm uppercase tracking-wider mb-4 transition-colors duration-300 font-bold"
            style={{ color: 'var(--hotcocoa-text-secondary)' }}
          >
            API Configuration
          </h3>
          
          <div className="flex flex-col gap-2">
            <label 
              htmlFor="gemini-api-key"
              className="text-sm flex items-center gap-2"
              style={{ color: 'var(--hotcocoa-text-primary)' }}
            >
              <KeyRounded sx={{ fontSize: 18, color: 'var(--hotcocoa-accent)' }} />
              Gemini API Key
            </label>
            <input
              id="gemini-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="w-full p-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--hotcocoa-accent)]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'var(--hotcocoa-border)',
                color: 'var(--hotcocoa-text-primary)',
              }}
            />
            <p className="text-xs opacity-60" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
              Required for AI generation features.
            </p>
          </div>
        </div>

        {/* Model Parameters */}
        <div>
          <h3 
            className="text-sm uppercase tracking-wider mb-4 transition-colors duration-300 font-bold"
            style={{ color: 'var(--hotcocoa-text-secondary)' }}
          >
            Model Parameters
          </h3>

          {/* Temperature */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="temperature-slider"
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-primary)' }}
              >
                Temperature (Creativity)
              </label>
              <span 
                className="text-sm font-mono"
                style={{ color: 'var(--hotcocoa-accent)' }}
              >
                {temperature.toFixed(1)}
              </span>
            </div>
            <input
              id="temperature-slider"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--hotcocoa-accent) 0%, var(--hotcocoa-accent) ${(temperature / 2) * 100}%, var(--hotcocoa-border) ${(temperature / 2) * 100}%, var(--hotcocoa-border) 100%)`
              }}
            />
          </div>

          {/* Max Tokens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="max-tokens-slider"
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-primary)' }}
              >
                Max Tokens (Length)
              </label>
              <span 
                className="text-sm font-mono"
                style={{ color: 'var(--hotcocoa-accent)' }}
              >
                {maxTokens}
              </span>
            </div>
            <input
              id="max-tokens-slider"
              type="range"
              min="256"
              max="2048"
              step="256"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--hotcocoa-accent) 0%, var(--hotcocoa-accent) ${((maxTokens - 256) / (2048 - 256)) * 100}%, var(--hotcocoa-border) ${((maxTokens - 256) / (2048 - 256)) * 100}%, var(--hotcocoa-border) 100%)`
              }}
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 font-bold shadow-lg"
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
    </Modal>
  );
}
