import type { PaletteShape } from './color';
import type { VariantConfig } from './variant';

/**
 * The full Theme shape consumed by `@apx-ui/theme`'s `ThemeProvider`. Defined here so packages
 * can reference theme types without a circular import. The runtime defaults live in
 * `@apx-ui/tokens`.
 */
export interface ThemeShape {
  name?: string;

  palette: {
    light: PaletteShape;
    dark: PaletteShape;
  };
  mode: 'light' | 'dark' | 'system';

  variant: string;
  dir: 'ltr' | 'rtl';

  typography: TypographyShape;
  spacing: SpacingScale;
  radius: RadiusScale;
  shadows: ShadowScale;
  motion: MotionShape;
  breakpoints: BreakpointScale;
  zIndex: ZIndexScale;

  components?: Record<string, ComponentThemeOverride>;
}

export interface TypographyShape {
  fontFamily: { sans: string; mono: string };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number | string>;
  letterSpacing: Record<string, string>;
}

export type SpacingScale = Record<string | number, string>;
export type RadiusScale = Record<string, string>;
export type ShadowScale = Record<string, string>;

export interface MotionShape {
  duration: { fast: number; normal: number; slow: number };
  ease: { standard: string; emphasized: string; decelerate: string; accelerate: string };
  reduceMotion: 'system' | 'always' | 'never';
}

export interface BreakpointScale {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface ZIndexScale {
  hide: number;
  base: number;
  dropdown: number;
  sticky: number;
  overlay: number;
  modal: number;
  toast: number;
  tooltip: number;
}

/**
 * Per-component theme override slot. The theme can set default props, add new variants, and inject
 * class strings into specific component slots.
 */
export interface ComponentThemeOverride {
  defaultProps?: Record<string, unknown>;
  styleOverrides?: Record<string, string>;
  variants?: Record<string, VariantConfig>;
}