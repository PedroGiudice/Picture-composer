// src/components/ui/HeatSlider.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface HeatSliderProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export const HeatSlider: React.FC<HeatSliderProps> = ({ value, onChange, max = 10 }) => {
  return (
    <div className="w-full space-y-4 font-monaspice">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Intensity Level
        </label>
        <motion.div 
          key={value}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 text-rose-500"
        >
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-xs text-rose-500/50">/ {max}</span>
        </motion.div>
      </div>

      <div className="relative h-12 flex items-center group cursor-pointer">
        {/* Track Background */}
        <div className="absolute w-full h-2 bg-slate-800 rounded-full overflow-hidden">
           {/* Active Fill with Gradient */}
           <motion.div 
             className="h-full bg-gradient-to-r from-orange-900 via-rose-700 to-rose-500"
             initial={{ width: 0 }}
             animate={{ width: `${(value / max) * 100}%` }}
             transition={{ type: "spring", stiffness: 300, damping: 30 }}
           />
        </div>

        {/* Custom Input Range (Hidden but functional) */}
        <input
          type="range"
          min={1}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Thumb Visual */}
        <motion.div
          className="absolute w-8 h-8 bg-slate-900 border-2 border-rose-500 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.5)] flex items-center justify-center pointer-events-none z-0"
          animate={{ 
            left: `calc(${(value / max) * 100}% - 16px)`,
            scale: [1, 1.1, 1] 
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Flame className={`w-4 h-4 ${value > 7 ? 'text-rose-500 fill-current' : 'text-slate-400'}`} />
        </motion.div>
      </div>

      {/* Description Labels */}
      <div className="flex justify-between text-[10px] text-slate-600 uppercase font-bold tracking-wider">
        <span>Grounding</span>
        <span>Sensate</span>
        <span className="text-rose-900">Somatic</span>
      </div>
    </div>
  );
};
