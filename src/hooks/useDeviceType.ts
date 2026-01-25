import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'desktop' | 'web';

// Detecta se esta rodando no Tauri
const checkIsTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

// Detecta se e Android
const checkIsAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Verifica via user agent
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('android');
};

// Detecta se e desktop por largura de tela (fallback)
const checkIsDesktopByWidth = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

// Calcula o tipo de dispositivo de forma sincrona
const getInitialDeviceType = (): DeviceType => {
  if (typeof window === 'undefined') return 'web';

  const isTauri = checkIsTauri();
  const isAndroid = checkIsAndroid();
  const isDesktopWidth = checkIsDesktopByWidth();

  // Se e Tauri e nao e Android = desktop
  if (isTauri && !isAndroid) {
    return 'desktop';
  }

  // Se e Tauri e Android = mobile
  if (isTauri && isAndroid) {
    return 'mobile';
  }

  // Se nao e Tauri mas tem largura de desktop = desktop (para dev/preview)
  if (!isTauri && isDesktopWidth) {
    return 'desktop';
  }

  return 'web';
};

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>(getInitialDeviceType);

  useEffect(() => {
    // Re-verifica apos mount (para garantir que window esta disponivel)
    setDeviceType(getInitialDeviceType());

    // Listener para mudanca de tamanho (responsive)
    const handleResize = () => {
      setDeviceType(getInitialDeviceType());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
};
