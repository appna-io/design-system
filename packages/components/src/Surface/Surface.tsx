'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { createElement } from 'react';

import { surfaceRecipe } from './Surface.recipe';
import { invertedPaletteVars, surfaceCaptureVars } from './Surface.tone';
import type { SurfaceProps } from './Surface.types';

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
 * **Composes with a scoped theme.** The inverted values are `color-mix`es of the *inherited*
 * palette, never hard-coded colours, so a `<Surface tone="inverted">` inside a branded
 * `<ThemeProvider scope>` inverts that brand, not the DS default.
 *
 * **Nests.** Two inversions cancel: the inner Surface captures the outer's already-inverted
 * palette and swaps it back, so a light card inside a dark band works without special-casing.
 */
export const Surface = forwardRef<HTMLElement, SurfaceProps>(function Surface(props, ref) {
  const { tone = 'default', as, className, style, sx, children, ...rest } = props;

  const { className: recipeCls, style: recipeStyle } = useThemedClasses({
    recipe: surfaceRecipe,
    componentName: 'Surface',
    props: { tone, className, sx, style },
  });

  const element = createElement(
    as ?? 'div',
    {
      ref,
      className: recipeCls,
      // Order matters: the inverted palette first, then the recipe's own resolved style (which
      // carries `sx` and the consumer's `style`), so a caller can still override a single token.
      style:
        tone === 'inverted'
          ? { ...invertedPaletteVars, ...(recipeStyle ?? {}) }
          : (recipeStyle ?? undefined),
      ...rest,
    },
    children,
  );

  // `default` needs no capture — nothing is being swapped, so there is no cycle to break and no
  // reason to add an element to the consumer's tree.
  if (tone !== 'inverted') return element;

  // The capture element freezes the *outer* palette under private names. It has to be a separate
  // element: assigning `--background: var(--foreground)` and the reverse on one element is a
  // custom-property cycle, which CSS resolves by throwing both away. `display: contents` keeps it
  // out of layout, so dropping a Surface into a flex or grid parent doesn't add a box.
  return createElement(
    'div',
    { style: { display: 'contents', ...surfaceCaptureVars } },
    element,
  );
}, 'Surface');
