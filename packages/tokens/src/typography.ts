import type { TypographyShape } from '@apx-ui/engine';

export const typography: TypographyShape = {
  fontFamily: {
    sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    // `display` is deliberately LEFT UNSET here. Consumers get the fallback baked into the var
    // reference — `var(--sds-font-display, var(--sds-font-sans))` — which resolves to whatever
    // `--sds-font-sans` is *at that point in the cascade*. Hard-coding a copy of the sans stack
    // instead would freeze headings to the generic stack and desync them from the `default`
    // variant's Apple platform overlay, which overrides `sans` to the SF stack but would have no
    // reason to know about `display`. Unset means "track the body face"; set means "pair a face".
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',

    /**
     * Fluid marketing display steps. These are the sizes a landing-page headline actually wants,
     * and they are the reason two templates had already hand-rolled their own before this existed
     * (`cadence-ops` stepped `text-4xl sm:text-5xl lg:text-6xl`; `northbound` wrote a raw
     * `clamp()`).
     *
     * ## Why fluid rather than more breakpoint steps
     *
     * A breakpoint-stepped headline snaps: at 1023px it is one size and at 1024px it is another,
     * and every width in between is the wrong size for its measure. At body-copy scale nobody
     * notices; at 80px the jump is a third of a line height. `clamp()` gives every viewport the
     * size that fits it.
     *
     * ## Why `vw + rem` and not bare `vw`
     *
     * The preferred term deliberately adds a `rem` component instead of being pure viewport
     * units. A bare `vw` font size does not respond to the user's browser font-size setting at
     * all, so a headline sized `14vw` stays exactly as big when someone sets their default text
     * to 200% — which fails WCAG 1.4.4 (Resize Text) for the largest, most-read element on the
     * page. Mixing in `rem` keeps the type responsive to the viewport *and* to the reader.
     *
     * Floors are the mobile size; caps are reached around 1000–1150px, so the headline stops
     * growing before it outruns its measure on a wide desktop.
     */
    /**
     * The quiet section heading. Two templates independently hand-wrote
     * `text-3xl sm:text-4xl lg:text-[2.75rem]` — 30 → 36 → 44px — because the fixed scale jumps
     * 2.25rem straight to 3rem and `display-lg` starts at 2.5rem, which is a *hero* size on a page
     * whose register is quiet. That gap is why both kept a hand-written `SectionHeading`.
     *
     * This is that ladder made continuous: same floor, same cap, no breakpoint snap.
     */
    'display-md': 'clamp(1.875rem, 3vw + 1rem, 2.75rem)',
    'display-lg': 'clamp(2.5rem, 5vw + 1rem, 4rem)',
    'display-xl': 'clamp(3rem, 7vw + 1rem, 5.5rem)',
    'display-2xl': 'clamp(3.5rem, 9vw + 1rem, 7.5rem)',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },
  letterSpacing: {
    /**
     * Display tracking. `tight` (-0.025em) is tuned for 16–24px text; at marketing headline sizes
     * (48px+) the same value leaves the counters looking loose, because optical letter-spacing
     * needs to *shrink* as the type grows. -0.04em is the setting for the display steps.
     */
    tighter: '-0.04em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
  },
};