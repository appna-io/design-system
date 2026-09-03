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
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
  },
};