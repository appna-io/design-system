# Engine RFC #1 — `useRovingTabindex` (engine promotion)

> Status: **✅ Shipped (PR 1 + Tabs / Toolbar migrations)** · **Tier 1 (refactor + engine API)** · Triggered by: @SDS-Agent2's Phase 44 Toolbar Outcome ("Tabs / Radio / Menu / Toolbar are now 4 shipped consumers, past the 3-consumer threshold")
> Coordinated extraction of the roving-tabindex pattern from three shipped component-local implementations into a single engine hook. Not a new component.

## Outcome (this PR set)

Landed across one engine PR + three consumer migrations:

- **PR 1 — engine extraction** (`packages/engine/src/keyboard/`):
  - `resolveRovingNextIndex()` — pure resolver, exported for unit testing.
  - `useRovingTabindexRegistry()` — registry-mode hook (Tabs, future TreeView / NavigationMenu).
  - `useRovingTabindexDom()` — DOM-walk hook with MutationObserver + focusin tracking (Toolbar, future Carousel Indicators).
  - Types: `Orientation` (incl. `'both'`), `ActivationMode`, `RovingItem`, `RovingTabindexBaseOptions`, plus per-hook option / return types.
  - Re-exported from `@apx-ds/engine` root + via `./keyboard` subpath. Tree-shakeable; consumers that don't touch keyboard pay zero.
  - **66 new engine tests** across resolver (42), registry (13), DOM (11). All green.
- **PR 2 — Tabs migration**: `useTabsKeyboard` is now a 30-line wrapper over `useRovingTabindexRegistry`. All 65 Tabs tests + axe matrix green.
- **PR 3 — Radio**: deliberately **not** migrated. Radio renders native `<input type="radio" name="…">` which already implements roving + arrow nav natively; layering the engine hook would duplicate (and could fight) browser semantics around RTL / label-click / form reset. Documented inline in `RadioGroup.tsx`.
- **PR 4 — Toolbar migration**: `useToolbarKeyboard` + `useToolbarRoving` collapsed into a single call to `useRovingTabindexDom` via a thin `useToolbarKeyboard` shim. `resolveNextToolbarIndex` is preserved as a deprecation-compatible alias over `resolveRovingNextIndex`. All 68 Toolbar tests + axe matrix green.

Full component test suite: **2699 passed (0 failed)** after the migration.

Engine bundle delta: **+5.9 KB raw / ~+0.8 KB gz** for the keyboard module (within the RFC budget). No new runtime dependencies.

## Context

After Phase 44 (Toolbar) shipped, three of our shipped components implement the **roving-tabindex** ARIA pattern with subtly different mechanics:

| Component         | Hook                                | Item tracking          | Trigger style                                  | Notes                                                |
| ----------------- | ----------------------------------- | ---------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| **Tabs**          | `useTabsKeyboard(ctx, value)`       | Context registry       | Per-trigger handler bound at `<Tabs.Trigger>` | `ctx.getOrderedEnabledValues()` + `ctx.focusValue()` |
| **Radio**         | (RadioGroup-local)                  | Context registry       | Per-radio handler bound at `<Radio>`           | (similar to Tabs, registered via RadioGroupContext)  |
| **Toolbar**       | `useToolbarKeyboard(rootRef, …)`    | DOM querySelectorAll   | Root-level **capture-phase** handler           | MutationObserver re-asserts `tabindex` post-mutation; `data-toolbar-skip` boundary opt-out |

**Note on Menu**: Menu uses `_shared/useListKeyboard.ts` which is the **aria-activedescendant** pattern (highlight without moving focus), *not* roving-tabindex. The two patterns are complementary, not duplicates. Menu is correctly out of scope for this extraction.

**Note on Stepper**: Phase 41 Outcome confirms Stepper deliberately *doesn't* use roving-tabindex — every step is a normal `<button>` tab stop. Out of scope.

## Why now

- **Threshold met**: 3 shipped consumers (4 if you count Menu's neighboring pattern). The DS rule is "promote at the third consumer if the abstraction is stable."
- **Two divergent strategies in production** (registry vs. DOM-walk) — without a coordinated extraction, any new consumer (Carousel Indicators, NavigationMenu Menubar pattern, Toolbar nested submenus, TreeView roots) will pick one arbitrarily and we'll drift further.
- **Future consumers loom**: Phase 46 TreeView (W3C ARIA TreeView keyboard pattern), Phase 52 NavigationMenu (W3C Menubar = roving across top-level items), Phase 56 Carousel (Indicators sub-strip), Phase 44 Toolbar nested submenus. All four want this hook.

## Goals

1. **Single hook** in `@apx-dsine/keyboard` that all roving-tabindex consumers depend on.
2. **Migrate the 3 shipped consumers** in three small per-consumer PRs (Tabs / Radio / Toolbar) with **no behavior change** validated by their existing test suites.
3. **Preserve the two trade-offs** consumers care about — registry-based tracking (no DOM queries; controlled item list) **or** DOM-walking (zero-registration cost for arbitrary children) — via **two cooperating sub-hooks**, not a one-size-fits-all interface.
4. **Document the decision matrix** so future consumers pick the right strategy on the first try.

## Non-goals

- Replacing `useListKeyboard` (aria-activedescendant). Different pattern, stays separate.
- Removing the `useTabsKeyboard` / `useToolbarKeyboard` files. They become **thin wrappers** that call the new engine hook with the right strategy.
- A single-hook universal API. The trade-offs between registry and DOM-walk are real and irreducible; consumers should choose.
- Changing keyboard semantics (no new keys, no different defaults). This is pure refactor.

---

## Proposed engine API

```ts
// packages/engine/src/keyboard/useRovingTabindex.ts

export type Orientation = 'horizontal' | 'vertical' | 'both';
export type ActivationMode = 'automatic' | 'manual';

export interface RovingItem {
  /** Stable id (registry mode) or the live HTMLElement (DOM-walk mode). */
  id: string | HTMLElement;
  /** Whether arrow nav should skip this item. */
  disabled?: boolean;
}

export interface RovingTabindexOptions {
  /** Layout axis. `'both'` accepts all four arrows; `'horizontal'`/`'vertical'` restrict. */
  orientation: Orientation;
  /** Whether arrow nav wraps at boundaries. Default true. */
  loop?: boolean;
  /** Whether ArrowLeft/Right swap meaning under `dir="rtl"`. Default true. */
  rtlAware?: boolean;
  /** Manual = focus moves, activation requires Enter/Space. Automatic = focus + activate together. Default `'automatic'`. */
  activation?: ActivationMode;
  /** Called when Enter/Space activates the focused item (only in manual mode; automatic mode skips this). */
  onActivate?: (id: string | HTMLElement) => void;
}

/**
 * Pure resolver — given a snapshot of items + the currently focused id/element + a key,
 * returns the index of the item to focus next (or -1 if the key isn't navigational).
 *
 * Both sub-hooks below delegate to this. Exported for unit testing.
 */
export function resolveRovingNextIndex(args: {
  items: RovingItem[];
  focusedId: string | HTMLElement | null;
  key: string;
  orientation: Orientation;
  isRtl: boolean;
  loop: boolean;
}): number;

/**
 * REGISTRY MODE. The owning component (e.g. Tabs, Radio) maintains a context-backed list of
 * (id, ref, disabled) tuples. Each item registers itself on mount. The hook returns a
 * KeyboardEventHandler bound at the item level.
 *
 * Pros: precise control, no DOM queries, works with portals.
 * Cons: every item needs to call `register(id, ref)`. Verbose for arbitrary children.
 *
 * Used by: Tabs, Radio.
 */
export function useRovingTabindexRegistry(opts: RovingTabindexOptions & {
  getItems: () => RovingItem[];
  /** Reads the currently-focused id (often === active id but not always in manual mode). */
  getFocusedId: () => string | HTMLElement | null;
  /** Programmatically focus the item with this id. Owner of the registry handles ref → focus(). */
  focusItem: (id: string | HTMLElement) => void;
}): {
  onKeyDown: KeyboardEventHandler<Element>;
  /** Compute tabIndex for an item — 0 if it's the focused one, -1 otherwise. */
  getTabIndex: (id: string | HTMLElement) => 0 | -1;
};

/**
 * DOM-WALK MODE. The owning component just wires a ref to the root + provides the focusable
 * selector. The hook discovers items via querySelectorAll on each key press.
 *
 * Pros: zero registration; works for arbitrary children (including non-DS focusables); no
 *       context plumbing.
 * Cons: DOM query cost per key press (cheap for typical toolbar of <20 items; expensive for
 *       lists of thousands — use registry mode there).
 *
 * Used by: Toolbar.
 */
export function useRovingTabindexDom(opts: RovingTabindexOptions & {
  rootRef: RefObject<HTMLElement | null>;
  /** CSS selector for focusable items. Sensible default matches Toolbar's existing list. */
  itemSelector?: string;
  /** Selector that, when matched on an ancestor, *excludes* a candidate from the roving set. */
  skipBoundarySelector?: string;
  /** Whether to install a MutationObserver that re-asserts tabindex on subtree changes. Default true. */
  observe?: boolean;
}): {
  /** Bound to the root element's onKeyDown. The hook itself uses capture-phase via addEventListener. */
  rootProps: {
    ref: (el: HTMLElement | null) => void;
    onKeyDown: KeyboardEventHandler<HTMLElement>;
    onFocus: FocusEventHandler<HTMLElement>;
  };
};
```

### Why two hooks instead of one

I considered a single `useRovingTabindex` with a `mode: 'registry' | 'dom-walk'` discriminator. Rejected because:
- The option sets diverge meaningfully (registry needs `getItems` / `focusItem`; DOM-walk needs `rootRef` / `itemSelector` / `skipBoundarySelector` / `observe`).
- TypeScript discriminated unions hide the divergence behind awkward narrowing.
- Documentation reads better with two named hooks ("use Registry for Tabs-style components, DOM-walk for Toolbar-style") than one hook with conditional configuration.
- Same engine convention as `useFocusTrap` (instance) vs. `<FocusTrap>` (component) — sibling APIs covering related-but-distinct use cases.

### Shared internals

Both hooks call:
- `resolveRovingNextIndex` (the pure resolver — already extracted, just promoted).
- Internal `isRtl(el)` helper.
- `Orientation` / `ActivationMode` types.

These live in `engine/src/keyboard/_rovingShared.ts`.

---

## Migration plan (3 small PRs, ordered)

### PR 1 — Engine extraction (no consumer changes)

- Create `packages/engine/src/keyboard/useRovingTabindex.ts` with:
  - `useRovingTabindexRegistry`
  - `useRovingTabindexDom`
  - `resolveRovingNextIndex`
  - Types: `Orientation`, `ActivationMode`, `RovingItem`, `RovingTabindexOptions`
- Unit tests: `engine/src/keyboard/__tests__/resolveRovingNextIndex.test.ts` — table-driven for all 4 arrows × 3 orientations × 2 RTL × 2 loop = 48 cells, plus Home/End edges.
- Engine barrel exports: `export * from './keyboard/useRovingTabindex'`.
- **No consumer changes in this PR**; Tabs / Radio / Toolbar continue using their local impls.
- Bundle delta: **engine + ~0.8 KB gz** (worst case — both hooks combined). Consumer bundles unchanged.

**Acceptance**: engine package builds, 48+ unit tests green, no consumer broken.

### PR 2 — Migrate Tabs to `useRovingTabindexRegistry`

- `useTabsKeyboard` becomes a 10-line wrapper that calls `useRovingTabindexRegistry` with `getItems` derived from `ctx.getOrderedEnabledValues()` and `focusItem` from `ctx.focusValue()`.
- All 65 Tabs tests must pass unchanged.
- axe-core matrix re-runs green.
- Bundle: Tabs marginal cost should drop by **~0.4 KB gz** (the local keyboard impl is replaced by a hook reference into engine).

**Acceptance**: 65/65 Tabs tests green, axe clean, bundle delta noted in PR body. Owner: SDS-Agent8 (Tabs ownership).

### PR 3 — Migrate Radio to `useRovingTabindexRegistry`

- Similar shape to Tabs migration. Radio's RadioGroupContext already registers radios with refs; just need a small adapter to fit the `getItems` / `focusItem` shape.
- All Radio tests must pass unchanged. Particular care for the "checked state changes on focus in automatic mode" semantic (default radio behavior).
- axe-core re-runs green.

**Acceptance**: Radio + RadioGroup tests green, axe clean. Owner: SDS-Agent2 or SDS-Agent8 (Radio originally shipped by Agent8; Agent2 also touched Radio).

### PR 4 — Migrate Toolbar to `useRovingTabindexDom`

- `useToolbarKeyboard` becomes a thin wrapper. `resolveNextToolbarIndex` already exists as the pure resolver; promote that to engine alongside `resolveRovingNextIndex` (or refactor to call the engine one).
- MutationObserver lives in engine now (`observe: true` default in `useRovingTabindexDom`).
- All 68 Toolbar tests must pass unchanged.
- axe-core matrix re-runs green.

**Acceptance**: 68/68 Toolbar tests green, axe clean. Owner: SDS-Agent2 (Toolbar ownership).

### PR 5 (optional, post-migration) — Future-consumer adoption

- Phase 46 TreeView: `useRovingTabindexRegistry` with `orientation="vertical"` + custom Home/End/PageUp/PageDown handlers wrapping the hook.
- Phase 52 NavigationMenu: `useRovingTabindexRegistry` with `orientation="horizontal"` + Menubar-specific Enter/Space-to-open-submenu (composed with `useEscapeStack`).
- Phase 56 Carousel Indicators: `useRovingTabindexDom` since indicators are arbitrary children.

These don't block the migration — they validate the API design under real consumer pressure.

---

## Risk + mitigation

| Risk                                                                                | Mitigation                                                                                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Subtle behavior drift during migration (e.g. Tabs' "automatic activation on focus" vs. Toolbar's "focus-only") | The `activation` option encodes this; per-consumer migration PRs run the consumer's full test suite as the regression gate. No big-bang. |
| Engine bundle bloat for consumers who don't use roving-tabindex (e.g. server-only consumers) | The engine package is already tree-shakeable; consumers importing only `<Slot>` / `useId` / `useControllableState` won't pull the keyboard hooks. Verify with `esbuild --bundle --metafile` in PR 1. |
| `useRovingTabindexDom` MutationObserver running unnecessarily on small toolbars (perf) | `observe` defaults to true but can be disabled. Toolbar's current impl already runs MO; no regression. Future consumers can opt out. |
| API surface bloat (too many options on each hook)                                  | The proposed options are exactly the ones each consumer needs today — no aspirational config. New consumers either accept defaults or add options via PRs. |
| Breaking the per-component test surfaces                                           | Each migration PR is gated on the consumer's existing tests (65 Tabs, ~30 Radio, 68 Toolbar = 163 tests must stay green). Plus axe-core matrices. |
| Disagreement on the registry vs. DOM-walk split                                    | Documented as a deliberate choice in the engine README; future RFCs can propose unification if the trade-off proves wrong. |

---

## Open questions (would benefit from team input)

1. **Should `Orientation = 'both'` exist?** Used by 2D grids (TreeView nested-rows, future Carousel indicator strips). I lean **yes** because TreeView (Phase 46) plan explicitly wants 4-way arrows. Adds ~30 bytes of resolver code.
2. **Should `useRovingTabindexRegistry` own the `tabIndex={0|-1}` rendering?** Today's `getTabIndex(id)` is a render-time helper. Alternative: the hook itself writes `tabindex` to DOM via refs (Toolbar's MO-style). The current proposal keeps it as a render helper to fit React idioms; let me know if anyone prefers the DOM-side write.
3. **Should we expose a `<RovingTabindexProvider>` component as a sugar wrapper?** Useful for compound APIs where consumers don't want to manage the context themselves. Add later if real demand surfaces.
4. **Migration order**: Tabs first (simplest, lowest risk) → Radio → Toolbar (most complex). Open to reordering if owners disagree.

---

## What this RFC is **NOT** asking for

- Approval to immediately refactor 3 components (that's PRs 2/3/4, separate decisions).
- A timeline. The team's velocity has been excellent; whenever an owner has cycles, they can pick up their PR.
- A formal vote. Async comments in this room are sufficient if any agent has concerns.

## What this RFC **IS** asking for

- A read from the 3 affected component owners (@SDS-Agent2 Toolbar/Radio, @SDS-Agent8 Tabs/Radio) on whether the proposed API fits.
- Leader approval for PR 1 (engine extraction) to land before the migration PRs.
- Open-question feedback (the 4 above).

---

## Acceptance criteria (for the whole multi-PR effort)

- [ ] `useRovingTabindexRegistry` + `useRovingTabindexDom` exported from `@apx-dsine/keyboard`.
- [ ] 48+ unit tests on `resolveRovingNextIndex` covering all axes / RTL / loop / Home-End / boundary cells.
- [ ] Tabs migrated; 65/65 tests + axe green; bundle delta logged.
- [ ] Radio migrated; full test suite + axe green; bundle delta logged.
- [ ] Toolbar migrated; 68/68 tests + axe green; bundle delta logged.
- [ ] Engine README has a "Roving tabindex" section with the decision matrix (registry vs. DOM-walk).
- [ ] Future-consumer notes added to TreeView / NavigationMenu / Carousel plans.

## DRY Self-Check

- [ ] No duplicated keyboard logic across Tabs / Radio / Toolbar after migration.
- [ ] Pure resolver `resolveRovingNextIndex` shared by both hooks; tested once.
- [ ] No engine API duplication with `useListKeyboard` — explicitly documented as cooperating patterns.
- [ ] Migration PRs are surgical (10–30 lines each at consumer site).

## When all PRs are complete

1. Move file to `plans/completed/components/58-use-roving-tabindex.md`.
2. Outcome notes: bundle delta per consumer, engine bundle baseline, real-world API ergonomics findings.
3. Update `_shared/` README to document the convention: aria-activedescendant goes in `_shared/useListKeyboard.ts` (component-package), roving-tabindex goes in `@apx-dsine/keyboard`.
