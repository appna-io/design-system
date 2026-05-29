import type { ThemeShape } from '@apx-ui/engine';

/**
 * Local deep-partial used so a variant can override a single nested token (e.g.
 * `typography.fontFamily.sans`) without restating the full sub-shape. Mirrors the shape used
 * by `mergeTheme`'s `DeepPartial`, kept local here to avoid a dependency on `@apx-ui/theme`.
 */
type VariantDeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<VariantDeepPartial<U>>
    : T extends object
      ? { [K in keyof T]?: VariantDeepPartial<T[K]> }
      : T;

/**
 * A theme variant is a *deep-partial* `ThemeShape` that overrides specific tokens (radii,
 * shadows, typography, etc.) on top of the base theme. Variants never override `palette` or
 * `dir` or `mode` — those are separate axes.
 */
export type ThemeVariantOverrides = VariantDeepPartial<
  Omit<ThemeShape, 'palette' | 'mode' | 'dir' | 'variant' | 'name' | 'components'>
>;

/**
 * Platform identifier resolved at runtime and written to `<html data-platform="…">`.
 *
 * - `apple` — Safari on macOS / iOS / iPadOS (detected via vendor + UA).
 * - `other` — everything else (Chrome, Firefox, Edge, Opera, embedded WebViews, …).
 *
 * Variants may opt into a platform-scoped overlay via `platformOverrides`; when omitted, the
 * variant renders identically on every platform.
 */
export type ThemePlatform = 'apple' | 'other';

export interface ThemeVariantDefinition {
  /** Identifier used at runtime (`<html data-variant="origami">`). */
  name: string;
  /** Token overrides applied on top of the base theme when this variant is active. */
  tokens: ThemeVariantOverrides;
  /**
   * Optional per-platform overlays applied on top of `tokens` when both `data-variant` and
   * `data-platform` match. Used by the adaptive `default` variant to render a Cupertino-leaning
   * sub-look on Safari while leaving everything else untouched.
   *
   * Designed as a single uniform shape so `themeToCssVars()` can iterate over every variant
   * without special-casing `default`.
   */
  platformOverrides?: Partial<Record<ThemePlatform, ThemeVariantOverrides>>;
}
