# Phase 22 — `<Menu />` + `Menu.Trigger` + `Menu.Content` + `Menu.Item` + `Menu.Group` + `Menu.Label` + `Menu.Separator` + `Menu.CheckboxItem` + `Menu.RadioGroup` + `Menu.RadioItem` + `Menu.Sub` + `Menu.SubTrigger` + `Menu.SubContent`

> Status: **Pending** · Depends on: Phase 18 (Popover — Menu is a specialized Popover with keyboard-driven highlight) · Blocks: Phase 23 (Select — Select dropdown reuses Menu's keyboard nav + item recipe)

## Objective

Ship the canonical dropdown / context menu primitive. Menu is the **deepest compound** in this
batch — 13 subparts — because it covers four distinct UX patterns under one API:

1. **Simple action menu** — list of actions; click closes the menu.
2. **Checkbox menu** — multi-select toggle items.
3. **Radio menu** — single-select with optional group label.
4. **Submenus** — hierarchical menus that open on hover/focus.

Plus the `trigger` prop variable switches between **dropdown** (click) and **context** (right-click)
menus from the same component — no separate `<ContextMenu>` ships.

---

## What This Component Proves

- Keyboard navigation pattern (arrow keys, Home/End, type-ahead-search) generalized to any list-like overlay.
- Submenu spawning + escape-stack interaction (Right opens sub, Left closes sub, only innermost closes on Esc).
- Checkbox / radio items inside an overlay reuse Phase 9–11 visual indicators without `_shared/` duplication.
- The single API serves dropdown + context menu via `trigger` prop.
- Selection commits emit semantic events (`onSelect`) — consumer doesn't care which type of item fired.

---

## Public API

```tsx
import { Menu, Button } from 'apx-ds';

// Dropdown menu (default trigger):
<Menu>
  <Menu.Trigger asChild>
    <Button>Options</Button>
  </Menu.Trigger>
  <Menu.Content>
    <Menu.Item onSelect={() => editProfile()}>Edit profile</Menu.Item>
    <Menu.Item onSelect={() => duplicate()}>Duplicate</Menu.Item>
    <Menu.Separator />
    <Menu.Item color="danger" onSelect={() => del()}>Delete</Menu.Item>
  </Menu.Content>
</Menu>

// Context menu (right-click anywhere inside the trigger area):
<Menu trigger="context">
  <Menu.Trigger asChild>
    <div className="rounded border p-4">Right-click me</div>
  </Menu.Trigger>
  <Menu.Content>
    …
  </Menu.Content>
</Menu>

// Full power:
<Menu
  open={open}
  defaultOpen={false}
  onOpenChange={(v) => setOpen(v)}
  trigger="click"                   // 'click' (default — dropdown) | 'context' (right-click) | 'hover' (rare)
  closeOnEscape={true}
  closeOnOutsideClick={true}
  closeOnInteractOutside={true}
  closeOnSelect={true}              // close after a Menu.Item fires onSelect (default true; CheckboxItem overrides to false)
>
  <Menu.Trigger asChild>…</Menu.Trigger>
  <Menu.Content
    variant="solid"                 // 'solid' | 'outline' | 'soft'
    size="md"                       // 'sm' | 'md' | 'lg'
    color="neutral"                 // 7-color palette — accents border on outline/soft
    placement="bottom-start"        // 12-placement vocab
    offset={4}
    portalContainer={null}
    loop={true}                     // arrow-keys wrap (default true)
    typeAhead={true}                // type-ahead search (default true)
  >
    <Menu.Label>Account</Menu.Label>
    <Menu.Item leftIcon={<UserIcon />} shortcut="⌘P">Profile</Menu.Item>
    <Menu.Item leftIcon={<LogoutIcon />} shortcut="⌘⇧Q">Logout</Menu.Item>
    <Menu.Separator />

    <Menu.Group>
      <Menu.Label>View</Menu.Label>
      <Menu.CheckboxItem
        checked={showSidebar}
        onCheckedChange={setShowSidebar}
        shortcut="⌘\"
      >Show sidebar</Menu.CheckboxItem>
      <Menu.CheckboxItem checked={fullscreen} onCheckedChange={setFullscreen}>Fullscreen</Menu.CheckboxItem>
    </Menu.Group>

    <Menu.Separator />

    <Menu.RadioGroup value={theme} onValueChange={setTheme}>
      <Menu.Label>Theme</Menu.Label>
      <Menu.RadioItem value="light">Light</Menu.RadioItem>
      <Menu.RadioItem value="dark">Dark</Menu.RadioItem>
      <Menu.RadioItem value="system">System</Menu.RadioItem>
    </Menu.RadioGroup>

    <Menu.Separator />

    <Menu.Sub>
      <Menu.SubTrigger>More tools</Menu.SubTrigger>
      <Menu.SubContent>
        <Menu.Item onSelect={() => extensions()}>Extensions</Menu.Item>
        <Menu.Item onSelect={() => devtools()}>DevTools</Menu.Item>
      </Menu.SubContent>
    </Menu.Sub>
  </Menu.Content>
</Menu>
```

### Prop Decisions

- **`trigger="click" | "context" | "hover"`** — variable that picks the open behavior. Clean unification of DropdownMenu + ContextMenu via one component.
- **`closeOnSelect={true}` default** — pressing an action item closes the menu. CheckboxItem and RadioItem override this internally (you want to toggle multiple checkboxes without re-opening).
- **`loop={true}` default** — arrow-key wrap at top/bottom. Most apps want this.
- **`typeAhead={true}` default** — typing "Del" highlights "Delete". Standard a11y pattern.
- **Items use `onSelect` not `onClick`** — onSelect fires for keyboard Enter/Space + mouse click + (in some cases) auto-selection. Consumers don't care which.
- **`shortcut` is a string** — rendered as right-aligned label; **not** a keyboard binding. Consumers wire bindings themselves; this is a visual hint.

---

## Variants — Designed Inline

### Content variants (3) × colors (7)

Same 3 variants as Popover (`solid`, `outline`, `soft`) — Menu inherits Popover's visual lineage.

### Item variants

Single-axis on items:
- **`color`** — `'neutral' | 'danger'` (most menus need a "destructive item" red treatment; other colors are out of scope here — consumers can pass `className` for one-offs).
- **`disabled={true}`** — desaturated + non-interactive.
- **`highlighted` (internal data attribute)** — driven by keyboard nav; rendered via `data-highlighted` CSS.

### Sizes

| Size | Item padding | Content padding | Font           |
| ---- | ------------ | --------------- | -------------- |
| `sm` | `px-2 py-1`  | `p-1`           | `text-xs`      |
| `md` | `px-2 py-1.5`| `p-1`           | `text-sm`      |
| `lg` | `px-3 py-2`  | `p-1.5`         | `text-base`    |

---

## File Structure

```
packages/components/src/Menu/
├── Menu.tsx                     # context + state owner
├── MenuTrigger.tsx
├── MenuContent.tsx
├── MenuItem.tsx
├── MenuLabel.tsx
├── MenuGroup.tsx
├── MenuSeparator.tsx
├── MenuCheckboxItem.tsx
├── MenuRadioGroup.tsx
├── MenuRadioItem.tsx
├── MenuSub.tsx
├── MenuSubTrigger.tsx
├── MenuSubContent.tsx
├── Menu.types.ts
├── Menu.recipe.ts               # ~8 recipes
├── Menu.motion.ts               # enter/exit (mirrors Popover)
├── MenuContext.ts               # root + sub contexts
├── useMenuKeyboard.ts           # keyboard nav (arrows, Home/End, type-ahead, Enter, Esc)
├── index.ts                     # Object.assign
├── Menu.test.tsx
├── Menu.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── WithIcons.tsx
    ├── WithShortcuts.tsx
    ├── ContextMenu.tsx          # trigger='context'
    ├── HoverMenu.tsx            # trigger='hover'
    ├── DestructiveItem.tsx      # color='danger'
    ├── CheckboxItems.tsx
    ├── RadioGroup.tsx
    ├── Submenus.tsx
    ├── Disabled.tsx
    ├── TypeAhead.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    └── Controlled.tsx
```

---

## Recipe Sketch

```ts
// Menu.recipe.ts
import { cv } from '@apx-dsine';

export const menuRecipes = {
  content: cv({
    base: [
      'relative outline-none',
      'rounded-md border bg-bg-paper text-fg-default shadow-md',
      'min-w-[12rem] z-overlay',
      'transition-[opacity,transform] duration-fast ease-standard',
    ].join(' '),
    variants: {
      variant: { solid: '', outline: '', soft: '' },
      size: { sm: 'p-1', md: 'p-1', lg: 'p-1.5' },
      color: { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
    },
    compoundVariants: [
      // outline × colors → border
      // soft × colors → tint
      // (same shape as Popover)
    ],
    defaultVariants: { variant: 'solid', size: 'md', color: 'neutral' },
  }),
  item: cv({
    base: [
      'relative flex items-center gap-2 select-none cursor-default rounded',
      'outline-none',
      'data-[highlighted=true]:bg-bg-subtle data-[highlighted=true]:text-fg-default',
      'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
    ].join(' '),
    variants: {
      size: { sm: 'px-2 py-1 text-xs', md: 'px-2 py-1.5 text-sm', lg: 'px-3 py-2 text-base' },
      color: { neutral: '', danger: 'text-danger data-[highlighted=true]:bg-danger-subtle data-[highlighted=true]:text-danger-emphasis' },
    },
    defaultVariants: { size: 'md', color: 'neutral' },
  }),
  label: cv({
    base: 'px-2 py-1 text-xs font-medium text-fg-muted select-none',
  }),
  separator: cv({
    base: '-mx-1 my-1 h-px bg-border',
  }),
  checkboxIndicator: cv({
    base: 'inline-flex size-4 items-center justify-center text-current',
  }),
  radioIndicator: cv({
    base: 'inline-flex size-4 items-center justify-center text-current',
  }),
  shortcut: cv({
    base: 'ms-auto text-xs text-fg-muted tracking-widest',
  }),
  subTriggerChevron: cv({
    base: 'ms-auto size-4 text-fg-muted',
  }),
};
```

---

## Keyboard Hook

```ts
// useMenuKeyboard.ts
export function useMenuKeyboard(opts: {
  itemsRef: RefObject<HTMLElement[]>;
  loop: boolean;
  typeAhead: boolean;
  onClose: () => void;
  onSelectItem: (index: number) => void;
}) {
  // Returns onKeyDown handler.
  // - ArrowDown / ArrowUp: cycle through enabled items
  // - Home / End: first / last enabled
  // - Enter / Space: select highlighted item
  // - Esc: onClose
  // - Type-ahead: collect keys for ~500ms, match prefix of item text
  // - Tab / Shift+Tab: close (menus close on Tab — matches platform)
}
```

This hook is **menu-specific** in V1; if Select (Phase 23) and the future Combobox prove they want
the same shape, promote to `_shared/useListKeyboard.ts`. For now, the second-consumer rule is
satisfied locally inside Menu.

---

## Submenus

`Menu.Sub` opens its `SubContent` on:
- Hover over the SubTrigger (with delay ~150ms).
- Right Arrow on the focused SubTrigger.
- Focus into the SubTrigger (when keyboard arrow-down lands on it).

Closes on:
- Left Arrow.
- Hover-out (after closeDelay ~250ms; cancellable on hover-into SubContent).
- Esc (only innermost closes per escape-stack).

`SubContent` reuses `usePosition` with `placement="right-start"` (or `"left-start"` in RTL).

---

## Types

```ts
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import type { Sx } from '@apx-dsine';
import type { PopoverPlacement } from '../Popover/Popover.types';

export type MenuVariant = 'solid' | 'outline' | 'soft';
export type MenuSize = 'sm' | 'md' | 'lg';
export type MenuColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type MenuPlacement = PopoverPlacement;
export type MenuTriggerKind = 'click' | 'context' | 'hover';

export interface MenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: MenuTriggerKind;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnInteractOutside?: boolean;
  closeOnSelect?: boolean;
  children: ReactNode;
}

export interface MenuContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  variant?: MenuVariant;
  size?: MenuSize;
  color?: MenuColor;
  placement?: MenuPlacement;
  offset?: number;
  portalContainer?: HTMLElement | null;
  loop?: boolean;
  typeAhead?: boolean;
  sx?: Sx;
}

export interface MenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  color?: 'neutral' | 'danger';
  onSelect?: () => void;
  asChild?: boolean;
  sx?: Sx;
}

export interface MenuCheckboxItemProps extends Omit<MenuItemProps, 'onSelect'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export interface MenuRadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export interface MenuRadioItemProps extends Omit<MenuItemProps, 'onSelect'> {
  value: string;
}
```

---

## Accessibility

- ARIA Menu pattern (W3C APG):
  - Trigger: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`.
  - Content: `role="menu"`, focus moved into the menu when open.
  - Items: `role="menuitem"` (or `"menuitemcheckbox"` / `"menuitemradio"` for those variants), `aria-disabled` when disabled, `aria-checked` for checkbox/radio variants, `data-highlighted="true"` for the currently-active item (drives styling + announces).
- Keyboard:
  - Arrow Down/Up: cycle items.
  - Home / End: first / last.
  - Enter / Space: select.
  - Esc: close.
  - Tab: close (matches platform).
  - Type-ahead: type to jump.
  - Right / Left: open / close submenu (when applicable).
- Context-menu mode: `contextmenu` event opens; coordinates passed to `usePosition` via a "virtual element" reference.
- Focus management: focus moves into Content on open; back to Trigger on close. Submenus restore to parent item.
- axe-core: zero violations.

---

## Animation / Interactions

- Same Motion preset as Popover.
- Submenu opens with a 60ms slight stagger.
- `prefers-reduced-motion`: opacity-only.

---

## Responsive

```tsx
<Menu.Content size={{ base: 'lg', md: 'sm' }} placement={{ base: 'bottom', md: 'bottom-end' }}>
  …
</Menu.Content>
```

---

## RTL

- Placements and submenu opening side both flip (`right-start` → `left-start` in RTL automatically via Floating UI).
- `shortcut` label is logical-end (`ms-auto`).
- Chevron on SubTrigger flips horizontally in RTL.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Menu: {
      defaultProps: { /* none — menu is stateful */ },
      styleOverrides: {
        content: 'shadow-xl',
        item: 'rounded-md',
        label: '',
        separator: '',
        shortcut: 'text-fg-default',
      },
    },
  },
})} />
```

---

## Examples List

| File                  | Demonstrates                                       |
| --------------------- | -------------------------------------------------- |
| `Basic.tsx`           | Default dropdown                                   |
| `WithIcons.tsx`       | leftIcon on items                                  |
| `WithShortcuts.tsx`   | shortcut label                                     |
| `ContextMenu.tsx`     | `trigger="context"`                                |
| `HoverMenu.tsx`       | `trigger="hover"`                                  |
| `DestructiveItem.tsx` | `color="danger"`                                   |
| `CheckboxItems.tsx`   | Checkbox items                                     |
| `RadioGroup.tsx`      | Radio items                                        |
| `Submenus.tsx`        | Hierarchical menus                                 |
| `Disabled.tsx`        | Disabled items + groups                            |
| `TypeAhead.tsx`       | Type-ahead navigation                              |
| `Variants.tsx`        | solid / outline / soft                             |
| `Sizes.tsx`           | sm / md / lg                                       |
| `Colors.tsx`          | 7 colors                                           |
| `Controlled.tsx`      | Parent owns open + selection                       |

---

## Testing Plan

`Menu.test.tsx`:
- All triggers (click / context / hover) open the menu
- Arrow nav: down/up/Home/End cycle correctly (with `loop=true` and `false`)
- Type-ahead: typing matches item prefix
- Enter/Space on highlighted item fires `onSelect`
- `closeOnSelect=true` (default) closes on action item; `closeOnSelect=false` keeps open
- CheckboxItem toggle: `aria-checked` updates; checkbox indicator renders
- RadioGroup: selecting an item updates parent value; `aria-checked` exclusive
- Submenu: Right opens; Left closes; hover-into delays correctly
- Esc: closes innermost only (with submenu open)
- Tab: closes everything
- Outside click closes
- `variant` / `size` / `color` apply correct classes
- Theme `styleOverrides.{ content, item, label, separator, shortcut }` merge correctly
- `ref` forwarded to Content

`Menu.a11y.test.tsx`:
- ARIA: `aria-haspopup`, `aria-expanded`, `aria-controls` on Trigger
- `role="menu"` on Content; `role="menuitem|menuitemcheckbox|menuitemradio"` on items
- `aria-checked` on checkbox/radio items
- `aria-disabled` on disabled items
- Focus moves into Content on open; back to Trigger on close
- axe passes for every variant × color cell

---

## File-Level Tasks (Ordered)

1. [ ] Create `packages/components/src/Menu/` folder
2. [ ] Write `Menu.types.ts`
3. [ ] Write `Menu.recipe.ts` (~8 recipes)
4. [ ] Write `Menu.motion.ts`
5. [ ] Write `MenuContext.ts`
6. [ ] Write `useMenuKeyboard.ts`
7. [ ] Write all 13 subpart files
8. [ ] Write `index.ts` (Object.assign — biggest one yet)
9. [ ] Write `meta.ts` (category `Overlays`, tags `['menu', 'dropdown', 'context-menu', 'overlay']`)
10. [ ] Write `Menu.test.tsx`, `Menu.a11y.test.tsx`
11. [ ] Write 15 example files
12. [ ] Write `README.mdx`
13. [ ] Export `Menu` from package index + `apx-ds
14. [ ] Renderer discovery check
15. [ ] Bundle delta: < 7 KB gzipped (largest in this batch — the keyboard logic + submenus add up)

---

## Acceptance Criteria

- [ ] All three trigger modes (click / context / hover) work.
- [ ] Keyboard nav matches W3C ARIA Menu pattern.
- [ ] Type-ahead works.
- [ ] Submenus open/close on hover + keyboard correctly.
- [ ] Checkbox + Radio items emit correct events; `aria-checked` correct.
- [ ] Destructive (`color="danger"`) item styled distinctly.
- [ ] All variants / sizes / colors / placements render.
- [ ] axe-core passes.
- [ ] Reduced-motion users see opacity-only transitions.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import
- [ ] `usePosition`, `<Portal>`, `useEscapeStack`, `useOutsideClick`, `useControllableState` all imported from engine
- [ ] `MenuPlacement = PopoverPlacement` (shared vocab)
- [ ] `useMenuKeyboard` lives locally; promote to `_shared/useListKeyboard.ts` if Select / Combobox prove it's reused
- [ ] Checkbox / Radio indicator components reuse the visual indicators from Checkbox (Phase 9) and Radio (Phase 11) — `<CheckIcon />`, `<DotIcon />` lifted into `_shared/icons/` if not already
- [ ] Adding a color = palette entry + 2 compound rows in `content` recipe; no component changes

---

## Out of Scope (Future Components / Phases)

- **`Menu.Sub` keyboard hover** with no submenu intent prediction (Apple-style "triangle path" heuristic) — V2; basic delay works fine.
- **`Menu.Item` with badge / count slot** — composition; render manually.
- **`Menu.Loading`** placeholder for async-loaded items — defer; spinner inline is fine.
- **Native `<select>` substitute** — that's `<Select>` (Phase 23), different surface.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/22-menu.md`.
2. Append `## Outcome`: API, bundle delta, axe results, decision on `useMenuKeyboard` promotion if Select also wants it.
3. Resume Phase 23 — Select.

---

## Outcome

### Status

✅ **Shipped** (SDS-Agent4) — 2026-05-21.

### What landed

**13-subpart compound** with the canonical Radix-style API plus the unified `trigger` axis:

```tsx
<Menu trigger="click | context | hover" closeOnSelect={true} loop={true} typeAhead={true}>
  <Menu.Trigger asChild>{button}</Menu.Trigger>
  <Menu.Content variant="solid|outline|soft" size="sm|md|lg" color={MenuColor} placement={…}>
    <Menu.Label>…</Menu.Label>
    <Menu.Group>
      <Menu.Item onSelect={…} shortcut="⌘P" leftIcon={…} rightIcon={…} color="neutral|danger" disabled />
    </Menu.Group>
    <Menu.Separator />
    <Menu.CheckboxItem checked={…} onCheckedChange={…} />
    <Menu.RadioGroup value={…} onValueChange={…}>
      <Menu.RadioItem value="…" />
    </Menu.RadioGroup>
    <Menu.Sub>
      <Menu.SubTrigger>…</Menu.SubTrigger>
      <Menu.SubContent>…</Menu.SubContent>
    </Menu.Sub>
  </Menu.Content>
</Menu>
```

- **4 UX patterns** under one component: action menu / multi-select / single-select / hierarchy.
- **3 trigger modes** — `click` (default), `context` (right-click via virtual-element anchoring),
  `hover` (with `openDelay` / `closeDelay`). No separate `<ContextMenu>` or `<DropdownMenu>`.
- **Full W3C APG Menu keyboard**: ArrowDown/Up cycle (with `loop`), Home/End jump, Enter/Space
  commit, Esc closes innermost (escape-stack), Tab closes (platform), ArrowRight opens submenu,
  ArrowLeft closes submenu, type-ahead prefix match with macOS-style "same letter twice cycles"
  behavior, 500ms type-ahead window.
- **3 variants × 7 colors × 3 sizes** on Content — 14 active compound cells (Popover-aligned matrix).
- **Item color axis** restricted to `neutral` / `danger` per the design rule (one canonical
  destructive treatment; consumers can pass `className` for one-offs).

### Engine consumption — no new primitives requested

| Primitive | Used in | Notes |
|---|---|---|
| `usePosition` | `Menu.Content`, `Menu.SubContent` | Re-validated with **virtual-element anchoring** for `trigger="context"` (Floating UI's `setReference(virtualEl)` path). First DS consumer of that path. |
| `<Portal>` | `Menu.Content`, `Menu.SubContent` | Re-validated. |
| `useEscapeStack` | `Menu`, `Menu.Sub` | Re-validated for **nested submenu** unwinding — innermost sub closes first, then root menu. |
| `useOutsideClick` | `Menu` | Re-validated multi-ref pattern (trigger + content). |
| `useControllableState` | `Menu`, `Menu.CheckboxItem`, `Menu.RadioGroup`, `Menu.Sub` | Used 4× in one phase — single consistent shape across compound state. |
| `mergeRefs` | `Menu.Trigger` + 4 item types + 2 contents | **Now used as an engine import in 4+ overlay phases.** No more duplication — engine promotion (done by @SDS-Agent6 in Popover) paid off. |
| `useFocusTrap` | **NOT used** | Menus aren't modals; Tab closes per platform convention. Focus stays on Content; items are keyboard-highlighted (`data-highlighted`), not tab-focused. |
| `useScrollLock` | **NOT used** | Menus coexist with the page; Modal owns scroll lock. |

`MenuPlacement = PopoverPlacement` — single source of truth for the 12-placement vocab.

### QA gate (all green)

| Gate | Result |
|---|---|
| `pnpm --filter @apx-dsponents typecheck` | ✅ Menu clean (the only outstanding errors are in `Toast/`, @SDS-Agent3's lane: casing collision in `Toast.ts`/`toast.ts`, not introduced by this phase). |
| `pnpm --filter @apx-dsponents lint` | ✅ Zero errors, zero warnings. |
| `pnpm --filter @apx-dsponents test` | **975/979 pass** — the 4 failures are all in `Toast.test.tsx` / `Toast.a11y.test.tsx` (same Toast casing issue surfacing at runtime). Menu: **32/32** (23 unit + 9 a11y). Zero new regressions in the 96 overlay tests (Tooltip / Popover / Modal). |
| `pnpm --filter @apx-dsponents build` | ✅ ESM + CJS + DTS. |
| axe-core | ✅ Zero violations across all 21 variant×color cells plus disabled / checkbox / radio / submenu / closed-state combinations. |
| Workspace build | 5/6 ✅ (renderer prerender of `/theming` failed with a pre-existing webpack runtime error unrelated to Menu — page reads `theming.mdx` and doesn't import any Menu surface; flagged for investigation outside this phase). |

### Bundle delta

Measured by removing Menu's exports from `src/index.ts`, rebuilding, and diffing:

```
ESM raw:  349,243 → 397,635   (+48,392 B  ≈ +47.26 KB)
ESM gz:    68,636 →  77,633   (+8,997 B   ≈ +8.78 KB gz)
```

**Target was < 7 KB gz · Result: 8.78 KB gz · ⚠️ +1.78 KB over (+25.4%).**

Accepted deviation, logged with drivers:

1. **13 subparts** (largest compound in the DS — Modal is 6, Popover is 4). Each subpart adds
   its own ARIA wiring + event handlers + theme-slot pass through `useThemedClasses`.
2. **`useMenuKeyboard`** — type-ahead buffer + cycle-on-repeat + prefix matcher + arrow / Home /
   End / Enter / Space / Esc / Tab / ArrowRight / ArrowLeft handling. ≈ 1.2 KB on its own.
3. **Submenu wiring** — `MenuSubContent` duplicates Content's portal + position + animation +
   keyboard setup, plus its own item registry and the `MenuContext.Provider` switch-context
   pattern. ≈ 1.5 KB.
4. **Two icons** from lucide-react (`Check`, `ChevronRight`) — these are tree-shakeable but
   show up in the standalone-Menu count.
5. **14 compound recipe cells** (3 variants × 7 colors, minus solid which is color-neutral).

Reclamation paths (for Select / Combobox onwards):

- **Promote `useMenuKeyboard` → `_shared/useListKeyboard.ts`** when Select (Phase 23) lands; both
  components want arrow / Home / End / type-ahead / Enter/Space. Estimated saving: ~0.6 KB across
  Menu + Select combined (vs each shipping its own copy).
- **Inline `mergeRefs` micro-bundling** — already from engine, no further savings.
- **Subpart consolidation** — `MenuLabel`, `MenuGroup`, `MenuSeparator` could share a single
  generic recipe-driven `<MenuSlot>` if we wanted, but the clarity cost outweighs the ~0.2 KB
  savings.

For reference: Radix DropdownMenu is ~10 KB gz, MUI Menu is ~14 KB. We're in the right ballpark
for a feature-complete menu primitive.

### Deviations from spec

1. **Bundle:** 8.78 KB gz vs <7 KB target. Justified above; documented at top of Outcome.
2. **`forwardRef` from `react`** — engine's `forwardRef` helper requires a `displayName` arg
   constructor pattern that doesn't compose with `Object.assign(Root, { …subparts })` cleanly.
   All other compound overlays (Tooltip, Popover, Modal) use React's `forwardRef` too; Menu
   follows that precedent. Engine helper still worth promoting later for `<Slot>`-style polymorphism.
3. **`useMenuKeyboard` stayed local** — per the second-consumer rule, kept in `src/Menu/` for V1.
   Will promote to `_shared/useListKeyboard.ts` when Select demonstrates the second consumer.
   `__INTERNAL` export hatch (`findPrefixMatch`, `isCycleRepeat`, `TYPEAHEAD_TIMEOUT_MS`) is in
   place for unit-test introspection if needed.
4. **`useFocusTrap` intentionally NOT used** — the W3C APG Menu pattern specifies
   highlight-not-focus + Tab-closes. Adding a trap here would conflict with both. (Plan didn't
   spec it; explicitly noted in Outcome as a design decision rather than an omission.)
5. **Synchronous registry sort via `compareDocumentPosition`** — kept the registry insertion
   order as primary, with a best-effort `compareDocumentPosition` sort as a fallback for
   dynamically-reordered item lists. Same approach Accordion's keyboard hook documented.
6. **Highlight ≠ focus, click-dispatched selection** — `data-highlighted="true"` drives visual +
   screen-reader, and `node.click()` is dispatched on Enter/Space so mouse + keyboard share one
   `onClick` code path. Documented in `Menu/README.mdx` "Notes for consumers".
7. **CheckboxItem + RadioItem force `closeOnSelect=false` internally** — per spec; documented in
   types JSDoc.

### Files (32 total)

```
packages/components/src/Menu/
├── Menu.tsx                       (state owner + escape/outside hooks + item registry)
├── Menu.types.ts                  (full public + internal type surface)
├── Menu.recipe.ts                 (9 recipes — content / item / label / group / separator /
│                                   checkboxIndicator / radioIndicator / shortcut / subTriggerChevron)
├── Menu.motion.ts                 (menuMotion + menuSubMotion with 60ms stagger)
├── MenuContext.ts                 (root + sub + radio-group contexts, throwing helpers)
├── MenuTrigger.tsx                (asChild + click/context/hover modes)
├── MenuContent.tsx                (Portal + usePosition + focus-into-Content + keyboard)
├── MenuItem.tsx                   (role=menuitem)
├── MenuLabel.tsx                  (role=presentation visual heading)
├── MenuGroup.tsx                  (role=group container)
├── MenuSeparator.tsx              (role=separator)
├── MenuCheckboxItem.tsx           (role=menuitemcheckbox, Check icon indicator)
├── MenuRadioGroup.tsx             (single-pick state owner)
├── MenuRadioItem.tsx              (role=menuitemradio, dot indicator)
├── MenuSub.tsx                    (nested state owner + hover-delay timers)
├── MenuSubTrigger.tsx             (chevron, opens submenu on click/hover/right-arrow)
├── MenuSubContent.tsx             (own MenuContext.Provider — items register in sub registry)
├── useMenuKeyboard.ts             (arrows / Home / End / Enter / Space / Esc / Tab / type-ahead)
├── index.ts                       (Object.assign — 13 subparts, biggest compound in DS)
├── meta.ts                        (category Overlays, tags ['menu','dropdown','context-menu','overlay'])
├── README.mdx                     (full docs with 15 ExampleBlock shortcodes)
└── examples/
    ├── Basic.tsx
    ├── WithIcons.tsx
    ├── WithShortcuts.tsx
    ├── ContextMenu.tsx
    ├── HoverMenu.tsx
    ├── DestructiveItem.tsx
    ├── CheckboxItems.tsx
    ├── RadioGroup.tsx
    ├── Submenus.tsx               (also doubles as nested-escape-stack runtime fixture)
    ├── Disabled.tsx
    ├── TypeAhead.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    └── Controlled.tsx

packages/components/__tests__/
├── Menu.test.tsx                  (23 tests — rendering, close behavior, keyboard, checkbox,
│                                   radio, sub, variant/size/color, controlled, context, ref forwarding)
└── Menu.a11y.test.tsx             (9 tests — trigger ARIA, content ARIA, item roles, disabled,
                                    checkbox/radio aria-checked, axe full matrix, axe closed state)

packages/components/src/index.ts   (surgical alphabetical insert between Input and Modal)
```

### Coordination

- No `_shared/` writes.
- No edits to `Popover/`, `Modal/`, `Tooltip/`, or any other component lane.
- No theme-token / tailwind-preset edits.
- No new engine primitives requested. `mergeRefs` consumed as an engine import (4th overlay
  consumer after Tooltip / Popover / Modal — @SDS-Agent6's promotion in Popover paid off here).
- `src/index.ts` insert alphabetically stable between `Input/NumberInput` exports and `Modal`
  exports. No collision with @SDS-Agent6's Drawer or @SDS-Agent3's Toast work.
- Renderer not started / restarted (per Ahmad's rule).

### Next phase unblocked

**Phase 23 Select** is now ready — it depends on Menu for the keyboard navigation pattern + item
recipe. The Select author should evaluate whether `useMenuKeyboard` belongs in
`_shared/useListKeyboard.ts` (recommended yes — Select will be the second consumer that demonstrates
the abstraction).