import { useState, useEffect, useCallback } from 'react';
import { isTauri } from '../services/tauri';

// Tipo para o store do Tauri
type TauriStore = {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown) => Promise<void>;
  save: () => Promise<void>;
};

let storeInstance: TauriStore | null = null;

/**
 * Carrega o store do Tauri (lazy loading)
 */
async function loadStore(): Promise<TauriStore | null> {
  if (!isTauri()) return null;

  if (storeInstance) return storeInstance;

  try {
    const { load } = await import('@tauri-apps/plugin-store');
    storeInstance = await load('app-settings.json', {
      defaults: {},
      autoSave: 100
    });
    return storeInstance;
  } catch (error) {
    console.error('Failed to load Tauri store:', error);
    return null;
  }
}

/**
 * Hook para persistencia via Tauri Store
 * Fallback para localStorage quando nao esta no Tauri
 */
export function useTauriStore<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar valor inicial
  useEffect(() => {
    const loadValue = async () => {
      try {
        if (isTauri()) {
          const store = await loadStore();
          if (store) {
            const storedValue = await store.get<T>(key);
            if (storedValue !== null) {
              setValue(storedValue);
            }
          }
        } else {
          // Fallback para localStorage
          const stored = localStorage.getItem(key);
          if (stored) {
            setValue(JSON.parse(stored));
          }
        }
      } catch (error) {
        console.error(`Failed to load ${key}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Salvar valor
  const setAndPersist = useCallback(async (newValue: T) => {
    setValue(newValue);

    try {
      if (isTauri()) {
        const store = await loadStore();
        if (store) {
          await store.set(key, newValue);
          await store.save();
        }
      } else {
        // Fallback para localStorage
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  }, [key]);

  return [value, setAndPersist, isLoading];
}

export default useTauriStore;
