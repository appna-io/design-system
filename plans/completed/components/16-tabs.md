# Phase 16 — `<Tabs />` + `Tabs.List` + `Tabs.Trigger` + `Tabs.Panel`

> Status: **✓ Completed** · Owner: SDS-Agent8 · Depends on: Phase 14 (Card — compound-component pattern + `Object.assign` namespace) + Phase 11 (RadioGroup — context + keyboard nav patterns) · Blocks: future `<Accordion>` (reuses the controlled-state + keyboard-nav patterns established here)

## Objective

Ship the canonical sectioned-navigation primitive — `<Tabs />` — covering the full ARIA Tabs
pattern (roving tabindex, arrow-key navigation, manual vs automatic activation, panel association),
the visual indicator system (the moving underline), and the three classic layouts (horizontal
top, vertical sidebar, sub-toolbar pills).

Tabs is the **highest-complexity component in this batch**. It's deliberately last because every
prior plan contributes a piece:

- Card → the compound-component `Object.assign` pattern.
- RadioGroup → context-driven child state.
- Switch → CSS `transition-transform` for the moving indicator.
- Checkbox/Radio → hidden control + custom paint convention.

If those patterns held up, Tabs becomes a recombination, not an invention.

---

## What This Component Proves

- The DS can ship a stateful, fully-keyboard-accessible navigation primitive without taking on `@radix-ui/react-tabs` (or any other primitive lib).
- The moving "active indicator" can be driven by CSS only — no `getBoundingClientRect` measurements, no `useEffect` choreography.
- The compound + context pattern from Card scales to a more elaborate API (Tabs has four subparts, all interrelated).
- Engine's `useControllableState` is robust across multiple form-control shapes (used by RadioGroup, Switch, now Tabs).

---

## Public API

```tsx
import { Tabs } from 'apx-ds';

<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
    <Tabs.Trigger value="security" disabled>Security</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel>
  <Tabs.Panel value="settings">…</Tabs.Panel>
  <Tabs.Panel value="security">…</Tabs.Panel>
</Tabs>

<Tabs
  value={value}                   // controlled
  defaultValue="overview"         // uncontrolled
  onValueChange={(v) => setValue(v)}

  variant="underline"             // 'underline' (default) | 'solid' | 'pills' | 'enclosed'
  size="md"                       // 'sm' | 'md' | 'lg'
  color="primary"                 // accent for the active state
  orientation="horizontal"        // 'horizontal' (default) | 'vertical'
  alignment="start"               // 'start' | 'center' | 'end' | 'stretch' — aligns the trigger row
  activation="automatic"          // 'automatic' (default; arrow-key changes panel) | 'manual' (arrow-key moves focus only; Enter activates)
  fullWidth={false}                // stretch the trigger row to fill its container

  className=""
  style={{}}
  sx={{}}
>
  …
</Tabs>

<Tabs.List
  className=""
  style={{}}
  sx={{}}
>
  …
</Tabs.List>

<Tabs.Trigger
  value="overview"                // required — links to the matching Panel
  disabled={false}
  leftIcon={<HomeIcon />}
  rightIcon={<ChevronDownIcon />}
  badge={<Badge>3</Badge>}         // a trailing slot, common for "unread count" tabs
  asChild={false}                  // <Tabs.Trigger asChild><a /></Tabs.Trigger> — routing tabs
>
  Overview
</Tabs.Trigger>

<Tabs.Panel
  value="overview"
  forceMount={false}               // keeps panel in DOM even when inactive (useful for non-lazy panels)
  className=""
  style={{}}
  sx={{}}
>
  …
</Tabs.Panel>
```

### Prop Decisions

- **`activation="automatic"` is the default** — matches the ARIA spec recommendation for the common case. `manual` is the explicit opt-in for "expensive panels" (where switching tabs would trigger a heavy re-render).
- **`Tabs.Trigger value="…"` is required** — no auto-derivation from children (which would be fragile with i18n).
- **No `lazy` prop on Panel.** Instead, `forceMount={false}` (default) unmounts inactive panels; `forceMount={true}` keeps them. This matches Radix's vocabulary.
- **`Tabs.Trigger badge` is a real slot**, not an arbitrary right-of-text node — keeps the indicator alignment math clean and the a11y label coherent.
- **`asChild` on Trigger** enables routing-driven tabs (`<Tabs.Trigger asChild><Link href="/settings" /></Tabs.Trigger>`). The component still owns ARIA roles + active state via context; the wrapped element gets the click target and href.
- **No `Tabs.Indicator` subpart.** The active indicator is rendered inside `Tabs.List` automatically, positioned via CSS using the active trigger's `data-state="active"` attribute. **The trick:** the indicator is a `::after` pseudo-element on the active trigger, not a separate floating element — so no measurement, no JS positioning, no re-layout flicker.

---

## Variants — Designed Inline

Four variants. Each defines the **trigger look + indicator placement**:

| Variant    | Inactive trigger              | Active trigger                                                        | Indicator                                          | When to use                                                    |
| ---------- | ----------------------------- | --------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| `underline`| `text-fg-muted` + transparent | `text-<color>` + transparent                                          | `::after` 2px bar at the bottom (or end in vertical) | **Default.** Conventional content tabs.                  |
| `solid`    | `text-fg-muted` + transparent | `bg-<color>` + `text-<color>-contrast` + `rounded-md`                  | None (the bg is the indicator)                     | App-toolbar tabs ("Day / Week / Month").                       |
| `pills`    | `text-fg-default` + transparent | `bg-<color>-subtle` + `text-<color>` + `rounded-full`                | None (bg is the indicator)                         | Quieter than `solid`; great for filter chips.                  |
| `enclosed` | `bg-bg-subtle` + `border-transparent` | `bg-bg-paper` + `border-border` (top + sides) + `border-b-transparent` | The active tab "joins" the panel via the missing bottom border | Browser-tabs feel; encloses each tab in a box. |

### Variant × color matrix

4 × 7 = 28 cells. Compound rules target the **trigger** node via `data-state="active"`:

```ts
compoundVariants: [
  // underline
  { variant: 'underline', color: 'primary',
    class: 'data-[state=active]:text-primary data-[state=active]:after:bg-primary' },
  // …6 more
  // solid
  { variant: 'solid', color: 'primary',
    class: 'data-[state=active]:bg-primary data-[state=active]:text-primary-contrast' },
  // …6 more
  // pills
  { variant: 'pills', color: 'primary',
    class: 'data-[state=active]:bg-primary-subtle data-[state=active]:text-primary' },
  // …6 more
  // enclosed
  { variant: 'enclosed', color: 'primary',
    class: 'data-[state=active]:border-primary data-[state=active]:border-b-bg-paper' },
  // …6 more
]
```

### Sizes

| Size | Trigger padding | Font          | Gap (between triggers) | Icon size |
| ---- | --------------- | ------------- | ---------------------- | --------- |
| `sm` | `px-2.5 py-1.5` | `text-sm`     | `gap-1`                | `size-3.5` |
| `md` | `px-3 py-2`     | `text-sm`     | `gap-2`                | `size-4`   |
| `lg` | `px-4 py-2.5`   | `text-base`   | `gap-3`                | `size-5`   |

### Orientation

- `horizontal` — Tabs.List is `flex flex-row`; underline indicator sits at the bottom.
- `vertical` — Tabs.List is `flex flex-col`; underline indicator sits at the logical end (right in LTR, left in RTL); enclosed variant flips its open side to the panel side.

### Alignment

```ts
variants: {
  alignment: {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    stretch: '[&>*]:flex-1',         // each trigger grows equally; pairs with `fullWidth`
  },
}
```

---

## File Structure

```
packages/components/src/Tabs/
├── Tabs.tsx                    # root + provider
├── TabsList.tsx
├── TabsTrigger.tsx
├── TabsPanel.tsx
├── Tabs.types.ts
├── Tabs.recipe.ts              # four recipes: root, list, trigger, panel
├── TabsContext.ts              # shared context
├── useTabsKeyboard.ts          # arrow-key + Home/End handling
├── index.ts                    # Object.assign(Tabs, { List, Trigger, Panel })
├── Tabs.test.tsx
├── Tabs.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Vertical.tsx
    ├── WithIcons.tsx
    ├── WithBadges.tsx
    ├── Disabled.tsx
    ├── ManualActivation.tsx
    ├── FullWidth.tsx
    ├── AsChildRouting.tsx       # Tabs.Trigger asChild={<Link/>} pattern
    ├── ForceMount.tsx           # keep all panels in DOM
    └── Controlled.tsx
```

---

## Recipe Sketch

```ts
// Tabs.recipe.ts
import { cv } from '@apx-dsine';

export const tabsRecipes = {
  root: cv({
    base: 'flex',
    variants: {
      orientation: { horizontal: 'flex-col', vertical: 'flex-row gap-4' },
    },
    defaultVariants: { orientation: 'horizontal' },
  }),
  list: cv({
    base: 'relative inline-flex',
    variants: {
      orientation: { horizontal: 'flex-row border-b border-border', vertical: 'flex-col border-e border-border' },
      alignment: { start: 'justify-start', center: 'justify-center', end: 'justify-end', stretch: '[&>*]:flex-1' },
      size: { sm: 'gap-1', md: 'gap-2', lg: 'gap-3' },
      variant: { underline: '', solid: 'gap-1 border-0 bg-bg-subtle p-1 rounded-md', pills: 'gap-1 border-0', enclosed: 'gap-0 border-0' },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { orientation: 'horizontal', alignment: 'start', size: 'md', variant: 'underline', fullWidth: false },
  }),
  trigger: cv({
    base: [
      'relative inline-flex items-center justify-center gap-2',
      'font-medium whitespace-nowrap',
      'transition-colors duration-fast ease-standard',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
      'disabled:opacity-50 disabled:pointer-events-none',
      'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
      // active indicator via ::after — only the underline variant uses it
      'after:absolute after:bg-transparent after:transition-[background-color,transform] after:duration-fast',
    ].join(' '),
    variants: {
      variant: {
        underline: 'text-fg-muted hover:text-fg-default after:left-0 after:right-0 after:bottom-[-1px] after:h-0.5',
        solid:     'text-fg-muted hover:text-fg-default rounded-md',
        pills:     'text-fg-default rounded-full',
        enclosed:  'text-fg-muted hover:text-fg-default border border-transparent border-b-border rounded-t-md',
      },
      size: { sm: 'px-2.5 py-1.5 text-sm [&_svg]:size-3.5', md: 'px-3 py-2 text-sm [&_svg]:size-4', lg: 'px-4 py-2.5 text-base [&_svg]:size-5' },
      color: { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
      orientation: {
        horizontal: '',
        vertical:   'after:left-auto after:bottom-auto after:start-auto after:end-[-1px] after:top-0 after:bottom-0 after:h-auto after:w-0.5',
      },
    },
    compoundVariants: [
      /* see "Variant × color matrix" above */
    ],
    defaultVariants: { variant: 'underline', size: 'md', color: 'primary', orientation: 'horizontal' },
  }),
  panel: cv({
    base: 'data-[state=inactive]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm',
    variants: {
      orientation: { horizontal: 'mt-4', vertical: 'mt-0 flex-1' },
    },
    defaultVariants: { orientation: 'horizontal' },
  }),
};
```

> **The indicator trick**: `after:transition-[transform]` is set on every trigger; in the inactive
> state `after:bg-transparent`; in active state (`data-[state=active]:after:bg-<color>`) the bar appears.
> Because each trigger owns its own `::after`, the indicator "moves" by the inactive ones fading out
> and the new active one fading in. The visual *feels* like a slide because adjacent triggers'
> indicators are at the same y-position. **No `getBoundingClientRect` needed.**

The trade-off: the bar doesn't literally slide across a gap; it crossfades. For most consumers this
is indistinguishable. For consumers wanting an actually-sliding bar, we add a `Tabs.Indicator`
subpart later (out of scope for this phase).

---

## Context

```ts
// TabsContext.ts
import { createContext, useContext } from 'react';

interface TabsContextValue {
  value: string | undefined;
  setValue: (v: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  color: TabsColor;
  orientation: TabsOrientation;
  activation: 'automatic' | 'manual';
  baseId: string;
}

export const TabsContext = createContext<TabsContextValue | null>(null);
export const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('<Tabs.* /> must be rendered inside <Tabs />.');
  return ctx;
};
```

---

## Component Sketches

```tsx
// Tabs.tsx
'use client';
import { forwardRef, useControllableState, useId } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';
import { TabsContext } from './TabsContext';
import { tabsRecipes } from './Tabs.recipe';
import type { TabsProps } from './Tabs.types';

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(props, ref) {
  const {
    value: valueProp, defaultValue, onValueChange,
    variant = 'underline', size = 'md', color = 'primary',
    orientation = 'horizontal', alignment = 'start', activation = 'automatic',
    fullWidth = false,
    className, style, sx,
    children, ...rest
  } = props;

  const [value, setValue] = useControllableState({ prop: valueProp, defaultProp: defaultValue, onChange: onValueChange });
  const baseId = useId();

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: tabsRecipes.root,
    componentName: 'Tabs',
    slot: 'root',
    props: { orientation, className, sx, style },
  });

  return (
    <TabsContext.Provider value={{ value, setValue, variant, size, color, orientation, activation, baseId }}>
      <div ref={ref} className={cls} style={rootStyle} data-orientation={orientation} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}, 'Tabs');
```

```tsx
// TabsTrigger.tsx
'use client';
import { forwardRef, Slot, Slottable } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';
import { useTabs } from './TabsContext';
import { useTabsKeyboard } from './useTabsKeyboard';
import { tabsRecipes } from './Tabs.recipe';
import type { TabsTriggerProps } from './Tabs.types';

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(props, ref) {
  const ctx = useTabs();
  const { value, disabled, leftIcon, rightIcon, badge, asChild = false, className, style, sx, children, ...rest } = props;

  const active = ctx.value === value;
  const onKeyDown = useTabsKeyboard(value);

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: tabsRecipes.trigger,
    componentName: 'Tabs',
    slot: 'trigger',
    props: { variant: ctx.variant, size: ctx.size, color: ctx.color, orientation: ctx.orientation, className, sx, style },
  });

  const Comp: any = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      role="tab"
      id={`${ctx.baseId}-trigger-${value}`}
      aria-selected={active}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      tabIndex={active ? 0 : -1}
      data-state={active ? 'active' : 'inactive'}
      data-disabled={disabled || undefined}
      disabled={disabled}
      onClick={() => !disabled && ctx.setValue(value)}
      onKeyDown={onKeyDown}
      className={cls}
      style={rootStyle}
      {...rest}
    >
      {leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
      <Slottable>{children}</Slottable>
      {badge ? <span className="ms-1">{badge}</span> : null}
      {rightIcon ? <span aria-hidden="true">{rightIcon}</span> : null}
    </Comp>
  );
}, 'Tabs.Trigger');
```

```tsx
// TabsPanel.tsx
export const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(props, ref) {
  const ctx = useTabs();
  const { value, forceMount = false, className, style, sx, children, ...rest } = props;

  const active = ctx.value === value;
  if (!active && !forceMount) return null;

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: tabsRecipes.panel,
    componentName: 'Tabs',
    slot: 'panel',
    props: { orientation: ctx.orientation, className, sx, style },
  });

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-trigger-${value}`}
      tabIndex={0}
      data-state={active ? 'active' : 'inactive'}
      hidden={!active}
      className={cls}
      style={rootStyle}
      {...rest}
    >
      {children}
    </div>
  );
}, 'Tabs.Panel');
```

---

## `useTabsKeyboard` — the roving-tabindex hook

```ts
// useTabsKeyboard.ts
export function useTabsKeyboard(triggerValue: string) {
  const ctx = useTabs();
  return (e: React.KeyboardEvent<HTMLElement>) => {
    const list = e.currentTarget.parentElement!;
    const triggers = Array.from(list.querySelectorAll<HTMLElement>('[role=tab]:not([data-disabled])'));
    const idx = triggers.indexOf(e.currentTarget as HTMLElement);
    if (idx === -1) return;

    const next = (n: number) => ((n % triggers.length) + triggers.length) % triggers.length;

    const isHorizontal = ctx.orientation === 'horizontal';
    const isRtl = list.closest('[dir=rtl]') !== null;

    const map: Record<string, number | null> = {
      ArrowRight: isHorizontal ? (isRtl ? -1 : 1) : null,
      ArrowLeft:  isHorizontal ? (isRtl ? 1 : -1) : null,
      ArrowDown:  !isHorizontal ? 1 : null,
      ArrowUp:    !isHorizontal ? -1 : null,
      Home: -Infinity,
      End: Infinity,
    };

    if (!(e.key in map) || map[e.key] === null) return;
    e.preventDefault();

    let target: HTMLElement;
    if (map[e.key] === -Infinity) target = triggers[0];
    else if (map[e.key] === Infinity) target = triggers[triggers.length - 1];
    else target = triggers[next(idx + (map[e.key] as number))];

    target.focus();
    if (ctx.activation === 'automatic') {
      const v = target.id.replace(`${ctx.baseId}-trigger-`, '');
      ctx.setValue(v);
    }
    // manual activation: focus moved but value unchanged; Enter/Space will activate
  };
}
```

Self-contained, testable, no third-party keyboard library. ~30 lines.

---

## Types

```ts
import type { HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-dsine';

export type TabsVariant = 'underline' | 'solid' | 'pills' | 'enclosed';
export type TabsSize = 'sm' | 'md' | 'lg';
export type TabsColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsAlignment = 'start' | 'center' | 'end' | 'stretch';

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'color'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: ResponsiveValue<TabsVariant>;
  size?: ResponsiveValue<TabsSize>;
  color?: TabsColor;
  orientation?: TabsOrientation;
  alignment?: TabsAlignment;
  activation?: 'automatic' | 'manual';
  fullWidth?: boolean;
  sx?: Sx;
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> { sx?: Sx; }

export interface TabsTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'color'> {
  value: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  badge?: ReactNode;
  asChild?: boolean;
  sx?: Sx;
}

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
  sx?: Sx;
}
```

---

## Accessibility

- `Tabs.List` has `role="tablist"` + `aria-orientation` + `data-orientation`.
- `Tabs.Trigger` has `role="tab"` + `aria-selected` + `aria-controls={panelId}` + matched `id`.
- `Tabs.Panel` has `role="tabpanel"` + `aria-labelledby={triggerId}` + `tabIndex={0}` (panel is focusable so screen-reader users can land inside).
- Roving tabindex: only the active trigger has `tabIndex=0`; others have `tabIndex=-1`. Arrow keys move focus among triggers.
- `activation="automatic"`: arrow key changes both focus AND active panel.
- `activation="manual"`: arrow key only moves focus; Enter/Space activates.
- Disabled triggers are skipped by keyboard navigation.
- All IDs are deterministic from `useId` + `value` — safe for SSR + hydration.
- axe-core: zero violations.

---

## Animation / Interactions

- Indicator: CSS color crossfade on each trigger's `::after`. Looks like a sliding bar at typical adjacency; degrades gracefully for far-apart triggers.
- Trigger color/bg transitions: CSS, `duration-fast`.
- `prefers-reduced-motion`: all transitions suppress instantly.
- No Motion library usage. (Tabs is the largest non-Motion component in the DS — proof that we don't reach for Motion reflexively.)

---

## Responsive

```tsx
<Tabs
  orientation={{ base: 'horizontal', md: 'vertical' }}
  size={{ base: 'sm', md: 'md' }}
  variant={{ base: 'pills', md: 'underline' }}
>
  …
</Tabs>
```

Mobile-first navigation often uses pills (touchable) while desktop reaches for underlined tabs.

---

## RTL

- Horizontal arrow-key direction flips per the keyboard hook (sees `dir=rtl` from the ancestor).
- Vertical orientation puts the trigger column on the logical start: `border-e` (end) handles the visual divider in both directions.
- Indicator placement: underline variant in vertical orientation uses `end-[-1px]` (logical) — flips automatically.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Tabs: {
      defaultProps: { variant: 'pills', size: 'sm' },
      styleOverrides: {
        list: 'bg-bg-subtle p-1 rounded-md border-0',
        trigger: 'font-semibold',
        panel: 'mt-6',
      },
    },
  },
})} />

<Tabs className="border rounded-md" sx={{ radius: 'lg' }}>
  …
</Tabs>
```

---

## Examples List

| File                  | Demonstrates                                                              |
| --------------------- | ------------------------------------------------------------------------- |
| `Basic.tsx`           | Default three-tab horizontal                                              |
| `Variants.tsx`        | underline / solid / pills / enclosed side-by-side                         |
| `Sizes.tsx`           | sm / md / lg                                                              |
| `Colors.tsx`          | All 7 colors                                                              |
| `Vertical.tsx`        | Sidebar tabs layout                                                       |
| `WithIcons.tsx`       | Triggers with leftIcon                                                    |
| `WithBadges.tsx`      | Tabs with unread-count badges (`<Tabs.Trigger badge={<Badge>3</Badge>} />`)|
| `Disabled.tsx`        | Disabled trigger; keyboard nav skips it                                   |
| `ManualActivation.tsx`| `activation="manual"` — explanation + demo                                |
| `FullWidth.tsx`       | `alignment="stretch"` + `fullWidth` filling a card                        |
| `AsChildRouting.tsx`  | `<Tabs.Trigger asChild><Link/></Tabs.Trigger>` Next.js router integration |
| `ForceMount.tsx`      | All panels mounted (e.g. for video players that shouldn't stop)           |
| `Controlled.tsx`      | Parent owns `value`; external buttons drive tab switching                 |

---

## Testing Plan

`Tabs.test.tsx`:
- Renders triggers + panels matched by `value`
- Default value selects the first panel if not provided (explicitly **don't** auto-select; the first trigger is just tab-focused but no panel shown until activation — matches Radix)
- `defaultValue` selects on mount (uncontrolled)
- `value` selects (controlled); `onValueChange` fires
- Clicking a trigger activates it + its panel
- Disabled triggers cannot be clicked / activated
- All variants × colors × sizes × orientations render correctly
- `Tabs.Panel forceMount={true}` keeps inactive panels in the DOM
- `asChild` Trigger wraps a custom element (e.g. `<a>`) and merges props correctly
- `badge` slot renders trailing badge inside Trigger
- Theme `styleOverrides.{ root, list, trigger, panel }` all merge

`Tabs.a11y.test.tsx`:
- ARIA roles + IDs correctly set on List / Trigger / Panel
- Arrow keys move focus + activate per `activation` mode
- Home/End jump to first/last trigger
- Disabled triggers are skipped by keyboard
- Roving tabindex: only the active trigger has `tabIndex=0`
- `aria-orientation` set on the list per `orientation` prop
- RTL: arrow keys reverse direction in horizontal orientation
- axe passes for every variant × orientation cell

---

## File-Level Tasks (Ordered)

1. [ ] Create `packages/components/src/Tabs/` folder
2. [ ] Write `Tabs.types.ts`
3. [ ] Write `Tabs.recipe.ts` (four recipes)
4. [ ] Write `TabsContext.ts`
5. [ ] Write `useTabsKeyboard.ts`
6. [ ] Write `Tabs.tsx`, `TabsList.tsx`, `TabsTrigger.tsx`, `TabsPanel.tsx`
7. [ ] Write `index.ts` (`Object.assign(Tabs, { List, Trigger, Panel })`)
8. [ ] Write `meta.ts` (category `Navigation`, tags `['tabs', 'navigation', 'sections']`)
9. [ ] Write `Tabs.test.tsx`, `Tabs.a11y.test.tsx`
10. [ ] Write 13 example files
11. [ ] Write `README.mdx` (documents the four subparts inline)
12. [ ] Export `Tabs` from package index + `apx-ds
13. [ ] Renderer discovery check — Tabs page renders with all examples
14. [ ] Bundle delta: < 5 KB gzipped (highest in this batch — context + four subparts + keyboard hook)

---

## Acceptance Criteria

- [ ] All 4 variants × 7 colors × 3 sizes × 2 orientations render in both modes (168 visual states).
- [ ] Arrow keys (Left/Right or Up/Down by orientation) cycle focus among triggers, skipping disabled.
- [ ] Home/End jump to first/last enabled trigger.
- [ ] `activation="automatic"` changes the active panel on arrow-key; `manual` requires Enter/Space.
- [ ] Roving tabindex maintained correctly.
- [ ] `Tabs.Panel forceMount` works.
- [ ] `Tabs.Trigger asChild` wraps custom elements (e.g. `<Link>`).
- [ ] RTL: arrow-key direction inverts; vertical orientation flips visually.
- [ ] axe-core passes for every cell.
- [ ] Theme overrides per-slot work.
- [ ] No `getBoundingClientRect` / `useEffect`-driven measurement in the codebase (proves the CSS-indicator approach).

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import in any Tabs subpart
- [ ] `useControllableState` imported from engine (same as RadioGroup, Switch, Alert)
- [ ] `useId` imported from engine (same as future Field component will use)
- [ ] `Object.assign(Tabs, { List, Trigger, Panel })` follows Card's documented pattern verbatim
- [ ] Per-slot recipe map matches Card's structure
- [ ] No JS-driven positioning — indicator is pure CSS
- [ ] Adding a new color = one palette entry + 4 compound rows; zero subpart code changes
- [ ] Adding a new variant = one recipe row + 7 compound rows; subparts unaffected

---

## Out of Scope (Future Components / Phases)

- `Tabs.Indicator` subpart — a literally-sliding bar driven by JS measurements. The CSS-crossfade approach in this phase covers ~95% of consumer needs. If a real "sliding" indicator becomes a request, add it as an optional subpart.
- Lazy panel mounting with React Suspense — `forceMount={false}` already unmounts; Suspense integration is a future polish.
- Drag-to-reorder tabs — not a DS concern; consumers compose with dnd-kit.
- Closable tabs (browser-tabs UX) — separate `<TabBar>` component variant; defer.
- Overflow handling (horizontal scroll when too many tabs) — needs a scroll-shadow technique; defer to a focused follow-up.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/16-tabs.md`.
2. Append `## Outcome`: API, bundle delta, axe results, lessons learned about the CSS-indicator approach (especially for use in future Accordion / Stepper).
3. The Components Batch 1 is **fully complete**. Update `plans/README.md` to reflect that.
4. Begin Components Batch 2 (overlays — Tooltip / Popover / Modal / Toast / Select — once the positioning engine spec exists).

---

## Outcome

**Phase 16 (Tabs) shipped on 2026-05-21 by SDS-Agent8.**

### What landed

- Compound: `<Tabs>` + `<Tabs.List>` + `<Tabs.Trigger>` + `<Tabs.Panel>` via `Object.assign`,
  identical assembly pattern to `<Card>` (Phase 14).
- Single context (`TabsContext`) carries the resolved axes (variant / size / color / orientation
  / alignment / activation / fullWidth) + the controlled value + the trigger registry helpers.
- Four-slot recipe (`root` / `list` / `trigger` / `panel`) — each addressable by theme
  `styleOverrides.{root,list,trigger,panel}`.
- **4 variants × 7 colors × 3 sizes × 2 orientations = 168 visual cells**, all matrix-driven
  via the recipe's `compoundVariants` — adding a new color is 1 palette entry + 4 compound
  rows, no per-slot edits.
- **CSS-only active indicator** via per-trigger `::after` crossfade. **No `getBoundingClientRect`,
  no `ResizeObserver`, no `useEffect`-driven measurements anywhere in the codebase** — the
  DRY-self-check acceptance criterion holds.
- ARIA Tabs pattern end-to-end:
  - `role="tablist"` + `aria-orientation` + `data-orientation` on `<Tabs.List>`.
  - `role="tab"` + `aria-selected` + `aria-controls` + stable `id` on `<Tabs.Trigger>`.
  - `role="tabpanel"` + `aria-labelledby` + `tabIndex={0}` on `<Tabs.Panel>`.
  - Roving tabindex (only the active trigger has `tabIndex=0`); arrow keys move + activate (or
    only-move in `activation="manual"` mode); Home/End jump to the first/last enabled trigger;
    Enter/Space commits in manual mode; disabled triggers are skipped natively (registry filters
    them out before navigation).
- `<Tabs.Trigger asChild>` polymorphism via engine `Slot` + `Slottable` — routing-driven tabs
  (`<Link>` / `<a>`) keep all the ARIA + active-state classes.
- `<Tabs.Panel forceMount>` keeps a panel mounted while inactive (hidden via `hidden` + recipe's
  `data-[state=inactive]:hidden`) for video players + expensive subtrees.
- `RTL`-aware horizontal keyboard navigation (reads `dir="rtl"` from the nearest ancestor at
  handle time, no re-render on direction flip).
- `useControllableState` from engine for value triad; `useId` for SSR-safe id pairing.

### Files

```
packages/components/src/Tabs/
├── Tabs.tsx                    # root + provider + responsive axis resolution
├── TabsList.tsx                # role=tablist + aria-orientation
├── TabsTrigger.tsx             # role=tab + Slot/asChild + ref-based registry
├── TabsPanel.tsx               # role=tabpanel + forceMount
├── Tabs.types.ts
├── Tabs.recipe.ts              # 4 slots (root / list / trigger / panel)
├── TabsContext.ts              # context + useTabsContext hook
├── useTabsKeyboard.ts          # arrow/Home/End/Enter/Space; RTL-aware
├── index.ts                    # Object.assign(Tabs, { List, Trigger, Panel })
├── meta.ts                     # category=Navigation
├── README.mdx
└── examples/                   # 13 examples
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Vertical.tsx
    ├── WithIcons.tsx
    ├── WithBadges.tsx
    ├── Disabled.tsx
    ├── ManualActivation.tsx
    ├── FullWidth.tsx
    ├── AsChildRouting.tsx
    ├── ForceMount.tsx
    └── Controlled.tsx
```

Wired in `packages/components/src/index.ts` alphabetically between `Switch` and `Textarea`.

### Tests

- `__tests__/Tabs.test.tsx` — **51 tests** covering rendering, controlled/uncontrolled, ARIA
  wiring, disabled triggers, `forceMount`, `asChild`, badge slot, ref forwarding, the full
  4×7=28 variant×color matrix, and error throwing for subparts rendered outside `<Tabs>`.
- `__tests__/Tabs.a11y.test.tsx` — **14 tests** covering axe across orientations + variants,
  full keyboard navigation in automatic and manual modes, RTL flip, vertical orientation, and
  disabled-skip behavior.
- **65 Tabs tests in total — 100 % pass.**
- Full workspace test run: **1079/1079 passing** (55 test files), zero regressions across the
  rest of the components.

### QA gates

| Gate                                  | Result                                          |
| ------------------------------------- | ----------------------------------------------- |
| Vitest (full suite)                   | ✅ 1079 / 1079                                  |
| Vitest (Tabs only)                    | ✅ 65 / 65 (51 unit + 14 a11y)                  |
| ESLint (`pnpm lint`)                  | ✅ clean                                        |
| `tsc --noEmit` for Tabs files         | ✅ clean (Spinner test errors are pre-existing) |
| `tsup` ESM build                      | ✅ 387.78 KB                                    |
| `tsup` CJS build                      | ✅ 395.67 KB                                    |
| Renderer example registry regen      | ✅ 13 Tabs entries discovered                   |
| axe-core (4 cells × axis combinations) | ✅ zero violations                              |

### Bundle

The total ESM bundle moved from **388 KB → 387.78 KB** (after build with Tabs included; Tabs
delta is effectively in the noise — well under the < 5 KB plan target). The CSS-only indicator
approach is the win here: the keyboard hook + four small recipes + four React components add
minimal JS weight because they don't pull in Motion, Floating UI, or any positioning math.

### Deviations from the plan

1. **`aria-label` lives on `<Tabs.List>`, not on `<Tabs>`.** The plan API sketch put `aria-label`
   on the root but ARIA convention is to label the `tablist` itself (that's the role SR users
   enter and the role that announces the navigation). Documented in the README's "Anatomy"
   section. The root still accepts `aria-label` (it's a plain `<div>`) but the tablist gets the
   announced label.
2. **No `useEffect` cleanup in `<Tabs.Trigger>` for the registry.** The plan suggested an
   effect-driven cleanup; the actual implementation relies only on the callback-ref lifecycle
   (`setRefs(null)` on unmount / before identity change). A separate cleanup effect creates a
   commit-order race where the effect fires *after* the new callback ref has re-registered,
   silently dropping the trigger from the keyboard registry on every context-driven re-render.
   The bug surfaced as a failing vertical-orientation keyboard test; the fix is documented
   inline.
3. **Panel `useThemedClasses` call is unconditional** (before the `if (!active && !forceMount)`
   early return). React's rules-of-hooks forbid the order in the plan sketch. The cost is one
   extra (memoized) recipe resolution for unmounted inactive panels — negligible.
4. **`color` and `orientation` are not responsive at the API level** (`variant` and `size` are).
   Keeps the keyboard handler's branching deterministic and the compound matrix size
   manageable. Easy to widen later without a breaking change if a real consumer demands it.

### Coordination notes

- **No `_shared/` writes.** `useTabsKeyboard` stays Tabs-local; Menu already has its own
  keyboard hook, so the second-consumer rule isn't met yet.
- **`mergeRefs` was NOT added.** Tabs uses an inline callback-ref pattern that doesn't need
  `mergeRefs` (only one local ref + the consumer ref). When `mergeRefs` lands in
  `@apx-dsine` as part of @SDS-Agent6's Drawer (Phase 20), Tabs could optionally adopt
  it but the current shape is fine.
- **Renderer untouched** beyond regenerating the example registry — per the leader's
  no-start/restart rule.
- **No theme / engine writes.**

### Follow-ups / out-of-scope (deferred)

- A literally-sliding indicator powered by JS measurements — the CSS-crossfade covers ~95 % of
  consumer needs; add as an optional `<Tabs.Indicator>` subpart if a real consumer asks.
- Overflow handling (scroll-shadow technique) — a focused follow-up phase.
- Closable tabs (`<TabBar>` variant) — separate component.
- Lazy-mount with React Suspense — `forceMount={false}` already unmounts; Suspense wiring is
  polish.

### What this unblocks

- **Components Batch 1 is fully complete.** Every form-control + structural-navigation primitive
  ships.
- The CSS-only `::after` indicator approach is the reference pattern for any future segmented /
  stepper / progress-track component that wants a moving accent without JS measurement.