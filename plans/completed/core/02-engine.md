# Phase 2 — Engine (`@apx-ds/engine`)

> Status: **Pending** · Depends on: Phase 1 · Blocks: Phase 3, 4, 5, 6

## Objective

Build the **engine** — the package that contains every reusable primitive, utility, type, and
pattern used by the rest of the DS. The engine has **zero DS-specific UI**. It is pure plumbing.

Every later phase imports from `@apx-dsine`. If something would otherwise be duplicated
in two components, two themes, or two utilities — it lives here. **This is the DRY enforcement point.**

---

## Why a Separate Engine?

- **Single source of truth** for class merging, variant resolution, slot composition, ref
  forwarding, polymorphism, direction handling, breakpoint resolution, animation primitives,
  and type definitions.
- **Replaceable internals**: if we ever swap `tailwind-merge` for something else, or move from
  Motion to GSAP, only the engine changes. Components don't.
- **Testable in isolation**: utilities have no React tree dependency; we can unit-test the entire
  engine without rendering a single component.

---

## Deliverables

### 1. Class Composition Utilities

```ts
// src/cn.ts
export function cn(...inputs: ClassValue[]): string;
```

Wraps `clsx` + `tailwind-merge` (configured for our token prefixes). Single import everywhere.

```ts
// src/cv.ts  — "class variants", our CVA replacement
export function cv<V extends VariantConfig>(config: V): (props?: VariantProps<V>) => string;
```

Why custom and not `class-variance-authority`? Two reasons:

1. **Theme awareness** — our `cv` reads the theme's `variant` and resolves the active recipe.
2. **Responsive values** — `cv` accepts `{ base: 'sm', md: 'lg' }` for any variant axis.

Shape:

```ts
const button = cv({
  base: 'inline-flex items-center rounded-md transition',
  variants: {
    size: { sm: 'h-8 px-3', md: 'h-10 px-4', lg: 'h-12 px-6' },
    intent: { primary: '…', danger: '…', neutral: '…' },
  },
  compoundVariants: [{ size: 'sm', intent: 'primary', class: 'shadow-sm' }],
  defaultVariants: { size: 'md', intent: 'primary' },
});
button({ size: 'lg', intent: 'danger' }); // string
button({ size: { base: 'sm', md: 'lg' } }); // responsive
```

### 2. Slot Pattern (Radix-style `asChild`)

```ts
// src/slot.tsx
export const Slot: ForwardRefExoticComponent<SlotProps & RefAttributes<HTMLElement>>;
export function Slottable(props: { children: ReactNode }): JSX.Element;
```

Enables `<Button asChild><a href="…">Link</a></Button>` — merges Button props onto the `<a>`.

Implementation: copy/adapt from Radix's well-known Slot pattern (MIT). Custom because we want
zero runtime dependency on Radix for this primitive.

### 3. Polymorphic Component Helpers

```ts
// src/polymorphic.ts
export type PolymorphicRef<C extends ElementType>
export type PolymorphicProps<C extends ElementType, P = object>
export type PolymorphicComponent<DefaultEl extends ElementType, P>
```

Lets components be written once and used as different elements:

```tsx
<Button as="a" href="/">Link</Button>
<Button>Real button</Button>
```

Combined with `asChild`, consumers pick whichever pattern they prefer.

### 4. Ref Forwarding Helpers

```ts
// src/forwardRef.ts
export function forwardRef<T, P>(render: (props: P, ref: Ref<T>) => ReactElement | null);
```

Thin wrapper around `React.forwardRef` that preserves generic inference (the built-in one loses it).
Also sets `displayName` from a passed string for better DevTools.

### 5. Direction System

```ts
// src/direction.tsx
export const DirectionContext: Context<'ltr' | 'rtl'>;
export function DirectionProvider({ dir, children }): JSX.Element;
export function useDirection(): 'ltr' | 'rtl';
```

Reads from `<html dir>` if no provider is present (graceful SSR). Provider lets consumers nest
RTL widgets inside LTR pages. Re-exported from `@apx-dsme` for convenience but **defined here**.

### 6. Responsive Value Resolver

```ts
// src/responsive.ts
export type ResponsiveValue<T> = T | { base: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T };
export function resolveResponsive<T>(value: ResponsiveValue<T>, prefix?: string): string[];
```

Turns a responsive value into an array of Tailwind classes (`text-sm md:text-md lg:text-lg`) for the
variant function to consume. Breakpoints are imported from `@apx-dsens` (Phase 3) — for now
the engine takes them as a parameter.

### 7. Token Reference Helper

```ts
// src/token.ts
export function token(path: string): string; // returns `var(--sds-${path.replace(/\./g, '-')})`
export function tokens<T extends object>(map: T): T; // type-safe builder for token sets
```

`token('palette.primary.main')` → `var(--sds-palette-primary-main)`.

All DS CSS variables are prefixed `--sds-*` to avoid collisions.

### 8. Animation Primitives

```ts
// src/motion.ts
export const motionPresets: {
  fadeIn:  Variants;
  scaleIn: Variants;
  slideInFromBottom: Variants;
  // … shared across components
}
export function useReducedMotion(): boolean
export const transitionTokens: {
  duration: { fast: number; normal: number; slow: number };
  ease:     { standard: number[]; emphasized: number[]; … };
}
```

Components import these instead of redefining the same `initial`/`animate`/`exit` blocks.
Consumers can override via theme `motion.*`.

### 9. SSR-Safe Hooks

```ts
// src/hooks/useIsomorphicLayoutEffect.ts
// src/hooks/useId.ts (wraps React.useId with fallback)
// src/hooks/useControllableState.ts (controlled/uncontrolled hybrid)
// src/hooks/usePrevious.ts
// src/hooks/useMediaQuery.ts (SSR-safe, with initial value param)
```

### 10. Component Metadata Registry

```ts
// src/registry.ts
export interface ComponentMeta {
  name: string;
  displayName: string;
  description?: string;
  category?: string;
}
export function registerComponent(meta: ComponentMeta): void;
export function getRegisteredComponents(): ComponentMeta[];
```

The renderer (Phase 4) auto-discovers via the file system, but this registry powers programmatic
introspection (e.g., "list all DS components" for tooling).

### 11. Type System Foundations

```ts
// src/types/
//   index.ts      — re-exports
//   color.ts      — ColorToken, PaletteShape, ColorScale
//   variant.ts    — VariantConfig, VariantProps
//   responsive.ts — ResponsiveValue, BreakpointKey
//   theme.ts      — ThemeShape (consumed by @apx-dsme)
//   sx.ts         — SxProp (theme-aware style object)
```

The `ThemeShape` lives here so packages don't have circular imports. `@apx-dsme` provides
the _runtime_ implementation; the engine provides the _type_.

### 12. `sx` Prop Foundation

```ts
// src/sx.ts
export type Sx = CSSProperties & { [tokenKey: string]: string | number };
export function sxToStyle(sx: Sx, theme: ThemeShape): CSSProperties;
```

Components forward `sx` to a single utility that resolves tokens. No component implements this twice.

### 13. Errors & Warnings

```ts
// src/dev/warn.ts
export function warn(condition: boolean, message: string, code?: string): void;
```

Dev-only warnings (stripped from prod via `process.env.NODE_ENV` checks). Used by theme contrast
checks (future), incorrect prop combos, deprecated APIs.

---

## Folder Structure

```
packages/engine/
├── src/
│   ├── index.ts              # public surface
│   ├── cn.ts
│   ├── cv.ts
│   ├── slot.tsx
│   ├── polymorphic.ts
│   ├── forwardRef.ts
│   ├── direction.tsx
│   ├── responsive.ts
│   ├── token.ts
│   ├── motion.ts
│   ├── registry.ts
│   ├── sx.ts
│   ├── dev/
│   │   └── warn.ts
│   ├── hooks/
│   │   ├── useIsomorphicLayoutEffect.ts
│   │   ├── useId.ts
│   │   ├── useControllableState.ts
│   │   ├── usePrevious.ts
│   │   └── useMediaQuery.ts
│   └── types/
│       ├── index.ts
│       ├── color.ts
│       ├── variant.ts
│       ├── responsive.ts
│       ├── theme.ts
│       └── sx.ts
├── __tests__/                 # mirrors src/
└── package.json
```

---

## Public Surface (`src/index.ts`)

```ts
// utilities
export { cn } from './cn';
export { cv, type VariantProps } from './cv';
export { Slot, Slottable } from './slot';
export { forwardRef } from './forwardRef';
export { token, tokens } from './token';
export { resolveResponsive, type ResponsiveValue } from './responsive';
export { sxToStyle, type Sx } from './sx';

// context
export { DirectionProvider, useDirection, DirectionContext } from './direction';

// hooks
export { useControllableState } from './hooks/useControllableState';
export { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
export { useId } from './hooks/useId';
export { usePrevious } from './hooks/usePrevious';
export { useMediaQuery } from './hooks/useMediaQuery';

// motion
export { motionPresets, transitionTokens, useReducedMotion } from './motion';

// registry
export { registerComponent, getRegisteredComponents, type ComponentMeta } from './registry';

// dev
export { warn } from './dev/warn';

// types
export type * from './types';
```

---

## File-Level Tasks (Ordered)

1. [ ] Install runtime deps in `packages/engine`: `clsx`, `tailwind-merge`
2. [ ] Implement `cn.ts` + unit test (merges, dedupes, last-wins)
3. [ ] Implement `cv.ts` + unit tests (variants, defaults, compound, responsive)
4. [ ] Implement `slot.tsx` + unit test (prop merging, ref forwarding)
5. [ ] Implement `polymorphic.ts` (types only) + type-level test
6. [ ] Implement `forwardRef.ts` + unit test
7. [ ] Implement `direction.tsx` + unit test (provider, hook, fallback)
8. [ ] Implement `responsive.ts` + unit test (resolves to class arrays)
9. [ ] Implement `token.ts` + unit test
10. [ ] Define `transitionTokens` and `motionPresets` (motion installed as peer dep)
11. [ ] Implement `useReducedMotion` + the rest of the hook set with tests
12. [ ] Implement `sx.ts` + unit test (resolves theme tokens in style object)
13. [ ] Implement `registry.ts` + unit test
14. [ ] Implement `dev/warn.ts` + unit test (no-op in prod)
15. [ ] Define `types/*` — pure type files, paired with `expectTypeOf` tests via Vitest
16. [ ] Wire all into `src/index.ts`
17. [ ] Build with tsup, verify `dist/` has correct `.d.ts` and no leaking internals
18. [ ] Run full test suite, verify coverage ≥ 95% (engine is small, easy target)

---

## Testing Strategy

- **Unit**: every utility has a dedicated `*.test.ts`.
- **Type tests**: use `expectTypeOf` (Vitest built-in) for `cv`, `Slot`, polymorphic types.
- **Render tests**: `Slot`, `DirectionProvider` use `@testing-library/react`.
- **No DS components used** — pure engine. Tests use plain `<button>`, `<div>`, etc.

---

## Acceptance Criteria

- [ ] `pnpm --filter @apx-dsine build` produces a clean `dist/` with sourcemaps + types
- [ ] `pnpm --filter @apx-dsine test` — all green, ≥95% coverage
- [ ] Bundle size of engine (gzipped) under 8 KB — engine should be tiny
- [ ] No `tailwind-merge`/`clsx` leaked in `peerDependencies`; they're bundled
- [ ] `cn`, `cv`, `Slot`, `useDirection`, `forwardRef`, `token` can be imported from
      `@apx-dsine` in `apps/renderer` and type-check correctly
- [ ] Demo page in renderer shows: a polymorphic `<div>` rendered as an `<a>` with merged className,
      proving Slot + polymorphic + cn all work together end-to-end

---

## DRY Self-Check

Before considering this phase done, audit every utility and ask:

- "Will any component re-implement this if I don't include it?" → if yes, keep
- "Is this used by exactly one place?" → if yes, move it out of engine into that place
- "Does this duplicate something `tailwind-merge`/`React`/`Motion` already provides?" → if yes, delete

---

## Out of Scope for Phase 2

- Any specific DS tokens (those are Phase 3 in `@apx-dsens`)
- Theme provider runtime (Phase 3)
- The renderer app (Phase 4)
- Any actual UI component (Phase 5+)
- Smart color constraint handler (future phase)

---

## When This Phase Is Complete

1. Move this file to `plans/completed/02-engine.md`.
2. Append `## Outcome` with: final public API, any APIs that turned out to be unused (delete them now),
   bundle size measurement, links to docs/test runs.
3. Open `plans/pending/03-theme-engine.md`.

---

## Outcome

**Status:** Completed.

### What shipped

`@apx-dsine` is online with the full set of primitives the rest of the DS depends on.
Bundle size: **4.35 KB gzipped (ESM)** — well under the 8 KB budget. 88 unit tests passing.

### Public API (final, `apx-ds-exports the same surface)

Utilities

- `cn(...inputs)` — clsx + tailwind-merge wrapper. The **only** class composition entry point.
- `cv(config)` — variant resolver: base + variants + compound + defaults + responsive values
  (`{ base, sm, md, lg, xl, 2xl }`) + last-wins `className` override.
- `token(path, fallback?)`, `tokenName(path)`, `tokens(map)`, `TOKEN_PREFIX` — DS token namespace
  helpers (`--sds-*`).
- `sxToStyle(sx)` — converts the `sx` prop (with short aliases like `bg`, `p`, `radius`) into a
  plain `CSSProperties` with token references resolved.
- `resolveResponsive(value)`, `breakpointPrefix(bp)`, `prefixClasses(classes, prefix)`,
  `isResponsiveObject(value)`, `RESPONSIVE_BREAKPOINTS` — responsive prop primitives.

Polymorphism

- `Slot`, `Slottable`, `SlotProps` — Radix-style merge-onto-child pattern that powers `asChild`.
  Merges `className` (via `cn`), `style`, event handlers (slot fires first), refs, and other props
  (child wins for non-event props).
- `forwardRef(render, displayName?)` — thin wrapper around `React.forwardRef` that preserves
  generic prop types and accepts a display name as a second arg.
- `PolymorphicProps<C, P>`, `PolymorphicRef<C>`, `PolymorphicComponent<DefaultEl, P>` — type
  helpers for components that accept an `as` prop.

Context

- `DirectionProvider`, `DirectionContext`, `useDirection`, `Direction`,
  `DirectionProviderProps` — RTL/LTR direction. Reads `<html dir>` when no provider is present and
  live-updates via a `MutationObserver`.

Hooks

- `useId(providedId?)` — SSR-safe id with a consumer override.
- `useIsomorphicLayoutEffect`.
- `useControllableState({ value, defaultValue, onChange })` — controlled/uncontrolled pattern with
  a dev warning when a component switches modes.
- `usePrevious(value)`.
- `useMediaQuery(query, { defaultValue })` — SSR-safe with the Safari `addListener` fallback.

Motion

- `transitionTokens` (durations in seconds, named cubic-beziers).
- `motionPresets` — `fadeIn`, `scaleIn`, `slideInFromBottom`, `slideInFromTop`, `pressScale`.
- `useReducedMotion(forceValue?)` — reads `prefers-reduced-motion` with an override.
- Motion is an **optional peer dependency** — engine has zero hard import of `motion` at runtime.

Registry

- `registerComponent`, `getRegisteredComponents`, `getComponentMeta`, `ComponentMeta` — tiny
  programmatic registry for tooling that wants to introspect the DS.

Dev

- `warn(condition, message, code?)` — dedupes within a session, no-ops in production.

Types re-exported

- `ResponsiveValue<T>`, `BreakpointKey`, `Sx`, `VariantConfig`, `VariantProps<C>`, `VariantFn<C>`,
  `VariantValues`, `CompoundVariant`, `ColorRole`, `ColorRoleName`, `PaletteShape`,
  `SurfaceColors`, `ForegroundColors`, `BorderColors`, `ThemeShape`, `TypographyShape`,
  `SpacingScale`, `RadiusScale`, `ShadowScale`, `MotionShape`, `BreakpointScale`, `ZIndexScale`,
  `ComponentThemeOverride`, `ComponentMeta`, `TransitionTokens`, `SimpleVariant`,
  `MotionPresetName`, `Direction`, `ClassValue`, `PolymorphicProps`, `PolymorphicRef`,
  `PolymorphicComponent`, `UseControllableStateOptions`, `UseMediaQueryOptions`.

### Bug fixes / corrections during the build

- **`useDirection` context default:** initial implementation used `'ltr'` as the context default,
  which made the "no provider → read `<html dir>`" branch unreachable. Switched the context type to
  `Direction | null` so the absence of a provider is unambiguous. Verified with a live test that
  flips `<html dir>` at runtime.
- **`Slot` ref typing:** the first draft inherited `ComponentPropsWithRef<'div'>`, which pinned the
  ref to `HTMLDivElement`. Re-typed `SlotProps` to use `HTMLAttributes<HTMLElement>` so callers can
  pass refs to any concrete subclass (button, anchor, etc.).
- **`cv` boolean-keyed variants:** `valueKey` correctly maps `true`/`false` to string keys so
  `{ fullWidth: { true: 'w-full' } }` works and `fullWidth: false` does not match.

### Live verification

The renderer ships an `/engine-demo` page (added in this phase) that exercises `cv` (including
compound + responsive variants), `cn` conflict resolution, `Slot` polymorphism, and
`useDirection`. The page successfully SSRs and the produced HTML shows the expected class strings
including `md:h-10 md:px-4 lg:h-12 lg:px-6` from responsive variant expansion.

### Final verification (Phase 2 acceptance)

```
pnpm format:check  — All matched files use Prettier code style!
pnpm typecheck     — 12/12 tasks ok
pnpm lint          — 12/12 tasks ok
pnpm test          — 88 engine tests passing, 11/11 tasks ok
pnpm build         — 6/6 builds ok, FULL TURBO cache hit
```

Engine bundle: ESM 13.45 KB / **4.35 KB gzipped**; CJS 14.21 KB / 4.44 KB gzipped.

### Items deferred to later phases

- Concrete token _values_ live in `@apx-dsens` (Phase 3) — the engine only declares the
  TypeScript shape and the `var(--sds-…)` helper.
- The actual `ThemeProvider` (with `useTheme`, `mode`, palette CSS-variable injection) is Phase 3.
  The engine declares `ThemeShape` types so components can import them without circular deps.
- No icon, no Button, no real component yet — those start in Phase 5.

Next up: **Phase 3 — Theme Engine** (`plans/pending/03-theme-engine.md`).
