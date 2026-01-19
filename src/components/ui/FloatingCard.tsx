// src/components/ui/FloatingCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  onClick?: (e: React.MouseEvent) => void;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  hover = true,
  delay = 0,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1] // Custom easing
      }}
      whileHover={hover ? {
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
      onClick={onClick}
      className={`floating-card p-6 backdrop-blur-sm ${className}`}
    >
      {children}
    </motion.div>
  );
};
