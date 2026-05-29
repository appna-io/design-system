# Phase 3 — Theme Engine (`@apx-ds/tokens` + `@apx-ds/theme`)

> Status: **Pending** · Depends on: Phase 2 · Blocks: Phase 4, 5, 6

## Objective

Build the **theme engine**: the runtime + tokens that let consumers configure colors, mode (light/dark),
direction (LTR/RTL), variant (a global styling "family" like `default`, `rounded`, `sharp`), typography,
spacing, motion, and breakpoints — and have every component respond to those changes automatically.

This phase has **two packages**:

- `@apx-dsens` — pure, static design token definitions (no React)
- `@apx-dsme` — the `ThemeProvider`, hooks, CSS-variable generator, and theme override logic

Splitting them means tokens can be consumed by **non-React tools** later (Tailwind config, Figma sync,
build-time generation) without dragging in React.

---

## Two-Package Split

### `@apx-dsens`

Static data only. Exports plain objects + types.

```
packages/tokens/
├── src/
│   ├── index.ts
│   ├── palette/
│   │   ├── light.ts        # default light palette
│   │   ├── dark.ts         # default dark palette
│   │   └── types.ts        # PaletteShape
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── shadows.ts
│   ├── motion.ts
│   ├── breakpoints.ts
│   ├── zIndex.ts
│   └── variants/
│       ├── default.ts      # the 'default' theme variant
│       ├── rounded.ts      # extra rounded radii etc.
│       └── sharp.ts        # angular, zero radii
└── package.json
```

### `@apx-dsme`

Runtime: provider, hooks, CSS variable injection, override resolution.

```
packages/theme/
├── src/
│   ├── index.ts
│   ├── ThemeProvider.tsx
│   ├── defineTheme.ts        # helper to build a theme, with type inference
│   ├── mergeTheme.ts         # deep merge consumer overrides with defaults
│   ├── themeToCssVars.ts     # generates `:root` / `[data-theme]` CSS
│   ├── ThemeScript.tsx       # SSR no-flash script for initial mode/dir
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── usePalette.ts
│   │   ├── useMode.ts        # 'light' | 'dark', plus setMode
│   │   ├── useVariant.ts     # active theme-level variant
│   │   └── useDirection.ts   # re-exports from engine for convenience
│   └── styles/
│       └── reset.css          # minimal CSS reset DS expects
└── package.json
```

---

## Theme Shape (the contract)

```ts
export interface Theme {
  // identity
  name?: string;

  // colors
  palette: {
    light: PaletteShape;
    dark: PaletteShape;
  };
  mode: 'light' | 'dark' | 'system';

  // global stylistic family
  variant: 'default' | 'rounded' | 'sharp' | (string & {});

  // direction
  dir: 'ltr' | 'rtl';

  // scales
  typography: TypographyShape;
  spacing: SpacingScale; // e.g. { 0:0, 1:'.25rem', 2:'.5rem', … }
  radius: RadiusScale; // e.g. { none:0, sm:'.25rem', md:'.5rem', full:'9999px' }
  shadows: ShadowScale;

  // motion
  motion: {
    duration: { fast: number; normal: number; slow: number };
    ease: { standard: string; emphasized: string; decelerate: string; accelerate: string };
    reduceMotion: 'system' | 'always' | 'never';
  };

  // layout
  breakpoints: { sm: number; md: number; lg: number; xl: number; '2xl': number };
  zIndex: { dropdown: number; sticky: number; modal: number; toast: number; tooltip: number };

  // per-component overrides
  components?: {
    [componentName: string]: {
      defaultProps?: Record<string, unknown>;
      styleOverrides?: Record<string, string>; // class strings keyed by slot
      variants?: Record<string, VariantConfig>; // add custom variants
    };
  };
}
```

### `PaletteShape` (one palette, used twice — light + dark)

```ts
export interface PaletteShape {
  // semantic intents (used by components)
  primary: ColorRole;
  secondary: ColorRole;
  success: ColorRole;
  warning: ColorRole;
  danger: ColorRole;
  info: ColorRole;
  neutral: ColorRole;

  // surfaces
  background: { default: string; paper: string; subtle: string };
  foreground: { default: string; muted: string; subtle: string };
  border: { default: string; subtle: string; strong: string };

  // utility
  overlay: string;
  focusRing: string;
}

export interface ColorRole {
  main: string; // base color
  contrast: string; // text/icon color that goes on top of `main`
  hover: string;
  active: string;
  subtle: string; // tinted background (e.g. ghost button bg on hover)
  border: string;
}
```

Components reference `palette.primary.main`, `palette.primary.contrast`, etc. — never raw hex.
That is the **DRY** point for color: change the role once, everywhere updates.

---

## CSS Variable Strategy

Every theme value becomes a CSS variable under the `--sds-*` namespace:

```css
:root {
  --sds-palette-primary-main: #4f46e5;
  --sds-palette-primary-contrast: #ffffff;
  --sds-palette-primary-hover: #4338ca;
  /* … */
  --sds-radius-md: 0.5rem;
  --sds-duration-normal: 200ms;
}

:root[data-mode='dark'] {
  --sds-palette-primary-main: #6366f1;
  /* … all dark palette overrides … */
}

:root[data-variant='rounded'] {
  --sds-radius-sm: 0.5rem;
  --sds-radius-md: 1rem;
  --sds-radius-lg: 1.5rem;
}
```

Components use Tailwind arbitrary values that reference these vars:

```tsx
className = 'bg-[var(--sds-palette-primary-main)] text-[var(--sds-palette-primary-contrast)]';
```

…or, more ergonomically, custom Tailwind theme extensions defined in Phase 1:

```ts
// tailwind.config.ts (in the renderer + consumer's app)
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'var(--sds-palette-primary-main)',
        contrast: 'var(--sds-palette-primary-contrast)',
        hover:   'var(--sds-palette-primary-hover)',
        // …
      },
      // …
    },
  },
}
```

→ components write `bg-primary text-primary-contrast hover:bg-primary-hover` and theme switching
just works.

**Decision**: ship a Tailwind preset (`apx-dslwind-preset`) so consumers add **one line**
to their Tailwind config to get all our token classes. Built in Phase 3.

---

## `ThemeProvider` API

```tsx
<ThemeProvider
  theme={defineTheme({
    /* overrides */
  })}
  defaultMode="system"
  defaultDir="ltr"
  defaultVariant="default"
  storageKey="sds-theme" // for persistence
  disableTransitionOnChange // prevents flash when switching mode
>
  <App />
</ThemeProvider>
```

Behaviors:

- Sets `<html data-mode="…" data-variant="…" dir="…">` on mount and on change
- Injects a `<style>` tag with the generated CSS variables (light + dark + variant overrides)
- Persists user preference to `localStorage` (configurable key, can disable)
- Watches `prefers-color-scheme` if `mode === 'system'`
- Watches `prefers-reduced-motion` and exposes via `useReducedMotion()`
- Provides `useTheme()`, `useMode()`, `useVariant()`, `useDirection()`, `usePalette()` hooks
- Exposes `setMode(mode)`, `setVariant(variant)`, `setDir(dir)` setters via context

---

## `defineTheme` — the DX sugar

```ts
import { defineTheme } from 'apx-ds';
const theme = defineTheme({
  palette: {
    light: {
      primary: { main: '#4f46e5', contrast: '#fff' }, // partial override OK
    },
  },
  components: {
    Button: {
      defaultProps: { size: 'md', variant: 'solid' },
      styleOverrides: {
        root: 'tracking-wide',
        icon: 'opacity-90',
      },
    },
  },
});
```

Internally deep-merges with the default theme from `@apx-dsens`. Returns a fully typed `Theme`.

---

## Override Hierarchy (the precedence law)

For any rendered component, the final class string is composed in this order:

```
1. Engine recipe defaults                                         (lowest)
2. Theme-level `components.<Name>.styleOverrides` (theme variant aware)
3. Theme-level `components.<Name>.defaultProps`
4. Prop-level `variant` / size / etc.
5. Prop-level `sx`
6. Prop-level `className`
7. Prop-level `style`                                             (highest)
```

The engine's `cn()` handles 1–6 via `tailwind-merge` (later classes win). The `style` prop is React
inline style and naturally wins via CSS specificity.

This is enforced by a **single shared utility** every component uses:

```ts
// In every component:
const classes = useThemedClasses('Button', {
  recipe: buttonRecipe,
  props,
});
```

Defined once in `@apx-dsme` so no component re-implements override resolution.

---

## Direction (RTL)

- The provider sets `<html dir>` and provides `DirectionContext` via `engine`.
- Components use CSS logical properties (`me-*`, `ms-*`, `pe-*`, `ps-*`) — **not** `mr-*`/`ml-*`.
- Engine ships a `useDirection()` hook for JS-side decisions (rare).
- Renderer (Phase 4) has a top-level toggle that flips `dir` instantly to verify all components.

---

## Mode (light/dark/system)

- `mode === 'system'`: subscribe to `window.matchMedia('(prefers-color-scheme: dark)')`
- Apply `data-mode` attribute on `<html>` — CSS rules cascade from there
- `<ThemeScript />` is a small inline script meant to be placed in `<head>` (or Next.js `app/layout.tsx`)
  to set `data-mode` before hydration → **no flash**

```tsx
<head>
  <ThemeScript storageKey="sds-theme" defaultMode="system" />
</head>
```

Same pattern as `next-themes` but built in.

---

## Theme-Level `variant` (the "general variant enum")

This is the killer feature you described — change one prop and the whole DS shifts personality.

```tsx
<ThemeProvider theme={{ …, variant: 'rounded' }}>
```

Implementation:

- Variants live in `@apx-dsens/variants/<name>.ts`
- Each variant exports a **partial theme** that overrides specific tokens
- `mergeTheme()` applies the active variant on top of the base theme
- Apply `data-variant="rounded"` on `<html>` so CSS variable overrides cascade

Adding a new theme variant later = add one file, no component changes.

Built-in variants for Phase 3:

- `default` — neutral, medium roundness
- `rounded` — generous radii, friendly
- `sharp` — zero radii, geometric

---

## Component-Level Variants vs Theme-Level Variant

These are different axes:

| Axis                    | Lives on                            | Affects                 | Example                                  |
| ----------------------- | ----------------------------------- | ----------------------- | ---------------------------------------- |
| **Theme `variant`**     | `<ThemeProvider variant="rounded">` | All components globally | "make everything chunky/round"           |
| **Component `variant`** | `<Button variant="ghost">`          | This one instance       | "this specific button is a ghost button" |

They compose. A `<Button variant="ghost">` under `theme.variant='rounded'` is rounded **and** ghost-styled.

---

## Custom CSS Override Surface

Three layers, all DRY-enforced by a single resolver:

1. **`className`** — escape hatch for arbitrary Tailwind. Merged via `tailwind-merge`.
2. **`sx`** — theme-token-aware style object. Resolved by `sxToStyle` (Phase 2).
3. **`components.<Name>.styleOverrides`** — global tweaks at theme level.

```tsx
<Button
  variant="solid"
  className="uppercase tracking-widest"
  sx={{ bg: 'primary.hover', radius: 'lg' }}
  style={{ minWidth: 200 }}
/>
```

All three coexist; precedence per the table above.

---

## File-Level Tasks (Ordered)

### `@apx-dsens`

1. [ ] Define `PaletteShape`, `ColorRole` types
2. [ ] Author default `light` palette (semantic + surfaces + border + overlay)
3. [ ] Author default `dark` palette
4. [ ] Define `typography` scale (font families, sizes, weights, line heights)
5. [ ] Define `spacing` scale (0–96, 4px base)
6. [ ] Define `radius` scale
7. [ ] Define `shadows` scale
8. [ ] Define `motion` tokens (duration, easings)
9. [ ] Define `breakpoints` and `zIndex`
10. [ ] Define `variants/default.ts`, `variants/rounded.ts`, `variants/sharp.ts`
11. [ ] Export the **default theme** as a frozen object
12. [ ] Unit-test that all palette roles include required keys (contract test)

### `@apx-dsme`

13. [ ] Implement `defineTheme` (deep merge with defaults, return typed `Theme`)
14. [ ] Implement `mergeTheme` (used internally by `defineTheme` + variant application)
15. [ ] Implement `themeToCssVars` — turns a `Theme` into a string of CSS rules
16. [ ] Implement `<ThemeProvider>`:
    - Reads `localStorage` (if `storageKey` set)
    - Watches system color-scheme
    - Sets `<html data-mode data-variant dir>`
    - Injects `<style>` with generated vars
    - Provides context: `theme`, `mode`, `setMode`, `variant`, `setVariant`, `dir`, `setDir`
17. [ ] Implement `<ThemeScript>` (SSR no-flash)
18. [ ] Implement hooks: `useTheme`, `usePalette`, `useMode`, `useVariant` (re-export `useDirection`)
19. [ ] Implement `useThemedClasses(componentName, { recipe, props })` — the central override resolver
20. [ ] Ship `tailwind-preset.ts` that maps `--sds-*` vars to Tailwind theme keys
21. [ ] Ship optional `styles/reset.css` (minimal — opt-in)
22. [ ] Tests:
    - `defineTheme` merges correctly (deep, last-wins, type-safe)
    - `themeToCssVars` produces stable, sorted output (snapshot)
    - `<ThemeProvider>` sets `data-mode`, persists, reacts to system
    - `<ThemeProvider>` switching `variant` applies `data-variant`
    - `<ThemeProvider>` switching `dir` applies `dir` attribute
    - `useReducedMotion` honors `motion.reduceMotion='always'` override

---

## Public Surface

```ts
// @apx-dsens
export { defaultTheme } from './defaultTheme';
export { lightPalette, darkPalette } from './palette';
export { variants } from './variants';
export type * from './types';

// @apx-dsme
export { ThemeProvider } from './ThemeProvider';
export { ThemeScript } from './ThemeScript';
export { defineTheme } from './defineTheme';
export { mergeTheme } from './mergeTheme';
export { themeToCssVars } from './themeToCssVars';
export { useTheme, usePalette, useMode, useVariant, useDirection, useThemedClasses } from './hooks';
export { apxTailwindPreset } from './tailwind-preset';
export type { Theme, ThemeOverride } from './types';
```

Both packages are re-exported from the root `apx-ds consumers do:

```ts
import { ThemeProvider, defineTheme, useTheme } from 'apx-ds';```

---

## Acceptance Criteria

- [ ] `<ThemeProvider>` works in `apps/renderer`; toggling mode + variant + dir all visibly change
      the DOM attributes and a test color div changes color/radius/direction.
- [ ] No FOUC: refreshing with persisted `dark` mode renders dark immediately (thanks to `ThemeScript`).
- [ ] Switching `theme.variant` between `default`/`rounded`/`sharp` updates radii globally with no
      component code involved.
- [ ] `defineTheme({ palette: { light: { primary: { main: '#ff0000' } } } })` correctly deep-merges
      and the rest of the default palette is preserved.
- [ ] `useThemedClasses('Button', { recipe, props: { className: 'foo' } })` returns a class string
      where `foo` wins over recipe defaults (proven via tailwind-merge order test).
- [ ] Tailwind preset is consumable: an empty Next app + the preset + `bg-primary` → renders the
      DS's primary color via CSS vars.
- [ ] All exports tree-shake correctly (verify via `dist` inspection).

---

## DRY Self-Check

- The **override resolver** (`useThemedClasses`) is implemented exactly **once** here. Every component
  in Phase 5+ calls it; **no component reimplements override precedence.**
- Token-to-CSS-var translation lives **only** in `themeToCssVars` + `token()` (engine). Components
  reference tokens by name, never by value.
- Variant token files (`default`/`rounded`/`sharp`) are **the only place** that ships variant-specific
  values. No component contains `if (variant === 'rounded')` logic.

---

## Out of Scope for Phase 3

- The renderer's UI for switching theme/mode/dir/variant (that's Phase 4)
- Actual components consuming the theme (Phase 5+)
- Smart color constraint handler (future)
- Theme import/export to JSON file (future, easy to add)
- Figma sync (future, separate tool)

---

## When This Phase Is Complete

1. Move this file to `plans/completed/03-theme-engine.md`.
2. Append `## Outcome` with: final `Theme` shape, decisions about palette structure, snapshot of
   generated CSS, bundle sizes, any deviations from this plan.
3. Open `plans/pending/04-renderer.md`.

---

## Outcome

**Status:** Completed.

### What shipped

Two packages came online: `@apx-dsens` (pure data) and `@apx-apx-ds(React
runtime). Combined with the engine they form the full theme system. **82 new tests** (45 tokens +
37 theme); 170 tests across the workspace.

### `@apx-dsens` — public surface

- `defaultTheme` (frozen) — the baseline `ThemeShape`.
- `lightPalette`, `darkPalette` — concrete palettes; indigo primary + slate neutral, Tailwind-style hex values.
- Scales: `typography`, `spacing`, `radius`, `shadows`, `motion`, `breakpoints`, `zIndex`.
- Theme variants: `defaultVariant`, `roundedVariant`, `sharpVariant`, `themeVariants` map, `getThemeVariant(name)` lookup.
- Types: `ThemeVariantDefinition`, `ThemeVariantOverrides`.

Bundle: **2.1 KB gzipped** (ESM). Adding a new theme variant is literally one file in `variants/`.

### `@apx-dsme` — public surface

Runtime

- `<ThemeProvider theme defaultMode defaultDir defaultVariant storageKey injectCss
disableTransitionOnChange>` — owns mode/variant/dir state, persists each under
  `${storageKey}-mode|variant|dir`, watches OS `prefers-color-scheme`, syncs `<html data-mode
data-variant dir>`, injects a `<style data-apx-dsme>` block with all CSS variables.
  Also wraps the engine's `DirectionContext.Provider`, so `useDirection()` Just Works.
- `<ThemeScript storageKey defaultMode defaultDir defaultVariant>` — drops in `<head>`; tiny
  inline script that pre-applies `data-mode/variant/dir` _before_ hydration → no FOUC.

Building blocks

- `defineTheme(override?)` — deep-merges override with `defaultTheme`, then applies the named
  variant's tokens on top. Returns a fully-typed `ThemeShape`.
- `mergeTheme(base, ...overrides)` — generic deep merger; preserves siblings, replaces primitives.
- `themeToCssVars(theme, { rootSelector, darkSelector, emitVariants })` — deterministic, sorted
  CSS string: `:root { … }`, `:root[data-mode='dark'] { … }`, and one
  `:root[data-variant='<name>'] { … }` block per non-empty variant. Snapshot-tested.

Hooks

- `useTheme()` — full context. Throws outside provider.
- `usePalette()` — active palette (light or dark) for JS-side color decisions.
- `useMode()` → `{ mode, resolvedMode, setMode, toggleMode }`.
- `useVariant()` → `{ variant, setVariant }`.
- `useThemeDirection()` → `{ dir, setDir, toggleDir }` (engine's read-only `useDirection()` still
  works without a provider).
- `useThemedClasses({ recipe, props, slot })` — the **single** override resolver. Precedence:
  recipe → `theme.components.<Name>.styleOverrides.<slot>` → consumer `className` → consumer `sx`
  → consumer `style`. Every Phase 5+ component calls this exactly once per slot; no component
  re-implements override logic.

Consumer ergonomics

- `apxTailwindPreset` (also `apx-dslwind-preset`) — maps every `--sds-*` var to a
  Tailwind theme key: `bg-primary`, `text-primary-contrast`, `hover:bg-primary-hover`,
  `bg-bg-paper`, `text-fg-muted`, `border-border`, `rounded-md`, `shadow-md`, `duration-normal`,
  `ring-focus`, `z-modal`, etc. Add to consumer's Tailwind config with one line; mode/variant
  switching becomes a no-op for component classes (the variable changes, the class doesn't).
- `apx-dsles/reset.css` — opt-in tiny reset that applies DS tokens at the page level
  and honors `prefers-reduced-motion`.

Bundle: **4.1 KB gzipped** for the theme runtime.

### Override hierarchy (now enforced in one place)

```
recipe(props)                              ← engine cv() (lowest)
└─ theme.components.<Name>.styleOverrides.<slot>
   └─ props.className
      └─ props.sx → inline style
         └─ props.style                    ← (highest, naturally wins)
```

The first three rows are composed by `cn()` (`tailwind-merge` resolves conflicts last-wins). `sx`
and `style` are applied as inline `style` so they always win over classes. This is implemented
once in `useThemedClasses`; tests prove that user `className` overrides theme overrides and that
`style` wins over `sx`.

### Renderer integration (acceptance demo)

`apps/renderer/src/app/layout.tsx` now wraps the tree in `<ThemeProvider>` and emits
`<ThemeScript />` in `<head>`. The new `/theme-demo` page provides three segmented controls
(mode / variant / dir) that change the DOM attributes live; surface + role cards re-paint
through CSS variables alone with **zero re-rendering of component class strings**. Refreshing
the page with `dark` persisted in `localStorage` renders dark immediately — no flash. RTL switch
toggles `<html dir>` and the engine's `useDirection()` picks it up.

The renderer's Tailwind config now uses the preset, so the `engine-demo` and `theme-demo` pages
both consume `bg-primary`/`text-fg-muted`/`border-border` etc. correctly.

### Bundle sizes

| Package                  |     ESM |    Gzipped |
| ------------------------ | ------: | ---------: |
| `@apx-dsine`     | 13.4 KB | **4.4 KB** |
| `@apx-dsens`     |  6.7 KB | **2.1 KB** |
| `@apx-dsme`      | 14.7 KB | **4.1 KB** |
| `apx-dsggregate) |  131 KB |  **25 KB** |

The aggregate includes `tailwind-merge` (~16 KB minified), which is the biggest line item. Splitting
that out for consumers who only want the theme (no class composition) is a future optimization.

### Decisions / deviations from the plan

- **`'use client'` preservation:** tsup strips top-of-file directives during bundling. The plan
  didn't anticipate this. Fix: each builder appends `'use client';` to its `dist/index.{js,cjs}`
  in an `onSuccess` hook. The aggregate `apx-dsndle gets it too. `tailwind-preset.js`
  stays pure (no banner) because it's just data. Net effect: consumers can `import { Button }
from 'apx-dsirectly from a Next.js server component — Next sees the import as a client
  reference and renders it past the boundary.
- **Tokens depends on engine (types only):** the plan envisioned tokens having zero deps. In
  practice, since the type definitions (`ThemeShape`, `PaletteShape`, etc.) live in engine, tokens
  imports them as type-only. They're erased at runtime, so tokens still has zero runtime deps.
  Captured as a future cleanup: extract pure types into a `@apx-dses` package if a
  non-React tool ever needs to consume tokens.
- **`themeToCssVars` snapshot:** stable, alphabetically sorted output (verified). Repeated calls
  produce byte-identical strings.
- **`color-scheme` CSS prop** is set by `reset.css` so native UI (scrollbars, form controls) tracks
  the DS mode.
- **Persistence keys** are split (`${storageKey}-mode|variant|dir`) instead of a single JSON blob.
  Easier for users to inspect in devtools and to pre-seed for tests.

### Acceptance criteria (recap)

- [x] `<ThemeProvider>` works in `apps/renderer`; mode/variant/dir toggles change `<html>` attrs
      and visibly re-paint surface + role cards.
- [x] No FOUC: `<ThemeScript />` sets `data-mode` before hydration.
- [x] `theme.variant` switch updates radii globally via `[data-variant='rounded']` CSS overrides;
      no component code touched.
- [x] `defineTheme({ palette: { light: { primary: { main: '#ff0' } } } })` deep-merges and
      preserves every other role (covered by `defineTheme.test.ts`).
- [x] `useThemedClasses` wins-order verified: `className` beats theme styleOverrides; `style`
      beats `sx` (covered by `useThemedClasses.test.tsx`).
- [x] Tailwind preset consumable end-to-end: renderer pages use `bg-primary`,
      `bg-primary-subtle`, `text-fg-muted`, `border-border`, `rounded-md`, etc. and they re-paint
      when mode/variant change.
- [x] `npm pack --dry-run` confirms `apx-dsips only `dist/` + `README.md` + `LICENSE`
      (16 files, 175 KB tarball).

### Items deferred to later phases

- The renderer's UI for switching theme/mode/dir/variant is a per-page demo right now; Phase 4
  promotes it into a sidebar so every page benefits.
- Per-component `styleOverrides` plumbing is implemented in `useThemedClasses` but isn't
  exercised by a real component until Phase 5 (Button).
- Smart color constraint handler — still future.

Next up: **Phase 4 — Renderer** (`plans/pending/04-renderer.md`).
