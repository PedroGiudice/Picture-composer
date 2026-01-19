import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Service for local storage operations
class StorageService {
  static const String _photosKey = 'saved_photos';
  static const String _preferencesKey = 'user_preferences';

  SharedPreferences? _prefs;

  /// Initialize the storage service
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  /// Get the app's document directory
  Future<Directory> get _appDir async {
    final dir = await getApplicationDocumentsDirectory();
    final photosDir = Directory('${dir.path}/hotcocoa_photos');
    if (!await photosDir.exists()) {
      await photosDir.create(recursive: true);
    }
    return photosDir;
  }

  /// Save a photo to local storage
  Future<String> savePhoto(File photo) async {
    final dir = await _appDir;
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final extension = photo.path.split('.').last;
    final newPath = '${dir.path}/photo_$timestamp.$extension';

    await photo.copy(newPath);

    // Update saved photos list
    final photos = getSavedPhotoPaths();
    photos.add(newPath);
    await _prefs?.setStringList(_photosKey, photos);

    return newPath;
  }

  /// Get list of saved photo paths
  List<String> getSavedPhotoPaths() {
    return _prefs?.getStringList(_photosKey) ?? [];
  }

  /// Delete a photo from storage
  Future<bool> deletePhoto(String path) async {
    try {
      final file = File(path);
      if (await file.exists()) {
        await file.delete();
      }

      // Update saved photos list
      final photos = getSavedPhotoPaths();
      photos.remove(path);
      await _prefs?.setStringList(_photosKey, photos);

      return true;
    } catch (e) {
      print('Error deleting photo: $e');
      return false;
    }
  }

  /// Clear all saved photos
  Future<void> clearAllPhotos() async {
    final photos = getSavedPhotoPaths();
    for (final path in photos) {
      try {
        final file = File(path);
        if (await file.exists()) {
          await file.delete();
        }
      } catch (e) {
        print('Error deleting $path: $e');
      }
    }
    await _prefs?.remove(_photosKey);
  }

  /// Save user preference
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

  /// Get user preference
  T? getPreference<T>(String key) {
    final fullKey = '$_preferencesKey.$key';
    return _prefs?.get(fullKey) as T?;
  }

  /// Save heat level preference
  Future<void> saveHeatLevel(int level) async {
    await savePreference('heat_level', level);
  }

  /// Get saved heat level
  int getHeatLevel() {
    return getPreference<int>('heat_level') ?? 5;
  }

  /// Save theme mode preference
  Future<void> saveThemeMode(String mode) async {
    await savePreference('theme_mode', mode);
  }

  /// Get saved theme mode
  String getThemeMode() {
    return getPreference<String>('theme_mode') ?? 'hot';
  }
}

/// Global storage service instance
final storageService = StorageService();
