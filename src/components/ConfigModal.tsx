// src/components/ConfigModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle } from 'lucide-react';
import { FloatingCard } from './ui/FloatingCard';
import { getCredentials, saveCredentials, clearCredentials } from '../utils/googleIntegration';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const creds = getCredentials();
      if (creds) {
        setClientId(creds.clientId);
        setApiKey(creds.apiKey);
      }
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <FloatingCard
          className="w-full max-w-md mx-4"
          elevation={3}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              API Configuration
            </h2>
            <button
              onClick={onClose}
              className="p-1 active:opacity-70 transition-opacity"
            >
              <X size={20} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                CLIENT ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
                style={{
                  background: 'var(--bg-deep)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(225, 29, 72, 0.2)'
                }}
                placeholder="000000000000-xxxx.apps.googleusercontent.com"
              />
            </div>
            <div>
              <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                API KEY
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
                style={{
                  background: 'var(--bg-deep)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(225, 29, 72, 0.2)'
                }}
                placeholder="AIzaSy..."
              />
            </div>

            {/* Info box */}
            <div
              className="p-4 rounded-lg text-xs space-y-2"
              style={{
                background: 'var(--bg-deep)',
                border: '1px solid rgba(225, 29, 72, 0.1)'
              }}
            >
              <p className="flex items-start gap-2" style={{ color: 'var(--text-dim)' }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-gold)' }} />
                <span>Ensure your Google Cloud Project has the <strong>Google Picker API</strong> enabled.</span>
              </p>
              <p className="flex items-start gap-2" style={{ color: 'var(--text-dim)' }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-gold)' }} />
                <span>Add <strong>{window.location.origin}</strong> to "Authorized JavaScript origins".</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={!clientId || !apiKey}
              className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-wine))',
                color: 'white'
              }}
            >
              <Check size={18} />
              SAVE CREDENTIALS
            </button>
            {getCredentials() && (
              <button
                onClick={handleClear}
                className="px-4 py-3 rounded-lg font-medium transition-all active:scale-[0.98] active:bg-[var(--bg-elevated)]"
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-muted)',
                  border: '1px solid rgba(225, 29, 72, 0.2)'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </FloatingCard>
      </motion.div>
    </AnimatePresence>
  );
};
