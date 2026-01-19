# Prompt para Proxima Sessao - HotCocoa Flutter

## Contexto
O projeto Flutter `hotcocoa_flutter/` foi criado na Fase 1 (Fundacao). Estrutura completa com Riverpod, go_router, theme system, e widgets principais portados do React.

---

## INSTRUCAO PRINCIPAL

Continue a migracao do HotCocoa executando as Fases 2-7 conforme o plano em `hotcocoa_flutter/MIGRATION_PLAN.md`.

**IMPORTANTE - DELEGACAO EM PARALELO:**

As seguintes fases SAO INDEPENDENTES e DEVEM ser executadas em PARALELO usando subagentes especializados:

1. **Fase 2 (Fotos)** - frontend-developer agent
2. **Fase 4 (Animacoes)** - frontend-developer agent
3. **Fase 5 (Mosaico)** - backend-developer agent (algoritmo Dart)
4. **Fase 6 (Chat Ollama)** - backend-developer agent

Lance os 4 agentes SIMULTANEAMENTE em uma UNICA mensagem com multiplos Task tool calls.

Exemplo de como lancar:
```
Task 1: frontend-developer -> "Implementar Fase 2 Fotos em hotcocoa_flutter..."
Task 2: frontend-developer -> "Implementar Fase 4 Animacoes em hotcocoa_flutter..."
Task 3: backend-developer -> "Implementar Fase 5 Mosaico em hotcocoa_flutter..."
Task 4: backend-developer -> "Implementar Fase 6 Chat Ollama em hotcocoa_flutter..."
```

**SEQUENCIAIS (executar DEPOIS das paralelas):**
- Fase 3 (API Core) - depende de Fase 2
- Fase 7 (Google) - depende de Fase 3

---

## Detalhes por Fase

### Fase 2: Fotos
**Agente:** frontend-developer
**Arquivos:**
- `lib/features/photo_upload/photo_upload_page.dart`
- `lib/shared/services/storage_service.dart`

**Tarefas:**
- Adicionar drag & drop para upload
- Implementar thumbnails com cache
- Grid de preview com selecao multipla
- Preview em tela cheia com gestos

### Fase 4: Animacoes
**Agente:** frontend-developer
**Arquivos:**
- `lib/shared/widgets/neural_lattice/neural_lattice_painter.dart`
- `lib/shared/widgets/floating_card/floating_card.dart`
- `lib/app.dart`

**Tarefas:**
- Otimizar NeuralLattice com RepaintBoundary
- Adicionar MotionBackground ao app shell
- Melhorar transicoes entre estados do viewer
- Efeitos de hover em cards

### Fase 5: Mosaico
**Agente:** backend-developer
**Arquivos:**
- `lib/features/mosaic/mosaic_generator.dart` (CRIAR)
- `lib/features/mosaic/mosaic_page.dart`

**Tarefas:**
- Portar algoritmo de `src/utils/mosaic.ts` para Dart
- Usar Isolate com compute() para nao bloquear UI
- Progress reporting via Stream
- Salvar resultado em alta resolucao

**Referencia React:**
```typescript
// src/utils/mosaic.ts - algoritmo de tiles 30x30px
// Match por distancia de cor + penalidade de uso
// Randomizacao entre top-3 candidatos
```

### Fase 6: Chat Ollama
**Agente:** backend-developer
**Arquivos:**
- `lib/shared/services/ollama_service.dart` (CRIAR)
- `lib/features/chat/chat_page.dart`

**Tarefas:**
- Criar OllamaService com dio
- Implementar streaming de respostas (SSE)
- Persistir historico de conversas
- UI para configurar modelo/temperatura

---

## Apos Paralelas - Fases Sequenciais

### Fase 3: API Core
**Depende de:** Fase 2 concluida
**Arquivos:**
- `lib/features/memory_viewer/memory_viewer_page.dart`
- `lib/shared/services/api_service.dart`

**Tarefas:**
- Integrar com API real do Modal.com
- Retry com exponential backoff
- Cache de respostas recentes
- Fallback graceful quando offline

### Fase 7: Google Integration
**Depende de:** Fase 3 concluida
**Arquivos:**
- `lib/shared/services/google_service.dart` (CRIAR)
- `lib/features/photo_upload/photo_upload_page.dart`

**Tarefas:**
- Configurar google_sign_in para desktop
- OAuth flow completo
- Tentar Google Photos picker
- Fallback para file_picker local

---

## Verificacao Final

Apos todas as fases, executar:

```bash
cd hotcocoa_flutter
flutter analyze
flutter test
flutter build linux
```

Verificar funcionalmente:
- App abre com NeuralLattice animando
- Upload de fotos funciona (local e Google)
- Heat slider responde
- API Modal retorna resultado
- Tema HOT/WARM alterna
- Mosaico gera corretamente
- Chat Ollama funciona

---

## LEMBRETE CRITICO

**NAO execute as fases uma por uma!**

Lance TODOS os agentes paralelos de UMA VEZ usando multiplos Task tool calls em uma UNICA mensagem. Isso maximiza eficiencia e reduz tempo total de implementacao.

Padrao correto:
```
<function_calls>
<invoke name="Task">...</invoke>  <!-- Fase 2 -->
<invoke name="Task">...</invoke>  <!-- Fase 4 -->
<invoke name="Task">...</invoke>  <!-- Fase 5 -->
<invoke name="Task">...</invoke>  <!-- Fase 6 -->