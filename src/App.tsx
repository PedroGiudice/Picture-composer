import { useState } from "react";
import { Header } from "@/components/Header";
import { HomeScreen } from "@/components/HomeScreen";
import { ViewingScreen } from "@/components/ViewingScreen";
import { ChatScreen } from "@/components/ChatScreen";
import { ConfigModal } from "@/components/ConfigModal";
import { DemoControls } from "@/components/DemoControls";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeIndicator } from "@/components/ThemeIndicator";

type Screen = "home" | "viewing" | "chat";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Demo photo URL - replace with actual uploaded photos
  const demoPhotoUrl = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80";

  const handleDeviceUpload = () => {
    // Simulate file upload - in real app, this would open file picker
    console.log("Device upload clicked");
    setCurrentScreen("viewing");
  };

  const handleGoogleDriveUpload = () => {
    // Simulate Google Drive integration
    console.log("Google Drive upload clicked");
  };

  const handleStartProtocol = () => {
    console.log("Starting protocol...");
    // This would trigger the LLM analysis
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
          showBackButton={currentScreen === "viewing" || currentScreen === "chat"}
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

          {currentScreen === "viewing" && (
            <ViewingScreen
              photoUrl={demoPhotoUrl}
              currentRound={1}
              totalRounds={1}
              onStartProtocol={handleStartProtocol}
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

        {/* Demo Controls */}
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