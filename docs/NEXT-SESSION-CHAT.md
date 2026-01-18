# Proxima Sessao: Chat Universal com Modelos

## Objetivo

Criar interface de chat simples para conversar diretamente com todos os modelos disponiveis, permitindo ajuste de prompts sem filtros.

## Contexto

O HotCocoa usa modelos "uncensored" (Qwen2.5) justamente para gerar conteudo de intimidade sem restricoes. O usuario precisa poder:
- Testar prompts diretamente com o modelo
- Ajustar instrucoes de sistema
- Comparar respostas entre modelos (local vs cloud)

## Modelos Disponiveis

| Modelo | Localizacao | Tipo | Acesso |
|--------|-------------|------|--------|
| qwen2.5:7b | Oracle VM (Ollama) | Text | http://64.181.162.38/api/ollama |
| Qwen2.5-72B-AWQ | Modal.com | Text | Via API paga |
| Qwen2.5-VL-7B | Modal.com | Vision+Text | Via API paga |

## Arquitetura Proposta

```
+------------------------------------------+
|           HotCocoa Chat UI               |
|  +------------------------------------+  |
|  |  Model Selector [dropdown]         |  |
|  |  - qwen2.5:7b (Ollama/Local)       |  |
|  |  - Qwen2.5-72B (Modal/Cloud)       |  |
|  |  - Qwen2.5-VL (Modal/Vision)       |  |
|  +------------------------------------+  |
|  |  System Prompt [textarea]          |  |
|  |  (editavel pelo usuario)           |  |
|  +------------------------------------+  |
|  |  Chat History                      |  |
|  |  [User]: ...                       |  |
|  |  [Model]: ...                      |  |
|  +------------------------------------+  |
|  |  [Input] [Send] [Clear]            |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Funcionalidades Planejadas

### Fase 1: Chat Basico (MVP)
- [ ] Componente ChatPanel.tsx
- [ ] Selector de modelo (Ollama vs Modal)
- [ ] Input de mensagem + historico
- [ ] System prompt editavel
- [ ] Streaming de resposta (opcional)

### Fase 2: Features Avancadas
- [ ] Upload de imagem para modelo VL
- [ ] Salvar/carregar conversas
- [ ] Exportar prompts funcionais
- [ ] Comparar respostas lado-a-lado
- [ ] Presets de system prompts

### Fase 3: Integracao HotCocoa
- [ ] Botao "Usar este prompt" -> aplica no gerador de desafios
- [ ] Historico de prompts que funcionaram bem
- [ ] A/B testing de prompts

## Implementacao Tecnica

### Novo Servico: src/services/chat.ts

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

interface ChatService {
  // Enviar mensagem para modelo selecionado
  sendMessage(
    model: 'ollama' | 'modal-text' | 'modal-vision',
    messages: ChatMessage[],
    systemPrompt?: string
  ): Promise<string>;

  // Streaming (opcional)
  streamMessage(
    model: string,
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void>;
}
```

### Novo Componente: src/components/ChatPanel.tsx

```typescript
interface ChatPanelProps {
  onPromptSelect?: (prompt: string) => void; // Para integracao
}

// Estado local:
// - messages: ChatMessage[]
// - selectedModel: string
// - systemPrompt: string
// - isLoading: boolean
```

### Endpoints Necessarios

**Ollama (ja funciona):**
```bash
POST http://64.181.162.38/api/ollama/api/chat
{
  "model": "qwen2.5:7b",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "stream": false
}
```

**Modal (precisa criar):**
```python
# backend/backend.py - novo endpoint
@app.post("/chat")
async def chat_endpoint(messages: list, system_prompt: str = None):
    # Usar Qwen2.5-72B-AWQ para chat direto
    pass
```

## Consideracoes de Seguranca

- Chat local (Ollama) nao tem custos
- Chat Modal tem custo por token - adicionar warning
- System prompts podem ser salvos localmente (localStorage)
- Nao logar conteudo sensivel

## Estimativa de Esforco

| Tarefa | Tempo Estimado |
|--------|----------------|
| ChatService.ts | 1h |
| ChatPanel.tsx (basico) | 2h |
| Integracao Ollama | 30min |
| Endpoint Modal /chat | 1h |
| UI polish + testes | 2h |
| **Total MVP** | **~6h** |

## Comandos para Iniciar

```bash
# Verificar Ollama funcionando
curl -u 'hotcocoa:Chicago00@' http://64.181.162.38/api/ollama/api/tags

# Testar chat API do Ollama
curl -u 'hotcocoa:Chicago00@' http://64.181.162.38/api/ollama/api/chat \
  -d '{"model":"qwen2.5:7b","messages":[{"role":"user","content":"oi"}]}'
```

## Para Iniciar a Proxima Sessao

```
Implementar Chat Universal no HotCocoa.
Ver: docs/NEXT-SESSION-CHAT.md

Objetivo: Interface para conversar diretamente com modelos uncensored
e ajustar prompts de geracao de desafios.
```

---

**Prioridade:** Media (depois de estabilizar features atuais)
**Dependencias:** Ollama funcionando (OK), Modal backend (OK)
