# Phase 8 — `<Textarea />`

> Status: **Pending** · Depends on: Phase 7 (Input — provides `_shared/controlRecipe.ts` + `useFormFieldA11y`) · Blocks: none

## Objective

Ship the multi-line text input — `<Textarea />` — covering the same variant matrix as `<Input />`,
plus the two multi-line-specific concerns: **auto-resize** and **character count**.

Textarea is the **first DRY proof point** of the form-control shared layer extracted in Phase 7.
If Textarea ends up with its own copy of the variant shell, we failed Phase 7. The expectation is:

- `controlBase` from `_shared/controlRecipe.ts` — **imported, not duplicated**.
- `useFormFieldA11y` — **imported, not duplicated**.
- Recipe shape, prop names, override layer, focus-ring story — **identical to Input**.
- New surface area = `rows`, `minRows`, `maxRows`, `autoResize`, `resize`, `showCount`, `maxLength` UX.

---

## What This Component Proves

- The shared form-control recipe really is shared (zero duplication).
- The DS can host a **height-changing** component without breaking the surrounding layout (auto-resize uses a hidden mirror, not raw scroll-height reads).
- `data-*` state attributes scale to a second form control (`data-resizing`, `data-at-limit`).

---

## Public API

```tsx
import { Textarea } from 'apx-ds';

<Textarea placeholder="Tell us about yourself…" />

<Textarea
  variant="outline"               // same axis as Input
  size="md"                       // 'sm' | 'md' | 'lg'
  color="primary"                 // focus-ring accent
  fullWidth={true}                // default true

  rows={4}                        // initial height when not auto-resizing
  minRows={2}                     // floor when auto-resizing
  maxRows={10}                    // ceiling — overflow becomes a scrollbar after this
  autoResize={true}               // default true — grows with content
  resize="vertical"               // 'none' | 'vertical' | 'horizontal' | 'both' (manual override)

  maxLength={500}
  showCount={true}                // shows "123 / 500" in the bottom-right
  invalid={false}
  disabled={false}
  readOnly={false}
  required={false}

  value={value}
  onChange={(e) => setValue(e.target.value)}

  className=""
  style={{}}
  sx={{}}
/>
```

### Prop Decisions

- **`autoResize` defaults to `true`** — modern UX. Consumers explicitly opt out for fixed-height layouts.
- **`resize="vertical"` is the default** — matches what 90% of consumers expect from a textarea. Works alongside `autoResize`: a user can still drag below the auto-resize ceiling if `resize !== 'none'`.
- **`showCount` is independent of `maxLength`** — `showCount` without `maxLength` shows just the current length. `maxLength` without `showCount` enforces the cap silently.
- **No `leftIcon` / `rightIcon` / `addons`** — they don't make sense on a multi-line surface. The recipe omits those axes entirely.

---

## Variants — Designed Inline

**Same four variants as Input**: `outline` (default), `solid`, `ghost`, `underline`. Same color rules,
same compound rows. The recipe re-exports the same compound-variant generator pattern from `_shared/`.

> **DRY note**: Rather than re-listing the variant×color matrix, this plan inherits Input's matrix
> by reference. Any change to Input's matrix automatically affects Textarea — that's the test.

### Sizes

| Size | Padding-Y | Padding-X | Font          | Min height (rows=1) |
| ---- | --------- | --------- | ------------- | ------------------- |
| `sm` | `py-1.5`  | `px-2.5`  | `text-sm`     | `~28px`             |
| `md` | `py-2`    | `px-3`    | `text-sm`     | `~36px`             |
| `lg` | `py-3`    | `px-4`    | `text-base`   | `~44px`             |

Heights are derived from `rows × line-height + 2*padding-y + 2*border-width` so a `rows={1}` textarea
reads as the same height as the matching Input size — visual consistency across the form.

### Textarea-only variants

None. The variants are inherited verbatim. If Textarea ever needs a unique variant (e.g. `code` —
monospace font, gray background), it's added here without changing Input.

### Compound rules unique to Textarea

```ts
compoundVariants: [
  { resize: 'none', class: 'resize-none' },
  { resize: 'vertical', class: 'resize-y' },
  { resize: 'horizontal', class: 'resize-x' },
  { resize: 'both', class: 'resize' },
  { autoResize: true, class: 'overflow-hidden' }, // hidden until maxRows reached
  { autoResize: true, resize: 'none', class: 'resize-none' }, // belt + suspenders
]
```

---

## File Structure

```
packages/components/src/Textarea/
├── Textarea.tsx
├── Textarea.types.ts
├── Textarea.recipe.ts
├── Textarea.test.tsx
├── Textarea.a11y.test.tsx
├── README.mdx
├── meta.ts
├── useAutoResize.ts           # local hook — mirror-element height measurement
└── examples/
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── AutoResize.tsx
    ├── WithCount.tsx          # maxLength + showCount
    ├── Invalid.tsx
    ├── Disabled.tsx
    ├── ResizeModes.tsx        # none / vertical / horizontal / both
    └── Controlled.tsx
```

---

## Recipe Sketch

```ts
// Textarea.recipe.ts
import { cv } from '@apx-dsine';
import { controlBase } from '../_shared/controlRecipe';

export const textareaRecipe = cv({
  base: [
    controlBase,
    'border',
    'block w-full',              // textareas are block by default
    'leading-relaxed',
    'min-h-[var(--textarea-min-h)]',
  ].join(' '),
  variants: {
    variant: {
      outline:   'border-border bg-bg-paper',
      solid:     'border-transparent bg-bg-subtle',
      ghost:     'border-transparent bg-transparent',
      underline: 'border-0 border-b border-border rounded-none bg-transparent',
    },
    size: {
      sm: 'py-1.5 px-2.5 text-sm rounded-sm',
      md: 'py-2 px-3 text-sm rounded-md',
      lg: 'py-3 px-4 text-base rounded-lg',
    },
    color: { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
    fullWidth: { true: 'w-full', false: 'w-auto' },
    resize: { none: 'resize-none', vertical: 'resize-y', horizontal: 'resize-x', both: 'resize' },
    autoResize: { true: 'overflow-hidden' },
  },
  compoundVariants: [
    // Inherits Input's variant × color matrix exactly — generated by the same helper
    ...inputVariantColorMatrix({ for: 'Textarea' }),
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'md',
    color: 'primary',
    fullWidth: true,
    resize: 'vertical',
    autoResize: true,
  },
});
```

> The `inputVariantColorMatrix` helper lives in `_shared/variantColorMatrix.ts` (extracted from Input).
> Reusing it means Textarea's focus-ring + invalid behavior **cannot drift** from Input's. If Phase 7
> didn't extract this helper, do it as the first task of Phase 8 and back-port to Input.

---

## Component Sketch

```tsx
'use client';
import { forwardRef } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';
import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import { useAutoResize } from './useAutoResize';
import { textareaRecipe } from './Textarea.recipe';
import type { TextareaProps } from './Textarea.types';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const {
    variant, size, color, fullWidth, resize, autoResize,
    rows = 3, minRows, maxRows,
    maxLength, showCount,
    invalid, disabled, readOnly, required, value, defaultValue,
    className, style, sx,
    onChange,
    ...rest
  } = props;

  const a11y = useFormFieldA11y({ id: props.id, invalid, required, 'aria-describedby': props['aria-describedby'] });
  const { textareaRef, currentLength } = useAutoResize({
    enabled: autoResize ?? true,
    minRows: minRows ?? rows,
    maxRows,
    value: value ?? defaultValue,
  });

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: textareaRecipe,
    componentName: 'Textarea',
    props: { variant, size, color, fullWidth, resize, autoResize, className, sx, style },
  });

  const showFooter = showCount || maxLength !== undefined;

  return (
    <div className="relative w-full" data-disabled={disabled || undefined}>
      <textarea
        ref={mergeRefs(ref, textareaRef)}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        {...a11y}
        {...rest}
        className={cls}
        style={rootStyle}
      />
      {showFooter ? (
        <div
          className="absolute bottom-1 right-2 text-xs text-fg-muted tabular-nums pointer-events-none"
          data-at-limit={maxLength !== undefined && currentLength >= maxLength ? 'true' : undefined}
        >
          {maxLength !== undefined ? `${currentLength} / ${maxLength}` : currentLength}
        </div>
      ) : null}
    </div>
  );
}, 'Textarea');
```

### `useAutoResize` hook

```ts
// Mirror-element strategy: render an invisible <div> with the same width / typography as the
// textarea, copy its text into the mirror's textContent, measure the mirror's offsetHeight, set
// the textarea's inline height to that value (clamped between min and max rows worth of lineHeight).
//
// Why mirror instead of `scrollHeight`: scrollHeight reads only work when the textarea's height is
// `auto`, which causes a layout thrash on every keystroke. The mirror is layout-independent and
// measured in `useIsomorphicLayoutEffect` — flicker-free.
```

The mirror approach is well-trodden (Chakra, Mantine, react-textarea-autosize) — we re-implement
~30 lines instead of taking a dependency.

---

## Types

```ts
import type { TextareaHTMLAttributes } from 'react';
import type { ResponsiveValue, Sx } from '@apx-dsine';
import type { InputVariant, InputColor } from '../Input/Input.types';

export type TextareaVariant = InputVariant;   // alias — shared axis
export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaColor = InputColor;
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'color'> {
  variant?: ResponsiveValue<TextareaVariant>;
  size?: ResponsiveValue<TextareaSize>;
  color?: ResponsiveValue<TextareaColor>;
  fullWidth?: ResponsiveValue<boolean>;
  resize?: TextareaResize;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  invalid?: boolean;
  showCount?: boolean;
  sx?: Sx;
}
```

> Reusing `InputVariant` and `InputColor` as the type source is intentional — adding a variant to
> Input adds it to Textarea (and the compiler enforces it).

---

## Accessibility

- Native `<textarea>` — preserves all default ARIA semantics.
- Same label rules as Input: dev-warn fires (`TEXTAREA_NO_LABEL`) when there's no associated label and no `aria-label`.
- `aria-invalid`, `aria-required`, `aria-describedby` set by `useFormFieldA11y`.
- Character counter footer is `aria-hidden` because the count is also announced by the textarea's `aria-describedby` if the consumer wires it up.
- `data-at-limit` flips to `true` when content hits `maxLength` — consumers can style or animate from this.
- `autoResize` does **not** suppress the native `Esc → undo` behavior.
- `axe-core`: zero violations in `Textarea.a11y.test.tsx`.

---

## Animation / Interactions

- Auto-resize height transition: CSS `transition-[height] duration-fast ease-standard` — feels alive without being janky on fast typing.
- `motion-reduce:transition-none` honors `prefers-reduced-motion`.
- Counter at-limit pulse: a brief 200ms `bg-danger/10` flash via Tailwind animation utility. Honors reduced-motion (suppressed).

---

## Responsive

```tsx
<Textarea
  rows={{ base: 2, md: 4 }}             // responsive rows works through the engine
  size={{ base: 'sm', lg: 'md' }}
/>
```

`rows` becomes a special case: the engine resolves it before passing to the native `<textarea>` (numbers, not classes — passed through via `resolveResponsive`).

---

## RTL

- Counter footer pinned to logical end: `start-2` swap when `dir=rtl`. Use `end-2` token (Tailwind logical-utility plugin or `[dir=rtl]:left-2 [dir=ltr]:right-2`).
- Resize handle position is browser-controlled — RTL flips automatically.
- Mirror element copies the same `direction` from the textarea so wrapping math stays correct.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Textarea: {
      defaultProps: { autoResize: false, rows: 6 },
      styleOverrides: { root: 'font-mono leading-snug' },
    },
  },
})} />

<Textarea className="font-mono" sx={{ radius: 'xl' }} style={{ minHeight: 240 }} />
```

---

## Examples List

| File              | Demonstrates                                |
| ----------------- | ------------------------------------------- |
| `Basic.tsx`       | Default with placeholder                    |
| `Variants.tsx`    | Outline / solid / ghost / underline         |
| `Sizes.tsx`       | sm / md / lg                                |
| `AutoResize.tsx`  | Grows as you type; capped at `maxRows`      |
| `WithCount.tsx`   | `showCount` + `maxLength` interplay         |
| `Invalid.tsx`     | Invalid + helper-text composition           |
| `Disabled.tsx`    | Disabled + read-only                        |
| `ResizeModes.tsx` | All four `resize` values                    |
| `Controlled.tsx`  | Controlled + uncontrolled side-by-side      |

---

## Testing Plan

`Textarea.test.tsx`:
- Renders default
- `variant` / `size` / `color` apply correct classes
- `resize` prop maps to correct Tailwind class
- `autoResize` grows the height with content (jsdom: assert `style.height` changes on input event)
- `minRows` + `maxRows` clamp the auto-resize range
- `maxLength` is set on the underlying element
- `showCount` renders the counter footer with the right text
- `data-at-limit` flips when length reaches `maxLength`
- `invalid` sets `aria-invalid` + `data-invalid`
- Controlled + uncontrolled both work
- `ref` is forwarded to the `<textarea>` element
- DRY: importing `controlBase` from `_shared` produces visually identical state to Input

`Textarea.a11y.test.tsx`:
- axe passes for every variant × state cell
- Dev-warn fires for no-label case
- Keyboard: Tab focuses textarea; Tab again leaves; Shift+Enter inserts newline (native)

---

## File-Level Tasks (Ordered)

1. [ ] If Phase 7 did **not** extract `_shared/variantColorMatrix.ts`, do it as task 1
2. [ ] Create `packages/components/src/Textarea/` folder
3. [ ] Write `Textarea.types.ts` (re-uses `InputVariant`, `InputColor`)
4. [ ] Write `Textarea.recipe.ts`
5. [ ] Write `useAutoResize.ts` (~30 lines, mirror strategy)
6. [ ] Write `Textarea.tsx`
7. [ ] Write `meta.ts` (category `Inputs`, tags `['form', 'text', 'multiline']`)
8. [ ] Write `Textarea.test.tsx`
9. [ ] Write `Textarea.a11y.test.tsx`
10. [ ] Write 9 example files
11. [ ] Write `README.mdx`
12. [ ] Export `Textarea` from package index
13. [ ] Re-export from `apx-ds
14. [ ] Renderer discovery check — Textarea page renders with all examples
15. [ ] Bundle delta < 2 KB gzipped (most of the surface is shared with Input)

---

## Acceptance Criteria

- [ ] All four variants × seven colors render identically to Input's matrix.
- [ ] Auto-resize grows smoothly between `minRows` and `maxRows`, then scrolls.
- [ ] `showCount` reflects controlled + uncontrolled values correctly.
- [ ] `data-at-limit` flips at `maxLength` and is targetable from custom CSS.
- [ ] Override ladder works (theme defaults, className, sx, style).
- [ ] RTL: counter footer + scrollbar both on the logical end.
- [ ] axe-core: zero violations across the matrix.
- [ ] **No duplicated code from Input** — `controlBase`, `useFormFieldA11y`, and `variantColorMatrix` are all imports.

---

## DRY Self-Check

- [ ] `Textarea.recipe.ts` imports `controlBase` from `_shared/`
- [ ] `Textarea.recipe.ts` imports the variant×color matrix from `_shared/variantColorMatrix.ts`
- [ ] `Textarea.tsx` imports `useFormFieldA11y` from `_shared/`
- [ ] `TextareaVariant` aliases `InputVariant` — single source of truth
- [ ] Adding a variant to Input adds it to Textarea without touching Textarea code (assert via TS type check)

---

## Out of Scope (Future Components / Phases)

- Rich-text editing (markdown / WYSIWYG) — separate component family.
- Code editor (Monaco / CodeMirror integration) — separate component.
- Mentions / inline tags — needs an autocomplete popover.
- `<Field>` wrapper — ships after the form-control trio.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/08-textarea.md`.
2. Append `## Outcome`: API, bundle delta, axe results, DRY-with-Input confirmation, deviations.
3. Resume Phase 9 — Checkbox.

---

## Outcome — shipped 2026-05-20 by SDS-Agent2

### Shipped API

```tsx
<Textarea
  variant="outline" | "solid" | "ghost" | "underline"     // default 'outline'
  size="sm" | "md" | "lg"                                  // default 'md'
  color="primary" | … | "neutral"                          // default 'primary'
  fullWidth={boolean}                                      // default true
  rows={number}                                            // default 3
  minRows={number}                                         // default = rows
  maxRows={number | undefined}                             // no ceiling by default
  autoResize={boolean}                                     // default true
  resize="none" | "vertical" | "horizontal" | "both"       // default 'vertical'
  showCount={boolean}
  maxLength={number}
  invalid={boolean}
  disabled, readOnly, required, value, defaultValue, onChange,
  className, style, sx, …all native TextareaHTMLAttributes
/>
```

Types: `TextareaVariant`, `TextareaSize`, `TextareaColor`, `TextareaResize`, `TextareaProps`.
`TextareaVariant` aliases `InputVariant` and `TextareaColor` aliases `InputColor` so the two
surfaces stay type-locked (adding a variant to Input adds it to Textarea, compile-checked).

### DRY-with-Input confirmation

Textarea consumes **three** shared primitives without re-implementing any:

1. **`controlBase`** (`_shared/controlRecipe.ts`) — typography defaults, focus-ring scaffolding,
   `aria-[invalid=true]:` + `data-[disabled=true]:` selectors. Layout primitive lives in each
   consumer's own `base` after Phase 7¹.
2. **`useFormFieldA11y`** (`_shared/useFormFieldA11y.ts`) — id generation, `aria-invalid`,
   `aria-required`, `aria-describedby` pass-through, `data-invalid` mirror.
3. **`variantColorMatrix({ for: 'Textarea' })`** (`_shared/variantColorMatrix.ts` — **NEW this
   phase**) — the 28 variant×color compound rows extracted from Input as the second-consumer
   refactor. `Input.recipe.ts` back-ported to consume the same helper in the same PR. Adding a
   color is now one entry per variant (one file edit), both surfaces pick it up.

Runtime DRY proof asserted by `Textarea — DRY with Input shared layer` (`Textarea.test.tsx`):
the rendered wrapper className must contain `group/control`, `outline-none`,
`focus-within:ring-2`, and `aria-[invalid=true]:border-danger`. If anyone re-implements the
shared base by hand and drops one of these, the test fails before review.

### Bundle delta

- Before (after Phase 12 Badge): `@apx-dsponents` ESM = **6.93 KB gz**.
- After (Phase 8 Textarea): **7.7 KB gz**.
- **Delta: ~0.77 KB gz** — well under the 2 KB target. Most of Textarea's surface comes from
  shared `_shared/*` and the imported variant×color matrix.

### Test results

- `Textarea.test.tsx` — **33 unit tests passing** (rendering, variant×color matrix, multi-line
  knobs, counter footer, auto-resize behavior, state semantics, controlled/uncontrolled,
  overrides, ref forwarding, DRY-with-Input runtime assertion).
- `Textarea.a11y.test.tsx` — **11 a11y tests passing** including axe-clean across every
  variant × invalid × disabled cell. Dev-warn fires on missing label, suppressed when
  `aria-label` / wrapping `<label>` / `<label for>` is present.
- Typecheck clean. Lint clean. Build clean (ESM + CJS + DTS).

### Deviations from the original plan

1. **`useAutoResize` uses `scrollHeight` instead of a mirror element.** The plan suggested an
   off-screen mirror `<div>` for flicker-free measurement. In practice, `scrollHeight` measured
   inside `useIsomorphicLayoutEffect` (paint-blocking) works without observable jank for the
   typing speeds this DS targets. The mirror strategy is a worthwhile follow-up if profiling
   ever shows the read in a flame graph. Cost saved: ~50 lines + a separately-styled mirror
   element that has to stay in sync with the textarea's typography.
2. **`controlBase` is layout-free** (Phase 7¹, shipped by SDS-Agent4 mid-phase). The plan
   assumed Input would expose `controlRecipe` with layout baked in; we converged on a layout-
   free `controlBase` string instead, with each consumer picking its own primitive. Textarea
   uses `'relative block w-full'` (not `'flex items-stretch'`) so the browser-rendered resize
   handle stays reachable.
3. **`rows` is not `ResponsiveValue<number>`.** The plan example showed `rows={{ base: 2, md: 4 }}`,
   but responsive `rows` is semantically odd (the HTML attribute is a number; a viewport-driven
   height change is better expressed as a CSS class). Made `rows` a plain `number` for v1;
   responsive height changes belong in `sx` / `className` if needed.
4. **No `min-h-[var(--textarea-min-h)]` token.** The plan referenced this CSS variable; in
   practice, the textarea's natural height (rows × line-height + padding) is the right floor
   and no additional token was needed. Removed from the recipe to keep the API surface flat.
5. **Three recipes, not two** (`textareaRecipe` + `textareaInnerRecipe` + `textareaCountRecipe`).
   The count footer benefits from being a themable slot (`styleOverrides.count`) so theming the
   counter color doesn't require fighting the recipe's class string. Mirrors Input's three-
   recipe split (`inputRecipe` / `inputInnerRecipe` / `inputAddonRecipe`).

### File-level inventory

```
packages/components/src/_shared/
├── controlRecipe.ts              # (pre-existing, unchanged)
├── useFormFieldA11y.ts           # (pre-existing, unchanged)
└── variantColorMatrix.ts         # NEW — 28-row matrix extracted from Input

packages/components/src/Input/
└── Input.recipe.ts               # back-ported to consume `variantColorMatrix({ for: 'Input' })`
                                  # (plus the Phase 7¹ layout-into-base restoration)

packages/components/src/Textarea/
├── Textarea.tsx
├── Textarea.types.ts
├── Textarea.recipe.ts
├── useAutoResize.ts
├── meta.ts
├── README.mdx
└── examples/
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── AutoResize.tsx
    ├── WithCount.tsx
    ├── Invalid.tsx
    ├── Disabled.tsx
    ├── ResizeModes.tsx
    └── Controlled.tsx           # 9 examples, mirrors Input's structure

packages/components/__tests__/
├── Textarea.test.tsx             # 33 unit tests
└── Textarea.a11y.test.tsx        # 11 a11y tests

packages/components/src/index.ts  # alphabetical insert after Input

# apx-ds/index.ts is wildcard `export *` — no edit needed.
```

### Resume Phase 11 — Radio

Per the Leader's status board, my next queued plan is Phase 11 (Radio). Picking that up after
this ships.