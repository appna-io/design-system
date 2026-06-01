/**
 * Shared internals for the roving-tabindex engine hooks.
 *
 * Lives in the engine package because three shipped consumers (Tabs, Radio's native browser
 * impl notwithstanding, Toolbar) want the same pure resolver. Splitting the resolver out of
 * the hooks lets unit tests cover every key × orientation × RTL × loop cell without spinning
 * up a React DOM.
 */

/**
 * Layout axis the items live on.
 *
 *  - `'horizontal'` — only `ArrowLeft` / `ArrowRight` step (with RTL flipping the meaning).
 *  - `'vertical'`   — only `ArrowUp` / `ArrowDown` step.
 *  - `'both'`       — all four arrows step the same linear sequence. Useful for grids that
 *    don't have an obvious 2D layout (TreeView's flat outline) and for consumers that want
 *    to accept whichever axis the user reaches for. RTL flips Left/Right only; Up/Down stay.
 */
export type Orientation = 'horizontal' | 'vertical' | 'both';

/**
 * How activation relates to focus movement.
 *
 *  - `'automatic'` — moving focus also activates (e.g. Tabs that auto-switch their panel on
 *    arrow press). Cheaper UX for panel switches.
 *  - `'manual'`    — focus moves freely; activation requires `Enter` or `Space`. Use this
 *    when the activated state has a real cost (expensive panel render, network fetch, etc.).
 */
export type ActivationMode = 'automatic' | 'manual';

/**
 * An item participating in roving-tabindex navigation. The `id` is opaque — either a string
 * (registry mode, where the consumer maintains its own (id → element) map) or the live
 * `HTMLElement` (DOM-walk mode, where the elements *are* the registry).
 */
export interface RovingItem {
  /** Stable id (registry mode) or the live HTMLElement (DOM-walk mode). */
  id: string | HTMLElement;
  /** Whether arrow nav should skip this item. Defaults to `false`. */
  disabled?: boolean;
}

/**
 * Shared options for both `useRovingTabindexRegistry` and `useRovingTabindexDom`. The per-hook
 * options extend this with the registry/DOM-specific bits (`getItems` / `focusItem` for
 * registry, `rootRef` / `itemSelector` for DOM-walk).
 */
export interface RovingTabindexBaseOptions {
  /** Layout axis. `'both'` accepts all four arrows; `'horizontal'`/`'vertical'` restrict. */
  orientation: Orientation;
  /** Whether arrow nav wraps at boundaries. @default true */
  loop?: boolean;
  /**
   * Whether `ArrowLeft` / `ArrowRight` swap meaning under RTL. @default true
   *
   * Set to `false` for components whose layout is *visually* horizontal but semantically
   * direction-agnostic — extremely rare; almost every consumer wants the RTL flip.
   */
  rtlAware?: boolean;
  /** Manual vs automatic activation. @default 'automatic' */
  activation?: ActivationMode;
}

/**
 * Pure index resolver — given the items array, the index of the currently-focused item, and a
 * key, return the index of the next item to focus, or `-1` if the key isn't navigational.
 *
 * Pure → unit-testable without a DOM. Both hooks delegate to this.
 *
 * Behavior summary:
 *  - `ArrowRight` / `ArrowLeft` step horizontally (skipping disabled items). RTL flips them.
 *  - `ArrowDown` / `ArrowUp` step vertically. RTL has no effect on the vertical axis.
 *  - `Home` jumps to the first enabled item; `End` to the last enabled item.
 *  - All other keys return `-1` (caller should treat as "not handled").
 *  - When `loop=false` and the cursor would walk past either end, the resolver returns the
 *    boundary index (so the consumer can preventDefault and stay put). This matches the W3C
 *    listbox / toolbar guidance and avoids the focus jumping back to the head on End-Right.
 *
 * The `focusedIndex` is allowed to be `-1` (no current focus inside the set). In that case
 * the resolver treats index `0` as the starting position so arrow presses still produce a
 * predictable destination — this is exactly what happens on first user interaction.
 */
export function resolveRovingNextIndex(args: {
  items: ReadonlyArray<RovingItem>;
  focusedIndex: number;
  key: string;
  orientation: Orientation;
  isRtl: boolean;
  loop: boolean;
}): number {
  const { items, focusedIndex, key, orientation, isRtl, loop } = args;
  if (items.length === 0) return -1;

  const acceptsHorizontal = orientation === 'horizontal' || orientation === 'both';
  const acceptsVertical = orientation === 'vertical' || orientation === 'both';

  // Step direction (+1 / -1) for arrow keys. `null` => not an arrow key we handle.
  let step: 1 | -1 | null = null;
  // Absolute target (for Home / End). Set this instead of `step`.
  let absolute: number | null = null;

  switch (key) {
    case 'ArrowRight':
      if (!acceptsHorizontal) return -1;
      step = isRtl ? -1 : 1;
      break;
    case 'ArrowLeft':
      if (!acceptsHorizontal) return -1;
      step = isRtl ? 1 : -1;
      break;
    case 'ArrowDown':
      if (!acceptsVertical) return -1;
      step = 1;
      break;
    case 'ArrowUp':
      if (!acceptsVertical) return -1;
      step = -1;
      break;
    case 'Home':
      absolute = 0;
      break;
    case 'End':
      absolute = items.length - 1;
      break;
    default:
      return -1;
  }

  // Home / End jump to the first / last *enabled* item respectively.
  if (absolute !== null) {
    if (absolute === 0) return findNextEnabledIndex(items, -1, 1, /* loop */ false);
    return findNextEnabledIndex(items, items.length, -1, /* loop */ false);
  }

  // Arrow step. Walk from the current index in the step direction, skipping disabled items.
  // `findNextEnabledIndex` respects `loop` — without looping it clamps at the boundary.
  const safeIndex = focusedIndex < 0 ? 0 : focusedIndex;
  return findNextEnabledIndex(items, safeIndex, step!, loop);
}

/**
 * Walk through `items` from `fromIndex` in direction `step`, returning the first enabled
 * index. Skips items where `disabled === true`. When `loop` is true the walk wraps; otherwise
 * it clamps at the boundary (returns the last enabled index encountered on that side, or
 * `fromIndex` if none).
 *
 * Internal — exported only for the unit tests via `_rovingShared`.
 */
export function findNextEnabledIndex(
  items: ReadonlyArray<RovingItem>,
  fromIndex: number,
  step: 1 | -1,
  loop: boolean,
): number {
  const n = items.length;
  if (n === 0) return -1;

  // Cap the walk at n steps so we never infinite-loop on an all-disabled list.
  let idx = fromIndex;
  for (let i = 0; i < n; i++) {
    idx = idx + step;
    if (idx < 0) {
      if (!loop) return findFirstEnabledFromHead(items);
      idx = n - 1;
    } else if (idx >= n) {
      if (!loop) return findLastEnabledFromTail(items);
      idx = 0;
    }
    const item = items[idx];
    if (item && !item.disabled) return idx;
  }
  // Entire list is disabled. Return the starting position (no movement).
  return fromIndex >= 0 && fromIndex < n ? fromIndex : -1;
}

function findFirstEnabledFromHead(items: ReadonlyArray<RovingItem>): number {
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it && !it.disabled) return i;
  }
  return -1;
}

function findLastEnabledFromTail(items: ReadonlyArray<RovingItem>): number {
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    if (it && !it.disabled) return i;
  }
  return -1;
}

/**
 * Detect RTL by walking up from an element to the nearest `[dir="rtl"]` ancestor, falling
 * back to `document.dir`. Reading at handle-time (rather than at hook init) means flipping
 * `dir` at runtime works without remounting the consumer.
 *
 * Exported because both hooks need it and a third potential consumer (any keyboard hook that
 * wants to be RTL-aware) will too.
 */
export function isElementRtl(el: HTMLElement | null | undefined): boolean {
  if (!el) return false;
  if (el.closest('[dir="rtl"]')) return true;
  return el.ownerDocument?.dir === 'rtl';
}

/**
 * Locate an `id` (string or HTMLElement) inside an items array and return its index, or `-1`
 * if not present. String ids compare with `===`; element ids compare with reference equality.
 */
export function indexOfRovingId(
  items: ReadonlyArray<RovingItem>,
  id: string | HTMLElement | null,
): number {
  if (id == null) return -1;
  for (let i = 0; i < items.length; i++) {
    if (items[i]?.id === id) return i;
  }
  return -1;
}