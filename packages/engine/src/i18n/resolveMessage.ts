import type { I18nMessages } from './types';

/**
 * Walk a dotted-path key against a nested message bag and return the resolved value, or
 * `undefined` if any segment is missing.
 *
 * Pure → unit-testable without React. Used by both `t()` and `tn()` (the latter expects an
 * object at the leaf, the former expects a string).
 *
 * Behavior:
 *  - `key.split('.')` defines the lookup path. Empty segments are ignored.
 *  - At each step, if the current node is not an object, lookup short-circuits to `undefined`.
 *  - Returns the leaf value as-is — no type assertion. Callers pin the expected shape
 *    (`string` for `t`, `{ [LDMLPluralRule]: string }` for `tn`).
 */
export function resolveMessage(
  messages: I18nMessages | undefined,
  key: string,
): unknown {
  if (!messages) return undefined;
  if (!key) return undefined;
  const segments = key.split('.').filter(Boolean);
  if (segments.length === 0) return undefined;

  let current: unknown = messages;
  for (const segment of segments) {
    if (current == null) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}