/**
 * Tauri Integration Service
 *
 * Provides filesystem operations for the desktop app.
 * Falls back to no-op when running in browser (Vercel).
 */

import { invoke } from '@tauri-apps/api/core';

// Check if running in Tauri
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

export interface PhotoMeta {
  name: string;
  path: string;
  size: number;
}

export interface AppConfig {
  heat_level: number;
  theme: 'HOT' | 'WARM';
}

/**
 * Save a photo to local storage
 */
export async function savePhotoLocally(name: string, base64Data: string): Promise<string | null> {
  if (!isTauri()) {
    console.log('[tauri.ts] Not in Tauri, skipping savePhotoLocally');
    return null;
  }

  try {
    const path = await invoke<string>('save_photo', { name, base64Data });
    console.log('[tauri.ts] Photo saved:', path);
    return path;
  } catch (error) {
    console.error('[tauri.ts] Failed to save photo:', error);
    throw error;
  }
}

/**
 * List all locally saved photos
 */
export async function listLocalPhotos(): Promise<PhotoMeta[]> {
  if (!isTauri()) {
    console.log('[tauri.ts] Not in Tauri, returning empty photo list');
    return [];
  }

  try {
    const photos = await invoke<PhotoMeta[]>('list_photos');
    console.log('[tauri.ts] Listed photos:', photos.length);
    return photos;
  } catch (error) {
    console.error('[tauri.ts] Failed to list photos:', error);
    throw error;
  }
}

/**
 * Delete a locally saved photo
 */
export async function deleteLocalPhoto(name: string): Promise<void> {
  if (!isTauri()) {
    console.log('[tauri.ts] Not in Tauri, skipping deleteLocalPhoto');
    return;
  }

  try {
    await invoke('delete_photo', { name });
    console.log('[tauri.ts] Photo deleted:', name);
  } catch (error) {
    console.error('[tauri.ts] Failed to delete photo:', error);
    throw error;
  }
}

/**
 * Get a photo as base64
 */
export async function getPhotoAsBase64(name: string): Promise<string | null> {
  if (!isTauri()) {
    console.log('[tauri.ts] Not in Tauri, skipping getPhotoAsBase64');
    return null;
  }

  try {
    const base64 = await invoke<string>('get_photo_base64', { name });
    return base64;
  } catch (error) {
    console.error('[tauri.ts] Failed to get photo:', error);
    throw error;
  }
}

/**
 * Load app configuration
 */
export async function loadAppConfig(): Promise<AppConfig> {
  if (!isTauri()) {
    console.log('[tauri.ts] Not in Tauri, returning default config');
    return { heat_level: 5, theme: 'HOT' };
  }

  try {
    const config = await invoke<AppConfig>('load_config');
    console.log('[tauri.ts] Config loaded:', config);
    return config;
  } catch (error) {
    console.error('[tauri.ts] Failed to load config:', error);
    return { heat_level: 5, theme: 'HOT' };
  }
}

/**
 * Save app configuration
 */
export async function saveAppConfig(config: AppConfig): Promise<void> {
  if (!isTauri()) {
    console.log('[tauri.ts] Not in Tauri, skipping saveAppConfig');
    return;
  }

  try {
    await invoke('save_config', { config });
    console.log('[tauri.ts] Config saved:', config);
  } catch (error) {
    console.error('[tauri.ts] Failed to save config:', error);
    throw error;
  }
}

/**
 * Get the local photos directory path
 */
export async function getPhotosPath(): Promise<string | null> {
  if (!isTauri()) {
    return null;
  }

  try {
    const path = await invoke<string>('get_photos_path');
    return path;
  } catch (error) {
    console.error('[tauri.ts] Failed to get photos path:', error);
    return null;
  }
}

/**
 * Convert a File object to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/xxx;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
