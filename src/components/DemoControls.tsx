import { useState, useRef } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import HomeRounded from '@mui/icons-material/HomeRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import ChatRounded from '@mui/icons-material/ChatRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import { useTheme } from "@/context/ThemeContext";

interface DemoControlsProps {
  currentScreen: "home" | "chat";
  onScreenChange: (screen: "home" | "chat") => void;
  onConfigOpen: () => void;
  onSystemPromptOpen: () => void;
}

// Chave para persistir posicao no localStorage
const POSITION_KEY = "hotcocoa-nav-position";

// Posicao inicial padrao
const getDefaultPosition = () => {
  const saved = localStorage.getItem(POSITION_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { x: 0, y: 0 };
    }
  }
  return { x: 0, y: 0 };
};

export function DemoControls({ currentScreen, onScreenChange, onConfigOpen, onSystemPromptOpen }: DemoControlsProps) {
  const { mode } = useTheme();
  const nodeRef = useRef(null);
  const [position, setPosition] = useState(getDefaultPosition);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (_e: DraggableEvent, data: DraggableData) => {
    setPosition({ x: data.x, y: data.y });
  };

  const handleStop = (_e: DraggableEvent, data: DraggableData) => {
    setIsDragging(false);
    // Persistir posicao
    localStorage.setItem(POSITION_KEY, JSON.stringify({ x: data.x, y: data.y }));
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStart={() => setIsDragging(true)}
      onDrag={handleDrag}
      onStop={handleStop}
      bounds="parent"
      handle=".drag-handle"
    >
      <div
        ref={nodeRef}
        className={`fixed bottom-20 right-4 flex flex-col gap-2 z-[60] p-3 rounded-xl shadow-lg transition-all duration-300 ${
          isDragging ? "opacity-80 scale-105" : ""
        }`}
        style={{
          backgroundColor: 'var(--hotcocoa-card-bg)',
          border: '1px solid var(--hotcocoa-border)',
          borderRadius: '12px'
        }}
      >
        {/* Handle para arrastar - usuario segura aqui */}
        <div
          className="drag-handle cursor-grab active:cursor-grabbing flex justify-center py-1 -mt-1 opacity-50 hover:opacity-100 transition-opacity"
          style={{ touchAction: 'none' }}
        >
          <DragIndicatorRounded
            sx={{ fontSize: 20, color: 'var(--hotcocoa-text-secondary)' }}
          />
        </div>

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
          onClick={onSystemPromptOpen}
          className="p-2 rounded-lg transition-all duration-300 opacity-60 hover:opacity-100 active:scale-95"
          style={{
            minWidth: '48px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="System Prompt"
        >
          <DescriptionRounded
            sx={{
              fontSize: 24,
              color: 'var(--hotcocoa-text-primary)'
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
    </Draggable>
  );
}
