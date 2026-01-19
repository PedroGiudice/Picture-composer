import 'dart:async';
import 'dart:io';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:image/image.dart' as img;

/// RGB color representation
class RGB {
  final int r;
  final int g;
  final int b;

  const RGB(this.r, this.g, this.b);

  @override
  String toString() => 'RGB($r, $g, $b)';
}

/// Source image with color analysis and usage tracking
class SourceImage {
  final RGB color;
  final img.Image image;
  int usageCount;

  SourceImage({
    required this.color,
    required this.image,
    this.usageCount = 0,
  });
}

/// Configuration for mosaic generation
class MosaicConfig {
  /// Width of each mosaic tile in pixels
  final int tileWidth;

  /// Height of each mosaic tile in pixels
  final int tileHeight;

  /// Maximum width of output mosaic in pixels
  final int maxWidth;

  /// Penalty applied per usage to discourage reuse
  final int usagePenalty;

  /// Number of top candidates to randomly choose from
  final int topCandidates;

  const MosaicConfig({
    this.tileWidth = 30,
    this.tileHeight = 30,
    this.maxWidth = 2000,
    this.usagePenalty = 20,
    this.topCandidates = 3,
  });
}


/// Mosaic generator with isolate support for non-blocking operation
class MosaicGenerator {
  final MosaicConfig config;

  MosaicGenerator({this.config = const MosaicConfig()});

  /// Calcula a cor media de uma imagem
  RGB getAverageColor(img.Image image) {
    // Redimensiona para tile size para analise mais rapida
    final resized = img.copyResize(
      image,
      width: config.tileWidth,
      height: config.tileHeight,
    );

    int r = 0, g = 0, b = 0;
    int count = 0;

    for (int y = 0; y < resized.height; y++) {
      for (int x = 0; x < resized.width; x++) {
        final pixel = resized.getPixel(x, y);
        r += pixel.r.toInt();
        g += pixel.g.toInt();
        b += pixel.b.toInt();
        count++;
      }
    }

    return RGB(
      (r / count).floor(),
      (g / count).floor(),
      (b / count).floor(),
    );
  }

  /// Calcula a distancia euclidiana entre duas cores
  double colorDistance(RGB c1, RGB c2) {
    return math.sqrt(
      math.pow(c1.r - c2.r, 2) +
          math.pow(c1.g - c2.g, 2) +
          math.pow(c1.b - c2.b, 2),
    );
  }

  /// Gera mosaico usando compute() para rodar em isolate separado
  Future<String> generateMosaic({
    required String targetImagePath,
    required List<String> sourceImagePaths,
    required Function(double) onProgress,
  }) async {
    // Cria stream controller para receber progress updates do isolate
    final progressController = StreamController<double>();
    final completer = Completer<String>();

    // Subscribe to progress updates
    progressController.stream.listen(onProgress);

    try {
      // Roda em isolate usando compute
      final result = await compute(
        _generateMosaicIsolate,
        _IsolateParams(
          targetImagePath: targetImagePath,
          sourceImagePaths: sourceImagePaths,
          config: config,
        ),
      );

      completer.complete(result);
    } catch (e) {
      completer.completeError(e);
    } finally {
      await progressController.close();
    }

    return completer.future;
  }

  /// Funcao executada no isolate para geracao do mosaico
  static Future<String> _generateMosaicIsolate(_IsolateParams params) async {
    final generator = MosaicGenerator(config: params.config);

    // Fase 1: Analise das imagens fonte (0-30%)
    final sourceAnalysis = <SourceImage>[];

    for (int i = 0; i < params.sourceImagePaths.length; i++) {
      final file = File(params.sourceImagePaths[i]);
      final bytes = await file.readAsBytes();
      final image = img.decodeImage(bytes);

      if (image != null) {
        final color = generator.getAverageColor(image);
        sourceAnalysis.add(SourceImage(
          color: color,
          image: image,
        ));
      }

      // Progress: 0-30%
      if (kDebugMode) {
        print('Analyzing source ${i + 1}/${params.sourceImagePaths.length}');
      }
    }

    // Fase 2: Carrega imagem alvo
    final targetFile = File(params.targetImagePath);
    final targetBytes = await targetFile.readAsBytes();
    final targetImage = img.decodeImage(targetBytes);

    if (targetImage == null) {
      throw Exception('Failed to decode target image');
    }

    // Redimensiona se necessario
    final scale = math.min(1.0, params.config.maxWidth / targetImage.width);
    final scaledWidth = (targetImage.width * scale).floor();
    final scaledHeight = (targetImage.height * scale).floor();

    final scaledTarget = scale < 1.0
        ? img.copyResize(targetImage, width: scaledWidth, height: scaledHeight)
        : targetImage;

    // Cria canvas de output
    final outputImage = img.Image(
      width: scaledTarget.width,
      height: scaledTarget.height,
    );

    // Fase 3: Geracao do mosaico tile por tile (30-100%)
    final cols = (scaledTarget.width / params.config.tileWidth).ceil();
    final rows = (scaledTarget.height / params.config.tileHeight).ceil();
    final totalTiles = rows * cols;
    int processedTiles = 0;

    final random = math.Random();

    for (int row = 0; row < rows; row++) {
      for (int col = 0; col < cols; col++) {
        final x = col * params.config.tileWidth;
        final y = row * params.config.tileHeight;

        // Calcula dimensoes do patch (pode ser menor nas bordas)
        final patchW =
            math.min(params.config.tileWidth, scaledTarget.width - x);
        final patchH =
            math.min(params.config.tileHeight, scaledTarget.height - y);

        if (patchW <= 0 || patchH <= 0) continue;

        // Calcula cor media do tile alvo
        int r = 0, g = 0, b = 0, count = 0;
        for (int py = 0; py < patchH; py++) {
          for (int px = 0; px < patchW; px++) {
            final pixel = scaledTarget.getPixel(x + px, y + py);
            r += pixel.r.toInt();
            g += pixel.g.toInt();
            b += pixel.b.toInt();
            count++;
          }
        }

        final targetColor = RGB(
          (r / count).floor(),
          (g / count).floor(),
          (b / count).floor(),
        );

        // Encontra as melhores correspondencias com penalidade de uso
        final candidates = <_Candidate>[];

        for (final source in sourceAnalysis) {
          final rawDist = generator.colorDistance(targetColor, source.color);
          final score =
              rawDist + (source.usageCount * params.config.usagePenalty);

          candidates.add(_Candidate(source: source, score: score));
        }

        // Ordena por score e escolhe aleatoriamente entre top-K
        candidates.sort((a, b) => a.score.compareTo(b.score));

        final topK = math.min(candidates.length, params.config.topCandidates);
        final selectedIndex = random.nextInt(topK);
        final bestMatch = candidates[selectedIndex].source;

        // Incrementa contador de uso
        bestMatch.usageCount++;

        // Copia o tile redimensionado para o output
        final resizedTile = img.copyResize(
          bestMatch.image,
          width: params.config.tileWidth,
          height: params.config.tileHeight,
        );

        img.compositeImage(
          outputImage,
          resizedTile,
          dstX: x,
          dstY: y,
        );

        processedTiles++;

        // Progress update a cada 5 tiles
        if (processedTiles % 5 == 0) {
          final progress = 30 + ((processedTiles / totalTiles) * 70);
          if (kDebugMode) {
            print('Progress: ${progress.toStringAsFixed(1)}%');
          }
        }
      }
    }

    // Salva imagem final
    final outputPath =
        '${params.targetImagePath.replaceAll(RegExp(r'\.[^.]+$'), '')}_mosaic.jpg';
    final outputFile = File(outputPath);

    final jpegBytes = img.encodeJpg(outputImage, quality: 90);
    await outputFile.writeAsBytes(jpegBytes);

    if (kDebugMode) {
      print('Mosaic saved to: $outputPath');
    }

    return outputPath;
  }
}

/// Parametros para o isolate
class _IsolateParams {
  final String targetImagePath;
  final List<String> sourceImagePaths;
  final MosaicConfig config;

  _IsolateParams({
    required this.targetImagePath,
    required this.sourceImagePaths,
    required this.config,
  });
}

/// Candidato para matching de tile
class _Candidate {
  final SourceImage source;
  final double score;

  _Candidate({required this.source, required this.score});
}
