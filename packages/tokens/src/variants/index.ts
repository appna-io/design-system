import { defaultVariant } from './default';
import { katanaVariant } from './katana';
import { origamiVariant } from './origami';
import { tetsuVariant } from './tetsu';
import type { ThemeVariantDefinition } from './types';

export { defaultVariant, katanaVariant, origamiVariant, tetsuVariant };
export type { ThemePlatform, ThemeVariantDefinition, ThemeVariantOverrides } from './types';

/**
 * Map of built-in theme variants keyed by name. Adding a new variant is a one-file change here:
 * create `variants/<name>.ts`, then add it to this map.
 *
 * The headline pick is **`default`** — adaptive: it ships a Cupertino-leaning overlay that
 * activates on Safari via `data-platform='apple'`, and falls back to the apx-base look on
 * every other browser. **`katana`** ships diagonal-corner radii (`8px 0px`) for a single-stroke
 * blade identity.
 */
export const themeVariants: Record<string, ThemeVariantDefinition> = {
  default: defaultVariant,
  tetsu: tetsuVariant,
  origami: origamiVariant,
  katana: katanaVariant,
};

/** Lookup helper that returns the default variant for unknown names (instead of `undefined`). */
export function getThemeVariant(name: string): ThemeVariantDefinition {
  return themeVariants[name] ?? defaultVariant;
}
