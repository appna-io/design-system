/**
 * The CSS selector used by Radix UI / W3C examples for "potentially focusable" elements. Anything
 * matching this selector is a candidate; we still filter for visibility and `tabindex="-1"` below
 * before treating it as actually focusable.
 *
 * The selector deliberately omits `[contenteditable]` because contenteditable elements need
 * additional checks (they can be `false` while still matching `[contenteditable]`), and the
 * overlay components we ship don't put contenteditables inside traps.
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Returns true if the element is "actually focusable" right now. We check the cheap, reliable
 * signals (tabindex, disabled, aria-hidden, inline `display:none` / `visibility:hidden`) and
 * deliberately do NOT walk ancestors or call `getBoundingClientRect`:
 *
 * - Layout-based visibility checks (`offsetParent`, `getClientRects`) are unreliable in jsdom and
 *   in any real browser before first paint. They reject our trap's own children at activation
 *   time, which is the wrong default.
 * - Consumers who need to mark an element non-focusable can set `tabindex="-1"` or
 *   `aria-hidden="true"` — both of which we honor here.
 *
 * Matches Radix's `tabbable` behaviour for the 80% case the DS overlays need.
 */
export function isFocusable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el.tabIndex < 0) return false;
  if (el.hasAttribute('disabled')) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  if (el.hasAttribute('hidden')) return false;
  const style = el.style;
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  return true;
}

/**
 * Returns all focusable descendants of `container`, in DOM order. Used by the focus trap to
 * compute the wrap-around boundaries (first / last) on Tab and Shift+Tab.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const candidates = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  const out: HTMLElement[] = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const node = candidates[i];
    if (node && isFocusable(node)) out.push(node);
  }
  return out;
}

/**
 * Returns the first and last focusable descendants — convenience for the trap's Tab handler.
 * `null` when the container has no focusable children (the trap then keeps focus on the container
 * itself via `tabIndex={-1}`).
 */
export function getFocusableBoundaries(
  container: HTMLElement,
): { first: HTMLElement; last: HTMLElement } | null {
  const all = getFocusableElements(container);
  if (all.length === 0) return null;
  const first = all[0]!;
  const last = all[all.length - 1]!;
  return { first, last };
}
