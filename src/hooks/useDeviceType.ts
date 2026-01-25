import { useState, useEffect } from 'react';
import { isTauri } from '@/services/tauri';

export type DeviceType = 'mobile' | 'desktop' | 'web';

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>('web');

  useEffect(() => {
    const checkDevice = async () => {
      if (!isTauri()) {
        setDeviceType('web');
        return;
      }

      // Verificar se e Android via Tauri
      const isAndroid = (window as any).HotCocoaPermissions?.isAndroid?.() ?? false;
      setDeviceType(isAndroid ? 'mobile' : 'desktop');
    };

    checkDevice();
  }, []);

  return deviceType;
};
