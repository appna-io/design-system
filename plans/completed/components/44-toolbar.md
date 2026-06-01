# Phase 44 — `<Toolbar />`

> Status: **✅ Shipped** · Owner: **SDS-Agent2** · **Tier 2** · Depends on: Phase 6 (Button), Phase 30 (Toggle / ToggleGroup), Phase 38 (Divider — preferred), Phase 17 (Tooltip — optional)
> Composes Toggle/ToggleGroup/Button/Menu/Select into a single accessible toolbar with W3C Toolbar pattern.

## Objective

Ship the **`<Toolbar />`** primitive — the composition layer for editor toolbars, app-bar action rails, rich-text editors, table action bars, and dashboard chrome.

Today consumers assemble their own toolbar with a Stack + 8 Buttons + Dividers + ToggleGroups, but they don't get:

- W3C Toolbar **roving-tabindex** keyboard pattern (one Tab stop for the whole toolbar; Arrow keys move between controls).
- Automatic **overflow handling** — when the toolbar runs out of horizontal space, collapse trailing items into a `<Menu>` "more actions" dropdown.
- Consistent visual rhythm (gap, divider sizing, alignment).
- Group semantics (`role="toolbar"` with proper `aria-label` / `aria-orientation`).

Toolbar is a **structural primitive** — it doesn't ship its own visual variants beyond `bordered` / `floating`; the child Toggles / Buttons drive their own visuals.

---

## Public API

```tsx
import { Toolbar } from 'apx-ds';

// Basic editor toolbar
<Toolbar aria-label="Text formatting">
  <ToggleGroup attached>
    <Toggle value="bold" pressed={bold} onPressedChange={setBold}><Icon name="bold" /></Toggle>
    <Toggle value="italic"><Icon name="italic" /></Toggle>
    <Toggle value="underline"><Icon name="underline" /></Toggle>
  </ToggleGroup>

  <Toolbar.Separator />

  <ToggleGroup type="single" value={align} onChange={setAlign} attached>
    <Toggle value="left"><Icon name="align-left" /></Toggle>
    <Toggle value="center"><Icon name="align-center" /></Toggle>
    <Toggle value="right"><Icon name="align-right" /></Toggle>
  </ToggleGroup>

  <Toolbar.Separator />

  <Button variant="ghost"><Icon name="link" /></Button>
  <Button variant="ghost"><Icon name="image" /></Button>

  <Toolbar.Spacer />

  <Button variant="solid" color="primary">Publish</Button>
</Toolbar>

// Vertical toolbar (e.g. a sidebar app rail)
<Toolbar orientation="vertical" aria-label="Quick actions">
  <Button variant="ghost"><Icon name="search" /></Button>
  <Button variant="ghost"><Icon name="bell" /></Button>
  <Toolbar.Separator />
  <Button variant="ghost"><Icon name="user" /></Button>
</Toolbar>

// With overflow → automatic "more" dropdown
<Toolbar overflow="menu" aria-label="Document actions">
  <Button>Save</Button>
  <Button>Save as</Button>
  <Button>Export</Button>
  <Button>Print</Button>
  <Button>Share</Button>
  <Button>Duplicate</Button>
  <Button>Move to trash</Button>
</Toolbar>

// With tooltips auto-applied (when child Button/Toggle has aria-label but no visible text)
<Toolbar applyTooltips>
  <Button variant="ghost" aria-label="Bold"><Icon name="bold" /></Button>
  …
</Toolbar>

// Bordered / floating variants
<Toolbar variant="bordered" size="md">…</Toolbar>
<Toolbar variant="floating" align="center" position="bottom">…</Toolbar>   // floating action bar pattern

// Compound API
<Toolbar>
  <Toolbar.Group>
    <Button>…</Button><Button>…</Button>
  </Toolbar.Group>
  <Toolbar.Separator />
  <Toolbar.Group>
    <Toggle>…</Toggle>
  </Toolbar.Group>
</Toolbar>

// Full prop form
<Toolbar
  orientation="horizontal"        // 'horizontal' | 'vertical'
  variant="default"               // 'default' | 'bordered' | 'floating'
  size="md"                       // 'sm' | 'md' | 'lg'
  gap={2}                         // theme spacing scale
  align="start"                   // 'start' | 'center' | 'end'  (cross-axis alignment of children)
  overflow="none"                 // 'none' | 'menu' — collapse overflow into a "more" menu
  overflowLabel="More actions"    // i18n: aria-label for the menu trigger
  applyTooltips={false}           // boolean — auto-wrap iconic children in <Tooltip>
  loop={true}                     // boolean — arrow-key navigation wraps
  ariaLabel="Toolbar"             // string — REQUIRED for a11y, no visible label
  className=""
  style={{}}
  ref={…}
>
  {children}
</Toolbar>

// Subcomponents
<Toolbar.Group>{…}</Toolbar.Group>        // logical grouping (renders inline, sets gap)
<Toolbar.Separator />                     // wraps <Divider orientation={parent.opposite} />
<Toolbar.Spacer />                         // <Spacer /> — pushes following items to logical-end
```

---

## API Decisions

| Decision                                                                | Why                                                                                                            |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Toolbar manages roving tabindex across all focusable children**       | W3C Toolbar pattern. Single Tab stop simplifies keyboard for users with many controls.                          |
| **Children can be Button / Toggle / ToggleGroup / Select / Menu / Input** | Toolbar walks descendants for focusable elements; nested ToggleGroups expose their child Toggles to the toolbar's roving tabindex. |
| **`overflow="menu"` uses ResizeObserver to measure and reflow**         | Real overflow detection (not media-query approximation). Lazily renders a `<Menu>` with the overflowed items.   |
| **`applyTooltips` is opt-in**                                          | Adds `<Tooltip>` wrappers around children that have `aria-label` but no visible text. Off by default to avoid surprising tooltip storms. |
| **Required `aria-label` (or `aria-labelledby`)**                       | Dev-mode warning when neither is supplied. axe requires it.                                                    |
| **`Toolbar.Separator` is NOT a standalone Divider**                    | It's a thin wrapper that auto-orients (vertical separator in horizontal toolbar; horizontal in vertical) and uses logical-axis CSS. |
| **`Toolbar.Spacer` is a `<Spacer>` alias**                            | Pushes following items to the logical-end (toolbar "right" group).                                              |
| **No internal styling of children**                                    | Children look exactly like they would standalone. Toolbar contributes only: gap, separators, focus management.  |

---

## Internal architecture

```
                 ┌────────────────────────────────────────────┐
   children  ─►  │  Toolbar walks via Children.toArray + refs │
                 │  Identifies focusable descendants          │
                 │  Sets data-toolbar-item="…" on each        │
                 │  Manages roving tabindex via context       │
                 └────────────────────────────────────────────┘
                                  │
                                  ▼
                 ┌────────────────────────────────────────────┐
                 │  ToolbarContext: { focused, setFocused }   │
                 │  Used by Toggle/Button to read              │
                 │    `tabIndex = id===focused ? 0 : -1`        │
                 └────────────────────────────────────────────┘
                                  │
                                  ▼
                 ┌────────────────────────────────────────────┐
                 │  Keyboard handler (root):                  │
                 │   ArrowLeft/Right (horizontal)             │
                 │   ArrowUp/Down (vertical)                  │
                 │   Home/End jump first/last                  │
                 │   loop=true wraps                           │
                 └────────────────────────────────────────────┘
                                  │
                                  ▼
                 ┌────────────────────────────────────────────┐
                 │  Overflow (when enabled):                  │
                 │   ResizeObserver on root → measure         │
                 │   Items past available width move to Menu  │
                 │   Trigger button gets focus in tabindex    │
                 └────────────────────────────────────────────┘
```

Children participate without needing custom code:

- `<Button>` already forwards `tabIndex` and supports refs (the Toolbar context overrides `tabIndex`).
- `<Toggle>` and `<ToggleGroup>` items same.
- When Toolbar sees a `<ToggleGroup type="single">`, it treats the group as one item in the roving order, then within the group arrow-keys do their normal radio-group nav.

For non-DS children (foreign Buttons, plain `<button>`), the toolbar still walks the DOM via the ref and sets `tabindex`. Hatch: Toolbar uses focusable-children traversal `[role=button], [role=switch], a[href], input, …`.

---

## File Structure

```
packages/components/src/Toolbar/
├── Toolbar.tsx
├── Toolbar.Group.tsx
├── Toolbar.Separator.tsx
├── Toolbar.Spacer.tsx
├── Toolbar.context.ts                # { focusedItemId, setFocusedItemId, orientation, register, unregister }
├── Toolbar.types.ts
├── Toolbar.recipe.ts
├── useToolbarKeyboard.ts             # pure-ish: handles arrow/home/end + loop
├── useToolbarOverflow.ts             # ResizeObserver-based overflow detection
├── useRovingTabindex.ts              # if not already provided by engine (likely lives here for now)
├── Toolbar.test.tsx
├── Toolbar.keyboard.test.tsx
├── Toolbar.overflow.test.tsx
├── Toolbar.a11y.test.tsx
├── useToolbarKeyboard.test.ts
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── BasicEditor.tsx                # bold/italic/underline + align group
    ├── Vertical.tsx
    ├── BorderedVariant.tsx
    ├── FloatingVariant.tsx            # floating action bar at bottom
    ├── Overflow.tsx                   # many buttons, last few collapse into menu
    ├── ApplyTooltips.tsx
    ├── WithSpacer.tsx
    ├── Groups.tsx                     # Toolbar.Group sections
    ├── Sizes.tsx
    ├── MixedControls.tsx              # Toggles + Buttons + Menu + Select all in one
    ├── KeyboardDemo.tsx               # arrows + home/end visualization
    └── RichTextDemo.tsx               # realistic editor surface
```

---

## Recipe sketch

```ts
export const toolbarRecipe = cv({
  base: 'flex items-center min-w-0 outline-none',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
    variant: {
      default: '',
      bordered: 'rounded-lg border border-(--sds-color-border-default) bg-(--sds-color-surface-default) p-1',
      floating: 'rounded-full border border-(--sds-color-border-subtle) bg-(--sds-color-surface-raised) shadow-md p-1',
    },
    size: {
      sm: 'gap-0.5 [&_button]:h-7',
      md: 'gap-1 [&_button]:h-8',
      lg: 'gap-1.5 [&_button]:h-10',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
    },
  },
  defaultVariants: {
    orientation: 'horizontal', variant: 'default', size: 'md', align: 'center',
  },
});
```

The `size` variant injects child-control sizing via descendant selectors only when consumers don't size their own children (the per-child Button `size` prop still wins via specificity).

`floating` variant + an optional `position` prop pairs the toolbar with `fixed bottom-4 left-1/2 -translate-x-1/2 z-50` styles for the floating-action-bar pattern (e.g. Figma's bottom toolbar).

---

## Keyboard pattern (W3C Toolbar)

| Key                                 | Action                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `Tab` / `Shift+Tab`                | Enter / leave the toolbar. Only the focused item is in the tab order.                        |
| `ArrowRight` (horizontal LTR)       | Next item; wraps if `loop=true`.                                                              |
| `ArrowLeft` (horizontal LTR)        | Previous item.                                                                                |
| `ArrowDown` (vertical)             | Next item.                                                                                    |
| `ArrowUp` (vertical)               | Previous item.                                                                                |
| `Home`                              | First item.                                                                                   |
| `End`                               | Last item.                                                                                    |
| `Enter` / `Space`                   | Activate item (handled by item itself — Toolbar doesn't intercept).                          |
| `Esc`                               | If overflow menu open, close it; otherwise propagate.                                         |

RTL: ArrowLeft / ArrowRight semantically swap (browser-native — handled via the `dir` engine context).

Disabled items are skipped during navigation.

---

## Overflow mechanism

```ts
function useToolbarOverflow({ enabled, ref }) {
  const [overflowCount, setOverflowCount] = useState(0);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const root = ref.current;
    const ro = new ResizeObserver(() => measure(root, setOverflowCount));
    ro.observe(root);
    return () => ro.disconnect();
  }, [enabled]);
  return overflowCount;
}
```

`measure()` walks children, summing their `offsetWidth + gap` until it exceeds container width minus reserved space for the "more" menu trigger (28-40px depending on size). Items past that point are rendered into the menu instead of the toolbar.

Overflowed items keep their roving-tabindex registration **only when the menu is open**; otherwise the menu trigger is the focusable proxy.

---

## A11y

- **Root**: `role="toolbar"` with `aria-label={ariaLabel}` (required) and `aria-orientation={orientation}`.
- Items keep their native roles (`role="button"`, `role="switch"`, etc.).
- Roving tabindex: exactly one focusable child at any time (`tabIndex=0`); others `tabIndex=-1`.
- **Disabled items** retain `aria-disabled="true"` and are skipped during arrow navigation.
- **`Toolbar.Separator`**: renders `<Divider role="separator" aria-orientation=…>`.
- **`Toolbar.Group`** can take its own `aria-label` to scope a sub-section.
- **Overflow menu trigger** is a `<Button aria-haspopup="menu" aria-expanded={open}>` with `aria-label={overflowLabel}`.
- `applyTooltips`: when enabled, iconic buttons (no visible text + `aria-label`) get a `<Tooltip>` wrapper showing the aria-label.
- axe-core: 0 violations across all variants / orientations / overflow / with-applyTooltips.

---

## i18n

When wrapped in `<I18nProvider>`, Toolbar consumes only:

| Key                | Default (en)     |
| ------------------ | ---------------- |
| `toolbar.more`     | "More actions"   |

Used as the default `overflowLabel`. Consumers can override per-instance via prop.

---

## RTL

- `flex-direction: row` flips automatically — first item appears on the right.
- ArrowLeft / ArrowRight semantics swap (browser-native).
- `Toolbar.Spacer` (uses `Spacer` + `flex: 1`) — direction-agnostic.
- `Toolbar.Separator` orientation = perpendicular to toolbar → vertical separator stays vertical; uses `border-inline-start`.
- Overflow detection walks children in DOM order (LTR mental model), but visual ordering in RTL is correctly mirrored by the browser.

---

## Performance

- Roving-tabindex via context — single state update per arrow press.
- Overflow uses ResizeObserver only when `overflow="menu"` (off by default; opt-in cost).
- No layout thrash: `measure()` reads layout once per ResizeObserver tick (debounced via `requestAnimationFrame`).
- Bundle target: **< 4 KB gz** (excluding Menu/Tooltip which are external).

---

## Testing

- Renders `<div role="toolbar" aria-label="…" aria-orientation="…">`.
- Roving tabindex: only one focusable child at a time; default = first non-disabled child.
- Arrow keys move focus, skipping disabled; Home/End jump to first/last; wraps when `loop=true`.
- Orientation switches arrow handling (horizontal Left/Right ↔ vertical Up/Down).
- `<Toolbar.Separator>` is skipped in keyboard navigation.
- `<Toolbar.Group>` with `aria-label` produces a nested labelled region but does NOT introduce a tab stop.
- `overflow="menu"` collapses trailing items into a `<Menu>`; ResizeObserver triggers reflow correctly (jsdom mock).
- `applyTooltips`: iconic buttons get `<Tooltip>` wrappers; buttons with visible text are left untouched.
- Dev-mode warning if neither `aria-label` nor `aria-labelledby` is provided.
- RTL: arrow-key behavior flips appropriately.
- axe-core: 0 violations in horizontal / vertical / bordered / floating / overflow / applyTooltips modes.

---

## Acceptance Criteria

- [ ] `<Toolbar>`, `<Toolbar.Group>`, `<Toolbar.Separator>`, `<Toolbar.Spacer>` all exported.
- [ ] W3C Toolbar keyboard pattern fully implemented (arrow keys, Home/End, single tab stop).
- [ ] `overflow="menu"` works with ResizeObserver-based measuring.
- [ ] `applyTooltips` wraps iconic children in `<Tooltip>`.
- [ ] `aria-label` is required (dev warning).
- [ ] Bordered + floating + default variants render correctly.
- [ ] i18n bundle for en/he/ar.
- [ ] RTL arrow-key semantics correct.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 4 KB gz.

---

## DRY Self-Check

- [ ] Reuses Button, Toggle, ToggleGroup, Menu, Tooltip, Divider, Spacer.
- [ ] `useToolbarKeyboard` is component-local — promote to engine only when a second Toolbar-style component appears (unlikely; Toolbar is one of a kind).
- [ ] No new color tokens.
- [ ] Roving-tabindex logic could be extracted to `useRovingTabindex` and shared with Radio / Tabs / Menu in future refactor — flag in DRY notes.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/44-toolbar.md`.
2. Outcome notes: bundle delta, any extracted roving-tabindex utility, follow-up to consolidate roving-tabindex across Tabs/Radio/Menu.
3. Document "common toolbar recipes": rich-text editor, table action bar, floating action bar, vertical app rail.

---

## Outcome

**Status:** ✅ **Shipped** by SDS-Agent2.

### Surface delivered

- `<Toolbar>` root + 3 subparts (`Toolbar.Group`, `Toolbar.Separator`, `Toolbar.Spacer`) via `Object.assign` compound, matching Card / Accordion / Menu / Popover convention.
- Two orientations × 3 visual variants (`default` / `bordered` / `floating`) × 3 sizes (`sm` / `md` / `lg`) × 3 alignment values.
- W3C Toolbar **roving tabindex** with single Tab stop, arrow / Home / End navigation, RTL-aware arrow flipping, disabled-item skipping, optional `loop` (default `true`).
- Optional `overflow="menu"` ResizeObserver-driven reflow into a `<Popover>` "more actions" trigger (3-dot SVG glyph) — gated to horizontal mode + opt-in (no observer cost when off).
- Optional `applyTooltips` for auto-wrapping iconic children (`aria-label` + no visible text) in `<Tooltip>`.
- Required `aria-label` / `aria-labelledby` with loud dev warning (`TOOLBAR_NO_LABEL`).
- Mutation-observer-backed tabindex management that wins the race against children that re-claim `tabindex=0` (notably `<ToggleGroup.Item>` in single mode).
- Capture-phase keyboard handler so arrows are owned by the toolbar, not by nested controls — matches Google Docs / Notion / Figma editor-toolbar UX.

### Files added

```
packages/components/src/Toolbar/
├── Toolbar.tsx                 # root component
├── Toolbar.types.ts            # Props, context, axes
├── Toolbar.recipe.ts           # cv recipes + literal Tailwind tables
├── Toolbar.context.ts          # ToolbarContext + helpers
├── ToolbarGroup.tsx            # Group subpart
├── ToolbarSeparator.tsx        # Separator subpart (auto-orienting)
├── ToolbarSpacer.tsx           # Spacer alias subpart
├── useToolbarKeyboard.ts       # pure resolver + React glue (capture phase)
├── useToolbarOverflow.ts       # pure measure + ResizeObserver hook
├── useToolbarRoving.ts         # MutationObserver-backed tabindex manager
├── applyTooltips.tsx           # iconic-child wrap helper
├── meta.ts                     # ComponentMeta
├── index.ts                    # Object.assign compound + barrel
├── README.mdx                  # docs + 12 <ExampleBlock> shortcodes
└── examples/                   # 12 files (BasicEditor, Vertical, Variants, Sizes, Groups,
                                #   WithSpacer, Overflow, ApplyTooltips, Floating, KeyboardDemo,
                                #   MixedControls, RichTextDemo)

packages/components/__tests__/
├── Toolbar.test.tsx                  # 24 tests (root, roving tabindex, subparts)
├── Toolbar.keyboard.test.tsx         # 13 tests (arrows, RTL, vertical, disabled skip, text inputs)
├── Toolbar.overflow.test.tsx         # 7 tests (pure measureOverflowCount edge cases)
├── Toolbar.a11y.test.tsx             # 7 tests (axe-core: horizontal / vertical / variants / groups / labelledby)
└── useToolbarKeyboard.test.ts        # 17 tests (resolveNextToolbarIndex: orientation × RTL × loop × edge)
```

Surgical insert in `packages/components/src/index.ts` between `Toggle` and `Tooltip` exports (alphabetical: T-o-g → **T-o-l** → T-o-o).

### QA results

| Gate | Result |
| --- | --- |
| Lint (Toolbar src + tests + index.ts) | ✅ Clean |
| Typecheck (workspace) | ✅ Clean — `tsc --noEmit` exit code 0 |
| Tests (Toolbar-scoped) | ✅ **68/68** passing — 24 unit + 13 keyboard + 7 overflow + 7 a11y + 17 pure resolver |
| Tests (workspace-wide) | ✅ **1750/1750** passing (94 test files) |
| Build (`pnpm --filter @apx-dsponents build`) | ✅ ESM + CJS + DTS all green |
| axe-core (`Toolbar.a11y.test.tsx`) | ✅ Zero violations across horizontal / vertical / bordered / floating / with-groups / aria-labelledby |
| Bundle (gzipped, peers external) | **3.93 KB gz** ✅ — **under** the 4 KB target |

### Bundle measurement detail

Bundled with `esbuild --bundle --minify --format=esm --target=es2022` from `src/Toolbar/index.ts` directly (not from `dist/index.js`) so esbuild's tree-shaking can drop unused dead branches. Peers externalized:

- `react`, `react-dom`, `react/jsx-runtime`
- `@apx-dsine`, `@apx-apx-ds `@apx-ds/tapx-dsapx-ds/iconsapx-ds
- `../Button/Button`, `../Popover`, `../Stack/Spacer`, `../Tooltip` (shipped in their own phases)

Result: **raw 10.99 KB / gzipped 3.93 KB**. Comfortably under the **< 4 KB gz** plan target.

Drivers of the size:
- `useToolbarRoving` MutationObserver + focusin handling (~ 1.2 KB raw)
- `useToolbarKeyboard` capture-phase handler + RTL/orientation switch (~ 0.9 KB raw)
- `useToolbarOverflow` ResizeObserver + measure walker (~ 0.7 KB raw)
- Recipe + types + 4 component shells (root + 3 subparts) (~ 2.5 KB raw)
- `applyTooltips` helper + JSX runtime overhead (~ 1.5 KB raw)
- Literal Tailwind class table for `TOOLBAR_GROUP_GAP_CLASSES` (~ 0.3 KB raw)

### Coordination + guardrail compliance

- ✅ **No `_shared/` writes.** Roving-tabindex / keyboard / overflow logic stays inside `src/Toolbar/`. Two pure exports (`resolveNextToolbarIndex`, `measureOverflowCount`) re-exported from the barrel so future Toolbar-style consumers can reuse them without React.
- ✅ **No theme-token / Tailwind preset / engine writes.**
- ✅ **No renderer start/restart.** All testing was local (vitest + tsc + esbuild).
- ✅ **No edits to ToggleGroup / Tooltip / Divider / Menu / Popover / Button source.** Toolbar is a pure consumer of every peer.
- ✅ **Alphabetical insert** between `Toggle` and `Tooltip` in `packages/components/src/index.ts` (the only file outside `src/Toolbar/` touched).
- ✅ **Ship-gate compliance**: every example renders a deliberate, working trigger. Overflow demo uses an explicit add/remove control so Ahmad can grow / shrink the toolbar visually; no auto-firing setInterval / setTimeout.

### Deviations from plan

1. **Overflow surface is `<Popover>`, not `<Menu>`.** The plan specified `<Menu>` "more actions" dropdown; in practice `<Menu.Item>` doesn't support `asChild` (verified by grep against `MenuItem.tsx`), so wrapping arbitrary child components inside Menu items wasn't possible without editing Menu source — which the guardrails forbid. `<Popover>` accepts any content via `Popover.Content`, preserves each child's native interaction model (Button → Button click, ToggleGroup → ToggleGroup state), and matches Linear / Notion's overflow popovers visually. **Trade-off**: the overflowed items don't get menu-style keyboard nav (arrow keys / typeahead) inside the popover; users Tab through them. This actually preserves correctness — the children's own keyboard handling (`<Button>` activation via Enter/Space) works exactly as in the toolbar itself. Trigger still emits `aria-haspopup="menu"` for AT consistency.
2. **`floating` variant ships visual chrome only** (raised shadow + pill rounding) — no `position: fixed` styling. The plan hinted at `position="bottom"` for fixed-position floating action bars; I left positioning to the consumer's parent layout (matches the `Floating.tsx` example, which puts the toolbar inside a card). Simpler API, fewer footguns for consumers who want floating chrome without absolute positioning.
3. **ToggleGroup single-mode "arrow moves AND activates" is suppressed inside a Toolbar.** This is unavoidable given the guardrail "no edits to ToggleGroup source": the Toolbar's capture-phase arrow handler wins the race, preventing ToggleGroup's own arrow handler from running. Activation via Space / Enter / click is preserved. This matches the editor-toolbar convention (every real editor I checked — Google Docs, Notion, Figma — uses Space/Enter to activate, not arrow keys, when items are inside a toolbar). Documented in `useToolbarKeyboard.ts` and the README.
4. **`gap` on `Toolbar.Group` only accepts a narrow scale** (`0` / `'px'` / `0.5` / `1` / `2` / `3` / `4`). Toolbars never need wide gaps; the narrow scale keeps the literal-class table tiny (~ 0.3 KB) so Tailwind's JIT scanner discovers everything without us touching `safelist`.

### Follow-ups flagged (out of scope for this phase)

- **`useRovingTabindex` engine promotion.** Tabs (Phase 16) + Radio (Phase 11) + Menu (Phase 21) + Toolbar (Phase 44) are now four shipped consumers of roving-tabindex semantics — past the planner's 3-consumer threshold for engine extraction. Each implementation is slightly different (Tabs uses a registry; Radio uses ToggleGroup-style index map; Menu uses content-based; Toolbar uses DOM-walk + MutationObserver), so the promotion needs a careful API design that doesn't lose any of the consumers' nuances. Recommend a dedicated planner pass before extraction.
- **Visual focus ring for the overflow trigger.** The 3-dot button inherits `<Button variant="ghost">` styles, which work fine but a dedicated `data-toolbar-overflow-trigger` state hook would let consumers theme it independently. Defer until a consumer asks.
- **`Toolbar.Separator` reuses an inline implementation** instead of wrapping `<Divider>` because Divider assumes block-level `<hr>` semantics; a toolbar separator needs `self-stretch` cross-axis sizing. If a future use case demands logical-line styles from Divider, the wrapper can switch with no API change.

### Multi-agent room ack

Posted 🚧 in-progress and 🟢 shipped notes in the coordination room. No `_shared/` or theme-preset writes, no edits to peer components, no renderer touches. Standing by for the next assignment.