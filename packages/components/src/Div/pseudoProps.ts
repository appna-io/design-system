import { cn, prefixClasses } from '@apx-ui/engine';

/**
 * Map of `<Div />` pseudo-state props → Tailwind variant prefix. Each prop accepts a className
 * **string**; every whitespace-separated token is prefixed via the engine's `prefixClasses`
 * helper and merged into the final class string.
 *
 * `onFocus` is intentionally **not** present — it would collide with React's native focus event
 * handler. Use `onFocusVisible` for keyboard-focus styling (also the a11y-correct default), or
 * compose `focus:*` classes via the standard `className` prop when pointer-focus styling is
 * genuinely needed.
 */
export const PSEUDO_PREFIX = {
  onHover: 'hover:',
  onFocusVisible: 'focus-visible:',
  onActive: 'active:',
  onDisabled: 'disabled:',
  onChecked: 'aria-checked:',
  onGroupHover: 'group-hover:',
  onDataState: 'data-[state=open]:',
} as const;

export type PseudoPropName = keyof typeof PSEUDO_PREFIX;

export type PseudoPropMap = Partial<Record<PseudoPropName, string | undefined>>;

/**
 * Build a single className string from a `<Div />` pseudo-prop map. Returns `''` when every
 * input prop is empty/`undefined` so the caller can skip a no-op `cn(...)` round-trip.
 */
export function buildPseudoClassName(input: PseudoPropMap): string {
  let parts: string[] | null = null;

  for (const key of Object.keys(PSEUDO_PREFIX) as PseudoPropName[]) {
    const raw = input[key];
    if (!raw) continue;
    const prefixed = prefixClasses(raw, PSEUDO_PREFIX[key]);
    if (!prefixed) continue;
    if (!parts) parts = [];
    parts.push(prefixed);
  }

  if (!parts) return '';
  return cn(...parts);
}