import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HomeScreen } from "@/components/HomeScreen";
import { ChatScreen } from "@/components/ChatScreen";
import { ConfigModal } from "@/components/ConfigModal";
import { SystemPromptModal } from "@/components/SystemPromptModal";
import { PromptSelectorModal } from "@/components/PromptSelectorModal";
import { PromptCreatorChat } from "@/components/PromptCreatorChat";
import { DemoControls } from "@/components/DemoControls";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeIndicator } from "@/components/ThemeIndicator";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

// Version from package.json (injected by Vite)
const APP_VERSION = __APP_VERSION__ || "0.1.0";

type Screen = "home" | "chat";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const [isPromptSelectorOpen, setIsPromptSelectorOpen] = useState(false);
  const [isPromptCreatorOpen, setIsPromptCreatorOpen] = useState(false);
  const [initialSystemPrompt, setInitialSystemPrompt] = useState<string | undefined>();
  const [updateStatus, setUpdateStatus] = useState<"idle" | "checking" | "available" | "downloading" | "ready">("idle");

  // Check for updates on startup
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        setUpdateStatus("checking");
        const update = await check();
        if (update) {
          setUpdateStatus("available");
          console.log(`Update available: ${update.version}`);

          // Auto-download
          setUpdateStatus("downloading");
          await update.downloadAndInstall((event) => {
            if (event.event === "Progress") {
              const progress = (event.data.chunkLength / event.data.contentLength) * 100;
              console.log(`Download progress: ${progress.toFixed(1)}%`);
            }
          });
          setUpdateStatus("ready");

          // Prompt user to restart
          if (confirm(`Nova versao ${update.version} instalada! Reiniciar agora?`)) {
            await relaunch();
          }
        } else {
          setUpdateStatus("idle");
        }
      } catch (e) {
        console.log("Update check failed (normal in dev):", e);
        setUpdateStatus("idle");
      }
    };

    // Check after 3 seconds to not block startup
    const timer = setTimeout(checkForUpdates, 3000);
    return () => clearTimeout(timer);
  }, []);

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

        {/* Main Content - starts below header (48px + safe-area + margin) */}
        {/* Desktop: centered with max-width | Mobile: full width */}
        <main
          className="flex-1 flex flex-col min-h-0 mx-auto w-full max-w-6xl"
          style={{ marginTop: 'calc(48px + max(env(safe-area-inset-top, 0px), 24px) + 8px)' }}
        >
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
            v{APP_VERSION}
            {updateStatus === "checking" && " (verificando...)"}
            {updateStatus === "downloading" && " (baixando update...)"}
            {updateStatus === "ready" && " (reinicie para atualizar)"}
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
          onSystemPromptOpen={() => setIsPromptSelectorOpen(true)}
        />

        {/* System Prompt Modal (Advanced Editor) */}
        <SystemPromptModal
          isOpen={isSystemPromptOpen}
          onClose={() => {
            setIsSystemPromptOpen(false);
            setInitialSystemPrompt(undefined);
          }}
          initialPrompt={initialSystemPrompt}
        />

        {/* Prompt Selector Modal */}
        <PromptSelectorModal
          isOpen={isPromptSelectorOpen}
          onClose={() => setIsPromptSelectorOpen(false)}
          onOpenCreator={() => {
            setIsPromptSelectorOpen(false);
            setIsPromptCreatorOpen(true);
          }}
          onOpenAdvanced={(prompt) => {
            setIsPromptSelectorOpen(false);
            setInitialSystemPrompt(prompt);
            setIsSystemPromptOpen(true);
          }}
        />

        {/* Prompt Creator Chat */}
        <PromptCreatorChat
          isOpen={isPromptCreatorOpen}
          onClose={() => setIsPromptCreatorOpen(false)}
          onBack={() => {
            setIsPromptCreatorOpen(false);
            setIsPromptSelectorOpen(true);
          }}
        />

        {/* Theme Change Indicator */}
        <ThemeIndicator />
      </div>
    </ThemeProvider>
  );
}
