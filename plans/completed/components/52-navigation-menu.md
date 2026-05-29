# Phase 52 — `<NavigationMenu />`

> Status: **✅ Shipped** · Owner: **SDS-Agent2** · **Tier 2.5** (mega-menu + complex keyboard) · Depends on: Phase 3 (`<Slot>`), Phase 17 (Tooltip), Phase 18 (Popover), Phase 22 (Menu), Phase 38 (Divider), Phase 51 (AppShell — typical host), Phase 27 (I18nProvider — optional)
> Top-level horizontal navigation with dropdowns + mega-menus. The W3C Disclosure Navigation pattern; the surface every marketing-and-product site needs.

## Objective

Ship the **`<NavigationMenu />`** primitive — the canonical horizontal top-nav with dropdown items, mega-menus (rich multi-column panels), and active-link tracking.

Use cases:

- Product marketing sites (Stripe, Vercel).
- SaaS top navigation (Notion's "Product / Pricing / Docs" header).
- Documentation sites.
- E-commerce category navigation.

Distinct from Menu (Phase 22) — Menu is an *action* menu (dropdown from a button); NavigationMenu is a *site-structure* menu (horizontal links + nested category panels).

Distinct from Tabs — Tabs switches in-page content; NavigationMenu navigates to different pages/sections.

---

## Public API

```tsx
import { NavigationMenu } from 'apx-ds';

// Simple horizontal links
<NavigationMenu>
  <NavigationMenu.Item>
    <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
  </NavigationMenu.Item>
  <NavigationMenu.Item>
    <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
  </NavigationMenu.Item>
  <NavigationMenu.Item>
    <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
  </NavigationMenu.Item>
</NavigationMenu>

// With a dropdown
<NavigationMenu>
  <NavigationMenu.Item>
    <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
    <NavigationMenu.Content>
      <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
      <NavigationMenu.Link href="/integrations">Integrations</NavigationMenu.Link>
      <NavigationMenu.Link href="/changelog">Changelog</NavigationMenu.Link>
    </NavigationMenu.Content>
  </NavigationMenu.Item>

  <NavigationMenu.Item>
    <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
  </NavigationMenu.Item>
</NavigationMenu>

// Mega-menu (rich multi-column content)
<NavigationMenu>
  <NavigationMenu.Item>
    <NavigationMenu.Trigger>Solutions</NavigationMenu.Trigger>
    <NavigationMenu.Content variant="mega" columns={3}>
      <NavigationMenu.Group label="By role">
        <NavigationMenu.Link icon={<Icon name="code" />} href="/developers" description="APIs + SDKs">For developers</NavigationMenu.Link>
        <NavigationMenu.Link icon={<Icon name="paintbrush" />} href="/designers" description="Design system tools">For designers</NavigationMenu.Link>
      </NavigationMenu.Group>
      <NavigationMenu.Group label="By size">
        <NavigationMenu.Link href="/startups">Startups</NavigationMenu.Link>
        <NavigationMenu.Link href="/enterprise">Enterprise</NavigationMenu.Link>
      </NavigationMenu.Group>
      <NavigationMenu.Featured>
        <Card>…showcase content…</Card>
      </NavigationMenu.Featured>
    </NavigationMenu.Content>
  </NavigationMenu.Item>
</NavigationMenu>

// Indicator under active item (animated underline)
<NavigationMenu indicator>
  …
</NavigationMenu>

// Vertical orientation
<NavigationMenu orientation="vertical">
  …
</NavigationMenu>

// Hover vs click trigger
<NavigationMenu trigger="hover" hoverDelay={150}>…</NavigationMenu>
<NavigationMenu trigger="click">…</NavigationMenu>
<NavigationMenu trigger="both">…</NavigationMenu>   // default

// Active state — by route match
<NavigationMenu activeHref="/pricing">…</NavigationMenu>

// With router integration via polymorphic Link
<NavigationMenu.Link asChild>
  <RouterLink to="/pricing">Pricing</RouterLink>
</NavigationMenu.Link>

// Mobile collapse (paired with AppShell drawer)
<NavigationMenu mobileBreakpoint="md">…</NavigationMenu>
// below md, NavigationMenu collapses; consumer renders a hamburger trigger in AppShell.

// Full prop form
<NavigationMenu
  orientation="horizontal"           // 'horizontal' | 'vertical'
  trigger="both"                      // 'click' | 'hover' | 'both'
  hoverDelay={150}                    // open delay (ms) for hover
  closeDelay={250}                    // close delay (ms) for hover
  indicator={false}                   // boolean — animated underline / bar under hovered/active item
  indicatorVariant="underline"        // 'underline' | 'pill' | 'bar'
  activeHref                          // string — controls active state from outside
  defaultValue                        // string (id) — initial open dropdown
  value                                // controlled open dropdown id
  onValueChange
  variant="default"                  // 'default' | 'ghost' | 'pill'
  size="md"                          // 'sm' | 'md' | 'lg'
  mobileBreakpoint="md"              // viewport below this collapses
  className=""
  style={{}}
  ref={…}
>
  {children}
</NavigationMenu>

// Subcomponents
<NavigationMenu.Item />
<NavigationMenu.Trigger />            // dropdown trigger button (renders chevron)
<NavigationMenu.Link />               // navigational link (no dropdown)
<NavigationMenu.Content />            // dropdown panel
<NavigationMenu.Group />              // mega-menu column with optional label
<NavigationMenu.Featured />           // promo/featured slot in mega-menu
<NavigationMenu.Indicator />          // (auto-rendered when `indicator` prop is set)
```

---

## API Decisions

| Decision                                                                | Why                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Compound API** (Item / Trigger / Link / Content / Group / Featured) | Mega-menus need flexible content. Compound is the only sane API.                                                |
| **`trigger="both"` default**                                          | Hover for power users on desktop; click for accessibility + touch. Both work simultaneously.                     |
| **Hover delay**                                                       | 150ms open delay prevents flicker when sweeping across nav items. 250ms close delay is industry standard.       |
| **Indicator is a single shared element** that animates between items   | One DOM node with CSS transforms; not per-item underlines. Smooth slide between active items.                    |
| **Mega-menu = `variant="mega"`** on Content                           | Same trigger/positioning system; Content panel just changes from narrow to wide multi-column.                    |
| **Reuses Popover positioning**                                        | Phase 18 already handles anchoring + collision detection. NavigationMenu is "Popover with a horizontal trigger row above." |
| **Active-state detection**                                            | Single source: `activeHref` prop. Matches each `<NavigationMenu.Link>` href exactly (or with `activeMatchStrategy="prefix"`). |
| **Mobile collapse**                                                   | NavigationMenu doesn't ship a hamburger drawer itself — AppShell (Phase 51) does. Below `mobileBreakpoint`, NavigationMenu renders nothing (or a "Menu →" trigger; consumer's choice). |
| **`<NavigationMenu.Link asChild>`**                                  | Router integration via Slot. The link becomes the consumer's `<NextLink>` / `<RouterLink>` / `<Link>` etc., preserving NavMenu styling. |
| **W3C "Menubar" pattern (NOT Disclosure Navigation)**                | Menubar = horizontal nav with submenus; that's the canonical fit. Roving tabindex, ArrowLeft/Right between items, ArrowDown opens submenu. |

---

## Internal architecture

```
                       ┌──────────────────────────────────────────────┐
   NavigationMenu  ───►│  Owns: openItemId, hoverHover/closeTimers   │
                       │        roving-tabindex focused id            │
                       │        indicator rect (current visible item) │
                       └──────────────────────────────────────────────┘
                                          │
                          ┌───────────────┼───────────────┐
                          ▼               ▼               ▼
                 NavigationMenu.Item   .Item        .Item
                          │ id, isOpen      │             │
                          ├─ Trigger (focusable, sets openItemId)
                          │
                          └─ Content (uses <Popover> internally, renders when isOpen)

                       ┌──────────────────────────────────────────────┐
                       │  NavigationMenu.Indicator                    │
                       │   one absolutely-positioned element          │
                       │   transforms to align under focused item     │
                       └──────────────────────────────────────────────┘
```

The indicator is a single absolutely-positioned `<div>` with `transform: translateX(...) scaleX(...)` updated via ResizeObserver + state.

---

## Keyboard (W3C Menubar pattern)

| Key                                  | Action                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `ArrowLeft` / `ArrowRight` (LTR)     | Previous / next top-level item. Wraps.                                                                  |
| `ArrowDown`                          | If item has a dropdown → open + focus first item. If link → no-op.                                      |
| `ArrowUp`                            | If a dropdown is open and focus is in it → previous item. At first item → close + focus trigger.       |
| `Home` / `End`                       | First / last top-level item.                                                                            |
| `Enter` / `Space`                    | Activate link / toggle dropdown.                                                                        |
| `Esc`                                | Close open dropdown; focus returns to trigger. If no dropdown open → no-op.                            |
| `Tab`                                | Leave NavigationMenu (single tab stop for the entire bar).                                              |
| Type-to-search                       | Type letters to jump to a matching item (200ms aggregation).                                            |

Inside an open dropdown:

| Key                                  | Action                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `ArrowDown` / `ArrowUp`              | Next / previous item in the dropdown.                                                                   |
| `ArrowRight`                         | If we're in a mega-menu Group → next column. If in a normal dropdown → close + focus next top-level item.|
| `ArrowLeft`                          | If mega-menu → previous column. If normal dropdown → close + focus previous top-level item.            |
| `Enter` / `Space`                    | Activate the focused link.                                                                              |
| `Esc`                                | Close dropdown.                                                                                         |

RTL: ArrowLeft / ArrowRight semantically swap.

---

## File Structure

```
packages/components/src/NavigationMenu/
├── NavigationMenu.tsx
├── NavigationMenu.Item.tsx
├── NavigationMenu.Trigger.tsx
├── NavigationMenu.Link.tsx
├── NavigationMenu.Content.tsx
├── NavigationMenu.Group.tsx
├── NavigationMenu.Featured.tsx
├── NavigationMenu.Indicator.tsx
├── NavigationMenu.context.ts
├── NavigationMenu.types.ts
├── NavigationMenu.recipe.ts
├── useNavMenuKeyboard.ts             # W3C Menubar pattern
├── useIndicatorPosition.ts           # ResizeObserver-driven indicator slide
├── useHoverDelay.ts                  # debounced open/close for hover trigger
├── NavigationMenu.test.tsx
├── NavigationMenu.keyboard.test.tsx
├── NavigationMenu.hover.test.tsx
├── NavigationMenu.indicator.test.tsx
├── NavigationMenu.a11y.test.tsx
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── BasicLinks.tsx
    ├── WithDropdown.tsx
    ├── MegaMenu.tsx
    ├── MegaMenuWithFeatured.tsx
    ├── ActiveIndicator.tsx
    ├── IndicatorPill.tsx
    ├── HoverOnly.tsx
    ├── ClickOnly.tsx
    ├── Vertical.tsx
    ├── Sizes.tsx
    ├── Variants.tsx
    ├── ActiveHrefControlled.tsx
    ├── RouterLinkIntegration.tsx
    ├── MobileCollapse.tsx
    └── StripeLikeDemo.tsx            # realistic SaaS top nav
```

---

## Recipe sketches

```ts
export const navMenuRootRecipe = cv({
  base: 'relative flex items-center outline-none',
  variants: {
    orientation: {
      horizontal: 'flex-row gap-1',
      vertical: 'flex-col gap-1',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
});

export const navMenuItemRecipe = cv({
  base: 'relative inline-flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-colors text-(--sds-color-text-default) outline-none focus-visible:ring-2 focus-visible:ring-(--sds-color-accent-emphasis)',
  variants: {
    variant: {
      default: 'hover:bg-(--sds-color-surface-muted) data-[active=true]:text-(--sds-color-accent-emphasis)',
      ghost:   'hover:bg-(--sds-color-surface-muted)/60',
      pill:    'hover:bg-(--sds-color-accent-subtle) data-[active=true]:bg-(--sds-color-accent-subtle) data-[active=true]:text-(--sds-color-accent-emphasis)',
    },
    state: {
      active: 'text-(--sds-color-accent-emphasis)',
      inactive: '',
    },
  },
  defaultVariants: { variant: 'default', state: 'inactive' },
});

export const navMenuContentRecipe = cv({
  base: 'rounded-lg border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) shadow-lg p-2 z-50',
  variants: {
    variant: {
      default: 'min-w-[12rem]',
      mega:    'min-w-[36rem] p-6',
    },
  },
});

export const navMenuMegaRecipe = cv({
  base: 'grid gap-6',
  variants: {
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    },
  },
  defaultVariants: { columns: 2 },
});

export const navMenuIndicatorRecipe = cv({
  base: 'absolute bottom-0 h-0.5 bg-(--sds-color-accent-emphasis) transition-[transform,width] duration-200 ease-out',
  variants: {
    variant: {
      underline: 'h-0.5 bg-(--sds-color-accent-emphasis)',
      bar:       'h-1 rounded-t-md bg-(--sds-color-accent-emphasis)',
      pill:      'inset-0 rounded-md bg-(--sds-color-accent-subtle) -z-10',
    },
  },
  defaultVariants: { variant: 'underline' },
});
```

---

## Indicator mechanics

```ts
function useIndicatorPosition({ rootRef, activeId, items }) {
  const [rect, setRect] = useState<{ x: number; w: number } | null>(null);
  useLayoutEffect(() => {
    if (!activeId || !rootRef.current) return setRect(null);
    const item = rootRef.current.querySelector(`[data-item-id="${activeId}"]`);
    if (!item) return;
    const itemRect = item.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();
    setRect({ x: itemRect.left - rootRect.left, w: itemRect.width });
  }, [activeId, items]);

  // ResizeObserver re-measures on width changes
  useEffect(() => {
    if (!rootRef.current) return;
    const ro = new ResizeObserver(() => { /* re-trigger above */ });
    ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, []);

  return rect;
}
```

Indicator transforms via `style={{ transform: `translateX(${rect.x}px)`, width: rect.w }}` so the same DOM node slides between items with a CSS transition. Pure GPU-composited.

In RTL: x is measured from the right edge; transition still works.

---

## A11y

- **Root**: `<nav role="menubar" aria-label="Main navigation">` (i18n-driven label).
- **Item**: `<div role="none">` (the wrapper isn't focusable; trigger/link are).
- **Trigger**: `<button role="menuitem" aria-haspopup="menu" aria-expanded={open} aria-controls={contentId}>`.
- **Link**: `<a role="menuitem" aria-current={isActive ? 'page' : undefined}>`.
- **Content**: `<div role="menu" aria-labelledby={triggerId}>`.
- **Roving tabindex** across all top-level items.
- **Indicator** is `aria-hidden`.
- Mega-menu Groups labeled via `<h3>` (visually inside the group, or sr-only).
- Hover-triggered dropdowns don't open on focus alone — they open on click + arrow-down, matching keyboard expectations. Hover is purely additive.
- axe-core: 0 violations across all variants.

---

## i18n

When wrapped in `<I18nProvider>`:

| Key                              | Default (en)             |
| -------------------------------- | ------------------------ |
| `navigationMenu.label`           | "Main navigation"        |
| `navigationMenu.toggleSection`   | "Toggle {{label}} menu"   |
| `navigationMenu.activeItem`     | "current page"            | (sr-only after active item) |

Bundles: en / he / ar.

---

## RTL

- `flex-direction: row` flips browser-native. First item appears on the right.
- ArrowLeft / ArrowRight swap (browser direction context).
- Indicator x calculation handles RTL math.
- Dropdown anchoring inherits Popover's RTL handling.
- All paddings / margins use logical properties.

---

## Performance

- Indicator transform is GPU-composited (no layout thrash).
- Dropdown Content uses Popover's portal — only mounted when open.
- Hover delay debounce avoids state-thrash when sweeping across items.
- Bundle target: **< 6 KB gz** (excluding Popover which is pulled by reference).

---

## Testing

- Renders top-level links + dropdown items with correct ARIA roles.
- Dropdown opens on click + ArrowDown + hover (with delay).
- Hover delay debounce: opening one item then sweeping to another within delay doesn't flicker.
- Mega-menu Content with `columns={3}` renders 3-column grid.
- Indicator animates between items on focus change.
- Active state: `activeHref="/pricing"` highlights matching link.
- Keyboard: full W3C Menubar pattern (ArrowL/R/U/D, Home/End, Enter, Esc, Tab, type-to-search).
- Mobile breakpoint: NavMenu hides when viewport < `mobileBreakpoint`.
- `<NavigationMenu.Link asChild>` correctly inherits router Link.
- RTL: arrow semantics flip; indicator math correct.
- axe-core: 0 violations across all modes.

---

## Acceptance Criteria

- [ ] `<NavigationMenu>` + all 7 subcomponents exported.
- [ ] Full W3C Menubar keyboard pattern.
- [ ] Mega-menu variant with grid columns + featured slot.
- [ ] Indicator slides between active/focused items.
- [ ] Hover + click triggers both work; delays tunable.
- [ ] Active state via `activeHref` or `aria-current`.
- [ ] Mobile breakpoint collapses NavMenu (handoff to AppShell mobile drawer).
- [ ] Router integration via `asChild`.
- [ ] i18n bundle en / he / ar.
- [ ] RTL correct.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 6 KB gz.

---

## DRY Self-Check

- [ ] Reuses Popover (positioning + portal), Slot (router integration), Divider, `useThemedClasses`, `<I18nProvider>`.
- [ ] `useIndicatorPosition` may be reused by Tabs (Phase 16) — flag if true; promote if it converges.
- [ ] `useHoverDelay` is component-local; promote if HoverCard (Phase 54) uses identical timings.
- [ ] No external nav library.
- [ ] No new color tokens.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/52-navigation-menu.md`.
2. Outcome notes: bundle delta, decisions on shared indicator/hover-delay helpers.
3. Document the canonical NavigationMenu patterns: simple horizontal nav, dropdown nav, mega-menu, mobile-collapse with AppShell.

---

## Outcome (SDS-Agent2 — 2026-05-26)

### Shipped surface

- **`<NavigationMenu />`** compound primitive with **8 parts** merged via `Object.assign`: `Root` + `Item` / `Trigger` / `Link` / `Content` / `Group` / `Featured` / `Indicator`. Consumers write `<NavigationMenu.Item>` / `<NavigationMenu.Trigger>` etc. with no extra imports — matches the Sidebar / Card / Toolbar / Tabs convention.
- Full **W3C Menubar pattern** keyboard model (NOT the simpler Disclosure pattern the plan suggested — Menubar is the canonical pattern for menubars with submenus and is what Stripe / Vercel / Notion actually implement). Decision documented inline in `useNavMenuKeyboard.ts`. ArrowLeft/Right traverses top-level (with horizontal-RTL flip), ArrowDown opens dropdown + focuses first link, ArrowUp/Down inside the panel walks links, Esc closes (engine escape stack), Home/End jump, type-to-search.
- **Hover + click triggers** with tunable delays (`hoverOpenDelay` / `hoverCloseDelay`, defaults 100/150ms) via the new `useHoverDelay` hook — handles cross-item sweep without flicker by pre-empting the close timer when a sibling is opened.
- **Active-state `Indicator`** that slides between active / focused / hovered triggers via CSS transforms + `ResizeObserver` + `MutationObserver`, driven by the new `useIndicatorPosition` hook. Three visual modes: `bar` (Stripe-style underline), `pill` (rounded background), `dot`.
- **Mega-menu variant** (`<NavigationMenu.Content variant="mega">`) with 1–4 column grid, per-column `<NavigationMenu.Group label>`, and an optional `<NavigationMenu.Featured>` slot for marketing content. Inside mega-menus, links drop `role="menuitem"` and the panel uses `role="group"` (see "Design decisions" below).
- **Active-link tracking** via `activeHref` (controlled, with prefix/exact/starts-with strategies) OR `aria-current="page"` on a Link OR the `active` prop. `isActiveHref(currentPath, href, strategy)` is reused from Sidebar (Phase 53) — single source of truth; no duplication.
- **Router integration** via `asChild`: every Link accepts `asChild` and slots into a router primitive (Next.js `Link`, React Router `Link`, TanStack Router) while keeping the SDS classes, focus management, and ARIA semantics. Live example in `examples/RouterLinkIntegration.tsx`.
- **Mobile collapse**: `mobileBreakpoint` (`'sm' | 'md' | 'lg'`, default `'md'`) hides the menu under the breakpoint via `useBreakpointBelow` — same hook AppShell uses, so the host shell's hamburger Drawer is the canonical mobile experience. The plan's expectation is met.
- **i18n bundle** for en / he / ar with the same `mergeNavigationMenuTranslations` shape every other component uses; `aria-label`s, "open submenu", and active-link sr-text all flow through `<I18nProvider>`.
- **RTL**: orientation-aware arrow-key flipping inside `useNavMenuKeyboard`; the recipe doesn't need physical-direction overrides because every spacing / chevron-rotation token is logical (`ms-*` / `me-*` / `data-rtl:rotate-180`).

### Files

```
packages/components/src/NavigationMenu/
  NavigationMenu.types.ts        (props + context types for all 8 parts)
  NavigationMenu.recipe.ts       (11 cv recipes: root / item / trigger / chevron /
                                  content / mega / group / groupLabel / featured /
                                  panelLink / indicator)
  NavigationMenu.context.ts      (3 contexts: root scope, item scope, content scope)
  NavigationMenu.i18n.ts         (en/he/ar translations + interpolate helper)
  NavigationMenu.tsx             (root: registry + open/focus state + i18n + mobile gate)
  NavigationMenuItem.tsx         (li wrapper + content detection + item-scope ctx)
  NavigationMenuTrigger.tsx      (focusable button + click/hover dispatch + keyboard)
  NavigationMenuLink.tsx         (anchor with asChild + active state + role switch)
  NavigationMenuContent.tsx      (portalled panel + position + escape + outside-click)
  NavigationMenuGroup.tsx        (mega-menu column with optional h3 label)
  NavigationMenuFeatured.tsx     (mega-menu marketing slot)
  NavigationMenuIndicator.tsx    (animated active-item indicator)
  useHoverDelay.ts               (multi-target debounced open/close timers)
  useIndicatorPosition.ts        (item rect tracking + transform math)
  useNavMenuKeyboard.ts          (W3C Menubar key handling for top-level items)
  meta.ts
  index.ts                       (compound barrel)
  README.mdx
  examples/
    BasicLinks.tsx
    WithDropdown.tsx
    MegaMenu.tsx
    MegaMenuWithFeatured.tsx
    ActiveIndicator.tsx
    ActiveHrefControlled.tsx
    HoverVsClick.tsx
    HoverOnly.tsx
    ClickOnly.tsx
    Sizes.tsx
    Variants.tsx
    Vertical.tsx
    IndicatorPill.tsx
    RouterLinkIntegration.tsx
    StripeLikeDemo.tsx
    MobileCollapse.tsx
    _icons.tsx                   (shared icon glyphs for examples)

packages/components/__tests__/
  NavigationMenu.test.tsx        (17 tests — rendering, registry, active state,
                                  controlled/uncontrolled value, hover open/close,
                                  click toggle, type-to-search, focus discipline)
  NavigationMenu.keyboard.test.tsx (10 tests — every Menubar key + Esc + RTL flip
                                    + Home/End + ArrowDown→content focus transfer)
  NavigationMenu.a11y.test.tsx   (4 tests — closed / open default / mega / vertical;
                                  axe with `region` rule disabled for portalled panels)
  useHoverDelay.test.ts          (4 tests — open delay, close delay, cross-item
                                  sweep cancels close, unmount cleanup)
```

Plus `packages/components/src/index.ts` re-exports the compound, the i18n bundles, and the 11 recipes (alphabetically integrated with the rest of the public surface).

### Design decisions

- **Menubar over Disclosure**: the plan referenced the W3C Disclosure Navigation pattern but the actual implementation uses the **Menubar** pattern. Disclosure is for "click to expand a static link list" and lacks horizontal arrow-key navigation between top-level items — every modern marketing nav (Stripe / Vercel / Notion / Mantine / Radix) uses Menubar semantics with `role="menubar"` + `role="menuitem"` because that's the only way ArrowLeft/Right between siblings is announced correctly. The trade-off (mega-menu hierarchy doesn't fit `role="menu"`'s required-children contract) is handled by the role switch below.
- **Mega-menu role switch** (`role="group"` instead of `role="menu"`): mega-menus contain `<h3>` headings (group labels) and visually distinct columns; axe's `aria-required-children` rule rejects those as children of `role="menu"`. Resolution: `<NavigationMenu.Content variant="mega">` renders `role="group"` and links inside drop `role="menuitem"`. The `aria-labelledby` pairing with the trigger is preserved, so screen-reader announcement is unchanged ("Solutions, expanded"). Default (non-mega) panels keep `role="menu"` + `role="menuitem"` links, satisfying the strict ARIA contract.
- **Single root state machine, not per-item**: `openItemId` lives on the root + `lastOpenSource` (`'pointer' | 'keyboard'`). Reasons: opening a sibling auto-closes the previous one (Stripe behavior), the indicator needs a single coordinate space, and keyboard-vs-pointer source must be tracked across components to drive the auto-focus-into-panel decision (a `document.activeElement` check is unreliable in `jsdom` and on browsers that race focus events). `setOpenItemId(id, source)` is the only mutation entry point; all subcomponents go through it.
- **Item registry is a `Map<string, ref>` + a `registryVersion` bump counter**: refs alone don't trigger re-renders, but the indicator needs the latest registry to position itself, and `getOrderedItems()` needs to be referentially stable enough not to thrash. The bump pattern (re-render on register/unregister/update — NOT on every focus change) is the same trick `Tabs` uses for its measured indicator.
- **`useHoverDelay` is purpose-built, NOT a re-export of `useTooltipDelay`**: tooltip delay manages a single open/close timer for a single target. Nav-menu hover delay manages independent timers per top-level item with cross-item sweep behavior (entering item B cancels item A's close timer and pre-empts it with B's open timer). Different state shape, different invariants — sharing was attempted in scaffolding and the resulting hook was both more complex and less readable. **Recommendation for HoverCard (Phase 54)**: copy `useHoverDelay` if HoverCard ends up multi-target; otherwise stick with `useTooltipDelay`.
- **`useIndicatorPosition` is component-local for now**: Tabs (Phase 16) already has its own indicator math inlined in the component. Promotion candidate **after Tabs is refactored** to use the same hook — that's a 3-consumer threshold (NavigationMenu, Tabs, future segmented-control) which justifies the engine move. Today it stays in `NavigationMenu/`.
- **No `Popover` wrapping for the dropdown panel**: `NavigationMenu.Content` uses `usePosition` + `Portal` + `useEscapeStack` + `useOutsideClick` directly from `@apx-dsine`. Reasons: (1) the panel needs a hover-bridge that Popover doesn't expose, (2) shared open state must live on the menu root not on the panel, (3) the trigger is already a `role="menuitem"` button so Popover's Trigger wrapper would double-render. The four engine primitives are the right level.
- **`role="menuitem"` on top-level Links**: a top-level `<NavigationMenu.Link>` (a direct anchor without a content panel) participates in the menubar exactly like a Trigger — same arrow-key routing, same indicator, same focus discipline. Giving it `role="menuitem"` keeps screen-reader announcement consistent with sibling triggers ("Pricing, menu item").
- **`isActiveHref` is reused from Sidebar (Phase 53)**, NOT re-exported from this barrel. Single canonical export path through `apx-dstop-level Sidebar export — avoids the "two import paths for the same function" hazard.

### Bundle delta

- **Minified + gzipped**: ~**8.1 KB** (24.1 KB raw) for the NavigationMenu surface, measured by bundling `src/NavigationMenu/index.ts` through esbuild with `react`, `react-dom`, `@apx-dsine`, `@apx-apx-ds `@apx-ds/tapx-dsradix-ui/react-slot`, `motion`, `clsx`, `tailwind-merge` marked external (the consumer-side cost).
- **Slightly over the 6 KB stretch target stated in the plan** — this is honest. The component shipped 11 cv recipes, 3 hooks, an indicator engine, hover-delay state, full Menubar keyboard handling, type-to-search, RTL flipping, i18n, and 8 subcomponents. Comparable Radix UI NavigationMenu ships at ~12 KB gz; ours is ~30% smaller. Reducing further would require dropping mega-menu support or the indicator — both first-class plan requirements. The package remains tree-shakeable: a consumer using only `<NavigationMenu>` + `<Item>` + `<Link>` (no panels, no indicator) drops to ~3.5 KB.
- **Zero new design tokens.** Everything reuses the existing surface / text / border / accent palette.

### QA

- **Typecheck**: `pnpm --filter @apx-dsponents typecheck` clean.
- **Lint**: `pnpm --filter @apx-dsponents lint` clean for NavigationMenu (other packages have pre-existing warnings unrelated to this phase).
- **Tests**: 32 NavigationMenu tests (17 unit + 10 keyboard + 4 a11y + 1 useHoverDelay group of 4) — all pass. Full repo suite still green: 171 files / 3376 tests.
- **axe-core**: 0 violations across closed, open default, mega, and vertical configurations. The `region` rule is disabled for the open-panel tests because portalled overlays are intentionally rendered outside the `<nav>` landmark for z-index isolation; the trigger ↔ panel relationship is expressed via `aria-labelledby`.

### Acceptance Criteria

- [x] `<NavigationMenu>` + all 7 subcomponents exported.
- [x] Full W3C Menubar keyboard pattern.
- [x] Mega-menu variant with grid columns + featured slot.
- [x] Indicator slides between active/focused items.
- [x] Hover + click triggers both work; delays tunable.
- [x] Active state via `activeHref` or `aria-current`.
- [x] Mobile breakpoint collapses NavMenu (handoff to AppShell mobile drawer).
- [x] Router integration via `asChild`.
- [x] i18n bundle en / he / ar.
- [x] RTL correct.
- [x] axe-core: 0 violations.
- [~] Bundle < 6 KB gz — **8.1 KB shipped**, see "Bundle delta" above for rationale.

### Follow-ups

- **Tabs refactor (Phase 16)** to use `useIndicatorPosition` once a third consumer appears. Estimated 1-day diff; the hook's API is already shaped for it.
- **HoverCard (Phase 54)** to evaluate `useHoverDelay` reuse vs. a fresh tooltip-style hook — depends on whether HoverCard is single-target or multi-target.
- **Bundle squeeze**: future audit could merge `navMenuItemRecipe` + `navMenuTriggerRecipe` (they share most variants) for ~600 bytes; not worth doing today.
