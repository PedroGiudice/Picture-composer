import { useState } from "react";
import { Header } from "@/components/Header";
import { HomeScreen } from "@/components/HomeScreen";
import { ChatScreen } from "@/components/ChatScreen";
import { ConfigModal } from "@/components/ConfigModal";
import { DemoControls } from "@/components/DemoControls";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeIndicator } from "@/components/ThemeIndicator";

type Screen = "home" | "chat";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleDeviceUpload = () => {
    // TODO: Implementar upload real via file picker
    console.log("Device upload clicked");
  };

  const handleGoogleDriveUpload = () => {
    // TODO: Implementar integracao real com Google Drive
    console.log("Google Drive upload clicked");
  };

  return (
    <ThemeProvider>
      <div
        className="h-screen w-full flex flex-col overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: 'var(--hotcocoa-bg)',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        {/* Fixed Header */}
        <Header
          onConfigClick={() => setIsConfigOpen(true)}
          onBackClick={() => setCurrentScreen("home")}
          showBackButton={currentScreen === "chat"}
        />

        {/* Main Content - starts below header (48px + 8px margin = 56px) */}
        {/* Desktop: centered with max-width | Mobile: full width */}
        <main className="flex-1 flex flex-col mx-auto w-full max-w-6xl" style={{ marginTop: '56px' }}>
          {currentScreen === "home" && (
            <HomeScreen
              onDeviceUpload={handleDeviceUpload}
              onGoogleDriveUpload={handleGoogleDriveUpload}
            />
          )}

          {currentScreen === "chat" && <ChatScreen />}
        </main>

        {/* Footer Version */}
        <footer
          className="py-2 text-center"
          style={{ backgroundColor: 'var(--hotcocoa-bg)' }}
        >
          <span
            className="text-xs opacity-40"
            style={{ color: 'var(--hotcocoa-text-secondary)' }}
          >
            v0.0.1
          </span>
        </footer>

        {/* Configuration Modal */}
        <ConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
        />

        {/* Navigation Controls */}
        <DemoControls
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
          onConfigOpen={() => setIsConfigOpen(true)}
        />

        {/* Theme Change Indicator */}
        <ThemeIndicator />
      </div>
    </ThemeProvider>
  );
}
