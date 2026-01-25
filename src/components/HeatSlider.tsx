import React from 'react';
import { cn } from "@/lib/utils"; // Keeping cn for potential future use or if other components need it
import LocalFireDepartmentRounded from '@mui/icons-material/LocalFireDepartmentRounded';
import { useTheme } from '../context/ThemeContext'; // Adjust path if necessary

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

export const HeatSlider: React.FC<HeatSliderProps> = ({ value, onChange, min = 1, max = 10 }) => {
  const { theme } = useTheme();

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
              background: theme === 'hot'
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

// Usage Example
/*
import React, { useState } from 'react';
import { HeatSlider } from './HeatSlider'; // Adjust path as needed
import { ThemeProvider } from '../context/ThemeContext'; // Assuming ThemeProvider exists

const HeatSliderUsageExample: React.FC = () => {
  const [heatValue, setHeatValue] = useState(5);

  return (
    <ThemeProvider>
      <div className="p-4 bg-gray-800 min-h-screen flex items-center justify-center">
        <div className="w-96">
          <HeatSlider
            value={heatValue}
            onChange={setHeatValue}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default HeatSliderUsageExample;
*/

// Unit Test Structure
/*
import { render, screen, fireEvent } from '@testing-library/react';
import { HeatSlider } from './HeatSlider';
import { ThemeContext, ThemeProvider } from '../context/ThemeContext'; // Mock if necessary

describe('HeatSlider', () => {
  const mockOnChange = jest.fn();

  it('renders correctly with default props', () => {
    render(
      <ThemeProvider>
        <HeatSlider value={5} onChange={mockOnChange} />
      </ThemeProvider>
    );

    expect(screen.getByLabelText('Intensity slider')).toBeInTheDocument();
    expect(screen.getByText('SENSUAL')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays the correct label for different values', () => {
    const { rerender } = render(
      <ThemeProvider>
        <HeatSlider value={2} onChange={mockOnChange} />
      </ThemeProvider>
    );
    expect(screen.getByText('SUAVE')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <HeatSlider value={7} onChange={mockOnChange} />
      </ThemeProvider>
    );
    expect(screen.getByText('INTENSO')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <HeatSlider value={9} onChange={mockOnChange} />
      </ThemeProvider>
    );
    expect(screen.getByText('EXTREMO')).toBeInTheDocument();
  });

  it('calls onChange when the slider value changes', () => {
    render(
      <ThemeProvider>
        <HeatSlider value={5} onChange={mockOnChange} />
      </ThemeProvider>
    );

    const slider = screen.getByLabelText('Intensity slider');
    fireEvent.change(slider, { target: { value: '8' } });
    expect(mockOnChange).toHaveBeenCalledWith(8);
  });

  it('applies hot theme gradient', () => {
    // Mock ThemeContext to control theme
    const mockThemeContext = { theme: 'hot', toggleTheme: jest.fn() };
    render(
      <ThemeContext.Provider value={mockThemeContext}>
        <HeatSlider value={5} onChange={mockOnChange} />
      </ThemeContext.Provider>
    );

    const track = screen.getByLabelText('Intensity slider').nextElementSibling?.firstElementChild as HTMLElement;
    expect(track).toHaveStyle('background: linear-gradient(90deg, #500000 0%, #ff6b6b 100%)');
  });

  it('applies warm theme gradient', () => {
    // Mock ThemeContext to control theme
    const mockThemeContext = { theme: 'warm', toggleTheme: jest.fn() };
    render(
      <ThemeContext.Provider value={mockThemeContext}>
        <HeatSlider value={5} onChange={mockOnChange} />
      </ThemeContext.Provider>
    );

    const track = screen.getByLabelText('Intensity slider').nextElementSibling?.firstElementChild as HTMLElement;
    expect(track).toHaveStyle('background: linear-gradient(90deg, #2d1810 0%, #d4a574 100%)');
  });
});
*/

// Accessibility Checklist:
/*
1. ARIA Labels:
   - `aria-label="Intensity slider"` added to the input range for screen reader users.
   - `aria-valuemin`, `aria-valuemax`, `aria-valuenow` added to the input range to convey the slider's state.
   - `aria-valuetext={getIntensityLabel(value)}` provides a human-readable value for the slider.
   - `aria-live="polite"` on the intensity label span ensures screen readers announce changes.
   - `aria-hidden="true"` on the numeric value to avoid redundancy with `aria-valuetext`.

2. Keyboard Navigation:
   - The native `<input type="range">` inherently supports keyboard navigation (left/right arrow keys, home/end keys).
   - Focus management: The input is naturally focusable.

3. Focus Management:
   - The `<input type="range">` receives focus by default when tabbed to.
   - No custom focus management is needed as the native element handles it.

4. Color Contrast:
   - Ensure the text colors (`text-primary`, `text-white/10`) and background colors (`bg-card`, `bg-black/40`, `bg-background`) meet WCAG contrast guidelines. (This is a design system concern, assuming Tailwind's defaults or custom theme values are compliant).

5. Semantic HTML:
   - Using `<input type="range">` is semantically appropriate for a slider.

6. Responsive Design:
   - The component uses `w-full` and flexbox for responsiveness, adapting to different screen sizes.
*/
