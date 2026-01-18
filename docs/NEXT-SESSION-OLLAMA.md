# Proxima Sessao: Ollama na VM Oracle

**Objetivo:** Configurar modelo local para personalizacao de preferencias do casal

---

## Status Atual

| Item | Status |
|------|--------|
| Ollama instalado na VM | OK |
| Modelo baixado | PENDENTE |
| Endpoint exposto | PENDENTE |
| Integracao HotCocoa | PENDENTE |

---

## Infraestrutura

```
VM Oracle: opc@64.181.162.38
Arch: ARM64 (Ampere)
RAM: 24GB (19GB livres)
Cores: 4
Ollama API: 127.0.0.1:11434
```

---

## Comandos para Executar

### 1. Baixar modelo (~5GB, ~10min)

```bash
ssh opc@64.181.162.38 "ollama pull qwen2.5:7b"
```

### 2. Testar modelo

```bash
ssh opc@64.181.162.38 "ollama run qwen2.5:7b 'Ola, como voce esta?'"
```

### 3. Verificar servico rodando

```bash
ssh opc@64.181.162.38 "systemctl status ollama"
```

### 4. Expor via Traefik (adicionar ao docker-compose.yml do Legal Workbench)

```yaml
services:
  ollama-proxy:
    image: nginx:alpine
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ollama.rule=PathPrefix(`/ollama`)"
    # ... configurar proxy para localhost:11434
```

### 5. Criar servico TypeScript

```typescript
// src/services/ollama.ts
const OLLAMA_URL = "http://64.181.162.38/ollama";

export async function askLocal(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    body: JSON.stringify({ model: "qwen2.5:7b", prompt })
  });
  return res.json();
}
```

---

## Funcionalidade Principal: Personalizacao

O modelo local vai:

1. **Guardar preferencias** do casal em `~/.hotcocoa/preferences.json`
2. **Ajustar requests** ao Modal baseado no historico
3. **Aprender** quais tipos de desafios o casal prefere/evita

Exemplo de fluxo:

```
Usuario pula desafio "muito fisico"
        |
        v
Modelo local registra: "casal prefere desafios romanticos"
        |
        v
Proxima vez, ajusta prompt pro Modal:
"Gere desafio mais romantico que fisico"
```

---

## Prompt para Iniciar Nova Sessao

```
Continuar setup do Ollama na VM Oracle para HotCocoa.

Contexto:
- Ollama ja instalado em opc@64.181.162.38
- VM: ARM64, 24GB RAM, 4 cores
- Modelo recomendado: qwen2.5:7b

Tarefas:
1. Baixar modelo qwen2.5:7b
2. Expor endpoint via Traefik
3. Criar src/services/ollama.ts
4. Implementar sistema de preferencias do casal

Ver: docs/NEXT-SESSION-OLLAMA.md
```

---

## Arquitetura Final

```
┌─────────────────────┐
│  HOTCOCOA (Tauri)   │
│  Teu PC Ubuntu      │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
    v           v
┌────────┐  ┌────────┐
│ ORACLE │  │ MODAL  │
│ Ollama │  │ A100   │
│ Qwen7B │  │ Qwen72B│
│        │  │        │
│ Gratis │  │ Pago   │
│ Sempre │  │OnDemand│
└────────┘  └────────┘
```
