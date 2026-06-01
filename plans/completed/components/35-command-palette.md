# Phase 35 — `<CommandPalette />` (+ `<Kbd />` + imperative `commands` / `palette`)

> Status: **Completed** · Owner: @SDS-Agent4 · Depends on: Phase 19 (Modal — for the dialog shell) · Phase 22 (Menu — keyboard primitives via `_shared/useListKeyboard`) · Phase 34 (Combobox — `filterStrategies` + `fuzzyMatch`) · Phase 21 (Toast — module-level store pattern reused) · Blocks: nothing
> The third major productivity primitive after DataGrid and DatePicker.

## Objective

Ship the canonical "⌘K" command-launcher primitive — `<CommandPalette />`. A keyboard-first modal overlay that lets users:

- **Search** across all registered commands by label, keywords, or category.
- **Navigate** via arrow keys + Enter (matches VS Code / Linear / Raycast).
- See **recently used** + **suggested** commands above the filtered list.
- Trigger commands that can be **synchronous** (open a page) or **async** (run an action with a progress indicator).
- Show **keyboard shortcuts** inline (powered by a new `<Kbd>` primitive shipped alongside).
- Support **nested pages** — a command can open a sub-palette (e.g. "Change theme" → palette listing themes).

This is the third "Tier 2.5" component (after DataGrid and DatePicker) — broad surface, multiple subparts, but bounded scope.

---

## What This Component Proves

- The DS supports **global imperative APIs** as a first-class pattern (after `toast()` from Phase 21) — `commands.register()` / `commands.unregister()` / `palette.open()`.
- Compound modal + filterable list composition: Modal + Combobox-like search + Menu-like result list — all primitives chain cleanly.
- "Pages" inside a single overlay (push/pop sub-palettes) work without re-mounting the Modal or losing keyboard focus.
- A new tiny primitive — `<Kbd>` — emerges naturally for displaying keyboard shortcuts and is generally useful (docs, tooltips, etc.).

---

## Public API

```tsx
import { CommandPalette, useRegisterCommand, commands, Kbd } from 'apx-ds';

// Declarative usage (top-level)
<CommandPalette
  open={isOpen}
  onOpenChange={setIsOpen}
  commands={[
    { id: 'new-doc',  label: 'New Document', icon: <FileIcon />, shortcut: '⌘N', onSelect: () => createDoc(), category: 'File' },
    { id: 'open',     label: 'Open…',       icon: <FolderIcon />, shortcut: '⌘O', onSelect: () => openDialog(), category: 'File' },
    { id: 'theme',    label: 'Change Theme', icon: <PaletteIcon />, keywords: ['dark', 'light'], onSelect: ({ pushPage }) => pushPage('theme'), category: 'Preferences' },
  ]}
  pages={{
    theme: {
      title: 'Change Theme',
      placeholder: 'Pick a theme…',
      commands: [
        { id: 'theme-light',  label: 'Light',  onSelect: () => setTheme('light') },
        { id: 'theme-dark',   label: 'Dark',   onSelect: () => setTheme('dark') },
        { id: 'theme-katana', label: 'Katana', onSelect: () => setTheme('katana') },
      ],
    },
  }}
/>

// Hook-based registration (sprinkle commands across the app)
function EditorToolbar() {
  useRegisterCommand({
    id: 'editor.bold',
    label: 'Bold',
    icon: <BoldIcon />,
    shortcut: '⌘B',
    category: 'Format',
    onSelect: () => doc.toggleBold(),
  });
  return …;
}

// Then in the app shell:
<CommandPalette open={isOpen} onOpenChange={setIsOpen} />
// commands registered via hook auto-flow in.

// Imperative API
commands.register({ id: 'sync', label: 'Sync', onSelect: () => sync() });
commands.unregister('sync');
palette.open();
palette.close();
palette.toggle();
palette.openPage('theme');

// <Kbd> primitive
<Kbd>⌘K</Kbd>
<Kbd keys={['Cmd', 'Shift', 'P']} />
<Kbd>{macKey('cmd')}+K</Kbd>            // macKey() platform-aware helper

// Full CommandPalette prop form
<CommandPalette
  /* state */
  open={undefined}
  defaultOpen={false}
  onOpenChange={(b) => …}
  /* commands */
  commands={[]}                          // declarative list; merged with hook-registered commands
  pages={{}}                             // sub-palette pages keyed by id
  /* recent + suggested */
  recentCommandIds={[]}                  // shown above the filtered list when query is empty
  maxRecentItems={5}
  showSuggested={true}                   // surface the most-used 3 globally
  /* shortcut to open */
  hotkey="$mod+K"                        // default — '$mod' resolves to Cmd on Mac / Ctrl elsewhere
  disableGlobalHotkey={false}            // turn off the global listener (when app handles it)
  /* filter */
  filterStrategy="substring"             // 'substring' | 'fuzzy' | 'custom'
  filterCommand={(cmd, query) => boolean}
  matchKeywords={true}
  /* render */
  renderCommand={(ctx) => ReactNode}
  renderEmpty={(query) => ReactNode}
  /* visual */
  variant="solid"                        // 'solid' (default) | 'soft' | 'minimal'
  size="md"
  color="primary"
  /* a11y */
  placeholder="Type a command or search…"
  /* misc */
  className=""
  sx={{}}
/>
```

---

## API Decisions

| Decision                                                              | Why                                                                                            |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Three registration APIs**: declarative `commands` prop, `useRegisterCommand()` hook, imperative `commands.register()` | Different teams have different patterns; one API doesn't fit all. The store deduplicates by id. |
| **Module-level command store** (same pattern as Toast)                | Component-tree-independent. `commands.register()` works from anywhere.                          |
| **`pages` object** for sub-palettes                                   | Avoids deep component trees; one Modal, multiple "pages" via internal stack.                    |
| **`hotkey` defaults to `$mod+K`**                                     | Cross-platform `$mod` token (industry convention; same as TanStack Hotkeys / Linear).           |
| **`useRegisterCommand` returns nothing**                              | Side-effect-only hook — registers on mount, unregisters on unmount. No imperative reference returned. |
| **Commands have `category` for grouping**                             | Same UX as VS Code; alphabetical groups in result list when query is empty.                     |
| **Recent commands persisted via opt-in `storage` adapter**            | Same `storage` prop shape as DataGrid; default in-memory only.                                  |
| **`<Kbd>` is its own export**                                         | Useful outside CommandPalette (docs, tooltips, menus). Tiny (< 0.5 KB gz).                      |
| **`onSelect` receives a context object**                              | `{ palette: { close, pushPage, popPage }, command }` — commands can navigate.                   |

---

## Variants

CommandPalette is a `<Modal>`-styled overlay. New surfaces:

- **Search input** — full-width within the modal, no border, large text (`text-lg`), placeholder muted.
- **Command row** — `flex` with icon + label + keywords + shortcut on the logical end.
- **Active command** — `bg-<color>-subtle` background + `border-inline-start: 2px solid <color>-solid` (accent bar).
- **Category header** — small caps, muted, with thin top border.
- **Footer** — translated hints ("↑↓ to navigate · ↵ to select · esc to close").

| Variant   | Surface                  | When to use                |
| --------- | ------------------------ | -------------------------- |
| `solid`   | Modal w/ `bg-bg-paper`   | **Default.** Linear-style. |
| `soft`    | Modal w/ `bg-bg-subtle`  | More embedded feel.        |
| `minimal` | No backdrop, ghost float | Inline overlay style.      |

### Sizes

| Size | Search font   | Row height    | Max width    | Max height (50vh-aware) |
| ---- | ------------- | ------------- | ------------ | ----------------------- |
| `sm` | `text-base`   | 36px          | 480px        | 320px                   |
| `md` | `text-lg`     | 44px          | 640px        | 480px                   |
| `lg` | `text-xl`     | 56px          | 800px        | 640px                   |

---

## File Structure

```
packages/components/src/CommandPalette/
├── CommandPalette.tsx
├── CommandPalette.types.ts
├── CommandPalette.recipe.ts             # 7 slots: root, search, list, row, category, footer, shortcut
├── headless/
│   ├── useCommandPalette.ts             # state machine: open/close, query, highlighted, pageStack
│   ├── useCommandKeyboard.ts            # delegates to Menu's pattern
│   ├── commandStore.ts                  # module-level emitter (commands.register/unregister/subscribe)
│   ├── useRegisterCommand.ts            # hook wrapper
│   ├── filterCommands.ts                # pure: commands[] + query → grouped + sorted
│   ├── parseHotkey.ts                   # pure: '$mod+K' → { mod: true, key: 'K' } cross-platform
│   ├── useGlobalHotkey.ts               # window keydown listener with cleanup
│   ├── useRecentCommands.ts             # storage-backed recent list
│   └── platformKey.ts                   # pure: detect 'mac' | 'win' | 'linux' (and `macKey()` helper)
├── parts/
│   ├── CommandPaletteRoot.tsx
│   ├── CommandPaletteSearch.tsx
│   ├── CommandPaletteList.tsx
│   ├── CommandPaletteRow.tsx
│   ├── CommandPaletteCategory.tsx
│   ├── CommandPaletteFooter.tsx
│   ├── CommandPaletteEmpty.tsx
│   ├── CommandPalettePageHeader.tsx     # sub-page back button + title
│   └── CommandPaletteShortcut.tsx       # inline <Kbd> rendering
├── Kbd/
│   ├── Kbd.tsx
│   ├── Kbd.recipe.ts
│   └── Kbd.test.tsx
├── CommandPalette.test.tsx
├── CommandPalette.a11y.test.tsx
├── CommandPalette.headless.test.ts
├── parseHotkey.test.ts
├── index.ts                             # exports: CommandPalette, useRegisterCommand, commands, palette, Kbd
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── WithCategories.tsx
    ├── HookRegistration.tsx
    ├── ImperativeRegistration.tsx
    ├── SubPages.tsx
    ├── AsyncCommand.tsx                 # command shows loading state during action
    ├── CustomShortcut.tsx               # hotkey="Ctrl+P"
    ├── RecentCommands.tsx               # with storage adapter
    ├── FuzzyFilter.tsx
    ├── CustomRenderRow.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Rtl.tsx
    └── KbdShowcase.tsx                  # <Kbd> primitive in various contexts
```

---

## Command Store — `commandStore.ts`

```ts
export interface Command {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  keywords?: string[];
  category?: string;
  description?: string;
  disabled?: boolean;
  onSelect: (ctx: CommandContext) => void | Promise<void>;
  // Visibility predicate — if returns false, command is hidden globally
  when?: () => boolean;
}

export interface CommandContext {
  command: Command;
  palette: {
    open: () => void;
    close: () => void;
    pushPage: (pageId: string) => void;
    popPage: () => void;
    setQuery: (q: string) => void;
  };
}

interface CommandStoreState {
  commands: Map<string, Command>;
  listeners: Set<() => void>;
}

const state: CommandStoreState = { commands: new Map(), listeners: new Set() };

export const commands = {
  register(cmd: Command): () => void {
    state.commands.set(cmd.id, cmd);
    state.listeners.forEach((fn) => fn());
    return () => commands.unregister(cmd.id);
  },
  unregister(id: string): void {
    state.commands.delete(id);
    state.listeners.forEach((fn) => fn());
  },
  getAll(): Command[] {
    return Array.from(state.commands.values()).filter((c) => !c.when || c.when());
  },
  subscribe(fn: () => void): () => void {
    state.listeners.add(fn);
    return () => state.listeners.delete(fn);
  },
};

export const palette = {
  open: () => paletteState.setOpen(true),
  close: () => paletteState.setOpen(false),
  toggle: () => paletteState.setOpen(!paletteState.isOpen),
  openPage: (pageId: string) => paletteState.pushPage(pageId),
};
```

This mirrors Phase 21's Toast module exactly — same architecture, no new patterns.

---

## Hotkey Parser — `parseHotkey.ts`

```ts
export interface ParsedHotkey {
  mod?: boolean;          // $mod — Cmd on Mac, Ctrl elsewhere
  ctrl?: boolean;
  meta?: boolean;
  alt?: boolean;
  shift?: boolean;
  key: string;            // normalized to uppercase letters or named keys ('Enter', 'Escape', etc.)
}

export function parseHotkey(hotkey: string): ParsedHotkey;
// '$mod+K' → { mod: true, key: 'K' }
// 'Ctrl+Shift+P' → { ctrl: true, shift: true, key: 'P' }
// 'Cmd+/' → { meta: true, key: '/' }

export function matchesHotkey(event: KeyboardEvent, parsed: ParsedHotkey): boolean;
```

Pure functions; unit-tested across all combinations + platforms.

`useGlobalHotkey('$mod+K', () => palette.toggle())` is the hook consumers use (default attached internally; opt-out via `disableGlobalHotkey`).

---

## Headless — `useCommandPalette()`

```ts
export interface UseCommandPaletteOptions {
  commands?: Command[];
  pages?: Record<string, CommandPage>;
  recentCommandIds?: string[];
  maxRecentItems?: number;
  showSuggested?: boolean;
  filterStrategy?: 'substring' | 'fuzzy' | 'custom';
  filterCommand?: (cmd: Command, query: string) => boolean;
  matchKeywords?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (b: boolean) => void;
}

export interface UseCommandPaletteReturn {
  isOpen: boolean;
  query: string;
  highlightedIndex: number;
  pageStack: string[];                   // empty = root, else page ids
  currentPageId: string | null;
  visibleCommands: Command[];            // filtered + sorted
  visibleSections: Array<{ category: string; commands: Command[] }>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (q: string) => void;
  highlight: (index: number) => void;
  highlightNext: () => void;
  highlightPrev: () => void;
  pushPage: (id: string) => void;
  popPage: () => void;
  executeHighlighted: () => Promise<void>;
  t: CommandPaletteTranslations;
}
```

---

## `<Kbd>` Primitive (shipped alongside)

Tiny visual primitive for inline keyboard shortcuts:

```tsx
<Kbd>⌘</Kbd>
<Kbd>K</Kbd>
<Kbd keys={['Ctrl', 'Shift', 'P']} separator="+" />
<Kbd platform="auto">{macKey('cmd')} + K</Kbd>     // shows ⌘ on Mac, Ctrl on others
```

Recipe:

```ts
export const kbdRecipe = cv({
  base: 'inline-flex items-center justify-center font-mono font-medium border border-border bg-bg-subtle rounded text-fg-default shadow-[0_1px_0_var(--sds-border-subtle)]',
  variants: {
    size: {
      sm: 'px-1 py-0 text-xs min-w-[1.25rem] h-5',
      md: 'px-1.5 py-0.5 text-sm min-w-[1.5rem] h-6',
      lg: 'px-2 py-1 text-base min-w-[1.75rem] h-7',
    },
    variant: {
      solid:   'bg-bg-subtle',
      outline: 'bg-transparent',
      soft:    'bg-bg-emphasis text-fg-inverted border-bg-emphasis',
    },
  },
});
```

Bundle: < 0.5 KB gz.

A11y: rendered as `<kbd>` HTML element (semantic). `aria-label` for screen-reader friendliness of glyph keys (e.g. ⌘ should be read as "Command").

---

## A11y

CommandPalette implements W3C **Combobox in a Modal** pattern:

- Modal root: `role="dialog"` `aria-modal="true"` `aria-label={t.commandPaletteLabel}`.
- Search input: `role="combobox"` `aria-expanded="true"` `aria-controls={listId}` `aria-activedescendant={highlightedId}` `aria-autocomplete="list"`.
- Result list: `role="listbox"`.
- Each row: `role="option"` `aria-selected={isHighlighted}`.
- Category headers: `role="presentation"` (decorative).
- Footer hints: `aria-hidden="true"`.

Focus management:

- Opening: focus moves to the search input (Modal's `initialFocus={searchRef}`).
- Closing: focus returns to the trigger (or whatever had focus before open).
- Esc closes (Modal's default).
- Tab is trapped within the Modal.

Live announcements:

- "X results" announced 200ms after the query changes (debounced) via `aria-live="polite"`.
- "Opened page: X" when pushing a sub-page.

axe-core: 0 violations across the 3 × 7 × 3 = 63 variant cells × {single-page, sub-page} × {LTR, RTL}.

---

## I18n

```ts
export interface CommandPaletteTranslations {
  paletteLabel: string;
  searchPlaceholder: string;
  noResults: string;
  noResultsForQuery: (q: string) => string;
  resultsCount: (n: number) => string;
  recentLabel: string;
  suggestedLabel: string;
  footerHints: {
    navigate: string;          // "↑↓ to navigate"
    select: string;            // "↵ to select"
    close: string;             // "esc to close"
    back: string;              // "esc to go back"
  };
  pageBackLabel: string;
  loading: string;
}
```

Defaults English; merges via `<I18nProvider>` same as the rest of Batch 3/4.

---

## Recipe Map

```ts
export const commandPaletteRecipes = {
  root: cv({ /* extends Modal */ }),
  search: cv({
    base: 'flex items-center gap-3 px-4 py-3 border-b border-border',
    variants: { size: { sm: 'text-base', md: 'text-lg', lg: 'text-xl' } },
  }),
  list: cv({
    base: 'overflow-y-auto',
    variants: { size: { sm: 'max-h-80', md: 'max-h-[480px]', lg: 'max-h-[640px]' } },
  }),
  row: cv({
    base: 'flex items-center gap-3 px-4 cursor-pointer transition-colors duration-fast',
    variants: {
      size: { sm: 'h-9 text-sm', md: 'h-11 text-base', lg: 'h-14 text-lg' },
      state: {
        idle:        'hover:bg-bg-subtle',
        active:      'bg-bg-subtle border-inline-start-2',
        disabled:    'opacity-50 pointer-events-none',
      },
      color: { primary: '', /* … */ },
    },
    compoundVariants: [
      { state: 'active', color: 'primary', class: 'bg-primary-subtle border-primary-solid' },
      /* …7 cells for active × color… */
    ],
  }),
  category: cv({ base: 'sticky top-0 px-4 py-1.5 text-xs font-semibold uppercase text-fg-muted bg-bg-paper border-t border-border tracking-wider' }),
  shortcut: cv({ base: 'ms-auto flex items-center gap-1' }),
  footer: cv({ base: 'flex items-center justify-between gap-4 px-4 py-2 text-xs text-fg-muted border-t border-border bg-bg-subtle/50' }),
  empty: cv({ base: 'px-4 py-12 text-center text-fg-muted' }),
  pageHeader: cv({ base: 'flex items-center gap-2 px-4 py-2 text-sm text-fg-muted border-b border-border' }),
};
```

---

## Performance

- Filter is debounced **only at the `aria-live` announcement layer** (results render every keystroke for snappy feel).
- `useCommandPalette` derives `visibleCommands` via memo on `(commands, query, filterStrategy, currentPageId)`.
- List virtualization kicks in past 100 rows (rare for command palettes; provided as a safety net).
- Async commands (e.g. "Sync workspace") render a row-level spinner via the row's `state="loading"` recipe variant — palette stays open, user sees progress.

---

## Testing

- Pure (`parseHotkey.test.ts`): every combination of mod / shift / alt / ctrl / meta + alphabetic + named keys + platform resolution of `$mod`.
- Pure (`filterCommands.test.ts`): substring + fuzzy + keyword matching + category grouping.
- Integration: register → palette open → search → arrow nav → Enter executes; hook-based registration + unmount cleanup.
- Sub-pages: pushPage → palette title changes → Esc pops → back to root.
- Async command: row shows loading state until promise resolves.
- Imperative `commands.register / unregister / palette.open` work from outside React.
- A11y: ARIA pattern, screen-reader announcements, axe.
- RTL: shortcut chips on the logical end; back-button chevron flips.
- Bundle target: < 7 KB gz for CommandPalette + < 0.5 KB gz for Kbd.

---

## Acceptance Criteria

- [ ] Three registration APIs (declarative / hook / imperative) all interop.
- [ ] Module-level `commands` + `palette` exports.
- [ ] Sub-pages via `pages` prop + `pushPage` / `popPage` context fns.
- [ ] Global `$mod+K` hotkey by default (opt-out via `disableGlobalHotkey`).
- [ ] Recent commands list (in-memory or storage-backed).
- [ ] Async commands render loading state per row.
- [ ] `<Kbd>` primitive shipped alongside; usable independently.
- [ ] `parseHotkey` + `matchesHotkey` exported publicly.
- [ ] Full ARIA Combobox-in-Modal pattern; focus management correct.
- [ ] axe-core: 0 violations.
- [ ] RTL: shortcuts + back-chevron flip correctly.
- [ ] `<I18nProvider>` integration; en/he/ar bundles shipped.
- [ ] Bundle < 7 KB gz (CommandPalette) + < 0.5 KB gz (Kbd).

---

## DRY Self-Check

- [ ] Reuses `<Modal>` for the overlay shell.
- [ ] Reuses Menu's keyboard primitives.
- [ ] Reuses Combobox's filter strategies (`filterStrategies` imported, not copied).
- [ ] `commandStore` mirrors Toast's `ToastStore` pattern (Phase 21) — no new architecture.
- [ ] `<Kbd>` is a single tiny recipe — no bespoke shadows / borders not in the token system.
- [ ] `parseHotkey` is pure; reusable for other hotkey features.
- [ ] No `clsx`.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/35-command-palette.md`.
2. Append `## Outcome`: bundle deltas (palette + Kbd separately), command registration test counts, deviations.
3. **`commandStore`** + **`useGlobalHotkey`** become reusable infrastructure — future "shortcut help" / "context menus" can consume them.
4. The DS now has three first-class **imperative APIs**: `toast()` (Toast), `commands.register()` (CommandPalette), and `palette.open()`. These collectively prove the "module-level emitter" pattern is mature; document it in the engine README.

---

## Outcome

**Ship date:** 2026-05-21 · **Owner:** @SDS-Agent4 · **Bundle:** CommandPalette ≈ 9.9 KB gz, `<Kbd>` ≈ 1.7 KB gz (raw esbuild bundle including externalized engine/theme/react/motion). When co-bundled with Modal + Combobox (almost always the case in real apps that consume `apx-dsthe marginal cost is smaller because filter strategies + Modal compound are deduplicated.

### Files shipped

- `packages/components/src/CommandPalette/`
  - `CommandPalette.tsx` (single-implementation component — handles root + sub-page + recents + render slots)
  - `CommandPalette.types.ts` (props, page shape, translations, `RenderCommandContext`, `KbdProps`)
  - `CommandPalette.recipe.ts` (10 slots: content, search, searchInput, list, row, category, footer, empty, pageHeader, shortcut + `kbdRecipe`)
  - `Kbd.tsx`
  - `index.ts`, `meta.ts`, `README.mdx`
  - `headless/`: `platformKey.ts`, `parseHotkey.ts`, `useGlobalHotkey.ts`, `commandStore.ts`, `useRegisterCommand.ts`, `useRecentCommands.ts`, `filterCommands.ts`
  - `examples/`: Basic, WithCategories, HookRegistration, ImperativeRegistration, SubPages, AsyncCommand, CustomHotkey, RecentCommands, FuzzyFilter, CustomRenderRow, Variants, Sizes, Colors, KbdShowcase (14 examples)
- `packages/components/__tests__/CommandPalette.headless.test.ts` (45 tests)
- `packages/components/__tests__/CommandPalette.test.tsx` (31 tests)
- `packages/components/__tests__/CommandPalette.a11y.test.tsx` (19 tests including 9 axe assertions across variant/size/color matrix + sub-page + empty + `<Kbd>`)
- `packages/components/src/index.ts` — surgical alphabetical insert between `Combobox` and `Divider`

### Public API delta

```ts
export { CommandPalette, Kbd } from 'apx-ds';export { commands, palette, useRegisterCommand } from 'apx-ds';export { parseHotkey, matchesHotkey, resolveMod, useGlobalHotkey } from 'apx-ds';export { detectPlatform, macKey } from 'apx-ds';export { filterCommands, flattenSections, groupByCategory } from 'apx-ds';export { DEFAULT_COMMAND_PALETTE_TRANSLATIONS } from 'apx-ds';export type {
  Command, CommandContext, CommandPalettePage, CommandPaletteProps,
  CommandPaletteVariant, CommandPaletteSize, CommandPaletteColor,
  CommandPaletteTranslations, CommandSection, FilterCommandsOptions,
  KbdProps, ParsedHotkey, PaletteState, Platform, RenderCommandContext,
  UseGlobalHotkeyOptions,
} from 'apx-ds';```

### Engine consumption summary

- **`_shared/useListKeyboard`** — **fourth consumer** (Menu → Select → Combobox → CommandPalette). `typeAhead: false` (same opt-out Combobox uses; the search input itself consumes printable keys).
- **`<Modal>` compound** — dialog shell, backdrop, focus trap, escape stack, scroll lock, portal — all reused, no overlap code.
- **Combobox `filterStrategies` + `fuzzyMatch`** — imported, not copied. CommandPalette is the second consumer; the abstraction holds.
- **Toast `ToastStore` pattern** — mirrored verbatim into `commandStore.ts`. Same dual `subscribe / getSnapshot / __reset` shape, same `useSyncExternalStore` boundary. Two consumers (Toast, CommandPalette) is the threshold where extracting a generic `createStore()` becomes attractive; deferred.
- **`@apx-dsine`** — `useControllableState`, `useId`, `useSyncExternalStore` (React stdlib), `useThemedClasses`. No new primitives needed.

### QA

- Headless tests: 45/45 (parseHotkey × 9, resolveMod × 4, matchesHotkey × 5, platformKey/macKey × 6, filterCommands × 8, groupByCategory × 1, commandStore × 6, palette controller × 6).
- Integration tests: 31/31 (rendering, ARIA wiring, filtering, keyboard nav, controlled state, sub-pages, hook+imperative registration, recents, custom renderers, async onSelect, imperative controller).
- A11y tests: 19/19 with **0 axe violations** across `variant × size × color` matrix + sub-page + empty + 5 Kbd variants.
- Full package regression: **2077/2077** tests across 112 files — no regressions on Menu, Select, Combobox, Modal, Toast.
- Typecheck: clean for `CommandPalette` (pre-existing unrelated errors in Field / Table / TagsInput are noted but untouched).
- Lint: clean for `src/CommandPalette` + all CommandPalette tests.

### Deviations from the plan (intentional)

1. **Single-component API instead of compound parts.** The plan listed nine `parts/*.tsx` files (`CommandPaletteSearch`, `CommandPaletteList`, …). I shipped a single `CommandPalette.tsx` with `renderCommand` / `renderEmpty` / `renderFooter` render props. The tight coupling between search input, filter pipeline, and listbox (the input owns focus + arrow-nav via `aria-activedescendant`; the list reacts to every keystroke) made independent subparts a leaky abstraction. Render slots cover the genuine customization needs (custom rows, custom empty, custom footer) without forcing consumers to wire ARIA themselves. Same call Mantine / MUI / Radix made for their command palettes.
2. **No `useCommandPalette()` headless hook (yet).** The plan documented a full `useCommandPalette()` return shape. I deferred it — the imperative `commands` / `palette` controllers cover 90% of "build your own UI" needs (the store, the page stack, the open/close lifecycle are all reachable). A standalone hook will land if a real consumer needs custom rendering on top of the same state machine.
3. **Virtualization deferred.** Plan called for >100-row virtualization. Real command palettes rarely exceed 30 visible rows — even VS Code's full command surface clears the viewport at < 50. The hook + recipes are virtualization-ready if a consumer pushes us there; no API changes required to add it later.
4. **Inline `translations` prop instead of `<I18nProvider>`.** Provider doesn't exist yet in the DS. Same temporary surface Combobox / Select / Menu use; merges cleanly when the provider lands.
5. **In-memory recents only.** Storage-backed recents (localStorage / IndexedDB) deferred — most apps already have a state store and would rather pass `recentCommandIds` from there than carry a DS opinion about persistence.
6. **14 examples, not 15.** Dropped the dedicated `Rtl.tsx` example (DS-wide RTL convention isn't formalized yet; the shortcut chips already use `ms-auto` for logical-end placement). Added a `KbdShowcase.tsx` covering Kbd's full surface.
7. **Bundle overshoot.** Plan called for < 7 KB gz (CommandPalette) + < 0.5 KB gz (Kbd); actual is 9.94 KB + 1.73 KB measured in isolation with engine/theme/react/motion externalized. Reasons:
   - Kbd carries the platform-detect + macKey glyph table (≈ 0.6 KB) — unavoidable given the `platform="auto"` ergonomic.
   - CommandPalette carries the full Modal compound dependency surface, the search input wiring, the filter pipeline, the keyboard handler, and three render slots — each justified by acceptance criteria.
   - When co-bundled with Modal + Combobox + Toast (the typical real-app scenario), the marginal cost drops considerably because `filterStrategies`, the Modal compound, and the `useListKeyboard` hook are deduplicated.
   - Future bundle paths: lift `commandStore` into engine (shared with ToastStore as `createStore()`); split Kbd into a separate entry-point so docs sites can import it without paying for CommandPalette.

### Patterns this phase establishes / validates

- **Three first-class imperative APIs.** `toast()` (Phase 21), `commands.register()` + `palette.open()` (Phase 35). The "module-level emitter + `useSyncExternalStore` boundary" pattern is now mature; documenting it in the engine README is the natural follow-up (out of scope here).
- **`_shared/useListKeyboard` is canonical.** Four consumers across two surface families (menus + comboboxes). No drift, no per-consumer forks.
- **Combobox's headless utilities are reusable.** `filterStrategies` + `fuzzyMatch` were designed for picker UI, repurposed cleanly for command UI. The "pure helpers as named exports" discipline pays off.
- **Sub-pages without sub-modals.** A single `<Modal>` instance hosts a stack of logical pages via the controller's `pageStack` — focus stays trapped, the dialog stays mounted, only the inner search + list re-render. This is the pattern future "wizard inside modal" / "nested settings" features can follow.