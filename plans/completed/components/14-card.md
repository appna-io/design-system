# Phase 14 — `<Card />` + `Card.Header` + `Card.Body` + `Card.Footer` + `Card.Media`

> Status: **Pending** · Depends on: Phase 12 (Badge) + Phase 13 (Avatar) — both used in canonical examples · Blocks: none

## Objective

Ship the canonical content container — `<Card />` — as the DS's **first compound component**.
Card establishes the **`<Component.SubPart>` convention** the rest of the DS will follow when a
component naturally has named regions (Tabs, Accordion, Modal, Drawer, …).

Card itself is mostly trivial (a styled `<div>` with variants). The real work is the **subcomponent
pattern**: how subparts share context, how the recipe scales to a multi-part component, and how the
renderer documents a compound API on one page.

---

## What This Component Proves

- The DS can ship a **compound** primitive (`Card.Header`, `Card.Body`, …) with shared context.
- A single Card recipe handles **interaction states** (`hoverable`, `clickable`, `disabled`) without scattering classes across subparts.
- The renderer can document subparts inline (`README.mdx` references `Card.Header` and the props table picks them up).
- `asChild` on Card works even when Card carries internal padding/structure — Slot merges props onto a custom wrapper element (e.g. an `<a>`).

---

## Public API

```tsx
import { Card } from 'apx-ds';

<Card>
  <Card.Header
    title="Project Apollo"
    subtitle="Updated 3 minutes ago"
    avatar={<Avatar src="…" name="Ada" />}
    action={<Button size="sm">Edit</Button>}
  />
  <Card.Body>
    The mission is to put humans on the moon.
  </Card.Body>
  <Card.Footer align="end">
    <Button variant="ghost">Cancel</Button>
    <Button>Save</Button>
  </Card.Footer>
</Card>

<Card
  variant="outline"               // 'outline' (default) | 'solid' | 'elevated' | 'ghost'
  size="md"                       // 'sm' | 'md' | 'lg' — drives padding
  color="neutral"                 // 7-color palette — tints border/bg for accents
  shape="rounded"                 // 'rounded' (default) | 'square' | 'pill'

  hoverable={false}               // adds hover translate-y + shadow shift
  clickable={false}               // makes the root focusable + role=button
  disabled={false}                // dims + blocks pointer events
  selected={false}                // adds a colored ring to indicate selection

  orientation="vertical"          // 'vertical' (default) | 'horizontal' — affects Card.Media placement

  asChild={false}                 // wrap an <a>, <button>, etc.

  className=""
  style={{}}
  sx={{}}
  onClick={...}                   // only meaningful when `clickable` or `asChild` to a button/link
>
  …
</Card>

// Compound parts — each is a styled <div> with its own (small) recipe
<Card.Header  title subtitle avatar action />
<Card.Media   src alt aspectRatio="16/9" />
<Card.Body>           ← scrollable / wrappable content
<Card.Footer align="start|center|end|between" justify />
<Card.Divider />      ← thin separator between sections
```

### Prop Decisions

- **`Card.Header` has explicit slots** (`title`, `subtitle`, `avatar`, `action`) rather than asking consumers to compose with `<h3>` + `<p>`. This is the most-overlooked source of accessibility regressions in DS cards — by accepting `title`/`subtitle` as props, the component renders the right heading level + spacing every time.
- **`hoverable` is separate from `clickable`** — a card might lift on hover (purely cosmetic) without being interactive.
- **`clickable={true}` automatically wires `role="button"` + `tabIndex=0` + Enter/Space handlers.** Equivalent to using `asChild` with `<button>` but doesn't require the consumer to lift the wrapper.
- **`orientation="horizontal"` is the **"media on the side"** layout** — Card.Media sits at the start (or end), Body fills the rest. Used for blog post lists, search results.
- **`selected` is a state, not a variant** — visually overlays a ring on top of any variant. Cards in a multi-select context (grid of options) show selection without changing their entire look.

---

## Variants — Designed Inline

Four variants. Each defines the **edge + background** story:

| Variant    | Background      | Border             | Shadow          | When to use                                       |
| ---------- | --------------- | ------------------ | --------------- | ------------------------------------------------- |
| `outline`  | `bg-bg-paper`   | `border-border` 1px| none            | **Default.** Conventional bordered card.          |
| `solid`    | `bg-bg-subtle`  | `border-transparent`| none           | Quiet, edgeless; pairs well with dense layouts.   |
| `elevated` | `bg-bg-paper`   | `border-transparent`| `shadow-md`    | Surfaced content (modals look like elevated cards).|
| `ghost`    | `bg-transparent`| `border-transparent`| none           | "Container only when hovered"; for grid hover-cards.|

### Variant × color matrix

Color drives the **selected ring** + the **hoverable-state border tint** — not the body bg. Body
bg stays palette-neutral so cards don't shout for attention. Compound rules:

```ts
compoundVariants: [
  // hover state — tint border to color
  { hoverable: true, color: 'primary', class: 'hover:border-primary/50' },
  // …6 more
  // selected ring — uses ring-color
  { selected: true, color: 'primary',
    class: 'ring-2 ring-primary ring-offset-2 ring-offset-bg' },
  // …6 more
  // elevated + hoverable — shadow grows on hover
  { variant: 'elevated', hoverable: true,
    class: 'hover:shadow-lg hover:-translate-y-px' },
]
```

### Sizes

Sizes drive `padding`. Subcomponents inherit via context.

| Size | Header/Body/Footer padding | Gap between sections |
| ---- | -------------------------- | -------------------- |
| `sm` | `p-3`                      | `gap-2`              |
| `md` | `p-4`                      | `gap-3`              |
| `lg` | `p-6`                      | `gap-4`              |

### Shapes

```ts
variants: {
  shape: {
    rounded: 'rounded-lg',
    square:  'rounded-none',
    pill:    'rounded-2xl',
  },
}
```

### Orientation

```ts
variants: {
  orientation: {
    vertical:   'flex flex-col',
    horizontal: 'flex flex-row',
  },
}
```

`horizontal` makes `Card.Media` width-bounded instead of height-bounded — the media slot reads
`orientation` from context.

---

## File Structure

```
packages/components/src/Card/
├── Card.tsx                  # root component
├── CardHeader.tsx
├── CardBody.tsx
├── CardFooter.tsx
├── CardMedia.tsx
├── CardDivider.tsx
├── Card.types.ts             # types for root + each subpart
├── Card.recipe.ts            # six recipes: root, header, body, footer, media, divider
├── CardContext.ts            # shared context (size, orientation)
├── index.ts                  # exports the namespace: { Card } with subparts attached
├── Card.test.tsx
├── Card.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx           # selected/hoverable interactions per color
    ├── Shapes.tsx
    ├── HeaderActions.tsx    # title + subtitle + avatar + action
    ├── WithMedia.tsx        # vertical
    ├── Horizontal.tsx       # orientation="horizontal" + media on the side
    ├── Hoverable.tsx
    ├── Clickable.tsx
    ├── Selected.tsx         # grid-of-options selection pattern
    ├── AsChild.tsx          # <Card asChild><a /></Card>
    └── Composed.tsx         # Avatar + Badge + Buttons inside a Card — the canonical demo
```

### Index file pattern

```ts
// Card/index.ts
import { Card as CardRoot } from './Card';
import { CardHeader }  from './CardHeader';
import { CardBody }    from './CardBody';
import { CardFooter }  from './CardFooter';
import { CardMedia }   from './CardMedia';
import { CardDivider } from './CardDivider';

export const Card = Object.assign(CardRoot, {
  Header:  CardHeader,
  Body:    CardBody,
  Footer:  CardFooter,
  Media:   CardMedia,
  Divider: CardDivider,
});
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps, CardMediaProps } from './Card.types';
```

This is the **canonical pattern for every future compound component** in the DS. Tabs (Phase 16),
Accordion, Modal will all `Object.assign` their root with subparts. Documenting it here
once means later phases never have to rediscover it.

---

## Recipe Sketch

```ts
// Card.recipe.ts
import { cv } from '@apx-dsine';

export const cardRecipes = {
  root: cv({
    base: [
      'group relative overflow-hidden',
      'transition-[transform,box-shadow,border-color,background-color] duration-fast ease-standard',
      'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
    ].join(' '),
    variants: {
      variant: {
        outline:  'border border-border bg-bg-paper',
        solid:    'border border-transparent bg-bg-subtle',
        elevated: 'border border-transparent bg-bg-paper shadow-md',
        ghost:    'border border-transparent bg-transparent',
      },
      size: { sm: '', md: '', lg: '' },                  // size only affects subpart padding
      shape: { rounded: 'rounded-lg', square: 'rounded-none', pill: 'rounded-2xl' },
      orientation: { vertical: 'flex flex-col', horizontal: 'flex flex-row' },
      color: { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
      hoverable: { true: 'hover:-translate-y-px hover:shadow-md' },
      clickable: { true: 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2' },
      selected:  { true: '' },
    },
    compoundVariants: [
      /* see "Variant × color matrix" above */
    ],
    defaultVariants: { variant: 'outline', size: 'md', shape: 'rounded', orientation: 'vertical', color: 'neutral', hoverable: false, clickable: false, selected: false },
  }),
  header: cv({
    base: 'flex items-start gap-3',
    variants: { size: { sm: 'p-3', md: 'p-4', lg: 'p-6' } },
    defaultVariants: { size: 'md' },
  }),
  body: cv({
    base: 'text-fg-default',
    variants: { size: { sm: 'px-3 pb-3', md: 'px-4 pb-4', lg: 'px-6 pb-6' } },
    defaultVariants: { size: 'md' },
  }),
  footer: cv({
    base: 'flex items-center',
    variants: {
      size: { sm: 'p-3 gap-2', md: 'p-4 gap-2', lg: 'p-6 gap-3' },
      align: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
      },
    },
    defaultVariants: { size: 'md', align: 'end' },
  }),
  media: cv({
    base: 'overflow-hidden bg-bg-subtle',
    variants: {
      orientation: {
        vertical:   'w-full',
        horizontal: 'h-full w-2/5 shrink-0',
      },
    },
    defaultVariants: { orientation: 'vertical' },
  }),
  divider: cv({ base: 'h-px w-full bg-border' }),
};
```

---

## Context

```ts
// CardContext.ts
import { createContext, useContext } from 'react';
import type { CardSize, CardOrientation } from './Card.types';

interface CardContextValue {
  size: CardSize;
  orientation: CardOrientation;
}

export const CardContext = createContext<CardContextValue>({ size: 'md', orientation: 'vertical' });
export const useCardContext = () => useContext(CardContext);
```

The root provides; subparts read. No render-prop gymnastics.

---

## Component Sketch — Root

```tsx
'use client';
import { forwardRef, Slot } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';
import { CardContext } from './CardContext';
import { cardRecipes } from './Card.recipe';
import type { CardProps } from './Card.types';

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(props, ref) {
  const {
    variant, size = 'md', color, shape, orientation = 'vertical',
    hoverable, clickable, disabled, selected,
    asChild = false,
    className, style, sx,
    children, onClick, onKeyDown,
    ...rest
  } = props;

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: cardRecipes.root,
    componentName: 'Card',
    slot: 'root',
    props: { variant, size, color, shape, orientation, hoverable, clickable, selected, className, sx, style },
  });

  const interactive = clickable && !disabled;
  const Comp: any = asChild ? Slot : 'div';

  return (
    <CardContext.Provider value={{ size, orientation }}>
      <Comp
        ref={ref}
        className={cls}
        style={rootStyle}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        data-selected={selected || undefined}
        onClick={interactive ? onClick : undefined}
        onKeyDown={(e) => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            (e.currentTarget as HTMLElement).click();
          }
          onKeyDown?.(e);
        }}
        {...rest}
      >
        {children}
      </Comp>
    </CardContext.Provider>
  );
}, 'Card');
```

---

## Subcomponent Sketches (abbreviated)

```tsx
// CardHeader.tsx
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(props, ref) {
  const { title, subtitle, avatar, action, children, className, style, sx, ...rest } = props;
  const { size } = useCardContext();
  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: cardRecipes.header,
    componentName: 'Card',
    slot: 'header',
    props: { size, className, sx, style },
  });
  return (
    <div ref={ref} className={cls} style={rootStyle} {...rest}>
      {avatar ? <div className="shrink-0">{avatar}</div> : null}
      <div className="flex-1 min-w-0">
        {title ? <div className="font-semibold leading-snug truncate">{title}</div> : null}
        {subtitle ? <div className="text-sm text-fg-muted leading-snug truncate">{subtitle}</div> : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}, 'Card.Header');

// CardBody.tsx — direct passthrough with body recipe
// CardFooter.tsx — direct passthrough with align variant
// CardMedia.tsx — wraps an <img> or arbitrary child in the media recipe; respects orientation from context
// CardDivider.tsx — a styled <hr>
```

---

## Types

```ts
import type { HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-dsine';

export type CardVariant = 'outline' | 'solid' | 'elevated' | 'ghost';
export type CardSize = 'sm' | 'md' | 'lg';
export type CardColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type CardShape = 'rounded' | 'square' | 'pill';
export type CardOrientation = 'vertical' | 'horizontal';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  variant?: ResponsiveValue<CardVariant>;
  size?: ResponsiveValue<CardSize>;
  color?: CardColor;
  shape?: CardShape;
  orientation?: CardOrientation;
  hoverable?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  selected?: boolean;
  asChild?: boolean;
  sx?: Sx;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  subtitle?: ReactNode;
  avatar?: ReactNode;
  action?: ReactNode;
  sx?: Sx;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> { sx?: Sx; }
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between';
  sx?: Sx;
}
export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  aspectRatio?: '1/1' | '4/3' | '16/9' | '21/9' | string;
  sx?: Sx;
}
```

---

## Accessibility

- Non-interactive Card → plain `<div>`, no role, content reads naturally.
- `clickable={true}` → `role="button"`, `tabIndex=0`, Enter/Space activate. Focus ring on the Card itself.
- `disabled` → `aria-disabled="true"` + pointer events blocked.
- `Card.Header` `title` renders as a `<div>` with `font-semibold` — **does not** auto-emit an `<h3>`. Consumers control heading hierarchy (a Card inside a section under an `<h2>` shouldn't blindly emit an `<h3>`). Documentation guides consumers to wrap title in their own heading when needed (`title={<h3>…</h3>}`).
- `subtitle` is sibling text, not a heading.
- `Card.Media` renders an `<img>` with proper `alt` — required when `src` is set. Dev-warn if missing.
- `selected` adds `data-selected="true"` so screen-reader live regions / surrounding `aria-pressed` patterns can sync.
- axe-core: zero violations across the matrix.

---

## Animation / Interactions

- Hover lift: `hover:-translate-y-px hover:shadow-md`. CSS only. Honors `motion-reduce`.
- Selected ring: `ring-*` Tailwind. Instant.
- No Motion library usage. Card transitions are tasteful CSS.

---

## Responsive

```tsx
<Card
  orientation={{ base: 'vertical', md: 'horizontal' }}
  size={{ base: 'sm', md: 'md' }}
>
  …
</Card>
```

Orientation switching is the most-asked responsive feature for Card (mobile = stacked, desktop = side-by-side).

---

## RTL

- Padding + gaps are logical (Tailwind v4 default).
- `Card.Media` in `horizontal` orientation sits at the **start** (logical), so it auto-flips.
- `Card.Header` action sits at the logical end.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Card: {
      defaultProps: { variant: 'elevated', size: 'lg' },
      styleOverrides: {
        root:   'border-2',
        header: 'border-b border-border',
        footer: 'border-t border-border bg-bg-subtle/50',
      },
    },
  },
})} />

<Card className="ring-1 ring-primary/20" sx={{ radius: 'xl' }}>
  …
</Card>
```

Per-slot overrides are exercised heavily here — Card is the consumer that most pushes the `slot`
argument on `useThemedClasses` introduced in Phase 7.

---

## Examples List

| File                  | Demonstrates                                              |
| --------------------- | --------------------------------------------------------- |
| `Basic.tsx`           | Default card with text                                    |
| `Variants.tsx`        | outline / solid / elevated / ghost                        |
| `Sizes.tsx`           | sm / md / lg padding                                      |
| `Colors.tsx`          | Selected + hoverable color cells                          |
| `Shapes.tsx`          | rounded / square / pill                                   |
| `HeaderActions.tsx`   | title + subtitle + avatar + action                        |
| `WithMedia.tsx`       | Vertical card with Card.Media at top                      |
| `Horizontal.tsx`      | orientation="horizontal" + media at side                  |
| `Hoverable.tsx`       | Hover lift                                                |
| `Clickable.tsx`       | Whole-card click target with keyboard support             |
| `Selected.tsx`        | Grid of selectable cards                                  |
| `AsChild.tsx`         | `<Card asChild><a /></Card>` — link card pattern          |
| `Composed.tsx`        | Avatar + Badge + Buttons inside — the canonical demo      |

---

## Testing Plan

`Card.test.tsx`:
- Renders default
- All variants × colors × sizes × shapes × orientations render correctly
- `hoverable` adds hover translate + shadow classes
- `clickable` sets `role="button"`, `tabIndex=0`
- Enter and Space on a clickable Card fire `onClick`
- `disabled` blocks `onClick` + sets `aria-disabled`
- `selected` adds `data-selected="true"` + ring classes
- `Card.Header` renders title, subtitle, avatar, action in correct slots
- `Card.Header` truncates long titles/subtitles
- `Card.Media` warns when `src` is set and `alt` is missing
- `Card.Footer` align prop maps to correct `justify-*` class
- Subparts read size from context (changing root size affects all subparts)
- `asChild` wraps a custom element
- Theme `styleOverrides.{ root, header, body, footer, media, divider }` all merge correctly
- `ref` forwarded to the root element

`Card.a11y.test.tsx`:
- axe passes for every variant cell, with and without `clickable`
- `clickable` Card is keyboard-reachable; activates with Enter and Space
- `disabled` Card is not focusable
- `Card.Media` warns when missing `alt`

---

## File-Level Tasks (Ordered)

1. [ ] Create `packages/components/src/Card/` folder
2. [ ] Write `Card.types.ts`
3. [ ] Write `Card.recipe.ts` (six recipes)
4. [ ] Write `CardContext.ts`
5. [ ] Write `Card.tsx` (root)
6. [ ] Write `CardHeader.tsx`, `CardBody.tsx`, `CardFooter.tsx`, `CardMedia.tsx`, `CardDivider.tsx`
7. [ ] Write `index.ts` (the `Object.assign(Card, { Header, Body, … })` pattern)
8. [ ] Write `meta.ts` (category `Surfaces`, tags `['card', 'container', 'layout']`)
9. [ ] Write `Card.test.tsx`, `Card.a11y.test.tsx`
10. [ ] Write 13 example files
11. [ ] Write `README.mdx` (documents root + each subpart inline, with prop tables for each)
12. [ ] Export `Card` from package index + `apx-ds
13. [ ] Renderer: discover compound components — confirm the page renders all subparts. May require a tiny extension to `discover.ts` to support multi-component-per-directory (the renderer should auto-find `CardHeader.tsx`, `CardBody.tsx`, … and emit props tables for each)
14. [ ] Bundle delta: < 4 KB gzipped (six recipes + context + five subparts)

---

## Acceptance Criteria

- [ ] `Card.Header / Body / Footer / Media / Divider` all render and respect parent size via context.
- [ ] All 4 variants × 7 colors × 3 sizes × 3 shapes × 2 orientations render in both modes.
- [ ] `hoverable`, `clickable`, `disabled`, `selected` behave per the spec.
- [ ] `clickable` Card is keyboard-accessible (Enter + Space).
- [ ] `asChild` wraps `<a>` / `<button>` correctly without losing internal structure.
- [ ] Theme `styleOverrides.{ root, header, body, footer, media, divider }` all work independently.
- [ ] RTL: orientation="horizontal" places media on the logical start.
- [ ] axe-core passes for every cell.
- [ ] `Object.assign(Card, { Header, … })` pattern is documented in `Card/index.ts` with a comment so the next compound-component author (Tabs, Phase 16) copies it directly.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import in any Card subpart
- [ ] All subparts read size from `CardContext` — no prop drilling
- [ ] The recipe map (six recipes in one file) is the template for any future compound component
- [ ] Subparts use the `useThemedClasses({ componentName: 'Card', slot: '<part>' })` form — one componentName, many slots
- [ ] Adding a new color = one palette entry; selected + hoverable cells pick it up automatically
- [ ] Adding a new variant = one recipe row + variant-color rows; subparts unaffected

---

## Out of Scope (Future Components / Phases)

- `Card.Action` slot — handled via `Card.Footer` for now; promote if a clear pattern emerges.
- Animated reorder of grid cards — DnD is consumer territory.
- Sticky header on scroll inside a Card.Body — niche; document the technique in `README.mdx` but no API.
- Card "preview" mode (skeleton state) — `<Skeleton>` ships in a later batch.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/14-card.md`.
2. Append `## Outcome`: API, bundle delta, axe results, the `Object.assign` namespace pattern's reception.
3. Resume Phase 15 — Alert.

---

## Outcome

**Status: Shipped 2026-05-20** by SDS-Agent5.

### What landed

- Six-recipe compound primitive in `packages/components/src/Card/`:
  - `Card.tsx` (root) + 5 subparts: `CardHeader`, `CardBody`, `CardFooter`, `CardMedia`, `CardDivider`.
  - `Card.recipe.ts` exports a `cardRecipes` map keyed by slot (`root` / `header` / `body` / `footer` / `media` / `divider`) — each consumed via `useThemedClasses({ componentName: 'Card', slot: '<key>' })` so theme `styleOverrides` slot independently into every region.
  - `CardContext` propagates `size` + `orientation` to subparts so consumers set density once at the root and the entire stack reflows. Subparts expose **zero** `size` props by design.
  - `index.ts` assembles the namespace via `Object.assign(CardRoot, { Header, Body, Footer, Media, Divider })`. A long doc comment at the top of that file declares this the **canonical compound-component assembly pattern** for every future primitive (Tabs / Accordion / Modal / Drawer copy this verbatim).

- Public API: 4 variants × 7 colors × 3 sizes × 3 shapes × 2 orientations + `hoverable` / `clickable` / `disabled` / `selected` / `asChild`. Color **does not repaint the body** — it drives the hover-border tint, the selected ring, and the `clickable` focus-ring color (DRY accent story; new palette role = automatic re-paint, zero Card-side changes).

- `clickable` wires `role="button"`, `tabIndex=0`, and Enter/Space activation on the root. `disabled` blocks clicks and sets `aria-disabled`. `asChild` correctly delegates role/keyboard semantics to the wrapped element (so an `<a>` stays a link, a `<button>` stays a button).

- `Card.Media` renders a real `<img>` when `src` is set (with dev-only warning if `alt` is missing), arbitrary children otherwise. `aspectRatio` is passed through as the native CSS property so any `W/H` ratio is supported (`16/9`, `21/9`, `1/1`, …).

### QA gate

- **Tests: 416/416 ✅** across the full components package (60 new Card tests — 51 unit + 9 a11y).
- **Typecheck: ✅** (Card-scoped; pre-existing Accordion/Progress WIP errors from sibling agents not introduced by this phase).
- **Lint: ✅** for `src/Card/**` + `__tests__/Card{,.a11y}.test.tsx`.
- **axe-core: ✅** across the variant × color matrix, plus the `clickable + selected + hoverable`, `asChild={true}` (wrapping `<a>`), `orientation="horizontal" + media`, and `disabled` cells.
- **Build: ✅** `@apx-dsponents` + `apx-apx-dsboth carry the Card export.

### Bundle delta

- `dist/index.js` (ESM) went from **122.67 KB → 123.20 KB**, i.e. **+0.53 KB minified** for the entire Card namespace (root + 5 subparts + 6 recipes + context). Comfortably under the **< 4 KB gz** target from the plan; the recipe map shares a lot of literal-text classes that bundlers (and Tailwind's content scanner) deduplicate well.

### Compound-component pattern reception

- `Card/index.ts` carries the canonical `Object.assign` assembly with a doc comment that explicitly tells future compound-component authors (Tabs, Accordion, Modal, Drawer) to copy its shape. The `Card.<SubPart>` dot syntax means consumers never need to import subparts individually, and tree-shaking still works because every subpart is a named export under the hood.
- Subparts read shared state from `CardContext` rather than accepting their own size/orientation prop — establishes the rule that **subparts never duplicate root-owned axes**. Future compound components inherit this convention.

### Coordination notes for downstream phases

- **Tabs (16)**, **Accordion (26)**, **Modal**, **Drawer**: Copy `Card/index.ts`'s `Object.assign` block verbatim. Same component-context shape (`createContext` + `useXxxContext()` in `XxxContext.tsx`). Same one-recipe-per-slot layout in `Xxx.recipe.ts` consumed via `useThemedClasses({ componentName, slot })`.
- **Renderer (`apps/renderer/src/lib/discover.ts`)**: No multi-component-per-directory extension turned out to be necessary for Phase 14 — Card's API is documented inline in `README.mdx` with `<ExampleBlock>` shortcodes (13 of them) and the consumer never reaches for subparts via a separate URL. Defer the props-table extension until Tabs lands and we know whether sub-prop tables are actually demanded.
- **Hot-surface coordination**: `packages/components/src/index.ts` got a `Card` export block inserted alphabetically between `Button` and `Checkbox` via surgical `StrReplace` (no full-file overwrites). Index file is now: Alert, Avatar, Badge, Button, **Card**, Checkbox, Input, Progress, Switch, Textarea — alphabetical and complete.
- **README/ExampleBlock**: Card's README uses 13 `<ExampleBlock for="…" title="…" />` shortcodes (no fenced code blocks) — the renderer mounts live previews for each. Same fix applied to `Avatar/README.mdx` (was 3 fenced code blocks) per Agent4's hot-tip after he hit it on Alert.

### Logged deviations

- **`CardShape`** uses `square` (not `sharp`) to match the existing DS-wide convention from Badge/Button.
- **`CardHeader` omits the native `HTMLAttributes['title']`** (tooltip string) so the `title?: ReactNode` slot can accept a heading element. Consumers needing a tooltip on a `Card.Header` wrap the header in an element with `title=""` directly.
- **`color` does not paint the body background** — explicit deviation from the plan's literal wording, with rationale in `Card.recipe.ts`'s top comment. Tinted bodies overwhelm content; the accent story (hover border + selected ring + focus ring) handles the role-color need without the visual noise.
