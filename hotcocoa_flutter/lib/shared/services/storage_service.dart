import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:exif/exif.dart';
import 'package:image/image.dart' as img;

/// Metadados de uma foto
class PhotoMetadata {
  final String path;
  final String? thumbnailPath;
  final DateTime? dateTaken;
  final String? camera;
  final String? location;
  final int? width;
  final int? height;
  final int fileSize;

  PhotoMetadata({
    required this.path,
    this.thumbnailPath,
    this.dateTaken,
    this.camera,
    this.location,
    this.width,
    this.height,
    required this.fileSize,
  });

  Map<String, dynamic> toJson() => {
    'path': path,
    'thumbnailPath': thumbnailPath,
    'dateTaken': dateTaken?.toIso8601String(),
    'camera': camera,
    'location': location,
    'width': width,
    'height': height,
    'fileSize': fileSize,
  };

  factory PhotoMetadata.fromJson(Map<String, dynamic> json) {
    return PhotoMetadata(
      path: json['path'] as String,
      thumbnailPath: json['thumbnailPath'] as String?,
      dateTaken: json['dateTaken'] != null
          ? DateTime.parse(json['dateTaken'] as String)
          : null,
      camera: json['camera'] as String?,
      location: json['location'] as String?,
      width: json['width'] as int?,
      height: json['height'] as int?,
      fileSize: json['fileSize'] as int,
    );
  }
}

/// Service para operacoes de storage local
class StorageService {
  static const String _photosKey = 'saved_photos';
  static const String _metadataKey = 'photos_metadata';
  static const String _preferencesKey = 'user_preferences';
  static const int _thumbnailSize = 300;

  SharedPreferences? _prefs;
  final Map<String, PhotoMetadata> _metadataCache = {};

  /// Inicializar o storage service
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    await _loadMetadataCache();
  }

  /// Carregar cache de metadados
  Future<void> _loadMetadataCache() async {
    final metadataJson = _prefs?.getString(_metadataKey);
    if (metadataJson != null) {
      // TODO: Implementar deserializacao quando necessario
    }
  }

  /// Obter diretorio de fotos da aplicacao
  Future<Directory> get _appDir async {
    final dir = await getApplicationDocumentsDirectory();
    final photosDir = Directory('${dir.path}/hotcocoa_photos');
    if (!await photosDir.exists()) {
      await photosDir.create(recursive: true);
    }
    return photosDir;
  }

  /// Obter diretorio de thumbnails
  Future<Directory> get _thumbnailDir async {
    final dir = await _appDir;
    final thumbDir = Directory('${dir.path}/thumbnails');
    if (!await thumbDir.exists()) {
      await thumbDir.create(recursive: true);
    }
    return thumbDir;
  }

  /// Extrair metadados EXIF de uma foto
  Future<Map<String, dynamic>> _extractExifData(File photo) async {
    try {
      final bytes = await photo.readAsBytes();
      final data = await readExifFromBytes(bytes);

      final metadata = <String, dynamic>{};

      // Data de captura
      final dateTimeOriginal = data['EXIF DateTimeOriginal']?.toString();
      if (dateTimeOriginal != null) {
        try {
          // Formato EXIF: "2024:01:19 15:30:45"
          final parts = dateTimeOriginal.split(' ');
          if (parts.length == 2) {
            final dateParts = parts[0].split(':');
            final timeParts = parts[1].split(':');
            metadata['dateTaken'] = DateTime(
              int.parse(dateParts[0]),
              int.parse(dateParts[1]),
              int.parse(dateParts[2]),
              int.parse(timeParts[0]),
              int.parse(timeParts[1]),
              int.parse(timeParts[2]),
            );
          }
        } catch (e) {
          // Ignorar erro de parsing de data
        }
      }

      // Camera/Modelo
      final make = data['Image Make']?.toString();
      final model = data['Image Model']?.toString();
      if (make != null && model != null) {
        metadata['camera'] = '$make $model';
      } else if (model != null) {
        metadata['camera'] = model;
      }

      // GPS
      final gpsLat = data['GPS GPSLatitude'];
      final gpsLon = data['GPS GPSLongitude'];
      if (gpsLat != null && gpsLon != null) {
        metadata['location'] = 'GPS: $gpsLat, $gpsLon';
      }

      // Dimensoes
      final width = data['EXIF ExifImageWidth'];
      final height = data['EXIF ExifImageLength'];
      if (width != null) metadata['width'] = int.tryParse(width.toString());
      if (height != null) metadata['height'] = int.tryParse(height.toString());

      return metadata;
    } catch (e) {
      // EXIF nao disponivel ou erro ao ler
      return {};
    }
  }

  /// Obter dimensoes da imagem se EXIF nao forneceu
  Future<Map<String, int>> _getImageDimensions(File photo) async {
    try {
      final bytes = await photo.readAsBytes();
      final image = img.decodeImage(bytes);
      if (image != null) {
        return {'width': image.width, 'height': image.height};
      }
    } catch (e) {
      // Erro ao decodificar imagem
    }
    return {};
  }

  /// Gerar thumbnail de uma foto
  Future<String?> _generateThumbnail(File photo, String photoPath) async {
    try {
      final thumbDir = await _thumbnailDir;
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final extension = photoPath.split('.').last;
      final thumbPath = '${thumbDir.path}/thumb_$timestamp.$extension';

      // Comprimir e redimensionar
      final result = await FlutterImageCompress.compressAndGetFile(
        photo.absolute.path,
        thumbPath,
        minWidth: _thumbnailSize,
        minHeight: _thumbnailSize,
        quality: 85,
        format: CompressFormat.jpeg,
      );

      return result?.path;
    } catch (e) {
      print('Erro ao gerar thumbnail: $e');
      return null;
    }
  }

  /// Salvar uma foto no storage local
  Future<PhotoMetadata> savePhoto(File photo) async {
    final dir = await _appDir;
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final extension = photo.path.split('.').last;
    final newPath = '${dir.path}/photo_$timestamp.$extension';

    // Copiar foto
    await photo.copy(newPath);

    // Obter tamanho do arquivo
    final fileSize = await photo.length();

    // Extrair metadados EXIF
    final exifData = await _extractExifData(photo);

    // Obter dimensoes se nao extraidas do EXIF
    int? width = exifData['width'] as int?;
    int? height = exifData['height'] as int?;
    if (width == null || height == null) {
      final dimensions = await _getImageDimensions(photo);
      width = dimensions['width'];
      height = dimensions['height'];
    }

    // Gerar thumbnail
    final thumbnailPath = await _generateThumbnail(photo, newPath);

    // Criar objeto de metadados
    final metadata = PhotoMetadata(
      path: newPath,
      thumbnailPath: thumbnailPath,
      dateTaken: exifData['dateTaken'] as DateTime?,
      camera: exifData['camera'] as String?,
      location: exifData['location'] as String?,
      width: width,
      height: height,
      fileSize: fileSize,
    );

    // Atualizar cache
    _metadataCache[newPath] = metadata;

    // Atualizar lista de fotos salvas
    final photos = getSavedPhotoPaths();
    photos.add(newPath);
    await _prefs?.setStringList(_photosKey, photos);

    return metadata;
  }

  /// Obter lista de caminhos de fotos salvas
  List<String> getSavedPhotoPaths() {
    return _prefs?.getStringList(_photosKey) ?? [];
  }

  /// Obter metadados de uma foto
  PhotoMetadata? getPhotoMetadata(String path) {
    return _metadataCache[path];
  }

  /// Obter todas as fotos com metadados
  List<PhotoMetadata> getAllPhotosWithMetadata() {
    final paths = getSavedPhotoPaths();
    return paths
        .map((path) => _metadataCache[path])
        .where((metadata) => metadata != null)
        .cast<PhotoMetadata>()
        .toList();
  }

  /// Deletar uma foto do storage
  Future<bool> deletePhoto(String path) async {
    try {
      final file = File(path);
      if (await file.exists()) {
        await file.delete();
      }

      // Deletar thumbnail se existir
      final metadata = _metadataCache[path];
      if (metadata?.thumbnailPath != null) {
        final thumbFile = File(metadata!.thumbnailPath!);
        if (await thumbFile.exists()) {
          await thumbFile.delete();
        }
      }

      // Remover do cache
      _metadataCache.remove(path);

      // Atualizar lista de fotos salvas
      final photos = getSavedPhotoPaths();
      photos.remove(path);
      await _prefs?.setStringList(_photosKey, photos);

      return true;
    } catch (e) {
      print('Erro ao deletar foto: $e');
      return false;
    }
  }

  /// Limpar todas as fotos salvas
  Future<void> clearAllPhotos() async {
    final photos = getSavedPhotoPaths();
    for (final path in photos) {
      try {
        final file = File(path);
        if (await file.exists()) {
          await file.delete();
        }

        // Deletar thumbnail
        final metadata = _metadataCache[path];
        if (metadata?.thumbnailPath != null) {
          final thumbFile = File(metadata!.thumbnailPath!);
          if (await thumbFile.exists()) {
            await thumbFile.delete();
          }
        }
      } catch (e) {
        print('Erro ao deletar $path: $e');
      }
    }

    _metadataCache.clear();
    await _prefs?.remove(_photosKey);
  }

  /// Salvar preferencia do usuario
  Future<void> savePreference(String key, dynamic value) async {
    if (value is String) {
      await _prefs?.setString('$_preferencesKey.$key', value);
    } else if (value is int) {
      await _prefs?.setInt('$_preferencesKey.$key', value);
    } else if (value is double) {
      await _prefs?.setDouble('$_preferencesKey.$key', value);
    } else if (value is bool) {
      await _prefs?.setBool('$_preferencesKey.$key', value);
    }
  }

  /// Obter preferencia do usuario
  T? getPreference<T>(String key) {
    final fullKey = '$_preferencesKey.$key';
    return _prefs?.get(fullKey) as T?;
  }

  /// Salvar nivel de heat
  Future<void> saveHeatLevel(int level) async {
    await savePreference('heat_level', level);
  }

  /// Obter nivel de heat salvo
  int getHeatLevel() {
    return getPreference<int>('heat_level') ?? 5;
  }

  /// Salvar modo de tema
  Future<void> saveThemeMode(String mode) async {
    await savePreference('theme_mode', mode);
  }

  /// Obter modo de tema salvo
  String getThemeMode() {
    return getPreference<String>('theme_mode') ?? 'hot';
  }
}

/// Instancia global do storage service
final storageService = StorageService();
