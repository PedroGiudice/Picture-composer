# Refatoracao Visual: Deep Dark + Motion Design

> **Para Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para implementar.

**Goal:** Transformar a UI do HotCocoa de "prototipo generico" para experiencia cinematica profissional
**Arquiteto:** Frontend Senior + Motion Design Specialist
**Tempo estimado:** 2-3 horas (sessoes)

---

## Auditoria de Assets Existentes

### Loaders/Spinners Disponiveis

1. **SomaticLoader** (`src/components/ui/SomaticLoader.tsx`)
   - 3 aneis animados: breathing (escala), rotating, pulse
   - Usa Framer Motion
   - Tema rose-500/600

2. **NeuralLattice** (`src/components/ui/NeuralLattice.tsx`)
   - Canvas interativo com phyllotaxis (espiral dourada)
   - Mouse repulsion field (interativo!)
   - Particulas com conexoes dinamicas
   - "Breathing" animation sutil
   - **USAR COMO BACKGROUND ANIMADO**

### Sistema de Temas Existente

- `ThemeContext.tsx` com CSS variables
- Modos: HOT (rose) / WARM (pink)
- Cores atuais muito claras para Deep Dark

---

## FASE 1: Qualidade de Codigo (Pre-requisito)

### Task 1.1: Setup ESLint + Prettier

**Files:**
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`
- Modify: `package.json`

**Step 1: Instalar dependencias**

```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks prettier eslint-config-prettier
```

**Step 2: Criar .eslintrc.cjs**

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

**Step 3: Criar .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Step 4: Adicionar scripts**

```json
"lint": "eslint src --ext .ts,.tsx",
"lint:fix": "eslint src --ext .ts,.tsx --fix",
"format": "prettier --write src/**/*.{ts,tsx}"
```

**Step 5: Rodar primeira vez (relatorio)**

```bash
npm run lint 2>&1 | head -100
```

**Step 6: Commit**

```bash
git add .eslintrc.cjs .prettierrc package.json
git commit -m "chore(quality): setup ESLint + Prettier"
```

---

## FASE 2: Deep Dark Color System

### Task 2.1: Atualizar Paleta de Cores

**Files:**
- Modify: `src/context/ThemeContext.tsx`
- Create: `src/styles/theme.css`

**Step 1: Criar arquivo de variaveis CSS**

```css
/* src/styles/theme.css */
:root {
  /* Deep Dark Base - Tons de vinho/brique */
  --bg-void: #0a0506;        /* Quase preto com tom vinho */
  --bg-deep: #150a0c;        /* Vinho profundo */
  --bg-surface: #1f0f12;     /* Surface elevada */
  --bg-elevated: #2a1418;    /* Cards flutuantes */

  /* Accent Colors */
  --accent-rose: #e11d48;
  --accent-wine: #881337;
  --accent-ember: #c2410c;
  --accent-gold: #d97706;

  /* Text */
  --text-primary: #fecdd3;   /* Rose-200 */
  --text-muted: #9f1239;     /* Rose-800 */
  --text-dim: rgba(254, 205, 211, 0.4);

  /* Glow Effects */
  --glow-rose: 0 0 40px rgba(225, 29, 72, 0.3);
  --glow-ember: 0 0 60px rgba(194, 65, 12, 0.2);
}

/* Floating card effect */
.floating-card {
  background: linear-gradient(145deg, var(--bg-elevated), var(--bg-surface));
  border: 1px solid rgba(225, 29, 72, 0.1);
  box-shadow:
    var(--glow-rose),
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-radius: 24px;
}

/* Hover state for floating cards */
.floating-card:hover {
  transform: translateY(-2px);
  box-shadow:
    var(--glow-rose),
    0 30px 60px -15px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
```

**Step 2: Importar no index.tsx**

Adicionar no topo de `src/index.tsx`:
```typescript
import './styles/theme.css';
```

**Step 3: Atualizar ThemeContext**

Modificar `handleSetMode` para usar novas cores:

```typescript
const handleSetMode = (newMode: IntimacyMode) => {
  setMode(newMode);
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
```

**Step 4: Commit**

```bash
git add src/styles/theme.css src/context/ThemeContext.tsx src/index.tsx
git commit -m "feat(ui): implement Deep Dark color system"
```

---

## FASE 3: Motion Background

### Task 3.1: NeuralLattice como Background Global

**Files:**
- Create: `src/components/ui/MotionBackground.tsx`
- Modify: `src/App.tsx`

**Step 1: Criar wrapper de background**

```typescript
// src/components/ui/MotionBackground.tsx
import React from 'react';
import { NeuralLattice } from './NeuralLattice';

interface MotionBackgroundProps {
  children: React.ReactNode;
  intensity?: 'subtle' | 'normal' | 'intense';
}

export const MotionBackground: React.FC<MotionBackgroundProps> = ({
  children,
  intensity = 'subtle'
}) => {
  const opacityMap = {
    subtle: 'opacity-20',
    normal: 'opacity-40',
    intense: 'opacity-60'
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg-void)' }}>
      {/* Animated Background Layer */}
      <div className={`absolute inset-0 ${opacityMap[intensity]} pointer-events-none`}>
        <NeuralLattice text="" className="w-full h-full scale-150" />
      </div>

      {/* Gradient Overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(225, 29, 72, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(194, 65, 12, 0.08) 0%, transparent 40%)
          `
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
```

**Step 2: Aplicar no App.tsx**

Envolver o conteudo principal com `MotionBackground`:

```typescript
import { MotionBackground } from './components/ui/MotionBackground';

// No return do App:
return (
  <ThemeProvider>
    <MotionBackground intensity="subtle">
      {/* resto do conteudo */}
    </MotionBackground>
  </ThemeProvider>
);
```

**Step 3: Verificar performance**

Run: `npm run dev`
Verificar FPS no DevTools (deve manter 60fps)

**Step 4: Commit**

```bash
git add src/components/ui/MotionBackground.tsx src/App.tsx
git commit -m "feat(ui): add NeuralLattice motion background"
```

---

## FASE 4: Floating Elements

### Task 4.1: Criar FloatingCard Component

**Files:**
- Create: `src/components/ui/FloatingCard.tsx`

**Step 1: Criar componente**

```typescript
// src/components/ui/FloatingCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  hover = true,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1] // Custom easing
      }}
      whileHover={hover ? {
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
      className={`floating-card p-6 backdrop-blur-sm ${className}`}
    >
      {children}
    </motion.div>
  );
};
```

**Step 2: Commit**

```bash
git add src/components/ui/FloatingCard.tsx
git commit -m "feat(ui): add FloatingCard component with motion"
```

---

## FASE 5: Refatoracao de Componentes Grandes

### Task 5.1: Extrair ConfigModal do PhotoUploader

**Files:**
- Create: `src/components/ConfigModal.tsx`
- Modify: `src/components/PhotoUploader.tsx`

**Step 1: Identificar codigo do modal**

O `ConfigModal` esta inline no PhotoUploader (aprox. linhas 150-250).
Extrair para arquivo proprio.

**Step 2: Criar ConfigModal.tsx**

```typescript
// src/components/ConfigModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ExternalLink } from 'lucide-react';
import { FloatingCard } from './ui/FloatingCard';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: { clientId: string; apiKey: string };
  onCredentialsChange: (creds: { clientId: string; apiKey: string }) => void;
  onSave: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  credentials,
  onCredentialsChange,
  onSave
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(10, 5, 6, 0.9)' }}
        onClick={onClose}
      >
        <FloatingCard
          className="w-full max-w-md mx-4"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          hover={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              API Configuration
            </h2>
            <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity">
              <X size={20} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Form fields aqui - extrair do PhotoUploader original */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                CLIENT ID
              </label>
              <input
                type="text"
                value={credentials.clientId}
                onChange={(e) => onCredentialsChange({ ...credentials, clientId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg text-sm"
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
                value={credentials.apiKey}
                onChange={(e) => onCredentialsChange({ ...credentials, apiKey: e.target.value })}
                className="w-full px-4 py-3 rounded-lg text-sm"
                style={{
                  background: 'var(--bg-deep)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(225, 29, 72, 0.2)'
                }}
                placeholder="AIzaSy..."
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={onSave}
            className="w-full mt-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-wine))',
              color: 'white'
            }}
          >
            <Check size={18} />
            SAVE CREDENTIALS
          </button>
        </FloatingCard>
      </motion.div>
    </AnimatePresence>
  );
};
```

**Step 3: Atualizar PhotoUploader para usar o novo componente**

Remover o JSX inline do modal e importar `ConfigModal`:

```typescript
import { ConfigModal } from './ConfigModal';

// No render:
<ConfigModal
  isOpen={showConfigModal}
  onClose={() => setShowConfigModal(false)}
  credentials={tempCredentials}
  onCredentialsChange={setTempCredentials}
  onSave={handleSaveCredentials}
/>
```

**Step 4: Verificar que nada quebrou**

Run: `npm run dev`
Testar: Abrir modal de config, salvar, fechar

**Step 5: Commit**

```bash
git add src/components/ConfigModal.tsx src/components/PhotoUploader.tsx
git commit -m "refactor(ui): extract ConfigModal from PhotoUploader"
```

---

## FASE 6: Loading State Enhancement

### Task 6.1: Criar ProcessingOverlay

**Files:**
- Create: `src/components/ui/ProcessingOverlay.tsx`

**Step 1: Criar overlay de processamento imersivo**

```typescript
// src/components/ui/ProcessingOverlay.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { NeuralLattice } from './NeuralLattice';
import { SomaticLoader } from './SomaticLoader';

interface ProcessingOverlayProps {
  isVisible: boolean;
  stage?: 'analyzing' | 'generating' | 'finalizing';
  progress?: number;
}

const stageMessages = {
  analyzing: 'ANALISANDO BIO-DADOS...',
  generating: 'GERANDO CONEXAO...',
  finalizing: 'SINCRONIZANDO...'
};

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  isVisible,
  stage = 'analyzing',
  progress
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Intensified Background */}
      <div className="absolute inset-0 opacity-60">
        <NeuralLattice text="" className="w-full h-full scale-200" />
      </div>

      {/* Central Loader */}
      <div className="relative z-10">
        <SomaticLoader text={stageMessages[stage]} />

        {/* Progress Bar (if available) */}
        {progress !== undefined && (
          <div className="mt-8 w-64 mx-auto">
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-deep)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--accent-rose), var(--accent-ember))'
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-center mt-2 text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
              {progress.toFixed(0)}%
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
```

**Step 2: Commit**

```bash
git add src/components/ui/ProcessingOverlay.tsx
git commit -m "feat(ui): add immersive ProcessingOverlay component"
```

---

## FASE 7: Aplicar Floating Cards na UI Principal

### Task 7.1: Refatorar PhotoUploader Cards

**Files:**
- Modify: `src/components/PhotoUploader.tsx`

**Step 1: Substituir divs por FloatingCard**

Onde houver cards de upload (Upload do Dispositivo / Google Drive), envolver com `FloatingCard`:

```typescript
import { FloatingCard } from './ui/FloatingCard';

// No JSX dos cards de upload:
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
  <FloatingCard delay={0.1} className="cursor-pointer group" onClick={handleLocalUpload}>
    <div className="text-center py-8">
      <Upload className="mx-auto mb-4" size={48} style={{ color: 'var(--accent-rose)' }} />
      <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        Upload do Dispositivo
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        JPG, PNG, WebP (max 10MB)
      </p>
    </div>
  </FloatingCard>

  <FloatingCard delay={0.2} className="cursor-pointer group" onClick={handleGoogleConnect}>
    <div className="text-center py-8">
      <Cloud className="mx-auto mb-4" size={48} style={{ color: 'var(--accent-ember)' }} />
      <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        Google Drive & Photos
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Conectar ao cloud
      </p>
    </div>
  </FloatingCard>
</div>
```

**Step 2: Commit**

```bash
git add src/components/PhotoUploader.tsx
git commit -m "feat(ui): apply FloatingCard to upload options"
```

---

## FASE 8: Interface de Chat com Ollama

### Task 8.1: Criar ChatPanel Component

**Files:**
- Create: `src/components/ChatPanel.tsx`

**Step 1: Criar componente de chat**

```typescript
// src/components/ChatPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Wifi, WifiOff } from 'lucide-react';
import { OllamaService } from '../services/ollama';
import { FloatingCard } from './ui/FloatingCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Ollama status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const online = await OllamaService.isAvailable();
      setIsOnline(online);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await OllamaService.generate(input.trim(), {
        temperature: 0.8,
        maxTokens: 512
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, nao consegui processar sua mensagem. Verifique a conexao com o Ollama.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-0 top-0 h-full w-96 z-40 flex flex-col"
        style={{ background: 'var(--bg-deep)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'rgba(225, 29, 72, 0.2)' }}
        >
          <div className="flex items-center gap-3">
            <Bot size={24} style={{ color: 'var(--accent-rose)' }} />
            <div>
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Assistente Local
              </h3>
              <div className="flex items-center gap-1 text-xs">
                {isOnline ? (
                  <>
                    <Wifi size={12} className="text-green-500" />
                    <span className="text-green-500">Qwen 2.5 7B</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} className="text-red-500" />
                    <span className="text-red-500">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            X
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>
              <Bot size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">
                Converse com o assistente local sobre suas preferencias,
                ideias para experiencias, ou qualquer coisa!
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: msg.role === 'user' ? 'var(--accent-ember)' : 'var(--accent-wine)'
                }}
              >
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`max-w-[75%] p-3 rounded-2xl ${
                  msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                }`}
                style={{
                  background: msg.role === 'user' ? 'var(--accent-rose)' : 'var(--bg-elevated)',
                  color: 'var(--text-primary)'
                }}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--accent-wine)' }}
              >
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div
                className="p-3 rounded-2xl rounded-tl-sm"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(225, 29, 72, 0.2)' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua mensagem..."
              disabled={!isOnline || isLoading}
              className="flex-1 px-4 py-3 rounded-xl text-sm disabled:opacity-50"
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(225, 29, 72, 0.2)'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !isOnline || isLoading}
              className="p-3 rounded-xl transition-all disabled:opacity-30 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-wine))'
              }}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
```

**Step 2: Commit**

```bash
git add src/components/ChatPanel.tsx
git commit -m "feat(ui): add ChatPanel component for Ollama interaction"
```

---

### Task 8.2: Adicionar Botao de Chat na Navigation

**Files:**
- Modify: `src/components/Navigation.tsx`
- Modify: `src/App.tsx`

**Step 1: Adicionar estado e botao no App**

Em `App.tsx`, adicionar:

```typescript
import { ChatPanel } from './components/ChatPanel';

// No estado:
const [isChatOpen, setIsChatOpen] = useState(false);

// No JSX, apos o conteudo principal:
<ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
```

**Step 2: Adicionar botao na Navigation**

Em `Navigation.tsx`, adicionar botao de chat:

```typescript
import { MessageCircle } from 'lucide-react';

// Na props:
interface NavigationProps {
  // ... existing props
  onChatToggle?: () => void;
}

// No JSX, antes do dropdown de settings:
<button
  onClick={onChatToggle}
  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
  title="Chat com Assistente"
>
  <MessageCircle size={20} style={{ color: 'var(--accent-rose)' }} />
</button>
```

**Step 3: Conectar no App**

```typescript
<Navigation
  // ... existing props
  onChatToggle={() => setIsChatOpen(prev => !prev)}
/>
```

**Step 4: Verificar**

Run: `npm run dev`
Testar: Clicar no botao de chat, enviar mensagem, verificar resposta

**Step 5: Commit**

```bash
git add src/components/Navigation.tsx src/App.tsx
git commit -m "feat(ui): integrate ChatPanel into main navigation"
```

---

### Task 8.3: Adicionar metodo generate ao OllamaService (se nao existir)

**Files:**
- Verify: `src/services/ollama.ts`

**Step 1: Verificar se metodo generate existe**

O servico deve ter um metodo publico `generate(prompt, options)` que retorna string.

Se nao existir, adicionar:

```typescript
static async generate(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const request: OllamaGenerateRequest = {
    model: MODEL_NAME,
    prompt,
    stream: false,
    options: {
      temperature: options?.temperature ?? 0.8,
      num_predict: options?.maxTokens ?? 512
    }
  };

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${OLLAMA_USER}:${OLLAMA_PASS}`)}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data: OllamaGenerateResponse = await response.json();
  return data.response;
}
```

**Step 2: Commit se modificado**

```bash
git add src/services/ollama.ts
git commit -m "feat(ollama): add public generate method for chat"
```

---

## FASE 9: Verificacao Final

### Task 8.1: Smoke Test Visual

**Step 1: Build completo**

```bash
npm run build
```

**Step 2: Preview**

```bash
npm run preview
```

**Step 3: Verificar visualmente**

Checklist:
- [ ] Background escuro (tons de vinho, nao preto puro)
- [ ] NeuralLattice visivel como background sutil
- [ ] Cards flutuando com sombras difusas
- [ ] Hover states funcionando
- [ ] Modals com novo estilo
- [ ] Loader durante processamento e imersivo

**Step 4: Commit final**

```bash
git add -A
git commit -m "feat(ui): complete Deep Dark + Motion visual overhaul"
```

---

## Resumo de Arquivos

| Fase | Arquivos Criados/Modificados |
|------|------------------------------|
| 1 | `.eslintrc.cjs`, `.prettierrc`, `package.json` |
| 2 | `src/styles/theme.css`, `src/context/ThemeContext.tsx` |
| 3 | `src/components/ui/MotionBackground.tsx`, `src/App.tsx` |
| 4 | `src/components/ui/FloatingCard.tsx` |
| 5 | `src/components/ConfigModal.tsx`, `src/components/PhotoUploader.tsx` |
| 6 | `src/components/ui/ProcessingOverlay.tsx` |
| 7 | `src/components/PhotoUploader.tsx` (atualizado) |
| 8 | `src/components/ChatPanel.tsx`, `src/components/Navigation.tsx`, `src/services/ollama.ts` |

---

## Notas para Rust (se necessario)

Se houver necessidade de alterar o backend Rust (`src-tauri/`), acionar persona especialista isolada. O frontend deve funcionar independentemente - toda logica visual permanece em React/TypeScript.

---

**Fim do Plano**
