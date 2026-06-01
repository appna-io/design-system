# Phase 60 — `<Typography />` + `<Text />` Text Primitive

> Status: **Shipped** · **Tier 1** · Depends on: Phase 59 (`<Div />`) · Blocks: nothing
> The DS's canonical text primitive — a `Div`-on-top-of-a-`Div` for text. Variant-driven (h1…h6, body, caption, code, …), token-aware shorthand props for the typography surface (`fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `fontFamily`, `weight`, `italic`, `align`, `transform`, `decoration`, `truncate`, `lineClamp`), and everything `<Div />` already gives you (CSS shorthand, pseudo-state hooks, polymorphism, animation, responsive show/hide).

## Objective

Replace 90% of the `<h1 className="text-3xl font-semibold tracking-tight">…</h1>` /
`<p className="text-sm text-fg-muted">…</p>` patterns scattered across product code with a single
typed primitive that:

- Picks the right element semantically (`variant="h2"` → `<h2>`, `variant="body"` → `<p>`).
- Carries a token-aware shorthand prop surface for the typography axes.
- Inherits the entire `<Div />` styling surface (margin/padding/color/border/pseudo hooks/animation).

## Locked design decisions

| Decision | Why |
| --- | --- |
| **Primary name `Typography`, plus a `Text` alias** | `Typography` is the MUI / Material vocabulary the broader community uses; `Text` is the shorter Chakra / Mantine name. Ship both because each reads better in different call sites. |
| **Compose over inherit** — `Typography` wraps `<Div />` internally | `Div` already owns ~80 CSS shorthand props, pseudo hooks, `actLike`, `asChild`, `hideOn`, `displayOn`, `animation`, `centered`, HTML pass-through. Re-deriving any of that in Typography would duplicate ~150 LoC. Typography adds **only** what's text-specific: variant recipe, variant → element mapping, typography-token resolution for the 5 type-specific props, and the 7 text-friendly shortcuts. |
| **13 focused variants** | `display`, `h1`–`h6`, `body`, `bodyLarge`, `bodySmall`, `caption`, `overline`, `code`. Covers the product UI surface without MUI's 15+ variant sprawl (no `button` variant, no `subtitle1`/`subtitle2` overlap with body). |
| **Variant auto-picks the element** | `h1` → `<h1>`, `body` → `<p>`, `caption` → `<span>`, `code` → `<code>`, etc. Consumers override with `as` / `actLike` when the semantic needs to differ from the visual. |
| **Variant emits Tailwind classes** (via `cv()`) | Bundle-friendly, JIT-discoverable, matches every other DS component recipe. The shorthand prop overrides still use inline style via the same path Div uses. |
| **Typography-token resolution local to Typography** | `fontSize="lg"` → `var(--sds-font-size-lg)` (the var the existing `themeToCssVars` already emits). Not promoted into `sxToStyle` globally for v1 — keeps the engine change small. Raw CSS values (`fontSize={14}`, `fontSize="14px"`) bypass the token table and pass through. |
| **`Text` is just `export const Text = Typography`** | Same component, no second implementation, no second test surface. |

## Why the existing patterns fit

- The `--sds-font-size-*`, `--sds-font-weight-*`, `--sds-line-height-*`, `--sds-letter-spacing-*`, `--sds-font-sans` / `--sds-font-mono` CSS vars **already exist** — emitted by [packages/theme/src/themeToCssVars.ts](packages/theme/src/themeToCssVars.ts) from the typography token shape. Typography just maps prop names → CSS-var names.
- `<Div />` already carries the entire layout/style surface; Typography injects a variant className + a few text-specific style keys and forwards everything else.
- `cv()` + `useThemedClasses` is the same recipe pattern Stack / Button / Card / Div use — no new engine work.
- `Text` / `Typography` slot into the existing `apx-ds` aggregator re-export with one new line each.

## File structure

```
packages/components/src/Typography/
├── Typography.tsx                  # main implementation — thin wrapper over <Div />
├── Typography.types.ts             # TypographyProps, TypographyVariant, TypographyWeight, TypographyAlign, ...
├── Typography.recipe.ts            # cv() recipe with 13 variants → Tailwind class strings
├── variantElement.ts               # VARIANT_TO_ELEMENT mapping (h1 → 'h1', body → 'p', code → 'code', ...)
├── typographyTokens.ts             # resolve(typo)Token('lg') → 'var(--sds-font-size-lg)' for the 5 type-specific props
├── index.ts                        # exports: Typography, Text, helpers + types
├── meta.ts                         # renderer discovery metadata
├── README.mdx                      # docs page
└── examples/
    ├── Basic.tsx                   # <Typography>Hello</Typography>
    ├── Variants.tsx                # the whole variant ladder side-by-side
    ├── Headings.tsx                # h1…h6 with default elements
    ├── Body.tsx                    # body / bodyLarge / bodySmall paragraphs
    ├── Code.tsx                    # variant="code" inside a sentence
    ├── Truncate.tsx                # truncate single-line ellipsis
    ├── LineClamp.tsx               # lineClamp={3} multi-line clamp
    ├── Align.tsx                   # align="center" / "right" / "justify"
    ├── Weight.tsx                  # weight="normal" / "medium" / "semibold" / "bold"
    ├── Italic.tsx                  # italic + decoration="underline"
    ├── AsAnchor.tsx                # variant="body" actLike="a" href="…"
    ├── TokenSizes.tsx              # fontSize="xs" through "5xl" — DS scale ladder
    └── Pseudo.tsx                  # onHover="text-primary-500 underline" inheriting from Div

packages/components/__tests__/
├── Typography.test.tsx
├── Typography.recipe.test.ts
├── Typography.tokens.test.ts
└── Typography.a11y.test.tsx
```

## Public API

```tsx
import { Text, Typography } from 'apx-ds';
// Variant-driven (auto-picks element)
<Typography variant="h1">Page title</Typography>          {/* <h1> */}
<Typography variant="body">Paragraph body</Typography>     {/* <p> */}
<Typography variant="caption">Caption text</Typography>    {/* <span> */}
<Typography variant="code">inline code</Typography>        {/* <code> */}

// Override the element (semantic vs visual divergence)
<Typography variant="h2" as="h1">Visually h2, semantically h1</Typography>
<Typography variant="body" actLike="a" href="/docs">Body styled link</Typography>

// Typography shorthand props (token-aware)
<Typography fontSize="2xl" weight="semibold" lineHeight="tight" letterSpacing="tight">
  Custom sized
</Typography>

// Raw CSS values bypass the token table
<Typography fontSize={14} weight={500} lineHeight={1.4}>Pixel-precise</Typography>

// Text-friendly shortcuts
<Typography truncate>Very long content that fits on a single line and...</Typography>
<Typography lineClamp={3}>Up to three lines, then ellipsis...</Typography>
<Typography align="center" italic decoration="underline">Centered italic underlined</Typography>
<Typography transform="upper" weight="bold">SHOUTY HEADER</Typography>

// Everything <Div /> already provides (inherited)
<Typography variant="body" p={4} bg="primary.50" radius="md" onHover="text-primary-500">
  Padded, themed, hover-aware body text.
</Typography>

// Text alias — identical behavior, shorter call site
<Text variant="caption" color="fg.muted">Updated 3 minutes ago</Text>
```

### Full prop form

```tsx
<Typography
  /* variant + polymorphism (inherits from Div for as/actLike/asChild) */
  variant="body"                      // 'display' | 'h1' | ... | 'h6' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'overline' | 'code'
  as={undefined}                      // override default element
  actLike={undefined}                 // alias of `as`
  asChild={false}

  /* typography token-aware shorthand */
  fontSize="base"                     // 'xs'|'sm'|'base'|'lg'|'xl'|'2xl'|'3xl'|'4xl'|'5xl' (token) | CSSProperties['fontSize']
  weight="normal"                     // 'normal'|'medium'|'semibold'|'bold' (token) | CSSProperties['fontWeight']
  fontWeight={undefined}              // canonical name — also accepted
  lineHeight="normal"                 // 'none'|'tight'|'snug'|'normal'|'relaxed' (token) | CSSProperties['lineHeight']
  letterSpacing="normal"              // 'tight'|'normal'|'wide'|'wider' (token) | CSSProperties['letterSpacing']
  fontFamily="sans"                   // 'sans'|'mono' (token) | CSSProperties['fontFamily']

  /* text shortcuts */
  italic={false}                      // shortcut for fontStyle: italic
  align={undefined}                   // 'left'|'center'|'right'|'justify' — maps to textAlign
  transform={undefined}               // 'none'|'upper'|'lower'|'capitalize' — maps to textTransform
  decoration={undefined}              // 'none'|'underline'|'line-through' — maps to textDecoration
  truncate={false}                    // overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  lineClamp={undefined}               // number — multi-line ellipsis via -webkit-line-clamp

  /* color — inherits from Div but documented separately because it's text-specific */
  color={undefined}                   // palette token ('primary.main') or CSSProperties['color']

  /* everything else inherited from <Div /> verbatim */
  // sx, style, className, ref, children, all Div CSS shorthand, all pseudo hooks,
  // centered, hideOn, displayOn, animation, HTML pass-through (id, role, aria-*, data-*, onClick, ...)
/>
```

## Variant recipe

Tailwind utility classes per variant. The class strings tap into the typography vars via the
existing `apxTailwindPreset` (no preset changes needed — Tailwind's default `text-*` ladder
covers the visual sizes; the DS overrides via `--sds-font-size-*` happen in the variant
implementation by binding to those tokens directly).

```ts
export const typographyRecipe = cv({
  base: 'min-w-0',
  variants: {
    variant: {
      display:    'text-5xl font-bold leading-tight tracking-tight',
      h1:         'text-4xl font-semibold leading-tight tracking-tight',
      h2:         'text-3xl font-semibold leading-tight tracking-tight',
      h3:         'text-2xl font-semibold leading-snug',
      h4:         'text-xl font-semibold leading-snug',
      h5:         'text-lg font-semibold leading-snug',
      h6:         'text-base font-semibold leading-normal',
      body:       'text-base font-normal leading-normal',
      bodyLarge:  'text-lg font-normal leading-relaxed',
      bodySmall:  'text-sm font-normal leading-normal',
      caption:    'text-xs font-normal leading-normal text-fg-muted',
      overline:   'text-xs font-medium uppercase tracking-wider text-fg-muted',
      code:       'font-mono text-sm bg-bg-subtle px-1 py-0.5 rounded-sm',
    },
  },
  defaultVariants: { variant: 'body' },
});
```

## Variant → element mapping

```ts
export const VARIANT_TO_ELEMENT = {
  display:    'h1',     // visual display heading, still semantically a top-level heading
  h1:         'h1',
  h2:         'h2',
  h3:         'h3',
  h4:         'h4',
  h5:         'h5',
  h6:         'h6',
  body:       'p',
  bodyLarge:  'p',
  bodySmall:  'p',
  caption:    'span',
  overline:   'span',
  code:       'code',
} as const satisfies Record<TypographyVariant, ElementType>;
```

`as` / `actLike` always win when provided (matches Div behavior).

## Typography-token resolution

A tiny local resolver mapping prop name → CSS var prefix, then the value (if a known token key)
gets wrapped into `var(--sds-...)`:

```ts
const TOKEN_TABLES = {
  fontSize:      { xs: true, sm: true, base: true, lg: true, xl: true, '2xl': true, '3xl': true, '4xl': true, '5xl': true },
  fontWeight:    { normal: true, medium: true, semibold: true, bold: true },
  lineHeight:    { none: true, tight: true, snug: true, normal: true, relaxed: true },
  letterSpacing: { tight: true, normal: true, wide: true, wider: true },
};

const VAR_PREFIX = {
  fontSize:      '--sds-font-size',
  fontWeight:    '--sds-font-weight',
  lineHeight:    '--sds-line-height',
  letterSpacing: '--sds-letter-spacing',
};

// fontFamily is special — token names are short ('sans' / 'mono') and map to '--sds-font-sans' / '--sds-font-mono'.
const FONT_FAMILY_VARS = { sans: '--sds-font-sans', mono: '--sds-font-mono' };

export function resolveTypographyToken(prop, value) {
  if (value == null) return undefined;
  if (typeof value !== 'string') return value;                       // numbers / CSSProperties pass through
  if (prop === 'fontFamily') {
    return FONT_FAMILY_VARS[value] ? `var(${FONT_FAMILY_VARS[value]})` : value;
  }
  const table = TOKEN_TABLES[prop];
  if (table && table[value]) return `var(${VAR_PREFIX[prop]}-${value})`;
  return value;                                                       // raw CSS string passes through
}
```

## Component sketch

```tsx
'use client';
import { Div, type DivProps } from '../Div';
import { forwardRef } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';

import { typographyRecipe } from './Typography.recipe';
import { VARIANT_TO_ELEMENT } from './variantElement';
import { resolveTypographyToken } from './typographyTokens';
import { TRUNCATE_STYLE, lineClampStyle, alignMap, transformMap, decorationMap } from './shortcuts';
import type { TypographyProps } from './Typography.types';

export const Typography = forwardRef<HTMLElement, TypographyProps>(function Typography(props, ref) {
  const {
    variant = 'body',
    as, actLike,
    fontSize, fontWeight, weight, lineHeight, letterSpacing, fontFamily,
    italic, align, transform, decoration, truncate, lineClamp,
    className, style,
    ...rest
  } = props;

  // Recipe (variant → class string) via the standard themed-classes hook.
  const { className: recipeCls } = useThemedClasses({
    recipe: typographyRecipe,
    componentName: 'Typography',
    props: { variant, className: undefined, sx: undefined, style: undefined },
  });

  // Build the text-specific inline style chunk that we layer ON TOP of variant classes but
  // BELOW Div's own `style` cascade (sx → curated shorthand → consumer style → ours).
  const textStyle: CSSProperties = {
    ...(fontSize !== undefined ? { fontSize: resolveTypographyToken('fontSize', fontSize) } : {}),
    ...(weight !== undefined || fontWeight !== undefined
      ? { fontWeight: resolveTypographyToken('fontWeight', weight ?? fontWeight) }
      : {}),
    ...(lineHeight !== undefined ? { lineHeight: resolveTypographyToken('lineHeight', lineHeight) } : {}),
    ...(letterSpacing !== undefined ? { letterSpacing: resolveTypographyToken('letterSpacing', letterSpacing) } : {}),
    ...(fontFamily !== undefined ? { fontFamily: resolveTypographyToken('fontFamily', fontFamily) } : {}),
    ...(italic ? { fontStyle: 'italic' } : {}),
    ...(align ? { textAlign: alignMap[align] } : {}),
    ...(transform ? { textTransform: transformMap[transform] } : {}),
    ...(decoration ? { textDecoration: decorationMap[decoration] } : {}),
    ...(truncate ? TRUNCATE_STYLE : {}),
    ...(lineClamp ? lineClampStyle(lineClamp) : {}),
  };

  // Merge consumer style LAST so it always wins.
  const mergedStyle = { ...textStyle, ...(style ?? {}) };

  const ResolvedElement = actLike ?? as ?? VARIANT_TO_ELEMENT[variant];

  return (
    <Div
      ref={ref}
      as={ResolvedElement}
      className={cn(recipeCls, className)}
      style={mergedStyle}
      {...rest}
    />
  );
}, 'Typography');

export const Text = Typography;
```

## Acceptance criteria

- `<Typography>` defaults to `variant="body"`, rendering `<p>` with the body recipe class.
- Every variant renders its mapped element by default (`h1`→`<h1>`, `caption`→`<span>`, `code`→`<code>`, …).
- `as` / `actLike` override the default element; `actLike` wins over `as` (Div's existing dev warning fires).
- `fontSize="lg"` emits `var(--sds-font-size-lg)`; `fontSize={14}` emits `14`; `fontSize="14px"` passes through.
- `weight` and `fontWeight` are interchangeable; both resolve through the same token table.
- `truncate` injects the 3-property single-line clamp; `lineClamp={3}` injects the 4-property multi-line clamp.
- `align` / `transform` / `decoration` shortcuts map to the right CSS keys.
- All `<Div />` features pass through unchanged: `centered`, `hideOn`, `displayOn`, `animation`, pseudo hooks, every CSS shorthand, every HTML attribute, ref forwarding.
- Consumer `className` and `style` always win their cascade (className via `tailwind-merge`, style via Object.assign order).
- `Text === Typography` (same reference, same render).
- axe-core: 0 violations across the 6-example a11y matrix.

## Out of scope (v1)

- `gutterBottom` / `paragraph` MUI helpers — consumers add `mb={4}` themselves with the Div spacing alias.
- `color` token shortcut already comes from Div (`color="primary.main"` works because Div forwards it through `sxToStyle`).
- Responsive variant values (`variant={{ base: 'body', md: 'h3' }}`) — `cv()` already supports this natively, but documenting + testing the responsive variant flow is a follow-up.
- Promoting typography-token resolution into the engine `sxToStyle` globally — local for v1; promote when a second component needs it.

## Workflow

1. Author plan at `plans/pending/components/60-typography.md`.
2. Move to `plans/in-progress/components/60-typography.md` when implementation starts.
3. Move to `plans/completed/components/60-typography.md` with appended `## Outcome` when shipped.

## Outcome

Shipped end-to-end in a single pass on top of the Phase 59 `<Div />` foundation.

### Shape

Two component exports (same reference) plus a handful of low-level helpers for power users
building their own variant-driven text wrappers:

| Export                              | Role                                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| `Typography`                        | The component itself. Variant-driven text primitive on top of `<Div />`.                      |
| `Text`                              | Identical reference — `Text === Typography`. Use the shorter name for inline metadata sites.  |
| `typographyRecipe`                  | The `cv()` recipe driving the 13-variant axis.                                                |
| `TYPOGRAPHY_VARIANT_TO_ELEMENT`     | `Record<TypographyVariant, ElementType>` — the variant → semantic element mapping.            |
| `resolveTypographyToken`            | Pure helper that resolves `('fontSize', 'lg')` → `'var(--sds-font-size-lg)'`.                 |
| `TYPOGRAPHY_TOKEN_TABLES`           | Indexed token tables per prop (fontSize / fontWeight / lineHeight / letterSpacing).           |
| `TYPOGRAPHY_VAR_PREFIX`             | Prop-name → CSS-var-prefix map (`fontSize: '--sds-font-size'`, …).                            |
| `TYPOGRAPHY_FONT_FAMILY_VARS`       | Token-name → CSS-var map for `fontFamily` (`sans` / `mono`).                                  |

Type exports cover the full surface: `TypographyProps`, `TypographyOwnProps`, `TypographyVariant`,
`TypographyWeight`, `TypographyFontSize`, `TypographyLineHeight`, `TypographyLetterSpacing`,
`TypographyFontFamily`, `TypographyAlign`, `TypographyTransform`, `TypographyDecoration`,
`TypographyTokenProp`.

### Files

```
packages/components/src/Typography/
├── Typography.tsx                  (~175 LoC — thin wrapper over <Div />)
├── Typography.types.ts             (~115 LoC, types only — stripped at build)
├── Typography.recipe.ts            (~45  LoC — cv() recipe with 13 variants)
├── variantElement.ts               (~35  LoC — variant → ElementType map)
├── typographyTokens.ts             (~95  LoC — token tables + resolveTypographyToken)
├── index.ts                        (~35  LoC — public exports)
├── meta.ts                         (renderer discovery metadata)
├── README.mdx
└── examples/                       (13 examples: Basic, Variants, Headings, Body, Code,
                                     Truncate, LineClamp, Align, Weight, Italic, AsAnchor,
                                     TokenSizes, Pseudo)

packages/components/__tests__/
├── Typography.tokens.test.ts       (33 tests — pure resolver unit tests + token-table surface)
├── Typography.recipe.test.ts       (16 tests — variant class strings + variant→element map)
├── Typography.test.tsx             (51 tests — defaults, variants, polymorphism, tokens, shortcuts, Div pass-through, style cascade)
└── Typography.a11y.test.tsx        (6 tests  — axe-core matrix across the core variant set)
```

### Test results

- **Typography-specific:** 106 / 106 tests passing across the 4 files (tokens + recipe unit + integration + axe-core).
- **Full components suite:** 3004 / 3004 tests passing across 160 files — no regressions versus the prior 2737-test baseline (the Δ is Typography's 106 + 161 other tests that landed in the gap between Phase 59 and Phase 60).
- **axe-core:** 0 violations across the 6 a11y scenarios (default body, full h1–h6 ladder, inline caption + code inside body, anchor variant, truncated heading with aria-label, multi-line clamp with full text under aria-label).
- **`pnpm typecheck`:** clean for every Typography file. One remaining error in `Calendar/Calendar.tsx` (`previousMonth` required vs Partial) is pre-existing and unrelated.
- **`pnpm lint`:** clean for every Typography file. The 5 remaining errors / 3 warnings in `Calendar/parts/CalendarMonthGrid.tsx` + `ColorPicker/ColorPicker.tsx` + `ColorPicker/PresetsGrid.tsx` are pre-existing and unrelated.
- **`pnpm build`:** succeeds. `dist/index.js` 1.16 MB / `dist/index.cjs` 1.19 MB (≈10 KB delta over the Div-only baseline — fully tree-shakeable per the 13-variant + 5-shortcut split).

### API decisions confirmed at shipping

| Decision | Rationale at the line |
| --- | --- |
| **`Typography` + `Text` aliases (same reference)** | Two names for the same component reads better in different call sites; `export const Text = Typography` is zero code cost. |
| **Compose over inherit** — `Typography` wraps `<Div />` | Re-deriving the ~80 CSS shorthand props, 7 pseudo hooks, polymorphism, animation, responsive show/hide, HTML pass-through would have doubled Typography's LoC for zero new functionality. |
| **13 focused variants** | Covers the product surface without MUI's 15+ variant sprawl. No `button` variant (Button owns that); no overlap between `subtitle` / `bodyLarge`. |
| **Variant auto-picks the element, `as` / `actLike` override** | The 95% case (`<Typography variant="h1">`) needs no second prop. The 5% case (visual rank ≠ document outline) reaches for `as`. |
| **Variant emits Tailwind classes via `cv()`** | JIT-discoverable, bundle-shared across instances, matches every other DS recipe component. |
| **Typography-token resolution stays local for v1** | Promoting into `sxToStyle` globally would change `<Div fontSize="lg">` behavior too. Local keeps the engine change at zero and the promotion path open for v2. |
| **Raw values bypass the token table** | `fontSize={14}` / `fontSize="14px"` / `fontFamily="'Helvetica Neue', sans-serif"` all pass through untouched — consumers always have a per-prop CSS escape hatch. |
| **`weight` wins over `fontWeight` when both supplied** | `weight` is the friendly form we expect 90% of consumers to reach for first. Documented + tested. |
| **`lineClamp` wins over `truncate` when both supplied** | Multi-line is strictly more informative; documenting the precedence avoids the "why isn't my clamp working" issue. |
| **`code` carries inline padding + bg + radius** | The variant is for **inline** code spans inside running prose. Block code wants a `<pre>` wrapper (out of scope for the primitive). |
| **`caption` ships `text-fg-muted` by default** | Captions are metadata — muted is the right default. Overridable per-instance with `color="fg.default"`. |
| **`overline` ships `uppercase` + `tracking-wider`** | Matches the Material / Mantine eyebrow treatment without needing two props. |

### Deviations from the plan

None. The implementation matches the locked design exactly. Two minor implementation details
landed during execution and were documented inline:

1. **`TypographyProps` omits 9 keys from `DivProps`** (`fontSize`, `fontWeight`, `fontFamily`, `lineHeight`, `letterSpacing`, `textAlign`, `textTransform`, `textDecoration`, `transform`) because Typography re-declares each with a narrower / friendlier union. The list is captured in a single `TypographyOverriddenDivKeys` alias next to the interface, with a comment about `transform` being the Typography `textTransform` shortcut (the CSS transform property is still reachable via `sx` / `style`).
2. **Variant class strings carry an inline `min-w-0` base** — without it, `truncate` and `lineClamp` inside flex containers can fail to wrap because the parent's `min-width: auto` default prevents the text from shrinking below its content width. Applying it on the base of every variant is the minimum-blast-radius fix.

### Follow-ups (not in scope)

- **Responsive variant values** (`variant={{ base: 'body', md: 'h3' }}`) — `cv()` already supports this natively; just needs documentation + an example + a recipe test. Trivial when requested.
- **Promote `resolveTypographyToken` into `sxToStyle`** — would let `<Div fontSize="lg" />` resolve the same way. Wait for a second consumer.
- **Block code (`<pre><code>…</code></pre>`)** — likely a separate primitive (`CodeBlock`) with copy / language label / syntax-highlighter integration; out of scope for the text primitive.
- **`gutterBottom` shortcut** — MUI ships this. Consumers can already write `mb={4}` so it's pure ergonomics. Defer until requested.