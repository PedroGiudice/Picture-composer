// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Lowercase para consistencia com data-theme attribute
export type ThemeMode = 'hot' | 'warm';

interface ThemeSettings {
  mode: ThemeMode;
  aiSettings: {
    temperature: number;
    maxTokens: number;
    topP: number;
    systemPromptOverride?: string;
  };
}

interface ThemeContextType {
  mode: ThemeMode;
  settings: ThemeSettings;
  setMode: (mode: ThemeMode) => void;
  updateAiSettings: (settings: Partial<ThemeSettings['aiSettings']>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('hot');
  const [settings, setSettings] = useState<ThemeSettings>({
    mode: 'hot',
    aiSettings: {
      temperature: 0.8,
      maxTokens: 1024,
      topP: 0.95
    }
  });

  const updateAiSettings = (newSettings: Partial<ThemeSettings['aiSettings']>) => {
    setSettings(prev => ({
      ...prev,
      aiSettings: { ...prev.aiSettings, ...newSettings }
    }));
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    setSettings(prev => ({ ...prev, mode: newMode }));
  };

  // Apply theme to document root via data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, settings, setMode, updateAiSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
