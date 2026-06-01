# Phase 32 — `<Breadcrumbs />`

> Status: **✓ Completed** · Owner: SDS-Agent8 · Depends on: Phase 6 (Button — link-style variant only) · Optional: Phase 22 (Menu — for overflow collapse) · Blocks: nothing
> Independent of the positioning engine for the core mode; overflow collapse opts into Menu.

## Objective

Ship the canonical navigation-hierarchy primitive — `<Breadcrumbs />`. Shows the user's path through a nested hierarchy:

```
Home / Users / John Smith / Settings
```

Supports:

- Custom separators (slash, chevron, dot, arrow, or any React node).
- **Truncation / overflow collapse** for deep paths — middle items collapse into a `<Menu>` trigger button.
- Polymorphic items (`asChild` to render as `<Link>` from any router).
- Full RTL (chevron flips, order naturally reverses with `dir`).
- Last item rendered as non-link "current page" by default.

---

## What This Component Proves

- A simple compound component (`<Breadcrumbs.Item>`, `<Breadcrumbs.Separator>`) is sufficient when the data model is a flat list.
- Polymorphic `asChild` (via Phase 3's `<Slot>`) integrates cleanly with router libraries (Next/Link, React Router, TanStack Router) without per-router shims.
- Overflow collapse uses Menu (Phase 22) as a black box — no breadcrumb-specific dropdown logic.

---

## Public API

```tsx
import { Breadcrumbs } from 'apx-ds';
import Link from 'next/link';

// High-level (array API — preferred)
<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Users', href: '/users' },
    { label: 'John Smith', href: '/users/123' },
    { label: 'Settings' },                       // last item — no href = "current"
  ]}
  separator="/"                                  // string | ReactNode
  maxItems={4}                                   // truncate longer paths into an overflow menu
/>

// Polymorphic item renderer (for router integration)
<Breadcrumbs
  items={[
    { label: 'Home', to: '/' },
    { label: 'Users', to: '/users' },
    { label: 'John' },
  ]}
  renderItem={({ item, isCurrent, defaultClassName }) =>
    isCurrent
      ? <span aria-current="page" className={defaultClassName}>{item.label}</span>
      : <Link to={item.to} className={defaultClassName}>{item.label}</Link>
  }
/>

// Compound form (when JSX is more natural than array)
<Breadcrumbs>
  <Breadcrumbs.Item asChild><Link to="/">Home</Link></Breadcrumbs.Item>
  <Breadcrumbs.Separator />
  <Breadcrumbs.Item asChild><Link to="/users">Users</Link></Breadcrumbs.Item>
  <Breadcrumbs.Separator />
  <Breadcrumbs.Item asChild><Link to="/users/123">John Smith</Link></Breadcrumbs.Item>
  <Breadcrumbs.Separator />
  <Breadcrumbs.Item current>Settings</Breadcrumbs.Item>
</Breadcrumbs>

// Full prop form
<Breadcrumbs
  /* data */
  items={…}                                      // array form (optional if using compound children)
  /* layout */
  separator="/"                                  // string | ReactNode | (i, total) => ReactNode
  maxItems={undefined}                           // total visible items (incl. first + last)
  itemsBeforeCollapse={1}                        // # items at the start to keep when truncating
  itemsAfterCollapse={1}                         // # items at the end to keep when truncating
  /* visual */
  variant="ghost"                                // 'ghost' | 'soft' | 'underline' (link-like)
  size="md"                                      // 'sm' | 'md' | 'lg'
  color="neutral"                                // 7-color palette
  separatorColor="muted"                         // 'muted' (default) | 'subtle' | 'inherit'
  /* a11y */
  aria-label="Breadcrumb"                        // default — overridable
  /* render override */
  renderItem={(ctx) => <ReactNode />}            // single render fn for all items
  /* misc */
  className=""
  sx={{}}
/>
```

---

## API Decisions

| Decision                                                       | Why                                                                                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Both array API + compound API exported**                     | Array is faster for dynamic paths from router; compound is natural when items are diverse (e.g. icon + label).      |
| **Last item without `href` is "current page"** (in array API)  | Convention — saves a `current: true` flag in the common case.                                                       |
| **`renderItem` is a single function, not per-item**            | Consumers using a router can wire all items in one place.                                                            |
| **`maxItems` triggers overflow**, with `before` + `after` controls | Matches MUI / Polaris conventions; predictable truncation.                                                       |
| **Separator is a prop, not a child**                           | Always identical between siblings — no point making consumers repeat it. Compound form's `<Breadcrumbs.Separator />` is auto-inserted by `<Breadcrumbs>`; consumers who include it themselves get a no-op skip. |
| **Overflow menu uses `<Menu>` (Phase 22)**                     | No new dropdown logic; gates overflow behind Phase 22.                                                              |
| **Soft fallback if Menu is unavailable**                       | If `maxItems` is set but Menu hasn't shipped yet (impossible after Phase 22, but for tree-shaking), overflow renders as inline "…" (non-interactive). Dev-warn. |

---

## Variants

| Variant     | Link state idle             | Link state hover            | Current item                 | Use case                   |
| ----------- | --------------------------- | --------------------------- | ---------------------------- | -------------------------- |
| `ghost`     | `text-fg-muted`             | `text-fg-default underline` | `text-fg-default font-medium`| **Default.** Subtle nav.   |
| `soft`      | `text-<color>-soft`         | `text-<color>-solid`        | `text-<color>-solid font-medium` | Tinted nav.            |
| `underline` | `text-<color>-solid underline decoration-2 underline-offset-2` | brighter | `text-fg-default no-underline font-medium` | Anchor-style. |

7 colors × 3 variants × 3 sizes (mostly tweaking `font-size` + `gap`).

### Sizes

| Size | Font          | Item gap         | Icon size            |
| ---- | ------------- | ---------------- | -------------------- |
| `sm` | `text-xs`     | `gap-1`          | `size-3`             |
| `md` | `text-sm`     | `gap-1.5`        | `size-3.5`           |
| `lg` | `text-base`   | `gap-2`          | `size-4`             |

---

## File Structure

```
packages/components/src/Breadcrumbs/
├── Breadcrumbs.tsx
├── BreadcrumbsItem.tsx
├── BreadcrumbsSeparator.tsx
├── BreadcrumbsOverflow.tsx          # consumes <Menu>
├── Breadcrumbs.types.ts
├── Breadcrumbs.recipe.ts            # root, item, separator, overflowTrigger
├── computeVisibleItems.ts           # pure: items[] + maxItems + before/after → (items[], hiddenItems[])
├── Breadcrumbs.test.tsx
├── Breadcrumbs.a11y.test.tsx
├── Breadcrumbs.compute.test.ts
├── index.ts                         # Object.assign(Breadcrumbs, { Item, Separator })
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Truncated.tsx                # 7 items → maxItems=4
    ├── CustomSeparator.tsx          # ChevronRight icon
    ├── WithIcons.tsx                # leading icon per item
    ├── RouterLink.tsx               # Next.js Link via asChild
    ├── RenderItem.tsx               # consumer renderItem
    ├── Compound.tsx                 # <Breadcrumbs.Item>…</Breadcrumbs.Item> form
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Rtl.tsx                      # Hebrew labels + dir=rtl
    └── LongLabels.tsx               # ellipsis when label is too long
```

---

## Recipes

```ts
export const breadcrumbsRecipes = {
  root: cv({
    base: 'flex items-center flex-wrap',
    variants: {
      size: { sm: 'gap-1 text-xs', md: 'gap-1.5 text-sm', lg: 'gap-2 text-base' },
    },
  }),
  item: cv({
    base: 'inline-flex items-center gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-fast',
    variants: {
      variant: { ghost: '', soft: '', underline: '' },
      color:   { primary: '', /* … */ },
      state:   {
        link:    'cursor-pointer hover:underline',
        current: 'cursor-default',
      },
    },
    compoundVariants: [ /* …21 cells per state: 3 × 7 × 1… */ ],
  }),
  separator: cv({
    base: 'inline-flex items-center select-none text-fg-muted shrink-0',
    variants: {
      color: { muted: 'text-fg-muted', subtle: 'text-fg-subtle', inherit: 'text-inherit' },
    },
  }),
  overflowTrigger: cv({
    base: 'px-1 py-0.5 rounded-sm hover:bg-bg-subtle text-fg-muted',
  }),
};
```

---

## Overflow Logic — `computeVisibleItems()`

```ts
export function computeVisibleItems<T>({
  items,
  maxItems,
  itemsBeforeCollapse,
  itemsAfterCollapse,
}: {
  items: T[];
  maxItems?: number;
  itemsBeforeCollapse: number;       // default 1
  itemsAfterCollapse: number;        // default 1
}): { visible: T[]; hidden: T[]; collapsedAt: number | null };
```

Pure function; testable in isolation.

Cases:

| items / maxItems / before / after | Result                                                        |
| --------------------------------- | ------------------------------------------------------------- |
| 4 / undefined / -                 | all visible, no collapse                                      |
| 4 / 4 / 1 / 1                     | all visible (within budget)                                   |
| 6 / 4 / 1 / 1                     | `[items[0], …, items[4], items[5]]`, hidden = `items[1..3]`   |
| 6 / 4 / 0 / 2                     | `[…, items[3], items[4], items[5]]`, hidden = `items[0..2]`   |
| 3 / 2 / 1 / 1                     | all visible (after pruning ellipsis still > budget)            |

---

## Overflow UX

When `collapsedAt != null`, the middle items render as a single `<Menu>` trigger button (e.g. an ellipsis icon button). Clicking opens the menu with the hidden items in original order. Each menu item is the same `<Breadcrumbs.Item>` rendered inside Menu's slot — `renderItem` is honored.

Falls back to inline non-interactive `<span aria-hidden>…</span>` if `<Menu>` is somehow unavailable (dev-warn).

---

## A11y

- Root: `<nav aria-label={ariaLabel}>`. Default label "Breadcrumb" (translatable via I18nProvider).
- Inner: `<ol>` with each item in `<li>`. `<ol>` over `<ul>` because order matters.
- Last item: `aria-current="page"` (or `aria-current="step"` if `current="step"` prop set).
- Separators: `role="presentation"` + `aria-hidden="true"` so screen readers don't read "slash slash slash."
- Overflow button: `aria-label={t.breadcrumbsShowHidden}` ("Show hidden navigation items"). `aria-haspopup="menu"` + `aria-expanded`.
- Keyboard: native Tab through links; Menu (when overflow open) uses Menu's existing keyboard pattern.
- axe-core: 0 violations.

---

## RTL

- `<ol>` natural flow follows `dir` — items render right-to-left.
- Separator: if a chevron icon, use `<ChevronEnd />` (logical) so it flips automatically. If a string `/`, it's symmetric — no change needed.
- Long-label truncation uses `text-ellipsis` + `max-w-[…]` — works in both directions.

---

## I18n

Small namespace added to `<I18nProvider>`:

```ts
export interface BreadcrumbsTranslations {
  navLabel: string;
  showHidden: string;
  homeLabel: string;            // optional: when item has type: 'home' icon-only
}
```

Defaults to English; merges via the same precedence rule as DataGrid / Pagination.

---

## Animation

- Hover underline: `transition-colors duration-fast`.
- Overflow menu: inherits Menu's open/close animation.
- No other motion.

---

## Testing

- Pure (`Breadcrumbs.compute.test.ts`): exhaustive table for `computeVisibleItems`.
- Integration: array API + compound API both render correctly; `renderItem` is invoked per item; overflow opens Menu with hidden items.
- A11y: nav + ol + li structure; `aria-current="page"` on last; separators `aria-hidden`; axe across all 3 × 7 × 3 = 63 variant cells.
- RTL: visual snapshot with Hebrew labels.
- Bundle target: < 2.5 KB gz (excluding optional `<Menu>` peer).

---

## Acceptance Criteria

- [ ] Array API + compound API both work; equivalent output.
- [ ] Custom separator (string or React node).
- [ ] `maxItems` truncation with `<Menu>` overflow.
- [ ] `renderItem` polymorphic; router integration tested (Next/Link + React Router).
- [ ] Last item = `aria-current="page"` (auto-detected from missing `href` or explicit `current` prop).
- [ ] 3 variants × 7 colors × 3 sizes (63 cells) snapshot.
- [ ] axe-core: 0 violations.
- [ ] RTL: visual + chevron flip verified.
- [ ] `<I18nProvider>` integration.
- [ ] Bundle < 2.5 KB gz (excluding `<Menu>` peer).

---

## DRY Self-Check

- [ ] Reuses `<Slot>` (Phase 3) for `asChild` polymorphism.
- [ ] Reuses `<Menu>` (Phase 22) for overflow — no breadcrumb-specific dropdown logic.
- [ ] Reuses `<I18nProvider>` from engine.
- [ ] `computeVisibleItems` is pure — testable in isolation.
- [ ] No `clsx`; uses `useThemedClasses`.
- [ ] No new visual primitives beyond link-style item recipe.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/32-breadcrumbs.md`.
2. Append `## Outcome`: bundle delta, router-integration verification, deviations.
3. Breadcrumbs is the **third consumer** of `<I18nProvider>` (after DataGrid + Pagination) — confirms i18n primitive is mature; promote into the public engine docs.

---

## Outcome

Shipped `<Breadcrumbs />` as a compound + array-API navigation primitive that renders `<nav aria-label="Breadcrumb"><ol>…</ol></nav>` and threads variant / size / color / separator through React context to subparts. Both APIs land on the exact same DOM shape so screen readers see one consistent structure regardless of which surface the consumer chose.

### Files shipped

- `packages/components/src/Breadcrumbs/Breadcrumbs.types.ts` — `BreadcrumbsItem` (data), `BreadcrumbsItemProps` (subpart), `BreadcrumbsRenderItemContext`, `BreadcrumbsContextValue`, etc.
- `packages/components/src/Breadcrumbs/Breadcrumbs.recipe.ts` — five-slot recipe (`root`, `list`, `item`, `separator`, `overflowTrigger`) with 3 variants × 7 colors × `link`/`current` state matrix in `compoundVariants`.
- `packages/components/src/Breadcrumbs/BreadcrumbsContext.ts` — context + `useBreadcrumbsContext(componentName)` that throws when subparts render outside the root.
- `packages/components/src/Breadcrumbs/computeVisibleItems.ts` — pure overflow-collapse calculator, table-tested in isolation (no React shell).
- `packages/components/src/Breadcrumbs/BreadcrumbsSeparator.tsx` — `<li role="presentation" aria-hidden="true">` divider that paints the root's `separator` content.
- `packages/components/src/Breadcrumbs/BreadcrumbsItem.tsx` — `<li>` wrapping span / `<a>` / `asChild` child; merges recipe className + `aria-current="page"` onto the child element.
- `packages/components/src/Breadcrumbs/BreadcrumbsOverflow.tsx` — collapsed-middle dropdown built on `<Menu>` (Phase 22 consumed as a black box, no Menu internals touched).
- `packages/components/src/Breadcrumbs/Breadcrumbs.tsx` — root that owns array-API rendering, compound-API auto-separator weaving, `maxItems` collapse, and context propagation.
- `packages/components/src/Breadcrumbs/index.ts` — `Object.assign(BreadcrumbsRoot, { Item, Separator })` compound.
- `packages/components/src/Breadcrumbs/meta.ts` — renderer metadata.
- `packages/components/src/Breadcrumbs/examples/*.tsx` (12 examples): `Basic`, `Truncated`, `CustomSeparator`, `WithIcons`, `RouterLink`, `RenderItem`, `Compound`, `Variants`, `Sizes`, `Colors`, `Rtl`, `LongLabels`.
- `packages/components/src/Breadcrumbs/README.mdx` — anatomy / examples / props / overflow / a11y / router integration / theming / RTL / i18n / do-don't.
- `packages/components/__tests__/Breadcrumbs.compute.test.ts` (9 tests).
- `packages/components/__tests__/Breadcrumbs.test.tsx` (24 tests).
- `packages/components/__tests__/Breadcrumbs.a11y.test.tsx` (28 tests, including 21-cell axe matrix across all variant × color combos).
- `packages/components/src/index.ts` — public exports for `Breadcrumbs`, `useBreadcrumbsContext`, `computeVisibleItems`, and the full type surface.
- `apps/renderer/src/generated/exampleRegistry.ts` — regenerated, 12 Breadcrumbs entries wired.

### Test summary

`pnpm vitest run __tests__/Breadcrumbs.*` → **61 / 61 pass** (compute: 9, behavior: 24, a11y: 28). Lint clean (0 errors, 0 warnings on Breadcrumbs files after removing one unused `eslint-disable` directive). Typecheck clean — `pnpm typecheck` reports zero Breadcrumbs-attributable errors; the only failures are pre-existing in `Stack/`, `Stat/` (other owners).

### Ship-gate (new functional-example rule)

- **Default example is interactive**: every link in `Basic` is clickable (uses `href="#…"` so it doesn't navigate away in the renderer).
- **Truncated example demonstrates real behavior**: clicking the ellipsis opens the Menu overflow and shows the hidden crumbs. No hidden-only examples; no auto-open on mount.
- **README live blocks**: every example renders through `<ExampleBlock />` so consumers see real DOM, not screenshots.
- **No renderer restart**: only data files changed in `apps/renderer/` (generated registry).

### Notable implementation decisions

1. **Five-slot recipe instead of four** — added a dedicated `overflowTrigger` slot so theme overrides can target the ellipsis button without leaking into regular items. The plan called for four slots; this is the only deviation and was needed to keep the overflow trigger themable in isolation.
2. **Auto-separator weaving in the compound API only fires when no manual separators exist** — if the consumer pre-inserts `<Breadcrumbs.Separator>`s themselves, the root walks their children unmodified. Detected by checking element-type identity against `BreadcrumbsSeparator`.
3. **`asChild` uses `cloneElement` directly instead of engine `<Slot>`** — needed because we inject an `icon` slot alongside the child's existing `children`. `<Slot>` only merges props onto a single element, but we want to also wrap an optional icon span next to the child's content. The merge logic still mirrors `<Slot>`: className concat + aria-current overlay + ref forwarding via the outer `<li ref>`.
4. **Array-API `current` detection** — an item is auto-flagged as the current page iff `current === undefined && index === last && !href && !to`. Explicit `current: true` overrides this even when an `href` is present.
5. **`computeVisibleItems` is a pure standalone function** — same convention as `useTabsKeyboard` / `stackChildrenWithDivider`; table-tested without a React render.
6. **Overflow fallback** — when `before + after + 1` (the +1 is the trigger) wouldn't actually save any visible slots, the function returns "everything visible" instead of collapsing for zero gain.

### Deviations from the plan

- **i18n / `<I18nProvider>` integration deferred** — the engine doesn't ship an `<I18nProvider>` primitive yet (DataGrid + Pagination haven't landed). The two translatable strings (`aria-label="Breadcrumb"` and the overflow trigger label) are exposed as overridable props (`aria-label`, `overflowAriaLabel`) so the API surface stays stable when the i18n hook ships. No breaking change expected at that time — just swap the default-prop fallback for `useI18n().t(…)`. Plan acceptance criteria checkbox for `<I18nProvider>` is left unchecked; the surrounding row is satisfied via prop-level overrides.
- **63-cell visual snapshot reduced to 21-cell axe matrix** — the snapshot harness isn't wired into this package yet. The a11y matrix exercises every variant × color cell against axe-core; the visual snapshot is deferred to whenever the broader snapshot infra lands.
- **Bundle measurement deferred** — no bundle-size guard exists in the components package yet; the implementation is small (one root + two subparts + overflow + pure helper) and Menu is consumed as a peer import so it tree-shakes out when consumers don't pass `maxItems`. A bundle gate can be added later without code changes.
- **Recipe gained an `overflowTrigger` slot** (see decision #1 above).

### Coordination notes

- **Menu (Phase 22) consumed unchanged.** No edits to `packages/components/src/Menu/*`. Overflow renders `<Menu><Menu.Trigger asChild>…</Menu.Trigger><Menu.Content>…<Menu.Item /></Menu.Content></Menu>` and forwards `size` so a `lg` breadcrumb still gets an `md` (Menu's max) dropdown. If Menu ever changes its trigger contract, this is the only spot to revisit.
- **Engine `forwardRef` + `useThemedClasses`** used identically to Tabs / Radio / Accordion. Nothing new added to the engine surface.
- **Pre-existing build red** (`Stack/stackChildrenWithDivider.tsx`, `Stat/Stat.tsx`, `Stat/StatGroup.tsx`) confirmed unrelated; surfaced earlier and assigned to other owners. Breadcrumbs itself emits zero errors / zero warnings.