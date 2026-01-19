# HotCocoa Funcionando ate 20h

> **Para Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para implementar task-by-task.

**Goal:** App HotCocoa funcionando com experiencia completa ate as 20h (deadline: 2h20min)

**Architecture:** Frontend React + Tauri desktop, Backend Modal (pago) com fallback Ollama (local/gratis)

**Tech Stack:** React 19, Tauri 2.0, TypeScript, Modal.com, Ollama (qwen2.5:7b)

---

## Status Atual (17:40)

| Componente | Status | Problema |
|------------|--------|----------|
| Frontend React | OK | Build funciona |
| Tauri | OK | Compila sem erros |
| Backend Modal | ERRO | Internal Server Error |
| Ollama VM | OK | Funcionando |
| OllamaService.ts | OK | Criado esta sessao |

## Estrategia

**Modal com erro = usar Ollama como fallback automatico**

O app vai tentar Modal primeiro, se falhar usa Ollama. Usuario nem percebe.

---

## FASE 1: Fallback Ollama (30 min)

### Task 1.1: Integrar fallback no MemoryViewer

**Dificuldade:** Facil (codigo ja existe)
**Tempo:** 10 min

**Files:**
- Modify: `src/components/MemoryViewer.tsx:35-50`

**Step 1: Importar OllamaService**

```typescript
// Adicionar no topo do arquivo
import { OllamaService } from '../services/ollama';
```

**Step 2: Modificar handleProcess para usar fallback**

```typescript
const handleProcess = async () => {
  if (!photoUrl) return;
  setViewState('PROCESSING');

  try {
    // Tenta Modal primeiro
    const data = await SomaticBackend.processSession(photoUrl, heatLevel);

    // Se retornou erro no campo, usa fallback
    if (data.error) {
      console.warn('Modal falhou, usando Ollama fallback');
      const fallback = await OllamaService.generateFallbackChallenge(heatLevel);
      setResult({
        instruction_title_pt_br: fallback.title,
        instruction_text_pt_br: fallback.instruction,
        clinical_rationale_pt_br: fallback.rationale,
        intensity_metric: heatLevel,
        duration_sec: 120,
        error: 'Usando Ollama local'
      });
    } else {
      setResult(data);
    }
    setViewState('REVEAL');
  } catch (e) {
    console.error('Modal error, trying Ollama:', e);

    // Fallback para Ollama
    try {
      const fallback = await OllamaService.generateFallbackChallenge(heatLevel);
      setResult({
        instruction_title_pt_br: fallback.title,
        instruction_text_pt_br: fallback.instruction,
        clinical_rationale_pt_br: fallback.rationale,
        intensity_metric: heatLevel,
        duration_sec: 120
      });
      setViewState('REVEAL');
    } catch (ollamaError) {
      console.error('Ollama also failed:', ollamaError);
      setViewState('SETUP');
    }
  }
};
```

**Step 3: Testar**

```bash
npm run dev
# Abrir http://localhost:3000
# Upload uma foto, iniciar experiencia
# Deve funcionar com Ollama mesmo que Modal falhe
```

**Step 4: Commit**

```bash
git add src/components/MemoryViewer.tsx
git commit -m "feat: add Ollama fallback when Modal fails"
```

---

### Task 1.2: Adicionar indicador de fonte

**Dificuldade:** Trivial
**Tempo:** 5 min

**Files:**
- Modify: `src/components/MemoryViewer.tsx:160-180`

**Step 1: Mostrar se esta usando Ollama ou Modal**

No bloco REVEAL, adicionar indicador sutil:

```typescript
{/* Adicionar logo apos o Clinical Rationale div */}
{result?.error && (
  <div className="mt-2 text-[9px] text-amber-500/60 uppercase tracking-wider">
    Modo Offline (Ollama)
  </div>
)}
```

**Step 2: Commit**

```bash
git add src/components/MemoryViewer.tsx
git commit -m "feat: show offline mode indicator"
```

---

## FASE 2: Teste Web Completo (15 min)

### Task 2.1: Testar fluxo completo no browser

**Dificuldade:** Verificacao
**Tempo:** 10 min

**Step 1: Iniciar dev server**

```bash
npm run dev
```

**Step 2: Testar fluxo**

1. Abrir http://localhost:3000
2. Fazer upload de 2-3 fotos
3. Clicar "Continue" / iniciar experiencia
4. Ajustar heat level
5. Clicar "Initialize Protocol"
6. Verificar se desafio aparece (Modal ou Ollama)
7. Clicar "Next Memory"
8. Repetir 2-3x

**Step 3: Verificar console**

```bash
# No DevTools do browser, verificar se ha erros criticos
# Warnings de Modal sao OK se Ollama funciona
```

---

## FASE 3: Build e Teste Tauri (40 min)

### Task 3.1: Build Tauri dev

**Dificuldade:** Media (pode ter erros de config)
**Tempo:** 20 min

**Step 1: Build frontend**

```bash
npm run build
```

**Step 2: Run Tauri dev**

```bash
cd src-tauri && cargo tauri dev
```

**Step 3: Se der erro de webview/recursos**

Verificar `tauri.conf.json`:
- `build.devUrl` deve ser `http://localhost:3000`
- `build.frontendDist` deve ser `../dist`

**Step 4: Testar mesmo fluxo do web**

1. Upload fotos
2. Iniciar experiencia
3. Ver desafio gerado
4. Proximo memoria

---

### Task 3.2: Build release (se tempo permitir)

**Dificuldade:** Media
**Tempo:** 15 min

**Step 1: Build release**

```bash
cd src-tauri && cargo tauri build
```

**Step 2: Localizar executavel**

```bash
ls -la target/release/bundle/
# Linux: AppImage ou deb
# Mac: dmg
# Windows: msi ou exe
```

**Step 3: Testar executavel**

```bash
# Executar o app gerado
# Testar mesmo fluxo
```

---

## FASE 4: Commits e Push (10 min)

### Task 4.1: Commit final

```bash
git status
git add -A
git commit -m "feat: HotCocoa v1.0 with Ollama fallback"
```

### Task 4.2: Push (se tiver remote)

```bash
git push origin feat/next-iteration
```

---

## Checkpoint: O que "funcionando" significa

Para considerar o app FUNCIONANDO ate as 20h:

- [ ] Upload de fotos funciona
- [ ] Slider de intensidade funciona
- [ ] Geracao de desafio funciona (Modal OU Ollama)
- [ ] Navegacao entre memorias funciona
- [ ] App roda como executavel desktop (Tauri)

**NAO necessario para MVP:**
- Chat com modelos
- Mosaico
- Preferencias do casal
- Edicao de prompts

---

## Timeline Estimada

| Fase | Inicio | Fim | Duracao |
|------|--------|-----|---------|
| FASE 1: Fallback | 17:40 | 18:10 | 30 min |
| FASE 2: Teste Web | 18:10 | 18:25 | 15 min |
| FASE 3: Tauri | 18:25 | 19:05 | 40 min |
| FASE 4: Commits | 19:05 | 19:15 | 10 min |
| **Buffer** | 19:15 | 20:00 | 45 min |

**Total: 1h35min + 45min buffer = 2h20min disponivel**

---

## Fallback Plan

Se Tauri nao funcionar a tempo:
1. App web funciona 100%
2. Roda com `npm run dev` ou `npm run preview`
3. Usuario pode usar no browser

Se Ollama tambem falhar:
1. SomaticBackend.ts ja tem mockFallback()
2. Retorna desafio generico hardcoded
3. App funciona mesmo offline total
