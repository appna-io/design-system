# `apx-ds` DTS build red — duplicate `detectPlatform` export

> Status: Resolved · Reported: 2026-05-21 · Component: `packages/apx-ds`
> (umbrella) · Severity: Medium (DTS-only; runtime `.js` build unaffected, but
> blocks any consumer that relies on `apx-ds`'s bundled `.d.ts` for type
> resolution — eventually breaks tooling, IDE typeahead, and any downstream
> consumer that doesn't have workspace symlinks).

## Symptom

`pnpm --filter apx-ds build` fails the DTS step with:

```
src/index.ts(4,15): error TS2308: Module '@apx-ds/theme' has already exported
a member named 'detectPlatform'. Consider explicitly re-exporting to resolve the
ambiguity.
```

The runtime `index.js` / `index.cjs` outputs still produce successfully — only
the `.d.ts` bundling pipeline is impacted.

## Root cause

Two unrelated `detectPlatform` symbols are exported from two different internal
packages:

- **`@apx-ds/theme`** → `detectPlatform(): 'apple' | 'other'` — detects
  Apple-WebKit (Safari) for the **Cupertino-style theme variant** (used by
  `<ThemeScript />` and theme resolution).
- **`@apx-ds/components/CommandPalette/headless/platformKey.ts`** →
  `detectPlatform(): 'mac' | 'win' | 'linux'` — detects the **OS for keyboard
  glyph rendering** (used by `<Kbd>`, `parseHotkey`, `matchesHotkey`).

When the umbrella `packages/apx-ds/src/index.ts` does:

```ts
export * from '@apx-ds/theme';
export * from '@apx-ds/components';
```

TypeScript sees two `detectPlatform` symbols with **different return types** and
emits `TS2308` because there's no canonical winner.

The two helpers solve genuinely different problems (rendering vs. input
affordance) and **cannot be unified** — the return-type union, intent, and
detection mechanism are all incompatible. The fix is to disambiguate the names.

## Fix

Renamed CommandPalette's public surface so the two helpers can coexist on
`apx-ds`'s public surface:

| Before                  | After                          |
| ----------------------- | ------------------------------ |
| `detectPlatform()`      | `detectHotkeyPlatform()`       |
| `type Platform`         | `type HotkeyPlatform`          |

Theme's `detectPlatform()` keeps its name (it's the canonical / oldest
consumer; the type signature stays `'apple' | 'other'`).

### Files touched

- `packages/components/src/CommandPalette/headless/platformKey.ts` — renamed
  the definition + added a docblock cross-referencing theme's helper so future
  contributors don't re-collide.
- `packages/components/src/CommandPalette/headless/parseHotkey.ts` — updated
  imports + `resolveMod` / `matchesHotkey` default-arg signatures.
- `packages/components/src/CommandPalette/Kbd.tsx` — updated imports + the
  `resolvedPlatform` local type annotation.
- `packages/components/src/CommandPalette/index.ts` — updated the public
  re-export + module-level docblock.
- `packages/components/src/index.ts` — updated the umbrella component re-export
  (named export + type re-export).
- `packages/components/__tests__/CommandPalette.headless.test.ts` — updated
  the test import + the one test-name string.

No source-code edits to `@apx-ds/theme` (it owns the canonical name).
No edits to `packages/apx-ds/src/index.ts` (the umbrella's `export *`
chain works as-is once the collision is removed).

## Why rename rather than drop?

Agent4 (CommandPalette owner) explicitly designed `detectPlatform` + `Platform`
as **public API** so consumers can build their own custom hotkey-binding UIs
(per the module docblock in `CommandPalette/index.ts`). Silently dropping the
export would be a breaking change for that intentional surface. The rename
preserves the contract while disambiguating the name.

## Gates

- **DTS build:**
  - Before: `pnpm --filter apx-ds build` red on TS2308.
  - After: green. `dist/index.d.ts` resolves cleanly through the workspace
    re-export chain.
- **Runtime bundle:** ESM `dist/index.js` 1.03 MB (up from 916 KB pre-rebuild)
  now contains all four newly-shipped components (AppShell + Field + Table +
  CommandPalette) plus the rename.
- **Component tests:** Full workspace regression **2077 / 2077 pass** across
  112 files. No CommandPalette-specific regressions; the rename is a
  search-and-replace on a public-surface symbol with no semantic change.
- **Lint / typecheck:** clean on all 6 touched files.

## Coordination

- Picked up directly by Fixer per SDS-Leader's 09:30 routing message.
- Cross-cutting note: the same umbrella rebuild also lands AppShell (Agent2),
  Field (Agent8), Table (Agent3), and CommandPalette (Agent4) into the
  `apx-ds` dist — Agent2 had already rebuilt for AppShell, but Field /
  Table / CommandPalette landed *after* that rebuild. Consolidated single
  rebuild here saves three duplicate builds.
- Renderer dev server (`apps/renderer`) is currently in a corrupted state
  (missing `.next` manifests, `Cannot find module './9555.js'`). Fixer is not
  authorized to restart it — Ahmad-only path: `rm -rf apps/renderer/.next`
  then restart `pnpm dev`. The DTS fix itself does not affect renderer
  runtime behavior; this corruption is a separate, persistent issue.

## Follow-ups for the room

- **Renderer guard rail** (proposed by Agent6, endorsed by Fixer, awaiting
  Leader green-light): add a `predev` script to `apps/renderer/package.json`
  that runs `pnpm --filter apx-ds build` so the umbrella dist always
  reflects the latest component sources before `next dev` starts. Catches
  the recurring "I shipped a component and the renderer doesn't see it" trap.
- **Migration notice for consumers:** anyone importing `detectPlatform` or
  `Platform` from `apx-ds` (specifically from the CommandPalette surface)
  must rename to `detectHotkeyPlatform` / `HotkeyPlatform`. Theme's
  `detectPlatform` / `ThemePlatform` is unaffected.