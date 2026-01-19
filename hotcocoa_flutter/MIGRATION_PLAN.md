# HotCocoa: Plano de Migracao React/Tauri -> Flutter

## Status Atual

### Fase 1: Fundacao - CONCLUIDA
- [x] Projeto Flutter criado (linux, windows, macos)
- [x] Riverpod configurado (theme, AI settings)
- [x] go_router configurado (rotas, transicoes)
- [x] Theme system HOT/WARM (Deep Dark palette)
- [x] AppShell com Navigation
- [x] Fonte Space Mono

### Widgets Portados
- [x] NeuralLattice (CustomPainter - golden spiral + mouse repulsion)
- [x] HeatSlider (CustomPainter - gradiente + glow)
- [x] SomaticLoader (animacao de respiracao)
- [x] FloatingCard (motion wrapper)

### Services Criados
- [x] ApiService (dio - pronto para Modal.com)
- [x] StorageService (path_provider + shared_preferences)

### Feature Pages
- [x] PhotoUploadPage (file_picker integration)
- [x] MemoryViewerPage (state machine SETUP/PROCESSING/REVEAL)
- [x] MosaicPage (placeholder para Isolate)
- [x] ChatPage (UI pronta para Ollama)

---

## Fases Pendentes

### Fase 2: Fotos (Estimativa: 3 dias)
**PODE SER PARALELIZADA:**
- [ ] Polir StorageService (thumbnails, metadata)
- [ ] Melhorar PhotoUploader (drag & drop, progress)
- [ ] Grid de preview com selecao multipla
- [ ] Preview em tela cheia

**Arquivos a modificar:**
- `lib/features/photo_upload/photo_upload_page.dart`
- `lib/shared/services/storage_service.dart`

### Fase 3: Experiencia Core (Estimativa: 4 dias)
**SEQUENCIAL (depende de API):**
- [ ] Integrar API real do Modal.com
- [ ] Tratar erros de rede com retry
- [ ] Implementar cache de respostas
- [ ] Timeout e fallback graceful

**Arquivos a modificar:**
- `lib/features/memory_viewer/memory_viewer_page.dart`
- `lib/shared/services/api_service.dart`

### Fase 4: Animacoes Canvas (Estimativa: 3 dias)
**PODE SER PARALELIZADA:**
- [ ] Polir NeuralLattice (performance, RepaintBoundary)
- [ ] Adicionar MotionBackground ao shell
- [ ] Melhorar transicoes entre estados
- [ ] Efeitos de hover nos cards

**Arquivos a modificar:**
- `lib/shared/widgets/neural_lattice/neural_lattice_painter.dart`
- `lib/shared/widgets/floating_card/floating_card.dart`
- `lib/app.dart`

### Fase 5: Mosaico (Estimativa: 3 dias)
**PODE SER ISOLADA:**
- [ ] Portar algoritmo mosaic.ts para Dart
- [ ] Implementar com Isolate (compute())
- [ ] Progress reporting via Stream
- [ ] Salvar resultado em alta resolucao

**Arquivos a criar/modificar:**
- `lib/features/mosaic/mosaic_generator.dart` (NOVO)
- `lib/features/mosaic/mosaic_page.dart`

### Fase 6: Chat Ollama (Estimativa: 2 dias)
**PODE SER PARALELIZADA:**
- [ ] Criar OllamaService
- [ ] Streaming de respostas
- [ ] Persistencia de historico
- [ ] Configuracoes de modelo

**Arquivos a criar/modificar:**
- `lib/shared/services/ollama_service.dart` (NOVO)
- `lib/features/chat/chat_page.dart`

### Fase 7: Google Integration (Estimativa: 3 dias)
**SEQUENCIAL (depende de OAuth):**
- [ ] Configurar google_sign_in
- [ ] OAuth flow para desktop
- [ ] Google Photos picker (se disponivel)
- [ ] Fallback para file_picker

**Arquivos a criar/modificar:**
- `lib/shared/services/google_service.dart` (NOVO)
- `lib/features/photo_upload/photo_upload_page.dart`

---

## Dependencias de Paralelizacao

```
Fase 2 (Fotos)     ----+
                       |
Fase 4 (Animacoes) ----+---> Fase 3 (API Core)
                       |
Fase 6 (Chat)      ----+
                       |
Fase 5 (Mosaico)   ----+---> Fase 7 (Google)
```

**Podem rodar em paralelo:**
- Fase 2 + Fase 4 + Fase 5 + Fase 6 (4 agentes)

**Devem ser sequenciais:**
- Fase 3 depois de Fase 2 (precisa de fotos funcionando)
- Fase 7 depois de Fase 3 (precisa de API funcionando)

---

## Arquivos de Referencia (React -> Flutter)

| React | Flutter | Complexidade | Status |
|-------|---------|--------------|--------|
| `NeuralLattice.tsx` | `neural_lattice_painter.dart` | Alta | DONE |
| `MemoryViewer.tsx` | `memory_viewer_page.dart` | Alta | DONE (UI) |
| `ThemeContext.tsx` | `theme_provider.dart` | Media | DONE |
| `mosaic.ts` | `mosaic_generator.dart` | Alta | PENDENTE |
| `api.ts` | `api_service.dart` | Baixa | DONE |

---

## Verificacao Final

1. **Build**: `flutter build linux/windows/macos`
2. **Testes**: `flutter test`
3. **Funcional**:
   - [ ] App abre com NeuralLattice animando
   - [ ] Upload de fotos funciona
   - [ ] Heat slider responde
   - [ ] API Modal retorna resultado
   - [ ] Tema HOT/WARM alterna
   - [ ] Mosaico gera corretamente
   - [ ] Chat Ollama funciona

---

## Notas Tecnicas

### Toolchain para Build Nativo
O ambiente snap Flutter nao tem `ld.lld`. Para build nativo:
```bash
sudo apt install lld clang cmake ninja-build
```

### file_picker Warnings
Os warnings sobre `file_picker` sao conhecidos e nao afetam funcionalidade.
A equipe do pacote esta ciente: https://github.com/miguelpruivo/flutter_file_picker/issues

### Performance do Canvas
Usar `RepaintBoundary` ao redor de CustomPainters pesados.
Profile com `flutter run --profile` antes de otimizar.
