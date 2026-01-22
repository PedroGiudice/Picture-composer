import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import LocalFireDepartmentRounded from '@mui/icons-material/LocalFireDepartmentRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';

export function ThemeIndicator() {
  const { mode } = useTheme();
  const [show, setShow] = useState(false);
  const [prevMode, setPrevMode] = useState(mode);

  useEffect(() => {
    if (prevMode !== mode) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      setPrevMode(mode);
      return () => clearTimeout(timer);
    }
  }, [mode, prevMode]);

  if (!show) return null;

  return (
    <div 
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[70] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300"
      style={{
        backgroundColor: 'var(--hotcocoa-accent)',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      {mode === 'hot' ? (
        <LocalFireDepartmentRounded 
          sx={{ 
            fontSize: 20, 
            color: '#000'
          }} 
        />
      ) : (
        <FavoriteRounded 
          sx={{ 
            fontSize: 20, 
            color: '#3d2817'
          }} 
        />
      )}
      <span 
        className="text-sm font-semibold uppercase tracking-wide"
        style={{ color: mode === 'warm' ? '#3d2817' : '#000' }}
      >
        {mode} Mode Active
      </span>
      <style>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
