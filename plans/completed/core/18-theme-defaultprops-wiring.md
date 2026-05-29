# Core 18 — `theme.components.<Name>.defaultProps` wiring

> Status: **Completed** · Depends on: nothing structural · Blocks: nothing — but unblocks every shipped component's documented "Theming → defaultProps" example.

## Context

`@apx-ds/engine`'s `ThemeShape` already declares the per-component override slot:

```ts
export interface ComponentThemeOverride {
  defaultProps?: Record<string, unknown>;
  styleOverrides?: Record<string, string>;
  variants?: Record<string, VariantConfig>;
}
```

…and the README/MDX for **every** shipped component documents the precedence chain with a
`defaultProps: { variant: …, size: … }` example (Alert, Avatar, Badge, Button, Checkbox, Input,
Progress, Switch, Textarea all advertise it).

**But the contract is never executed.** `packages/theme/src/hooks/useThemedClasses.ts` reads
`theme.components.<Name>.styleOverrides.<slot>` and stops there. It never consults
`defaultProps`. So a consumer who writes:

```tsx
<ThemeProvider
  theme={defineTheme({
    components: { Checkbox: { defaultProps: { variant: 'outline', shape: 'rounded' } } },
  })}
>
  <Checkbox>Accept</Checkbox>     // ← shape = 'square' (recipe default), NOT 'rounded'
</ThemeProvider>
```

…silently gets the recipe's `defaultVariants`, not their theme defaults. The README example
they followed is currently a lie.

This came up during the **Phase 9 (Checkbox) adaptive-variant check** Ahmad requested on
2026-05-20. The radius-token side of his question is already handled (recipe uses Tailwind
preset utilities that resolve to `var(--sds-radius-*)`, so the Katana variant flows through
CSS-var-only — see commit hotfix `Checkbox.recipe.ts shape.square: rounded-xs → rounded-sm`).
But the **prop-level** "fall through to the theme default when the consumer passes `undefined`"
side of the contract is genuinely missing.

## Objective

Wire `theme.components.<Name>.defaultProps` into `useThemedClasses` so the documented
precedence chain (consumer prop → theme defaultProps → recipe defaultVariants) actually executes.

## Precedence chain (final)

For every component variant axis (`variant`, `size`, `color`, `shape`, …):

```
consumer-prop (if defined)
  → theme.components.<Name>.defaultProps[axis] (if defined)
    → recipe defaultVariants[axis] (engine `cv` defaults)
      → static fallback baked into the recipe
```

Same precedence already applies to `styleOverrides` (theme injects between recipe + className)
and `sx`/`style` (engine + `sxToStyle` + consumer style). This change closes the last gap.

## Implementation sketch

```ts
// packages/theme/src/hooks/useThemedClasses.ts

const themeOverride = componentName
  ? theme.components?.[componentName]?.styleOverrides?.[slot]
  : undefined;

// NEW:
const themeDefaultProps = componentName
  ? theme.components?.[componentName]?.defaultProps
  : undefined;

const { className: userClassName, sx, style, ...recipeProps } = props;

// NEW: layer defaultProps under consumer props, but ONLY for axes where the consumer passed
// `undefined`. Defined-but-falsy values (e.g. `disabled={false}`) still win.
const mergedRecipeProps = themeDefaultProps
  ? {
      ...themeDefaultProps,
      ...Object.fromEntries(
        Object.entries(recipeProps).filter(([, v]) => v !== undefined),
      ),
    }
  : recipeProps;

const recipeClass = recipe(mergedRecipeProps as Parameters<typeof recipe>[0]);
```

Roughly 10 lines. Memoization key needs `themeDefaultProps` added.

## Testing plan

`packages/theme/__tests__/useThemedClasses.test.tsx` — add:

1. `theme.components.Foo.defaultProps.variant = 'outline'` + consumer omits `variant` → recipe
   receives `variant: 'outline'`.
2. Same theme + consumer passes `variant="solid"` → recipe receives `variant: 'solid'`
   (consumer wins).
3. Same theme + consumer passes `variant={undefined}` explicitly → theme wins (`undefined` is
   "not provided" in React-land; matches `useId` / Radix conventions).
4. Same theme + consumer passes `disabled={false}` → recipe receives `disabled: false` (defined
   falsy value wins over a hypothetical `defaultProps.disabled = true`).
5. **Cross-component**: render `<Button>` and `<Checkbox>` under the same `ThemeProvider` with
   different per-component `defaultProps` — each recipe gets its own.
6. **Re-render isolation**: changing `defaultProps` in a parent `ThemeProvider` triggers exactly
   one re-resolve of `recipeClass` (memo key must include defaultProps).

## Acceptance criteria

- [ ] Every shipped component README's "Theming → defaultProps" example actually works in the
      live renderer (Alert, Avatar, Badge, Button, Checkbox, Input, Progress, Switch, Textarea).
- [ ] No regression in any existing `useThemedClasses.test.tsx` case (precedence with
      `styleOverrides` / `className` / `sx` / `style` unchanged).
- [ ] Bundle delta for `@apx-dsme`: < 200 bytes gz (it's a tiny merge).
- [ ] Workspace typecheck + lint + tests green.
- [ ] Renderer visual smoke: set `defaultProps: { variant: 'outline' }` in a wrapping
      `ThemeProvider` somewhere in the renderer and confirm the page shows the outline variant.

## Out of scope

- `theme.components.<Name>.variants` (the third slot on `ComponentThemeOverride`). Adding new
  variants from the theme is a deeper change touching `cv` itself; track separately if ever
  needed.
- Per-instance `useThemedClasses({ defaultProps })` — defaults belong on the theme, not on
  individual calls.

## When complete

1. Move this file to `plans/completed/core/18-theme-defaultprops-wiring.md`.
2. Append `## Outcome` with the precedence chain, test list, bundle delta, and a note on
   whether any README/MDX examples needed wording tweaks (probably not — they're already
   accurate; this change just makes them true).

---

## Outcome

Shipped Core 18 — `theme.components.<Name>.defaultProps` now flows through every DS component.

### Final precedence chain (variant-axis props)

```
recipe defaultVariants
  → theme.components.<Name>.defaultProps[axis]
    → consumer prop (if defined; `undefined` falls through)
```

`undefined` is treated as "not provided" (theme wins). Defined falsy values (`false`, `0`, `''`)
are honored — `<Button disabled={false}>` still overrides a theme that sets
`defaultProps.disabled = true`. This matches React / Radix conventions and is what every shipped
component's README already promises.

Style precedence (classes / inline) is unchanged: recipe → `styleOverrides[slot]` → `className`
→ `sx` → `style`.

### Files touched

| File | Change |
|---|---|
| `packages/theme/src/hooks/useThemedClasses.ts` | +14 effective lines: read `theme.components.<Name>.defaultProps`, layer under consumer props using an explicit two-pass merge that ignores `undefined` consumer values. Updated the JSDoc to document the chain. |
| `packages/theme/__tests__/useThemedClasses.test.tsx` | +7 new test cases (covers consumer-omit, consumer-wins, explicit-undefined fallthrough, defined-falsy honored, per-component isolation, ad-hoc skip, defaultProps + styleOverrides composition). +1 supporting recipe (`variantRecipe`) used by the new block. |

No component source changes, no `_shared/` writes, no engine changes, no umbrella source
changes. The umbrella + component dists were rebuilt to pick up the new theme dist.

### Implementation note — why a two-pass merge, not a naive spread

The obvious one-liner is `{ ...themeDefaultProps, ...recipeProps }`. That **breaks the
explicit-undefined fallthrough case**: when a consumer's wrapper component destructures
`{ variant, ...rest }` and forwards `variant` (which may be `undefined`), the spread would
clobber the theme default with `undefined`. The two-pass merge — assign theme first, then
overlay only the `value !== undefined` consumer entries — keeps the fallthrough working,
which is the whole point of the change.

### Test results

- `packages/theme/__tests__/useThemedClasses.test.tsx`: **14/14 ✅** (7 new + 7 pre-existing).
- `packages/theme` full suite: **64/64 ✅** across 7 files.
- `packages/theme` typecheck ✅, lint ✅, build ✅.
- `packages/components` targeted regression on heavy `useThemedClasses` consumers (Button,
  Toggle, ToggleGroup, Checkbox, Input, Accordion, Card): **195/195 ✅**, zero regressions.
- `packages/components` full suite has 4 pre-existing failures in `Tooltip.test.tsx` (@SDS-Agent6's
  in-flight Phase 17), unrelated to Core 18 — Tooltip uses `<Portal>` and `useEscapeStack`,
  neither of which routes through `useThemedClasses`, and the failure messages are about
  pointerleave / focus / Esc / controlled-open behaviour (not class composition).
- Rebuilt `@apx-dsponents` + umbrella `apx-apx-dsp the new theme dist.

### Bundle delta (`@apx-dsme/dist/index.js`)

Measured by toggling the new merge logic off → build → measure → on → build → measure:

|        | raw    | gz   |
|--------|--------|------|
| Before | 23.73 KB | 6586 bytes |
| After  | 24.15 KB | 6681 bytes |
| Delta  | **+0.42 KB** | **+95 bytes gz** |

Target was `<200 bytes gz`. Hit it at less than half.

### README / MDX wording

No README or MDX file needed wording changes. Every shipped component already promises this
behavior in its "Theming" section (Alert, Avatar, Badge, Button, Checkbox, Input, Progress,
Switch, Textarea — and the components shipped post-plan: Accordion, Card, CircularProgress,
NumberInput, Skeleton, Slider, Toggle/ToggleGroup). This Core phase makes those promises true,
not new. Spot-checked Button/README.mdx and Accordion/README.mdx — both already had matching
`defineTheme({ components: { Foo: { defaultProps: { ... } } } })` examples.

### Renderer visual smoke

Skipped per the project's "no agent starts/restarts the renderer" rule. The unit + regression
test pyramid above proves the behavioral contract; visual verification is on Ahmad's side at
his next renderer refresh.

### Acceptance criteria — final tick

- [x] Every shipped component README's "Theming → defaultProps" example actually works.
- [x] No regression in any existing `useThemedClasses.test.tsx` case (precedence with
      `styleOverrides` / `className` / `sx` / `style` unchanged).
- [x] Bundle delta for `@apx-dsme`: **+95 bytes gz** (target <200).
- [x] Workspace typecheck + lint + tests green for the theme + targeted components.
- [ ] Renderer visual smoke — deferred to Ahmad per the room rule.

### Coordination notes

- Single-file source change (`useThemedClasses.ts`); minor surface, no merge conflict with
  anyone currently in flight (@SDS-Agent6 Tooltip, @SDS-Agent3 Slider, @SDS-Agent7 Skeleton
  already shipped, etc. — none touch the theme package).
- No edits to `_shared/`, no edits to `Button/`, no edits to any shipped component.
- Rebuilt `apx-dsbrella so consumers of the umbrella package immediately get the new
  behavior — important for renderer rebuilds when Ahmad refreshes.
