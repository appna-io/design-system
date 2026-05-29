import type { ThemeShape } from '@apx-ui/engine';
import { defaultTheme, getThemeVariant } from '@apx-ui/tokens';
import { mergeTheme, type ThemeOverride } from './mergeTheme';

/**
 * Build a fully-typed `Theme` by deep-merging consumer overrides onto `defaultTheme`. The active
 * theme `variant` (if specified in the override) is applied last, so variant-level token tweaks
 * (e.g. rounded radii) win over the base scale but lose to direct overrides.
 *
 * @example
 *   const theme = defineTheme({
 *     variant: 'origami',
 *     palette: { light: { primary: { main: '#4f46e5' } } },
 *   });
 */
export function defineTheme(override?: ThemeOverride): ThemeShape {
  const baseMerged = mergeTheme(defaultTheme, override);
  const variantName = baseMerged.variant ?? 'default';
  const variant = getThemeVariant(variantName);
  return mergeTheme(baseMerged, variant.tokens as ThemeOverride);
}
