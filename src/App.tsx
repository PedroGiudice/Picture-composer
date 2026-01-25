import { ThemeProvider } from './context/ThemeContext';
import { useDeviceType } from './hooks/useDeviceType';
import MobileLayout from './layouts/MobileLayout';
import DesktopLayout from './layouts/DesktopLayout';

function AppContent() {
  const deviceType = useDeviceType();

  // Desktop Tauri = DesktopLayout
  // Mobile (Android) ou Web = MobileLayout
  if (deviceType === 'desktop') {
    return <DesktopLayout />;
  }

  return <MobileLayout />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
