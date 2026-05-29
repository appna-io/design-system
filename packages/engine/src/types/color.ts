/**
 * A single semantic color role. Components reference these keys, never raw hex values.
 * The theme system (Phase 3) provides concrete values via CSS variables.
 */
export interface ColorRole {
  /** Base color (used by `solid` variants as background, by `outline`/`ghost` as foreground). */
  main: string;
  /** Foreground color that goes on top of `main` (text / icon color for solid surfaces). */
  contrast: string;
  /** Hover-state variant of `main`. */
  hover: string;
  /** Pressed/active-state variant of `main`. */
  active: string;
  /** Tinted background used by ghost/outline variants on hover. */
  subtle: string;
  /** Border color paired with this role. */
  border: string;
}

/** Surfaces (page-level backgrounds, paper cards, subtle wells). */
export interface SurfaceColors {
  default: string;
  paper: string;
  subtle: string;
}

/** Foreground text/icon colors. */
export interface ForegroundColors {
  default: string;
  muted: string;
  subtle: string;
}

/** Border colors. */
export interface BorderColors {
  default: string;
  subtle: string;
  strong: string;
}

/**
 * A complete palette — one of these per theme mode (light / dark).
 * Component recipes reference paths like `palette.primary.main` regardless of mode.
 */
export interface PaletteShape {
  primary: ColorRole;
  secondary: ColorRole;
  success: ColorRole;
  warning: ColorRole;
  danger: ColorRole;
  info: ColorRole;
  neutral: ColorRole;
  background: SurfaceColors;
  foreground: ForegroundColors;
  border: BorderColors;
  overlay: string;
  focusRing: string;
}

/**
 * Color role names exposed by the default palette. Adding a new role expands this union.
 * Component variants use this as the type for their `color` prop.
 */
export type ColorRoleName =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
