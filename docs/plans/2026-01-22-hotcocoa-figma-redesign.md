# HotCocoa Figma Redesign - Plano de Implementacao

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fazer merge do codigo gerado pelo Figma Make no projeto HotCocoa, corrigindo 25 problemas visuais documentados no Android.

**Architecture:** Substituir UI atual pelo design Figma (Material Design 3, CSS variables `--hotcocoa-*`, safe areas) mantendo toda logica de negocio existente (Tauri filesystem, API Modal.com, Google Picker, state machine do MemoryViewer).

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Radix UI, Lucide React, Tauri 2.x

**Branch:** `fix/android-safe-areas` (ja criada)

---

## Problemas Corrigidos por Este Plano

| # | Problema | Solucao |
|---|----------|---------|
| 1-4, 19, 21 | Safe areas ignoradas | CSS `env(safe-area-inset-*)` no body e App.tsx |
| 2, 17 | Texto cortado/vazando | Containers com overflow correto |
| 3 | Modal mal centralizado | Flexbox centering do Figma |
| 5 | Hierarquia confusa no modal | Novo layout ConfigModal do Figma |
| 6 | Slider sem indicador | HotCocoaSlider com Radix UI |
| 7-8 | Header inconsistente | Header unificado do Figma |
| 9 | Animacao dominante | ParticleBackground sutil do Figma |
| 10-11 | Botoes inconsistentes | Cards MD3 do Figma |
| 12-13, 25 | Layout nao responsivo | Flexbox layout do Figma |
| 14-16, 20 | Foto duplicada/cortada | ViewingScreen corrigido |
| 18 | Slider invisivel | HotCocoaSlider visivel |
| 22 | Fonte monospace | Manter (decisao de design) |
| 23 | Baixo contraste | Novas CSS variables |
| 24 | Sem feedback de estado | Loading states preservados |

---

## Task 1: Instalar Dependencias e Criar Utilitarios

**Files:**
- Modify: `package.json`
- Create: `src/lib/utils.ts`

**Step 1: Verificar dependencias existentes**

Run: `cat package.json | grep -E "(clsx|tailwind-merge)"`
Expected: Ambas ja existem no projeto

**Step 2: Criar utilitario cn()**

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 3: Verificar criacao**

Run: `cat src/lib/utils.ts`
Expected: Funcao cn() exportada

**Step 4: Commit**

```bash
git add src/lib/utils.ts
git commit -m "chore: add cn() utility function for class merging"
```

---

## Task 2: Criar Arquivos CSS do Tema Figma

**Files:**
- Create: `src/styles/hotcocoa.css`
- Modify: `src/styles/theme.css`
- Modify: `src/index.css`

**Step 1: Criar hotcocoa.css**

```css
/* src/styles/hotcocoa.css */
/* HotCocoa App Custom Styles - Figma Design System */

/* Smooth theme transitions */
:root,
body,
div,
button,
input,
header,
footer,
main {
  transition-property: background-color, border-color, color;
  transition-duration: 300ms;
  transition-timing-function: ease-in-out;
}

/* Mobile viewport configuration */
@supports (height: 100dvh) {
  .h-screen {
    height: 100dvh;
  }
}

/* Placeholder styling */
input::placeholder {
  color: var(--hotcocoa-text-secondary);
  opacity: 0.5;
}

/* Custom input range styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--hotcocoa-text-primary);
  border: 2px solid var(--hotcocoa-accent);
  cursor: pointer;
  transition: all 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

input[type="range"]::-webkit-slider-thumb:active {
  transform: scale(1.15);
}

input[type="range"]::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 4px;
  background: var(--hotcocoa-border);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--hotcocoa-text-primary);
  border: 2px solid var(--hotcocoa-accent);
  cursor: pointer;
  transition: all 0.2s;
}

input[type="range"]::-moz-range-track {
  height: 8px;
  border-radius: 4px;
  background: var(--hotcocoa-border);
}

/* Prevent text selection on touch devices */
.select-none {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

/* Smooth scrolling */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Safe area insets for notched devices - CRITICAL FOR ANDROID */
@supports (padding: max(0px)) {
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}

/* Touch targets - WCAG 2.1 AA minimum 48x48px */
.touch-target {
  min-width: 48px;
  min-height: 48px;
}

/* MD3 Elevation */
.elevation-1 {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.elevation-2 {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.elevation-3 {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
}
```

**Step 2: Atualizar theme.css com variables do Figma**

```css
/* src/styles/theme.css */
/* HotCocoa Theme - Figma Design System */

:root {
  /* HOT MODE Theme - Default (Dark, Visceral) */
  --hotcocoa-bg: #0f0a08;
  --hotcocoa-card-bg: #2d1e18;
  --hotcocoa-header-bg: #1a1210;
  --hotcocoa-text-primary: #f5d5d5;
  --hotcocoa-text-secondary: #b89090;
  --hotcocoa-accent: #e87d8f;
  --hotcocoa-accent-hover: #f298a8;
  --hotcocoa-border: rgba(232, 125, 143, 0.2);

  /* Legacy variables - mapped for compatibility */
  --bg-void: var(--hotcocoa-bg);
  --bg-deep: var(--hotcocoa-header-bg);
  --bg-surface: var(--hotcocoa-card-bg);
  --bg-elevated: #3d2e28;
  --accent-rose: var(--hotcocoa-accent);
  --accent-wine: #881337;
  --accent-ember: #c2410c;
  --accent-gold: #d97706;
  --text-primary: var(--hotcocoa-text-primary);
  --text-muted: var(--hotcocoa-text-secondary);
  --text-dim: rgba(245, 213, 213, 0.4);

  /* Glow Effects */
  --glow-rose: 0 0 40px rgba(232, 125, 143, 0.3);
  --glow-ember: 0 0 60px rgba(194, 65, 12, 0.2);

  /* Material Elevation Shadows */
  --shadow-1: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-2: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  --shadow-3: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);

  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Color for ThemeContext JS manipulation */
  --color-primary: var(--hotcocoa-accent);
  --color-bg: var(--hotcocoa-bg);
  --color-accent: var(--accent-ember);
  --color-surface: var(--hotcocoa-card-bg);
}

/* WARM MODE Theme - Light, Emotional */
[data-theme="warm"] {
  --hotcocoa-bg: #f5e6d3;
  --hotcocoa-card-bg: #e8d4bf;
  --hotcocoa-header-bg: #d9c4af;
  --hotcocoa-text-primary: #3d2817;
  --hotcocoa-text-secondary: #6b523f;
  --hotcocoa-accent: #d4915e;
  --hotcocoa-accent-hover: #c27d4a;
  --hotcocoa-border: rgba(212, 145, 94, 0.3);

  /* Legacy variables for warm mode */
  --bg-void: var(--hotcocoa-bg);
  --bg-deep: var(--hotcocoa-header-bg);
  --bg-surface: var(--hotcocoa-card-bg);
  --bg-elevated: #d9c4af;
  --accent-rose: var(--hotcocoa-accent);
  --text-primary: var(--hotcocoa-text-primary);
  --text-muted: var(--hotcocoa-text-secondary);
  --text-dim: rgba(61, 40, 23, 0.4);
  --color-primary: var(--hotcocoa-accent);
  --color-bg: var(--hotcocoa-bg);
  --color-surface: var(--hotcocoa-card-bg);
}

/* HOT MODE Theme - Explicit (for data-theme attribute) */
[data-theme="hot"] {
  --hotcocoa-bg: #0f0a08;
  --hotcocoa-card-bg: #2d1e18;
  --hotcocoa-header-bg: #1a1210;
  --hotcocoa-text-primary: #f5d5d5;
  --hotcocoa-text-secondary: #b89090;
  --hotcocoa-accent: #e87d8f;
  --hotcocoa-accent-hover: #f298a8;
  --hotcocoa-border: rgba(232, 125, 143, 0.2);
}

/* Floating card effect - MD3 elevated surface */
.floating-card {
  background: linear-gradient(145deg, var(--bg-elevated), var(--bg-surface));
  border: 1px solid var(--hotcocoa-border);
  box-shadow:
    var(--glow-rose),
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.floating-card:hover {
  transform: translateY(-2px);
  box-shadow:
    var(--glow-rose),
    0 30px 60px -15px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Reduced Motion - Accessibility */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
  }

  .floating-card:hover {
    transform: none;
  }
}

/* Focus States - Accessibility */
:focus-visible {
  outline: 2px solid var(--hotcocoa-accent);
  outline-offset: 2px;
}
```

**Step 3: Atualizar index.css para importar hotcocoa.css**

Adicionar no topo do arquivo:
```css
@import "./styles/theme.css";
@import "./styles/hotcocoa.css";
```

**Step 4: Verificar imports**

Run: `head -5 src/index.css`
Expected: Imports dos arquivos CSS

**Step 5: Commit**

```bash
git add src/styles/hotcocoa.css src/styles/theme.css src/index.css
git commit -m "feat(theme): add Figma design system CSS variables and safe areas"
```

---

## Task 3: Atualizar ThemeContext

**Files:**
- Modify: `src/context/ThemeContext.tsx`

**Step 1: Ler arquivo atual**

Run: `cat src/context/ThemeContext.tsx`

**Step 2: Substituir conteudo**

```typescript
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
```

**Step 3: Verificar TypeScript**

Run: `npx tsc --noEmit src/context/ThemeContext.tsx 2>&1 || echo "Check errors above"`

**Step 4: Commit**

```bash
git add src/context/ThemeContext.tsx
git commit -m "refactor(theme): use data-theme attribute and lowercase mode values"
```

---

## Task 4: Criar HotCocoaSlider Component

**Files:**
- Create: `src/components/ui/HotCocoaSlider.tsx`

**Step 1: Criar componente**

```typescript
// src/components/ui/HotCocoaSlider.tsx
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface HotCocoaSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  className?: string;
}

export function HotCocoaSlider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: HotCocoaSliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min],
    [value, defaultValue, min],
  );

  return (
    <SliderPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className="relative w-full h-2 rounded-full overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: 'var(--hotcocoa-border)' }}
      >
        <SliderPrimitive.Range
          className="absolute h-full transition-colors duration-300"
          style={{ backgroundColor: 'var(--hotcocoa-accent)' }}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="block w-5 h-5 rounded-full border-2 shadow-lg transition-all duration-300 hover:scale-110 focus:scale-110 focus:outline-none active:scale-125"
          style={{
            backgroundColor: 'var(--hotcocoa-text-primary)',
            borderColor: 'var(--hotcocoa-accent)',
          }}
        />
      ))}
    </SliderPrimitive.Root>
  );
}
```

**Step 2: Verificar sintaxe**

Run: `npx tsc --noEmit src/components/ui/HotCocoaSlider.tsx 2>&1 || echo "Check errors"`

**Step 3: Commit**

```bash
git add src/components/ui/HotCocoaSlider.tsx
git commit -m "feat(ui): add HotCocoaSlider component from Figma design"
```

---

## Task 5: Criar ParticleBackground Component

**Files:**
- Create: `src/components/ui/ParticleBackground.tsx`

**Step 1: Criar componente**

```typescript
// src/components/ui/ParticleBackground.tsx
import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.3 + 0.1;

        const colors = mode === 'hot'
          ? [
              "rgba(232, 125, 143, ",
              "rgba(184, 144, 144, ",
              "rgba(245, 213, 213, ",
              "rgba(120, 80, 80, ",
            ]
          : [
              "rgba(212, 145, 94, ",
              "rgba(107, 82, 63, ",
              "rgba(217, 196, 175, ",
              "rgba(194, 125, 74, ",
            ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y -= this.speedY;
        if (this.y < -10) {
          this.y = canvas.height + 10;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color + this.opacity + ")";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle());
    }

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ui/ParticleBackground.tsx
git commit -m "feat(ui): add ParticleBackground component from Figma design"
```

---

## Task 6: Atualizar Navigation/Header

**Files:**
- Modify: `src/components/Navigation.tsx`

**Step 1: Substituir conteudo**

```typescript
// src/components/Navigation.tsx
import React, { useState } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ConfigModal } from './ConfigModal';

interface NavigationProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  onBack,
  showBackButton = false
}) => {
  const { mode } = useTheme();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-12 transition-colors duration-300"
        style={{
          backgroundColor: 'var(--hotcocoa-header-bg)',
          paddingTop: 'env(safe-area-inset-top)'
        }}
      >
        {/* Back Button - Left */}
        <div className="flex-1">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 active:scale-95 touch-target"
              aria-label="Voltar"
              style={{
                minWidth: '48px',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowLeft
                size={24}
                style={{ color: 'var(--hotcocoa-text-secondary)' }}
              />
            </button>
          )}
        </div>

        {/* Title + Mode Badge - Center */}
        <div className="flex items-center gap-2">
          <h1
            className="text-xl tracking-wide transition-colors duration-300"
            style={{ color: 'var(--hotcocoa-accent)' }}
          >
            HotCocoa
          </h1>
          <div
            className="px-2 py-0.5 rounded-full text-xs uppercase transition-all duration-300"
            style={{
              backgroundColor: 'var(--hotcocoa-accent)',
              color: mode === 'warm' ? '#3d2817' : '#000',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            {mode}
          </div>
        </div>

        {/* Settings Button - Right */}
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => setIsConfigOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 active:scale-95 touch-target"
            aria-label="Configuracoes"
            style={{
              minWidth: '48px',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Settings
              size={24}
              style={{ color: 'var(--hotcocoa-text-secondary)' }}
            />
          </button>
        </div>
      </header>

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </>
  );
};
```

**Step 2: Commit**

```bash
git add src/components/Navigation.tsx
git commit -m "feat(nav): redesign Navigation with Figma header layout and safe areas"
```

---

## Task 7: Atualizar ConfigModal (Unificado)

**Files:**
- Modify: `src/components/ConfigModal.tsx`
- Delete: `src/components/ConfigPanel.tsx` (funcionalidade movida)

**Step 1: Substituir ConfigModal**

```typescript
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
```

**Step 2: Remover ConfigPanel.tsx (funcionalidade movida para ConfigModal)**

Run: `rm src/components/ConfigPanel.tsx`

**Step 3: Commit**

```bash
git add src/components/ConfigModal.tsx
git rm src/components/ConfigPanel.tsx
git commit -m "feat(config): unify ConfigModal with experience mode, model params and Google API tabs"
```

---

## Task 8: Atualizar PhotoUploader (HomeScreen)

**Files:**
- Modify: `src/components/PhotoUploader.tsx`

**Step 1: Substituir conteudo mantendo logica Tauri**

```typescript
// src/components/PhotoUploader.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Upload, Cloud, Loader2, Settings, Image as ImageIcon, X } from 'lucide-react';
import { ParticleBackground } from './ui/ParticleBackground';
import { loadGoogleApi, openPicker, getCredentials } from '@/utils/googleIntegration';
import { isTauri, listLocalPhotos, savePhotoLocally, getPhotoAsBase64, fileToBase64 } from '@/services/tauri';

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
```

**Step 2: Commit**

```bash
git add src/components/PhotoUploader.tsx
git commit -m "feat(upload): redesign PhotoUploader with Figma HomeScreen layout"
```

---

## Task 9: Atualizar MemoryViewer (ViewingScreen)

**Files:**
- Modify: `src/components/MemoryViewer.tsx`

**Step 1: Substituir conteudo mantendo state machine e backend integration**

Este arquivo e grande. Preservar:
- State machine: SETUP -> PROCESSING -> REVEAL
- Sistema de rodadas
- Integracao com SomaticBackend e OllamaService
- Swipe navigation

Aplicar do Figma:
- Layout 45% foto / 55% controles
- HotCocoaSlider
- CSS variables --hotcocoa-*
- Safe areas

```typescript
// src/components/MemoryViewer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RefreshCw, Info, AlertTriangle, X, ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import { SomaticLoader } from './ui/SomaticLoader';
import { HotCocoaSlider } from './ui/HotCocoaSlider';
import { SomaticBackend, IntimacyResponse } from '@/services/api';
import { OllamaService } from '@/services/ollama';
import { useTheme } from '@/context/ThemeContext';

interface MemoryViewerProps {
  files: File[];
  onReset: () => void;
}

interface RoundData {
  file: File;
  photoUrl: string;
  result: IntimacyResponse | null;
}

export const MemoryViewer: React.FC<MemoryViewerProps> = ({ files, onReset }) => {
  const { mode } = useTheme();
  const TOTAL_ROUNDS = Math.min(files.length, 10);

  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [viewState, setViewState] = useState<'SETUP' | 'PROCESSING' | 'REVEAL'>('SETUP');
  const [heatLevel, setHeatLevel] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Swipe state
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Inicializar rodadas
  useEffect(() => {
    if (files.length > 0 && rounds.length === 0) {
      const shuffled = [...files].sort(() => Math.random() - 0.5);
      const selectedFiles = shuffled.slice(0, TOTAL_ROUNDS);
      const initialRounds: RoundData[] = selectedFiles.map(file => ({
        file,
        photoUrl: URL.createObjectURL(file),
        result: null
      }));
      setRounds(initialRounds);
    }
  }, [files, rounds.length, TOTAL_ROUNDS]);

  // Cleanup URLs
  useEffect(() => {
    return () => {
      rounds.forEach(round => {
        if (round.photoUrl) URL.revokeObjectURL(round.photoUrl);
      });
    };
  }, [rounds]);

  const currentRoundData = rounds[currentRound - 1];
  const photoUrl = currentRoundData?.photoUrl || '';
  const result = currentRoundData?.result || null;

  // Navigation
  const handlePrevious = useCallback(() => {
    if (currentRound > 1) {
      setCurrentRound(prev => prev - 1);
      const prevRound = rounds[currentRound - 2];
      setViewState(prevRound?.result ? 'REVEAL' : 'SETUP');
    }
  }, [currentRound, rounds]);

  const handleNext = useCallback(() => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound(prev => prev + 1);
      const nextRound = rounds[currentRound];
      setViewState(nextRound?.result ? 'REVEAL' : 'SETUP');
    }
  }, [currentRound, TOTAL_ROUNDS, rounds]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSwiping) setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    const diff = touchStart - touchEnd;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      diff > 0 ? handleNext() : handlePrevious();
    }
  };

  // Process round
  const handleProcess = async () => {
    if (!photoUrl) return;
    setErrorMessage(null);
    setViewState('PROCESSING');

    try {
      const data = await SomaticBackend.processSession(photoUrl, heatLevel);
      let finalResult: IntimacyResponse;

      if (data.error) {
        const fallback = await OllamaService.generateFallbackChallenge(heatLevel);
        finalResult = {
          challenge_title: fallback.title,
          challenge_text: fallback.instruction,
          rationale: fallback.rationale,
          intensity: heatLevel,
          duration_seconds: 120,
          error: 'Usando Ollama local'
        };
      } else {
        finalResult = data;
      }

      setRounds(prev => prev.map((round, idx) =>
        idx === currentRound - 1 ? { ...round, result: finalResult } : round
      ));
      setViewState('REVEAL');
    } catch (e) {
      try {
        const fallback = await OllamaService.generateFallbackChallenge(heatLevel);
        const finalResult: IntimacyResponse = {
          challenge_title: fallback.title,
          challenge_text: fallback.instruction,
          rationale: fallback.rationale,
          intensity: heatLevel,
          duration_seconds: 120,
          error: 'Usando Ollama local'
        };
        setRounds(prev => prev.map((round, idx) =>
          idx === currentRound - 1 ? { ...round, result: finalResult } : round
        ));
        setViewState('REVEAL');
      } catch {
        setErrorMessage('Nao foi possivel conectar aos servidores.');
        setViewState('SETUP');
      }
    }
  };

  const handleNextRound = () => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound(prev => prev + 1);
      setViewState('SETUP');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mb-2 p-3 rounded-xl flex items-start gap-3"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)' }}
          >
            <AlertTriangle size={20} style={{ color: '#f87171' }} />
            <p className="flex-1 text-sm" style={{ color: '#fca5a5' }}>{errorMessage}</p>
            <button onClick={() => setErrorMessage(null)} className="p-1">
              <X size={16} style={{ color: '#f87171' }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Display Area - 45% */}
      <div
        className="w-full flex items-center justify-center overflow-hidden relative transition-colors duration-300"
        style={{ height: '45%', backgroundColor: 'var(--hotcocoa-bg)' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          {photoUrl && (
            <motion.img
              key={photoUrl}
              src={photoUrl}
              alt="Memoria"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                filter: viewState === 'REVEAL' ? 'grayscale(0%)' : 'grayscale(50%) brightness(0.8)'
              }}
              exit={{ opacity: 0 }}
              className="w-full h-full object-cover"
            />
          )}
        </AnimatePresence>

        {/* Swipe indicators */}
        {currentRound > 1 && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-30">
            <ChevronLeft size={24} style={{ color: 'var(--hotcocoa-text-primary)' }} />
          </div>
        )}
        {currentRound < TOTAL_ROUNDS && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30">
            <ChevronRight size={24} style={{ color: 'var(--hotcocoa-text-primary)' }} />
          </div>
        )}
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
          Rodada {currentRound} de {TOTAL_ROUNDS}
        </span>
      </div>

      {/* Control Area - MD3 Card - 55% */}
      <div
        className="flex-1 flex flex-col px-6 pt-6 transition-colors duration-300"
        style={{
          backgroundColor: 'var(--hotcocoa-card-bg)',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom))'
        }}
      >
        <AnimatePresence mode="wait">
          {/* SETUP State */}
          {viewState === 'SETUP' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
            >
              <h3
                className="text-2xl mb-4 text-center transition-colors duration-300 flex items-center justify-center gap-2"
                style={{ color: 'var(--hotcocoa-accent)' }}
              >
                <Settings2 size={24} />
                Calibrar Sessao
              </h3>

              <p
                className="text-sm text-center mb-6 opacity-80 transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-primary)' }}
              >
                Selecione a intensidade para esta memoria.
              </p>

              {/* Intensity Slider */}
              <div className="mb-8">
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
                    {heatLevel}/10
                  </span>
                </div>

                <HotCocoaSlider
                  value={[heatLevel]}
                  onValueChange={(values) => setHeatLevel(values[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />

                <div className="flex justify-between mt-2 px-1">
                  <span className="text-xs" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
                    SENSATE
                  </span>
                  <span className="text-xs" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
                    SOMATIC
                  </span>
                </div>
              </div>

              <div className="flex-1" />

              <button
                onClick={handleProcess}
                className="w-full py-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 touch-target"
                style={{
                  backgroundColor: 'var(--hotcocoa-accent)',
                  color: mode === 'warm' ? '#3d2817' : '#000',
                  borderRadius: '12px',
                  minHeight: '48px'
                }}
              >
                <Play size={24} />
                INICIAR PROTOCOLO
              </button>
            </motion.div>
          )}

          {/* PROCESSING State */}
          {viewState === 'PROCESSING' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <SomaticLoader text="SINCRONIZANDO..." />
            </motion.div>
          )}

          {/* REVEAL State */}
          {viewState === 'REVEAL' && result && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col space-y-4"
            >
              {/* Challenge Card */}
              <div
                className="p-4 rounded-xl shadow-lg"
                style={{
                  backgroundColor: 'var(--hotcocoa-bg)',
                  borderLeft: '4px solid var(--hotcocoa-accent)'
                }}
              >
                <div
                  className="text-xs uppercase tracking-widest mb-2"
                  style={{ color: 'var(--hotcocoa-accent)' }}
                >
                  {result.challenge_title}
                </div>
                <p
                  className="text-base text-center leading-relaxed"
                  style={{ color: 'var(--hotcocoa-text-primary)' }}
                >
                  "{result.challenge_text}"
                </p>
              </div>

              {/* Rationale */}
              <details className="group">
                <summary
                  className="flex items-center gap-2 text-xs cursor-pointer list-none"
                  style={{ color: 'var(--hotcocoa-text-secondary)' }}
                >
                  <Info size={14} />
                  <span>Ver fundamentacao</span>
                </summary>
                <div
                  className="mt-2 p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
                >
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
                    {result.rationale}
                  </p>
                  {result?.error && (
                    <div className="mt-2 text-xs uppercase tracking-wider" style={{ color: 'var(--accent-gold)', opacity: 0.6 }}>
                      Modo Offline (Ollama)
                    </div>
                  )}
                </div>
              </details>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
                >
                  <p className="text-xs uppercase" style={{ color: 'var(--hotcocoa-text-secondary)' }}>Duracao</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--hotcocoa-text-primary)' }}>{result.duration_seconds}s</p>
                </div>
                <div
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
                >
                  <p className="text-xs uppercase" style={{ color: 'var(--hotcocoa-text-secondary)' }}>Intensidade</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--hotcocoa-accent)' }}>{result.intensity}/10</p>
                </div>
              </div>

              <div className="flex-1" />

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentRound === 1}
                  className="flex-1 py-3 rounded-xl font-medium disabled:opacity-40 active:scale-95 transition-all touch-target"
                  style={{
                    backgroundColor: 'var(--hotcocoa-bg)',
                    color: 'var(--hotcocoa-text-secondary)',
                    border: '1px solid var(--hotcocoa-border)',
                    minHeight: '48px'
                  }}
                >
                  Voltar
                </button>

                {currentRound < TOTAL_ROUNDS ? (
                  <button
                    onClick={handleNextRound}
                    className="flex-1 py-3 rounded-xl font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 touch-target"
                    style={{
                      backgroundColor: 'var(--hotcocoa-accent)',
                      color: mode === 'warm' ? '#3d2817' : '#000',
                      minHeight: '48px'
                    }}
                  >
                    Proxima Rodada
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={onReset}
                    className="flex-1 py-3 rounded-xl font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 touch-target"
                    style={{
                      backgroundColor: 'var(--hotcocoa-accent)',
                      color: mode === 'warm' ? '#3d2817' : '#000',
                      minHeight: '48px'
                    }}
                  >
                    <RefreshCw size={18} />
                    Finalizar
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
```

**Step 2: Commit**

```bash
git add src/components/MemoryViewer.tsx
git commit -m "feat(viewer): redesign MemoryViewer with Figma ViewingScreen layout and safe areas"
```

---

## Task 10: Atualizar App.tsx (Shell Principal)

**Files:**
- Modify: `src/App.tsx`

**Step 1: Substituir conteudo**

```typescript
// src/App.tsx
import React, { useState } from 'react';
import { PhotoUploader } from './components/PhotoUploader';
import { MemoryViewer } from './components/MemoryViewer';
import { MosaicCreator } from './components/MosaicCreator';
import { Navigation } from './components/Navigation';
import { ThemeProvider } from './context/ThemeContext';

type Screen = 'home' | 'viewing' | 'mosaic';

const HotCocoaApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleUpload = (newFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleClear = () => {
    setUploadedFiles([]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startExperience = () => {
    if (uploadedFiles.length > 0) {
      setCurrentScreen('viewing');
    }
  };

  const resetExperience = () => {
    setCurrentScreen('home');
    setUploadedFiles([]);
  };

  const goBack = () => {
    if (currentScreen === 'viewing' || currentScreen === 'mosaic') {
      setCurrentScreen('home');
    }
  };

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: 'var(--hotcocoa-bg)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Fixed Header */}
      <Navigation
        onBack={goBack}
        showBackButton={currentScreen !== 'home'}
      />

      {/* Main Content - starts below header (48px + safe area) */}
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ marginTop: 'calc(48px + env(safe-area-inset-top))' }}
      >
        {currentScreen === 'home' && (
          <PhotoUploader
            files={uploadedFiles}
            onUpload={handleUpload}
            onClear={handleClear}
            onRemove={handleRemoveFile}
            onContinue={startExperience}
          />
        )}

        {currentScreen === 'viewing' && (
          <MemoryViewer
            files={uploadedFiles}
            onReset={resetExperience}
          />
        )}

        {currentScreen === 'mosaic' && (
          <MosaicCreator sourceFiles={uploadedFiles} />
        )}
      </main>

      {/* Footer Version */}
      <footer
        className="py-2 text-center"
        style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
      >
        <span
          className="text-xs opacity-40"
          style={{ color: 'var(--hotcocoa-text-secondary)' }}
        >
          v0.0.1
        </span>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HotCocoaApp />
    </ThemeProvider>
  );
};

export default App;
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat(app): redesign App shell with Figma layout and safe area handling"
```

---

## Task 11: Configurar Path Aliases

**Files:**
- Modify: `tsconfig.json`
- Modify: `vite.config.ts`

**Step 1: Atualizar tsconfig.json**

Adicionar paths:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Step 2: Atualizar vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 3: Commit**

```bash
git add tsconfig.json vite.config.ts
git commit -m "chore: configure path aliases for @/* imports"
```

---

## Task 12: Build e Teste

**Step 1: Build web**

Run: `npm run build`
Expected: Build success sem erros

**Step 2: Preview local**

Run: `npm run preview`
Expected: App funciona em localhost

**Step 3: Build Android**

Run: `cargo tauri android build --debug --target aarch64`
Expected: APK gerado em `src-tauri/gen/android/app/build/outputs/apk/universal/debug/`

**Step 4: Copiar APK**

Run: `ls -la src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk`

**Step 5: Commit final**

```bash
git add -A
git commit -m "feat: complete Figma redesign merge - fixes 25 visual issues on Android"
```

---

## Verificacao Final

### Checklist de Problemas Corrigidos

| # | Problema | Como Verificar |
|---|----------|----------------|
| 1 | Invasao barra status | Header tem padding-top: safe-area-inset-top |
| 2 | Elementos fantasma | Overflow correto em todos containers |
| 3 | Modal nao centralizado | Flexbox centering no ConfigModal |
| 4 | Botao colado nav bar | padding-bottom: safe-area-inset-bottom |
| 5 | Hierarquia confusa | Novo layout ConfigModal |
| 6 | Slider sem indicador | HotCocoaSlider com Radix UI |
| 14 | Foto duplicada | Unica img em ViewingScreen |
| 21 | Safe areas | CSS env() em body e containers |

### Teste no Dispositivo

1. Instalar APK: `adb install ~/hotcocoa.apk`
2. Verificar header nao invade status bar
3. Verificar botoes nao invadem navigation bar
4. Verificar modal centralizado
5. Verificar slider visivel e funcional
6. Verificar troca de tema HOT/WARM
7. Verificar foto sem duplicacao

---

## Arquivos Criticos

| Arquivo | Proposito |
|---------|-----------|
| `src/App.tsx` | Shell com safe areas |
| `src/styles/theme.css` | CSS variables --hotcocoa-* |
| `src/styles/hotcocoa.css` | Safe areas e utilidades |
| `src/context/ThemeContext.tsx` | data-theme attribute |
| `src/components/Navigation.tsx` | Header com safe area |
| `src/components/PhotoUploader.tsx` | HomeScreen + Tauri |
| `src/components/MemoryViewer.tsx` | ViewingScreen + state machine |
| `src/components/ConfigModal.tsx` | Modal unificado |
| `src/components/ui/HotCocoaSlider.tsx` | Slider Radix |
| `src/components/ui/ParticleBackground.tsx` | Background animado |
