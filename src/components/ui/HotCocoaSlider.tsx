import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface HotCocoaSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  className?: string;
}

export function HotCocoaSlider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: HotCocoaSliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min],
    [value, defaultValue, min],
  );

  return (
    <SliderPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className="relative w-full h-2 rounded-full overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: 'var(--hotcocoa-border)' }}
      >
        <SliderPrimitive.Range
          className="absolute h-full transition-colors duration-300"
          style={{ backgroundColor: 'var(--hotcocoa-accent)' }}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="block w-5 h-5 rounded-full border-2 shadow-lg transition-all duration-300 hover:scale-110 focus:scale-110 focus:outline-none active:scale-125"
          style={{
            backgroundColor: 'var(--hotcocoa-text-primary)',
            borderColor: 'var(--hotcocoa-accent)',
          }}
        />
      ))}
    </SliderPrimitive.Root>
  );
}
