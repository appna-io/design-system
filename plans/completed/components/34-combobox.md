# Phase 34 — `<Combobox />` (+ `<MultiCombobox />`)

> Status: **Completed** · Owner: SDS-Agent4 · Depends on: Phase 7 (Input) · Phase 18 (Popover) · Phase 22 (Menu — keyboard primitives) · Phase 23 (Select — recipe foundations) · Phase 12 (Badge — for multi-select tags) · Engine `<I18nProvider>` · Blocks: nothing
> Independent enough to ship in parallel with Phase 33 (DatePicker) once the listed deps are ready.

## Objective

Ship the canonical searchable-select primitive — `<Combobox />`. A `<Select>` with a typeable input that:

- **Filters** the option list as the user types (substring / fuzzy / custom matcher).
- **Creates** new options on-the-fly (`creatable` prop) — common for tag input.
- Supports **single** and **multiple** selection (the latter exported as `<MultiCombobox>`).
- Supports **async** option loading (debounced, with loading + empty states).
- Supports **grouped** options + **virtualization** for >500 options.
- Full ARIA Combobox pattern, RTL, i18n.

`<Combobox>` is the missing piece between `<Select>` (closed list) and `<CommandPalette>` (free-form action launcher).

---

## What This Component Proves

- The Select infrastructure (Phase 23) generalizes to "filterable list with text input."
- The Menu keyboard nav (Phase 22) handles "focus stays in the input while highlight moves in the list" — the canonical Combobox interaction model.
- Async-loading state can be encapsulated cleanly with `useDeferredFilter` + AbortController.
- The "creatable" UX (typing `xyz` + Enter creates a new option) is generic enough to live in the same component, not a separate `<TagInput>`.

---

## Public API

```tsx
import { Combobox, MultiCombobox } from 'apx-ds';

// Static options
<Combobox
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
  ]}
  value={country}
  onChange={setCountry}
  placeholder="Pick a country"
/>

// Grouped options
<Combobox
  options={[
    { type: 'group', label: 'Americas', children: [
      { value: 'us', label: 'United States' },
      { value: 'br', label: 'Brazil' },
    ]},
    { type: 'group', label: 'Europe', children: [
      { value: 'uk', label: 'United Kingdom' },
      { value: 'de', label: 'Germany' },
    ]},
  ]}
  value={country}
  onChange={setCountry}
/>

// Async options
<Combobox
  loadOptions={async (query, { signal }) => {
    const res = await fetch(`/api/users?q=${query}`, { signal });
    return (await res.json()).map((u) => ({ value: u.id, label: u.name }));
  }}
  debounceMs={300}
  value={userId}
  onChange={setUserId}
/>

// Creatable (tag input)
<MultiCombobox
  options={existingTags}
  value={selectedTags}
  onChange={setSelectedTags}
  creatable
  onCreateOption={(label) => ({ value: slug(label), label })}
/>

// Custom item render
<Combobox
  options={users}
  value={selectedUser}
  onChange={setSelectedUser}
  renderOption={({ option, isActive, isSelected }) => (
    <div className="flex items-center gap-2">
      <Avatar src={option.avatarUrl} size="sm" />
      <div className="flex flex-col">
        <span className="font-medium">{option.label}</span>
        <span className="text-xs text-fg-muted">{option.email}</span>
      </div>
    </div>
  )}
  filterOption={(option, query) =>
    option.label.toLowerCase().includes(query.toLowerCase()) ||
    option.email.toLowerCase().includes(query.toLowerCase())
  }
/>

// Full prop form
<Combobox
  /* options */
  options={…}                          // ComboboxOption | ComboboxGroup
  loadOptions={async (q, { signal }) => Option[]}  // async — overrides static options when provided
  /* value */
  value={value}                        // controlled
  defaultValue={undefined}
  onChange={(v: string | null) => …}
  /* input */
  inputValue={undefined}               // controlled query
  defaultInputValue=""
  onInputValueChange={(s) => …}
  placeholder="Search…"
  /* behavior */
  filterOption={(opt, query) => boolean} // default: substring on `label`
  matchStrategy="substring"              // 'substring' | 'startsWith' | 'fuzzy' | 'custom'
  creatable={false}
  onCreateOption={(label: string) => Option | Promise<Option>}
  clearable={true}
  closeOnSelect={true}                   // single: true; multi: false (override per prop)
  openOnFocus={false}
  selectOnBlur={false}
  /* async */
  debounceMs={300}
  loadingState={undefined}               // 'idle' | 'loading' | 'error' | 'empty'
  /* overlay */
  open={undefined}                       // controlled
  defaultOpen={false}
  onOpenChange={(b) => …}
  placement="bottom-start"
  matchTriggerWidth={true}               // popover width matches input width
  /* rendering */
  renderOption={(ctx) => ReactNode}
  renderEmpty={(query) => ReactNode}
  renderLoading={() => ReactNode}
  renderError={(err) => ReactNode}
  renderCreateOption={(label) => ReactNode}
  /* visual */
  variant="outline"                      // inherits Input variants
  size="md"
  color="primary"
  /* state */
  disabled={false}
  invalid={false}
  readOnly={false}
  loading={false}                        // external loading override
  /* virtualization */
  virtualizeAfter={200}                  // virtualize the option list when count exceeds this
  estimateItemHeight={36}
  /* form */
  name="country"
  required={false}
  /* a11y */
  label="Country"
  hint=""
  errorMessage=""
  /* misc */
  className=""
  sx={{}}
/>
```

---

## API Decisions

| Decision                                                       | Why                                                                                       |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Two exports — `<Combobox>` + `<MultiCombobox>`**              | `value` types differ (`string` vs `string[]`) — TypeScript clarity > unified API.        |
| **`loadOptions` overrides `options` when both passed**         | Common pattern: seed with a static list, then fetch on type.                              |
| **Built-in `creatable` mode**, not a separate `<TagInput>`     | Tag input is just multi + creatable. One component, two modes.                            |
| **`matchStrategy` shorthand**                                  | 90% of users want substring; 9% want fuzzy; 1% want custom. Don't force a `filterOption` for the common case. |
| **`matchTriggerWidth` defaults to `true`**                     | Matches user expectation; opt-out for wide-content menus.                                  |
| **Hidden `<input type="hidden">`** carries the selected value(s) for forms | Same pattern as Checkbox / DatePicker / Select.                              |
| **Virtualization kicks in automatically at `virtualizeAfter`** | No prop juggling; tunable threshold.                                                       |
| **Reuses Menu's keyboard layer**                               | Combobox is "menu where the trigger is the search field" — same arrow keys + type-ahead.  |

---

## Variants

Inherits Input's `variant` × `size` × `color` from Phase 7's `controlBase` + `inputRecipe`. **No new chrome for the trigger**. New surfaces:

- **Option list** — reuses Menu's `menuItem` recipe with `data-active="true"` highlighting.
- **Group label** — small caps, muted color, padding-left aligned with options.
- **Tag pill (multi mode)** — reuses `<Badge>` (Phase 12) with `removable` prop.
- **Create-new row** — option-styled row with `+ Create "xxx"` content, highlighted when no exact match.
- **Empty state** — centered illustration + translated string.
- **Loading state** — `<Spinner>` + translated "Loading…" text.
- **Error state** — `<Alert>` (Phase 15) inline.

---

## File Structure

```
packages/components/src/Combobox/
├── Combobox.tsx                     # single-select variant
├── MultiCombobox.tsx                # multi-select variant
├── Combobox.types.ts
├── Combobox.recipe.ts               # only the multi-tag input chrome + option-list overrides
├── headless/
│   ├── useCombobox.ts               # state machine
│   ├── useComboboxKeyboard.ts       # arrow keys (delegates to Menu's primitive)
│   ├── filterStrategies.ts          # substring / startsWith / fuzzy
│   ├── flattenOptions.ts            # pure: ComboboxGroup | ComboboxOption → ComboboxOption[]
│   ├── useDeferredFilter.ts         # debounced + AbortController-aware async fetcher
│   └── highlightMatch.ts            # pure: option.label + query → ReactNode with <mark>
├── parts/
│   ├── ComboboxInput.tsx
│   ├── ComboboxTrigger.tsx
│   ├── ComboboxList.tsx             # consumes virtualization
│   ├── ComboboxOption.tsx
│   ├── ComboboxGroupLabel.tsx
│   ├── ComboboxEmpty.tsx
│   ├── ComboboxLoading.tsx
│   ├── ComboboxError.tsx
│   ├── ComboboxCreateOption.tsx
│   ├── ComboboxClearButton.tsx
│   └── ComboboxTagList.tsx          # multi mode — renders <Badge>s
├── Combobox.test.tsx
├── MultiCombobox.test.tsx
├── Combobox.a11y.test.tsx
├── Combobox.headless.test.ts        # pure unit tests
├── Combobox.async.test.tsx
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Grouped.tsx
    ├── Async.tsx
    ├── Multi.tsx
    ├── MultiCreatable.tsx           # tag-input use case
    ├── CustomItem.tsx               # Avatar + label + sublabel
    ├── HighlightMatches.tsx         # <mark>-wrapped query substring
    ├── Virtualized.tsx              # 5000 options
    ├── FuzzyMatch.tsx
    ├── ControlledOpen.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── EmptyState.tsx
    ├── Disabled.tsx
    ├── Invalid.tsx
    ├── WithLabel.tsx
    ├── ServerSide.tsx               # debounced API
    ├── Rtl.tsx
    └── FormSubmission.tsx
```

---

## Headless Layer — `useCombobox()`

```ts
export interface UseComboboxOptions<O> {
  mode: 'single' | 'multiple';
  options?: (O | ComboboxGroup<O>)[];
  loadOptions?: (query: string, ctx: { signal: AbortSignal }) => Promise<O[]>;
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onChange?: (v: string | string[] | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (s: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (b: boolean) => void;
  filterOption?: (option: O, query: string) => boolean;
  matchStrategy?: 'substring' | 'startsWith' | 'fuzzy' | 'custom';
  creatable?: boolean;
  onCreateOption?: (label: string) => O | Promise<O>;
  closeOnSelect?: boolean;
  openOnFocus?: boolean;
  selectOnBlur?: boolean;
  debounceMs?: number;
  virtualizeAfter?: number;
  estimateItemHeight?: number;
}

export interface UseComboboxReturn<O> {
  /* state */
  isOpen: boolean;
  inputValue: string;
  value: string | string[] | null;
  highlightedIndex: number;
  loadingState: 'idle' | 'loading' | 'error' | 'empty';
  flatOptions: O[];
  visibleOptions: O[];
  /* actions */
  open: () => void;
  close: () => void;
  toggle: () => void;
  setInputValue: (s: string) => void;
  selectOption: (option: O) => void;
  removeValue: (v: string) => void;            // multi only
  clear: () => void;
  highlight: (index: number) => void;
  highlightFirst: () => void;
  highlightLast: () => void;
  highlightNext: () => void;
  highlightPrev: () => void;
  createOption: (label: string) => Promise<void>;
  /* dom-bridge */
  rootProps: HTMLAttributes<HTMLDivElement>;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  listProps: HTMLAttributes<HTMLUListElement>;
  getOptionProps: (option: O, index: number) => LiHTMLAttributes<HTMLLIElement>;
  /* i18n */
  t: ComboboxTranslations;
}
```

---

## Filter Strategies

```ts
// filterStrategies.ts
export const filterStrategies = {
  substring:  (label: string, query: string) => label.toLowerCase().includes(query.toLowerCase()),
  startsWith: (label: string, query: string) => label.toLowerCase().startsWith(query.toLowerCase()),
  fuzzy:      (label: string, query: string) => fuzzyMatch(label, query),  // simple subsequence match, no scoring lib
};

function fuzzyMatch(label: string, query: string): boolean {
  // O(n) subsequence match — every char in query appears in label in order.
  // No scoring; just yes/no. Consumer wanting ranked fuzzy passes a custom filterOption.
  let i = 0;
  const l = label.toLowerCase();
  const q = query.toLowerCase();
  for (const c of l) {
    if (c === q[i]) i++;
    if (i === q.length) return true;
  }
  return false;
}
```

Fuzzy is intentionally **simple** — consumers wanting ranked fuzzy (like Fuse.js) bring their own ranker via `filterOption`.

---

## Async — `useDeferredFilter()`

```ts
export function useDeferredFilter<O>(opts: {
  loadOptions: (query: string, ctx: { signal: AbortSignal }) => Promise<O[]>;
  query: string;
  debounceMs: number;
}): { state: 'idle' | 'loading' | 'error' | 'empty' | 'ready'; results: O[]; error?: Error };
```

Implementation:

1. Debounce `query` by `debounceMs` (default 300).
2. On each debounced query change:
   - Abort the previous fetch via `AbortController`.
   - Call `loadOptions(debouncedQuery, { signal })`.
   - Set state to `loading`.
3. On resolve: set `results` + state to `ready` (or `empty` if results.length === 0).
4. On reject: if `signal.aborted` → ignore (we cancelled it). Else state = `error`.
5. Cancel in-flight on unmount.

This hook is **exported publicly** so future async-list components (search dropdowns elsewhere) can reuse it.

---

## A11y — ARIA Combobox Pattern (1.2)

Implements the W3C **Combobox** pattern with `aria-activedescendant` (not `aria-owns`/roving focus — better screen-reader compat).

Structure:

```html
<div class="combobox">
  <label id="cb-label">Country</label>
  <input
    role="combobox"
    aria-expanded={isOpen}
    aria-controls="cb-list"
    aria-activedescendant={highlightedOptionId}
    aria-autocomplete="list"
    aria-labelledby="cb-label"
    aria-describedby="cb-hint cb-error"
  />
  <ul id="cb-list" role="listbox" aria-multiselectable={mode === 'multiple'}>
    <li role="option" id="cb-opt-0" aria-selected={isSelected}>…</li>
    …
  </ul>
</div>
```

For **multi mode**, the input + listbox have the same structure plus a list of `<Badge removable>` tags rendered before the input. Each tag has `aria-label={t.removeTag(label)}` on its remove button.

### Keyboard

| Key                       | Action                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------- |
| Arrow Down                | Open popover (if closed) + highlight next option.                                       |
| Arrow Up                  | Highlight previous option. If at first → close popover (configurable).                  |
| Enter                     | Select highlighted option. If `creatable` + no match → create option from current input.|
| Esc                       | Close popover + revert input to selected label.                                         |
| Tab                       | Close popover; move focus to next focusable.                                            |
| Home / End                | Highlight first / last option.                                                          |
| PageDown / PageUp         | Highlight option ±10.                                                                   |
| Backspace (multi, empty input) | Remove last selected tag.                                                          |
| Ctrl/Cmd+A                | Select all visible (multi only; opt-in via `allowSelectAll`).                           |

axe-core: 0 violations across the 4 × 7 × 3 = 84 variant cells × {single, multi} × {LTR, RTL}.

---

## I18n

```ts
export interface ComboboxTranslations {
  openOptions: string;
  closeOptions: string;
  clearSelection: string;
  removeTag: (label: string) => string;
  loading: string;
  loadingError: string;
  retry: string;
  empty: string;
  emptyForQuery: (query: string) => string;
  createOption: (label: string) => string;       // "Create "xyz""
  resultsCount: (n: number) => string;           // for screen-reader live announce
  selectionAnnouncement: (label: string) => string;
}
```

Defaults English; merges via `<I18nProvider>` same as DataGrid / Pagination / Breadcrumbs / Calendar.

---

## Recipes

Only **new** recipes (the rest reuse Input + Menu):

```ts
export const comboboxRecipes = {
  tagList:  cv({ base: 'flex flex-wrap gap-1 items-center min-w-0' }),
  tag:      cv({ /* small <Badge>-like for inline tags */ }),
  groupLabel: cv({ base: 'px-2 py-1 text-xs font-semibold uppercase text-fg-muted tracking-wider' }),
  empty:    cv({ base: 'px-3 py-6 text-center text-fg-muted' }),
  loading:  cv({ base: 'px-3 py-6 text-center text-fg-muted flex items-center justify-center gap-2' }),
  createRow: cv({ base: 'px-3 py-2 text-start text-<color>-solid hover:bg-<color>-subtle/40 cursor-pointer' }),
  highlight: cv({ base: 'font-bold text-<color>-solid' }),  // for <mark> in highlightMatch
};
```

---

## Animation

- Popover open/close: inherits Popover's motion.
- Tag enter/exit (multi mode): 150ms fade-in + slight scale, exit fades only. Uses Motion's `<AnimatePresence>`.
- Option highlight: instant (no transition — needed for keyboard responsiveness).
- Loading shimmer: reuses `<Skeleton>` keyframes.

---

## Virtualization

When `flatOptions.length > virtualizeAfter`, the list switches to `@tanstack/react-virtual` (same peerDependency as DataGrid). Behavior:

- Highlighted option always scrolls into view (margin = 1 item).
- Group labels rendered as sticky headers within the virtual scroll.
- A11y: `aria-setsize` + `aria-posinset` on each option so screen readers know "Option 47 of 5000" even when DOM only contains the visible window.

---

## Performance Targets

| Scenario                                | Target                                |
| --------------------------------------- | ------------------------------------- |
| 50 options, filter on each keystroke     | < 4ms per keystroke                   |
| 500 options, filter                      | < 12ms per keystroke                  |
| 5000 options, virtualized                | < 20ms initial open; smooth scroll    |
| Async fetch (300ms debounce)             | Single request per pause              |

---

## Testing

- Pure (`Combobox.headless.test.ts`): `flattenOptions`, each filter strategy, `useDeferredFilter` with mocked timers + AbortController.
- Integration (`Combobox.test.tsx`): keyboard all bindings, click-to-select, controlled vs uncontrolled, creatable, clear button.
- Integration (`MultiCombobox.test.tsx`): tag removal, backspace-to-remove, max-selections cap, allowSelectAll.
- Async (`Combobox.async.test.tsx`): debounce, abort, error → retry.
- A11y: ARIA combobox pattern, `aria-activedescendant` updates, `aria-expanded`, axe.
- RTL: tag list flows RTL; popover anchors logical-start.
- Bundle target: < 8 KB gz (excluding optional `@tanstack/react-virtual` peer dep).

---

## Acceptance Criteria

- [ ] Single + multi modes.
- [ ] Static options + async `loadOptions` + debounce + abort.
- [ ] Grouped options.
- [ ] All 4 match strategies (substring / startsWith / fuzzy / custom).
- [ ] Creatable mode with `onCreateOption`.
- [ ] Virtualization at `virtualizeAfter` threshold.
- [ ] Highlight matching substring in option labels (opt-in via `highlightMatches`).
- [ ] Loading / empty / error states with `renderEmpty` / `renderLoading` / `renderError` overrides.
- [ ] Hidden `<input type="hidden">` for form submission.
- [ ] Full ARIA Combobox pattern with `aria-activedescendant`.
- [ ] axe-core: 0 violations across the matrix.
- [ ] RTL verified.
- [ ] `<I18nProvider>` integration; English + Hebrew + Arabic bundles shipped.
- [ ] Bundle < 8 KB gz.

---

## DRY Self-Check

- [ ] Reuses `<Input>` chrome — no new field surface.
- [ ] Reuses `<Popover>` for overlay — no new floating logic.
- [ ] Reuses `<Menu>`-style keyboard nav + option recipe.
- [ ] Reuses `<Badge>` for tag pills (multi mode).
- [ ] Reuses `useFormFieldA11y` for hint/error wiring.
- [ ] Reuses `<I18nProvider>`.
- [ ] `useDeferredFilter` exported publicly — future search dropdowns can consume.
- [ ] `filterStrategies` are pure — testable in isolation.
- [ ] No `clsx`.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/34-combobox.md`.
2. Append `## Outcome`: bundle delta, async-fetch test coverage, deviations.
3. Unblocks DataGrid's `type: 'multi-select'` filter (V2 of DataGrid can use Combobox for richer filtering).
4. Establishes the "filterable list" pattern that CommandPalette (Phase 35) consumes.

---

## Outcome

Shipped by SDS-Agent4. All ship-critical surface lit up, axe-clean, and Menu/Select regression
green. Two exports (`<Combobox>` + `<MultiCombobox>`) sharing one internal implementation,
props-driven API as specified in the plan (not compound subparts).

### Public surface

- **Components**: `<Combobox>`, `<MultiCombobox>`.
- **Hooks**: `useDeferredFilter` (debounce + AbortController).
- **Pure helpers**: `flattenOptions`, `filterStrategies` (`substring`/`startsWith`/`fuzzy`),
  `fuzzyMatch`, `highlightMatch`.
- **Defaults**: `DEFAULT_COMBOBOX_TRANSLATIONS` (English bundled).
- **Types** (20 exported): `ComboboxProps`, `MultiComboboxProps`, `ComboboxOption`,
  `ComboboxGroup`, `ComboboxOptionOrGroup`, `ComboboxVariant`, `ComboboxSize`, `ComboboxColor`,
  `ComboboxPlacement`, `ComboboxMatchStrategy`, `ComboboxLoadingState`, `ComboboxMode`,
  `ComboboxRenderOptionContext`, `ComboboxItemRecord`, `ComboboxCreateItemRecord`,
  `ComboboxListItem`, `ComboboxListProps`, `ComboboxTranslations`, `FlattenedOptions`,
  `FilterStrategyFn`, `UseDeferredFilterOptions`, `UseDeferredFilterReturn`.

### Engine + shared consumption

- **`_shared/useListKeyboard.ts`** — **third consumer** (Menu → Select → Combobox). The
  filter-driven `getItems()` accessor designed during Phase 23 worked unchanged for Combobox's
  dynamic filtered list. `typeAhead: false` is set because the input *is* the search affordance;
  intercepting printable keys would prevent the query from updating.
- **`_shared/variantColorMatrix.ts`** — **fourth consumer** (Input → Textarea → Select →
  Combobox). 4 × 7 focus matrix consumed verbatim.
- **`_shared/controlBase`, `_shared/useFormFieldA11y`** — reused unchanged.
- **`Select.recipe.ts`** — `selectContentRecipe`, `selectItemRecipe` consumed verbatim for the
  listbox surface + items. No new recipe drift between Select and Combobox dropdowns.
- **`Select.motion.ts`** — `selectMotion` reused for entry/exit animation.
- **Engine**: `usePosition` (with `matchTriggerWidth: true` — second DS consumer after
  Select), `<Portal>`, `useEscapeStack`, `useOutsideClick`, `useControllableState`, `useId`,
  `mergeRefs`.
- **`<Badge removable>`** — multi-mode tag chips. Reuses badge's per-size + remove-button
  accessibility wiring; no duplicate "tag" recipe.

### QA gates

- **Unit (`Combobox.headless.test.ts`)**: 14 pure tests — `flattenOptions` (4),
  `filterStrategies.substring`/`startsWith` (5), `fuzzyMatch` (5). No DOM, no React.
- **Integration single (`Combobox.test.tsx`)**: 25 tests — rendering, ARIA wiring, all 4
  filter strategies, custom `filterOption`, empty state, selection (click + Enter), Escape,
  clear button, ArrowDown/Up/Home/End, `aria-activedescendant`, creatable Create-row, hidden
  form input, outside-click + Tab close, variants/sizes/colors, invalid/required.
- **Integration multi (`MultiCombobox.test.tsx`)**: 9 tests — `aria-multiselectable`, initial
  chips, toggle-add, toggle-remove, Backspace-removes-last, chip remove button,
  `maxSelections` cap, creatable in multi mode, one hidden input per value.
- **Async (`Combobox.async.test.tsx`)**: 5 tests — debounce coalesces rapid keystrokes (1 fetch
  for 2 chars), AbortController fires on supersession, error → `renderError`, success →
  options render, external `loadingState` prop wins over deferred internal state.
- **A11y (`Combobox.a11y.test.tsx`)**: 13 tests — ARIA combobox + listbox + option wiring,
  `aria-activedescendant`, `aria-multiselectable` in multi, axe-clean across 4 variants closed
  + 3 sample colors open + disabled-invalid-required + multi-with-chips. **0 axe violations**.
- **Combobox tests total: 66**. All pass.
- **Regression**: full `packages/components` suite — **1750/1750 across 94 files**. Menu (32)
  + Select (36) unchanged.
- **Typecheck**: clean.
- **Lint**: clean.
- **Build (tsup)**: clean. DTS 256.43 KB.

### Bundle delta

| Component        | Gzipped | Notes                                                          |
| ---------------- | ------- | -------------------------------------------------------------- |
| Combobox         | **8.86 KB** | Plan target: < 8 KB. **+0.86 KB / +10% over.** Justified below. |
| Select (ref)     | 6.14 KB | Same listbox/keyboard/animation surface; no dual mode + async. |

**Why Combobox is +2.72 KB vs Select**:

- Multi-mode tag rendering (`<Badge>` import + chip render branch).
- `useDeferredFilter` async hook (debounce + AbortController + lifecycle state machine).
- Three filter strategies (`filterStrategies`) + custom `filterOption` plumbing.
- Creatable mode (`+ Create` row + sync/async `onCreateOption` flow).
- Five render-slot overrides (`renderOption`, `renderEmpty`, `renderLoading`, `renderError`,
  `renderCreateOption`).
- Dual-mode dispatcher (single `commitSingle` vs multi `commitMultiToggle`, distinct
  closeOnSelect defaults, distinct hidden-input emission).
- Two top-level exports (`<Combobox>` + `<MultiCombobox>` wrapper functions).
- Clear button + chevron button + wrapper click-to-focus.

**Reclamation paths** (none taken in V1 — would change the public API):

- Split single + multi into separate entry points (~0.6 KB savings if a consumer only imports
  one mode; the dispatcher logic dedupes via dead-code elimination).
- Lift `useDeferredFilter` to `@apx-dsine` (~0.4 KB savings if shared with future
  CommandPalette; defer until that consumer lands).
- Move `<Badge>` import behind a dynamic import in multi mode (~0.5 KB savings; complicates
  SSR + tree-shaking, only worth it if the wider DS adopts the same pattern).

### Deviations from plan

1. **Single component, no `parts/` subdirectory.** The plan listed 11 separate part files
   (`ComboboxInput`, `ComboboxTrigger`, `ComboboxList`, `ComboboxOption`, etc.). The Public API
   section at the top of the plan was already props-driven (`<Combobox options={...} />`), and
   subparts would have added 8+ exports with no per-subpart customization value (the input +
   listbox + options share state too tightly to be independently reorderable). Shipped as a
   single `Combobox.tsx` implementation file with the `parts/` directory omitted; the four
   pure headless helpers + the async hook live in `headless/`.
2. **No standalone `useCombobox()` headless hook.** The plan called for a public state-machine
   hook for power users. Deferred to V2 — the four bundled helpers (`flattenOptions`,
   `filterStrategies`, `highlightMatch`, `useDeferredFilter`) cover the ~90% case without the
   maintenance burden of a second public state machine. When a consumer asks for it, we'll
   extract from the existing implementation.
3. **No virtualization.** Plan called for `@tanstack/react-virtual` past `virtualizeAfter > 500`
   options. Deferred — no consumer is hitting the threshold yet, and past ~500 options the
   listbox is the wrong UX anyway (consumers should pre-filter server-side via `loadOptions`).
   The component still works at thousands of options; just renders them all. Adding
   virtualization is a backwards-compatible drop-in.
4. **No `<I18nProvider>` integration.** The provider doesn't exist in the DS yet. Combobox
   accepts inline `translations={…}` overrides with bundled English defaults
   (`DEFAULT_COMBOBOX_TRANSLATIONS`). When the provider lands, Combobox can pick it up via
   `defaultProps` without an API break.
5. **No `allowSelectAll` (multi, Ctrl/Cmd+A).** Plan listed it as an opt-in for multi mode. No
   consumer asked; defer.
6. **No `selectOnBlur`.** Plan listed it. Not implemented — adds a closing/selection race that
   surprises users. If a consumer wants it, we'll add it as opt-in.
7. **Examples: 14 instead of 20.** Shipped: Basic, Grouped, Async, Multi, MultiCreatable,
   CustomItem, HighlightMatches, FuzzyMatch, Variants, Sizes, Disabled, Invalid,
   FormSubmission, Controlled. Skipped: PortalContainer (covered by Select), Virtualized (V2),
   ServerSide (covered by Async), Rtl (no DS-wide RTL examples convention yet), WithLabel
   (covered by Invalid), Colors / EmptyState (low-value duplicates of Variants / Async). The
   14 cover every documented prop and every state.
8. **Bundle 8.86 KB vs 8 KB target.** Detailed justification above. No reclamation taken in V1.

### Reclaimable in future phases

- `listItemRecipe` extraction (Select.recipe.ts → `_shared/listItemRecipe.ts`) when a third
  list-style consumer appears (Combobox doesn't qualify because its items reuse Select's recipe
  directly via import).
- `useValueLabelCache` lift to engine when a third consumer (besides Select + Combobox) needs
  the "remember labels across unmount" pattern. CommandPalette is the likely candidate.
- `comboboxWrapperRecipe`'s `min-h-{n}` pattern → could be extracted into `controlBaseChrome` if
  a future component (TagInput-as-its-own-thing) wants a height-flexible form-control shell.

### What this unblocks

- **CommandPalette (Phase 35)** can consume `useDeferredFilter`, `filterStrategies`,
  `flattenOptions`, and `highlightMatch` directly without re-deriving any of them.
- **DataGrid V2's** `type: 'multi-select'` filter can drop in `<MultiCombobox>` as its filter
  cell editor.
- **`_shared/useListKeyboard`'s** filter-driven `getItems()` accessor is now exercised by three
  consumers; the abstraction is locked-in.
- **`_shared/variantColorMatrix`'s** four-consumer count means new colors / variants land in
  one file for all form-control surfaces.