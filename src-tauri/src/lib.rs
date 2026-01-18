use base64::{engine::general_purpose::STANDARD, Engine};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// Get the HotCocoa data directory (~/.hotcocoa or platform equivalent)
fn get_app_dir() -> PathBuf {
    let home = dirs::home_dir().expect("Could not find home directory");
    home.join(".hotcocoa")
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
        .setup(|app| {
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
