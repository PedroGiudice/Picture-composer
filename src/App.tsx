import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HomeScreen } from "@/components/HomeScreen";
import { ChatScreen } from "@/components/ChatScreen";
import { ConfigModal } from "@/components/ConfigModal";
import { SystemPromptModal } from "@/components/SystemPromptModal";
import { PromptSelectorModal } from "@/components/PromptSelectorModal";
import { PromptCreatorChat } from "@/components/PromptCreatorChat";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeIndicator } from "@/components/ThemeIndicator";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

// MUI Icons
import CameraAltRounded from "@mui/icons-material/CameraAltRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import TuneRounded from "@mui/icons-material/TuneRounded";

// Version from package.json (injected by Vite)
const APP_VERSION = __APP_VERSION__ || "0.1.0";

type Screen = "home" | "chat";

/**
 * Represents a button in the bottom navigation bar.
 */
interface NavButtonProps {
  /** Icon component to display */
  Icon: React.ElementType;
  /** Text label for the button */
  label: string;
  /** Function to execute on click */
  onClick: () => void;
  /** Whether the button is currently active */
  isActive?: boolean;
}

const NavButton = ({ Icon, label, onClick, isActive = false }: NavButtonProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive
        ? 'text-[var(--hotcocoa-accent)]'
        : 'text-[var(--hotcocoa-text-secondary)] hover:text-[var(--hotcocoa-text-primary)]'
    }`}
  >
    <Icon sx={{ fontSize: 26 }} />
    <span className="text-xs mt-1">{label}</span>
  </button>
);


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
          // Auto-download
          setUpdateStatus("downloading");
          await update.downloadAndInstall();
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

    const timer = setTimeout(checkForUpdates, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDeviceUpload = () => {
    console.log("Device upload clicked");
  };

  const handleGoogleDriveUpload = () => {
    console.log("Google Drive upload clicked");
  };

  return (
    <ThemeProvider>
      <div
        className="h-screen w-full flex flex-col overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: 'var(--hotcocoa-bg)',
          paddingTop: 'env(safe-area-inset-top)',
          // The bottom padding will be handled by the bottom nav's height
        }}
      >
        {/* Fixed Header */}
        <Header
          onConfigClick={() => setIsConfigOpen(true)}
          onBackClick={() => setCurrentScreen("home")}
          showBackButton={currentScreen === "chat"}
        />

        {/* Main Content */}
        <main
          className="flex-1 flex flex-col min-h-0 mx-auto w-full max-w-6xl pb-24" // Added padding-bottom
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


        {/* Bottom Navigation */}
        <nav
          className="fixed bottom-0 left-0 right-0 h-16 border-t"
          style={{
            backgroundColor: 'var(--hotcocoa-bg-secondary)',
            borderColor: 'var(--hotcocoa-border)',
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          <div className="flex justify-around items-start h-full max-w-6xl mx-auto">
            <NavButton
              Icon={CameraAltRounded}
              label="Studio"
              onClick={() => setCurrentScreen("home")}
              isActive={currentScreen === 'home' || currentScreen === 'chat'}
            />
            <NavButton
              Icon={PersonRounded}
              label="Persona"
              onClick={() => setIsPromptSelectorOpen(true)}
            />
            <NavButton
              Icon={TuneRounded}
              label="Config"
              onClick={() => setIsConfigOpen(true)}
            />
          </div>
        </nav>


        {/* MODALS */}
        <ConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
        />

        <SystemPromptModal
          isOpen={isSystemPromptOpen}
          onClose={() => {
            setIsSystemPromptOpen(false);
            setInitialSystemPrompt(undefined);
          }}
          initialPrompt={initialSystemPrompt}
        />

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

        <PromptCreatorChat
          isOpen={isPromptCreatorOpen}
          onClose={() => setIsPromptCreatorOpen(false)}
          onBack={() => {
            setIsPromptCreatorOpen(false);
            setIsPromptSelectorOpen(true);
          }}
        />

        {/* Global Indicators */}
        <ThemeIndicator />
      </div>
    </ThemeProvider>
  );
}
