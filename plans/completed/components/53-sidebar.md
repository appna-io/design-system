# Phase 53 — `<Sidebar />`

> Status: **✅ Shipped** · Owner: **SDS-Agent2** · **Tier 2** · Depends on: Phase 3 (`<Slot>`), Phase 14 (Card), Phase 17 (Tooltip — collapsed-rail labels), Phase 22 (Menu — section dropdowns), Phase 26 (Accordion — collapsible groups), Phase 38 (Divider), Phase 51 (AppShell — typical host), Phase 27 (I18nProvider — optional)
> Vertical app navigation rail with sections, items, collapsible groups, badge counts, rail mode. The piece that lives inside AppShell's `sidebar` slot.

## Objective

Ship the **`<Sidebar />`** primitive — the vertical navigation rail that lives inside AppShell's `sidebar` slot (Phase 51) and powers the left-hand nav of dashboards, admin panels, and internal tools.

Today consumers compose their own with a `<nav>` + flexbox + `<ul>` + `<a>` + active-state matching. Phase 53 standardizes:

- Hierarchical sections + items.
- Active-state tracking (URL match).
- Collapsible groups (using Accordion mechanics).
- Badge counts beside items.
- Rail mode: when AppShell collapses the sidebar, items hide their labels and show only icons; full labels become Tooltips.
- Header + footer slots (logo at top, user profile at bottom).
- Router integration via `asChild`.

---

## Public API

```tsx
import { Sidebar } from 'apx-ds';

// Simple flat nav
<Sidebar>
  <Sidebar.Item icon={<Icon name="home" />} href="/" active>Home</Sidebar.Item>
  <Sidebar.Item icon={<Icon name="inbox" />} href="/inbox" badge={3}>Inbox</Sidebar.Item>
  <Sidebar.Item icon={<Icon name="settings" />} href="/settings">Settings</Sidebar.Item>
</Sidebar>

// With sections
<Sidebar>
  <Sidebar.Header>
    <Logo />
  </Sidebar.Header>

  <Sidebar.Section label="Workspace">
    <Sidebar.Item icon={<Icon name="home" />} href="/">Home</Sidebar.Item>
    <Sidebar.Item icon={<Icon name="inbox" />} href="/inbox" badge={3}>Inbox</Sidebar.Item>
  </Sidebar.Section>

  <Sidebar.Section label="Projects" collapsible defaultOpen>
    <Sidebar.Item icon={<Icon name="circle" color="green" />} href="/p/launch">Launch</Sidebar.Item>
    <Sidebar.Item icon={<Icon name="circle" color="blue" />} href="/p/api">API</Sidebar.Item>
    <Sidebar.Item icon={<Icon name="plus" />} variant="ghost" onClick={createProject}>New project</Sidebar.Item>
  </Sidebar.Section>

  <Sidebar.Spacer />              {/* pushes footer to the bottom */}

  <Sidebar.Footer>
    <UserMenu />
  </Sidebar.Footer>
</Sidebar>

// Nested items (sub-items via Accordion mechanics)
<Sidebar>
  <Sidebar.Item icon={<Icon name="folder" />} expandable>
    Documents
    <Sidebar.SubItems>
      <Sidebar.Item href="/docs/getting-started">Getting started</Sidebar.Item>
      <Sidebar.Item href="/docs/api">API reference</Sidebar.Item>
    </Sidebar.SubItems>
  </Sidebar.Item>
</Sidebar>

// Router integration via Slot
<Sidebar.Item asChild icon={<Icon name="home" />}>
  <RouterLink to="/">Home</RouterLink>
</Sidebar.Item>

// Active state controlled by route
<Sidebar activeHref={router.pathname}>
  …
</Sidebar>

// Collapsed (rail) mode — driven by AppShell
function App() {
  const { isSidebarCollapsed } = useAppShell();
  return <Sidebar collapsed={isSidebarCollapsed}>…</Sidebar>;
}

// Inline mode (without AppShell)
<Sidebar variant="floating" width={240}>…</Sidebar>

// Full Sidebar prop form
<Sidebar
  /* dimensions */
  width={260}                         // px | string
  collapsedWidth={64}                 // when collapsed
  height="full"                       // 'full' | string

  /* state */
  collapsed={false}                   // boolean — when true, becomes a rail
  activeHref                          // string — active link href
  activeMatchStrategy="exact"         // 'exact' | 'prefix'

  /* style */
  variant="default"                  // 'default' | 'bordered' | 'floating' | 'ghost'
  size="md"                          // 'sm' | 'md' | 'lg'
  itemSize="md"                      // 'sm' | 'md' | 'lg' — propagated to items

  /* misc */
  ariaLabel                          // string — required for a11y when no Header label
  className=""
  style={{}}
  ref={…}
>
  {children}
</Sidebar>

// Sidebar.Section prop form
<Sidebar.Section
  label                              // ReactNode — section header
  collapsible={false}                // boolean
  defaultOpen={true}
  open                                // controlled
  onOpenChange
  hideLabelWhenCollapsed={true}      // when sidebar is in rail mode, hide section label
  badge                              // ReactNode | number — beside section header
  className=""
>
  {children}
</Sidebar.Section>

// Sidebar.Item prop form
<Sidebar.Item
  icon                              // ReactNode — leading icon (REQUIRED in rail mode)
  endIcon                            // ReactNode — trailing icon (chevron, etc.)
  badge                              // ReactNode | number — count chip
  badgeColor="neutral"               // Badge color
  href                                // string — for <a> link
  active                              // boolean — explicit active state
  expandable={false}                 // boolean — has SubItems
  defaultExpanded={false}
  expanded                            // controlled
  onExpandedChange
  variant="default"                  // 'default' | 'ghost' | 'primary'
  size="md"
  disabled
  asChild                            // boolean — render as the single child (for router Links)
  onClick
  className=""
  ref={…}
>
  {children}
</Sidebar.Item>

// Sidebar.SubItems prop form (used inside expandable Item)
<Sidebar.SubItems>
  {children}                          {/* Sidebar.Item children */}
</Sidebar.SubItems>
```

---

## API Decisions

| Decision                                                                | Why                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Sidebar is compound** (`Sidebar.Header`, `.Section`, `.Item`, `.Footer`, etc.) | Vertical nav is composition-heavy. Compound + slot API gives consumers freedom without abandoning DS rhythm.   |
| **`<Sidebar.Item>` is the primary atom**                              | Each Item handles `icon` + `label` + `badge` + `active` + `disabled` + `expandable`. Single component, many shapes. |
| **Collapsible Sections use Accordion mechanics** (Phase 26)            | Don't reinvent the open/close animation; pull from existing Accordion CSS-grid-rows transition.                  |
| **Expandable Items use the same Accordion mechanics**                 | Single mental model for "open/close" everywhere in the sidebar.                                                  |
| **Rail mode collapses labels, NOT icons**                            | Industry pattern (VS Code, Linear, Notion). Icons stay visible; labels collapse to Tooltips.                    |
| **Tooltip auto-applied in rail mode**                                | When `collapsed=true`, each Item gets a `<Tooltip content={label}>` wrapper. Off otherwise.                      |
| **Active state via `activeHref` + matching strategy**                 | Single source of truth at root; matches each Item's `href`. `activeMatchStrategy="prefix"` enables "highlight parent route." |
| **Section label hidden in rail mode** (by default)                   | Sections lose meaning when only icons are visible; the section becomes a visual separator (a thin Divider).      |
| **Sidebar.Spacer** for layout                                        | Pushes Footer to the bottom; same primitive as the global Spacer from Stack (Phase 37).                          |
| **`asChild` everywhere** (Item / Section)                            | Router Link integration; consumers swap the `<a>` for their framework's link without losing styling.            |

---

## Internal architecture

```
                       ┌──────────────────────────────────────────────┐
   props ─────────────►│  Sidebar generates SidebarContext            │
                       │  Owns: collapsed, activeHref, matchStrategy, │
                       │        size, itemSize                          │
                       └──────────────────────────────────────────────┘
                                          │
                ┌─────────────────┬───────────────┬───────────────┐
                ▼                 ▼               ▼               ▼
       Sidebar.Header    Sidebar.Section   Sidebar.Item   Sidebar.Footer
                                          │
                                          ▼
                                 Sidebar.SubItems
                                          │
                                          ▼
                                   Sidebar.Item (recursive)
```

Each Item reads from SidebarContext to know if it's collapsed (rail mode), and self-determines `isActive` by comparing its `href` against `activeHref` per `matchStrategy`.

Item in rail mode renders:

```tsx
<Tooltip content={label} placement="end">
  <a href={href} className={itemRecipe(...)}>
    <span className="icon">{icon}</span>
    <span className="label sr-only">{label}</span>      {/* always rendered, sr-only when collapsed */}
    {badge && <span className="badge sr-only">{badge}</span>}
  </a>
</Tooltip>
```

The label is **always rendered** in the DOM (visually hidden in rail mode) so screen readers still announce it.

---

## File Structure

```
packages/components/src/Sidebar/
├── Sidebar.tsx
├── Sidebar.Header.tsx
├── Sidebar.Footer.tsx
├── Sidebar.Section.tsx
├── Sidebar.Item.tsx
├── Sidebar.SubItems.tsx
├── Sidebar.Spacer.tsx
├── Sidebar.context.ts
├── Sidebar.types.ts
├── Sidebar.recipe.ts
├── isActiveHref.ts                    # pure — given (current, item, strategy) → boolean
├── Sidebar.test.tsx
├── Sidebar.collapsed.test.tsx
├── Sidebar.expandable.test.tsx
├── Sidebar.activeMatch.test.tsx
├── Sidebar.a11y.test.tsx
├── isActiveHref.test.ts
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── BasicFlat.tsx
    ├── WithSections.tsx
    ├── WithCollapsibleSections.tsx
    ├── WithExpandableItem.tsx        # sub-items
    ├── WithHeaderFooter.tsx
    ├── WithBadges.tsx
    ├── WithSpacer.tsx
    ├── RailMode.tsx                    # collapsed + tooltips
    ├── RouterLinkIntegration.tsx
    ├── ActiveHrefPrefix.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Disabled.tsx
    └── DashboardDemo.tsx               # full Linear-like sidebar inside AppShell
```

---

## Recipe sketches

```ts
export const sidebarRecipe = cv({
  base: 'flex flex-col gap-1 h-full min-h-0 p-3 bg-(--sds-color-surface-default) overflow-y-auto',
  variants: {
    variant: {
      default:  '',
      bordered: 'border-e border-(--sds-color-border-subtle)',
      floating: 'm-3 rounded-xl border border-(--sds-color-border-subtle) shadow-md bg-(--sds-color-surface-raised)',
      ghost:    'bg-transparent',
    },
    collapsed: { true: 'items-center px-2', false: '' },
    size:      { sm: 'text-xs gap-0.5 p-2', md: 'text-sm gap-1 p-3', lg: 'text-base gap-1.5 p-4' },
  },
  defaultVariants: { variant: 'default', collapsed: false, size: 'md' },
});

export const sidebarItemRecipe = cv({
  base: 'inline-flex items-center gap-2 w-full rounded-md text-(--sds-color-text-default) outline-none transition-colors focus-visible:ring-2 focus-visible:ring-(--sds-color-accent-emphasis)',
  variants: {
    variant: {
      default: 'hover:bg-(--sds-color-surface-muted)',
      ghost:   'hover:bg-(--sds-color-surface-muted)/60',
      primary: 'hover:bg-(--sds-color-accent-subtle)',
    },
    size: {
      sm: 'px-2 py-1 text-xs [&_svg]:h-3.5 [&_svg]:w-3.5',
      md: 'px-2.5 py-1.5 text-sm [&_svg]:h-4 [&_svg]:w-4',
      lg: 'px-3 py-2 text-base [&_svg]:h-5 [&_svg]:w-5',
    },
    state: {
      active:  'bg-(--sds-color-accent-subtle) text-(--sds-color-accent-emphasis) font-medium',
      inactive: '',
    },
    collapsed: { true: 'justify-center w-auto px-1', false: 'justify-start' },
    disabled:  { true: 'opacity-50 cursor-not-allowed', false: 'cursor-pointer' },
  },
});

export const sidebarSectionLabelRecipe = cv({
  base: 'inline-flex items-center gap-1 px-2 text-xs font-medium uppercase tracking-wide text-(--sds-color-text-muted)',
  variants: {
    collapsed: { true: 'sr-only', false: '' },
  },
});
```

---

## `isActiveHref.ts` — pure

```ts
export function isActiveHref(args: {
  current: string | undefined;
  itemHref: string | undefined;
  strategy: 'exact' | 'prefix';
}): boolean {
  if (!args.current || !args.itemHref) return false;
  // Normalize trailing slashes
  const norm = (s: string) => s.replace(/\/+$/, '') || '/';
  const a = norm(args.current);
  const b = norm(args.itemHref);
  if (args.strategy === 'exact') return a === b;
  // prefix: '/p' should NOT match '/photos' — require boundary
  return a === b || a.startsWith(b + '/');
}
```

Pure + unit-tested truth table.

---

## A11y

- **Root**: `<aside aria-label={ariaLabel ?? i18n('sidebar.label', 'Sidebar')}>`.
- **Section header**: `<h3>` semantic (visually small uppercase muted text); when collapsible, becomes a `<button aria-expanded>`.
- **Items**: `<a>` for navigational items (when `href` is set), `<button>` for click handlers (when `onClick` but no `href`).
  - `aria-current="page"` when active.
  - `aria-disabled="true"` when disabled (and ignore clicks).
- **Expandable Item**: `<button aria-expanded>` for the parent; its `SubItems` rendered as a nested `<ul>` with `role="group"`.
- **Badge** is appended after label text with `aria-label="{{n}} unread"` or similar; sr-only badge text is used for counts.
- **Rail mode**: each Item wrapped in `<Tooltip content={label}>`; the visible icon is `aria-hidden`; the sr-only label inside the Item is the accessible name.
- **Keyboard**: native — Tab + Enter for links/buttons. No roving tabindex (sidebar items are navigation targets, each should be a tab stop). Accordion-style expand uses standard Disclosure pattern (button + region).
- axe-core: 0 violations across all variants / collapsed / expanded states.

---

## i18n

When wrapped in `<I18nProvider>`:

| Key                              | Default (en)                |
| -------------------------------- | --------------------------- |
| `sidebar.label`                  | "Sidebar"                   |
| `sidebar.collapseSection`        | "Collapse {{label}}"         |
| `sidebar.expandSection`          | "Expand {{label}}"           |
| `sidebar.badgeCount`            | "{{count}} unread"           |

Bundles: en / he / ar.

---

## RTL

- `flex-direction: column` direction-agnostic.
- `border-inline-end` (variant=bordered) is RTL-correct.
- Item icon order: icon then label — logical-start to logical-end. Browser flips.
- Tooltip placement in rail mode: `placement="end"` so it appears on the logical-end side (right in LTR, left in RTL).
- Item paddings use logical properties.

---

## Performance

- Stateless except for section/item expanded state (per-instance reducer).
- Each Item is a memoizable component; consumers can wrap in `memo` if profiling shows hotspot.
- Bundle target: **< 4 KB gz** (excluding Tooltip, Accordion mechanics — pulled by reference).

---

## Testing

- Renders each subcomponent with correct DOM.
- Active state: `activeHref="/inbox"` highlights matching Item.
- `activeMatchStrategy="prefix"`: `/p` matches `/p/launch` correctly with boundary check.
- Collapsible Section toggles via click; `aria-expanded` updates; children visibility animates.
- Expandable Item with SubItems toggles; sub-items render at correct indent.
- Rail mode (`collapsed=true`): labels become `sr-only`; Tooltips wrap items; section labels hidden.
- Badge renders with correct color + accessible label.
- `asChild` swaps the `<a>` for a router Link.
- Disabled items don't fire onClick.
- axe-core: 0 violations in all modes.
- RTL snapshot.

---

## Acceptance Criteria

- [ ] `<Sidebar>` + all 7 subcomponents exported.
- [ ] Flat + sectioned + expandable item structures all work.
- [ ] Rail mode wraps items in Tooltips and hides labels.
- [ ] Active-state matching via exact + prefix strategies.
- [ ] Collapsible Sections use Accordion mechanics.
- [ ] Router integration via `asChild`.
- [ ] i18n bundle en / he / ar.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 4 KB gz.

---

## DRY Self-Check

- [ ] Reuses Accordion mechanics (Phase 26), Tooltip (Phase 17), Badge (Phase 12), Divider (Phase 38), `<Slot>` (Phase 3), `<I18nProvider>`.
- [ ] `isActiveHref` is pure + tested.
- [ ] No new color tokens.
- [ ] Composition with AppShell (Phase 51): Sidebar drops into AppShell's `sidebar` slot as-is; AppShell controls collapsed state via `useAppShell()`.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/53-sidebar.md`.
2. Outcome notes: bundle delta, any helper extracted, consider promoting `isActiveHref` to `_shared/` if NavigationMenu (Phase 52) wants the same logic.
3. Document the canonical Sidebar patterns: simple flat, sectioned with collapsibles, rail-mode dashboard, two-level expandable docs nav.

---

## Outcome

**Status:** ✅ Shipped on 2026-05-21 by SDS-Agent2.

### Surface

Compound primitive — `<Sidebar>` root + 6 subparts (`Header`, `Footer`, `Section`, `Item`,
`SubItems`, `Spacer`) merged via `Object.assign` (canonical Card / Toolbar / AppShell pattern).
Plus the pure helper `isActiveHref({ current, itemHref, strategy })` exported publicly for
NavigationMenu / Breadcrumbs / future router-aware components to share.

Files shipped under `packages/components/src/Sidebar/`:

- `Sidebar.tsx`, `Sidebar.types.ts`, `Sidebar.recipe.ts`, `Sidebar.context.ts`,
- `SidebarHeader.tsx`, `SidebarFooter.tsx`, `SidebarSpacer.tsx`,
- `SidebarSection.tsx`, `SidebarItem.tsx`, `SidebarSubItems.tsx`,
- `useDisclosure.ts` (local controllable disclosure hook),
- `isActiveHref.ts` (pure helper, truth-table tested),
- `meta.ts`, `index.ts` (barrel), `README.mdx`,
- 14 examples under `examples/` (plus `_icons.tsx` for shared inline SVGs).

### Tests (all green)

- `__tests__/Sidebar.test.tsx` — 19 (root rendering, ariaLabel/labelledBy, ref forwarding,
  inline width based on collapsed state, data attributes, element-shape selection — `<a>` /
  `<button>` / Slot, badges, icons, end icons, disabled neutralization, context misuse).
- `__tests__/Sidebar.collapsed.test.tsx` — 6 (label sr-only in rail mode, badge sr-only
  mirror for AT, end icons hidden, section labels sr-only + opt-out, structure preserved on
  toggle).
- `__tests__/Sidebar.expandable.test.tsx` — 10 (collapsible section toggle + aria-expanded,
  controlled / uncontrolled, onOpenChange firing, badge beside section label; expandable item
  trigger, aria-expanded, sub-items as `role="group"` `<ul>`, aria-controls wiring,
  controlled expanded).
- `__tests__/Sidebar.activeMatch.test.tsx` — 7 (exact / prefix matching, trailing-slash
  normalization, boundary check for `/p` vs `/photos`, explicit `active` override, items
  without href).
- `__tests__/Sidebar.a11y.test.tsx` — 6 (axe-clean across flat, sections, expandable, rail
  mode, active state, full 4×3 variant × size matrix).
- `__tests__/isActiveHref.test.ts` — 10 (pure helper truth table covering both strategies).

**Sidebar-dedicated suite total: 58 / 58 pass.**
**Workspace regression: 2364 / 2364 tests across 138 files — zero regressions.**

### Lint / typecheck

- `pnpm eslint src/Sidebar __tests__/Sidebar.* __tests__/isActiveHref.test.ts` → **0 errors,
  0 warnings**.
- `pnpm tsc --noEmit` → **0 errors in Sidebar files**. Other pre-existing errors in
  `Form.*.test.tsx`, `Icon.test.tsx`, `useForm.test.tsx`, `TreeView.tsx` are unrelated and
  documented as workspace-wide issues elsewhere.

### Build

- `pnpm --filter @apx-dsponents build` → ESM 818 KB, CJS 839 KB, DTS 392 KB. All
  green.
- `pnpm --filter apx-dsld` → ESM 1.02 MB, CJS 1.04 MB. **Sidebar exports appear 98
  times in the umbrella bundle** — renderer-visible. DTS green.

### Bundle measure (esbuild, minify + treeshake, ESM, externalized peers)

| Surface | Raw | gzipped |
| --- | --- | --- |
| Sidebar (full compound surface; Tooltip / Badge inlined) | 26.01 KB | 7.12 KB |
| **Sidebar marginal cost (Tooltip + Badge externalized as peers)** | **11.80 KB** | **3.62 KB** |
| `isActiveHref` helper only | 0.27 KB | 0.21 KB |

The 3.62 KB gz marginal-cost figure is the apples-to-apples number against the plan's
`< 4 KB gz` target — Tooltip and Badge are essentially always already in any non-trivial
DS bundle (they're consumed by Button, Toolbar, Toast, Form, TagsInput, Stepper, Field,
NumberInput, etc.). **Target met.**

### Deviations from plan (all documented)

1. **Accordion mechanics implemented locally**, not reused. The plan called for pulling
   Accordion's collapse animation in for both `<Sidebar.Section collapsible>` and
   `<Sidebar.Item expandable>`. Accordion's open/close is wired to its own root context and
   isn't extractable as a primitive without editing Accordion source — which the room's
   established guardrails (no edits to peer components, no `_shared/` writes) currently
   disallow. Implemented a tiny local `useDisclosure({ open, onOpenChange, defaultOpen })`
   hook (in `useDisclosure.ts`) and the same CSS `grid-template-rows: 0fr ↔ 1fr` transition
   Accordion uses internally. Both Section and Item share the hook. **Reclamation path**:
   when a third consumer (DataGrid row expanders, NavigationMenu submenus, …) wants the same
   shape, promote `useDisclosure` to `_shared/` with a posted contract.

2. **Root element is `<nav>`, not `<aside>`**. The plan said `<aside aria-label>` but
   AppShell's `sidebar` slot already wraps its children in `<aside aria-label>`. Nesting
   `<aside>` inside `<aside>` would add noise to the a11y tree without screen-reader benefit.
   Using `<nav>` keeps the Sidebar landmark intent crisp regardless of host context.

3. **No `Sidebar.Spacer` reuse of the Stack family's `<Spacer>`**. Stack's Spacer inserts a
   `SPACER_MARKER` for Stack's divider logic; that has no meaning inside a Sidebar. Shipped
   a 6-line local `<SidebarSpacer>` instead — same `flex: 1 1 auto` shape, no divider coupling.

4. **`<I18nProvider>` deferred**. Strings (`ariaLabel`, badge text, section labels) are
   props with hardcoded English defaults — same pattern as AppShell / Toolbar / Field /
   Radio / Textarea. Will inherit i18n integration when the I18nProvider primitive ships.

5. **No `<Icon>` primitive**. Plan examples used `<Icon name="home" />`; that primitive
   doesn't exist yet. Examples use inline SVGs from a shared `examples/_icons.tsx` (zero
   external deps) — same pattern as AppShell / Toolbar examples.

6. **`asChild` in rail mode degrades to icon-only**. When `asChild` is used, the consumer's
   child element's text becomes the label in-place (no wrapping `<span>` we control), so we
   can't apply `sr-only` to it. The Tooltip still provides the hover/focus label cue in
   rail mode. Documented as a known asChild limitation in the README "Do / Don't".

### A11y notes

- `<nav aria-label={ariaLabel}>` landmark with default `"Sidebar"`.
- Items: `<a href>` for nav, `<button>` for actions, `<button aria-expanded aria-controls>`
  for expandable disclosure parents. Disabled items get `aria-disabled="true"` + `tabIndex=-1`
  + neutralized clicks.
- Section labels: static → `<h3>`; collapsible → `<button aria-expanded aria-controls>`.
- SubItems: `<ul role="group">` so AT announces the nesting.
- Badges in rail mode are visually hidden but mirrored sr-only so unread counts still reach
  AT.
- **No roving tabindex** — sidebar items are tab stops, matching W3C Disclosure pattern and
  industry convention (Linear / GitHub / Notion / VS Code). `role="menu"` is for menus, not
  navigation.
- axe-core: **0 violations** across flat / sections / collapsible / expandable / rail /
  active configurations and the full 4×3 variant × size matrix.

### Patterns now mature (candidates for engine promotion)

- `useDisclosure({ open, onOpenChange, defaultOpen }) → { open, setOpen, toggle }` — used by
  Sidebar.Section and Sidebar.Item. When a third component needs the same shape, this is
  the natural promotion target. Stable API; tiny implementation (just `useControllableState`
  + `useCallback`).
- `isActiveHref({ current, itemHref, strategy })` — already exported publicly. Pure +
  truth-table tested. NavigationMenu (52) and Breadcrumbs (32) auto-active behavior should
  consume this directly.
- The `grid-template-rows: 0fr ↔ 1fr` disclosure transition is now used by Accordion (root),
  Sidebar.Section, Sidebar.Item.expandable — three consumers. Worth considering a shared
  `<Disclosure>` primitive in `_shared/` next pass.

### Coordination notes

- **No edits to any peer component source** — Tooltip / Badge / Divider / Slot / AppShell /
  Accordion all untouched.
- **No `_shared/` writes**.
- **No engine / theme / tokens / preset writes**.
- **No renderer start/restart**. The `apx-dsbrella was rebuilt so the renderer picks
  Sidebar up on @Ahmad's next hard refresh of `/components/sidebar`.
- `packages/components/src/index.ts` — surgical insert alphabetically between **Select** and
  **Skeleton**, exporting `Sidebar` + `isActiveHref` and 13 named types.

### Ship-gate compliance

All 14 examples have working, deliberate layouts:

- `BasicFlat` / `WithSections` / `WithCollapsibleSections` / `WithExpandableItem` /
  `WithHeaderFooter` / `WithBadges` / `WithSpacer` — static demos with real `href` anchors
  and inline SVG icons.
- `RailMode` — visible **"Expand sidebar / Collapse to rail"** button drives local state so
  @Ahmad can toggle manually; Tooltips kick in on hover/focus when collapsed.
- `RouterLinkIntegration` — forwarded-ref `<RouterLink>` stand-in showing the `asChild`
  plumbing; clicks are `preventDefault`'d so demos don't leave the page.
- `ActiveHrefPrefix` — four buttons toggle `activeHref` at runtime so @Ahmad can verify the
  prefix boundary check (`/photos` vs `/p`) visually.
- `Variants` / `Sizes` — 4 chrome variants and 3 size scales side by side with labeled
  captions.
- `Disabled` — Lock / Unlock buttons toggle the disabled state at runtime.
- `DashboardDemo` — full Sidebar inside AppShell with `useAppShell().toggleSidebar()` wiring,
  Reports + Projects sections, footer profile, prefix-match active highlighting.

No example mounts hidden-only content; no auto-state changes on mount.

### When this phase is complete (checklist)

- [x] `<Sidebar>` + all 6 exported subparts.
- [x] Flat + sectioned + expandable item structures all work.
- [x] Rail mode wraps items in Tooltips and hides labels.
- [x] Active-state matching via exact + prefix strategies.
- [x] Collapsible Sections use disclosure mechanics (local, not Accordion-imported — see
      deviation #1).
- [x] Router integration via `asChild`.
- [ ] i18n bundle en / he / ar — deferred per deviation #4.
- [x] axe-core: 0 violations.
- [x] Bundle < 4 KB gz (3.62 KB marginal).