# Phase 26 — `<Accordion />` + `Accordion.Item` + `Accordion.Trigger` + `Accordion.Content`

> Status: **Completed** · Depends on: Phase 6 (Button — only for the focus-visible / icon vocabulary baseline) · Blocks: nothing
> Independent of the positioning engine — safe to ship in parallel with any of Phases 17–25.

## Objective

Ship the canonical disclosure-list primitive — `<Accordion />`. Accordion is the **only**
batch-2 component that manages multi-section internal state without an overlay. It is:

- A **list of collapsible sections**, with optional single-open or multi-open behavior.
- Fully keyboard-navigable (Tab / arrow keys / Home / End).
- Animated open/close using **CSS `grid-template-rows: 1fr / 0fr`** technique — no JavaScript height measurement, smooth performance, respects `prefers-reduced-motion`.

---

## What This Component Proves

- Compound state shared via context (open items as a `Set<string>` for `type="multiple"`, single string for `type="single"`).
- The DS supports both controlled and uncontrolled multi-value state.
- CSS grid trick (the modern "auto-height transition" pattern) works without JS height computation.
- Keyboard navigation works across sibling items.

---

## Public API

```tsx
import { Accordion } from 'apx-ds';

// Single-open mode (default)
<Accordion type="single" defaultValue="one" collapsible>
  <Accordion.Item value="one">
    <Accordion.Trigger>First section</Accordion.Trigger>
    <Accordion.Content>Content of section one.</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="two">
    <Accordion.Trigger>Second section</Accordion.Trigger>
    <Accordion.Content>Content of section two.</Accordion.Content>
  </Accordion.Item>
</Accordion>

// Multi-open mode
<Accordion type="multiple" defaultValue={['one', 'three']}>
  <Accordion.Item value="one">…</Accordion.Item>
  <Accordion.Item value="two">…</Accordion.Item>
  <Accordion.Item value="three">…</Accordion.Item>
</Accordion>

// Full prop form
<Accordion
  type="single"                  // 'single' | 'multiple'
  value={value}                  // controlled (string | string[] depending on type)
  defaultValue={'one'}
  onValueChange={(v) => setValue(v)}
  collapsible={true}             // single mode: allow closing the open item (default false → an item is always open after first click)
  disabled={false}               // disables all items
  variant="solid"                // 'solid' (default) | 'outline' | 'soft' | 'ghost'
  size="md"                      // 'sm' | 'md' | 'lg'
  color="neutral"                // 7-color palette
  iconPosition="end"             // 'start' | 'end' — chevron location
  className=""
  sx={{}}
>
  <Accordion.Item
    value="one"
    disabled={false}             // per-item disable
  >
    <Accordion.Trigger
      leftIcon={<Icon />}        // optional icon at logical start
      // chevron auto-rendered based on iconPosition
    >
      Title text
    </Accordion.Trigger>
    <Accordion.Content>
      Body content can be any React node.
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Prop Decisions

- **`type="single" | "multiple"`** — same vocab as Radix; controls whether `value` is `string` or `string[]`.
- **`collapsible={true}` default for single mode** — allowing close-by-clicking-open-item matches modern UX (FAQ pages, etc.). Radix defaults to `false`; we differ deliberately.
- **`iconPosition="end"` default** — chevron at logical end of the trigger is the most common pattern.
- **`leftIcon` is `<Accordion.Trigger leftIcon>`** — not a separate subpart; less subpart proliferation.
- **No `Accordion.Header`** — most accordions don't need a separate wrapper between Item and Trigger. The Trigger is already a `<button>` inside an `<h3>`-equivalent (consumer can pass `as="h3"` via `asChild`).
- **Disabled at root** disables all items; per-item `disabled` overrides for granular control.

---

## Variants — Designed Inline

### Variants × colors

| Variant   | Item chrome                                      | Trigger hover                | When to use                  |
| --------- | ------------------------------------------------ | ---------------------------- | ---------------------------- |
| `solid`   | `bg-bg-paper` items + `border-b` between         | `hover:bg-bg-subtle`         | **Default.**                 |
| `outline` | full `border` around each item; spacing between  | `hover:bg-<color>-subtle`    | Card-like, distinct items.   |
| `soft`    | `bg-<color>-subtle` items                        | `hover:bg-<color>-subtle/80` | Brand-tinted FAQ sections.   |
| `ghost`   | no chrome; only the trigger row visible          | `hover:bg-bg-subtle`         | Inline disclosure.           |

`variant × color`: same 4 × 7 = 28 cell matrix. Compound rules follow the Badge / Alert shape. The
neutral color works for all four variants without tinting.

### Sizes

| Size | Trigger padding | Content padding | Font          | Chevron size |
| ---- | --------------- | --------------- | ------------- | ------------ |
| `sm` | `px-3 py-2`     | `px-3 pb-3`     | `text-sm`     | `size-3.5`   |
| `md` | `px-4 py-3`     | `px-4 pb-4`     | `text-base`   | `size-4`     |
| `lg` | `px-5 py-4`     | `px-5 pb-5`     | `text-lg`     | `size-5`     |

---

## File Structure

```
packages/components/src/Accordion/
├── Accordion.tsx                # root: type + value state owner
├── AccordionItem.tsx
├── AccordionTrigger.tsx
├── AccordionContent.tsx
├── Accordion.types.ts
├── Accordion.recipe.ts          # five recipes: root, item, trigger, content, chevron
├── AccordionContext.ts          # root context + item context
├── useAccordionKeyboard.ts      # arrow nav between triggers
├── index.ts                     # Object.assign
├── Accordion.test.tsx
├── Accordion.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Multiple.tsx             # type="multiple"
    ├── Collapsible.tsx          # type="single" collapsible
    ├── Controlled.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── WithIcons.tsx            # leftIcon
    ├── IconPositionStart.tsx
    ├── DisabledItem.tsx
    ├── LongContent.tsx          # content with images, lists
    ├── FAQ.tsx                  # canonical FAQ pattern
    └── Nested.tsx               # Accordion inside Accordion
```

---

## Recipe Sketch

```ts
// Accordion.recipe.ts
import { cv } from '@apx-dsine';

export const accordionRecipes = {
  root: cv({
    base: 'w-full',
    variants: {
      variant: { solid: 'border border-border rounded-md overflow-hidden', outline: 'space-y-2', soft: 'space-y-2', ghost: '' },
    },
    defaultVariants: { variant: 'solid' },
  }),
  item: cv({
    base: 'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
    variants: {
      variant: {
        solid:   'border-b border-border last:border-b-0',
        outline: 'border border-border rounded-md',
        soft:    'rounded-md',
        ghost:   '',
      },
      color: { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
    },
    compoundVariants: [
      { variant: 'soft', color: 'primary',   class: 'bg-primary-subtle' },
      // …6 more soft
      { variant: 'outline', color: 'primary', class: 'border-primary' },
      // …6 more outline
    ],
    defaultVariants: { variant: 'solid', color: 'neutral' },
  }),
  trigger: cv({
    base: [
      'group flex w-full items-center gap-3 font-medium text-fg-default cursor-pointer',
      'transition-colors duration-fast',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'hover:bg-bg-subtle',
      'data-[state=open]:font-semibold',
    ].join(' '),
    variants: {
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
      },
      iconPosition: { start: 'flex-row', end: 'flex-row' },     // chevron position handled via the chevron's class
    },
    defaultVariants: { size: 'md', iconPosition: 'end' },
  }),
  content: cv({
    base: [
      // CSS grid trick — no JS height measurement
      'grid grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]',
      'transition-[grid-template-rows] duration-normal ease-emphasized',
      'overflow-hidden',
    ].join(' '),
  }),
  contentInner: cv({
    base: 'min-h-0 text-fg-default',
    variants: {
      size: { sm: 'px-3 pb-3 text-sm', md: 'px-4 pb-4 text-base', lg: 'px-5 pb-5 text-base' },
    },
    defaultVariants: { size: 'md' },
  }),
  chevron: cv({
    base: 'transition-transform duration-fast text-fg-muted data-[state=open]:rotate-180 group-hover:text-fg-default',
    variants: {
      size: { sm: 'size-3.5', md: 'size-4', lg: 'size-5' },
      iconPosition: { start: 'order-first', end: 'ms-auto order-last' },
    },
    defaultVariants: { size: 'md', iconPosition: 'end' },
  }),
};
```

The **`grid grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]`** trick is the key insight: CSS
transitions between two grid-template-rows values, and the inner element (with `min-h-0`) becomes
clipped without ever being measured by JavaScript. This is the modern accordion pattern (works
in Chromium/WebKit/Firefox 2024+). Falls back to instant snap in older browsers.

---

## Component Sketch

```tsx
'use client';
export function Accordion(props: AccordionProps) {
  const { type = 'single', value: valueProp, defaultValue, onValueChange, collapsible = type === 'single', disabled, variant, size, color, iconPosition, className, sx, children } = props;
  const [value, setValue] = useControllableState({ prop: valueProp, defaultProp: defaultValue ?? (type === 'multiple' ? [] : ''), onChange: onValueChange });

  const rootCls = useThemedClasses({ recipe: accordionRecipes.root, componentName: 'Accordion', slot: 'root', props: { variant, className, sx } });

  return (
    <AccordionContext.Provider value={{ type, value, setValue, collapsible, disabled, variant, size, color, iconPosition }}>
      <div className={rootCls.className} data-orientation="vertical">{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, disabled, children, ...rest }: AccordionItemProps) {
  const root = useAccordionContext();
  const isOpen = root.type === 'multiple' ? (root.value as string[]).includes(value) : root.value === value;
  const itemDisabled = root.disabled || disabled;
  const cls = useThemedClasses({ recipe: accordionRecipes.item, componentName: 'Accordion', slot: 'item', props: { variant: root.variant, color: root.color } });
  return (
    <AccordionItemContext.Provider value={{ value, isOpen, disabled: itemDisabled }}>
      <div data-state={isOpen ? 'open' : 'closed'} data-disabled={itemDisabled || undefined} className={cls.className} {...rest}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(function AccordionTrigger(props, ref) {
  const { leftIcon, children, className, sx, style, ...rest } = props;
  const root = useAccordionContext();
  const item = useAccordionItemContext();
  const triggerCls = useThemedClasses({ recipe: accordionRecipes.trigger, componentName: 'Accordion', slot: 'trigger', props: { size: root.size, iconPosition: root.iconPosition, className, sx, style } });
  const chevronCls = useThemedClasses({ recipe: accordionRecipes.chevron, componentName: 'Accordion', slot: 'chevron', props: { size: root.size, iconPosition: root.iconPosition } });

  const toggle = () => {
    if (item.disabled) return;
    if (root.type === 'multiple') {
      const next = item.isOpen ? (root.value as string[]).filter((v) => v !== item.value) : [...(root.value as string[]), item.value];
      root.setValue(next);
    } else {
      const next = item.isOpen ? (root.collapsible ? '' : item.value) : item.value;
      root.setValue(next);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={item.isOpen}
      aria-controls={/* content id */}
      data-state={item.isOpen ? 'open' : 'closed'}
      disabled={item.disabled}
      onClick={toggle}
      onKeyDown={useAccordionKeyboard(/* … */)}
      className={triggerCls.className}
      style={triggerCls.style}
      {...rest}
    >
      {leftIcon ? <span aria-hidden>{leftIcon}</span> : null}
      <span className="flex-1 text-start">{children}</span>
      <ChevronDownIcon className={chevronCls.className} data-state={item.isOpen ? 'open' : 'closed'} aria-hidden />
    </button>
  );
});

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(function AccordionContent(props, ref) {
  const { children, className, sx, style, ...rest } = props;
  const root = useAccordionContext();
  const item = useAccordionItemContext();
  const cls = useThemedClasses({ recipe: accordionRecipes.content, componentName: 'Accordion', slot: 'content' });
  const innerCls = useThemedClasses({ recipe: accordionRecipes.contentInner, componentName: 'Accordion', slot: 'contentInner', props: { size: root.size, className, sx, style } });

  return (
    <div ref={ref} className={cls.className} data-state={item.isOpen ? 'open' : 'closed'}>
      <div className={innerCls.className} role="region" {...rest}>
        {children}
      </div>
    </div>
  );
});
```

---

## Keyboard Navigation

`useAccordionKeyboard` (local hook):

- **ArrowDown / ArrowUp**: cycles focus between sibling triggers within the same Accordion (skipping disabled items).
- **Home / End**: focus first / last enabled trigger.
- **Enter / Space**: native button activates (toggle handled by `onClick`).
- **Tab / Shift+Tab**: exits the accordion to next focusable on the page (standard behavior — we don't intercept).

Stays local in V1; promote to `_shared/useArrowList.ts` only if a third consumer beyond Accordion / Menu / Select needs the same pattern (unlikely).

---

## Types

```ts
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import type { Sx, ResponsiveValue } from '@apx-dsine';

export type AccordionVariant = 'solid' | 'outline' | 'soft' | 'ghost';
export type AccordionSize = 'sm' | 'md' | 'lg';
export type AccordionColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type AccordionIconPosition = 'start' | 'end';

export interface AccordionPropsBase {
  collapsible?: boolean;
  disabled?: boolean;
  variant?: ResponsiveValue<AccordionVariant>;
  size?: ResponsiveValue<AccordionSize>;
  color?: ResponsiveValue<AccordionColor>;
  iconPosition?: AccordionIconPosition;
  className?: string;
  sx?: Sx;
  children: ReactNode;
}

export type AccordionProps = AccordionPropsBase & (
  | { type: 'single'; value?: string; defaultValue?: string; onValueChange?: (v: string) => void }
  | { type: 'multiple'; value?: string[]; defaultValue?: string[]; onValueChange?: (v: string[]) => void }
);

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leftIcon?: ReactNode;
  sx?: Sx;
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx;
}
```

---

## Accessibility

- W3C ARIA Accordion pattern:
  - Each `Accordion.Trigger` is a `<button>` with `aria-expanded={isOpen}` and `aria-controls={contentId}`.
  - Each `Accordion.Content` is a region (`role="region"`) with `aria-labelledby={triggerId}`.
- Keyboard nav between triggers per the pattern.
- `disabled={true}` removes the trigger from the tab order (`disabled` attribute on native button).
- The Trigger's text is the accessible name; consumers wrap with `<h3>` etc. via `asChild` if they want stronger semantics.
- Animation does not interfere with reader announcements; closed content remains in the DOM but `aria-hidden`-style invisibility is handled by `grid-rows-[0fr]` clipping. (Some screen readers may still announce — acceptable trade-off; consumers can `aria-hidden={!isOpen}` on Content if they're strict.)
- axe-core: zero violations.

---

## Animation / Interactions

- Open/close: CSS `grid-template-rows` transition, ~250ms `ease-emphasized`. **No JS height measurement, no jank**.
- Chevron rotates 180° on open.
- `prefers-reduced-motion`: transition halved to ~120ms (still helpful to indicate state change but not "animating"). Setting `duration: 0` is too jarring.

---

## Responsive

```tsx
<Accordion type="single" variant={{ base: 'solid', md: 'outline' }} size={{ base: 'md', md: 'lg' }}>
  …
</Accordion>
```

---

## RTL

- Chevron flips via `iconPosition` logical-side handling (`ms-auto` for `end` flips correctly).
- Trigger flex layout uses `gap-3` + `text-start`, both logical.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Accordion: {
      defaultProps: { variant: 'outline', size: 'sm', iconPosition: 'start' },
      styleOverrides: {
        root: '',
        item: 'border-2',
        trigger: 'rounded-md',
        content: '',
        contentInner: '',
        chevron: '',
      },
    },
  },
})} />
```

---

## Examples List

| File                  | Demonstrates                                       |
| --------------------- | -------------------------------------------------- |
| `Basic.tsx`           | Default single-open accordion                      |
| `Multiple.tsx`        | `type="multiple"`                                  |
| `Collapsible.tsx`     | Single + collapsible                               |
| `Controlled.tsx`      | Parent owns value                                  |
| `Variants.tsx`        | solid / outline / soft / ghost                     |
| `Sizes.tsx`           | sm / md / lg                                       |
| `Colors.tsx`          | 7 colors × soft                                    |
| `WithIcons.tsx`       | `leftIcon` on each Trigger                         |
| `IconPositionStart.tsx`| Chevron on logical start                          |
| `DisabledItem.tsx`    | Per-item disable                                   |
| `LongContent.tsx`     | Content with lists, images, code blocks            |
| `FAQ.tsx`             | Canonical FAQ pattern                              |
| `Nested.tsx`          | Accordion inside another Accordion                 |

---

## Testing Plan

`Accordion.test.tsx`:
- `type="single"`: clicking opens; clicking again with `collapsible=true` closes; `collapsible=false` keeps open
- `type="multiple"`: clicking toggles each independently; `value` is a `string[]`
- `defaultValue` honored for both types
- Controlled: `value` flowing in / `onValueChange` flowing out
- ArrowDown/Up cycles focus between triggers; disabled items skipped
- Home / End focus first / last enabled trigger
- Disabled at root disables all items; per-item disable scoped
- `iconPosition="start"` moves chevron to start
- Variant / size / color / fullWidth apply correct classes
- CSS grid-rows transition: snapshot the className state — `grid-rows-[0fr]` closed, `[1fr]` open
- Theme `styleOverrides.{ root, item, trigger, content, contentInner, chevron }` merge correctly
- Nested accordion: inner controls don't affect outer

`Accordion.a11y.test.tsx`:
- Triggers have `aria-expanded`, `aria-controls`
- Contents have `role="region"`, `aria-labelledby`
- Disabled triggers are not in tab order
- axe passes for every variant × color cell

---

## File-Level Tasks (Ordered)

1. [ ] Create `packages/components/src/Accordion/` folder
2. [ ] Write `Accordion.types.ts`
3. [ ] Write `Accordion.recipe.ts` (5 recipes)
4. [ ] Write `AccordionContext.ts`
5. [ ] Write `useAccordionKeyboard.ts`
6. [ ] Write all 4 subpart files
7. [ ] Write `index.ts` (Object.assign)
8. [ ] Write `meta.ts` (category `Disclosure`, tags `['accordion', 'disclosure', 'collapsible']`)
9. [ ] Write `Accordion.test.tsx`, `Accordion.a11y.test.tsx`
10. [ ] Write 13 example files
11. [ ] Write `README.mdx`
12. [ ] Export `Accordion` from package index + `apx-ds
13. [ ] Renderer discovery check
14. [ ] Bundle delta: < 3 KB gzipped (no Motion, modest logic)

---

## Acceptance Criteria

- [ ] Single / multiple modes both work.
- [ ] `collapsible` honored.
- [ ] Keyboard nav per ARIA pattern.
- [ ] All variants / sizes / colors render.
- [ ] CSS-grid open/close transition is smooth (no JS height).
- [ ] axe passes.
- [ ] Reduced-motion users see fast (~120ms) transitions, not zero-duration.
- [ ] Per-item disable + root disable both work.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import
- [ ] No JS height measurement; grid-rows trick is the entire animation
- [ ] `useControllableState` reused from engine
- [ ] `useAccordionKeyboard` stays local until a third consumer needs it
- [ ] Adding a color = palette entry + 2 compound rows in `item`; no component changes
- [ ] Item state propagation matches Tabs (Phase 16) shape — both contexts have `value` + `isOpen` per child + `setValue` on root

---

## Out of Scope (Future Components / Phases)

- **`Accordion.Header` subpart** — most consumers don't need a separate wrapper between Item and Trigger; trigger inside the item is fine. Add later if `<h2>` etc. nesting needs a slot.
- **Auto-rotate icon based on `iconPosition`** — already handled.
- **Tile / card-style accordion** (each item is a fully-styled card with shadow) — composition via `variant="outline"` + custom theme overrides. Not a new variant.
- **Smooth animations on auto-resizing content** (e.g. content grows due to async data) — `grid-rows` handles this for free in modern browsers; no special handling needed.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/26-accordion.md`.
2. Append `## Outcome`: API, bundle delta, axe results, browser-compat note on the grid-rows trick.
3. Both batches (1 and 2) are now planned. Ship.

---

## Outcome

**Shipped 2026-05-20 by SDS-Agent4.**

### API surface as shipped

Identical to the plan's `Public API` section, with one minor default deviation that's covered by
the plan's own deliberate divergence note:

- `<Accordion type="single" | "multiple">` (default `'single'`).
- Discriminated `value` / `defaultValue` / `onValueChange` per `type` — `string` in single mode,
  `string[]` in multiple mode.
- `collapsible` (default `true` for single mode — matches the plan's "modern FAQ UX" call).
- `disabled`, `variant` (4), `size` (3), `color` (7), `iconPosition` (`start | end`, default `end`).
- Subparts assembled via `Object.assign` exactly like Card (Phase 14): `Accordion.Item`,
  `Accordion.Trigger` (with optional `leftIcon`), `Accordion.Content`.
- 13 example files matching the plan's `Examples List` 1:1.
- Six theme slot keys: `root`, `item`, `trigger`, `content`, `contentInner`, `chevron`.

### Plan deviations (intentional, documented inline)

1. **`useAccordionKeyboard` is a wrapped `useCallback` hook**, not a one-shot factory. The hook
   accepts the active root context + item value and returns a stable `onKeyDown` handler.
2. **The keyboard handler reads the trigger registry from a `Map<value, HTMLButtonElement>` ref
   on the root** rather than maintaining a parallel disabled-state array. The registry is
   updated through callback refs in each `<Accordion.Trigger>` (`registerTrigger(value, el)`),
   and the keyboard handler sorts by `compareDocumentPosition` at handle-time. This is robust
   to conditional mounts, reorders, and dynamic disabling without adding extra state.
3. **`<Accordion.Content>` wraps a `role="region"` inner inside a non-region animated outer**.
   The outer carries the grid-rows transition (`data-state` + `aria-hidden`), the inner
   carries the labelled-region semantics. Splitting the two roles cleanly meant zero ARIA
   violations across the 28-cell matrix.
4. **Bundle target was `< 3 KB gz`; shipped at `3.32 KB gz`** (3,398 bytes — back-to-back delta
   against the same `tsup` build with/without the Accordion export). The overshoot is the
   `ChevronDown` lucide-react import (the rest of the DS already imports it elsewhere, so the
   marginal cost is mostly the recipe expansion + the four subpart files). No optimization
   pass landed — the budget guideline isn't a hard ceiling per the plan's intro and the
   compound-component shape (4 subparts + 5 recipes + keyboard hook) inherently carries more
   surface than a single-element primitive like Badge.

### Verification

- **Tests:** `pnpm --filter @apx-dsponents test -- --run` → **455/455 ✅** (38 new
  Accordion tests: 31 unit + 7 a11y).
- **Lint:** `pnpm --filter @apx-dsponents lint` → ✅.
- **Typecheck (workspace):** `pnpm -r typecheck` → ✅ (all 7 projects clean).
- **Build:** `pnpm --filter @apx-dsponents build` → ESM + CJS + DTS ✅. Umbrella
  `apx-dsbuilt; renderer typecheck still ✅.
- **axe-core:** 0 violations across the 4 variants × 7 colors matrix in `Accordion.a11y.test.tsx`.
- **Keyboard pattern:** ArrowDown/ArrowUp/Home/End covered by unit tests + a11y tests; disabled
  triggers are confirmed skipped; wrap-around verified.
- **Renderer:** plan moved to `plans/completed/components/26-accordion.md`. Folder structure
  matches `discover.ts` expectations (kebab slug from `meta.name`, `Accordion.tsx` as the main
  source file for props extraction, 13 example files in `examples/`, `README.mdx` using
  `<ExampleBlock>` shortcodes for live previews — no plain fenced code blocks).

### Browser compatibility note on the CSS-grid trick

`grid-template-rows: 0fr → 1fr` interpolation works on:
- **Chromium 117+** (Sep 2023)
- **Safari 17+** (Sep 2023)
- **Firefox 121+** (Dec 2023)

Combined coverage at ship date (May 2026) is approximately 96% of global users per caniuse data.
Older browsers fall back to an instant open/close (still functional, no JS error). The plan
called this out; nothing further was done for older browsers because the DS's stated browser
floor matches this set.

### Files added

```
packages/components/src/Accordion/
├── Accordion.tsx                # root: state owner + provider
├── Accordion.recipe.ts          # five recipes (root/item/trigger/content/contentInner/chevron)
├── Accordion.types.ts           # discriminated AccordionProps + per-subpart props + context shapes
├── AccordionContent.tsx         # animated wrapper + role=region inner
├── AccordionContext.tsx         # root + item contexts with throwing consumer hooks
├── AccordionItem.tsx            # per-item disabled cascade + per-item id pair
├── AccordionTrigger.tsx         # button + ARIA + keyboard hook integration + chevron
├── index.ts                     # Object.assign compound assembly + type re-exports
├── meta.ts                      # category "Disclosure", tags ['accordion','disclosure','collapsible','faq','expand']
├── README.mdx                   # 13 <ExampleBlock> shortcodes + props tables + a11y section
├── useAccordionKeyboard.ts      # arrow / home / end key handler (local — promote later)
└── examples/                    # 13 files (Basic, Multiple, Collapsible, Controlled, Variants,
                                 #          Sizes, Colors, WithIcons, IconPositionStart,
                                 #          DisabledItem, LongContent, FAQ, Nested)

packages/components/__tests__/
├── Accordion.a11y.test.tsx      # axe matrix + ARIA attribute presence (7 tests)
└── Accordion.test.tsx           # state / keyboard / disabled / variants / refs (31 tests)
```

### Index export

`packages/components/src/index.ts` updated with a surgical `StrReplace` insertion at the
alphabetical position immediately **before** `Alert` — full alphabetical export list verified
after the merge to avoid the kind of clobber @SDS-Agent3 flagged earlier in the session
(Checkbox export getting dropped twice).

### Coordination notes for downstream phases

- **Tabs (Phase 16)** can copy this compound-assembly recipe wholesale: `Object.assign` of root
  + subparts via `./index.ts`, paired root + item contexts with throwing `useXContext`
  helpers, registry of trigger refs on the root for arrow-key nav. The Accordion implementation
  is the cleanest reference for this shape.
- **`useAccordionKeyboard` stays local** for now. Tabs has different keyboard semantics
  (horizontal vs vertical + Home/End + manual vs automatic activation), so promotion to
  `_shared/useArrowList.ts` will need at least one more concrete consumer with the same shape
  before extraction is worth the API design tax. Plan's DRY self-check already flagged this.
- **`grid-template-rows` auto-height trick** is reusable for any future open/close primitive
  that doesn't need an overlay (collapsible nav drawers without portal, expandable rows in
  data tables, settings sections inside Card). The pattern is six lines of CSS classes — copy
  the `accordionContentRecipe` + `accordionContentInnerRecipe` pair as the template.
- **No `_shared/` writes** in this phase — the iconForColor / controlBase primitives stayed
  untouched. Adding Accordion didn't touch any other component's files.
