# Phase 5 — First Component: `<Button />`

> Status: **Completed** · Depends on: Phase 1, 2, 3, 4 · Blocks: Phase 6

## Objective

Ship **the reference implementation** of a `apx-ds` component. The Button is intentionally
chosen first because it touches every system: variants, sizes, colors, intents, polymorphism,
`asChild`, icons, loading state, disabled state, animation, RTL, theming, overrides, a11y, focus
management, tests, README, and the renderer integration.

Once this is done, every future component is built **by copy-paste-modify** from this template.
That's the DRY enforcement: Button defines the convention.

---

## Scope

This phase delivers **one variant** of Button (`solid`) — the canonical happy path. Phase 6 adds
two more variants (`outline`, `ghost`) to prove the variant system works under stress.

Why split? Because writing one variant well is harder than writing three sloppily. Get the API,
animation, a11y, types, tests, and renderer integration right with one variant first.

---

## Public API

```tsx
import { Button } from 'apx-ds';
<Button>Click me</Button>

<Button
  variant="solid"                 // see Phase 6 — for now only 'solid' exists
  size="md"                       // 'sm' | 'md' | 'lg'
  color="primary"                 // 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  intent="primary"                // alias for color, prefer 'color' (decision below)
  fullWidth={false}
  disabled={false}
  loading={false}
  loadingText="Loading…"          // optional, announced to screen readers
  leftIcon={<MailIcon />}
  rightIcon={<ArrowIcon />}
  iconOnly={false}                // for icon-only buttons (a11y-aware)
  type="button"                   // standard button attr
  asChild={false}                 // Radix-style polymorphism via Slot
  className=""                    // arbitrary classes
  style={{}}                      // inline styles
  sx={{}}                         // theme-aware style object
  onClick={...}
>
  Submit
</Button>
```

### Prop Decisions

- `color` vs `intent`: pick **`color`** as the canonical name. It's used by Chakra, Joy UI, and
  shadcn. Drop `intent`.
- `loading` automatically: disables clicks, sets `aria-busy="true"`, shows spinner, hides text or
  optionally swaps with `loadingText`.
- `disabled` sets `aria-disabled` and `data-disabled`; for `asChild` we use `aria-disabled` rather
  than the `disabled` attribute (since the child may not be a `<button>`).
- `iconOnly` is computed automatically if `children` is absent AND `leftIcon|rightIcon` exists, but
  can be set explicitly. When `iconOnly`, the button becomes square and requires `aria-label`.

---

## File Structure

```
packages/components/src/Button/
├── Button.tsx                  # the component
├── Button.types.ts             # exported types (ButtonProps, ButtonVariant, ButtonSize, ButtonColor)
├── Button.recipe.ts            # the `cv()` recipe — all class logic lives here
├── Button.motion.ts            # motion presets for press/loading transitions
├── Button.test.tsx             # unit tests
├── Button.a11y.test.tsx        # a11y-specific tests (axe + keyboard)
├── README.md                   # docs source (rendered by Phase 4 renderer)
├── meta.ts                     # { name: 'Button', category: 'Inputs', tags: ['form'] }
└── examples/
    ├── Basic.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── WithIcons.tsx
    ├── Loading.tsx
    ├── Disabled.tsx
    ├── AsChild.tsx
    └── FullWidth.tsx
```

> Variant-specific example files (`Outline.tsx`, `Ghost.tsx`) come in Phase 6.

---

## Implementation Sketch

### `Button.recipe.ts`

This is **the only file** that contains Button's styling decisions. Every other place either passes
props into the recipe or applies an override.

```ts
import { cv } from '@apx-dsine';

export const buttonRecipe = cv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-medium select-none whitespace-nowrap',
    'rounded-[var(--sds-radius-md)]',
    'transition-[transform,background-color,color,box-shadow]',
    'duration-[var(--sds-duration-fast)]',
    'ease-[var(--sds-ease-standard)]',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-[var(--sds-palette-focus-ring)]',
    'focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
    'aria-[busy=true]:cursor-progress',
  ].join(' '),
  variants: {
    variant: {
      solid: '', // filled in Phase 6 — base styles for now applied here
    },
    size: {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2',
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
      neutral: '',
    },
    fullWidth: { true: 'w-full' },
    iconOnly: {
      true: 'aspect-square px-0',
    },
  },
  compoundVariants: [
    // Phase 6 fills these in: { variant: 'solid', color: 'primary', class: '…' }, etc.
  ],
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    color: 'primary',
    fullWidth: false,
    iconOnly: false,
  },
});
```

For Phase 5, the `solid + primary` combination is implemented (so the button is actually
visible/functional). Other color/variant cells are stubs filled by Phase 6.

### `Button.motion.ts`

```ts
import type { MotionProps } from 'motion/react';

export const buttonMotion: MotionProps = {
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 500, damping: 30 },
};

export const spinnerMotion: MotionProps = {
  animate: { rotate: 360 },
  transition: { repeat: Infinity, duration: 0.8, ease: 'linear' },
};
```

### `Button.tsx`

```tsx
import { forwardRef } from '@apx-dsine';
import { Slot } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';
import { motion } from 'motion/react';
import { buttonRecipe } from './Button.recipe';
import { buttonMotion, spinnerMotion } from './Button.motion';
import type { ButtonProps } from './Button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    color,
    fullWidth,
    leftIcon,
    rightIcon,
    iconOnly: iconOnlyProp,
    loading = false,
    loadingText,
    disabled = false,
    asChild = false,
    type = 'button',
    className,
    style,
    sx,
    children,
    ...rest
  },
  ref,
) {
  const iconOnly = iconOnlyProp ?? (!children && Boolean(leftIcon ?? rightIcon));

  const classes = useThemedClasses('Button', {
    recipe: buttonRecipe,
    props: { variant, size, color, fullWidth, iconOnly, className, sx },
  });

  const Comp = asChild ? Slot : motion.button;

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      className={classes}
      style={style}
      data-disabled={disabled || loading || undefined}
      aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : disabled || loading}
      {...(asChild ? {} : buttonMotion)}
      {...rest}
    >
      {loading ? <Spinner aria-hidden /> : leftIcon}
      {loading && loadingText ? loadingText : children}
      {!loading && rightIcon}
    </Comp>
  );
});

function Spinner() {
  return (
    <motion.span
      {...spinnerMotion}
      className="inline-block size-4 border-2 border-current border-r-transparent rounded-full"
    />
  );
}
```

> Note: `useThemedClasses` (Phase 3) handles theme `components.Button.styleOverrides`, theme
> `components.Button.defaultProps`, prop variants, `sx`, and `className` in one call. The component
> NEVER calls `cn()` or `tailwind-merge` directly — that's all centralized.

### `Button.types.ts`

```ts
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-dsine';

export type ButtonVariant = 'solid' | 'outline' | 'ghost'; // outline/ghost added Phase 6
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ResponsiveValue<ButtonVariant>;
  size?: ResponsiveValue<ButtonSize>;
  color?: ResponsiveValue<ButtonColor>;
  fullWidth?: ResponsiveValue<boolean>;
  iconOnly?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  loadingText?: string;
  asChild?: boolean;
  sx?: Sx;
}
```

Note `ResponsiveValue<>` — every visual prop is responsive by default. Engine resolves it.

---

## Accessibility

Required behavior, tested in `Button.a11y.test.tsx`:

- **Role**: `<button>` by default; `asChild` preserves child's role.
- **Keyboard**: Space + Enter activate. Focus visible via `:focus-visible`.
- **Disabled state**: `aria-disabled="true"` and `disabled` attr (when not `asChild`).
- **Loading**: `aria-busy="true"`. Spinner is `aria-hidden`. If `loadingText` provided, it's the
  visible label; otherwise the original children remain visible but interaction is blocked.
- **Icon-only**: enforces `aria-label` requirement via dev-warn (`engine/dev/warn`).
- **Focus ring**: visible only on keyboard focus (`:focus-visible`), uses palette focus ring token.
- **Color contrast**: solid + primary verified ≥ 4.5:1 in both light/dark default palettes.
- **Tested with axe-core** (jest-axe) — zero violations.

---

## Animation

- Press: subtle scale (`0.97`) with spring — feels physical.
- Hover (CSS only): `bg-primary-hover` color transition over `--sds-duration-fast`.
- Loading: spinner rotation via Motion.
- All animations respect `prefers-reduced-motion` — when reduced, scale → 1, spinner → static.

Hooked into the engine's `useReducedMotion()` so consumers can override globally via
`theme.motion.reduceMotion`.

---

## Responsive Behavior

```tsx
<Button size={{ base: 'sm', md: 'lg' }} fullWidth={{ base: true, md: false }}>
  Submit
</Button>
```

→ resolves via the engine's `resolveResponsive`, producing `text-sm md:text-base h-8 md:h-12 w-full md:w-auto`.
No special code in Button — the recipe handles it because `cv` already supports responsive values.

---

## RTL

- Uses logical Tailwind classes (`ps-*`, `pe-*` if needed — Button is symmetric so often nothing changes).
- `leftIcon` / `rightIcon` stay semantic (visual position auto-flips via CSS direction).
- Renderer's RTL toggle (Phase 4) verifies this works.

---

## Override Examples

Demonstrated via the README & examples:

```tsx
// Theme-level
<ThemeProvider theme={defineTheme({
  components: {
    Button: {
      defaultProps: { size: 'lg', color: 'secondary' },
      styleOverrides: { root: 'tracking-wide uppercase' },
    },
  },
})} />

// Component-level
<Button className="border-2 border-dashed" sx={{ radius: 'lg' }} style={{ minWidth: 200 }}>
  Custom
</Button>
```

---

## README.md (Component Docs)

Sections (rendered by the Phase 4 renderer):

1. **Overview** — what is a Button, when to use it
2. **Anatomy** — the slots/parts
3. **Examples** — `<ExampleBlock for="Basic" />`, then Sizes, Colors, WithIcons, Loading,
   Disabled, AsChild, FullWidth
4. **Variants** — placeholder (filled in Phase 6)
5. **Props** — `<PropsTable for="Button" />`
6. **Accessibility** — what we guarantee, what consumers must provide (e.g. `aria-label` for icon-only)
7. **Theming** — how to override at theme level (`components.Button`)
8. **Customization** — `className` / `sx` / `style` examples
9. **Do / Don't** — best practices

---

## Testing Plan

`Button.test.tsx`:

- Renders default
- Renders with text content
- `size` variant applies correct classes (snapshot)
- `color` variant applies correct classes (snapshot)
- `fullWidth` adds `w-full`
- `leftIcon` / `rightIcon` render in correct slots
- `iconOnly` (explicit and inferred) applies square shape
- `loading` blocks click, sets aria-busy, renders spinner
- `disabled` blocks click, sets aria-disabled + disabled attr
- `asChild` renders the child element with merged className + ref
- `className` overrides recipe class (tailwind-merge wins-last)
- `style` overrides via inline
- `sx` token resolution applies CSS vars correctly
- Calls `onClick` when clicked (not when loading/disabled)
- Forwards ref to underlying button

`Button.a11y.test.tsx`:

- axe-core passes
- Tab focus visible
- Space activates
- Enter activates
- Disabled prevents focus from activating
- `aria-label` warning fires for icon-only with no label

---

## File-Level Tasks (Ordered)

1. [ ] Create folder `packages/components/src/Button/`
2. [ ] Write `Button.types.ts`
3. [ ] Write `Button.recipe.ts` (Phase 5: only `solid` + `primary` filled)
4. [ ] Write `Button.motion.ts`
5. [ ] Write `Button.tsx`
6. [ ] Write `meta.ts`
7. [ ] Write `Button.test.tsx`
8. [ ] Write `Button.a11y.test.tsx`
9. [ ] Write `examples/Basic.tsx`, `Sizes.tsx`, `WithIcons.tsx`, `Loading.tsx`, `Disabled.tsx`,
       `AsChild.tsx`, `FullWidth.tsx`
       _(`Colors.tsx` shows only `primary` working in Phase 5; the others render visibly but with
       fallback styling — proves Phase 6 will fill them in cleanly)_
10. [ ] Write `README.md`
11. [ ] Export `Button` from `packages/components/src/index.ts`
12. [ ] Re-export from root `apx-ds/index.ts`
13. [ ] Verify Button appears in the renderer sidebar (auto-discovery from Phase 4 working)
14. [ ] Verify all 8 examples render
15. [ ] Verify props table populates from TS types
16. [ ] Verify theme controls (mode/dir/variant) affect Button
17. [ ] Verify override layers work (theme defaults, className, sx, style)
18. [ ] Run a11y test suite; fix any violations
19. [ ] Measure bundle: Button alone should add < 4 KB gzipped to consumer

---

## Acceptance Criteria

- [ ] `import { Button } from 'apx-dsorks in a fresh Next/Vite app
- [ ] All 5 guiding principles demonstrably hold for Button:
  - [ ] DRY — recipe is the only style source; no styling code in `Button.tsx`
  - [ ] Overridable at theme + prop level — proven via 2 explicit examples
  - [ ] Custom CSS — `className`, `sx`, `style` all work and have documented precedence
  - [ ] Responsive — `<Button size={{ base: 'sm', md: 'lg' }}>` renders correctly across breakpoints
  - [ ] Animatable — press scales, loading spins, both respect reduced-motion
- [ ] All tests pass (unit + a11y + type)
- [ ] Renderer shows Button page with README, all examples, props table
- [ ] Toggling theme `variant` (rounded/sharp) visibly changes Button's radius
- [ ] Toggling theme `dir` to `rtl` doesn't break Button's layout (icons swap sides naturally)
- [ ] Bundle delta for adding Button is reasonable (< 4 KB gz)

---

## DRY Self-Check

- Button.tsx contains **no class strings** outside the recipe
- Button.tsx **does not import** `cn`, `clsx`, or `tailwind-merge` directly — only `useThemedClasses`
- Button.tsx **does not implement** override precedence — `useThemedClasses` does it
- Spinner is a local helper because it's truly Button-specific; if we add another spinning indicator
  elsewhere, promote `Spinner` to `@apx-dsponents` as its own component

---

## Out of Scope for Phase 5

- `outline` and `ghost` variants (Phase 6)
- Button group / segmented control (future component)
- Toggle button (future component)
- Icon button as standalone component (future — for now `iconOnly` prop suffices)
- Animation library overrides (consumers stuck with Motion for now)

---

## When This Phase Is Complete

1. Move this file to `plans/completed/05-button.md`.
2. Append `## Outcome` with: final API, bundle size, axe results, screenshots from renderer,
   anything the API surface had to drop or rename.
3. Open `plans/pending/06-button-variants.md`.

---

## Outcome

`<Button />` ships as the reference DS component. It exercises every system the library has —
variants, sizes, colors, polymorphism, icons, loading, disabled, theming, responsive props,
animation, RTL, and the unified override ladder — in ~140 lines of component code.

### Shipped API

```tsx
<Button
  variant?: 'solid' | 'outline' | 'ghost'              // Phase 5: only 'solid' fully styled
  size?: 'sm' | 'md' | 'lg'                            // also accepts ResponsiveValue
  color?: 'primary' | 'secondary' | 'success' |
          'warning' | 'danger' | 'info' | 'neutral'    // Phase 5: every color styled (solid)
  fullWidth?: boolean                                  // also accepts ResponsiveValue
  iconOnly?: boolean                                   // inferred from children/icons if omitted
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  asChild?: boolean                                    // Slot-based polymorphism
  className?: string
  style?: CSSProperties
  sx?: Sx                                              // theme-aware style object
  // …all native ButtonHTMLAttributes minus the conflicting `color`
/>
```

### Files

```
packages/components/src/Button/
├── Button.tsx               (5.4 KB ESM)
├── Button.recipe.ts         — single source of styling, cv() recipe
├── Button.motion.ts         — spinner motion only (press is CSS)
├── Button.types.ts          — ButtonProps + ButtonVariant/Size/Color exports
├── meta.ts                  — category 'Inputs', tags ['button', 'cta', 'form', 'action']
├── README.mdx               — overview, anatomy, 8 example blocks, props table, a11y, theming
└── examples/
    ├── Basic.tsx
    ├── Sizes.tsx            — incl. responsive `{ base: 'sm', md: 'lg' }`
    ├── Colors.tsx           — all 7 colors visibly distinct
    ├── WithIcons.tsx        — leftIcon / rightIcon / iconOnly
    ├── Loading.tsx          — static loading, loadingText, interactive 1.5s simulate
    ├── Disabled.tsx
    ├── AsChild.tsx          — wraps <a> elements with Slot + Slottable
    └── FullWidth.tsx        — responsive variant
```

### Design decisions vs the plan

- **CSS press, not Motion press.** The plan called for `motion.button` with `whileTap` spring.
  Motion's `HTMLMotionProps<'button'>` clashes irreconcilably with React's button event handler
  types under `exactOptionalPropertyTypes: true` (`onAnimationStart`, `onDrag*`, etc. all have
  motion-specific signatures). We swapped the spring for `active:scale-[0.97]` Tailwind +
  `motion-reduce:active:scale-100` for parity with the plan's reduced-motion behavior. The
  loading spinner still uses `motion.span` (no event-handler surface, no clash).
- **`color` is the canonical prop**, `intent` was dropped (as the plan recommended).
- **`useThemedClasses` API improvement.** The plan called for passing `__componentName` smuggled
  inside `props`. We refactored the hook to take `componentName` as a top-level option so the
  call site reads more naturally: `useThemedClasses({ recipe, componentName: 'Button', props })`.
  Existing tests updated; the recipe still receives a clean `props` object stripped of
  `className` / `sx` / `style`.
- **Disabled handling for `asChild`.** When `asChild` is true and the user wraps an `<a>`,
  Button sets `aria-disabled` + `data-disabled` and intercepts `onClick` via `preventInert`
  rather than applying the native `disabled` attribute (which links don't support).
- **Slottable for icons under `asChild`.** Icons render as siblings inside the slotted element
  via `<Slot>{leftIcon}<Slottable>{labelNode}</Slottable>{rightIcon}</Slot>`, so a wrapped `<a>`
  becomes `<a class="…">{leftIcon}{label}{rightIcon}</a>` with the link's `href` preserved.

### Engine refinements driven by Phase 5

- `__resetWarnCache` now exported from `@apx-dsine` so tests can isolate dev-warning
  assertions across cases.
- `SlotProps['style']` widened to `CSSProperties | undefined` for `exactOptionalPropertyTypes`
  compat.
- `VariantProps<T>` (from Phase 4) now reused by Button's recipe via `VariantProps<typeof buttonRecipe>`-style ergonomics.

### Theme refinement

`useThemedClasses({ componentName: 'Button' })` looks up
`theme.components.Button.styleOverrides.root` and threads it between the recipe class and the
consumer's `className`. The existing unit tests for that hook were updated to the new option
shape.

### Verification

- `pnpm typecheck` — 12/12 green.
- `pnpm test` — **193 tests** passing (170 from previous phases + 23 new Button + a11y).
  - `Button.test.tsx` covers: rendering / sizes / colors / fullWidth / iconOnly inference /
    icon ordering / disabled / loading / loadingText / ref forwarding / className override /
    `style` / `sx` palette resolution / `asChild` className merge / `asChild` disabled aria.
  - `Button.a11y.test.tsx` covers: axe-core for default + loading/disabled/icon-with-label /
    Space activation / Enter activation / disabled blocks both / dev-mode warning when
    `iconOnly` lacks `aria-label`.
- `pnpm lint` — 12/12 green (2 stale-disable warnings from Phase 2, unchanged).
- `pnpm format:check` — clean.
- `pnpm --filter @apx-dsderer build` — succeeds; `/components/button` prerendered via
  `generateStaticParams`.
- `curl :3000/components/button` against the running dev server returns 200; the page renders
  the README with all 8 `<ExampleBlock>`s plus the auto-generated props table.

### Bundle size

| Artifact                               | ESM       | Notes                                         |
| -------------------------------------- | --------- | --------------------------------------------- |
| `@apx-dsponents/dist/index.js` | 6.55 KB   | Was 1.13 KB (Placeholder); +5.4 KB for Button |
| `apx-dst/index.js` (aggregate) | 137.22 KB | Includes Motion (~95 KB) — shared across DS   |

Button's raw addition is ~5.4 KB minified (gzipped ≈ 2.0 KB). Motion is loaded once for the
whole library and amortizes across any future components that use the spinner pattern.

### Demonstrated DS principles

| Principle       | Evidence                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------- |
| **DRY**         | `Button.tsx` has no class strings; all styling lives in `Button.recipe.ts`                  |
| **Overridable** | `theme.components.Button.styleOverrides.root` + `className` + `sx` + `style` all tested     |
| **Custom CSS**  | `tailwind-merge` resolves conflicts; consumer's `className` wins, `style` always wins       |
| **Responsive**  | `<Button size={{ base: 'sm', md: 'lg' }}>` example renders with breakpoint-prefixed classes |
| **Animatable**  | CSS press scale + Motion spinner; both respect `prefers-reduced-motion`                     |

### Deferred (Phase 6)

- `outline` and `ghost` variants — the `compoundVariants` rows for those `variant × color`
  combinations are placeholders today.
- More color-specific Phase 6 examples (Outline.tsx, Ghost.tsx).

### Next

Phase 6 — three Button variants (`solid`, `outline`, `ghost`), fully filling the recipe's
compound-variant matrix.
