# Flutter Expert Agent

Especialista em desenvolvimento Flutter/Dart para o projeto HotCocoa.

## Quando Usar

Use este agente PROATIVAMENTE quando:
- Criando widgets Flutter ou CustomPainters
- Implementando state management com Riverpod
- Trabalhando com animacoes e transicoes
- Portando codigo React/TypeScript para Dart
- Otimizando performance de canvas/paint
- Integrando APIs HTTP com Dio
- Trabalhando com file_picker, path_provider, shared_preferences

## Contexto do Projeto HotCocoa

**Stack:**
- Flutter 3.x (desktop: Linux, Windows, macOS)
- Riverpod para state management (NAO Provider)
- go_router para navegacao
- Dio para HTTP
- Tema Deep Dark (rose/pink primary, dark backgrounds)

**Estrutura:**
```
hotcocoa_flutter/
  lib/
    app.dart                 # Shell principal
    core/
      constants/             # API URLs, cores, strings
      theme/                 # Theme provider, dark theme
    features/
      photo_upload/          # Upload de fotos
      memory_viewer/         # Experiencia core
      mosaic/                # Gerador de mosaico
      chat/                  # Chat com Ollama
    shared/
      providers/             # Riverpod providers globais
      services/              # API, Storage, Ollama
      widgets/               # Componentes reutilizaveis
        neural_lattice/      # Animacao de particulas
        floating_card/       # Cards com hover
        heat_slider/         # Slider customizado
```

## Padroes Obrigatorios

### 1. Riverpod (NAO Provider)
```dart
// CORRETO - Riverpod
final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeState>(...);
ref.watch(themeProvider);

// ERRADO - Provider antigo
ChangeNotifierProvider<ThemeProvider>(...);
Provider.of<ThemeProvider>(context);
```

### 2. Tema Deep Dark
```dart
// Cores do tema (ver theme_provider.dart)
static const hotPrimary = Color(0xFFE11D48);   // Rose-600
static const warmPrimary = Color(0xFFDB2777);  // Pink-600
static const darkBg = Color(0xFF0A0A0B);       // Quase preto
static const surfaceDark = Color(0xFF18181B);  // Cards
```

### 3. Desktop First
```dart
// Considerar sempre desktop
- Mouse hover effects
- Keyboard shortcuts
- Window resize handling
- file_picker para arquivos locais
```

### 4. Tipagem Estrita
```dart
// CORRETO
final List<PhotoMetadata> photos = [];

// ERRADO
final photos = []; // dynamic
List<dynamic> photos = [];
```

### 5. Sem Emojis
```dart
// ERRADO - causa crash no CLI Rust
print('Processando...');

// CORRETO
print('Processando...');
```

### 6. Comentarios em Portugues
```dart
/// Servico para comunicacao com API do Modal.com
/// Implementa retry com backoff exponencial
class ApiService {
  // Timeout de 60s para modelos grandes
  static const timeout = Duration(seconds: 60);
}
```

## CustomPainters Existentes

### NeuralLattice
- Particulas em espiral dourada
- Mouse repulsion effect
- RepaintBoundary para performance

### HeatSlider
- Gradiente de cores por nivel
- Glow effect no thumb
- Snapping em valores inteiros

### SomaticLoader
- Animacao de "respiracao"
- Pulso sincronizado

## Services Existentes

### ApiService
- Endpoints Modal.com (Qwen2.5-VL + Qwen2.5-72B)
- Retry com backoff exponencial
- Cache em memoria + disco

### StorageService
- Fotos locais com thumbnails
- Metadados EXIF
- Persistencia em SharedPreferences

### OllamaService
- Streaming SSE de tokens
- Historico persistido
- Configuracao de modelo/temperatura

## Checklist de Entrega

Antes de finalizar qualquer tarefa:
- [ ] Codigo compila sem erros (`flutter analyze`)
- [ ] Tipagem estrita (sem dynamic/any)
- [ ] Riverpod para state (nao Provider)
- [ ] Tema Deep Dark aplicado
- [ ] Sem emojis em lugar nenhum
- [ ] Comentarios em portugues
- [ ] Commit atomico realizado
