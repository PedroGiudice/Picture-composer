---
trigger: keywords
keywords: [cores, paleta, design, tipografia, espacamento, animacao, motion, acessibilidade, wcag, grid, layout]
description: Teoria de design visual - cores, tipografia, espacamento, motion e acessibilidade
---

# Teoria de Design Visual para UI

## Psicologia das Cores

### Cores Quentes (Rose/Wine - HotCocoa Theme)
- **Rose/Pink**: Romance, sensibilidade, sofisticacao, feminilidade
- **Wine/Burgundy**: Elegancia, maturidade, paixao contida, intimidade
- **Orange/Ember**: Energia, entusiasmo, calor, aventura

### Impacto Emocional
- 62-90% da primeira impressao e baseada APENAS em cor
- Cores quentes: energizantes, positivas, mas em excesso podem ser agressivas
- Cores frias: calma, profissionalismo, distanciamento

### Regra 60-30-10
```
60% - Cor dominante (background)
30% - Cor secundaria (surfaces, cards)
10% - Cor de acento (CTAs, highlights)
```

### Paleta Deep Dark Cinematico (HotCocoa)
```css
/* Background */
--bg-void: #0a0506;      /* Fundo principal - quase preto */
--bg-pattern: #0d0709;   /* Pattern geometrico */
--bg-surface: #1f0f12;   /* Cards */
--bg-elevated: #2a1418;  /* Cards hover */

/* Accent */
--color-primary: #e11d48;   /* Rose-600 */
--color-secondary: #881337; /* Wine-800 */
--color-accent: #c2410c;    /* Ember/Orange */

/* Text */
--text-primary: #fecdd3;    /* Rose-200 - alto contraste */
--text-secondary: #fb7185;  /* Rose-400 */
--text-muted: #9f1239;      /* Rose-800 */
```

## Sistema de Grid 8pt

### Por que 8pt?
- Escala perfeitamente em todas as densidades de tela
- Recomendado por Apple e Google
- Facilita comunicacao designer-developer

### Espacamentos
```
4pt  - Micro (icones, texto pequeno)
8pt  - XS (entre elementos inline)
16pt - SM (padding interno)
24pt - MD (gap entre cards)
32pt - LG (secoes)
48pt - XL (margens de tela)
64pt - 2XL (separacao de blocos)
```

### Line Height (Proporcao Aurea ~1.5)
```
Fonte 14px -> Line height 21px (14 * 1.5)
Fonte 16px -> Line height 24px
Fonte 20px -> Line height 30px
```

## Tipografia

### Hierarquia
```
H1: 32-48px (titulos de tela)
H2: 24-32px (secoes)
H3: 18-24px (subtitulos)
Body: 14-16px (texto corrido)
Caption: 12px (labels, hints)
```

### Font Pairing
- **Display + Body**: Monaspice (mono) + Inter (sans) - tech feel
- **Serif + Sans**: Playfair Display + Source Sans - elegante
- **Contrast**: Monospace para dados, Sans para UI

## Motion Design (2026)

### Principios
1. **Guiar, nao distrair** - Motion para fluxo, nao decoracao
2. **Logica do mundo real** - Objetos nao "poppam", entram/saem
3. **Consistencia** - Mesma easing em toda a app
4. **Continuidade espacial** - Usuario sempre sabe onde esta

### Timing
```
Micro-interactions: 100-200ms
Transicoes de estado: 200-300ms
Transicoes de tela: 300-500ms
MAX: 300ms para manter responsividade
```

### Easing Curves
```css
/* Natural (padrao) */
ease-out: cubic-bezier(0, 0, 0.2, 1)

/* Entrada dramatica */
ease-in: cubic-bezier(0.4, 0, 1, 1)

/* Bounce sutil */
spring: cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Reduced Motion
```tsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Respeitar preferencia do usuario
const duration = prefersReducedMotion ? 0 : 300;
```

## Acessibilidade (WCAG)

### Contraste Minimo
```
Texto normal: 4.5:1 (AA) ou 7:1 (AAA)
Texto grande (18px+): 3:1 (AA)
UI Components: 3:1 (bordas, icones)
Focus indicators: 3:1
```

### Verificar Contraste
```tsx
// Usar Coolors MCP para validar
// ou https://webaim.org/resources/contrastchecker/
```

### Target Size (WCAG 2.2)
```
AA: 24x24 CSS pixels minimo
AAA: 44x44 CSS pixels (recomendado touch)
```

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## Material Design Elevation

### Sombras por Nivel
```css
/* Nivel 1 - Hover sutil */
--shadow-1: 0 1px 3px rgba(0,0,0,0.12),
            0 1px 2px rgba(0,0,0,0.24);

/* Nivel 2 - Cards */
--shadow-2: 0 3px 6px rgba(0,0,0,0.15),
            0 2px 4px rgba(0,0,0,0.12);

/* Nivel 3 - Modais, Dropdowns */
--shadow-3: 0 10px 20px rgba(0,0,0,0.15),
            0 3px 6px rgba(0,0,0,0.10);

/* Nivel 4 - Floating elements */
--shadow-4: 0 14px 28px rgba(0,0,0,0.25),
            0 10px 10px rgba(0,0,0,0.22);
```

## Dark Theme Best Practices

### Nao usar preto puro
```css
/* ERRADO */
background: #000000;

/* CERTO - Preto com tom de cor */
background: #0a0506; /* Preto com undertone rose */
```

### Surfaces com Elevacao
Quanto mais elevado, mais claro (ao contrario do light theme)
```css
--surface-0: #0a0506;  /* Base */
--surface-1: #1f0f12;  /* +4% luminosidade */
--surface-2: #2a1418;  /* +8% */
--surface-3: #3d1f24;  /* +12% */
```

### Texto em Dark Theme
- Primario: 87% opacidade (ou cor clara dedicada)
- Secundario: 60% opacidade
- Disabled: 38% opacidade

## MCPs de Design Disponiveis

Para usar teoria de cores e design:
- **Coolors MCP**: Material Design 3, paletas, WCAG compliance
- **Figma MCP**: Design tokens, componentes, layouts
- **Magic UI MCP**: Animacoes prontas, componentes motion

## Checklist de Design

Antes de considerar UI pronta:
- [ ] Contraste WCAG AA em todos os textos?
- [ ] Espacamentos seguem grid 8pt?
- [ ] Hierarquia tipografica clara?
- [ ] Transicoes < 300ms?
- [ ] Reduced motion respeitado?
- [ ] Focus states visiveis?
- [ ] Touch targets >= 24x24px?
- [ ] Cores comunicam a emocao certa?
