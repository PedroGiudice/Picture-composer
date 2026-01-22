// src/components/ConfigModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Flame, Heart, AlertCircle, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { getCredentials, saveCredentials, clearCredentials } from '@/utils/googleIntegration';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'experience' | 'model' | 'google';

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const { mode, setMode, settings, updateAiSettings } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('experience');
  const [temperature, setTemperature] = useState(settings.aiSettings.temperature);
  const [maxTokens, setMaxTokens] = useState(settings.aiSettings.maxTokens);
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTemperature(settings.aiSettings.temperature);
      setMaxTokens(settings.aiSettings.maxTokens);
      const creds = getCredentials();
      if (creds) {
        setClientId(creds.clientId);
        setApiKey(creds.apiKey);
      }
    }
  }, [isOpen, settings.aiSettings]);

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const handleSaveModelParams = () => {
    updateAiSettings({ temperature, maxTokens });
  };

  const handleSaveGoogleCreds = () => {
    if (clientId && apiKey) {
      saveCredentials(clientId.trim(), apiKey.trim());
    }
  };

  const handleClearCreds = () => {
    clearCredentials();
    setClientId('');
    setApiKey('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Modal - MD3 Elevated Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto transition-colors duration-300"
          style={{
            backgroundColor: 'var(--hotcocoa-card-bg)',
            borderRadius: '16px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl transition-colors duration-300"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <Settings
                  size={24}
                  style={{ color: 'var(--hotcocoa-accent)' }}
                />
              </div>
              <h2
                className="text-xl transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-primary)' }}
              >
                Configuracao
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 active:scale-95 touch-target"
              aria-label="Fechar"
            >
              <X size={24} style={{ color: 'var(--hotcocoa-text-secondary)' }} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['experience', 'model', 'google'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab ? 'scale-105' : 'opacity-60'
                }`}
                style={{
                  backgroundColor: activeTab === tab ? 'var(--hotcocoa-accent)' : 'transparent',
                  color: activeTab === tab
                    ? (mode === 'warm' ? '#3d2817' : '#000')
                    : 'var(--hotcocoa-text-secondary)',
                  border: activeTab === tab ? 'none' : '1px solid var(--hotcocoa-border)'
                }}
              >
                {tab === 'experience' ? 'Modo' : tab === 'model' ? 'IA' : 'Google'}
              </button>
            ))}
          </div>

          {/* Tab Content: Experience Mode */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <h3
                className="text-sm uppercase tracking-wider mb-4 transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-secondary)' }}
              >
                Modo de Experiencia
              </h3>

              <div className="flex gap-3">
                {/* Hot Mode Card */}
                <button
                  onClick={() => handleModeChange('hot')}
                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 active:scale-95 ${
                    mode === 'hot' ? 'scale-105' : 'opacity-60'
                  }`}
                  style={{
                    backgroundColor: mode === 'hot' ? 'var(--hotcocoa-bg)' : 'transparent',
                    borderColor: mode === 'hot' ? 'var(--hotcocoa-accent)' : 'var(--hotcocoa-border)',
                    borderRadius: '12px',
                    minHeight: '48px'
                  }}
                >
                  <Flame size={24} style={{ color: 'var(--hotcocoa-accent)' }} />
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
                      Visceral & Explicito
                    </div>
                  </div>
                </button>

                {/* Warm Mode Card */}
                <button
                  onClick={() => handleModeChange('warm')}
                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 active:scale-95 ${
                    mode === 'warm' ? 'scale-105' : 'opacity-60'
                  }`}
                  style={{
                    backgroundColor: mode === 'warm' ? 'var(--hotcocoa-bg)' : 'transparent',
                    borderColor: mode === 'warm' ? 'var(--hotcocoa-accent)' : 'var(--hotcocoa-border)',
                    borderRadius: '12px',
                    minHeight: '48px'
                  }}
                >
                  <Heart size={24} style={{ color: 'var(--hotcocoa-accent)' }} />
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
                      Profundo & Emocional
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Tab Content: Model Parameters */}
          {activeTab === 'model' && (
            <div className="space-y-6">
              <h3
                className="text-sm uppercase tracking-wider mb-4 transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-secondary)' }}
              >
                Parametros do Modelo
              </h3>

              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="text-sm transition-colors duration-300"
                    style={{ color: 'var(--hotcocoa-text-primary)' }}
                  >
                    Temperature (Criatividade)
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
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="text-sm transition-colors duration-300"
                    style={{ color: 'var(--hotcocoa-text-primary)' }}
                  >
                    Max Tokens (Tamanho)
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
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <button
                onClick={handleSaveModelParams}
                className="w-full py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--hotcocoa-accent)',
                  color: mode === 'warm' ? '#3d2817' : '#000',
                  minHeight: '48px'
                }}
              >
                <Check size={18} />
                Salvar Parametros
              </button>
            </div>
          )}

          {/* Tab Content: Google API */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <h3
                className="text-sm uppercase tracking-wider mb-4 transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-secondary)' }}
              >
                Google API
              </h3>

              <div>
                <label className="block text-xs mb-2" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
                  CLIENT ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--hotcocoa-bg)',
                    color: 'var(--hotcocoa-text-primary)',
                    border: '1px solid var(--hotcocoa-border)'
                  }}
                  placeholder="000000000000-xxxx.apps.googleusercontent.com"
                />
              </div>

              <div>
                <label className="block text-xs mb-2" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
                  API KEY
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--hotcocoa-bg)',
                    color: 'var(--hotcocoa-text-primary)',
                    border: '1px solid var(--hotcocoa-border)'
                  }}
                  placeholder="AIzaSy..."
                />
              </div>

              <div
                className="p-4 rounded-lg text-xs space-y-2"
                style={{
                  background: 'var(--hotcocoa-bg)',
                  border: '1px solid var(--hotcocoa-border)'
                }}
              >
                <p className="flex items-start gap-2" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
                  <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-gold)' }} />
                  <span>Habilite a <strong>Google Picker API</strong> no seu projeto.</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveGoogleCreds}
                  disabled={!clientId || !apiKey}
                  className="flex-1 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{
                    backgroundColor: 'var(--hotcocoa-accent)',
                    color: mode === 'warm' ? '#3d2817' : '#000',
                    minHeight: '48px'
                  }}
                >
                  <Check size={18} />
                  Salvar
                </button>
                {getCredentials() && (
                  <button
                    onClick={handleClearCreds}
                    className="px-4 py-3 rounded-xl transition-all duration-300 active:scale-95"
                    style={{
                      background: 'var(--hotcocoa-bg)',
                      color: 'var(--hotcocoa-text-secondary)',
                      border: '1px solid var(--hotcocoa-border)',
                      minHeight: '48px'
                    }}
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
