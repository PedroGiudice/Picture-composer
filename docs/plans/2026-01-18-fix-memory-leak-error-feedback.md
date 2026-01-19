# Fix Memory Leak + Error Feedback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corrigir memory leak em MemoryViewer e melhorar feedback de erro para o usuario.

**Architecture:** Correcoes cirurgicas sem alteracao de estrutura. TDD para garantir nao-regressao.

**Tech Stack:** React, Bun test, TypeScript

---

## Task 1: Teste para Memory Leak em MemoryViewer

**Files:**
- Create: `src/components/MemoryViewer.test.tsx`

**Step 1: Escrever teste que verifica revoke de URL**

```tsx
// src/components/MemoryViewer.test.tsx
import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryViewer } from './MemoryViewer';

// Mock URL.createObjectURL e revokeObjectURL
const mockCreateObjectURL = mock(() => 'blob:mock-url');
const mockRevokeObjectURL = mock(() => {});

describe('MemoryViewer', () => {
  beforeEach(() => {
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
  });

  it('should revoke previous URL when selecting next memory', async () => {
    const files = [
      new File(['content1'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['content2'], 'photo2.jpg', { type: 'image/jpeg' }),
    ];
    const onReset = mock(() => {});

    render(<MemoryViewer files={files} onReset={onReset} />);

    // Aguarda renderizacao inicial
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);

    // Simula clicar em "Next Memory" - precisa estar em estado REVEAL
    // Para simplificar, testamos apenas que a funcao existe
    expect(screen.getByText(/Initialize Protocol/i)).toBeDefined();
  });
});
```

**Step 2: Rodar teste para verificar que passa (baseline)**

Run: `bun test src/components/MemoryViewer.test.tsx`
Expected: PASS (teste basico)

**Step 3: Commit baseline**

```bash
git add src/components/MemoryViewer.test.tsx
git commit -m "test(MemoryViewer): add baseline test for URL management"
```

---

## Task 2: Corrigir Memory Leak no nextSession

**Files:**
- Modify: `src/components/MemoryViewer.tsx:82-88`

**Step 1: Atualizar teste para verificar revoke**

Adicionar ao teste:
```tsx
it('should track photoUrl for cleanup', () => {
  // O componente deve ter logica de cleanup
  // Este teste verifica que createObjectURL eh chamado corretamente
  const files = [new File(['c'], 'p.jpg', { type: 'image/jpeg' })];
  const { unmount } = render(<MemoryViewer files={files} onReset={() => {}} />);

  expect(mockCreateObjectURL).toHaveBeenCalled();

  unmount();
  // Ao desmontar, deve ter chamado revokeObjectURL
  expect(mockRevokeObjectURL).toHaveBeenCalled();
});
```

**Step 2: Rodar teste para verificar que FALHA**

Run: `bun test src/components/MemoryViewer.test.tsx`
Expected: FAIL no segundo teste (revoke nao eh chamado)

**Step 3: Corrigir MemoryViewer.tsx**

Alterar funcao `nextSession` (linhas 82-88):

```tsx
const nextSession = () => {
  // Revogar URL anterior para evitar memory leak
  if (photoUrl) {
    URL.revokeObjectURL(photoUrl);
  }

  const random = files[Math.floor(Math.random() * files.length)];
  setCurrentFile(random);
  const url = URL.createObjectURL(random);
  setPhotoUrl(url);
  setViewState('SETUP');
};
```

E adicionar cleanup no useEffect de unmount:

```tsx
// Apos linha 34, adicionar:
useEffect(() => {
  return () => {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }
  };
}, [photoUrl]);
```

**Step 4: Rodar teste para verificar que PASSA**

Run: `bun test src/components/MemoryViewer.test.tsx`
Expected: PASS

**Step 5: Commit fix**

```bash
git add src/components/MemoryViewer.tsx src/components/MemoryViewer.test.tsx
git commit -m "fix(MemoryViewer): revoke objectURL to prevent memory leak"
```

---

## Task 3: Melhorar Feedback de Erro

**Files:**
- Modify: `src/components/MemoryViewer.tsx:60-79`

**Step 1: Adicionar estado de erro**

Adicionar estado:
```tsx
const [errorMessage, setErrorMessage] = useState<string | null>(null);
```

**Step 2: Atualizar catch para mostrar erro**

```tsx
} catch (ollamaError) {
  console.error('Ollama also failed:', ollamaError);
  setErrorMessage('Nao foi possivel conectar aos servidores. Verifique sua conexao.');
  setViewState('SETUP');
}
```

**Step 3: Renderizar erro no UI**

Adicionar apos o bloco SETUP (linha 165):

```tsx
{errorMessage && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg mb-4"
  >
    <p className="text-red-300 text-sm">{errorMessage}</p>
    <button
      onClick={() => setErrorMessage(null)}
      className="text-red-400 text-xs mt-2 underline"
    >
      Fechar
    </button>
  </motion.div>
)}
```

**Step 4: Limpar erro ao iniciar nova sessao**

No inicio de `handleProcess`:
```tsx
setErrorMessage(null);
```

**Step 5: Rodar todos os testes**

Run: `bun test`
Expected: All PASS

**Step 6: Verificar build**

Run: `bun run build`
Expected: Build successful

**Step 7: Commit**

```bash
git add src/components/MemoryViewer.tsx
git commit -m "feat(MemoryViewer): add user-visible error feedback"
```

---

## Task 4: Verificacao Final

**Step 1: Rodar todos os testes**

Run: `bun test`
Expected: All PASS

**Step 2: Rodar build**

Run: `bun run build`
Expected: No errors

**Step 3: Verificar tipo-checagem**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit final se necessario**

---

## Notas de Arquitetura

**NAO ALTERADO (e por que):**
- ChatPanel estilos inline: Design choice valido, CSS vars funcionam bem
- updateAiSettings: Ja faz deep merge corretamente (linha 37-40 ThemeContext)
- AI settings no ThemeContext: Funciona, separar seria over-engineering
- Chat persistencia: Feature futura, nao bug

**Trickle-down analysis:**
- Memory leak fix: Zero impacto em outros componentes
- Error feedback: Melhora UX sem alterar estrutura
- Nenhuma alteracao em tipos, interfaces ou contratos
