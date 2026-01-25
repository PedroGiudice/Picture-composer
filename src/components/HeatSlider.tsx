import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface HeatSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  className?: string
  gradient?: string
}

export function HeatSlider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  gradient = "linear-gradient(90deg, #60A5FA 0%, #F87171 100%)", // Blue to Red
  ...props
}: HeatSliderProps) {
  return (
    <SliderPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className="relative h-2 w-full grow overflow-hidden rounded-full"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        {/* Gradient Background for the whole track to represent the spectrum */}
        <div 
            className="absolute inset-0 h-full w-full opacity-80"
            style={{ background: gradient }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block h-5 w-5 rounded-full border-2 shadow-lg ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 cursor-pointer"
        style={{
            borderColor: 'white',
            backgroundColor: 'var(--hotcocoa-accent)',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }}
      />
    </SliderPrimitive.Root>
  )
}
