# HotCocoa Dynamic Theming System

## Overview

HotCocoa features a dynamic theming system that provides two distinct visual experiences: HOT mode and WARM mode. The theme switch is immediate and affects all UI elements throughout the application.

## Theme Modes

### HOT Mode (Default)
**Vibe:** Visceral, Explicit, Night-time, Intense

**Palette:**
- Background: Deep Dark Chocolate/Black (#0f0a08)
- Card Background: Rich Brown (#2d1e18)
- Header Background: Dark Brown (#1a1210)
- Primary Text: Light Pink (#f5d5d5)
- Secondary Text: Muted Pink (#b89090)
- Accent: Spicy Pink/Red (#e87d8f)
- Accent Hover: Bright Pink (#f298a8)
- Border: Translucent Pink (rgba(232, 125, 143, 0.2))

**Feeling:** High energy, bold, passionate, and intense

### WARM Mode
**Vibe:** Deep, Emotional, Intimate, Cozy

**Palette:**
- Background: Latte/Cream (#f5e6d3)
- Card Background: Soft Mocha (#e8d4bf)
- Header Background: Warm Beige (#d9c4af)
- Primary Text: Dark Brown (#3d2817)
- Secondary Text: Muted Brown (#6b523f)
- Accent: Soft Amber/Terracotta (#d4915e)
- Accent Hover: Darker Amber (#c27d4a)
- Border: Translucent Amber (rgba(212, 145, 94, 0.3))

**Feeling:** Comfortable, romantic, soft, and emotional

## Implementation

### Theme Context

The theming system uses React Context for global state management:

```tsx
import { useTheme } from "@/app/contexts/ThemeContext";

function MyComponent() {
  const { mode, setMode } = useTheme();
  
  // Use the current mode
  console.log(mode); // "hot" or "warm"
  
  // Switch modes
  setMode("warm");
}
```

### CSS Variables

All theme colors are defined as CSS variables that automatically update when the theme changes:

```css
/* Usage in components */
style={{ 
  backgroundColor: 'var(--hotcocoa-bg)',
  color: 'var(--hotcocoa-text-primary)',
  borderColor: 'var(--hotcocoa-accent)'
}}
```

### Available CSS Variables

- `--hotcocoa-bg`: Main background color
- `--hotcocoa-card-bg`: Card/modal background color
- `--hotcocoa-header-bg`: Header background color
- `--hotcocoa-text-primary`: Primary text color
- `--hotcocoa-text-secondary`: Secondary text color
- `--hotcocoa-accent`: Accent/brand color
- `--hotcocoa-accent-hover`: Accent hover state
- `--hotcocoa-border`: Border color

### Smooth Transitions

All color changes are animated with smooth 300ms transitions defined in `/src/styles/hotcocoa.css`:

```css
:root, body, div, button, input, header, footer, main {
  transition-property: background-color, border-color, color;
  transition-duration: 300ms;
  transition-timing-function: ease-in-out;
}
```

## Material Design 3 Integration

The app follows Google's Material Design 3 guidelines:

### Icons
- All icons use Material Symbols Rounded variant from `@mui/icons-material`
- Consistent 24dp size for action icons
- Example: `<SettingsRounded sx={{ fontSize: 24 }} />`

### Touch Targets
- Minimum 48x48dp touch targets for all interactive elements
- Implemented with `minWidth: '48px', minHeight: '48px'`

### Corner Radii
- Cards: 16dp (16px) - `borderRadius: '16px'`
- Buttons: 12dp (12px) - `borderRadius: '12px'`
- Small elements: 8dp (8px)

### Elevation & Shadows
- MD3 elevation classes available in `/src/styles/md3-ripple.css`
- `.md3-elevation-1`, `.md3-elevation-2`, `.md3-elevation-3`

### Ripple Effects
- Automatic ripple effect on button press
- Defined in `/src/styles/md3-ripple.css`

## Affected Components

All components respond to theme changes:

1. **Header** - Shows current mode badge, transitions all colors
2. **ConfigModal** - Toggle between modes, theme-aware UI
3. **HomeScreen** - Background, cards, text all adapt
4. **ViewingScreen** - Photo viewer, controls, buttons adapt
5. **ChatScreen** - Message bubbles, input field adapt
6. **DemoControls** - Navigation buttons adapt
7. **HotCocoaSlider** - Slider track and thumb colors adapt
8. **ParticleBackground** - Particle colors change based on theme

## Mode Switching

Users can switch themes in two ways:

1. **Configuration Modal**: Click the settings icon in the header, select HOT or WARM mode
2. **Programmatically**: Use `setMode()` from the theme context

The theme change is:
- Immediate (300ms smooth transition)
- Global (affects entire app)
- Persistent across navigation
- Visible in header badge

## Best Practices

When creating new components:

1. Use CSS variables for colors: `var(--hotcocoa-*)`
2. Add `transition-colors duration-300` className
3. Use `useTheme()` hook for conditional logic
4. Follow MD3 guidelines for touch targets and radii
5. Test in both HOT and WARM modes for contrast

## Technical Details

- Theme stored in React Context
- CSS variables update via `data-theme` attribute on `<html>`
- No page reload required
- Transitions handled purely by CSS
- Material UI icons for consistent design language
