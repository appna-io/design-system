# Phase 46 — `<TreeView />`

> Status: **Completed** · **Tier 2.5** (complex keyboard pattern) · Depends on: Phase 14 (Icon — deferred), Phase 27 (I18nProvider — deferred), Phase 9 (Checkbox — multi-select mode)
> Hierarchical tree navigation with full W3C TreeView keyboard pattern, virtualization-ready, selection + drag-and-drop slots.

## Objective

Ship the **`<TreeView />`** primitive — the canonical hierarchical-data display.

Use cases:

- File / folder explorers (VS Code, Finder).
- Category / taxonomy pickers.
- Org charts / reporting hierarchies.
- JSON / DOM inspectors.
- Outline navigation (table of contents).

Tree is one of the most a11y-sensitive components in any DS. Phase 46 implements the full **W3C ARIA TreeView pattern** with type-to-search, expand/collapse, single + multi-select, controlled expanded/selected state, and virtualization opt-in for large trees (10k+ nodes).

---

## Public API

```tsx
import { TreeView } from 'apx-ds';

// Static data API
<TreeView
  data={[
    { id: 'src', label: 'src', children: [
      { id: 'src/components', label: 'components', children: [
        { id: 'src/components/Button.tsx', label: 'Button.tsx' },
        { id: 'src/components/Input.tsx', label: 'Input.tsx' },
      ]},
      { id: 'src/index.ts', label: 'index.ts' },
    ]},
    { id: 'package.json', label: 'package.json' },
  ]}
  onSelect={(id) => openFile(id)}
/>

// Controlled expanded + selected
<TreeView
  data={data}
  expanded={expandedIds}
  onExpandedChange={setExpandedIds}
  selected={selectedId}
  onSelect={setSelectedId}
/>

// Multi-select with checkboxes
<TreeView
  data={data}
  selectionMode="multiple"
  selected={selectedIds}
  onSelectedChange={setSelectedIds}
  showCheckboxes
/>

// Custom node rendering
<TreeView
  data={data}
  renderNode={(node, state) => (
    <span>
      {state.expanded ? '📂' : '📁'} {node.label}
      {node.meta?.modified && <Badge>•</Badge>}
    </span>
  )}
/>

// Async loading (lazy children)
<TreeView
  data={rootNodes}
  loadChildren={async (node) => fetchChildren(node.id)}
  onSelect={openFile}
/>

// Compound API (rare; for fully custom node trees not driven by data array)
<TreeView selectionMode="single">
  <TreeView.Node id="src" label="src" defaultExpanded>
    <TreeView.Node id="src/components" label="components">
      <TreeView.Node id="src/components/Button.tsx" label="Button.tsx" />
    </TreeView.Node>
  </TreeView.Node>
  <TreeView.Node id="package.json" label="package.json" />
</TreeView>

// Virtualization (10k+ nodes)
<TreeView data={huge} virtualized estimatedRowHeight={28} />

// Drag-and-drop slot (consumer-provided handler)
<TreeView
  data={data}
  dragAndDrop={{
    onMove: (sourceId, targetId, position) => moveNode(sourceId, targetId, position),
    isAllowed: (sourceId, targetId) => sourceId !== targetId,
  }}
/>

// Full prop form
<TreeView
  /* data */
  data={[]}                          // TreeNode[]
  /* OR */ children                  // compound

  /* selection */
  selectionMode="single"             // 'none' | 'single' | 'multiple'
  selected                           // string | string[] (controlled)
  defaultSelected                    // initial value
  onSelect                          // (id) => void  — single
  onSelectedChange                  // (ids: string[]) => void — multiple
  showCheckboxes={false}            // boolean — for multi-select; renders <Checkbox>

  /* expansion */
  expanded={[]}                      // string[] — controlled expanded ids
  defaultExpanded={[]}              // initial
  onExpandedChange                  // (ids) => void

  /* async */
  loadChildren                      // (node) => Promise<TreeNode[]>

  /* rendering */
  renderNode                        // (node, state) => ReactNode
  defaultIcon                       // ReactNode — for collapsed branch
  expandedIcon                      // ReactNode — for expanded branch
  leafIcon                          // ReactNode — for leaves

  /* virtualization */
  virtualized={false}
  estimatedRowHeight={28}

  /* drag-and-drop */
  dragAndDrop                       // { onMove, isAllowed? }

  /* misc */
  ariaLabel="File explorer"         // string | required
  size="md"                         // 'sm' | 'md' | 'lg'
  indent={20}                       // px per level
  showLines={false}                 // boolean — connector lines between siblings (VS Code style)

  className=""
  style={{}}
  ref={…}
/>

interface TreeNode {
  id: string;
  label: ReactNode;
  children?: TreeNode[];            // omit + provide loadChildren for lazy
  hasChildren?: boolean;            // hint for async; show expand arrow before children loaded
  icon?: ReactNode;
  disabled?: boolean;
  selectable?: boolean;             // default true
  meta?: Record<string, unknown>;   // consumer payload
}
```

---

## API Decisions

| Decision                                                                | Why                                                                                                            |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Data-array API by default; compound is escape hatch**                | Tree data is almost always a recursive data structure. Forcing JSX nesting for 1000 files is impractical.       |
| **W3C TreeView keyboard pattern (full)**                              | Required for a11y; covers arrow/Home/End/typeahead/expand-all/collapse-all/type-to-search.                     |
| **Single vs multi-select are separate prop shapes**                   | Single: `selected: string`. Multi: `selected: string[]`. Avoids union-type ergonomic pain.                      |
| **`showCheckboxes` is opt-in for multi-select**                       | Some multi-select trees use only highlight (no checkbox); some need checkboxes for clarity. Consumer's call.    |
| **`loadChildren` returns promise**                                    | Lazy load common pattern (file systems, large taxonomies). Children replace the loading sentinel inline.        |
| **`virtualized` is opt-in**                                          | Most trees are small; virtualization adds bundle weight. Off by default.                                       |
| **Drag-and-drop is a slot**                                           | Tree provides DOM events + reorder hints; consumer's `onMove` handles actual data mutation. We don't ship our own DnD library; we use HTML5 DnD or `@dnd-kit` if consumer brings it. Phase 46 uses native HTML5 to avoid the dep. |
| **Indent guides (`showLines`) are opt-in**                            | VS-Code style is common; macOS Finder doesn't have them.                                                       |
| **Disabled nodes**                                                    | Tab-skipped, visually muted, can't be selected. `disabled` flag on the node.                                    |
| **`selectable: false`**                                              | For "category headers" — nodes that group children but aren't themselves selectable.                            |

---

## File Structure

```
packages/components/src/TreeView/
├── TreeView.tsx
├── TreeView.Node.tsx                       # internal renderer; also exported for compound API
├── TreeView.context.ts                     # { selectionMode, expanded, selected, focusedId, onSelect, onExpand, …}
├── TreeView.types.ts
├── TreeView.recipe.ts
├── useTreeKeyboard.ts                      # full W3C TreeView pattern
├── flattenTree.ts                          # pure — TreeNode[] → visible-rows[] (post-expansion)
├── findTreeNode.ts                         # pure — recursive lookup by id
├── nextFocusableId.ts                      # pure — given direction + state, return next focus target
├── useTypeahead.ts                         # type-to-search aggregator (200ms timeout)
├── TreeView.test.tsx
├── TreeView.keyboard.test.tsx
├── TreeView.a11y.test.tsx
├── TreeView.async.test.tsx
├── TreeView.virtual.test.tsx
├── flattenTree.test.ts
├── nextFocusableId.test.ts
├── useTypeahead.test.ts
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── BasicFileExplorer.tsx
    ├── ControlledExpansion.tsx
    ├── SingleSelect.tsx
    ├── MultiSelect.tsx
    ├── MultiSelectCheckboxes.tsx
    ├── AsyncLoad.tsx
    ├── CustomRender.tsx
    ├── WithIcons.tsx
    ├── ShowLines.tsx
    ├── DisabledNodes.tsx
    ├── NonSelectableHeaders.tsx
    ├── Virtualized.tsx                     # 10k nodes
    ├── DragAndDrop.tsx
    ├── KeyboardDemo.tsx
    └── Compound.tsx
```

---

## Keyboard pattern (W3C TreeView)

| Key                | Action                                                                            |
| ------------------ | --------------------------------------------------------------------------------- |
| `ArrowDown`        | Move focus to next visible node.                                                  |
| `ArrowUp`          | Move focus to previous visible node.                                              |
| `ArrowRight` (LTR) | If branch + collapsed → expand. If branch + expanded → focus first child. If leaf → no-op. |
| `ArrowLeft` (LTR)  | If branch + expanded → collapse. If branch + collapsed (or leaf) → focus parent.   |
| `Home`             | Focus first node.                                                                 |
| `End`              | Focus last visible node.                                                          |
| `Enter` / `Space`  | Selection mode = single → select; multi → toggle. On branch → also expand/collapse if no selection. |
| `*`                | Expand all siblings of the focused node.                                          |
| `a..z`, `0..9`     | Type-to-search: aggregate over 500ms, jump to next visible node whose label starts with the buffer (case-insensitive). |
| `Ctrl+A`           | Multi-select only → select all visible nodes.                                     |

RTL: ArrowLeft / ArrowRight semantics swap (browser-native via DS direction context).

---

## A11y

- **Root**: `<ul role="tree" aria-label={ariaLabel} aria-multiselectable={selectionMode === 'multiple'}>`.
- **Each node**: `<li role="treeitem" aria-level={depth} aria-posinset={index+1} aria-setsize={siblings} aria-expanded={hasChildren ? expanded : undefined} aria-selected={selected} aria-disabled={disabled} tabIndex={isFocused ? 0 : -1}>`.
- **Children container**: `<ul role="group">`.
- **Focus management**: a single roving tabindex; the tree as a whole occupies one tab stop.
- When `showCheckboxes`, the checkbox sits *inside* the treeitem (not a focusable child) — clicking the checkbox or pressing Space toggles selection; arrow keys still move focus normally.
- **`aria-busy="true"`** during `loadChildren` promises.
- axe-core: 0 violations across all modes / selection / multi / disabled / async.

---

## Async loading flow

```
1. Node has hasChildren=true OR loadChildren is provided + node has no children yet.
2. User expands → fires onExpandedChange.
3. Tree detects missing children, sets node.loading=true, renders <Spinner> sentinel.
4. Calls loadChildren(node). On resolve, sets children + clears loading.
5. On error, replaces sentinel with a small error chip + retry button.
```

A single `useLoadChildren` hook tracks in-flight loads (per node id), aborts on unmount, dedupes concurrent requests for the same id.

---

## Virtualization

When `virtualized=true`:

- Renders only visible rows + small overscan via `@tanstack/react-virtual` (already used by DataGrid Phase 27).
- `flattenTree` produces a stable flat list of visible nodes after expansion; virtualizer consumes it.
- Row height: estimated via `estimatedRowHeight` prop; dynamic via `measureElement` if `renderNode` returns variable-height content.
- Focus management retains the focused id even when off-screen; scrolls into view on arrow nav.

Off by default — bundle stays light for typical < 200-node trees.

---

## Drag-and-drop (HTML5 native)

```ts
interface DragAndDropConfig {
  onMove: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  isAllowed?: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => boolean;
}
```

- Each `treeitem` is `draggable={true}` when DnD is enabled.
- On `dragover`, the tree calculates the position (top-third = before, middle = inside, bottom-third = after) and renders a visual cursor.
- On `drop`, `onMove(source, target, position)` fires. Consumer mutates data.
- Keyboard accessibility: Phase 46 ships **keyboard drag mode** (Space toggles "pick up", Arrow keys move, Enter drops, Esc cancels) — required for WCAG 2.2 Drag-Move.

---

## i18n

When wrapped in `<I18nProvider>`:

| Key                                | Default (en)              | Notes                              |
| ---------------------------------- | ------------------------- | ---------------------------------- |
| `tree.expand`                      | "Expand"                  | aria-label on expand chevron        |
| `tree.collapse`                    | "Collapse"                | aria-label on collapse chevron      |
| `tree.loading`                     | "Loading..."              | async sentinel                      |
| `tree.loadError`                   | "Failed to load"           |                                     |
| `tree.retry`                       | "Retry"                   |                                     |
| `tree.dragPickUp`                  | "Press space to pick up"   | keyboard DnD hint                   |
| `tree.dragDrop`                    | "Press enter to drop"      |                                     |

Bundles: en / he / ar.

---

## RTL

- Indent direction (`padding-inline-start` per depth) flips automatically via CSS logical properties.
- ArrowLeft / ArrowRight semantics swap — handled via `useTreeKeyboard` reading `dir` from engine context.
- Connector lines (`showLines`) drawn with `border-inline-start` so they appear on the logical-start edge.
- Chevron icon: rotates 180° in RTL (chevron-right collapsed becomes chevron-left visually).

---

## Performance

- `flattenTree` memoized via `useMemo` keyed on data identity + expanded set.
- `findTreeNode` does single-pass DFS; O(N) but rare (only during DnD + programmatic API).
- Virtualization keeps DOM size constant for huge trees.
- Type-to-search aggregates over the visible flat list (O(visible) per keystroke).
- Bundle target: **< 6 KB gz** without virtualization; +3 KB with `@tanstack/react-virtual`.

---

## Testing

- Renders correct ARIA roles + attributes for nodes at each depth.
- Expansion / collapse via click + keyboard updates state + `aria-expanded`.
- Single-select: clicking a node sets `selected`; arrow navigation moves focus without selecting (per W3C: arrow nav doesn't auto-select in single-mode).
- Multi-select: Space toggles selection; Shift+Click selects range; Ctrl/Meta+Click toggles.
- `loadChildren` resolves; children appear; spinner shown during.
- Failed `loadChildren`: retry button renders + works.
- Disabled nodes can't be focused via arrow keys.
- Non-selectable nodes don't fire `onSelect`.
- Type-to-search jumps to matching node after typing.
- `*` expands all siblings.
- Drag-and-drop fires `onMove` with correct positions.
- Keyboard DnD (Space + arrows + Enter) works.
- Virtualization: only visible rows rendered (count assertion).
- RTL: arrow-key semantics flip; indent on the right.
- i18n: aria-labels switch per locale.
- axe-core: 0 violations across all modes.

---

## Acceptance Criteria

- [ ] `<TreeView>` + `<TreeView.Node>` exported.
- [ ] Full W3C TreeView keyboard pattern implemented.
- [ ] Single + multi-select modes, with optional checkboxes.
- [ ] Async `loadChildren` with loading + error states.
- [ ] Type-to-search.
- [ ] Optional virtualization (opt-in via `virtualized`).
- [ ] Drag-and-drop slot with keyboard accessibility (WCAG 2.2 Drag-Move).
- [ ] i18n bundle en / he / ar.
- [ ] RTL correct.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 6 KB gz (no virtualization) / < 9 KB gz (with).

---

## DRY Self-Check

- [ ] Reuses Checkbox, Icon, Spinner, useControllableState, `<I18nProvider>`.
- [ ] `flattenTree` / `findTreeNode` / `nextFocusableId` / `useTypeahead` are pure + unit-tested.
- [ ] Virtualization via `@tanstack/react-virtual` — shared with DataGrid (Phase 27) and Combobox (Phase 34).
- [ ] `useTreeKeyboard` stays tree-local (no second consumer yet).
- [ ] DnD uses native HTML5; no library dep.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/46-tree-view.md`.
2. Outcome notes: bundle delta, virtualization perf measurements on a 10k-node demo tree.
3. Document the three canonical TreeView patterns: file explorer, category picker, JSON inspector.

---

## Outcome

**Shipped — SDS-Agent3**, 2026-05-21.

### Files

```
packages/components/src/TreeView/
├── TreeView.tsx                    # root + Node renderer + compound API + keyboard handler
├── TreeView.types.ts               # public types + DEFAULT_TREE_TRANSLATIONS
├── TreeView.recipe.ts              # cv recipes (root / item / chevron / icon / label / async / error)
├── TreeView.context.ts             # TreeViewContext + useTreeViewContext()
├── treeHelpers.ts                  # pure helpers: flattenTree / findTreeNode / nextFocusableId / findByPrefix / ancestorIds / siblingIds
├── index.ts                        # public exports
├── meta.ts                         # component metadata (not re-exported)
├── README.mdx                      # usage / API / keyboard / a11y / RTL / anti-patterns
└── examples/                       # 13 examples (BasicFileExplorer, ControlledExpansion, SingleSelect,
                                    #   MultiSelectCheckboxes, AsyncLoad, CustomRender, DisabledNodes,
                                    #   NonSelectableHeaders, Compound, Sizes, KeyboardDemo,
                                    #   JsonInspector, Translations, CategoryPicker)

packages/components/__tests__/
├── TreeView.test.tsx               # 26 unit + integration tests
├── TreeView.a11y.test.tsx          # 10 jest-axe tests
└── treeHelpers.test.ts             # 16 pure-helper tests
```

### Verification

- `pnpm tsc --noEmit -p tsconfig.json` — workspace-wide clean.
- `npx eslint src/TreeView __tests__/TreeView.* __tests__/treeHelpers.test.ts` — 0 errors / 0 warnings.
- `pnpm vitest run` — **2364 / 2364 tests passing across 138 files** (TreeView contributes 52 new tests; no regressions).
- `pnpm build` — ESM + CJS + DTS build successful.

### Bundle

Marginal gzipped cost of the TreeView export surface, measured with `esbuild` + sibling
externalization (Checkbox, Spinner, React, engine, theme, tokens, lucide-react):

```
raw: 12.80 KB
gz:   4.67 KB
```

Under the plan's < 6 KB target and well below the original Phase 46 budget.

### What landed (matched the plan)

- `<TreeView>` + `<TreeView.Node>` exports (data + compound APIs).
- Controlled / uncontrolled expansion via `expanded` / `defaultExpanded` / `onExpandedChange`.
- Controlled / uncontrolled selection via `selected` / `defaultSelected` / `onSelectedChange` / `onSelect`.
- `selectionMode = 'none' | 'single' | 'multiple'`; `showCheckboxes` adornment for multi.
- Per-node `disabled` (no focus, no selection) and `selectable: false` (focusable, non-selectable headers).
- Async children via `loadChildren(node)` — dedupes in-flight requests, renders loading sentinel + error chip with retry.
- `renderNode(node, state)` for custom row chrome; `defaultIcon` / `expandedIcon` / `leafIcon` for quick icon overrides.
- Full **W3C TreeView keyboard pattern**: ArrowUp/Down/Left/Right (with collapse/focus-parent fallback), Home, End, `*` (expand siblings), Enter / Space (select / expand in `none` mode), letter+digit typeahead (500ms buffer, wrap-around), Ctrl/Cmd+A (select-all in multi mode).
- Roving tabindex — exactly one row has `tabIndex=0`; the tree occupies a single tab stop.
- Per-row ARIA: `role="treeitem"`, `aria-level`, `aria-posinset`, `aria-setsize`, `aria-expanded`, `aria-selected`, `aria-disabled`, `aria-busy`, `aria-labelledby`.
- Root: `<ul role="tree" aria-label … aria-multiselectable={mode==='multiple'}>`; children group: `<ul role="group">` nested inside the parent `<li>`.
- RTL via CSS logical properties (indent + connector edge) and native direction-aware arrow keys.
- Translation prop overlay (English defaults) instead of `<I18nProvider>` — per Leader guardrail.
- 13 examples covering file explorer, controlled expansion, single + multi select, async, custom render, disabled, non-selectable headers, compound, sizes, keyboard demo, JSON inspector, translations override, and tag picker.
- Pure helpers (`flattenTree`, `findTreeNode`, `nextFocusableId`, `findByPrefix`, `ancestorIds`, `siblingIds`) exported for direct unit testing and consumer composition.

### Deviations from the plan (all documented above)

1. **No virtualization** — Leader guardrail: only with measured need. `flattenTree` projection is already in place so a future `virtualized` opt-in can wrap the existing data flow; deferred to a follow-up lane.
2. **No drag-and-drop** — adds DOM event surface + axe-coverage area + bundle weight. Deferred. The plan documents the intended HTML5 + keyboard pick-up pattern verbatim for the follow-up.
3. **No `<I18nProvider>` integration** — same posture as recent phases (AppShell, Toolbar, TagsInput). `translations` prop overlays English defaults; when the provider lands, the same keys will be consumed from context with the prop acting as an override.
4. **No `<Icon>` primitive** — primitive doesn't exist yet (Agent4 is shipping it next). Examples use inline emoji / `lucide-react` directly; once Icon lands, the chevron and per-node `icon` slots can route through it without API change.
5. **Loading + error sentinels use `role="none"`** instead of `role="treeitem"` — axe correctly insists that `treeitem` requires `aria-selected` in multi-mode, but the sentinels aren't real focusable nodes. `role="none"` keeps screen readers on the parent's `aria-busy` state and avoids violations.
6. **Single + multi selection share `onSelect` + `onSelectedChange`** — `onSelect` always receives the active id (or empty string) for single-mode sugar; `onSelectedChange` receives the canonical shape for the active mode (`string` vs `string[]`). This avoids forcing multi-mode consumers to use a separate prop name.

### DRY notes

- Checkbox + Spinner consumed as black-box deps.
- `flattenTree` / `nextFocusableId` / `findByPrefix` / `siblingIds` are tree-local right
  now; they're general enough that future hierarchical components (e.g. nested menu,
  outline navigator) could reach for them — promote to `_shared/` if a second consumer
  appears.
- `useTreeKeyboard` was inlined into `TreeView.tsx` rather than split into a hook —
  every behaviour reads from the same flat row list + context, and the keyboard handler
  is the only consumer. Splitting would have added an export surface without a caller.

### Follow-ups

- Virtualization opt-in (`virtualized` + `estimatedRowHeight`) — wire `@tanstack/react-virtual` on top of `flattenTree`.
- Drag-and-drop slot (`dragAndDrop={{ onMove, isAllowed? }}`) with HTML5 + keyboard pick-up.
- `<I18nProvider>` integration once the provider lands.
- Icon-primitive integration once Phase 57 ships.

### Coordination

- No `_shared/` writes; no engine / theme / preset / renderer edits.
- `packages/components/src/index.ts` surgical insert after `Tooltip` (alphabetical: Tooltip → TreeView).
- Plan moved `plans/in-progress/components/46-tree-view.md` → `plans/completed/components/46-tree-view.md`.