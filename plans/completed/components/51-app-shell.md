# Phase 51 — `<AppShell />`

> Status: **✅ Shipped** · Owner: **SDS-Agent2** · **Tier 2** · Depends on: Phase 14 Card, Phase 16 Tabs, Phase 18 Popover (for mobile nav), Phase 20 Drawer (mobile sidebar), Phase 38 Divider, Phase 22 Menu, Phase 53 Sidebar (sibling — designed together)
> Top-level application layout: Header + Sidebar + Main + (optional) Footer. The single primitive every "internal tool" needs and every consumer hand-rolls today.

## Objective

Ship the **`<AppShell />`** composition primitive — the canonical "logged-in product layout."

Use cases:

- SaaS dashboards (Linear, Notion, Vercel).
- Admin panels.
- Internal tools.
- Email clients, file managers, etc.

Today every consumer of the DS hand-rolls a `<div className="grid grid-cols-[260px_1fr]">…</div>` and re-invents:

- Responsive collapse of the sidebar to a Drawer on mobile.
- Sticky header with sidebar offset.
- Inset / overlap behaviors between header and sidebar.
- Padding / max-width of the main content.
- Optional aside panel (right-hand drawer for detail views).

Phase 51 ships a single primitive that handles all of these, with sensible defaults and full overridability.

---

## Public API

```tsx
import { AppShell } from 'apx-ds';

// Minimal — header + main
<AppShell header={<TopNav />}>
  <YourPageContent />
</AppShell>

// Header + sidebar + main
<AppShell
  header={<TopNav />}
  sidebar={<MainNav />}
>
  <YourPageContent />
</AppShell>

// Full quadruplet: header + sidebar + main + footer
<AppShell
  header={<TopNav />}
  sidebar={<MainNav />}
  footer={<AppFooter />}
>
  <YourPageContent />
</AppShell>

// With an aside panel (right side detail view)
<AppShell
  header={<TopNav />}
  sidebar={<MainNav />}
  aside={selectedItem && <DetailPanel item={selectedItem} />}
>
  <YourPageContent />
</AppShell>

// Configured sidebar
<AppShell
  header={<TopNav />}
  sidebar={<MainNav />}
  sidebarWidth={240}
  sidebarPosition="start"           // 'start' (default — left in LTR) | 'end'
  sidebarCollapsedWidth={64}        // when collapsed (rail mode)
  sidebarCollapsed={collapsed}
  onSidebarCollapsedChange={setCollapsed}
  sidebarBreakpoint="md"            // below this, sidebar becomes a drawer
>…</AppShell>

// Header config
<AppShell
  header={<TopNav />}
  headerHeight={56}
  headerSticky={true}
  headerVariant="floating"          // 'default' | 'bordered' | 'floating'
>…</AppShell>

// Layout variant: sidebar inset under header vs. full-height
<AppShell
  layout="default"                  // 'default' — sidebar full height, header above main only
  // vs.
  layout="inset"                    // 'inset'   — header spans full width, sidebar starts below header
>…</AppShell>

// Main padding
<AppShell main={{ padding: 6, maxWidth: '7xl' }}>…</AppShell>

// Mobile drawer trigger (consumer renders a hamburger button in the header)
function TopNav() {
  const { toggleSidebar, isSidebarOpen } = useAppShell();
  return (
    <HStack>
      <IconButton onClick={toggleSidebar} aria-label="Toggle navigation">
        <Icon name={isSidebarOpen ? 'x' : 'menu'} />
      </IconButton>
      <Logo />
    </HStack>
  );
}

// Full prop form
<AppShell
  /* slots */
  header                          // ReactNode
  sidebar                         // ReactNode
  aside                           // ReactNode
  footer                          // ReactNode

  /* layout variant */
  layout="default"                // 'default' | 'inset'

  /* sidebar */
  sidebarPosition="start"         // 'start' | 'end' (RTL-aware)
  sidebarWidth={260}              // px | string
  sidebarCollapsedWidth={64}
  sidebarCollapsed                // boolean (controlled rail collapse)
  defaultSidebarCollapsed={false}
  onSidebarCollapsedChange
  sidebarBreakpoint="md"          // 'sm' | 'md' | 'lg' | 'xl' — below this becomes a drawer
  sidebarMobileOpen               // boolean (controlled mobile drawer open)
  defaultSidebarMobileOpen={false}
  onSidebarMobileOpenChange

  /* header */
  headerHeight={56}
  headerSticky={true}             // boolean
  headerVariant="default"         // 'default' | 'bordered' | 'floating'
  headerOffset={0}                // additional offset for OS toolbars etc.

  /* aside */
  asidePosition="end"             // 'start' | 'end'
  asideWidth={320}
  asideOpen                       // boolean (controlled)
  defaultAsideOpen={true}
  onAsideOpenChange

  /* main */
  main={{
    padding: 6,                   // theme spacing scale
    maxWidth: 'full',             // 'full' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl'
    centered: true,
  }}

  /* misc */
  className=""
  style={{}}
  ref={…}
>
  {children}
</AppShell>

// useAppShell() — for header / sidebar consumers
const {
  isSidebarCollapsed,
  isSidebarOpen,                 // mobile drawer state
  isAsideOpen,
  toggleSidebar,                  // collapses rail on desktop, opens drawer on mobile
  collapseSidebar,
  expandSidebar,
  openSidebar,
  closeSidebar,
  toggleAside,
  openAside,
  closeAside,
  isMobile,                       // boolean — current viewport < sidebarBreakpoint
} = useAppShell();
```

---

## API Decisions

| Decision                                                                | Why                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Four named slots: header / sidebar / aside / footer + main (children)** | Covers ~99% of product shells. Sidebar+aside on both sides covers Notion / Mail-app / Linear-detail patterns.   |
| **Two layout variants: `default` vs `inset`**                          | Industry split: GitHub / Linear use `inset` (header full-width, sidebar below); Notion / VS Code use `default` (sidebar full-height, header over main only). Single prop picks. |
| **Sidebar auto-collapses to Drawer below breakpoint**                  | Mobile pattern. `sidebarBreakpoint="md"` (default) collapses < 768px. No manual responsive code per consumer.    |
| **Sidebar has rail mode (collapsed)** on desktop                       | Industry pattern (VS Code, Linear). Width swaps from 260 → 64 with content visibility changes. CSS Grid + transition. |
| **`sidebarPosition="start"` defaults logical-leading**                | RTL-aware. In LTR = left; in RTL = right. Override via `position="end"`.                                          |
| **`aside` follows the same pattern as sidebar**                       | But typically on the logical-end side; usually controlled (open/closed) rather than always-on.                  |
| **Header is sticky by default**                                        | Most modern apps. `headerSticky=false` for product-marketing layouts.                                            |
| **Floating header variant**                                            | Has a small inline-margin + rounded corners + shadow. Used by Linear / Stripe dashboards.                       |
| **No internal navigation logic**                                       | AppShell holds *layout*; NavigationMenu (Phase 52) + Sidebar (Phase 53) hold *content*.                          |
| **`useAppShell()` context hook**                                       | Header components need to toggle sidebar; this is the integration point.                                         |
| **`headerOffset` for OS toolbars**                                    | Used by Electron / Tauri apps with a custom title bar.                                                          |

---

## Internal architecture

```
                            <AppShell layout="default">
┌────────────────────────────┬───────────────────────────────────────┐
│                            │  <Header sticky>                       │
│       <Sidebar>            │  ───────────────────────────────────── │
│                            │  <Main>                                │
│                            │    {children}                          │
│                            │  </Main>                               │
│                            │  ───────────────────────────────────── │
│                            │  <Footer>                              │
└────────────────────────────┴───────────────────────────────────────┘

                            <AppShell layout="inset">
┌────────────────────────────────────────────────────────────────────┐
│                          <Header sticky>                            │
├────────────────────────────┬───────────────────────────────────────┤
│       <Sidebar>            │  <Main>                                │
│                            │    {children}                          │
│                            │  </Main>                               │
│                            ├───────────────────────────────────────┤
│                            │  <Footer>                              │
└────────────────────────────┴───────────────────────────────────────┘
```

Both implemented with CSS Grid + `grid-template-areas` so the layout swap is purely CSS.

For mobile (viewport < `sidebarBreakpoint`):

- Sidebar is removed from the Grid + rendered into a `<Drawer>` (Phase 20).
- Toggle via `toggleSidebar()` / `useAppShell().isSidebarOpen`.
- Header keeps its position; the hamburger button (consumer-rendered) triggers the drawer.

---

## File Structure

```
packages/components/src/AppShell/
├── AppShell.tsx
├── AppShell.Header.tsx              # internal — wraps consumer's header node
├── AppShell.Sidebar.tsx             # internal — desktop rail vs mobile drawer
├── AppShell.Aside.tsx               # internal
├── AppShell.Main.tsx                # internal
├── AppShell.Footer.tsx              # internal
├── AppShell.context.ts
├── AppShell.types.ts
├── AppShell.recipe.ts
├── useAppShell.ts                    # hook + selector
├── useBreakpoint.ts                  # viewport detection — promote to engine if shared (likely)
├── AppShell.test.tsx
├── AppShell.responsive.test.tsx
├── AppShell.a11y.test.tsx
├── AppShell.layout.test.tsx          # default vs inset grid-template-areas
├── useBreakpoint.test.ts
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── BasicHeader.tsx
    ├── HeaderSidebar.tsx
    ├── FullQuadruplet.tsx           # header + sidebar + main + footer
    ├── WithAside.tsx
    ├── LayoutDefault.tsx
    ├── LayoutInset.tsx
    ├── SidebarRailCollapse.tsx
    ├── SidebarEndPosition.tsx       # RTL-ish layout
    ├── MobileDrawer.tsx
    ├── FloatingHeader.tsx
    ├── HeaderOffset.tsx              # for Tauri apps
    ├── MainPaddingMaxWidth.tsx
    ├── DashboardDemo.tsx             # realistic SaaS dashboard layout
    └── EmailAppDemo.tsx              # sidebar + main + aside detail
```

---

## Recipe sketch

```ts
export const appShellRecipe = cv({
  base: 'grid min-h-screen w-full bg-(--sds-color-surface-default) text-(--sds-color-text-default)',
  variants: {
    layout: {
      default: '[grid-template-areas:"sidebar_header""sidebar_main""sidebar_footer"]',
      inset:   '[grid-template-areas:"header_header""sidebar_main""sidebar_footer"]',
    },
    sidebarPosition: {
      start: '',
      end: '[direction:rtl] [&>*]:[direction:initial]',  // flip grid columns via CSS direction
    },
  },
  defaultVariants: { layout: 'default', sidebarPosition: 'start' },
});

// grid columns + rows set inline via style (sidebarWidth + headerHeight)
// style={{ gridTemplateColumns: `${sidebarPx} 1fr`, gridTemplateRows: `${headerHeight}px 1fr auto` }}

export const headerRecipe = cv({
  base: '[grid-area:header] flex items-center px-4 bg-(--sds-color-surface-default)',
  variants: {
    variant: {
      default:  'border-b border-(--sds-color-border-subtle)',
      bordered: 'border-b border-(--sds-color-border-default)',
      floating: 'm-3 rounded-xl border border-(--sds-color-border-subtle) shadow-md bg-(--sds-color-surface-raised)',
    },
    sticky: { true: 'sticky top-0 z-30', false: '' },
  },
  defaultVariants: { variant: 'default', sticky: true },
});

export const sidebarRecipe = cv({
  base: '[grid-area:sidebar] flex flex-col bg-(--sds-color-surface-default) border-(--sds-color-border-subtle) transition-[width] duration-200',
  variants: {
    bordered: { true: 'border-e', false: '' },
    collapsed: { true: '[&_.sds-sidebar-label]:opacity-0', false: '' },
  },
  defaultVariants: { bordered: true, collapsed: false },
});

export const mainRecipe = cv({
  base: '[grid-area:main] min-w-0 min-h-0 overflow-auto',
  variants: {
    padding: {
      0: 'p-0', 2: 'p-2', 4: 'p-4', 6: 'p-6', 8: 'p-8',
    },
  },
});
```

---

## Mobile behavior (viewport < breakpoint)

`useBreakpoint(sidebarBreakpoint)` returns `isMobile`. When true:

- Sidebar slot is removed from the Grid template.
- Grid switches to single column.
- Sidebar content is rendered into `<Drawer position="inline-start" open={isSidebarOpen} onOpenChange={…}>`.
- Header hamburger button (consumer-rendered) calls `toggleSidebar()` → opens drawer.

When viewport crosses back to desktop, drawer is force-closed and sidebar returns to Grid.

```tsx
{isMobile ? (
  <Drawer position={sidebarPosition === 'start' ? 'inline-start' : 'inline-end'} open={isSidebarOpen} onOpenChange={…}>
    {sidebar}
  </Drawer>
) : (
  <aside className={sidebarRecipe(…)} style={{ width: collapsed ? collapsedW : sidebarWidth }}>
    {sidebar}
  </aside>
)}
```

---

## A11y

- **Header**: `<header role="banner">` (or just `<header>`; native semantic).
- **Sidebar**: `<aside aria-label="Primary navigation">` (or via `aria-labelledby`). Defaults to "Sidebar" with i18n fallback.
- **Main**: `<main id="main" role="main" tabIndex={-1}>` — focusable for "skip to content" link target.
- **Aside**: `<aside aria-label="Details panel">`.
- **Footer**: `<footer role="contentinfo">`.
- **Skip-to-content link** rendered at top of body when AppShell mounts: focusable-when-tabbed-to, scrolls/focuses Main. Configurable via `skipToContent` prop (default `true`).
- **Mobile drawer** sidebar inherits Drawer's full a11y (focus trap, scroll lock, Esc to close).
- **Sidebar rail collapse**: triggered button is the consumer's responsibility; AppShell exposes the helper via `useAppShell()`.
- axe-core: 0 violations in all layouts + viewport states.

---

## i18n

When wrapped in `<I18nProvider>`:

| Key                              | Default (en)                |
| -------------------------------- | --------------------------- |
| `appShell.sidebarLabel`          | "Primary navigation"        |
| `appShell.asideLabel`            | "Details"                   |
| `appShell.skipToContent`         | "Skip to content"           |
| `appShell.toggleSidebar`         | "Toggle navigation"          |
| `appShell.collapseSidebar`       | "Collapse sidebar"           |
| `appShell.expandSidebar`         | "Expand sidebar"             |

Bundles: en / he / ar.

---

## RTL

- Sidebar `position="start"` → logical-leading. Header / Main / Aside positions inherit from grid template; RTL flips them automatically because `grid-template-areas` is direction-agnostic in our setup (we use the `[direction:rtl] [&>*]:[direction:initial]` trick for `sidebarPosition="end"` which is direction-aware).
- Drawer `inline-start` / `inline-end` are RTL-correct.
- Skip-to-content link uses logical positioning.
- All borders use `border-inline-start` / `border-inline-end`.

---

## Performance

- Pure CSS Grid → no JS layout calculation.
- `useBreakpoint` listens to `matchMedia` → fires only on threshold crossings.
- Sidebar rail collapse is a CSS transition; no re-render of sidebar children.
- Bundle target: **< 4 KB gz** (excluding Drawer which is pulled in lazily only when mobile is detected).

---

## Testing

- Renders correct grid template areas for each layout variant.
- `sidebarWidth` + `headerHeight` apply inline.
- Rail collapse: width swaps from full → collapsed; `aria-expanded` on sidebar reflects state.
- Mobile drawer: when viewport < breakpoint, sidebar moves into Drawer; toggle works.
- Drawer auto-closes when viewport crosses back to desktop.
- `position="end"` swaps sidebar to logical-end column.
- `aside` slot renders when present; doesn't take space when absent.
- `useAppShell()` exposes all helpers; calls `setState` correctly.
- Skip-to-content link focuses main.
- `headerSticky` adds `sticky top-0 z-30`.
- `headerOffset` adds `padding-top`.
- axe-core: 0 violations in all configurations.
- RTL snapshot for both layouts.

---

## Acceptance Criteria

- [ ] `<AppShell>` + `useAppShell()` exported.
- [ ] 4 slots (header / sidebar / aside / footer) + main children.
- [ ] 2 layout variants (`default` / `inset`).
- [ ] Sidebar rail-collapse on desktop; auto-drawer on mobile.
- [ ] `sidebarPosition` and `asidePosition` honor `start` / `end` logically.
- [ ] Skip-to-content link.
- [ ] i18n bundle en / he / ar.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 4 KB gz.

---

## DRY Self-Check

- [ ] Reuses Drawer (mobile), `useThemedClasses`, `<I18nProvider>`.
- [ ] `useBreakpoint` is a candidate for engine promotion (NavigationMenu, Sidebar, future Container — at least 3 consumers).
- [ ] No new color tokens.
- [ ] No new layout primitives — uses CSS Grid + Tailwind.
- [ ] Composition with Sidebar / NavigationMenu (Phases 52/53) is the consumer's choice — AppShell doesn't bake them in.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/51-app-shell.md`.
2. Outcome notes: bundle delta, decision on `useBreakpoint` engine promotion.
3. Document the canonical AppShell patterns in MDX: SaaS dashboard, admin panel, email client, docs site.

---

## Outcome (SDS-Agent2 — 2026-05-21)

### Shipped surface

- **`<AppShell />`** root component with slot props (`header`, `sidebar`, `aside`, `footer`) plus children for the main landmark — **no compound subparts**. Header / sidebar / aside / footer are passed in as ReactNode props, not as `<AppShell.Header>` children. Rationale: the grid template is computed from "which slots are populated," so reading that from props is dramatically simpler than from JSX child traversal, and any third-party header / sidebar drops in without wrapping.
- **`useAppShell()`** context hook returning `layout`, `sidebarPosition`, `isMobile`, `isSidebarCollapsed`, `isSidebarOpen`, `isAsideOpen`, plus eight helpers: `toggleSidebar` / `collapseSidebar` / `expandSidebar` / `openSidebar` / `closeSidebar` / `toggleAside` / `openAside` / `closeAside`. `toggleSidebar()` is the smart entry point: flips the drawer on mobile, the rail on desktop.
- **`computeGridTemplate(args)`** — pure helper exported for unit testing and future Sidebar / NavigationMenu lanes that might want to share the same grid math. Handles 8 slot × layout × position combinations.
- **`isBelowBreakpoint(width, bp)`** + **`useBreakpointBelow(bp)`** — local breakpoint helpers (NOT promoted to engine per plan guardrails). `useBreakpointBelow` is a thin wrapper over the engine's existing `useMediaQuery`, so we get SSR safety + change subscription for free.

### Files

```
packages/components/src/AppShell/
  AppShell.types.ts         (slot/variant/context types)
  AppShell.recipe.ts        (7 cv recipes: root / header / sidebar / aside / main / footer / skipLink)
  AppShell.context.ts       (React Context + useAppShell hook with dev-mode throw)
  AppShell.tsx              (root component)
  useBreakpoint.ts          (local: BREAKPOINT_PX + useBreakpointBelow + isBelowBreakpoint)
  computeGridTemplate.ts    (pure layout math)
  meta.ts
  index.ts                  (barrel)
  README.mdx
  examples/
    BasicLayout.tsx
    InsetLayout.tsx
    CollapsibleSidebar.tsx
    WithAside.tsx
    SidebarEnd.tsx
    FloatingHeader.tsx
    CenteredMain.tsx
    MinimalNoChrome.tsx

packages/components/__tests__/
  AppShell.test.tsx              (30 tests — rendering, slots, landmarks, grid template, main config, header config, useAppShell, controlled state, skip-link)
  AppShell.a11y.test.tsx         (4 tests — axe across minimal / full / inset / collapsed)
  AppShell.responsive.test.tsx   (2 tests — matchMedia stub for mobile / desktop)
  computeGridTemplate.test.ts    (11 tests — every column layout + layout-variant + footer combo + isBelowBreakpoint)
```

### Design decisions

- **Slot props, not subparts**: see rationale above. Aligns with Mantine `AppShell` and is the canonical "shell with named regions" pattern. The `<AppShell.Header>`-style API would have forced the consumer's TopBar into a wrapper component for no functional gain.
- **CSS Grid with `grid-template-areas`**: the layout is computed from a pure function (`computeGridTemplate`) into the three `style` properties. This made unit-testing every slot combination trivial (no DOM, no Tailwind compile, no measurement) and the runtime cost is one `useMemo`.
- **`useBreakpointBelow` stays local**: per guardrail. The plan flagged it as a future engine candidate after NavigationMenu / Sidebar arrive (3+ consumers). Today AppShell is the only consumer, so it lives here. Promotion path is one file move + one re-export.
- **Two layout variants** (`default` / `inset`) — the canonical split. `default` = sidebar full-height (Notion / VS Code / Mantine), `inset` = header full-width (GitHub / Linear / Vercel). One prop, one `if` in the grid math, no extra DOM.
- **Mobile drawer is plug-and-play**: when `isMobile`, we render `<Drawer><Drawer.Content side={…}><Drawer.Body>{sidebar}</Drawer.Body></Drawer.Content></Drawer>` and the consumer's sidebar tree is reused verbatim. The Drawer is a black-box dependency (per guardrail) — AppShell never touches its internals.
- **`<main>` has `tabIndex={-1}`**: required so the skip-to-content link can focus it. The main element is the only true ARIA landmark via implicit semantics; sidebar / aside use `aria-label` with sane defaults (`"Primary navigation"` / `"Details"`).
- **`scrollIntoView` is feature-detected**: JSDOM doesn't implement it; the production browser path is untouched.

### QA

| Gate                                                                | Result                                       |
| ------------------------------------------------------------------- | -------------------------------------------- |
| Tests — AppShell + computeGridTemplate                              | **47 / 47 pass** (`pnpm vitest run`)         |
| Lint — `src/AppShell/**` + `__tests__/AppShell*` + computeGridTemplate | **clean** (`pnpm eslint`)                  |
| Typecheck — AppShell files                                          | **clean** (no AppShell errors in `tsc --noEmit`; remaining errors are in `Table/Table.tsx` and `CommandPalette/headless/useRegisterCommand.ts` — other agents' lanes) |
| Build — `@apx-dsponents`                                    | **success** (ESM 685.91 KB / CJS 702.52 KB / DTS 318.69 KB) |
| Bundle (AppShell + helpers, Drawer externalized)                    | **7.14 KB raw / 2.71 KB gz** — under 5 KB gz target |
| Bundle (`computeGridTemplate` + `isBelowBreakpoint` only)           | 0.94 KB raw / 0.50 KB gz — the pure helpers are tiny |

### Deviations from plan

- **i18n bundle deferred**: the plan called for `appShell.sidebarLabel` / `appShell.skipToContent` / etc. in en / he / ar. AppShell exposes string props (`sidebarLabel`, `asideLabel`, `skipToContentLabel`) with English defaults today; consumers thread translations through their I18n layer. Wiring the DS's `<I18nProvider>` table requires touching the i18n registry, which is outside the AppShell lane. Recommended follow-up: a small i18n PR that adds the four keys to en / he / ar and reads them as defaults in AppShell when the provider is present.
- **No subparts (`<AppShell.Header>` etc.)**: see "Design decisions" — slot props won. The plan's API examples are honored; there's just no compound JSX form.

### Followups recommended

1. Promote `useBreakpointBelow` to `@apx-dsine` once NavigationMenu / Sidebar / Container arrive (need 3+ consumers — currently 1).
2. Add `appShell.*` i18n keys to en / he / ar bundles; wire AppShell to fall back to provider strings when present.
3. Optional: lazy-load `<Drawer>` via `next/dynamic` inside AppShell so non-mobile users don't pay its bundle cost. Today it's eager — the bundle measurement above externalized it because real consumers usually already have Drawer elsewhere.
4. Consider extracting `computeGridTemplate` to a `_shared/` location once a second layout primitive (e.g., a flat `<DashboardGrid>`) wants to reuse the math.

### Notes for downstream agents

- The Drawer-as-black-box contract held — no Drawer internals touched.
- The renderer's example registry is auto-generated; the 8 AppShell examples will be picked up on the next `pnpm dev` / `pnpm build`.
- AppShell is exported from `apx-dsongside `useAppShell`, `computeGridTemplate`, `isBelowBreakpoint`, and `useBreakpointBelow` — see `packages/components/src/index.ts` for the alphabetical insertion between Alert and Avatar.
