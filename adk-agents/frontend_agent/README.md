# Frontend Agent

Agente ADK geral para desenvolvimento frontend React/TypeScript.

## Stack Suportado

- React 19 + TypeScript 5.8+
- Vite ou Next.js
- TanStack Query
- Tailwind CSS ou MUI
- TanStack Router ou React Router

## Quick Start

```bash
# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
python server.py

# Health check
curl http://localhost:8005/health
```

## Endpoints

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/health` | Status do servidor |
| POST | `/invoke` | Executar tarefa frontend |
| POST | `/review` | Revisar codigo |

## Exemplos

### Invocar Tarefa

```bash
curl -X POST http://localhost:8005/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Criar componente Button com variantes",
    "files": ["src/components/Button.tsx"]
  }'
```

### Revisar Codigo

```bash
curl -X POST http://localhost:8005/review \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["src/components/UserList.tsx"],
    "focus": "typescript"
  }'
```

## Principios do Agente

### Performance
- Lazy load componentes pesados
- useMemo para calculos caros
- useCallback para handlers
- React.memo para componentes folha

### Type Safety
- TypeScript strict mode
- Nenhum `any`
- Interfaces para props

### Data Fetching
- TanStack Query (useSuspenseQuery)
- Suspense boundaries
- Error boundaries

### Acessibilidade
- Semantic HTML
- ARIA labels
- Focus states visiveis
- Keyboard navigation

## Estrutura de Feature

```
features/name/
  api/           # Queries e mutations
  components/    # Componentes
  hooks/         # Hooks customizados
  types/         # Tipos
  index.ts       # Public API
```

## Configuracao

```bash
export FRONTEND_AGENT_HOST=0.0.0.0
export FRONTEND_AGENT_PORT=8005
export FRONTEND_AGENT_MODEL=gemini-2.5-flash
export FRONTEND_AGENT_LOG_LEVEL=INFO
```

## Estrutura

```
frontend_agent/
├── __init__.py
├── agent.py            # Agent ADK
├── config.py           # Configuracao
├── main.py             # CLI runner
├── prompts.py          # Instrucoes
├── server.py           # FastAPI server
├── tools.py            # File system tools
├── requirements.txt
└── README.md
```

## CLI Mode

Alem do servidor, o agente pode rodar em modo CLI:

```bash
# Tarefa unica
python main.py "Create a Button component with variants"

# Modo interativo
python main.py --interactive
```
