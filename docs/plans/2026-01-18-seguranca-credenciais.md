# Plano Rapido: Remover Credenciais Hardcoded

> **Para Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para implementar.

**Goal:** Mover credenciais hardcoded para variaveis de ambiente
**Tempo estimado:** 10 minutos
**ROI:** Elimina vulnerabilidade critica de seguranca

---

## Task 1: Criar arquivo .env.example

**Files:**
- Create: `.env.example`

**Step 1: Criar template de variaveis**

```bash
# .env.example - Template de configuracao
VITE_OLLAMA_USER=
VITE_OLLAMA_PASS=
VITE_AUTH_USER=
VITE_AUTH_PASS=
```

**Step 2: Verificar .gitignore**

Run: `grep -q "^\.env$" .gitignore && echo "OK" || echo ".env >> .gitignore"`

---

## Task 2: Corrigir AuthGate.tsx

**Files:**
- Modify: `src/components/AuthGate.tsx:6`

**Step 1: Remover credencial hardcoded**

De:
```typescript
const VALID_CREDENTIALS = {
  user: 'CMR',
  pass: 'Chicago00@'
};
```

Para:
```typescript
const VALID_CREDENTIALS = {
  user: import.meta.env.VITE_AUTH_USER || 'CMR',
  pass: import.meta.env.VITE_AUTH_PASS || ''
};
```

**Step 2: Verificar build**

Run: `npm run build`
Expected: Build success

---

## Task 3: Verificar ollama.ts

**Files:**
- Verify: `src/services/ollama.ts:7`

**Step 1: Confirmar que ja usa env var**

O arquivo ja usa `import.meta.env.VITE_OLLAMA_PASS` - OK!
Apenas remover o fallback hardcoded:

De:
```typescript
const OLLAMA_PASS = import.meta.env.VITE_OLLAMA_PASS || "Chicago00@";
```

Para:
```typescript
const OLLAMA_PASS = import.meta.env.VITE_OLLAMA_PASS || '';
```

---

## Task 4: Criar .env local (nao commitar)

**Step 1: Criar arquivo local**

```bash
cp .env.example .env
# Editar manualmente com valores reais
```

**Step 2: Commit apenas .env.example**

```bash
git add .env.example .gitignore src/components/AuthGate.tsx src/services/ollama.ts
git commit -m "fix(security): remove hardcoded credentials, use env vars"
```

---

**Fim do Plano**
