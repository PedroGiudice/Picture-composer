import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseRounded from '@mui/icons-material/CloseRounded';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-50 left-4 right-4 top-1/2 -translate-y-1/2 max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{ 
                backgroundColor: 'var(--hotcocoa-card-bg)',
                border: '1px solid rgba(var(--hotcocoa-accent-rgb), 0.2)'
            }}
          >
            {title && (
              <div className="p-6 pb-2 flex justify-between items-center border-b border-white/5">
                <h2 className="text-xl font-bold tracking-wider uppercase font-mono" style={{ color: 'var(--hotcocoa-accent)' }}>{title}</h2>
                <button 
                  onClick={onClose}
                  className="p-2 -mr-2 transition-colors opacity-70 hover:opacity-100"
                  style={{ color: 'var(--hotcocoa-text-primary)' }}
                >
                  <CloseRounded sx={{ fontSize: 20 }} />
                </button>
              </div>
            )}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
