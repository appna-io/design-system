'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { createElement } from 'react';

import { surfaceRecipe } from './Surface.recipe';
import { surfaceCaptureVars, toneNeedsCapture, tonePaletteVars } from './Surface.tone';
import type { SurfaceProps } from './Surface.types';

import { SurfaceToneContext } from './SurfaceToneContext';

/**
 * `<Surface>` — a region that establishes its own ground.
 *
 * The DS had no way to say "this band is dark". Every component reads `text-fg` / `bg-bg*` /
 * `border-*`, which all assume a light ground, so a dark section meant hand-written token values
 * at each call site: near-black body copy invisible on the band, an `<Input>` with no readable
 * variant, no way to ask for a light button. Surface fixes it once, at the token layer, instead
 * of growing an `onDark` axis on every component that might ever sit on a dark band.
 *
 * ```tsx
 * <Surface as="section" tone="inverted" className="py-20">
 *   <Typography variant="h2">Join the list</Typography>
 *   <Input placeholder="you@example.com" />
 *   <Button color="neutral">Subscribe</Button>
 * </Surface>
 * ```
 *
 * Nothing inside opts in. The heading, the field and the button all read the same tokens they
 * always do — those tokens now resolve to the inverted palette.
 *
 * **Brand bands too.** `tone="primary"` (or `"secondary"`) fills the region with that role and
 * re-points the surface tokens at it, so the ink is the role's authored `contrast` colour. The
 * same `<Button color="neutral">` is now the light button with brand-coloured text that a CTA band
 * wants. Before this existed, every template hand-wrote `var(--sds-palette-primary-contrast)` in
 * an inline `style` to get that button and its matching chip.
 *
 * ```tsx
 * <Surface as="section" tone="primary" className="py-28">
 *   <Typography variant="h2">Ready when you are</Typography>
 *   <Button color="neutral">Start free</Button>
 * </Surface>
 * ```
 *
 * **Composes with a scoped theme.** The inverted values are `color-mix`es of the *inherited*
 * palette, never hard-coded colours, so a `<Surface tone="inverted">` inside a branded
 * `<ThemeProvider scope>` inverts that brand, not the DS default. The brand tones read the scoped
 * `primary` / `secondary` roles for the same reason.
 *
 * **Nests.** Two inversions cancel: the inner Surface captures the outer's already-inverted
 * palette and swaps it back, so a light card inside a dark band works without special-casing. The
 * same mechanism gives you a light card inside a *brand* band — nest `tone="inverted"` in a
 * `tone="primary"` and it captures the band's current ink (the contrast colour) and ground (the
 * fill) and swaps them.
 */
export const Surface = forwardRef<HTMLElement, SurfaceProps>(function Surface(props, ref) {
  const { tone = 'default', as, className, style, sx, colorScheme, children, ...rest } = props;

  const { className: recipeCls, style: recipeStyle } = useThemedClasses({
    recipe: surfaceRecipe,
    componentName: 'Surface',
    props: { tone, className, sx, style },
  });

  const palette = tonePaletteVars[tone];

  const element = createElement(
    as ?? 'div',
    {
      ref,
      className: recipeCls,
      // Order matters: the tone's palette first, then the recipe's own resolved style (which
      // carries `sx` and the consumer's `style`), so a caller can still override a single token.
      // `colorScheme` goes last because it is an explicit override of what the recipe class says.
      style:
        palette || colorScheme
          ? { ...palette, ...(recipeStyle ?? {}), ...(colorScheme ? { colorScheme } : null) }
          : (recipeStyle ?? undefined),
      ...rest,
    },
    children,
  );

  // Only `inverted` needs the capture element — it is the only tone whose map references the two
  // roles it also redefines. The brand tones point at `palette.<role>.*`, which they never write,
  // so there is no cycle to break and no reason to add an element to the consumer's tree.
  // Descendants that must choose *between* palette roles — rather than read one the tone has
  // already remapped — need to know the ground they are on. See `SurfaceToneContext`.
  const scoped = createElement(SurfaceToneContext.Provider, { value: tone }, element);

  if (!toneNeedsCapture(tone)) return scoped;

  // The capture element freezes the *outer* palette under private names. It has to be a separate
  // element: assigning `--background: var(--foreground)` and the reverse on one element is a
  // custom-property cycle, which CSS resolves by throwing both away. `display: contents` keeps it
  // out of layout, so dropping a Surface into a flex or grid parent doesn't add a box.
  return createElement('div', { style: { display: 'contents', ...surfaceCaptureVars } }, scoped);
}, 'Surface');
