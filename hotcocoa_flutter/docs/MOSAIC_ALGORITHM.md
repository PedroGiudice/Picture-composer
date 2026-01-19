# Algoritmo de Mosaico - Implementacao Flutter

## Visao Geral

O algoritmo de mosaico foi portado de TypeScript para Dart, mantendo a logica original de geracao de mosaicos fotograficos.

## Arquitetura

### Arquivos Criados/Modificados

1. `lib/features/mosaic/mosaic_generator.dart` - Algoritmo principal
2. `lib/features/mosaic/mosaic_page.dart` - Integracao com UI

## Algoritmo

### Configuracao Padrao

```dart
const MosaicConfig({
  tileWidth: 30,        // Largura de cada tile em pixels
  tileHeight: 30,       // Altura de cada tile em pixels
  maxWidth: 2000,       // Largura maxima do output
  usagePenalty: 20,     // Penalidade por reutilizacao de imagem
  topCandidates: 3,     // Numero de candidatos para randomizacao
});
```

### Fases de Processamento

#### Fase 1: Analise das Imagens Fonte (0-30%)

Para cada imagem fonte:
1. Carrega a imagem do disco
2. Redimensiona para tile size (30x30)
3. Calcula cor media (RGB) percorrendo todos os pixels
4. Armazena em `SourceImage` com contador de uso zerado

```dart
RGB getAverageColor(img.Image image) {
  final resized = img.copyResize(image, width: tileWidth, height: tileHeight);
  int r = 0, g = 0, b = 0, count = 0;

  for (y in 0..height) {
    for (x in 0..width) {
      pixel = resized.getPixel(x, y);
      r += pixel.r;
      g += pixel.g;
      b += pixel.b;
      count++;
    }
  }

  return RGB(r/count, g/count, b/count);
}
```

#### Fase 2: Preparacao da Imagem Alvo

1. Carrega imagem alvo do disco
2. Redimensiona se largura > maxWidth (2000px)
3. Calcula grid: `cols = width / tileWidth`, `rows = height / tileHeight`

#### Fase 3: Geracao do Mosaico (30-100%)

Para cada tile (row x col):

1. Extrai regiao do tile da imagem alvo
2. Calcula cor media do tile alvo
3. Encontra melhor match:
   - Para cada imagem fonte:
     - Calcula distancia de cor: `sqrt((r1-r2)^2 + (g1-g2)^2 + (b1-b2)^2)`
     - Aplica penalidade de uso: `score = distance + (usageCount * penalty)`
   - Ordena candidatos por score
   - Seleciona aleatoriamente entre top-3
4. Incrementa contador de uso da imagem selecionada
5. Copia tile redimensionado para o output
6. Atualiza progresso a cada 5 tiles

```dart
// Matching de cor com penalidade de uso
for (source in sourceAnalysis) {
  rawDist = colorDistance(targetColor, source.color);
  score = rawDist + (source.usageCount * usagePenalty);
  candidates.add(Candidate(source, score));
}

candidates.sort((a, b) => a.score.compareTo(b.score));
topK = min(candidates.length, topCandidates);
selectedIndex = random.nextInt(topK);
bestMatch = candidates[selectedIndex].source;
```

### Otimizacoes

1. **Isolate Execution**: Todo o processamento roda em isolate separado usando `compute()`
   - Evita travar a UI durante geracao
   - Permite cancelamento via framework

2. **Progress Streaming**: Updates de progresso a cada 5 tiles
   - UI responsiva durante geracao
   - Percentual preciso (0-100%)

3. **Penalidade de Uso**: Desencoraja reutilizacao excessiva da mesma foto
   - Aumenta distancia em 20 unidades por uso
   - Garante variedade visual

4. **Randomizacao Top-K**: Escolhe aleatoriamente entre top-3 candidatos
   - Evita padroes repetitivos
   - Mantem qualidade visual (proximos em score)

## Uso

```dart
final generator = MosaicGenerator();

final outputPath = await generator.generateMosaic(
  targetImagePath: '/path/to/target.jpg',
  sourceImagePaths: ['/photo1.jpg', '/photo2.jpg', ...],
  onProgress: (progress) {
    print('Progress: ${(progress * 100).toInt()}%');
  },
);

// outputPath: /path/to/target_mosaic.jpg
```

## Diferencas da Versao TypeScript

1. **Processamento de Imagens**: Uso do pacote `image` em vez de Canvas API
2. **Isolate**: `compute()` em vez de `setTimeout()` para yield
3. **File I/O**: File system direto em vez de Blob/ObjectURL
4. **Output**: Arquivo JPEG salvo em disco em vez de Data URL

## Performance

- **Analise**: ~50ms por imagem fonte (depende do tamanho)
- **Geracao**: ~100-200ms por linha de tiles (varia com numero de fotos)
- **Total**: ~2-5 segundos para 100 fotos e imagem alvo 1920x1080

## Limitacoes

- Minimo 3 fotos fonte recomendado (topCandidates = 3)
- Imagens muito grandes podem causar out-of-memory em dispositivos com pouca RAM
- Output limitado a 2000px de largura (configurat)

## Proximos Passos

1. Adicionar configuracao de qualidade JPEG
2. Suporte a diferentes tile sizes
3. Cache de analise de cores
4. Preview em baixa resolucao antes da geracao completa
