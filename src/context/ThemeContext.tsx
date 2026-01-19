// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

type IntimacyMode = 'HOT' | 'WARM';

interface ThemeSettings {
  mode: IntimacyMode;
  aiSettings: {
    temperature: number;
    maxTokens: number;
    topP: number;
    systemPromptOverride?: string;
  };
}

interface ThemeContextType {
  mode: IntimacyMode;
  settings: ThemeSettings;
  setMode: (mode: IntimacyMode) => void;
  updateAiSettings: (settings: Partial<ThemeSettings['aiSettings']>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<IntimacyMode>('HOT');
  const [settings, setSettings] = useState<ThemeSettings>({
    mode: 'HOT',
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

  const handleSetMode = (newMode: IntimacyMode) => {
    setMode(newMode);
    // Update CSS variables specifically for the mode - Deep Dark palette
    const root = document.documentElement;
    if (newMode === 'HOT') {
      root.style.setProperty('--color-primary', '#e11d48');
      root.style.setProperty('--color-bg', '#0a0506');      // DEEP void
      root.style.setProperty('--color-accent', '#c2410c');
      root.style.setProperty('--color-surface', '#1f0f12');
    } else {
      root.style.setProperty('--color-primary', '#db2777');
      root.style.setProperty('--color-bg', '#0f0508');      // DEEP pink-void
      root.style.setProperty('--color-accent', '#d97706');
      root.style.setProperty('--color-surface', '#1a0a10');
    }
  };

  return (
    <ThemeContext.Provider value={{ mode, settings, setMode: handleSetMode, updateAiSettings }}>
      <div className={`theme-${mode.toLowerCase()} transition-colors duration-500 min-h-screen`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
