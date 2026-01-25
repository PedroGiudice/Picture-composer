# CLAUDE.md - Picture-composer

**PORTUGUÊS BRASILEIRO COM ACENTUAÇÃO CORRETA.** Acentos obrigatórios: é, á, ã, ç, etc.

---

## Regras Críticas

### 1. ZERO Emojis
**PROIBIDO** emojis em qualquer output. Bug no CLI Rust causa crash em char boundaries.

### 2. Nunca Commitar
`.venv/`, `__pycache__/`, `*.pdf`, `*.log`, `node_modules/`, `dist/`

### 3. mgrep em vez de grep
```bash
mgrep "pattern"           # em vez de grep -r "pattern"
```

### 4. Gemini para Context Offloading
Usar `gemini-assistant` para arquivos > 500 linhas, múltiplos arquivos, logs extensos.

### 5. Commitar Frequentemente
Após cada mudança lógica para validar cedo.

### 6. Ambiente Padrão: Linux Ubuntu
Comandos usam `apt`, paths seguem convenções Linux.

---

## Erros Aprendidos

| Data | Erro | Regra |
|------|------|-------|
| 2026-01-22 | Sugeriu buildar APK no PC quando já existia na VM | Artefatos buildados na VM devem ser copiados via Tailscale |
| 2026-01-22 | Tentou "adaptar" código do Figma | **COPIAR EXATAMENTE** - não adaptar, não melhorar |
| 2026-01-22 | Substituiu MUI Icons por Lucide | **NUNCA** substituir bibliotecas sem autorização |
| 2026-01-22 | Usou IP errado da VM | Verificar IP com `curl ifconfig.me` antes de scp/ssh |

---

## Backlog / TODO

| Prioridade | Issue | Descrição |
|------------|-------|-----------|
| **Crítica** | localhost: Connection refused | Popup no Linux. Scripts Google desabilitados para teste. Ver `index.html` |
| Alta | Upload de fotos não funciona | Linux confirmado. Verificar PhotoUploader.tsx |
| Alta | Persistência de API keys | Usar Tauri secure storage |

---

## Figma

**COPIE O CÓDIGO EXATAMENTE.** Não adapte, não melhore, não substitua bibliotecas.

1. Copiar componentes TSX - ajustar só paths (`@/app/...` -> `@/...`)
2. Copiar arquivos CSS - TODOS
3. Instalar dependências exatas (MUI Icons = MUI Icons)
4. Se Figma indisponível: AVISAR o usuário, não reconstruir

---

## Quick Start

```bash
npm install && npm run dev     # Dev em http://localhost:3000
npm run build                   # Build produção
```

---

## Stack

**Frontend:** React 19, TypeScript 5.8, Vite 6.2, Tailwind CSS, Radix UI, Framer Motion, Lucide React

**Backend (Modal.com):** Python 3.11, NVIDIA A100, Qwen2.5-VL-7B + Qwen2.5-72B-AWQ, vLLM

**Desktop:** Tauri 2.x, Rust, WebKitGTK (Linux)

---

## Estrutura

```
src/
├── components/          # React components
├── context/             # ThemeContext (HOT/WARM modes)
├── services/            # api.ts, ollama.ts, gameMasterChat.ts
├── utils/               # googleIntegration.ts, mosaic.ts
└── index.tsx

src-tauri/
├── src/lib.rs           # Tauri commands
└── tauri.conf.json      # Config + CSP + plugins

backend/
└── backend.py           # Modal.com FastAPI + vLLM
```

---

## CI/CD via Tailscale

VM Oracle builda, Tailscale transfere para máquina local.

| Item | Valor |
|------|-------|
| Target | `cmr-auto@100.102.249.9` |
| Destino | `/home/cmr-auto/Desktop/hotcocoa` |

```bash
# Deploy release
./deploy-local.sh

# Deploy debug (para testes)
npm run build && cargo build
scp src-tauri/target/debug/hotcocoa cmr-auto@100.102.249.9:/home/cmr-auto/Desktop/hotcocoa-debug
```

**Regra:** SEMPRE usar Tailscale para deploy. A VM tem ambiente configurado.

---

## Padrões de Código

- **TypeScript:** Sem `any`, tipagem estrita
- **React:** Functional components, hooks, Tailwind-first
- **Git:** Conventional commits (`feat:`, `fix:`, `chore:`), branch `main`, features em `feat/*`
- **Nomenclatura:** Componentes `PascalCase`, utils `camelCase`, constantes `UPPER_SNAKE_CASE`

---

## Autenticação (Temporária)

```
Usuário: CMR
Senha: Chicago00@
Token: localStorage["io_auth_token"]
```

---

## Endpoints Backend

```
POST https://pedrogiudice--picture-composer-backend-a100-process-inti-cc48af.modal.run  # Sessão
POST https://pedrogiudice--picture-composer-backend-a100-process-mosa-f668fe.modal.run  # Mosaico
POST https://pedrogiudice--picture-composer-backend-a100-chat-with-ga-a943d1.modal.run  # Chat
```

---

## Variáveis de Ambiente

```env
VITE_OLLAMA_URL=http://64.181.162.38/api/ollama
VITE_OLLAMA_USER=
VITE_OLLAMA_PASS=
VITE_MODAL_BACKEND_URL=
VITE_MODAL_MOSAIC_URL=
```

---

## Dívidas Técnicas

1. Tailwind via CDN (deveria ser PostCSS)
2. Credenciais hardcoded em AuthGate.tsx
3. Google creds em localStorage (inseguro)
4. Sem testes automatizados

---

## ADK Agents (Gemini)

```bash
./adk-agents/start-all.sh start    # Inicia
./adk-agents/start-all.sh stop     # Para
./adk-agents/start-all.sh frontend "tarefa"  # Envia tarefa
```

| Porta | Agente | Uso |
|-------|--------|-----|
| 8002 | gemini-cli | Context offloading |
| 8003 | tauri-frontend | Frontend Tauri/React |
| 8004 | tauri-backend | Backend Rust |
| 8005 | frontend | Frontend geral |

---

## Debugging

Técnica dos 5 Porquês: Sintoma -> Por quê? -> Por quê? -> Por quê? -> **CAUSA RAIZ**

Validar hooks: `tail -50 ~/.vibe-log/hooks.log`

---

## Team

**PGR** = Pedro (dono do projeto)

---

## Notas

1. Sempre ler arquivos antes de editar
2. Respeitar tipagem - sem `any`
3. Testar: `npm run dev` antes de commits
4. Português na UI, inglês em código
5. Commitar frequentemente
