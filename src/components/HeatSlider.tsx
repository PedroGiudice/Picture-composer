import LocalFireDepartmentRounded from '@mui/icons-material/LocalFireDepartmentRounded';
import { useTheme } from '@/context/ThemeContext';

/**
 * @interface HeatSliderProps
 * @description Props for the HeatSlider component.
 */
interface HeatSliderProps {
  /**
   * The current value of the slider.
   */
  value: number;
  /**
   * Callback function to be called when the slider value changes.
   * @param value The new value of the slider.
   */
  onChange: (value: number) => void;
  /**
   * The minimum allowed value for the slider.
   * @default 1
   */
  min?: number;
  /**
   * The maximum allowed value for the slider.
   * @default 10
   */
  max?: number;
}

export const HeatSlider = ({ value, onChange, min = 1, max = 10 }: HeatSliderProps) => {
  const { mode } = useTheme();

  // Calculate percentage for gradient background and thumb position
  const percentage = ((value - min) / (max - min)) * 100;

  /**
   * Determines the intensity label based on the slider's value.
   * @param val The current slider value.
   * @returns A string representing the intensity level.
   */
  const getIntensityLabel = (val: number): string => {
    if (val <= 3) return 'SUAVE';
    if (val <= 6) return 'SENSUAL';
    if (val <= 8) return 'INTENSO';
    return 'EXTREMO';
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 rounded-xl bg-card border border-border/30">
      <div className="flex justify-between items-center text-primary text-xs font-bold tracking-widest uppercase">
        <span>Intensidade</span>
        <span aria-live="polite">{getIntensityLabel(value)}</span>
      </div>

      <div className="relative w-full h-8 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full absolute z-20 opacity-0 cursor-pointer h-full"
          aria-label="Intensity slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={getIntensityLabel(value)}
        />

        {/* Track */}
        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden absolute z-10">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${percentage}%`,
              background: mode === 'hot'
                ? 'linear-gradient(90deg, #500000 0%, #ff6b6b 100%)'
                : 'linear-gradient(90deg, #2d1810 0%, #d4a574 100%)'
            }}
          />
        </div>

        {/* Thumb */}
        <div
          className="absolute z-10 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-[0_0_15px_rgba(255,107,107,0.5)] transition-all duration-100 ease-out pointer-events-none"
          style={{
            left: `calc(${percentage}% - 16px)` // 16px is half of the thumb's width (32px / 2)
          }}
        >
          <LocalFireDepartmentRounded sx={{ fontSize: 18 }} className="text-primary fill-current" />
        </div>
      </div>

      <div className="flex justify-center">
        <span className="text-4xl font-bold text-white/10 font-mono" aria-hidden="true">{value}</span>
      </div>
    </div>
  );
};
