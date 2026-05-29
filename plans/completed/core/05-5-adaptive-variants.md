# Phase 5.5 — Adaptive Variants

> Status: **Completed** · Depends on: Phase 3, 5 · Blocks: Phase 6

## Objective

Replace the placeholder variant set (`default` / `rounded` / `sharp`) with three identity-rich
variants. The renderer's variant selector becomes a real design choice instead of a corner-radius
toggle.

The headline trick: **`default` is adaptive**. It detects the user's _browser_ and quietly serves
a different palette / radii / typography stack depending on what runtime is rendering it. Safari
gets a Cupertino-leaning treatment; everything else gets the canonical apx-base look. One
variant name, two faces.

This is intentionally inserted **before Phase 6** because Phase 6 introduces button variants
(`outline`, `ghost`) and we don't want to author them twice — once for the old variant names and
again later.

---

## The three variants

| Name        | Reading            | Identity                                                                                                                                |
| ----------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **default** | _"fits in"_        | **Adaptive.** Safari / Apple-WebKit → softer Cupertino radii, SF font stack, system blue. Everything else → apx-base (current look). |
| **tetsu**   | 鉄, _"iron / steel"_ | Brutalist. Zero radii, hairline borders, monochrome surfaces, hard shadows. The "no-bullshit" look.                                     |
| **origami** | 折り紙, _"folded paper"_ | Playful. Generous radii, soft layered shadows, more breathing room, slightly warmer palette accents.                                    |

### Why these names

- **Memorable.** `tetsu` and `origami` aren't from any other component library — nobody else owns
  these in the design-system space, so they become brand markers.
- **They describe a personality, not a setting.** `rounded` describes _one knob_; `origami`
  describes _a feel_ that the whole DS can lean into (radii _and_ shadows _and_ spacing).
- **They tie to the apx brand without being cheesy.** The variants are Japanese-rooted but
  the meanings translate without explanation (iron = brutal, folded paper = soft / playful).
- **Two-syllable, latin-typeable, hard to misspell.** Important for an API string.

---

## Adaptive `default` — architecture

We add a **third selector axis** alongside `data-mode` and `data-variant`:

```
data-platform = 'apple' | 'other'
```

CSS variables stack:

```css
:root[data-variant='default']                            { /* apx-base tokens */ }
:root[data-variant='default'][data-platform='apple']     { /* cupertino overrides */ }
```

The `default` variant in tokens grows a new `platformOverrides` field:

```ts
export interface ThemeVariantDefinition {
  name: string;
  tokens: ThemeVariantOverrides;
  platformOverrides?: {
    apple?: ThemeVariantOverrides;
    other?: ThemeVariantOverrides;
  };
}
```

`themeToCssVars()` walks this structure and emits one extra CSS block per `(variant, platform)`
pair that has overrides. For all variants other than `default` the `platformOverrides` field is
absent → no extra blocks.

### Detection

Platform is written to `<html>` from two places:

1. **`<ThemeScript />`** — inline script in `<head>`. Runs synchronously _before paint_, so the
   correct token set is applied without FOUC.
2. **`<ThemeProvider>`** — `useEffect` on mount re-runs detection so SSR markup matches CSR.

Detection rule (intentionally conservative — we want to be _correct_ more than _eager_):

```js
const ua = navigator.userAgent;
const vendor = navigator.vendor || '';
const isSafari = vendor.includes('Apple') &&
                 /Safari\//.test(ua) &&
                 !/Chrome|Chromium|Edg|OPR|CriOS|FxiOS/.test(ua);
// → 'apple' if isSafari, else 'other'
```

This catches macOS Safari, iOS Safari, and iPadOS Safari, while explicitly excluding Chrome /
Edge / Firefox on the same OS (which use Blink / Gecko and should get the apx-base look).

### Override

Consumers can pin the platform — useful for screenshot tests, design reviews, or apps that want
to ignore browser detection:

```tsx
<ThemeProvider platform="apple">{/* … */}</ThemeProvider>     // force Cupertino
<ThemeProvider platform="other">{/* … */}</ThemeProvider>     // force apx-base
<ThemeProvider platform="auto">{/* … */}</ThemeProvider>      // default → detect
```

And a hook for components / chrome that want to react:

```ts
const { platform, setPlatform } = usePlatform();
```

---

## Token deltas

### `tetsu`

- `radius.*` → `0px` (preserves `radius.full` for pills / avatars)
- `shadows.*` → reduced amplitude, tighter blur
- Borders: scale stays the same but components are expected to opt into `border-strong` more

### `origami`

- `radius.md` → `0.875rem`, `lg` → `1.25rem`, `xl` → `1.75rem`
- `shadows.*` → softer, more diffused, larger spread
- Optionally: bump `spacing.*` by a notch for extra breathing room

### `default · apple` (Cupertino overlay)

- `typography.fontFamily.sans` → `-apple-system, BlinkMacSystemFont, "SF Pro Text", …`
- `radius.md` → `0.625rem`, `lg` → `0.875rem` (Apple's slightly softer corners)
- `shadows.md` → softer, lower-amplitude
- `motion.duration.fast` → `100ms` (Apple UIs feel snappier)

### `default · other`

- Empty overlay — apx-base wins.

---

## File-level tasks

1. [ ] Update `tokens/src/variants/types.ts` — add `platformOverrides?` to `ThemeVariantDefinition`.
2. [ ] Rename `tokens/src/variants/rounded.ts` → `origami.ts`; replace tokens.
3. [ ] Rename `tokens/src/variants/sharp.ts` → `tetsu.ts`; replace tokens.
4. [ ] Update `tokens/src/variants/default.ts` — add `platformOverrides.apple` for Cupertino tweaks.
5. [ ] Update `tokens/src/variants/index.ts` — re-export the new names, drop the old ones.
6. [ ] Update `theme/src/themeToCssVars.ts` — emit `[data-variant='default'][data-platform='apple']` block when present.
7. [ ] Update `theme/src/context.ts` — add `platform` + `setPlatform` to `ThemeContextValue`.
8. [ ] Update `theme/src/ThemeProvider.tsx` — detect platform, persist, write `data-platform`, accept `platform` prop.
9. [ ] Update `theme/src/ThemeScript.tsx` — inline platform-detection.
10. [ ] Add `theme/src/hooks/usePlatform.ts` and re-export from hooks/index.
11. [ ] Update renderer's `VariantSelect.tsx` with the new labels.
12. [ ] Update existing snapshot tests (`themeToCssVars.test`) and `ThemeProvider` tests.
13. [ ] Add new tests: `detectPlatform()` unit + `ThemeProvider` writes `data-platform` + `usePlatform` round-trip.
14. [ ] Sweep docs / READMEs that reference `rounded` / `sharp` (renderer `/theming` page).
15. [ ] Update `plans/README.md` to slot Phase 5.5 into the timeline.

---

## Acceptance criteria

- [ ] `<html>` carries `data-variant="default" data-platform="apple|other"` from first paint.
- [ ] On Safari, a `<Button />` in the `default` variant gets the Cupertino radius + typography.
- [ ] On Chrome / Firefox / Edge, the same button gets apx-base.
- [ ] `usePlatform()` returns the current detection + lets consumers override it.
- [ ] `<ThemeProvider platform="apple">` forces the Cupertino overlay everywhere.
- [ ] Switching the variant dropdown to `tetsu` flips every surface to sharp corners + tighter shadows.
- [ ] Switching to `origami` flips every surface to generous radii + soft layered shadows.
- [ ] No FOUC — visit the renderer in Safari, the Cupertino tokens are already applied before the bundle finishes evaluating.
- [ ] All existing tests still pass; the snapshot for `themeToCssVars` is regenerated and reviewed.

---

## DRY self-check

- One `detectPlatform()` function shared by `ThemeScript` (string-templated) and `ThemeProvider` (imported).
- One `platformOverrides` field on `ThemeVariantDefinition` — every variant has the same shape.
- `themeToCssVars()` doesn't special-case `default`; it loops over `platformOverrides` for any variant that defines them.

---

## When this phase is complete

1. Move this file to `plans/completed/05-5-adaptive-variants.md`.
2. Append `## Outcome` with: the three variants' final token deltas, screenshots of the same
   `<Button />` in Safari vs Chrome under the `default` variant, the platform-detection logic
   that shipped, and any rules deferred (e.g. Firefox-specific tweaks).
3. Resume Phase 6 — Button variants (`outline`, `ghost`) layered on top of the new variant system.

---

## Outcome

### What shipped

**Variant identity (`@apx-ds/tokens`)**

- Renamed `rounded` → `origami`, `sharp` → `tetsu`. Old files removed. `default` retained as
  the headline name but its semantics changed from "no-op" to "adaptive".
- New file `tokens/src/variants/types.ts` introduces:
  - `ThemePlatform = 'apple' | 'other'`
  - `ThemeVariantOverrides` widened to a local `DeepPartial` so a variant can override one
    nested token (e.g. `typography.fontFamily.sans`) without restating the full sub-shape.
  - `ThemeVariantDefinition.platformOverrides?: Partial<Record<ThemePlatform, …>>` — uniform on
    every variant, so the CSS layer doesn't special-case `default`.
- `default.ts` ships an empty top-level `tokens` (apx-base wins) plus a Cupertino overlay
  under `platformOverrides.apple`:
  - radii bumped slightly (`md: 0.625rem`, `lg: 0.875rem`, `xl: 1.125rem`, `2xl: 1.375rem`)
  - softer multi-layer shadows
  - SF Pro font stack (`-apple-system, BlinkMacSystemFont, "SF Pro Text", …`)
  - snappier motion (`fast: 120ms`, `normal: 200ms`, `slow: 280ms`)
  - tinted focus ring (`rgba(0, 122, 255, 0.30)`)
- `tetsu.ts` — full radius zeroed, hard mono shadows (offset-only, no blur), faster timings.
- `origami.ts` — generous radii, soft layered shadows tuned with a `rgba(15, 23, 42, …)` cast,
  longer "settling" timings.

**Adaptive runtime (`@apx-dsme`)**

- `themeToCssVars.ts` rewritten around a single `partialThemeToVars()` helper used by **both**
  the base `:root` block and every variant / platform overlay. Result: a deep-partial override
  on `typography.fontFamily.sans` now lands on the exact CSS var (`--sds-font-sans`) the base
  emits — no more inconsistent naming between layers.
- Emits a new fourth selector axis when present:
  `:root[data-variant='default'][data-platform='apple'] { … }`
- New `platform.ts`: `detectPlatform()` (runtime) + `DETECT_PLATFORM_EXPR` (string template
  used by `<ThemeScript />`) live in one file so SSR and CSR can't drift.
  - Detection rule: `vendor.includes('Apple') && /Safari\//.test(ua) && !/Chrome|Chromium|Edg|OPR|CriOS|FxiOS|EdgiOS/.test(ua)` → `'apple'`, else `'other'`.
- `ThemeContext` gained `platform`, `resolvedPlatform`, `setPlatform`. `ThemeProvider` takes a
  new `defaultPlatform?: 'apple' | 'other' | 'auto'` prop (default `'auto'`), persists under
  `${storageKey}-platform`, runs detection in a mount effect, and writes `data-platform` to
  `<html>` in the same effect that writes `data-mode` / `data-variant` / `dir`.
- `ThemeScript` inline script now also detects platform and writes `data-platform` **before
  paint** so the Cupertino overlay never flashes on first load in Safari.
- New `usePlatform()` hook returns `{ platform, setting, setPlatform, isApple }`.

**Renderer (`apps/renderer`)**

- `VariantSelect` shows `Default · Tetsu · Origami` and renders a small `↳ apple` / `↳ other`
  pill next to it while the adaptive `default` variant is active — so reviewers can _see_ which
  sub-look they're getting without leaving the page.
- `theme-demo` segment uses the new names; the page copy explains the adaptive trick.
- `theming.mdx` now lists Variant + Platform as separate switching axes.

**Documentation**

- `plans/README.md` master table now lists Phase 5.5 between 5 and 6.

### Token deltas (final)

| Token                       | Base / `default` (apx) | `default` · `apple` (Cupertino) | `tetsu`            | `origami`          |
| --------------------------- | -------------------------- | ------------------------------- | ------------------ | ------------------ |
| `radius.md`                 | 0.375rem                   | 0.625rem                        | 0px                | 0.875rem           |
| `radius.lg`                 | 0.5rem                     | 0.875rem                        | 0px                | 1.25rem            |
| `radius.xl`                 | 0.75rem                    | 1.125rem                        | 0px                | 1.75rem            |
| `radius.full`               | 9999px                     | (inherited)                     | 9999px (preserved) | 9999px             |
| `shadows.md`                | default 2-layer blur       | softer 2-layer                  | offset-only mono   | soft 2-layer slate |
| `typography.fontFamily.sans`| ui-sans-serif stack        | `-apple-system, …`              | (inherited)        | (inherited)        |
| `motion.duration.fast`      | 150ms                      | 120ms                           | 80ms               | 180ms              |
| `motion.duration.normal`    | 200ms                      | 200ms                           | 140ms              | 280ms              |
| `motion.duration.slow`      | 300ms                      | 280ms                           | 220ms              | 420ms              |

### Verification

- `pnpm -w typecheck` — 12/12 tasks pass.
- `pnpm -w test` — **120 tests pass** across all packages:
  - tokens: 47 (incl. 7 covering new variants + `platformOverrides.apple` Cupertino payload)
  - theme: 50 (incl. 8 new `detectPlatform()` + `DETECT_PLATFORM_EXPR` cross-check tests, and 3
    new `<ThemeProvider>` platform tests)
  - components: 23 (Button unaffected — pulled through cleanly)
- `pnpm -w lint` — clean across all packages.
- `pnpm --filter @apx-dsderer build` — 10/10 routes compile.
- `curl localhost:3000/components/button` confirms:
  - `--sds-radius-md: 0.625rem;` appears under `:root[data-variant='default'][data-platform='apple'] { … }`
  - `:root[data-variant='tetsu'] { … }` and `:root[data-variant='origami'] { … }` are both emitted.
  - `<html>` carries `data-variant` + `data-platform` on first paint via `<ThemeScript />`.

### DRY checks

- One `detectPlatform()` source (`platform.ts`) drives both the React provider and the inline
  pre-hydration script — `DETECT_PLATFORM_EXPR` is just the same logic templated for a `string`.
  A dedicated test parses the expression with `new Function(...)` and asserts it agrees with the
  runtime function on the same UA fixtures.
- One `partialThemeToVars()` flattener in `themeToCssVars.ts` handles `:root`, variant overrides,
  and platform overlays. No more dual-naming bug between layers.
- One uniform `platformOverrides` shape on every variant. The emit loop is unconditional —
  future variants (e.g. a Windows-Fluent overlay on `origami`) drop in without touching the
  serializer.

### Deferred

- Other-platform sub-looks (Android material-ish, Windows fluent-ish) — the shape supports
  them, just no token data shipped yet.
- `setPlatform` UI surface in renderer chrome — the indicator pill is read-only for now. Force
  override is still available via `<ThemeProvider platform="apple">` and `usePlatform()`.
- Reduced-motion-aware overrides per platform — currently same `motion.duration` regardless of
  `prefers-reduced-motion`. Components handle this at the recipe level.

### Next

Phase 6 — `<Button />` gets `outline` and `ghost` variants. Recipes will inherit the new
adaptive radii / shadows automatically, since they're keyed off CSS vars that the platform
overlay already swaps.

---

## Addendum — `katana` variant

Added immediately after this phase shipped, on user request for a diagonal-radius design
(`border-radius: 8px 0px`). It slots into the existing variant system as a fourth option —
no architectural changes required because the slot was already generic.

- New file: `packages/tokens/src/variants/katana.ts`
- `radius` scale uses two-value CSS shorthands (`"2px 0px"`, `"4px 0px"`, `"8px 0px"`, …) — TL +
  BR rounded, TR + BL sharp. Reads visually like a katana's edge geometry.
- Registered in `themeVariants` map; exported from `@apx-dsens` and re-exported through
  `apx-ds
- Renderer: added to `VariantSelect` and the `theme-demo` segment.
- **Caveat documented in the variant source**: `rounded-<size>` shorthand utilities work
  correctly; corner-specific longhand utilities (`rounded-tl-md` et al.) would misinterpret the
  two-value form as an elliptical radius. Components are expected to use shorthand by default.
- Tests added: variant registration, radius shape, and CSS-var emission (`--sds-radius-md: 8px 0px`
  inside `:root[data-variant='katana'] { … }`).

