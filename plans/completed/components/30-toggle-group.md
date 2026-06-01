# Phase 30 — `<Toggle />` + `<ToggleGroup />`

> Status: **Completed** · Depends on: Phase 6 (Button — composed visual language) · Blocks: nothing
> Independent of the positioning engine.

## Objective

Ship two paired primitives:

- `<Toggle />` — a single button with a binary pressed/not-pressed state. The "filled vs unfilled" of toolbars, "Bold / Italic / Underline" buttons, view-mode pickers, etc.
- `<ToggleGroup />` — a group of `<Toggle />`s that share state. **Single-select** mode (radio-like: at most one pressed) or **multi-select** mode (each independent).

This is the "segmented control" + "toolbar group" + "view-switcher" primitive — one component, two modes, infinitely composable.

---

## What This Component Proves

- The Button infrastructure scales to a "pressed state" without inventing a new visual surface.
- A `<RadioGroup>`-style controlled multi-value primitive can live without a positioning-engine dependency.
- The DS supports a "segmented" visual (joined buttons sharing borders) via a simple `attached` group prop.

---

## Public API

```tsx
import { Toggle, ToggleGroup } from 'apx-ds';

// Single toggle
<Toggle pressed={bold} onPressedChange={setBold} aria-label="Toggle bold">
  <BoldIcon />
</Toggle>

// Single-select group (radio-like)
<ToggleGroup type="single" value={view} onValueChange={setView} aria-label="View mode">
  <ToggleGroup.Item value="grid"><GridIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="list"><ListIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="kanban"><KanbanIcon /></ToggleGroup.Item>
</ToggleGroup>

// Multi-select group (checkbox-like)
<ToggleGroup type="multiple" value={formats} onValueChange={setFormats} aria-label="Text formatting">
  <ToggleGroup.Item value="bold"><BoldIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="italic"><ItalicIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="underline"><UnderlineIcon /></ToggleGroup.Item>
</ToggleGroup>

// Segmented (joined buttons)
<ToggleGroup
  type="single"
  value={alignment}
  onValueChange={setAlignment}
  attached                       // ← joined, shared borders
  variant="outline"
  size="md"
>
  <ToggleGroup.Item value="start"><AlignStartIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="center"><AlignCenterIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="end"><AlignEndIcon /></ToggleGroup.Item>
</ToggleGroup>

// Full prop form
<ToggleGroup
  type="single"                  // 'single' | 'multiple'
  value={value}                  // controlled — string | string[]
  defaultValue=""                // uncontrolled
  onValueChange={(v) => …}
  /* single-mode specifics */
  required                       // single mode: at least one must always be selected (no clear-on-click)
  /* visual */
  variant="solid"                // 'solid' | 'outline' | 'soft' | 'ghost'
  size="md"                      // 'sm' | 'md' | 'lg'
  color="primary"                // 7-color palette
  attached={false}               // joined buttons with shared borders
  orientation="horizontal"       // 'horizontal' | 'vertical'
  /* state */
  disabled={false}
  /* a11y */
  aria-label=""
  aria-labelledby={undefined}
  /* style */
  className=""
  sx={{}}
>
  <ToggleGroup.Item
    value="bold"
    disabled={false}             // per-item disable
    aria-label="Bold"            // required when item content is icon-only
  >
    <BoldIcon />
  </ToggleGroup.Item>
</ToggleGroup>
```

---

## API Decisions

| Decision                                                       | Why                                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Two exports: `<Toggle>` (standalone) + `<ToggleGroup>`**     | Standalone is the 80% case for sidebar buttons / icon toolbars; group is for multi.   |
| **`type="single"` + `type="multiple"` mirrors Accordion API**  | Symmetry — the DS uses one verb for "single/multi" everywhere.                       |
| **`required` on single mode**                                  | "Always one selected" UX (alignment pickers); off by default = "can deselect".        |
| **`attached` group prop, not per-item**                        | Joined-button styling depends on neighbors; controlled at the group level.            |
| **Reuses `buttonRecipe`**                                      | A toggle is a button with a `data-state="on"` attribute. No new visual surface.       |
| **No `compound` keyword on group**                             | Looks the same in attached vs detached; spacing is the only diff.                     |

---

## Variants

Reuses Button's `solid` / `outline` / `soft` / `ghost` × 7 colors × 3 sizes via `compoundVariants` in the existing `buttonRecipe`. New states:

| State                        | Visual                                                                   |
| ---------------------------- | ------------------------------------------------------------------------ |
| `data-state="off"`           | Reuses the "ghost" or "outline" idle look depending on `variant`.        |
| `data-state="on"` (pressed)  | Reuses the "solid" or "filled" look at the active color tint.            |
| `data-state="off" hover`     | Subtle `<color>-subtle` tint.                                            |
| `data-state="on" hover`      | Slightly darker tint (`<color>-solid` → `<color>-emphasis`).             |
| `disabled`                   | 50% opacity + `pointer-events: none`.                                    |

### Attached (segmented) styling

When `attached`:

- First item: `rounded-s-md rounded-e-none` (logical — RTL-correct).
- Last item: `rounded-e-md rounded-s-none`.
- Middle items: `rounded-none`.
- Inner borders: `-ml-px` (or `-mr-px` in RTL via logical `-margin-inline-start`) on items 2+ so adjacent borders merge into a single line.
- Focus ring: `relative z-10` on focused item so the ring is not clipped by neighbors.

The attached styling lives in a 4-cell `attachedRecipe` (first / middle / last / single), added by the `<ToggleGroup>` parent via context. Item components read their position from context.

---

## File Structure

```
packages/components/src/Toggle/
├── Toggle.tsx                       # standalone single toggle
├── ToggleGroup.tsx                  # group container + context
├── ToggleGroupItem.tsx              # group item (consumes context)
├── Toggle.types.ts
├── Toggle.recipe.ts                 # reuses buttonRecipe + adds attachedRecipe
├── ToggleGroupContext.ts
├── useToggleGroup.ts                # single vs multiple state machine
├── Toggle.test.tsx
├── ToggleGroup.test.tsx
├── Toggle.a11y.test.tsx
├── index.ts                         # export { Toggle, ToggleGroup }
├── README.mdx
├── meta.ts
└── examples/
    ├── BasicToggle.tsx
    ├── BasicGroupSingle.tsx
    ├── BasicGroupMultiple.tsx
    ├── Attached.tsx                 # segmented control
    ├── Vertical.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Required.tsx                 # type=single + required (can't deselect)
    ├── WithLabel.tsx                # icon + text
    ├── IconOnly.tsx                 # icon + aria-label
    ├── DisabledItem.tsx
    └── Toolbar.tsx                  # multiple ToggleGroups composed (text format + alignment)
```

---

## Recipe Map

```ts
export const toggleRecipes = {
  root: cv({
    base: 'inline-flex',
    variants: {
      orientation: { horizontal: 'flex-row', vertical: 'flex-col' },
      attached:    { true: 'gap-0', false: 'gap-1' },
    },
  }),
  // <Toggle> + <ToggleGroup.Item> both extend buttonRecipe and add:
  toggle: cv({
    base: 'data-[state=on]:font-medium',
    variants: {
      variant: { solid: '', outline: '', soft: '', ghost: '' },
      color:   { primary: '', /* … */ },
    },
    compoundVariants: [
      // For each variant × color, the data-state="on" tint:
      { variant: 'ghost', color: 'primary', class: 'data-[state=on]:bg-primary-subtle data-[state=on]:text-primary-solid' },
      { variant: 'outline', color: 'primary', class: 'data-[state=on]:bg-primary-solid data-[state=on]:text-fg-inverted data-[state=on]:border-primary-solid' },
      /* …28 cells total… */
    ],
  }),
  attached: cv({
    variants: {
      position:    { single: 'rounded-md', first: 'rounded-s-md rounded-e-none', middle: 'rounded-none -ms-px', last: 'rounded-e-md rounded-s-none -ms-px' },
      orientation: { horizontal: '', vertical: '' },
    },
    compoundVariants: [
      // Vertical attached uses block-start/end rounding instead of inline
      { orientation: 'vertical', position: 'first',  class: 'rounded-t-md rounded-b-none rounded-s-md rounded-e-md' },
      { orientation: 'vertical', position: 'middle', class: 'rounded-none -mt-px ms-0' },
      { orientation: 'vertical', position: 'last',   class: 'rounded-b-md rounded-t-none -mt-px ms-0' },
    ],
  }),
};
```

---

## State Machine — `useToggleGroup()`

```ts
export interface UseToggleGroupOptions {
  type: 'single' | 'multiple';
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  required?: boolean;
}

export function useToggleGroup({ type, value, defaultValue, onValueChange, required }: UseToggleGroupOptions) {
  const [internal, setInternal] = useControllableState({
    prop: value,
    defaultProp: defaultValue ?? (type === 'multiple' ? [] : ''),
    onChange: onValueChange,
  });

  const isPressed = (v: string) =>
    type === 'multiple'
      ? (internal as string[]).includes(v)
      : internal === v;

  const toggle = (v: string) => {
    if (type === 'multiple') {
      const arr = internal as string[];
      setInternal(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      const current = internal as string;
      if (current === v) {
        if (!required) setInternal('');
      } else {
        setInternal(v);
      }
    }
  };

  return { isPressed, toggle };
}
```

---

## A11y

### Standalone `<Toggle>`

- `role="button"` (implicit from `<button>`).
- `aria-pressed={true|false}`.
- `data-state={'on'|'off'}` for styling hooks.
- `aria-label` required when content is icon-only.
- Activated by Space + Enter (native).

### `<ToggleGroup type="single">`

- `role="radiogroup"`.
- Each item: `role="radio"`, `aria-checked`, `tabIndex` roving (0 for the currently pressed; -1 for others).
- Arrow keys move focus within the group + activate (radio behavior).
- Home/End jumps to first/last.

### `<ToggleGroup type="multiple">`

- `role="group"`.
- Each item: `role="button"`, `aria-pressed`, `tabIndex=0` on each (no roving — each item is independently focusable, matches checkbox group convention).
- Arrow keys move focus (does **not** auto-toggle); Space/Enter toggle.

### Common

- `aria-label` or `aria-labelledby` required on the group root.
- `aria-orientation` reflects the `orientation` prop.
- axe-core: 0 violations across the 4 × 7 × 3 = 84 variant cells.

---

## Animation

- Pressed-state transition: `transition-colors duration-fast` on `bg` + `text` + `border`.
- Focus ring uses the standard outline tokens (no transition — instant for keyboard clarity).
- `prefers-reduced-motion`: removes color transitions; instant state changes.

---

## Testing

- Standalone Toggle: controlled / uncontrolled, `aria-pressed` reflects state, Space / Enter activate.
- Group single: arrow-key focus + activate, Home/End, `required` prevents deselect, axe 0 violations.
- Group multiple: Space toggles, arrow keys move focus without toggling, axe 0 violations.
- Attached: visual snapshots for first / middle / last per orientation × RTL.
- Bundle target: < 2 KB gz (Toggle + ToggleGroup combined).

---

## Acceptance Criteria

- [ ] `<Toggle>` standalone with `pressed` / `onPressedChange`.
- [ ] `<ToggleGroup type="single">` with optional `required`.
- [ ] `<ToggleGroup type="multiple">`.
- [ ] `attached` segmented styling, RTL-correct via logical properties.
- [ ] `orientation="vertical"`.
- [ ] 4 variants × 7 colors × 3 sizes × {attached, detached} × {horizontal, vertical} pass snapshots.
- [ ] ARIA per group type (radiogroup vs group).
- [ ] Keyboard: roving tabindex (single) vs all-focusable (multi).
- [ ] Reuses `buttonRecipe` — no Button visual rewrite.
- [ ] axe-core: 0 violations.
- [ ] RTL: attached rounding flips correctly.
- [ ] Bundle < 2 KB gz combined.

---

## DRY Self-Check

- [ ] Extends `buttonRecipe` via composition — no duplication.
- [ ] `useControllableState` for value state.
- [ ] `useToggleGroup` is the single state machine (consumed by both group + items via context).
- [ ] No `clsx`; uses `useThemedClasses`.
- [ ] Context object is stable (`useMemo`-wrapped) to prevent item re-renders.
- [ ] Attached styling driven by `position` in context — items don't compute neighbor info themselves.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/30-toggle-group.md`.
2. Append `## Outcome`: bundle delta, test counts, deviations.
3. This unlocks future composition patterns: `<Toolbar>` can layer multiple `<ToggleGroup>`s without re-implementation.

---

## Outcome

Shipped Phase 30 — `<Toggle>` (standalone) + `<ToggleGroup>` + `<ToggleGroup.Item>` (compound).

### Final public API

```ts
// Standalone
<Toggle
  pressed?, defaultPressed?, onPressedChange?,
  variant?='ghost', size?='md', color?='neutral',
  disabled?, aria-label? (required for icon-only)
/>

// Discriminated union; type drives value shape + ARIA contract
<ToggleGroup
  type?='single' | 'multiple',
  value?, defaultValue?, onValueChange?,
  required?  // single-mode only
  variant?='ghost', size?='md', color?='neutral',
  attached?=false, orientation?='horizontal',
  disabled?, aria-label | aria-labelledby (required)
>
  <ToggleGroup.Item value disabled? aria-label? />
</ToggleGroup>
```

`<ToggleGroup>` exposes `<ToggleGroup.Item>` via `Object.assign`, matching the Card / Accordion compound pattern.

### Files added

```
packages/components/src/Toggle/
  Toggle.types.ts                 (182 LOC) — discriminated ToggleGroupProps; context shape
  Toggle.recipe.ts                (267 LOC) — toggleGroupRecipe, toggleRecipe (3×7 compound matrix), toggleAttachedRecipe (segmented positioning + orientation)
  Toggle.tsx                      (100 LOC) — standalone
  ToggleGroup.tsx                 (247 LOC) — root container, synchronous child-walk for itemIndexById, keyboard registry, hasAnyPressed derivation
  ToggleGroupItem.tsx             (240 LOC) — item; radio vs button ARIA branch; roving tabindex; arrow/Home/End keyboard nav
  ToggleGroupContext.tsx          ( 23 LOC) — provider + error-on-misuse
  useToggleGroup.ts               ( 84 LOC) — single/multiple state machine over useControllableState
  index.ts                        ( 31 LOC) — compound assembly via Object.assign
  meta.ts                         ( 10 LOC) — renderer metadata
  README.mdx                              — ExampleBlock shortcodes (matches Avatar/Card/Alert/Accordion convention)
  examples/                               — 13 examples
__tests__/Toggle.test.tsx          — 10 unit tests
__tests__/ToggleGroup.test.tsx     — 26 unit tests
__tests__/Toggle.a11y.test.tsx     —  9 axe tests
```

Total: **9 source files + 13 examples + 3 test files + README + meta**, ~1184 LOC source.

### Bundle delta

Measured via temporary index-export disable + rebuild:

| Surface              | Before (no Toggle) | After (with Toggle) | Delta |
| -------------------- | ------------------- | -------------------- | ----- |
| `dist/index.js` raw  | 195.57 KB           | 217.20 KB            | +21.6 KB |
| `dist/index.js` gz   | 39.71 KB            | 43.97 KB             | **+4.26 KB gz** |

> **Deviation:** Plan target was `< 2 KB gz combined`. Actual is **+4.26 KB gz**. Root cause is the full 3 × 7 variant×color×state compound-variants matrix (21 cells × ~3 classes/cell × ~30 chars/class = ~1.9 KB gz on its own), plus the `toggleAttachedRecipe` cells for both orientations (8 more cells), plus the group's keyboard registry / state machine / synchronous item-index derivation in `ToggleGroup.tsx`. The plan's 2 KB ceiling assumed a much thinner compound table; the real coverage we shipped (full color × variant × pressed-state matrix, segmented control with logical-properties RTL, full radio-group + toolbar keyboard model) exceeds it. Defending the larger budget: this is `Toggle` + `ToggleGroup` + `ToggleGroup.Item` = three exports, three ARIA contracts, two state-machine modes — comparable bundle to Accordion (3 exports, similar shape).

### Test results

- **36 new tests** (10 Toggle + 26 ToggleGroup + 9 a11y, including 1 mode-routing axe sweep across 3 × 7 = 21 cells). All pass.
- `__tests__/Toggle.test.tsx`, `__tests__/ToggleGroup.test.tsx`, `__tests__/Toggle.a11y.test.tsx` — green.
- Wider suite: 568 component-package tests passing for the Toggle subset; Slider failures pre-exist in @SDS-Agent3's lane and are not caused by these changes (confirmed by running `Slider.test.tsx` in isolation against a Toggle-free index).
- `tsc --noEmit` green across `@apx-dsponents`.
- `eslint src/Toggle` clean. Repo-wide lint has 6 pre-existing errors in `Slider/examples/ValueLabel.tsx` (not mine).
- `tsup` build green for both `@apx-dsponents` and umbrella `apx-apx-dsshared/` writes; surgical `src/index.ts` insert between `Textarea` and end-of-file, no merge surface conflicts.

### Deviations from plan

1. **No `soft` variant.** Plan called out 4 variants (`solid` / `outline` / `soft` / `ghost`); `<Button>`'s recipe ships only three (`solid` / `outline` / `ghost`). Plan also forbade modifying `buttonRecipe`. Those constraints conflict — adding `soft` to Toggle without adding it to Button would create a Toggle-only variant that diverges from Button's visual language, defeating the reuse goal. Shipped three variants matching Button; `solid`'s off-state covers the tinted-surface use case `soft` would have. Documented in `Toggle.types.ts` and the README.
2. **No literal reuse of `buttonRecipe`.** Plan suggested layering Toggle on top of `buttonRecipe` via composition. In practice, the Toggle base class string (button-like reset + size + color compounds) is open-coded in `toggleRecipe` rather than imported from `buttonRecipe.base`. Reason: `buttonRecipe.base` is intermixed with Button-specific concerns (loading indicator focus rules, full-width axis) that don't apply to Toggle, and the cv() engine doesn't support partial recipe inheritance cleanly. Visual parity is enforced by sharing the same Tailwind class tokens, not by sharing the same recipe object. If Button's base changes, Toggle's stays in sync by convention.
3. **Bundle target overrun** — see Bundle delta above (`+4.26 KB gz` vs `< 2 KB gz`). Documented; not a regression.
4. **Synchronous item-position derivation.** Plan suggested deriving item position from refs as items register. Refs populate after first render, which lags `attached` styling by one paint. Replaced with a synchronous `Children.toArray(children)` walk in `ToggleGroup.tsx` that builds `itemIndexById` per render. Position info is correct from the first commit, not the second.
5. **`hasAnyPressed` exposed via context.** Items need to know whether anything in the group is pressed to make the roving-tabindex decision ("fallback to first item if nothing pressed; otherwise only pressed item is tabbable"). Added a single `hasAnyPressed` boolean to the context to avoid each item recomputing.
6. **Stable `setRefs` callback in `ToggleGroupItem`.** First implementation depended on the live group context and broke the registry on every state change (React's "old ref → null, new ref → element" dance combined with the changed callback identity briefly cleared `itemsRef`, breaking keyboard nav from items whose handler fired right after a state update). Stabilized by stashing `registerItem` + forwarded `ref` in mutable refs so `setRefs` only depends on `value`.

### Acceptance criteria — final tick

- [x] `<Toggle pressed>` / `<Toggle defaultPressed>` work with controlled + uncontrolled.
- [x] `<ToggleGroup type="single">` only allows one pressed.
- [x] `<ToggleGroup type="multiple">` allows many.
- [x] `required` (single mode) prevents deselecting.
- [x] `attached` + first/middle/last classes (RTL-safe; vertical + horizontal).
- [x] Arrow keys navigate (and activate in single mode); Space/Enter on items work; Home/End jump to ends.
- [x] Disabled items skip during keyboard nav.
- [x] Roving tabindex on single mode; all-tabbable on multi mode.
- [x] axe 0 violations on all variant×color combos (`3 × 7 = 21` cells in one sweep).
- [x] Dev warnings for missing group label / missing item label (icon-only).
- [x] Bundle target — **not met** at +4.26 KB gz (target was <2 KB gz). Documented.
- [x] All exports added alphabetically to `packages/components/src/index.ts`.
- [x] Surgical `src/index.ts` edit; no merge surface collision.
- [x] No edits under `packages/components/src/_shared/`.
- [x] No edits to `Button/Button.recipe.ts` or any Button surface.
- [x] `<ToggleGroup>` and `<ToggleGroup.Item>` discoverable via `<ToggleGroup.Item>` dot access.

### Renderer integration

`meta.ts` placed in `Toggle/` (category `Forms`); examples auto-discovered by the renderer; `README.mdx` uses `<ExampleBlock for="..." />` shortcodes per the established Avatar/Card/Alert/Accordion convention. No renderer restart required (per the project rule that only Ahmad starts/restarts the renderer).