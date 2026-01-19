---
name: flutter-development
description: Desenvolvimento Flutter/Dart para HotCocoa. Riverpod, desktop-first, tema Deep Dark, CustomPainters, integracao com Modal.com e Ollama.
---

# Flutter Development - HotCocoa

## Visao Geral

Desenvolvimento de aplicacoes Flutter desktop (Linux, Windows, macOS) para o projeto HotCocoa - app de curadoria de memorias com IA.

## Quando Usar

- Criando/modificando widgets Flutter
- Trabalhando com Riverpod state management
- Implementando CustomPainters e animacoes
- Integrando APIs (Modal.com, Ollama)
- Portando codigo React/TypeScript para Dart
- Otimizando performance de canvas

## Stack do Projeto

```yaml
# pubspec.yaml - dependencias principais
dependencies:
  flutter_riverpod: ^2.4.0   # State management (NAO Provider!)
  go_router: ^12.0.0         # Navegacao declarativa
  dio: ^5.3.0                # HTTP client
  file_picker: ^8.0.0        # Selecao de arquivos
  path_provider: ^2.1.0      # Diretorios do sistema
  shared_preferences: ^2.2.0 # Persistencia simples
  image: ^4.1.0              # Manipulacao de imagens
  photo_view: ^0.15.0        # Viewer com zoom
  desktop_drop: ^0.7.0       # Drag & drop nativo
```

## Estrutura de Pastas

```
hotcocoa_flutter/
  lib/
    app.dart                    # MaterialApp + GoRouter
    main.dart                   # Entry point + ProviderScope
    core/
      constants/
        api_constants.dart      # URLs Modal.com, timeouts
        theme_constants.dart    # Cores, fontes, espacamentos
      theme/
        theme_provider.dart     # ThemeNotifier + ThemeState
        app_theme.dart          # ThemeData HOT/WARM
    features/
      photo_upload/
        photo_upload_page.dart
        widgets/
        providers/
      memory_viewer/
        memory_viewer_page.dart
        widgets/
      mosaic/
        mosaic_page.dart
        mosaic_generator.dart   # Algoritmo com Isolate
      chat/
        chat_page.dart
    shared/
      providers/
        theme_provider.dart
        photos_provider.dart
        ollama_providers.dart
      services/
        api_service.dart        # Modal.com + retry + cache
        storage_service.dart    # Fotos + thumbnails + EXIF
        ollama_service.dart     # Streaming SSE
      widgets/
        app_shell.dart          # Scaffold + Navigation
        neural_lattice/         # Animacao de particulas
        floating_card/          # Cards com hover
        heat_slider/            # Slider customizado
        somatic_loader/         # Loading com pulso
        motion_background/      # Background animado
```

## Riverpod (NAO Provider!)

### Declaracao de Providers

```dart
// CORRETO - Riverpod
import 'package:flutter_riverpod/flutter_riverpod.dart';

// StateNotifierProvider para estado complexo
final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeState>((ref) {
  return ThemeNotifier();
});

// Provider simples para valores computados
final currentThemeProvider = Provider<ThemeData>((ref) {
  final themeState = ref.watch(themeProvider);
  return themeState.mode == ThemeMode.hot ? hotTheme : warmTheme;
});

// FutureProvider para async
final photosProvider = FutureProvider<List<PhotoMetadata>>((ref) async {
  final storage = ref.read(storageServiceProvider);
  return storage.loadPhotos();
});
```

### Uso em Widgets

```dart
// ConsumerWidget para acesso ao ref
class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // watch para reatividade
    final theme = ref.watch(themeProvider);

    return ElevatedButton(
      onPressed: () {
        // read para acoes one-shot
        ref.read(themeProvider.notifier).toggleMode();
      },
      child: Text('Toggle'),
    );
  }
}

// ConsumerStatefulWidget para StatefulWidget
class MyStatefulWidget extends ConsumerStatefulWidget {
  @override
  ConsumerState<MyStatefulWidget> createState() => _MyStatefulWidgetState();
}

class _MyStatefulWidgetState extends ConsumerState<MyStatefulWidget> {
  @override
  Widget build(BuildContext context) {
    final photos = ref.watch(photosProvider);
    return photos.when(
      data: (list) => PhotoGrid(photos: list),
      loading: () => const SomaticLoader(),
      error: (e, st) => ErrorWidget(e),
    );
  }
}
```

## Tema Deep Dark

### Cores Definidas

```dart
// lib/core/theme/theme_constants.dart
class ThemeConstants {
  // HOT Mode - Rose tones
  static const hotPrimary = Color(0xFFE11D48);     // Rose-600
  static const hotAccent = Color(0xFFEA580C);      // Orange-600

  // WARM Mode - Pink tones
  static const warmPrimary = Color(0xFFDB2777);    // Pink-600
  static const warmAccent = Color(0xFFF59E0B);     // Amber-500

  // Backgrounds (compartilhados)
  static const darkBg = Color(0xFF0A0A0B);         // Quase preto
  static const surfaceDark = Color(0xFF18181B);   // Cards/surfaces
  static const surfaceLight = Color(0xFF27272A);  // Elevated surfaces

  // Texto
  static const textPrimary = Color(0xFFFAFAFA);   // Quase branco
  static const textSecondary = Color(0xFFA1A1AA); // Cinza medio
  static const textMuted = Color(0xFF71717A);     // Cinza escuro
}
```

### Aplicando Tema

```dart
// Sempre via Theme.of(context) ou provider
final primary = Theme.of(context).colorScheme.primary;
final surface = Theme.of(context).colorScheme.surface;

// OU via provider para HOT/WARM specific
final themeState = ref.watch(themeProvider);
final primary = themeState.mode == ThemeMode.hot
    ? ThemeConstants.hotPrimary
    : ThemeConstants.warmPrimary;
```

## CustomPainters

### Estrutura Padrao

```dart
class MyPainter extends CustomPainter {
  final Color color;
  final double progress;

  MyPainter({required this.color, required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    // Reutilizar Paint objects quando possivel
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    // Desenhar...
  }

  @override
  bool shouldRepaint(MyPainter oldDelegate) {
    // Comparar apenas propriedades que afetam o desenho
    return oldDelegate.color != color || oldDelegate.progress != progress;
  }
}
```

### Performance

```dart
// SEMPRE envolver em RepaintBoundary
RepaintBoundary(
  child: CustomPaint(
    painter: NeuralLatticePainter(...),
    size: Size.infinite,
  ),
)

// Para animacoes, usar AnimatedBuilder
AnimatedBuilder(
  animation: _controller,
  builder: (context, child) {
    return CustomPaint(
      painter: MyPainter(progress: _controller.value),
    );
  },
)
```

## API Service Pattern

```dart
class ApiService {
  final Dio _dio;
  final Map<String, IntimacyResponse> _cache = {};

  static const _maxRetries = 3;
  static const _timeout = Duration(seconds: 60);

  Future<IntimacyResponse> processImage({
    required File image,
    required int heatLevel,
    required String question,
  }) async {
    // 1. Gerar cache key
    final cacheKey = _generateCacheKey(image, heatLevel, question);

    // 2. Verificar cache
    if (_cache.containsKey(cacheKey)) {
      return _cache[cacheKey]!;
    }

    // 3. Retry com backoff
    for (var attempt = 0; attempt < _maxRetries; attempt++) {
      try {
        final response = await _dio.post(
          ApiConstants.intimacyEndpoint,
          data: {
            'image': base64Encode(await image.readAsBytes()),
            'heat_level': heatLevel,
            'question': question,
          },
          options: Options(receiveTimeout: _timeout),
        );

        final result = IntimacyResponse.fromJson(response.data);
        _cache[cacheKey] = result;
        return result;

      } on DioException catch (e) {
        if (attempt == _maxRetries - 1) rethrow;
        await Future.delayed(Duration(seconds: pow(2, attempt).toInt()));
      }
    }

    throw Exception('Falha apos $_maxRetries tentativas');
  }
}
```

## Isolate para Processamento Pesado

```dart
// Para algoritmos pesados (ex: mosaico), usar compute()
import 'package:flutter/foundation.dart';

Future<Uint8List> generateMosaic(MosaicParams params) async {
  return compute(_generateMosaicIsolate, params);
}

// Funcao top-level (obrigatorio para Isolate)
Uint8List _generateMosaicIsolate(MosaicParams params) {
  // Processamento pesado aqui...
  // NAO pode acessar UI ou providers
  return result;
}
```

## Streaming com Ollama

```dart
Stream<String> streamCompletion(String prompt) async* {
  final response = await _dio.post(
    'http://localhost:11434/api/generate',
    data: {'model': 'llama2', 'prompt': prompt, 'stream': true},
    options: Options(responseType: ResponseType.stream),
  );

  await for (final chunk in response.data.stream) {
    final lines = utf8.decode(chunk).split('\n');
    for (final line in lines) {
      if (line.isEmpty) continue;
      final json = jsonDecode(line);
      if (json['response'] != null) {
        yield json['response'];
      }
    }
  }
}
```

## Regras Obrigatorias

### FAZER

- Usar Riverpod (flutter_riverpod)
- Tipar TUDO explicitamente
- Usar const constructors
- Envolver painters em RepaintBoundary
- Comentarios em portugues brasileiro
- Package imports (nao relativos)
- Dispose de controllers/subscriptions

### NAO FAZER

- Usar Provider (ChangeNotifier)
- Usar dynamic ou var sem tipo
- Emojis em QUALQUER lugar
- Cores hardcoded fora do theme
- Alocacoes no metodo paint()
- Relative imports entre features

## Checklist de Entrega

Antes de finalizar:
- [ ] `flutter analyze` sem erros
- [ ] `dart format lib/` aplicado
- [ ] Tipagem estrita (zero dynamic)
- [ ] Riverpod (zero ChangeNotifier)
- [ ] Tema aplicado corretamente
- [ ] Zero emojis
- [ ] Commit atomico
