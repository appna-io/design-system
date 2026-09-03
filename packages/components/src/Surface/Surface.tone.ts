import type { CSSProperties } from 'react';

/**
 * The CSS-variable maps behind `<Surface>`. Kept out of the component because they're pure and
 * worth reading (and testing) on their own — same split as `Drawer.motion.ts` / `Drawer.side.ts`.
 *
 * ## Why two elements
 *
 * An inverted surface swaps the background and foreground tokens. You cannot do that on a single
 * element: `--sds-palette-background-default: var(--sds-palette-foreground-default)` alongside
 * `--sds-palette-foreground-default: var(--sds-palette-background-default)` is a custom-property
 * **cycle**, and a cycle makes every property in it invalid at computed-value time — so the
 * surface would silently render unstyled. Renaming through temporaries doesn't help; the cycle
 * just gets longer.
 *
 * So `<Surface>` renders a `display: contents` capture element that copies the *inherited*
 * palette into two private vars, and the real element reads those. The child's declarations can
 * reference the parent's values freely because inheritance is resolved before the child's own
 * declarations apply. No cycle, no JavaScript, no `getComputedStyle`, SSR-safe.
 *
 * ## What inverts, and what deliberately doesn't
 *
 * Inverted: `background-*`, `foreground-*`, `border-*` — the surface tokens. Plus the **neutral**
 * role, because neutral is the DS's greyscale/chrome role rather than a brand colour: neutral
 * text on a dark ground has to be light, and `<Button color="neutral">` becomes the light button
 * with dark text that a dark band actually wants.
 *
 * Not inverted: `primary` / `secondary` / `success` / `warning` / `danger` / `info`. A brand or
 * status colour has to stay recognisable — a danger button that turns pale on a dark band is a
 * bug, not a feature. Their `contrast` slots are already authored to sit on their own fill, so
 * they keep working unchanged.
 *
 * `--sds-focus-ring` is re-pointed at the new ink: the default ring is tuned for a light ground
 * and can disappear against a dark one, which would be an accessibility regression handed out by
 * a styling feature.
 */

/** Private vars holding the *outer* palette, so the inverted map can reference it without a cycle. */
const INK = '--sds-surface-ink';
const PAPER = '--sds-surface-paper';

/** `color-mix` between the captured pair. `amount` is how much of `from` to keep. */
function blend(from: string, amount: number, towards: string): string {
  return `color-mix(in srgb, var(${from}) ${amount}%, var(${towards}))`;
}

/**
 * Vars set on the capture element: the current (outer) ground and text, frozen under private
 * names. `ink` is the outer foreground — it becomes the inverted surface's background.
 */
export const surfaceCaptureVars: CSSProperties = {
  [INK]: 'var(--sds-palette-foreground-default)',
  [PAPER]: 'var(--sds-palette-background-default)',
} as CSSProperties;

/**
 * The inverted palette, written in terms of the captured pair only — so it composes with any
 * theme, including a brand palette applied by a scoped `<ThemeProvider>` further up.
 */
export const invertedPaletteVars: CSSProperties = {
  // Surfaces: the outer ink becomes the ground.
  '--sds-palette-background-default': `var(${INK})`,
  '--sds-palette-background-paper': `var(${INK})`,
  '--sds-palette-background-subtle': blend(INK, 88, PAPER),

  // Text: the outer paper becomes the ink, with the muted/subtle steps fading toward the ground.
  '--sds-palette-foreground-default': `var(${PAPER})`,
  '--sds-palette-foreground-muted': blend(PAPER, 70, INK),
  '--sds-palette-foreground-subtle': blend(PAPER, 50, INK),

  // Borders: hairlines lifted off the new ground rather than dropped onto it.
  '--sds-palette-border-subtle': blend(INK, 82, PAPER),
  '--sds-palette-border-default': blend(INK, 70, PAPER),
  '--sds-palette-border-strong': blend(INK, 55, PAPER),

  // Neutral is the surface role, so it inverts with the surface. This is what makes
  // `<Button color="neutral">` a light button with dark text inside a dark band.
  '--sds-palette-neutral-main': `var(${PAPER})`,
  '--sds-palette-neutral-contrast': `var(${INK})`,
  '--sds-palette-neutral-hover': blend(PAPER, 88, INK),
  '--sds-palette-neutral-active': blend(PAPER, 78, INK),
  '--sds-palette-neutral-subtle': blend(INK, 82, PAPER),
  '--sds-palette-neutral-border': blend(INK, 60, PAPER),

  // The default ring is tuned for a light ground and can vanish on a dark one.
  '--sds-focus-ring': `var(${PAPER})`,
} as CSSProperties;
