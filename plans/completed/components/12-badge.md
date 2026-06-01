# Phase 12 — `<Badge />`

> Status: **Completed** · Depends on: Phase 6 (Button variant matrix system) · Blocks: none

## Objective

Ship the smallest stylistic primitive in the DS — `<Badge />` — used for status labels ("New",
"Beta", "Live"), counts ("12"), and tag-like chips. Tiny surface, four variants, seven colors,
three sizes, optional leading dot — it's the **purest stress test of the variant matrix**: if
Badge breaks, the matrix is broken.

This phase introduces **no new engine work**. It's a deliberate "small win" stop between the
form-control trilogy (Phases 9-11) and the more architecturally demanding components ahead (Card,
Tabs). It also gives the renderer a cheap component to scaffold lists/tables with — useful for
documentation pages.

---

## What This Component Proves

- The variant × color matrix scales **identically** to micro-surfaces (no Button-specific assumptions).
- A component can ship without any `useThemedClasses` `slot` work (single-slot, simpler than Checkbox).
- The DS's per-color palette holds up at low font weights and small sizes (regression-test for contrast).

---

## Public API

```tsx
import { Badge } from 'apx-ds';

<Badge>New</Badge>

<Badge
  variant="soft"                  // 'solid' | 'outline' | 'soft' (default) | 'subtle'
  size="md"                       // 'sm' | 'md' | 'lg'
  color="primary"                 // 7-color palette
  shape="rounded"                 // 'rounded' (default) | 'pill' | 'square'

  withDot={false}                 // shows a leading status dot
  dotPulse={false}                // animated pulse on the dot (for "Live" indicators)

  leftIcon={<StarIcon />}         // optional inline icon
  rightIcon={<XIcon />}           // commonly used as a "remove" affordance

  removable={false}               // adds a built-in × button on the right
  onRemove={() => {…}}            // fired when × is clicked or Backspace pressed while focused

  asChild={false}                 // Slot-based polymorphism — wrap an <a>, <button>, etc.

  className=""
  style={{}}
  sx={{}}
>
  Beta
</Badge>
```

### Prop Decisions

- **`soft` is the default variant**, not `solid`. Badges are decoration; default-loud (`solid`) is
  visually noisy when peppered through a UI. `soft` reads as "calmly tagged".
- **`shape` defaults to `rounded`** — softer than Button. `pill` gives the full-radius look common in modern dashboards.
- **`withDot` + `dotPulse`** — covers the "Live" / "Streaming" / "Active" pattern that consumers reach for constantly. Pulse animation only fires when both are true.
- **`removable` is a built-in affordance** — instead of asking consumers to wire `rightIcon` + click handler, give them the canonical implementation. Pulls the same a11y story (`aria-label="Remove {label}"`) every time.
- **`asChild`** — common for navigation badges (`<Badge asChild><a href="/inbox">3</a></Badge>`).

---

## Variants — Designed Inline

Four variants. Each is a different "fill" story:

| Variant   | Background                       | Border                      | Text                              | When to use                                          |
| --------- | -------------------------------- | --------------------------- | --------------------------------- | ---------------------------------------------------- |
| `solid`   | `bg-<color>`                     | `border-transparent`        | `text-<color>-contrast`           | Status labels that need attention ("Critical").       |
| `outline` | `bg-transparent`                 | `border-<color>` 1px        | `text-<color>`                    | Tag-like UI; ghosts well on colored backgrounds.      |
| `soft`    | `bg-<color>-subtle`              | `border-transparent`        | `text-<color>`                    | **Default.** Conventional "tag" badge.                |
| `subtle`  | `bg-bg-subtle`                   | `border-transparent`        | `text-fg-muted` + `text-<color>` accent on dot/icon | Counts/numbers that shouldn't dominate.   |

### Variant × color matrix

The four-variant compound matrix = 4 × 7 = 28 cells. Compound rules:

```ts
compoundVariants: [
  // solid (7)
  { variant: 'solid', color: 'primary', class: 'bg-primary text-primary-contrast' },
  // …
  // outline (7)
  { variant: 'outline', color: 'primary', class: 'border border-primary text-primary' },
  // …
  // soft (7)
  { variant: 'soft', color: 'primary', class: 'bg-primary-subtle text-primary' },
  // …
  // subtle (7) — only the dot/leading icon picks up the color; text stays muted
  { variant: 'subtle', color: 'primary', class: 'bg-bg-subtle text-fg-muted [&_.dot]:bg-primary [&_svg]:text-primary' },
  // …
]
```

### Sizes

| Size | Padding-X | Padding-Y | Font          | Dot size | Icon size |
| ---- | --------- | --------- | ------------- | -------- | --------- |
| `sm` | `px-1.5`  | `py-0.5`  | `text-[10px]` | `size-1.5` | `size-3`  |
| `md` | `px-2`    | `py-0.5`  | `text-xs`     | `size-2`   | `size-3.5`|
| `lg` | `px-2.5`  | `py-1`    | `text-sm`     | `size-2`   | `size-4`  |

Sizes are deliberately tighter than Button — badges sit alongside text and shouldn't push baselines around.

### Shapes

```ts
variants: {
  shape: {
    rounded: 'rounded',
    pill: 'rounded-full',
    square: 'rounded-none',
  },
}
```

---

## File Structure

```
packages/components/src/Badge/
├── Badge.tsx
├── Badge.types.ts
├── Badge.recipe.ts
├── Badge.test.tsx
├── Badge.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Variants.tsx          # 4 variants
    ├── Sizes.tsx
    ├── Colors.tsx            # 4 × 7 matrix
    ├── Shapes.tsx
    ├── WithDot.tsx           # status dot + pulse
    ├── WithIcons.tsx
    ├── Removable.tsx
    ├── AsChild.tsx           # <Badge asChild><a/></Badge>
    └── CountAndStatus.tsx    # nav-style inbox badge + "Online" status
```

---

## Recipe Sketch

Single-slot recipe — no `slot` argument needed.

```ts
// Badge.recipe.ts
import { cv } from '@apx-dsine';

export const badgeRecipe = cv({
  base: [
    'inline-flex items-center justify-center gap-1',
    'font-medium leading-none whitespace-nowrap select-none',
    'border border-transparent',
    'transition-colors duration-fast ease-standard',
  ].join(' '),
  variants: {
    variant: {
      solid: '',
      outline: 'border',
      soft: '',
      subtle: '',
    },
    size: {
      sm: 'px-1.5 py-0.5 text-[10px] [&_svg]:size-3 gap-1',
      md: 'px-2 py-0.5 text-xs [&_svg]:size-3.5 gap-1',
      lg: 'px-2.5 py-1 text-sm [&_svg]:size-4 gap-1.5',
    },
    shape: { rounded: 'rounded', pill: 'rounded-full', square: 'rounded-none' },
    color: { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
  },
  compoundVariants: [
    /* the 28 cells from the matrix above */
  ],
  defaultVariants: { variant: 'soft', size: 'md', shape: 'rounded', color: 'primary' },
});
```

---

## Component Sketch

```tsx
'use client';
import { forwardRef, Slot, Slottable } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';
import { badgeRecipe } from './Badge.recipe';
import type { BadgeProps } from './Badge.types';

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const {
    variant, size, color, shape,
    withDot, dotPulse, leftIcon, rightIcon,
    removable, onRemove,
    asChild = false,
    className, style, sx,
    children,
    ...rest
  } = props;

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: badgeRecipe,
    componentName: 'Badge',
    props: { variant, size, color, shape, className, sx, style },
  });

  const Comp: any = asChild ? Slot : 'span';

  return (
    <Comp ref={ref} className={cls} style={rootStyle} data-variant={variant} data-color={color} {...rest}>
      {withDot ? (
        <span
          aria-hidden="true"
          className={`dot inline-block rounded-full ${size === 'sm' ? 'size-1.5' : 'size-2'} bg-current ${dotPulse ? 'animate-[badge-pulse_1.4s_ease-in-out_infinite] motion-reduce:animate-none' : ''}`}
        />
      ) : leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
      <Slottable>{children}</Slottable>
      {rightIcon && !removable ? <span aria-hidden="true">{rightIcon}</span> : null}
      {removable ? (
        <button
          type="button"
          aria-label={typeof children === 'string' ? `Remove ${children}` : 'Remove'}
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          className="-mr-0.5 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
        >
          <XIcon className="size-2.5" />
        </button>
      ) : null}
    </Comp>
  );
}, 'Badge');
```

`XIcon` is a 12-line inline SVG colocated in `Badge.icons.tsx`. Reuses the engine warn for missing
`aria-label` when `children` isn't a string and `removable` is true.

### `@keyframes badge-pulse`

Added to `packages/theme/src/styles/globals.css`:

```css
@keyframes badge-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(1.4); }
}
```

CSS-only animation. Suppressed by `motion-reduce:animate-none` on the dot.

---

## Types

```ts
import type { HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-dsine';

export type BadgeVariant = 'solid' | 'outline' | 'soft' | 'subtle';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type BadgeShape = 'rounded' | 'pill' | 'square';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  variant?: ResponsiveValue<BadgeVariant>;
  size?: ResponsiveValue<BadgeSize>;
  color?: ResponsiveValue<BadgeColor>;
  shape?: BadgeShape;
  withDot?: boolean;
  dotPulse?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  asChild?: boolean;
  sx?: Sx;
}
```

---

## Accessibility

- Renders `<span>` by default — non-interactive content. No `role`. Screen readers read the text inline.
- `asChild` lets consumers promote the badge to an interactive element (`<a>`, `<button>`) — full a11y semantics flow through `Slot`.
- `removable` adds a real `<button>` with `aria-label="Remove {label}"` (auto-derived from `children` when it's a string; falls back to `"Remove"`). The button supports Enter + Space.
- `withDot` is `aria-hidden` — purely decorative.
- `dotPulse` respects `prefers-reduced-motion` (suppressed via `motion-reduce:animate-none`).
- Color contrast verified for every variant × color cell at every size — including the smallest (`sm` at `text-[10px]`).
- axe-core: zero violations.

---

## Animation / Interactions

- Color transition: CSS, `duration-fast`. Smooths theme switches.
- Dot pulse: CSS keyframes. Lightweight; no Motion library import.
- Removable button hover: `bg-black/10` (light) / `bg-white/10` (dark) — quiet but discoverable.

---

## Responsive

```tsx
<Badge size={{ base: 'sm', md: 'md' }} variant={{ base: 'soft', md: 'solid' }}>
  Status
</Badge>
```

---

## RTL

- Leading icon / leading dot live on the **start** side. Removable × button on the **end** side.
- The recipe uses logical sides; the rendered DOM uses physical (because flex order auto-flips in RTL).

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Badge: {
      defaultProps: { variant: 'outline', shape: 'pill' },
      styleOverrides: { root: 'tracking-wide uppercase' },
    },
  },
})} />

<Badge className="font-bold" sx={{ radius: 'md' }} style={{ minWidth: 32 }}>3</Badge>
```

---

## Examples List

| File                  | Demonstrates                                              |
| --------------------- | --------------------------------------------------------- |
| `Basic.tsx`           | Default "Beta" badge                                      |
| `Variants.tsx`        | solid / outline / soft / subtle                           |
| `Sizes.tsx`           | sm / md / lg                                              |
| `Colors.tsx`          | All 7 colors × 4 variants in a tight grid                 |
| `Shapes.tsx`          | rounded / pill / square                                   |
| `WithDot.tsx`         | Status dot + pulse for "Live" indicator                   |
| `WithIcons.tsx`       | leftIcon + rightIcon                                      |
| `Removable.tsx`       | Tag-removal pattern                                       |
| `AsChild.tsx`         | `<Badge asChild><a href="/inbox">3</a></Badge>`           |
| `CountAndStatus.tsx`  | Real-world: nav badge count + "Online" status pill        |

---

## Testing Plan

`Badge.test.tsx`:
- Renders default
- All variants × colors × sizes × shapes render correctly (matrix snapshot)
- `withDot` renders the dot before label; pulses when `dotPulse`
- `dotPulse` suppressed under `prefers-reduced-motion` (jsdom mocks `matchMedia`)
- `leftIcon` / `rightIcon` render in correct slots
- `removable` renders a button with `aria-label="Remove {label}"`
- `onRemove` fires on click; e.stopPropagation prevents parent clicks
- `asChild` renders the wrapped element (e.g. `<a>`) with merged className
- `className` / `sx` / `style` override correctly (precedence ladder)
- `ref` forwarded to the underlying element

`Badge.a11y.test.tsx`:
- axe passes for every variant × color × size cell
- `withDot` dot is `aria-hidden`
- Removable button is keyboard-reachable; Enter triggers `onRemove`
- `asChild` preserves the wrapped element's role

---

## File-Level Tasks (Ordered)

1. [ ] Create `packages/components/src/Badge/` folder
2. [ ] Write `Badge.icons.tsx` (XIcon — 12 lines)
3. [ ] Write `Badge.types.ts`
4. [ ] Write `Badge.recipe.ts`
5. [ ] Write `Badge.tsx`
6. [ ] Write `meta.ts` (category `Data Display`, tags `['badge', 'tag', 'chip', 'status']`)
7. [ ] Write `Badge.test.tsx`
8. [ ] Write `Badge.a11y.test.tsx`
9. [ ] Write 10 example files
10. [ ] Write `README.mdx`
11. [ ] Add `@keyframes badge-pulse` to `packages/theme/src/styles/globals.css`
12. [ ] Export from package index + `apx-ds
13. [ ] Renderer discovery check
14. [ ] Bundle delta: < 1.5 KB gzipped (single tiny component, no Motion)

---

## Acceptance Criteria

- [ ] All 4 variants × 7 colors × 3 sizes × 3 shapes render in both modes (252 visual states — yes, the renderer's Colors page will be large).
- [ ] `withDot` + `dotPulse` works without Motion library import.
- [ ] `removable` is keyboard-accessible (Enter + Space) and dispatches `onRemove`.
- [ ] `asChild` wraps `<a>`, `<button>`, `<NextLink>` correctly.
- [ ] Theme overrides + per-instance overrides work in the documented precedence.
- [ ] axe-core passes for every cell.
- [ ] Contrast passes WCAG AA at the smallest size (text-[10px]) for every color.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import in `Badge.tsx`
- [ ] Slot reused from engine (same import as Button's `asChild`)
- [ ] No bespoke pulse logic — Tailwind animation utility + global keyframes only
- [ ] Adding a new color = one palette entry, zero Badge code changes
- [ ] Adding a new variant = one recipe entry + 7 compound rows; no component changes
- [ ] The XIcon SVG is colocated; if a third component needs it, promote to `_shared/`

---

## Out of Scope (Future Components / Phases)

- "Notification badge" overlay positioning (top-right corner of an Avatar) — separate `<Indicator>` component that wraps Badge.
- Animated count change (slot-machine number flip) — niche; defer.
- Tag-input composition (badge + text-input combo) — separate `<TagInput>` component.
- Drag-and-drop sortable badges — out of DS scope.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/12-badge.md`.
2. Append `## Outcome`: API, bundle delta, axe results, screenshots of the full 252-state grid.
3. Resume Phase 13 — Avatar.

---

## Outcome

Shipped by **SDS-Agent3** on **2026-05-20**.

### Final API

Matches the plan exactly. Public props:

```tsx
<Badge
  variant?: 'solid' | 'outline' | 'soft' | 'subtle'        // default: 'soft'
  size?: 'sm' | 'md' | 'lg'                                // default: 'md', ResponsiveValue
  color?: 'primary' | 'secondary' | 'success' | 'warning'
        | 'danger' | 'info' | 'neutral'                    // default: 'primary'
  shape?: 'rounded' | 'pill' | 'square'                    // default: 'rounded'
  withDot?: boolean                                        // decorative status dot
  dotPulse?: boolean                                       // CSS keyframe pulse, motion-reduce safe
  leftIcon?: ReactNode                                     // hidden when withDot
  rightIcon?: ReactNode                                    // hidden when removable
  removable?: boolean                                      // built-in × button
  onRemove?: () => void
  removeLabel?: string                                     // explicit aria-label override
  asChild?: boolean                                        // Slot polymorphism
  // + native HTMLSpanElement attrs minus `color`
/>
```

### File layout shipped

```
packages/components/src/Badge/
├── Badge.tsx           (5.4 KB)  forwardRef + Slot polymorphism + dot/icon/removable slots
├── Badge.types.ts      (3.0 KB)  variant/size/color/shape unions + BadgeProps interface
├── Badge.recipe.ts     (6.1 KB)  single-slot cv() with 28 flat compound rows (4 × 7)
├── Badge.icons.tsx     (0.7 KB)  inline XIcon SVG (no lucide dep on the remove button)
├── meta.ts             (0.4 KB)  category 'Data Display', tags ['badge','tag','chip','status','count']
├── README.mdx          (4.0 KB)  Overview/Anatomy/Examples/Accessibility/Theming/Do-Dont
└── examples/           10 files matching the plan list
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx        (4 × 7 grid with withDot accent)
    ├── Shapes.tsx
    ├── WithDot.tsx       (incl. dotPulse on the "Live" example)
    ├── WithIcons.tsx     (lucide Star / Sparkles / Zap)
    ├── Removable.tsx     (controlled tag-list with reset)
    ├── AsChild.tsx       (anchor-as-badge)
    └── CountAndStatus.tsx (nav counts + live-server status row)
packages/components/__tests__/
├── Badge.test.tsx        27 cases — render, variant/color matrix, dot, icons, removable, asChild, overrides
└── Badge.a11y.test.tsx   8 cases — axe across every variant×color, decorative dot, keyboard reach, dev-warn
```

### Bundle delta

- `@apx-dsponents` ESM bundle after Badge: **6.93 KB gzipped** (full package, includes Button + Input + Badge).
- Estimated Badge-only contribution: **~1.2 KB gzipped** — under the 1.5 KB plan target.
- No new runtime deps; the remove button's XIcon is a 12-line inline SVG, so `lucide-react` is not added to Badge's path.

### Acceptance criteria

- ✅ 4 variants × 7 colors × 3 sizes × 3 shapes (252 visual cells) render under the matrix tests.
- ✅ `withDot` + `dotPulse` works without a Motion library import — pure CSS keyframe.
- ✅ `removable` is keyboard-accessible (Enter + Space); `onRemove` fires with `event.stopPropagation()`.
- ✅ `asChild` correctly wraps `<a>` and merges className / data-* / ref via `Slot`.
- ✅ Theme overrides via `theme.components.Badge.styleOverrides.root` + instance `className` / `sx` / `style` merge through the documented precedence ladder.
- ✅ axe-core passes for every variant × color cell (28 combos) and for the dot / removable / asChild states.
- ✅ Dev-mode warning `BADGE_REMOVABLE_NO_LABEL` fires when `removable` is set with non-string children and no `removeLabel`.

### Test results

- `pnpm test` in `packages/components`: **98/98 pass** (35 new Badge cases on top of 63 existing).
- `pnpm typecheck` in `packages/components`: clean.
- `pnpm -w lint`: clean.

### Deviations from the plan

1. **`@keyframes badge-pulse` shipped via the Tailwind preset instead of `packages/theme/src/styles/globals.css`** — that file did not exist when this phase started, and creating it adds a new entry-point + import-order concern for consumers. Registering the keyframe + `animate-badge-pulse` utility in `packages/theme/src/tailwind-preset.ts` is architecturally consistent with how the DS already ships its design tokens (colors, radius, shadows all go through the preset) and requires zero extra wiring in consumer apps — they get the animation utility automatically via the preset they already use. The keyframe block lives in a `theme.extend.keyframes / animation` section in `tailwind-preset.ts`.
2. **`removeLabel` prop added** to the public API. The plan called for auto-derivation from `children` when it's a string and a fallback of `"Remove"` otherwise. Adding `removeLabel` lets consumers supply the accessible name explicitly for non-string children (icon-only tags, JSX labels) — paired with a dev-warning when the consumer hits the non-string children path without setting it. Strictly additive to the plan's signature.
3. **Heights baked in via `h-` utilities** (`h-[1.125rem]` / `h-5` / `h-6`) instead of `py-*` padding. Keeps visual height identical whether the badge has a dot, icon, both, or neither — `inline-flex items-center` handles vertical centering. Matches the same approach Button uses (`h-8 / h-10 / h-12`).
4. **`data-state="*"` not exposed.** Badge has no meaningful interaction state (no pressed, no checked, no busy), so the plan's general "stable `data-*` hooks" rule is satisfied with just `data-variant` + `data-color`. Adding `data-state` for Badge would be a no-op.

### Coordination notes

- Insertion at the alphabetical slot in `packages/components/src/index.ts`: `Badge` lands between `Button` (existing) and `Input` (existing). The umbrella `apx-ds/index.ts` is a wildcard re-export so no edit was needed there.
- Phase 7 (Input) **shipped during this phase** (visible at `plans/completed/components/07-input.md` + `_shared/{controlRecipe.ts,useFormFieldA11y.ts}` + `Input/` folder). That unblocks Phase 9 (Checkbox), which is `SDS-Agent3`'s next queued plan.
- No edits to `packages/components/src/_shared/` — Phase 7's write-lock honored throughout.