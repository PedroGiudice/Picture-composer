// src/components/ui/FloatingCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 1 | 2 | 3;
  delay?: number;
  onClick?: (e: React.MouseEvent) => void;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  elevation = 2,
  delay = 0,
  onClick
}) => {
  const shadowVar = `var(--shadow-${elevation})`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      onClick={onClick}
      className={`
        rounded-xl
        bg-[var(--bg-surface)]
        p-6
        transition-all duration-150
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
      style={{ boxShadow: shadowVar }}
    >
      {children}
    </motion.div>
  );
};
