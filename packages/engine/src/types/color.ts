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
  /** Decorative outline — a card edge, a panel divider. No contrast minimum. */
  default: string;
  /** The faintest hairline. Decorative only. */
  subtle: string;
  /** An emphasised decorative boundary. */
  strong: string;
  /**
   * The edge of an **interactive control** — input, select, checkbox, textarea.
   *
   * A separate role because this one is a non-text UI component under WCAG 1.4.11 and must clear
   * 3:1 against its background, while a card outline has no minimum and looks wrong if held to
   * one. They were the same role, so `default` was simultaneously too light to see a field by and
   * as dark as a card could take.
   */
  control: string;
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