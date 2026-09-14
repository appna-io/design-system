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
  //
  // `default` and `strong` are the borders that carry *meaning* — an `<Input>`'s edge, an outline
  // button's ring — so WCAG 1.4.11 asks 3:1 of them against their own ground. Measured across
  // five real page inks plus both DS themes, the original 70/55 landed at 2.50–2.70 and 4.08–4.49:
  // `default` failed everywhere. 55/40 clears 3:1 on all of them, worst case 3.14 (the DS dark
  // theme, where an inverted band is a *light* band and has the least headroom).
  //
  // `subtle` stays at 82 and is deliberately below 3:1. It is a decorative hairline — a section
  // divider, a card edge — and 1.4.11 does not apply to it. Pushing it to 3:1 would make every
  // divider on a dark band read as a rule.
  '--sds-palette-border-subtle': blend(INK, 82, PAPER),
  '--sds-palette-border-default': blend(INK, 55, PAPER),
  '--sds-palette-border-strong': blend(INK, 40, PAPER),

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

/* ------------------------------------------------------------------------------------------- *
 * Brand tones
 * ------------------------------------------------------------------------------------------- */

/**
 * The *other* kind of band: a section filled with a brand role rather than with the page's own
 * ink. A CTA band, a newsletter strip, a pricing highlight.
 *
 * `inverted` deliberately leaves the brand roles alone, so it has no answer for this — which is
 * why all three shipped templates hand-wrote `var(--sds-palette-primary-contrast)` at the call
 * site to get a chip and a button that read on a violet ground. This is that, done once at the
 * token layer.
 *
 * ## Why these need no capture element
 *
 * The inverted map has to swap `background` and `foreground` with each other, which is a custom-
 * property cycle unless the outer pair is frozen first — hence `surfaceCaptureVars` and the
 * `display: contents` wrapper. A brand tone has no such swap: it points the surface roles *at*
 * `palette.<role>.main` / `.contrast`, and it never writes to the brand role itself. Nothing
 * references anything that is being redefined, so there is no cycle and no wrapper element.
 *
 * ## Nesting falls out for free
 *
 * `<Surface tone="inverted">` inside a brand band captures the band's *current* ink and paper —
 * which are now `contrast` and `main` — and swaps them. So an inverted surface inside a violet
 * band renders white-ground / violet-ink: the light card on a brand band, with no new tone.
 *
 * ## There is no muted step on a brand fill, and that is the correct answer
 *
 * A brand fill is a mid-tone; the page ink that `inverted` grounds on is near-black. That is not a
 * small difference — it is the entire contrast budget. Measured across the six brand fills the
 * three shipped templates actually use, plus the DS defaults:
 *
 * ```
 * fill                          full ink   @90%   @85%   @80%
 * cadence  primary   #5B3DF5      6.12     5.28   4.86   4.47
 * cadence  secondary #06B6A4      6.51     5.50   5.03   4.58
 * fade     secondary #B8863A      5.50     4.84   4.52   4.14
 * lyli     secondary #8B5E3C      5.29     4.65   4.34   4.03
 * northbound secondary #FF5A1F    6.13     5.46   5.08   4.66
 * DS default primary #4f46e5      6.29     5.39   5.00   4.63
 * ```
 *
 * **~6:1 at full ink is the whole budget.** `inverted` grounds on near-black and starts from ~16:1,
 * which is why it can afford a 70/50 hierarchy. Any single constant that gives `inverted` a real
 * muted step puts a brand band under 4.5:1 — and it looks fine while it does, because the band is
 * pretty. This shipped at 80/65 and failed 4.5:1 on three of the six.
 *
 * So both steps sit at 90%, which passes on every fill above and is *barely distinguishable from
 * full ink*. That is not a limitation to design around; it is the finding. On a saturated brand
 * band the readable design has no muted hierarchy, and a template that wants one needs a darker
 * `main` — a palette decision for the template author, not something a blend can paper over.
 *
 * `foreground-subtle` therefore resolves to the same value as `foreground-muted`. Two names, one
 * value, on purpose: the API keeps working for a template that asks for either, and neither can
 * quietly drop below the line. Templates were making the same judgement by hand with `opacity-80`
 * — and `opacity-80` is exactly the value that fails.
 *
 * ## Borders are measured separately
 *
 * They have a different threshold (WCAG 1.4.11's 3:1 for a UI boundary, not 4.5:1) and a different
 * direction — a border blends *toward* the ink from the fill. Running them through the foreground
 * numbers put `border-default` at 1.65–1.85 on every saturated fill. See below.
 */
function brandPaletteVars(role: 'primary' | 'secondary'): CSSProperties {
  const FILL = `--sds-palette-${role}-main`;
  const ON = `--sds-palette-${role}-contrast`;

  return {
    // Surfaces: the brand fill is the ground.
    '--sds-palette-background-default': `var(${FILL})`,
    '--sds-palette-background-paper': `var(${FILL})`,
    '--sds-palette-background-subtle': blend(FILL, 88, ON),

    // Text: the role's authored contrast colour is the ink. Both softened steps sit at 90% and
    // resolve to the same value — see the measurement above. This is the one place a brand tone
    // deliberately gives up a token distinction rather than ship one that fails.
    '--sds-palette-foreground-default': `var(${ON})`,
    '--sds-palette-foreground-muted': blend(ON, 90, FILL),
    '--sds-palette-foreground-subtle': blend(ON, 90, FILL),

    // Borders: blended toward the ink, not away from it, and measured against 1.4.11's 3:1 rather
    // than 4.5:1. At the foreground-shaped 82/70/55 the meaningful borders landed at 1.65–2.39 on
    // every saturated fill — an outline button with a boundary you cannot see. 30/15 clears 3:1
    // across all six real fills plus both DS defaults (worst case 3.46). `subtle` stays a
    // decorative hairline, where 1.4.11 does not apply.
    '--sds-palette-border-subtle': blend(FILL, 70, ON),
    '--sds-palette-border-default': blend(FILL, 30, ON),
    '--sds-palette-border-strong': blend(FILL, 15, ON),

    // Neutral is the surface role, so it follows the surface. This is the whole point: it makes
    // `<Button color="neutral">` the light button with brand-coloured text that a CTA band wants,
    // and `<Badge variant="outline" color="neutral">` the outlined chip — both of which every
    // template was previously writing as an inline `style` reaching for the raw token.
    '--sds-palette-neutral-main': `var(${ON})`,
    '--sds-palette-neutral-contrast': `var(${FILL})`,
    '--sds-palette-neutral-hover': blend(ON, 88, FILL),
    '--sds-palette-neutral-active': blend(ON, 78, FILL),
    '--sds-palette-neutral-subtle': blend(FILL, 82, ON),
    '--sds-palette-neutral-border': blend(FILL, 60, ON),

    // The default ring is the primary colour, which vanishes on a primary fill.
    '--sds-focus-ring': `var(${ON})`,
  } as CSSProperties;
}

/** The brand fill for `tone="primary"`. */
export const primaryPaletteVars: CSSProperties = brandPaletteVars('primary');

/** The brand fill for `tone="secondary"`. */
export const secondaryPaletteVars: CSSProperties = brandPaletteVars('secondary');

/**
 * The palette map each tone applies, or `undefined` for `default` (which swaps nothing).
 *
 * Keyed lookup rather than a chain of `if`s in the component, so adding a tone is a change in one
 * place and `Surface.tsx` stays a rendering concern.
 */
export const tonePaletteVars = {
  default: undefined,
  inverted: invertedPaletteVars,
  primary: primaryPaletteVars,
  secondary: secondaryPaletteVars,
} as const satisfies Record<string, CSSProperties | undefined>;

/**
 * Tones whose ground is *not* the ambient one, and which therefore need the capture element and
 * a `color-scheme` declaration. `default` is the only tone that changes nothing.
 */
export function toneChangesGround(tone: string): boolean {
  return tone !== 'default';
}

/**
 * Whether a tone needs the `display: contents` capture wrapper.
 *
 * Only `inverted` does: it is the only map that references the two roles it also redefines. The
 * brand tones read `palette.<role>.*`, which they never write, so wrapping them would add a DOM
 * node for nothing.
 */
export function toneNeedsCapture(tone: string): boolean {
  return tone === 'inverted';
}
