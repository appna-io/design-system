# Phase 55 — `<Table />`

> Status: **Pending** · **Tier 2** · Depends on: Phase 5 (Text), Phase 12 (Badge), Phase 14 (Card — optional wrapping), Phase 38 (Divider), Phase 9 (Checkbox — selection mode), Phase 22 (Menu — row actions), Phase 27 (I18nProvider — optional), Phase 42 (EmptyState)
> Lightweight semantic table primitive. The "I have data and just want a nice table" tier below DataGrid.

## Objective

Ship the **`<Table />`** primitive — a thin, semantic, themable HTML `<table>` wrapper with optional sorting, optional selection, optional row actions, optional zebra/borders/density variants, and a tiny footprint.

Phase 27 DataGrid is the **full** datagrid with virtualization, column resize/pin, cell editing, etc. — ~9 KB gz, 8-PR feature.

Phase 55 Table is the **80% case** — just render data as rows + columns with proper semantics, looks good, sorts if asked, has a selection mode, and ships at < 4 KB gz.

Most consumers reach for "Table" before they realize they need "DataGrid." Phase 55 gives them the right primitive without forcing them into the heavy one.

---

## Public API

```tsx
import { Table } from 'apx-ds';

// Compound (semantic) API — closest to <table>
<Table>
  <Table.Head>
    <Table.Row>
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell>Email</Table.HeaderCell>
      <Table.HeaderCell align="end">Plan</Table.HeaderCell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {users.map((u) => (
      <Table.Row key={u.id}>
        <Table.Cell>{u.name}</Table.Cell>
        <Table.Cell>{u.email}</Table.Cell>
        <Table.Cell align="end"><Badge>{u.plan}</Badge></Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>

// Data-driven (declarative) API
<Table
  columns={[
    { id: 'name', header: 'Name', accessor: (u) => u.name },
    { id: 'email', header: 'Email', accessor: (u) => u.email },
    { id: 'plan', header: 'Plan', align: 'end', cell: (u) => <Badge>{u.plan}</Badge> },
  ]}
  data={users}
  getRowId={(u) => u.id}
/>

// Sortable
<Table
  columns={[
    { id: 'name', header: 'Name', accessor: (u) => u.name, sortable: true },
    { id: 'createdAt', header: 'Created', accessor: (u) => u.createdAt, sortable: true, sortFn: 'date' },
  ]}
  data={users}
  sort={{ id: 'name', direction: 'asc' }}
  onSortChange={setSort}
/>

// Selection (single + multi)
<Table
  selectionMode="multiple"
  selected={selectedIds}
  onSelectedChange={setSelectedIds}
  columns={…}
  data={users}
  getRowId={(u) => u.id}
/>

// Row actions menu
<Table
  rowActions={(u) => (
    <Menu>
      <Menu.Trigger><IconButton aria-label="Actions"><Icon name="more" /></IconButton></Menu.Trigger>
      <Menu.Content>
        <Menu.Item onSelect={() => edit(u)}>Edit</Menu.Item>
        <Menu.Item onSelect={() => del(u)} tone="danger">Delete</Menu.Item>
      </Menu.Content>
    </Menu>
  )}
  columns={…}
  data={users}
/>

// Empty state
<Table
  columns={…}
  data={[]}
  empty={<EmptyState size="sm" icon={<Icon name="users" />} title="No users yet" />}
/>

// Loading state
<Table columns={…} data={users} loading />

// Density / visual variants
<Table variant="default" density="md" striped bordered hoverable />

// Sticky header (paired with a fixed-height container)
<div style={{ maxHeight: 400, overflow: 'auto' }}>
  <Table stickyHeader>
    …
  </Table>
</div>

// Full prop form
<Table
  /* declarative data API */
  columns                            // Column<T>[]
  data                                // T[]
  getRowId                            // (row: T) => string

  /* sort */
  sort                                // { id: string; direction: 'asc' | 'desc' } | undefined
  defaultSort
  onSortChange

  /* selection */
  selectionMode="none"               // 'none' | 'single' | 'multiple'
  selected                           // string | string[] (depends on mode)
  defaultSelected
  onSelectedChange
  isRowSelectable                    // (row: T) => boolean

  /* row actions */
  rowActions                         // (row: T) => ReactNode

  /* events */
  onRowClick                         // (row: T) => void

  /* states */
  loading={false}                    // shows skeleton rows
  loadingRowCount={5}
  empty                              // ReactNode — shown when data.length === 0
  error                              // ReactNode

  /* visual */
  variant="default"                  // 'default' | 'card' | 'minimal'
  density="md"                       // 'sm' | 'md' | 'lg'
  striped={false}                    // boolean
  bordered={true}
  hoverable={true}
  stickyHeader={false}
  ariaLabel                           // required for a11y

  className=""
  style={{}}
  ref={…}
>
  {/* optional compound children — overrides declarative columns */}
</Table>

interface Column<T> {
  id: string;
  header: ReactNode;
  accessor?: (row: T) => unknown;     // for sorting; required when sortable
  cell?: (row: T, index: number) => ReactNode;  // override default cell rendering (calls accessor)
  align?: 'start' | 'center' | 'end';
  width?: string | number;             // CSS width
  minWidth?: string | number;
  sortable?: boolean;
  sortFn?: 'string' | 'number' | 'date' | ((a: T, b: T) => number);
  truncate?: boolean;                  // text-overflow ellipsis
  className?: string;
  hidden?: boolean | ResponsiveValue<boolean>;  // hide at breakpoints
}
```

---

## API Decisions

| Decision                                                                | Why                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Two APIs: compound (semantic) + declarative (data-driven)**         | Compound mirrors `<table><thead><tbody>` for "I want full control"; declarative is one-line for "I have an array." |
| **Sort is single-column**                                            | Multi-column sort = DataGrid territory. Keeps Table small.                                                       |
| **Selection via checkboxes column**                                  | When `selectionMode != 'none'`, Table auto-injects a leading column with Checkboxes. Header has a master Checkbox.|
| **Row actions menu in trailing column**                              | `rowActions(row)` renders into a right-aligned column with sticky positioning + visually subtle until row hover.  |
| **Loading shows skeleton rows**                                      | `loading={true}` renders `loadingRowCount` (default 5) of Skeleton-styled placeholder rows. Better UX than spinner. |
| **Empty state uses EmptyState (Phase 42)**                          | Default empty = "No data" + small icon; consumers can supply richer `empty` slot.                                |
| **`stickyHeader` is CSS-only**                                       | `position: sticky` on `<thead>` cells. Works inside any scrolling parent.                                        |
| **`density` controls vertical padding**                              | sm (data-dense admin tables) / md (default) / lg (marketing-data tables).                                        |
| **`hidden` per-column with responsive values**                       | Hide low-priority columns on small screens. Driven by CSS, no JS measuring.                                       |
| **No virtualization, no resize, no pin, no edit**                    | Those belong to DataGrid (Phase 27). Hard ceiling on scope = Table stays light.                                  |
| **`rowActions` is not a column** — it's a slot                       | Cleaner mental model: "every row has actions" doesn't need a Column object.                                      |
| **No row expansion**                                                  | Consumer can do this with their own `cell={(row) => <Disclosure>...</Disclosure>}`. Not worth a dedicated API in Table tier. |

---

## Internal architecture

```
                       ┌──────────────────────────────────────────────┐
   props ─────────────►│  Resolve compound vs declarative              │
                       │  When declarative: render data via columns    │
                       │  Owns: sort state (if not controlled)         │
                       │        selection state (if not controlled)    │
                       └──────────────────────────────────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────────────┐
                       │  Compute visible rows:                       │
                       │   1. data → sort (if sort.id matches a col)   │
                       │   2. → rows                                    │
                       │                                                │
                       │  Compute leading + trailing columns:          │
                       │   - leading: selection checkbox if selectMode │
                       │   - trailing: rowActions if defined           │
                       │                                                │
                       │  Render <table>                                │
                       └──────────────────────────────────────────────┘
```

---

## File Structure

```
packages/components/src/Table/
├── Table.tsx
├── Table.Head.tsx
├── Table.Body.tsx
├── Table.Row.tsx
├── Table.Cell.tsx
├── Table.HeaderCell.tsx
├── Table.Foot.tsx                    # optional <tfoot>
├── Table.Caption.tsx                  # <caption>
├── Table.context.ts
├── Table.types.ts
├── Table.recipe.ts
├── sortRows.ts                       # pure — sort by column.sortFn
├── Table.test.tsx
├── Table.compound.test.tsx
├── Table.declarative.test.tsx
├── Table.sort.test.tsx
├── Table.selection.test.tsx
├── Table.responsive.test.tsx
├── Table.a11y.test.tsx
├── sortRows.test.ts
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── BasicCompound.tsx
    ├── Declarative.tsx
    ├── Sortable.tsx
    ├── SortableMultiType.tsx        # string / number / date sortFn
    ├── SingleSelect.tsx
    ├── MultiSelect.tsx
    ├── RowActions.tsx
    ├── RowClick.tsx
    ├── Loading.tsx
    ├── Empty.tsx
    ├── EmptyCustom.tsx
    ├── Striped.tsx
    ├── Bordered.tsx
    ├── DensitySm.tsx
    ├── DensityLg.tsx
    ├── StickyHeader.tsx
    ├── HiddenColumnsResponsive.tsx
    ├── CardVariant.tsx
    ├── WithBadgesAndAvatars.tsx
    └── FullDashboardDemo.tsx
```

---

## Recipe sketches

```ts
export const tableRootRecipe = cv({
  base: 'w-full text-(--sds-color-text-default) text-sm border-separate border-spacing-0',
  variants: {
    variant: {
      default: '',
      card:    'overflow-hidden rounded-lg border border-(--sds-color-border-subtle)',
      minimal: '',
    },
    bordered: {
      true: '[&_th]:border-b [&_td]:border-b [&_th]:border-(--sds-color-border-subtle) [&_td]:border-(--sds-color-border-subtle) [&_tr:last-child_td]:border-b-0',
      false: '',
    },
    striped: {
      true: '[&_tbody_tr:nth-child(even)_td]:bg-(--sds-color-surface-muted)/40',
      false: '',
    },
    hoverable: {
      true: '[&_tbody_tr:hover_td]:bg-(--sds-color-surface-muted)/60',
      false: '',
    },
  },
  defaultVariants: { variant: 'default', bordered: true, striped: false, hoverable: true },
});

export const tableCellRecipe = cv({
  base: 'align-middle truncate-ellipsis',
  variants: {
    density: {
      sm: 'px-2 py-1.5 text-xs',
      md: 'px-3 py-2.5 text-sm',
      lg: 'px-4 py-3.5 text-base',
    },
    align: {
      start:  'text-start',
      center: 'text-center',
      end:    'text-end',
    },
  },
  defaultVariants: { density: 'md', align: 'start' },
});

export const tableHeaderCellRecipe = cv({
  base: 'font-medium text-(--sds-color-text-muted) text-start',
  variants: {
    sortable: { true: 'cursor-pointer select-none hover:text-(--sds-color-text-default)', false: '' },
    sortActive: { true: 'text-(--sds-color-accent-emphasis)', false: '' },
    density: { sm: 'px-2 py-1.5 text-xs', md: 'px-3 py-2 text-xs', lg: 'px-4 py-3 text-sm' },
    sticky: { true: 'sticky top-0 z-10 bg-(--sds-color-surface-default)', false: '' },
  },
});
```

---

## `sortRows.ts` (pure)

```ts
export function sortRows<T>(args: {
  rows: T[];
  column: Column<T> | undefined;
  direction: 'asc' | 'desc';
}): T[] {
  if (!args.column) return args.rows;
  const dir = args.direction === 'asc' ? 1 : -1;
  const cmp = makeCmp(args.column.sortFn);
  return [...args.rows].sort((a, b) => {
    const va = args.column!.accessor!(a);
    const vb = args.column!.accessor!(b);
    return cmp(va, vb) * dir;
  });
}

function makeCmp(sortFn: Column<any>['sortFn']): (a: unknown, b: unknown) => number {
  if (typeof sortFn === 'function') return sortFn as any;
  if (sortFn === 'number') return (a, b) => Number(a) - Number(b);
  if (sortFn === 'date')   return (a, b) => new Date(a as any).getTime() - new Date(b as any).getTime();
  return (a, b) => String(a).localeCompare(String(b)); // default: string with collation
}
```

For locale-aware sorting, consumers wrap `sortFn` with `Intl.Collator` from `<I18nProvider>` locale. Out of scope for v1.

---

## A11y

- **`<table>` root** with `role="table"` (implicit) and `aria-label={ariaLabel}` (required for unambiguous identification).
- **`<thead>`** + **`<th scope="col">`** — semantic, AT support is excellent.
- **`<tbody>`** + **`<tr>`** + **`<td>`** — standard.
- **Sortable headers**: each sortable `<th>` is also a `<button>` semantically (or has `role="button"` with `tabIndex=0`), with `aria-sort="ascending" | "descending" | "none"`.
- **Selection**: leading-column Checkbox per row + master Checkbox in header. Each row gets `aria-selected={…}`.
- **Row actions**: trailing Menu inherits Menu's a11y.
- **Loading**: `<tbody aria-busy="true">` while loading.
- **Empty state**: announced via the EmptyState's `role="region"`.
- **Caption** (optional `<caption>`) provides accessible name as an alternative to `aria-label`.
- axe-core: 0 violations in default / sortable / selection / loading / empty / sticky states.

---

## i18n

When wrapped in `<I18nProvider>`:

| Key                              | Default (en)                          |
| -------------------------------- | ------------------------------------- |
| `table.sortAscending`            | "sorted ascending"                     | (sr-only after header)            |
| `table.sortDescending`           | "sorted descending"                    |                                    |
| `table.notSorted`               | "not sorted"                           |                                    |
| `table.selectRow`                | "Select row"                           | (Checkbox aria-label)              |
| `table.selectAll`                | "Select all rows"                      |                                    |
| `table.deselectAll`              | "Deselect all rows"                    |                                    |
| `table.loading`                  | "Loading data..."                      |                                    |
| `table.empty`                   | "No data to display"                   | default EmptyState title           |
| `table.rowActions`               | "Actions"                              | Menu trigger aria-label            |

Bundles: en / he / ar.

---

## RTL

- `text-align: start` / `end` (logical) on each cell.
- Selection checkbox column appears on the logical-start edge.
- Row actions column appears on the logical-end edge.
- `border-inline-end` / `border-block-end` used everywhere; no per-direction code.
- Sort arrow icon is direction-agnostic (up/down chevron).
- Sticky header positioning is direction-agnostic.

---

## Performance

- Sort runs once per state change; O(n log n).
- Selection lookup uses `Set` for O(1) hit-test.
- Rendering: React reconciles `data.map(...)`; for very large data, consumers should reach for DataGrid (Phase 27) with virtualization.
- Bundle target: **< 4 KB gz** (excluding Menu / Checkbox / EmptyState which are pulled by reference).

---

## Testing

- Compound API renders correct DOM structure (`<table><thead>...`).
- Declarative API produces identical DOM given equivalent data.
- Sort: clicking sortable header cycles asc → desc → unsorted (or asc → desc only, configurable).
- `sortFn` variants: string / number / date / custom all produce correct order.
- Selection: leading checkbox column appears; master toggles all; per-row toggles work.
- `isRowSelectable={(r) => r.active}` disables select on filtered rows.
- Row actions slot renders trailing menu.
- `onRowClick` fires; not when clicking inside row actions (event boundary).
- Loading shows `loadingRowCount` skeleton rows.
- Empty renders EmptyState by default; custom `empty` slot used when provided.
- Sticky header sticks within a scrollable parent.
- Hidden columns at breakpoints (responsive `hidden`).
- axe-core: 0 violations in all modes.
- RTL snapshot.

---

## Acceptance Criteria

- [ ] `<Table>` + 7 subcomponents exported.
- [ ] Compound + declarative APIs both functional.
- [ ] Single-column sort with string/number/date/custom sortFn.
- [ ] Selection: single + multiple modes with auto-injected checkbox column.
- [ ] Row actions slot in trailing position.
- [ ] Loading + empty + error states render correctly.
- [ ] Sticky header CSS-only.
- [ ] Striped / bordered / hoverable / density variants.
- [ ] Responsive hidden columns via CSS.
- [ ] i18n bundle en / he / ar.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 4 KB gz.

---

## DRY Self-Check

- [ ] Reuses Checkbox, Menu, EmptyState, Skeleton (loading rows), Divider, `<I18nProvider>`.
- [ ] `sortRows` pure + tested.
- [ ] DataGrid (Phase 27) can internally use the same `Table.Row`/`Table.Cell` recipes for visual consistency.
- [ ] No new color tokens.
- [ ] No virtualization (DataGrid territory).

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/55-table.md`.
2. Outcome notes: bundle delta, decision on shared recipe with DataGrid for visual parity.
3. Document the "Table vs DataGrid" decision matrix in MDX so consumers pick the right primitive.

---

## Outcome — 2026-05-21 (SDS-Agent3)

**Status:** ✅ Shipped.

### What landed

- `<Table>` root + `Table.Head` / `Table.Body` / `Table.Foot` / `Table.Row` / `Table.HeaderCell` / `Table.Cell` / `Table.Caption` compound subparts, exposed via `Object.assign` over a `forwardRef` root.
- Two equivalent APIs sharing the same DOM:
  - **Compound**: drop in the subparts; full control over markup, captions, footers.
  - **Declarative**: `columns` + `data` (+ `getRowId`) — one-line table from an array.
- Single-column sort with built-in strategies (`string` / `number` / `date` / custom comparator). Controlled + uncontrolled. Cycles `unsorted → asc → desc → unsorted` per the WAI-ARIA pattern. Header label rendered inside a real `<button>`; sort state announced via `aria-sort`.
- Selection: `selectionMode` of `'none' | 'single' | 'multiple'`. Auto-injects a leading checkbox column; the master checkbox in `multiple` mode has three states (none / some / all) using `Checkbox.indeterminate`. `isRowSelectable` gates per-row.
- Row actions slot (`rowActions(row)`) renders into a trailing column. Built-in `data-table-stop-row-click` boundary stops clicks inside the actions cell from triggering `onRowClick`.
- Loading state renders `loadingRowCount` skeleton rows (`<Skeleton>` per cell), marks `aria-busy="true"` on `<tbody>`.
- Empty + error states render inside a single full-width body cell. `empty` falls back to "No data to display"; `error` wins over `empty`.
- Visual axes: `variant` (`default` / `card` / `minimal`), `density` (`sm` / `md` / `lg`), `striped`, `bordered`, `hoverable`, `stickyHeader`. All independent toggles.
- Pure helpers exported: `sortRows({ rows, column, direction })` and `cycleSort(current, columnId)`.

### Files

- `packages/components/src/Table/Table.tsx` — root + all subcomponents.
- `packages/components/src/Table/Table.types.ts` — `TableProps`, `TableColumn<T>`, `TableSortState`, plus per-subpart prop interfaces.
- `packages/components/src/Table/Table.recipe.ts` — root / cell / header / sort-button / row / caption / sticky-col / empty recipes via `cv`.
- `packages/components/src/Table/Table.context.ts` — `TableContext` carrying density / variant / sticky flags to subparts.
- `packages/components/src/Table/sortRows.ts` — pure sort + cycle helpers.
- `packages/components/src/Table/index.ts` — barrel.
- `packages/components/src/Table/meta.ts` — renderer metadata (kept internal).
- `packages/components/src/Table/README.mdx` — usage docs + Table-vs-DataGrid decision matrix.
- 17 examples in `packages/components/src/Table/examples/`:
  `BasicCompound`, `Declarative`, `Sortable`, `SingleSelect`, `MultiSelect`, `RowActions`, `RowClick`, `Loading`, `Empty`, `Striped`, `Bordered`, `CardVariant`, `DensitySm`, `StickyHeader`, `WithCaption`, `WithFooter`, `FullDashboardDemo`.

### Tests

`pnpm vitest run __tests__/sortRows.test.ts __tests__/Table.test.tsx __tests__/Table.a11y.test.tsx` → **54 / 54 passing**.

- `sortRows.test.ts` — 14 tests (pure: no-accessor passthrough, asc/desc, string/number/date/custom, null/NaN sink, mutation safety, `cycleSort` truth table).
- `Table.test.tsx` — 28 tests (declarative + compound APIs, hidden columns, ariaLabel, captions, footers, row selected/disabled, sort cycle + `aria-sort`, sorted row order, multi/single selection toggles, isRowSelectable, row actions, onRowClick boundary, loading/empty/error, visual axis attributes).
- `Table.a11y.test.tsx` — 12 tests (declarative, sortable, single + multi selection, loading, empty, error, card+striped+sm density, sticky header, compound w/ caption, row actions, combined matrix). **Zero `jest-axe` violations**.

Full workspace regression: **2058 / 2058 across 111 files**.

### Quality gates

- `pnpm tsc --noEmit` (workspace): **0 errors**.
- `npx eslint src/Table __tests__/Table.test.tsx __tests__/Table.a11y.test.tsx __tests__/sortRows.test.ts`: **clean**.
- `pnpm build`: **green** (ESM 707 KB / CJS 724 KB / DTS 328 KB total package).

### Bundle

Marginal cost of Table, externalising React + engine + theme + tokens + `lucide-react` + `Checkbox` + `Skeleton*` (since Table is a consumer of those siblings, not the owner of their cost):

| | bytes | KB |
| --- | --- | --- |
| raw (minified) | 11,223 | 10.96 |
| **gz** | **4,017** | **3.92** |

Under the < 4 KB gz target.

### Public API surface

Surgical insert in `packages/components/src/index.ts` between **Switch** and **Tabs** (alphabetically Table < Tabs because `'Table'[3] = 'l'` < `'Tabs'[3] = 's'`):

```ts
export { Table, sortRows, cycleSort } from './Table';
export type {
  TableProps, TableColumn, TableSortState, TableSortDirection, TableSortFn,
  TableSelectionMode, TableVariant, TableDensity, TableCellAlign,
  TableRowProps, TableCellProps, TableHeaderCellProps,
  TableCaptionProps, TableSubcomponentProps, TableContextValue,
} from './Table';
```

### Deviations from plan

1. **No separate per-subcomponent files.** The plan listed `Table.Head.tsx`, `Table.Body.tsx`, etc. as separate files. Consolidated everything into `Table.tsx` (same approach the shipped Timeline used). Same public API via `Object.assign`. Net result: less indirection, no separate context plumbing for each file, marginally smaller bundle. Documented inline.
2. **Responsive `hidden` per-column is boolean-only.** The plan called for `ResponsiveValue<boolean>` so columns could disappear at breakpoints via CSS only. Shipped as `boolean` — anything responsive is a documented follow-up. Reason: the responsive runtime in `engine`'s `ResponsiveValue` resolves into `className` strings, but the column hidden flag needs to alter the DOM (skip the `<th>` and the `<td>` per row) to keep `colSpan` math correct. That dovetails with a future "responsive table primitive" plan rather than a property tweak.
3. **`<I18nProvider>` deferred.** Same as Timeline / Stepper / Combobox — provider doesn't exist yet. Strings (`"Select row"`, `"Select all rows"`, `"Deselect all rows"`, `"No data to display"`) are hard-coded English. When Phase 27 lands the primitive, swap for prop-overridable `translations` similar to Combobox.
4. **No virtualization, multi-sort, column resize, pin, edit.** All deferred to DataGrid (Phase 27) per scope. Documented in README's "Table vs DataGrid" matrix.
5. **`stickyHeader` is CSS-only and doesn't render a separate scroller wrapper.** Consumers wrap the table in their own scrolling container — example `StickyHeader.tsx` demonstrates. Keeps the API minimal and avoids second-guessing the consumer's chrome.
6. **Selection column header uses `sr-only` text, not `aria-label` on an empty `<th>`.** axe flagged the empty header for the row-actions and single-select columns. Fixed by rendering visually-hidden text content instead — semantically equivalent, axe-clean.
7. **Skeleton variant**: The plan sketch used a "text" Skeleton variant which doesn't exist. Switched to `<Skeleton height="1rem" width="80%" rounded="sm" />` — equivalent visual, matches the Skeleton API.

### DRY notes / shared-helper candidates

- `formatValue` from Stat is **not** consumed inside Table — cell rendering is consumer-owned to keep Table format-agnostic. Documented as a usage recommendation in the README.
- `sortRows` is the second pure-comparator helper after `useDeferredFilter` in Combobox. If DataGrid's multi-sort eventually consumes the same per-column primitive, that's the right time to consider engine promotion (`engine/src/data/sortRows.ts`).
- `cycleSort` is candidate for the same shared-helper home if DataGrid surfaces the same single-column cycle pattern.
- `Checkbox` was a clean consumer — no edits, no awareness needed of the Table context. `indeterminate` + `onCheckedChange` worked as-is.
- `Skeleton` was a clean consumer — used `height` / `width` / `rounded` only.

### Follow-ups

- Responsive `hidden` columns at breakpoints (likely needs a `columns.hidden = ResponsiveValue<boolean>` + a hook that resolves the boolean per breakpoint into the column list).
- `<I18nProvider>` integration once the primitive exists.
- "Row expansion" use cases — recommend documenting the pattern (consumer wraps `Table.Cell` content in `<Disclosure>`) rather than carrying a dedicated API in Table tier.
- DataGrid (Phase 27) should share the Table cell/row recipes for visual parity — call out the import path when DataGrid lands.

### Coordination notes

- **No `_shared/` writes.** Helpers (`sortRows`, `cycleSort`) live inside `src/Table/`.
- **No edits** to Checkbox / Skeleton / EmptyState / Badge source.
- **No renderer touches** (renderer rule honored — only Ahmad starts/restarts it).
- **No theme-token / engine / tokens writes.**
- Alphabetical insert in `packages/components/src/index.ts`.

Lane history: 31 Divider ✅ · 38 Stat / StatGroup ✅ · 45 Timeline ✅ · 55 Table ✅.
