# Tauri Knowledge Base for HotCocoa

## Overview
This document contains the source code, configuration, and documentation for the Tauri implementation of HotCocoa. It serves as a comprehensive reference for understanding the dual-stack architecture (React + Rust/Tauri).

---

## 1. Configuration

### src-tauri/tauri.conf.json
```json
{
  "$schema": "../node_modules/@tauri-apps/cli/config.schema.json",
  "productName": "HotCocoa",
  "version": "0.1.0",
  "identifier": "com.hotcocoa.desktop",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:3000",
    "beforeDevCommand": "",
    "beforeBuildCommand": "bun run build"
  },
  "app": {
    "windows": [
      {
        "title": "HotCocoa",
        "width": 1280,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "decorations": true,
        "transparent": false,
        "center": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; img-src 'self' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.modal.run https://pedrogiudice--picture-composer-backend-a100-process-inti-cc48af.modal.run https://pedrogiudice--picture-composer-backend-a100-process-mosa-f668fe.modal.run https://pedrogiudice--picture-composer-backend-a100-chat-with-ga-a943d1.modal.run https://apis.google.com http://64.181.162.38"
    }
  },
  "plugins": {
    "shell": {
      "open": true
    },
    "updater": {
      "pubkey": "RWSZzt+ytewVN2TsXYkaB4F/5ioKvqpf4v+l/4+m/c+oFyQ8vVvjXucS",
      "endpoints": [
        "https://github.com/PedroGiudice/Picture-composer/releases/latest/download/latest.json"
      ],
      "windows": {
        "installMode": "passive"
      }
    }
  },
  "bundle": {
    "active": true,
    "targets": ["appimage", "deb"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "linux": {
      "appimage": {
        "bundleMediaFramework": true
      },
      "deb": {
        "depends": ["libwebkit2gtk-4.1-0", "libgtk-3-0"]
      }
    },
    "category": "Lifestyle",
    "shortDescription": "Couples Memory Deck - AI-enhanced romantic experiences",
    "longDescription": "HotCocoa is a couples memory deck application that uses AI to create intimate experiences from your shared photos.",
    "createUpdaterArtifacts": true
  }
}
```

### src-tauri/Cargo.toml
```toml
[package]
name = "hotcocoa"
version = "0.1.0"
description = "HotCocoa - Couples Memory Deck"
authors = ["PGR"]
license = "MIT"
repository = "https://github.com/PedroGiudice/Picture-composer"
edition = "2021"
rust-version = "1.77.2"

[lib]
name = "app_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2.5.3", features = [] }

[dependencies]
serde_json = "1.0"
serde = { version = "1.0", features = ["derive"] }
log = "0.4"
tauri = { version = "2.9.5", features = [] }
tauri-plugin-log = "2"
tauri-plugin-fs = "2"
tauri-plugin-dialog = "2"
tauri-plugin-store = "2"
tauri-plugin-notification = "2"
tauri-plugin-clipboard-manager = "2"
tauri-plugin-shell = "2"
tauri-plugin-updater = "2"
tauri-plugin-process = "2"
dirs = "5.0"
base64 = "0.22"
tokio = { version = "1", features = ["fs"] }
```

---

## 2. Rust Backend

### src-tauri/src/lib.rs
```rust
use base64::{engine::general_purpose::STANDARD, Engine};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::OnceLock;
use tauri::Manager;

// Global app data dir, set during setup
static APP_DATA_DIR: OnceLock<PathBuf> = OnceLock::new();

/// Get the HotCocoa data directory (platform-appropriate)
fn get_app_dir() -> PathBuf {
    APP_DATA_DIR
        .get()
        .cloned()
        .unwrap_or_else(|| {
            // Fallback for desktop (before setup runs)
            dirs::home_dir()
                .unwrap_or_else(|| PathBuf::from("."))
                .join(".hotcocoa")
        })
}

/// Get the photos directory
fn get_photos_dir() -> PathBuf {
    get_app_dir().join("photos")
}

/// Get the config file path
fn get_config_path() -> PathBuf {
    get_app_dir().join("config.json")
}

/// Ensure directories exist
fn ensure_dirs() -> Result<(), String> {
    let photos_dir = get_photos_dir();
    fs::create_dir_all(&photos_dir).map_err(|e| format!("Failed to create photos dir: {}", e))?;
    Ok(())
}

#[derive(Serialize, Deserialize)]
pub struct PhotoMeta {
    pub name: String,
    pub path: String,
    pub size: u64,
}

#[derive(Serialize, Deserialize)]
pub struct AppConfig {
    pub heat_level: u8,
    pub theme: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            heat_level: 5,
            theme: "HOT".to_string(),
        }
    }
}

/// Save a photo from base64 data
#[tauri::command]
async fn save_photo(name: String, base64_data: String) -> Result<String, String> {
    ensure_dirs()?;

    let photos_dir = get_photos_dir();
    let file_path = photos_dir.join(&name);

    let data = STANDARD
        .decode(&base64_data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    fs::write(&file_path, data).map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(file_path.to_string_lossy().to_string())
}

/// List all saved photos
#[tauri::command]
async fn list_photos() -> Result<Vec<PhotoMeta>, String> {
    ensure_dirs()?;

    let photos_dir = get_photos_dir();
    let mut photos = Vec::new();

    let entries = fs::read_dir(&photos_dir).map_err(|e| format!("Failed to read dir: {}", e))?;

    for entry in entries.flatten() {
        let path = entry.path();
        if let Some(ext) = path.extension() {
            let ext = ext.to_string_lossy().to_lowercase();
            if matches!(ext.as_str(), "jpg" | "jpeg" | "png" | "gif" | "webp") {
                if let Ok(metadata) = entry.metadata() {
                    photos.push(PhotoMeta {
                        name: entry.file_name().to_string_lossy().to_string(),
                        path: path.to_string_lossy().to_string(),
                        size: metadata.len(),
                    });
                }
            }
        }
    }

    Ok(photos)
}

/// Delete a photo by name
#[tauri::command]
async fn delete_photo(name: String) -> Result<(), String> {
    let photos_dir = get_photos_dir();
    let file_path = photos_dir.join(&name);

    fs::remove_file(&file_path).map_err(|e| format!("Failed to delete file: {}", e))?;

    Ok(())
}

/// Get a photo as base64
#[tauri::command]
async fn get_photo_base64(name: String) -> Result<String, String> {
    let photos_dir = get_photos_dir();
    let file_path = photos_dir.join(&name);

    let data = fs::read(&file_path).map_err(|e| format!("Failed to read file: {}", e))?;

    Ok(STANDARD.encode(data))
}

/// Load app configuration
#[tauri::command]
async fn load_config() -> Result<AppConfig, String> {
    let config_path = get_config_path();

    if !config_path.exists() {
        return Ok(AppConfig::default());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config: {}", e))?;

    serde_json::from_str(&content).map_err(|e| format!("Failed to parse config: {}", e))
}

/// Save app configuration
#[tauri::command]
async fn save_config(config: AppConfig) -> Result<(), String> {
    ensure_dirs()?;

    let config_path = get_config_path();
    let content =
        serde_json::to_string_pretty(&config).map_err(|e| format!("Failed to serialize: {}", e))?;

    fs::write(&config_path, content).map_err(|e| format!("Failed to write config: {}", e))?;

    Ok(())
}

/// Get the photos directory path (for asset protocol)
#[tauri::command]
fn get_photos_path() -> String {
    get_photos_dir().to_string_lossy().to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::default().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            // Set the app data directory (works on all platforms including Android)
            if let Ok(app_data) = app.path().app_data_dir() {
                let _ = APP_DATA_DIR.set(app_data);
            }

            // Ensure directories exist on startup
            if let Err(e) = ensure_dirs() {
                log::error!("Failed to create app directories: {}", e);
            }

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_photo,
            list_photos,
            delete_photo,
            get_photo_base64,
            load_config,
            save_config,
            get_photos_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### src-tauri/build.rs
```rust
fn main() {
  tauri_build::build()
}
```

---

## 3. Release & Updates

### Auto-Update Configuration
- Configured in `tauri.conf.json` under `plugins.updater`.
- Endpoint: `https://github.com/PedroGiudice/Picture-composer/releases/latest/download/latest.json`.
- Public Key: `RWSZzt+ytewVN2TsXYkaB4F/5ioKvqpf4v+l/4+m/c+oFyQ8vVvjXucS`.

### Release Script (scripts/release.sh)
- Bumps version in `package.json`, `tauri.conf.json`, `Cargo.toml`.
- Builds signed AppImage/Deb.
- Generates `latest.json`.
- Publishes release to GitHub via `gh` CLI.

### Android Build Configuration
- `src-tauri/gen/android/build.gradle.kts`:
  - `compileSdk = 35`
  - `minSdk = 24`
  - `targetSdk = 35`
  - `versionCode` and `versionName` read from `tauri.properties`.
- `src-tauri/gen/android/app/build.gradle.kts`:
  - Main app module config.
  - Dependencies: `androidx.webkit`, `androidx.appcompat`, `material`.
  - Proguard enabled for release builds.
