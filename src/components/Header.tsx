import SettingsRounded from '@mui/icons-material/SettingsRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  onConfigClick: () => void;
  onBackClick?: () => void;
  showBackButton?: boolean;
}

export function Header({ onConfigClick, onBackClick, showBackButton = false }: HeaderProps) {
  const { mode } = useTheme();
  
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--hotcocoa-header-bg)',
        paddingTop: 'max(env(safe-area-inset-top, 0px), 24px)',
        height: 'calc(48px + max(env(safe-area-inset-top, 0px), 24px))'
      }}
    >
      <div className="flex-1">
        {showBackButton && onBackClick && (
          <button
            onClick={onBackClick}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 active:scale-95"
            aria-label="Back"
            style={{ 
              minWidth: '48px', 
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowBackRounded 
              sx={{ 
                fontSize: 24, 
                color: 'var(--hotcocoa-text-secondary)' 
              }} 
            />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <h1 
          className="text-xl tracking-wide transition-colors duration-300"
          style={{ color: 'var(--hotcocoa-accent)' }}
        >
          HotCocoa
        </h1>
        <div 
          className="px-2 py-0.5 rounded-full text-xs uppercase transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--hotcocoa-accent)',
            color: mode === 'warm' ? '#3d2817' : '#000',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}
        >
          {mode}
        </div>
      </div>
      <div className="flex-1 flex justify-end">
        <button
          onClick={onConfigClick}
          className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 active:scale-95"
          aria-label="Settings"
          style={{ 
            minWidth: '48px', 
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <SettingsRounded 
            sx={{ 
              fontSize: 24, 
              color: 'var(--hotcocoa-text-secondary)' 
            }} 
          />
        </button>
      </div>
    </header>
  );
}