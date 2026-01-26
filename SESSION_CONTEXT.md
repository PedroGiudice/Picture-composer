# Contexto de Sessao: PICTURE-COMPOSER / HOTCOCOA

## Resumo Executivo

Aplicacao Tauri (desktop multiplataforma) para criacao de "memory decks" romanticos usando IA (Gemini), com fotos compartilhadas por casais.

## Estado Atual

| Componente | Status |
|------------|--------|
| App Tauri | Funcional |
| Frontend React | Funcional |
| Integracao Gemini | Configurada |
| Upload de fotos | COM PROBLEMA |

## Stack Tecnologico

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19 + TypeScript + Vite 6 |
| Desktop | Tauri 2.9.5 |
| UI | MUI 7 + Tailwind CSS 4 + Radix UI |
| Animacoes | Framer Motion |
| IA | Gemini API |
| Backend aux | Python (backend.py, prompts.py) |

## Estrutura do Projeto

```
Picture-composer/
├── src/
│   ├── components/
│   │   ├── desktop/      # DesktopChat, DesktopConfig
│   │   └── ui/           # Componentes reutilizaveis
│   ├── context/          # ThemeContext
│   ├── hooks/            # Hooks customizados
│   ├── services/         # API, Tauri
│   └── App.tsx
├── src-tauri/            # Backend Rust
│   ├── src/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── backend/              # Python scripts
│   ├── backend.py
│   ├── backend_v2.py
│   └── prompts.py
└── package.json
```

## Como Rodar

```bash
cd ~/Picture-composer

# Desenvolvimento
bun run dev

# Build
bun run build

# Testes
bun test
```

## Configuracao Necessaria

Criar `.env` com:
```
VITE_GEMINI_API_KEY=sua_chave
VITE_OLLAMA_URL=opcional
VITE_MODAL_BACKEND_URL=opcional
```

## Issues Conhecidas

| Issue | Severidade | Status |
|-------|------------|--------|
| Popup "localhost: Connection refused" no Linux | CRITICA | Aberta |
| Upload de fotos nao funciona | ALTA | Aberta |
| Persistencia de API keys | ALTA | Pendente |

## Regras do Projeto (CLAUDE.md)

- ZERO emojis em outputs (bug Rust em char boundaries)
- Usar `mgrep` em vez de `grep` neste projeto
- Copiar codigo Figma EXATAMENTE, sem adaptacoes
- Nao commitar: `.venv/`, `__pycache__/`, `*.pdf`, `node_modules/`, `dist/`

## Plugins Tauri Habilitados

- Dialog, FS, Clipboard, Notification
- Shell, Store, Updater, Logger

## Proximos Passos

1. Resolver conexao localhost no Linux
2. Testar upload de fotos com Tauri plugin-fs
3. Implementar secure storage para credenciais
4. Refinamento de UI/UX (desktop layout)
