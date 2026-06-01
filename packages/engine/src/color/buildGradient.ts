import type { ColorRoleName } from '../types/color';

/**
 * Theme-derived gradient generator. Builds a CSS `background-image` value entirely from
 * `--sds-palette-{role}-{slot}` CSS variables — so the gradient automatically re-tints when
 * the theme switches mode (light / dark), variant (Katana / Tetsu / Origami / …), or runtime
 * palette override (Theme Studio overrides, per-tenant brand swaps, etc.).
 *
 * Used by `<SplashScreen variant="gradient">` and any future component that needs a brand-led
 * animated surface. Centralizing the derivation here means:
 *
 *  - Components don't carry their own per-role lookup tables (no copy-paste of seven gradient
 *    strings every time a new component needs one).
 *  - The gradient *shape* — stops, angle, direction — is consistent across the DS.
 *  - The palette tokens stay the single source of truth: change `theme.palette.primary.main`
 *    in the Studio and every gradient picks it up on the next paint.
 *
 * The function is **pure** and **CSS-only**. No `Color` class, no runtime parsing, no
 * `document.querySelector` reads. That's deliberate: the output is suitable for SSR + Edge
 * runtimes, and the browser does the actual hue blending at paint time via CSS variable
 * resolution.
 *
 * @example
 *   buildPaletteGradient('primary')
 *   // → "linear-gradient(135deg, var(--sds-palette-primary-subtle) 0%,
 *   //                          var(--sds-palette-primary-main)   50%,
 *   //                          var(--sds-palette-primary-subtle) 100%)"
 *
 *   buildPaletteGradient('info', { angle: 90, stops: ['hover', 'main', 'active'] })
 *   // → "linear-gradient(90deg, var(--sds-palette-info-hover) 0%,
 *   //                         var(--sds-palette-info-main)  50%,
 *   //                         var(--sds-palette-info-active) 100%)"
 */

/**
 * The token slots on a `ColorRole` that can be referenced as a gradient stop. Mirrors
 * `ColorRole` from `types/color.ts` minus `contrast` (which is intended for *foreground* use
 * on top of a colored surface, not as a gradient stop itself).
 */
export type PaletteRoleStop = 'main' | 'hover' | 'active' | 'subtle' | 'border';

/**
 * Optional shape: which CSS gradient kind to emit. `linear` is the default (the existing
 * SplashScreen behavior); `radial` and `conic` are escape hatches for components that want
 * a more dramatic brand moment without rolling their own CSS.
 */
export type PaletteGradientKind = 'linear' | 'radial' | 'conic';

export interface BuildPaletteGradientOptions {
  /**
   * Stops to interpolate, in render order. Defaults to `['subtle', 'main', 'subtle']` —
   * a high-contrast peak in the middle with softer flanks, which animates nicely with
   * `background-size: 200% 200%` + the `splash-gradient-shift` keyframe.
   *
   * Pass 2 stops for a clean fade, 3+ for richer transitions. Stop positions are computed
   * automatically as equally-spaced percentages (0%, 50%, 100% for three stops, etc.).
   */
  stops?: readonly PaletteRoleStop[] | undefined;
  /**
   * Gradient angle in degrees (linear only). Defaults to `135` — diagonal top-left to
   * bottom-right, which reads as "morning light" in most western interfaces and is the
   * standard for splash/hero surfaces across the DS.
   */
  angle?: number | undefined;
  /** Gradient kind. Defaults to `'linear'`. */
  kind?: PaletteGradientKind | undefined;
  /**
   * CSS variable name prefix. Defaults to `'--sds-palette'` — the prefix used by
   * `themeToCssVars` in `@apx-ui/theme`. Override only if you're running the DS under a
   * non-default `tokenPrefix` configuration.
   */
  varPrefix?: string | undefined;
}

const DEFAULT_STOPS: readonly PaletteRoleStop[] = ['subtle', 'main', 'subtle'];
const DEFAULT_ANGLE = 135;
const DEFAULT_KIND: PaletteGradientKind = 'linear';
const DEFAULT_VAR_PREFIX = '--sds-palette';

/**
 * Compose a `var(--{prefix}-{role}-{slot})` reference. Centralized so changes to the token
 * naming convention only need to be made here (and in `@apx-ui/theme/themeToCssVars`).
 */
function tokenVar(prefix: string, role: ColorRoleName, slot: PaletteRoleStop): string {
  return `var(${prefix}-${role}-${slot})`;
}

/**
 * Generate a CSS gradient string from a semantic color role. The output references theme
 * CSS variables exclusively — no concrete colors are baked in — so the gradient adapts at
 * paint time to whatever the active theme + mode resolves the variables to.
 */
export function buildPaletteGradient(
  role: ColorRoleName,
  options: BuildPaletteGradientOptions = {},
): string {
  const stops = options.stops ?? DEFAULT_STOPS;
  const angle = options.angle ?? DEFAULT_ANGLE;
  const kind = options.kind ?? DEFAULT_KIND;
  const varPrefix = options.varPrefix ?? DEFAULT_VAR_PREFIX;

  // Build "var(--sds-palette-primary-subtle) 0%, var(--sds-palette-primary-main) 50%, …".
  // Single-stop edge case: emit the same color at 0% + 100% so any background-size animation
  // still has something to scroll across (a single `var(...)` is a flat fill, not a gradient).
  const renderedStops =
    stops.length === 1
      ? `${tokenVar(varPrefix, role, stops[0]!)} 0%, ${tokenVar(varPrefix, role, stops[0]!)} 100%`
      : stops
          .map((slot, i) => {
            const pct = Math.round((i / (stops.length - 1)) * 100);
            return `${tokenVar(varPrefix, role, slot)} ${pct}%`;
          })
          .join(', ');

  switch (kind) {
    case 'radial':
      // Off-center radial gives a "morning sun" feel — the peak slot reads as the light
      // source, the bookend slots fade to the canvas edges.
      return `radial-gradient(circle at 30% 30%, ${renderedStops})`;
    case 'conic':
      return `conic-gradient(from ${angle}deg, ${renderedStops})`;
    case 'linear':
    default:
      return `linear-gradient(${angle}deg, ${renderedStops})`;
  }
}

/**
 * Pre-computed gradient strings for every palette role at the default settings. Useful for
 * static lookup tables (component recipes, snapshot tests) where you want a `Record<role,
 * string>` map without iterating on every render.
 *
 * The map is built once at module load. Because the values are pure CSS-var references and
 * not concrete colors, the snapshot doesn't go stale when the theme changes — variables
 * resolve at paint time.
 */
export const PALETTE_GRADIENTS: Readonly<Record<ColorRoleName, string>> = Object.freeze({
  primary: buildPaletteGradient('primary'),
  secondary: buildPaletteGradient('secondary'),
  success: buildPaletteGradient('success'),
  warning: buildPaletteGradient('warning'),
  danger: buildPaletteGradient('danger'),
  info: buildPaletteGradient('info'),
  neutral: buildPaletteGradient('neutral'),
});