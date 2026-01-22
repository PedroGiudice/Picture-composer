# CLAUDE.md - Picture-composer

**PORTUGUÊS BRASILEIRO COM ACENTUAÇÃO CORRETA.** Usar "eh" em vez de "é" é inaceitável. Acentos são obrigatórios: é, á, ã, ç, etc.

Instruções operacionais para Claude Code neste repositório.

**Arquitetura:** `GEMINI.md` (North Star)

---

## Regras Críticas

### 1. ZERO Emojis
**PROIBIDO** usar emojis em qualquer output: respostas, código, commits, comentários.
Motivo: Bug no CLI Rust causa crash em char boundaries de emojis (4 bytes).

### 2. Nunca Commitar
- `.venv/`, `__pycache__/`, `*.pdf`, `*.log`, `node_modules/`, `dist/`

### 3. mgrep em vez de grep
```bash
mgrep "pattern"           # em vez de grep -r "pattern"
mgrep "pattern" src/      # busca em diretório específico
```

### 4. Gemini para Context Offloading
**SEMPRE** usar `gemini-assistant` para:
- Arquivos > 500 linhas
- Múltiplos arquivos simultâneos
- Logs extensos, diffs grandes

### 5. Commitar Frequentemente
Commitar após cada mudança lógica para validar cedo e evitar perda de trabalho.

### 6. Nunca Substituir Modelo do Usuário
**NUNCA** substituir modelo indicado pelo usuário - usar EXATAMENTE o especificado.

### 7. Ambiente Padrão: Linux Ubuntu
A menos que o usuário diga o contrário, considere **SEMPRE** que estamos em Linux Ubuntu.
Comandos de instalação devem usar `apt`, paths seguem convenções Linux, etc.

---

## Erros Aprendidos

**INSTRUÇÃO PARA CLAUDE:** Adicione uma entrada aqui quando:
- O usuário corrigir um erro seu
- Você cometer erro grosseiro (syntax error, import errado)
- Um erro acontecer mais de uma vez
- Erro "fatal" (mudança em um layer quebra outro)

Não crie hooks para cada erro - documente aqui primeiro. Esta seção cresce organicamente.

| Data | Erro | Regra |
|------|------|-------|
| 2026-01-18 | (Inicializado) | Ver regras críticas acima |

<!--
Formato para adicionar:
| YYYY-MM-DD | Descrição breve do erro | O que evitar/fazer diferente |
-->

---

## Visão Geral do Projeto

**Couple's Memory Deck** é uma aplicação dual-stack para curadoria de memórias românticas com experiências de intimidade aprimoradas por IA. O frontend é React/TypeScript com Vite, e o backend é Python serverless no Modal.com com modelos Qwen.

**Idioma principal:** Português Brasileiro (UI, prompts, conteúdo gerado)

---

## Quick Start

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

O servidor de desenvolvimento roda em `http://localhost:3000`

---

## Stack Tecnológica

### Frontend
- **Framework:** React 19 + TypeScript 5.8
- **Build:** Vite 6.2
- **Estilo:** Tailwind CSS (via CDN)
- **UI Components:** Radix UI (dialog, dropdown, select, slider, switch)
- **Animações:** Framer Motion
- **Ícones:** Lucide React

### Backend (Modal.com)
- **Runtime:** Python 3.11 serverless
- **GPU:** NVIDIA A100
- **Modelos:**
  - Vision: `Qwen/Qwen2.5-VL-7B-Instruct`
  - Text: `Qwen/Qwen2.5-72B-Instruct-AWQ`
- **Inference:** vLLM

---

## Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Primitivos UI (HeatSlider, NeuralLattice, SomaticLoader)
│   ├── App.tsx          # Shell principal com state management
│   ├── AuthGate.tsx     # Gate de login (hardcoded)
│   ├── MemoryViewer.tsx # Experiência core: SETUP->PROCESSING->REVEAL
│   ├── MosaicCreator.tsx # Gerador de mosaico com progress
│   ├── PhotoUploader.tsx # Upload + Google Drive/Photos
│   ├── ConfigPanel.tsx  # Settings (tema, params AI)
│   └── Navigation.tsx   # Header com dropdown
├── context/
│   └── ThemeContext.tsx # Provider de tema (HOT/WARM) + settings AI
├── services/
│   └── api.ts           # Cliente API para Modal.com
├── utils/
│   ├── googleIntegration.ts # Google Picker + OAuth
│   └── mosaic.ts        # Algoritmo de geração de mosaico
├── types.ts             # Interfaces TypeScript
├── constants.ts         # ROMANTIC_QUESTIONS array
└── index.tsx            # Root mount com error boundary

backend/
└── backend.py           # Backend Modal.com (FastAPI + vLLM)

agents/                  # Specs de agentes MCP/ADK
docs/                    # Documentação operacional
```

---

## Padrões de Código

### TypeScript/React
- **Sem `any`** - Tipagem estrita obrigatória
- **Functional components** com hooks
- **Tailwind-first** - Classes utilitárias, sem CSS custom
- **Async/await** com try/catch e fallbacks
- **Service layer** para chamadas API

### Convenções de Nomenclatura
- Componentes: `PascalCase` (ex: `MemoryViewer.tsx`)
- Utilitários: `camelCase` (ex: `googleIntegration.ts`)
- Tipos/Interfaces: `PascalCase` (ex: `IntimacyResponse`)
- Constantes: `UPPER_SNAKE_CASE` (ex: `ROMANTIC_QUESTIONS`)

### Git
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`
- Branch principal: `main`
- Feature branches: `feat/*`

---

## Arquivos Críticos

| Arquivo | Propósito |
|---------|-----------|
| `src/App.tsx` | State machine principal (UPLOAD->VIEWING->MOSAIC) |
| `src/components/MemoryViewer.tsx` | Lógica core da experiência |
| `src/context/ThemeContext.tsx` | Tema + configurações AI |
| `src/services/api.ts` | Integração com backend |
| `src/utils/mosaic.ts` | Algoritmo de geração de mosaico |
| `backend/backend.py` | Pipeline de inferência |
| `vite.config.ts` | Build config + env shims |
| `index.html` | Entry point + Tailwind CDN |

---

## Sistema de Temas

Dois modos disponíveis via `ThemeContext`:

- **HOT Mode:** Rose-600 primary, orange-600 accent (tom mais explícito)
- **WARM Mode:** Pink-600 primary, amber-500 accent (tom emocional/profundo)

CSS variables injetadas em runtime: `--color-primary`, `--color-bg`, `--color-accent`

---

## Autenticação

**Temporária/Hardcoded:**
- Usuário: `CMR`
- Senha: `Chicago00@`
- Token armazenado em `localStorage` como `io_auth_token`

---

## Endpoints Backend (Modal.com)

```
# Processamento de sessão
POST https://pedrogiudice--picture-composer-backend-a100-process-intimacy-request.modal.run

# Análise de mosaico
POST https://pedrogiudice--picture-composer-backend-a100-process-mosaic-request.modal.run
```

---

## Variáveis de Ambiente

```env
VITE_MODAL_BACKEND_URL=    # URL do endpoint de sessão
VITE_MODAL_MOSAIC_URL=     # URL do endpoint de mosaico
GEMINI_API_KEY=            # (legacy, não usado atualmente)
```

Google credentials são armazenadas em `localStorage` (não seguro para produção).

---

## Dívidas Técnicas Conhecidas

1. **Tailwind via CDN** - Deveria ser build PostCSS
2. **Environment shimming** - `process.env` shimado no vite.config.ts
3. **Credenciais hardcoded** - AuthGate.tsx precisa de auth real
4. **Google creds em localStorage** - Inseguro para produção
5. **Sem testes** - Precisa setup de Jest/Cypress/PyTest
6. **Mock fallbacks** - Backend às vezes retorna mocks

---

## AI Pipeline

O backend usa dois modelos em sequencia:

1. **VisionEngine** (Qwen2.5-VL-7B): Analise objetiva da cena
2. **GameMasterEngine** (Qwen2.5-72B-AWQ): Geracao de desafios de intimidade

O sistema ajusta intensidade pelo "heat level" (1-10) e responde em Portugues Brasileiro.

Ver: `backend/backend.py`

---

## Algoritmo de Mosaico

- Tiles de 30x30px
- Análise de cor média por tile
- Match por distância de cor + penalidade de uso
- Randomização entre top-3 candidatos
- Output máximo: 2000px largura

Ver: `src/utils/mosaic.ts`

---

## Docker

```bash
# Desenvolvimento
docker-compose up

# O container monta volumes e roda npm dev
```

---

## Debugging

Técnica dos 5 Porquês para bugs não-triviais:
1. Sintoma -> 2. Por quê? -> 3. Por quê? -> 4. Por quê? -> 5. **CAUSA RAIZ**

---

## Hooks

Validar após mudanças:
```bash
tail -50 ~/.vibe-log/hooks.log
```
Red flags: `MODULE_NOT_FOUND`, `command not found`

---

## Subagentes Discovery

Subagentes de `.claude/agents/*.md` descobertos no início da sessão.
Novo subagente? Reinicie a sessão.

---

## Team

- **PGR** = Pedro (dono do projeto)

---

## Notas para Desenvolvimento

1. **Sempre ler arquivos antes de editar** - Entenda o contexto existente
2. **Respeitar tipagem** - Sem `any`, interfaces completas
3. **Manter consistência** - Seguir padrões já estabelecidos
4. **Testar localmente** - `npm run dev` antes de commits
5. **Commits atômicos** - Uma mudança lógica por commit
6. **Português na UI** - Inglês apenas em código/comentários técnicos
7. **Commitar frequentemente** - Evita perda de trabalho em crashes
