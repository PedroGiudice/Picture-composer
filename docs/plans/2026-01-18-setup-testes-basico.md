# Plano Rapido: Setup Basico de Testes (Bun)

> **Para Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para implementar.

**Goal:** Configurar Bun Test e criar primeiro teste para validar setup
**Tempo estimado:** 10 minutos
**ROI:** Habilita TDD para todo desenvolvimento futuro

---

## Task 1: Instalar dependencias de teste

**Step 1: Adicionar testing-library**

```bash
bun add -D @testing-library/react @testing-library/jest-dom @happy-dom/global-registrator
```

**Step 2: Verificar bun test**

Run: `bun test --help`
Expected: Ajuda do bun test (ja vem com bun)

---

## Task 2: Criar configuracao Bun

**Files:**
- Create: `bunfig.toml`

**Step 1: Criar configuracao**

```toml
[test]
preload = ["./src/test/setup.ts"]

[test.coverage]
enabled = true
```

---

## Task 3: Criar setup file

**Files:**
- Create: `src/test/setup.ts`

**Step 1: Criar arquivo de setup**

```typescript
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import '@testing-library/jest-dom';

GlobalRegistrator.register();
```

---

## Task 4: Adicionar scripts no package.json

**Files:**
- Modify: `package.json`

**Step 1: Adicionar scripts de teste**

Adicionar em "scripts":
```json
"test": "bun test",
"test:watch": "bun test --watch",
"test:coverage": "bun test --coverage"
```

---

## Task 5: Criar primeiro teste (smoke test)

**Files:**
- Create: `src/components/ui/Button.test.tsx`

**Step 1: Escrever teste basico**

```typescript
import { describe, it, expect } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('is clickable', () => {
    let clicked = false;
    render(<Button onClick={() => clicked = true}>Click</Button>);
    screen.getByText('Click').click();
    expect(clicked).toBe(true);
  });
});
```

**Step 2: Rodar teste**

Run: `bun test`
Expected: 2 tests passed

---

## Task 6: Commit

**Step 1: Commit setup de testes**

```bash
git add bunfig.toml src/test/ src/components/ui/Button.test.tsx package.json
git commit -m "chore(test): setup Bun Test with first smoke test"
```

---

**Fim do Plano**
