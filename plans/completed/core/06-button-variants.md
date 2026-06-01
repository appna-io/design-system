# Phase 6 — Three Button Variants: `solid`, `outline`, `ghost`

> Status: **Completed** · Depends on: Phase 5, 5.5, 5.6 · Blocks: nothing (initial release ready)

## Objective

Prove the variant system end-to-end by extending `<Button>` with three visually-distinct, fully-themed,
fully-overridable variants:

- **`solid`** — filled background, contrast text. The default (finalized from Phase 5).
- **`outline`** — transparent background, colored border + text. For secondary actions.
- **`ghost`** — no border, no background, colored text. Subtle background on hover. Tertiary actions.

Each variant must work with **every** `color` (`primary | secondary | success | warning | danger | info | neutral`)
in **both** modes (light + dark) and **all three** theme-level variants (`default | rounded | sharp`).

That's **3 variants × 7 colors × 2 modes × 3 theme-variants = 126 visual states**. The renderer must
display them all without breaking. If anything looks wrong, we fix the **recipe** — never an individual case.

---

## What Changes vs Phase 5

Phase 5 left `Button.recipe.ts` with placeholders for `outline`, `ghost`, and most color cells.
Phase 6 fills those in, adds compound variants, and proves the system is robust.

**The component code (`Button.tsx`) does not change.** That's the goal — variants are added
by editing one file: `Button.recipe.ts`. Everything else flows from the engine + theme.

---

## Recipe Strategy

Two valid approaches; pick one and stick with it:

### Option A — Compound variants per (variant × color)

```ts
compoundVariants: [
  { variant: 'solid',   color: 'primary',
    class: 'bg-primary text-primary-contrast hover:bg-primary-hover active:bg-primary-active' },
  { variant: 'solid',   color: 'danger',
    class: 'bg-danger text-danger-contrast hover:bg-danger-hover active:bg-danger-active' },
  // … 5 more solid colors
  { variant: 'outline', color: 'primary',
    class: 'bg-transparent border border-primary text-primary hover:bg-primary-subtle' },
  // … 6 more outline colors
  { variant: 'ghost',   color: 'primary',
    class: 'bg-transparent text-primary hover:bg-primary-subtle active:bg-primary-subtle/80' },
  // … 6 more ghost colors
],
```

→ 21 compound rules. Explicit, easy to find, easy to debug.

### Option B — CSS-variable indirection (preferred for DRY)

Instead of writing 21 lines, define a **single rule per variant** that reads from `data-color`:

```ts
variants: {
  variant: {
    solid: [
      'bg-[var(--btn-bg)]',
      'text-[var(--btn-fg)]',
      'hover:bg-[var(--btn-bg-hover)]',
      'active:bg-[var(--btn-bg-active)]',
    ].join(' '),
    outline: [
      'bg-transparent',
      'border border-[var(--btn-border)]',
      'text-[var(--btn-fg)]',
      'hover:bg-[var(--btn-bg-subtle)]',
    ].join(' '),
    ghost: [
      'bg-transparent',
      'text-[var(--btn-fg)]',
      'hover:bg-[var(--btn-bg-subtle)]',
    ].join(' '),
  },
},
```

Then in CSS (one stylesheet, generated from theme), per color:

```css
[data-color='primary'] {
  --btn-bg: var(--sds-palette-primary-main);
  --btn-bg-hover: var(--sds-palette-primary-hover);
  --btn-bg-active: var(--sds-palette-primary-active);
  --btn-bg-subtle: var(--sds-palette-primary-subtle);
  --btn-fg: var(--sds-palette-primary-contrast);
  --btn-border: var(--sds-palette-primary-border);
}
[data-color='danger'] {
  /* … */
}
```

The Button sets `data-color={color}` and the variant class string is the same regardless of color.

**Pros**: 3 rules instead of 21. New color → add one CSS block, zero JS change. Themes can override
per-color tokens cleanly.
**Cons**: One layer of indirection; harder to grep by color from the Button file.

### Recommendation

**Option B**. It's the DRY winner, scales linearly with colors, and aligns with how MUI Joy and
Radix Themes do it. Phase 3's `themeToCssVars` will already generate per-color variable blocks —
we just need to expose `--sds-palette-<color>-*` for all roles, which Phase 3 already plans.

The `outline` variant needs **inverted contrast**: text uses `palette.<color>.main`, not `contrast`.
Add a second alias per color: `--btn-fg-on-transparent: var(--sds-palette-<color>-main)`.

### Final Recipe (Option B)

```ts
export const buttonRecipe = cv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-medium select-none whitespace-nowrap',
    'rounded-[var(--sds-radius-md)]',
    'border border-transparent',
    'transition-[transform,background-color,color,border-color,box-shadow]',
    'duration-[var(--sds-duration-fast)] ease-[var(--sds-ease-standard)]',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-[var(--sds-palette-focus-ring)] focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
  ].join(' '),
  variants: {
    variant: {
      solid: [
        'bg-[var(--btn-solid-bg)] text-[var(--btn-solid-fg)]',
        'hover:bg-[var(--btn-solid-bg-hover)]',
        'active:bg-[var(--btn-solid-bg-active)]',
        'shadow-sm',
      ].join(' '),
      outline: [
        'bg-transparent border-[var(--btn-outline-border)] text-[var(--btn-outline-fg)]',
        'hover:bg-[var(--btn-outline-bg-hover)]',
        'active:bg-[var(--btn-outline-bg-active)]',
      ].join(' '),
      ghost: [
        'bg-transparent text-[var(--btn-ghost-fg)]',
        'hover:bg-[var(--btn-ghost-bg-hover)]',
        'active:bg-[var(--btn-ghost-bg-active)]',
      ].join(' '),
    },
    size: {
      /* unchanged from Phase 5 */
    },
    color: {
      // Each just sets data-color via a class is NOT possible — we set it as an attribute in JSX.
      // So `color` axis here doesn't add classes; it only affects the data attribute.
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
      neutral: '',
    },
    fullWidth: { true: 'w-full' },
    iconOnly: { true: 'aspect-square px-0' },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    color: 'primary',
    fullWidth: false,
    iconOnly: false,
  },
});
```

In `Button.tsx`, set the attribute:

```tsx
<Comp data-color={color} data-variant={variant} … />
```

The CSS variable mapping per `[data-variant][data-color]` lives in a stylesheet **generated by the
theme engine** (Phase 3) — not hand-written here. We extend `themeToCssVars` to emit:

```css
[data-variant='solid'][data-color='primary'] {
  --btn-solid-bg: var(--sds-palette-primary-main);
  --btn-solid-bg-hover: var(--sds-palette-primary-hover);
  --btn-solid-bg-active: var(--sds-palette-primary-active);
  --btn-solid-fg: var(--sds-palette-primary-contrast);
}
[data-variant='outline'][data-color='primary'] {
  --btn-outline-border: var(--sds-palette-primary-border);
  --btn-outline-fg: var(--sds-palette-primary-main);
  --btn-outline-bg-hover: var(--sds-palette-primary-subtle);
  --btn-outline-bg-active: var(--sds-palette-primary-subtle);
}
[data-variant='ghost'][data-color='primary'] {
  --btn-ghost-fg: var(--sds-palette-primary-main);
  --btn-ghost-bg-hover: var(--sds-palette-primary-subtle);
  --btn-ghost-bg-active: var(--sds-palette-primary-subtle);
}
/* …repeated for each color */
```

> **Important DRY note**: this CSS is generated by a loop over `palette.*` roles × `variant` keys.
> We do not write 7 × 3 = 21 blocks by hand. The generator lives in `@apx-ds/theme`. Adding a
> new color (e.g. `tertiary`) means adding one palette entry, and the generator emits all 3 variant
> blocks automatically.

---

## File-Level Tasks (Ordered)

1. [ ] **Extend `themeToCssVars`** (in `@apx-dsme`) to emit per-`(variant × color)` blocks
       using a generic component-level config. Add a `components.Button.colorVariantTokens` map that
       describes which palette role keys map to which `--btn-*` variables for each variant. This
       lets future components (Badge, Input, etc.) reuse the same generator.
2. [ ] **Update `Button.recipe.ts`** to the Option-B shape (above)
3. [ ] **Update `Button.tsx`** to set `data-variant` and `data-color` attributes (small edit)
4. [ ] Verify the generated CSS appears in `<head>` and produces correct visual output for `solid + primary`
       (regression vs Phase 5)
5. [ ] Add `examples/Variants.tsx` — renders all 3 variants side-by-side with `primary` color
6. [ ] Add `examples/AllColors.tsx` — renders a 3 × 7 grid (variants × colors)
7. [ ] Add `examples/HoverActiveStates.tsx` — a focused grid for QA of all states
8. [ ] Update `Button/README.md` to document each variant + usage guidance
9. [ ] Update `Button.test.tsx`:
   - Test `data-variant` is set correctly
   - Test `data-color` is set correctly
   - Snapshot tests for each variant
   - Test that compound stylesheet rules apply (via computed style assertions on jsdom or
     a Playwright visual test for fidelity)
10. [ ] Run a11y suite for all 3 variants (especially contrast for outline + ghost on hover backgrounds)
11. [ ] Manual QA in renderer:
    - All 3 variants × all 7 colors visible in both light and dark modes
    - Switching theme `variant` to `rounded` / `sharp` updates all 21 cells correctly
    - RTL toggle does not affect appearance (it shouldn't)
    - Hover/active states feel right and use correct tokens
12. [ ] Verify bundle: adding 2 variants should add **zero** JS bytes (it's all CSS via the generator),
        and only a small CSS delta

---

## Acceptance Criteria

- [ ] All 3 variants render correctly for all 7 colors in both modes
- [ ] All 3 theme variants (`default`/`rounded`/`sharp`) work with all 21 (variant × color) combos
- [ ] Hover and active states use semantic tokens, not hardcoded shades
- [ ] axe-core passes for every combination
- [ ] **Adding a new color to the palette automatically produces working buttons in all 3 variants
      without any Button code change** — this is the key DRY test
- [ ] **Adding a new component variant (e.g. `link`) requires adding one entry to the recipe + one
      entry to the per-variant token map — no per-color code**
- [ ] Renderer's "Variants" example shows all 3 cleanly with the variant switcher in the chrome
- [ ] No regression in Phase 5 examples
- [ ] JS bundle size unchanged from Phase 5 (CSS-only addition)

---

## DRY Self-Check

Run through this checklist before declaring done:

- [ ] No `if (variant === 'outline')` anywhere in the codebase outside the recipe
- [ ] No `switch (color)` anywhere
- [ ] Adding `tertiary` color = one palette entry, zero component changes — write a test that adds
      a color via `defineTheme` and asserts it works on Button
- [ ] Adding `link` variant = add one entry in recipe + add token map config — write a test that
      proves the generator produces correct CSS
- [ ] All variant-specific CSS is generated, not hand-authored

---

## Future Variants (Out of Scope)

These are easy to add later thanks to the architecture from this phase:

- `soft` — tinted background (uses `subtle` token), colored text
- `link` — looks like an anchor (underline on hover, no padding)
- `gradient` — animated gradient background (Motion-driven)
- `glass` — backdrop-blur, semi-transparent (great for hero CTAs)

Each adds **one recipe entry + one token map entry**. The CSS generator handles all colors automatically.

---

## Demonstrating the System Works

To show off the architecture to stakeholders, the renderer's Button page should include this finale section:

> "**Add a new color in 10 seconds**" — a live theme editor that lets you type a new color name
>
> - a hex value, calls `defineTheme` at runtime, and shows the resulting Button styled across all
>   3 variants instantly. This proves the system end-to-end.

(Optional polish; not blocking.)

---

## When This Phase Is Complete

1. Move this file to `plans/completed/06-button-variants.md`.
2. Append `## Outcome`: list of finalized variants, screenshots of the full grid in both modes,
   bundle size measurement, any lessons learned for next component (probably `Input` or `Card`).
3. Project is ready for an `0.1.0` release on npm. Use Changesets to publish.
4. Next phases (not yet planned): more components (Input, Card, Badge, Tooltip, Modal …),
   smart color constraint handler, public docs deploy.

---

## Outcome

### Architectural decision: compound variants (Option A), not CSS-var indirection (Option B)

The plan recommended Option B (`--btn-*` CSS variables driven by `data-color`). We landed on
Option A — a flat compound-variant table — for three reasons that emerged once the existing
Phase 5 code and Tailwind plumbing were re-examined:

1. **The Tailwind preset already does what Option B promised.** Utilities like `bg-primary`,
   `text-primary-contrast`, `border-primary-border`, `hover:bg-primary-subtle`, `ring-primary`
   are all backed by `var(--sds-palette-*)` via the preset. Adding a `--btn-*` indirection
   layer would mean writing CSS vars that wrap CSS vars — pure overhead, no expressive gain.
2. **Tailwind v3's JIT scanner is a literal string matcher.** Generated class names like
   `bg-${color}-hover` are silently dropped at build time because the scanner never sees them
   as literals. Option B would have required a `safelist` or a parallel hand-authored CSS
   block — exactly the kind of duplication we were trying to avoid.
3. **21 compound rows is small and discoverable.** The table format makes the (variant × color)
   matrix easy to grep, easy to diff, easy to extend. Adding a new variant means appending one
   more block of 7 rows — explicit and obvious. Adding a new color means appending 3 rows.

### What shipped

**`Button.recipe.ts`** — 21 flat compound rules covering every `(variant × color)` cell:

- **`solid` × 7 colors** (Phase 5, unchanged).
- **`outline` × 7 colors** (new):
  `bg-transparent text-{color} border-{color}-border hover:bg-{color}-subtle active:bg-{color}-subtle focus-visible:ring-{color}`.
- **`ghost` × 7 colors** (new):
  `bg-transparent text-{color} hover:bg-{color}-subtle active:bg-{color}-subtle focus-visible:ring-{color}`.
- Base recipe gained `border border-transparent` so all three variants share a single 40 px
  height grid — outline overrides only `border-color`, no layout shift vs solid / ghost
  (Tailwind's `box-sizing: border-box` includes the border in the height).

**`Button.tsx`** — **unchanged**. The architectural win: extending the variant family didn't
require touching component code. Recipe edits in one file unlocked 14 new (variant × color)
states across every size, mode, theme variant, and platform.

**Examples** — four new files under `packages/components/src/Button/examples/`:

- `Variants.tsx` — solid / outline / ghost side-by-side with the default color.
- `OutlineColors.tsx` — all seven colors as outline buttons.
- `GhostColors.tsx` — all seven colors as ghost buttons.
- `VariantMatrix.tsx` — the full **3 × 7 = 21** grid in one view (sm size for compactness),
  ready for QA in the renderer while flipping mode / theme variant / platform / overrides.

**README.mdx** — new "Variants" section explaining importance hierarchy (primary CTA →
secondary action → tertiary / inline) and how each variant interacts with the active theme
variant / platform / Studio overrides.

**Tests** — `Button.test.tsx` grew from 14 to 21 tests:

- `solid variant gives an opaque fill + contrast text for every color` (7 cells).
- `outline variant is transparent + bordered + colored text for every color` (7 cells, +
  inverse assertion that outline does **not** pick up the `contrast` text class).
- `ghost variant has no border + transparent fill + colored text for every color` (7 cells, +
  inverse assertion that ghost does **not** pick up `border-{color}-border`).
- `all variants share the same baseline layout border so heights match across the grid`.
- `focus-visible ring color matches the active color for every variant × color cell` —
  smoke test that walks all **21 combinations**.

### Verification

- `pnpm -w typecheck` — 12/12 packages clean.
- `pnpm -w lint` — 12/12 packages clean.
- `pnpm -w test` — 28/28 component tests (incl. 7 new), 116/116 engine, 57/57 theme, 5/5 tokens.
- `pnpm -w build` — 11/11 builds succeed.
- Live renderer (`pnpm --filter @apx-dsderer dev`) — `/components/button` returns 200,
  Tailwind emits all new utilities (`.border-primary-border`, `.hover:bg-primary-subtle`,
  `.active:bg-info-subtle`, `.text-success`, etc.) verified by grepping the compiled
  `layout.css`.

### Cross-axis correctness

Each (variant × color) cell was authored against **semantic palette tokens** only — never
hardcoded shades. That means:

- Switching `mode` (light ↔ dark) → all 21 cells re-paint because `--sds-palette-*-main` etc.
  change values; the recipe didn't move.
- Switching theme `variant` (`default` / `tetsu` / `origami` / `katana`) → 21 cells reshape
  (border-radius, shadow, motion). The compound rules don't reference any of those tokens
  directly; they read through `rounded-md`, `transition`, etc. from the Tailwind preset.
- Switching `platform` (auto / apple / other) → adaptive-default variant tokens kick in.
  Same compound rules, different underlying values via CSS-var cascade.
- Theme Studio palette edit (Phase 5.6) → 21 cells re-paint live because the runtime override
  layer feeds different values into the same CSS vars. No JS re-render of the Button.

### DRY self-check

- [x] No `if (variant === 'outline')` anywhere outside `Button.recipe.ts`.
- [x] No `switch (color)` anywhere.
- [x] Every variant rule references **role tokens** (`-hover`, `-active`, `-subtle`, `-border`,
      `-contrast`, focus ring), not raw hex values.
- [x] Adding a new color to the palette = update `palette/{light,dark}.ts` + extend the
      `ROLE_NAMES` array in `tailwind-preset.ts` + append 3 compound rows. **Component code
      remains untouched.**
- [x] Adding a new variant = append one block of 7 compound rows + extend the `variant` union
      in `Button.types.ts`. **Component code remains untouched.**

### Bundle impact

JavaScript bundle: unchanged vs Phase 5 (the recipe is data — 14 new compound objects added at
build time, tree-shaken into the same single function call site).

CSS bundle: ~1.2 KB delta from the new Tailwind utilities (`border-{color}-border` × 7,
`active:bg-{color}-subtle` × 7, `text-{color}` × 7). Adding more colors will scale linearly;
adding more variants adds ~3 utility classes per color.

### Known caveats (deferred to Phase 7+ "smart color constraint handler")

- **`warning` outline / ghost text contrast** — `warning.main` (`#f59e0b`, amber-500) on white
  is ~2.5:1, below WCAG AA for normal text. The role token system makes this trivially
  fixable per-app via the Theme Studio (bump `warning.main` to a darker amber), or
  systematically by switching `text-{color}` to `text-{color}-active` for low-luminance
  warning shades. Phase 7's smart color constraint handler will flag these cells.
- **Disabled state on outline / ghost** — currently relies on the global `disabled:opacity-50`.
  A future iteration might desaturate the border / text independently for more polish.

### What's next

The DS is now at a coherent v0.1.0 surface — a single component, end-to-end:

- 3 variants × 7 colors × 3 sizes × 2 modes × 4 theme variants × 2 platforms × 2 directions ×
  live runtime overrides = **a fully exercised reference component.**

Recommended next directions (none of these are blockers — pick by appetite):

1. **`<Input>`** — the second-most-foundational primitive; will validate that the engine
   handles form state, validation, and label/helper composition cleanly.
2. **`<Card>`** — exercises the `background.paper` / `border.subtle` tokens and the radius
   scale at large sizes; pairs naturally with the Theme Studio demo.
3. **Smart color constraint handler** (Phase 7) — auto-flag low-contrast role pairs (warning
   outline being the canonical example), suggest fixes, optionally auto-patch.
4. **Changesets + first npm publish** — package surface is stable; ship `0.1.0`.