import HomeRounded from '@mui/icons-material/HomeRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import ChatRounded from '@mui/icons-material/ChatRounded';
import { useTheme } from "@/context/ThemeContext";

interface DemoControlsProps {
  currentScreen: "home" | "chat";
  onScreenChange: (screen: "home" | "chat") => void;
  onConfigOpen: () => void;
}

export function DemoControls({ currentScreen, onScreenChange, onConfigOpen }: DemoControlsProps) {
  const { mode } = useTheme();

  // Na tela de chat, mover para a esquerda para não sobrepor o botão de enviar
  const positionClass = currentScreen === "chat"
    ? "fixed bottom-32 left-4 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:left-6 lg:right-auto"
    : "fixed bottom-20 right-4 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:right-6";

  return (
    <div
      className={`${positionClass} flex flex-col gap-2 z-[60] p-3 rounded-xl shadow-lg transition-all duration-300`}
      style={{
        backgroundColor: 'var(--hotcocoa-card-bg)',
        border: '1px solid var(--hotcocoa-border)',
        borderRadius: '12px'
      }}
    >
      <button
        onClick={() => onScreenChange("home")}
        className={`p-2 rounded-lg transition-all duration-300 active:scale-95 ${currentScreen === "home" ? "scale-110" : "opacity-60"}`}
        style={{
          backgroundColor: currentScreen === "home" ? 'var(--hotcocoa-accent)' : 'transparent',
          minWidth: '48px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Home"
      >
        <HomeRounded
          sx={{
            fontSize: 24,
            color: currentScreen === "home"
              ? (mode === 'warm' ? '#3d2817' : '#000')
              : 'var(--hotcocoa-text-primary)'
          }}
        />
      </button>

      <button
        onClick={() => onScreenChange("chat")}
        className={`p-2 rounded-lg transition-all duration-300 active:scale-95 ${currentScreen === "chat" ? "scale-110" : "opacity-60"}`}
        style={{
          backgroundColor: currentScreen === "chat" ? 'var(--hotcocoa-accent)' : 'transparent',
          minWidth: '48px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Chat"
      >
        <ChatRounded
          sx={{
            fontSize: 24,
            color: currentScreen === "chat"
              ? (mode === 'warm' ? '#3d2817' : '#000')
              : 'var(--hotcocoa-text-primary)'
          }}
        />
      </button>

      <button
        onClick={onConfigOpen}
        className="p-2 rounded-lg transition-all duration-300 opacity-60 hover:opacity-100 active:scale-95"
        style={{
          minWidth: '48px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Configuracoes"
      >
        <SettingsRounded
          sx={{
            fontSize: 24,
            color: 'var(--hotcocoa-text-primary)'
          }}
        />
      </button>
    </div>
  );
}
