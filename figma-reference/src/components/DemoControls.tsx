import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { RefreshCw, Zap, Eye, Bug } from 'lucide-react';

export const DemoControls: React.FC = () => {
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const isLoaded = useRef(false);

  useEffect(() => {
    const savedPos = localStorage.getItem('demo-controls-pos');
    if (savedPos) {
      try {
        const { x: savedX, y: savedY } = JSON.parse(savedPos);
        x.set(savedX);
        y.set(savedY);
      } catch (e) {
        // ignore error
      }
    }
    isLoaded.current = true;
  }, [x, y]);

  const handleDragEnd = () => {
    const pos = { x: x.get(), y: y.get() };
    localStorage.setItem('demo-controls-pos', JSON.stringify(pos));
  };

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[100]" />
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        style={{ x, y }}
        onDragEnd={handleDragEnd}
        className="fixed top-20 right-4 z-[101] flex flex-col gap-2 p-2 bg-black/80 backdrop-blur-md rounded-full border border-white/10 pointer-events-auto shadow-xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ControlButton icon={<RefreshCw size={20} />} label="Reset" />
        <ControlButton icon={<Zap size={20} />} label="Trigger" />
        <ControlButton icon={<Eye size={20} />} label="Inspect" />
        <ControlButton icon={<Bug size={20} />} label="Debug" />
      </motion.div>
    </>
  );
};

const ControlButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <button className="p-3 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors text-white/70" title={label}>
    {icon}
  </button>
);
