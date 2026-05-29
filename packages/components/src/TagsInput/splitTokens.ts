/**
 * Accepts `splitOn` as either a `RegExp` or an array of separator strings, plus the raw text
 * from a paste / typed input, and returns a clean list of token candidates.
 *
 * - String separators are escaped + joined into a single alternation regex so callers don't
 *   pay for one `.split()` per separator.
 * - Empty tokens are filtered out (multiple consecutive separators collapse).
 * - Whitespace is **not** trimmed here — `normalizeTag` owns the trim/case/validate pipeline so
 *   the policy lives in one place.
 *
 * Pure, O(n) over the input length. Unit-tested across single/multiple separators, RegExp input,
 * trailing separators, empty input, and CSV-like paste shapes.
 *
 * @example
 *   splitTokens('a, b; c',  [',', ';'])           // ['a', ' b', ' c']
 *   splitTokens('a\nb\nc',  /[\n,;\s]+/)           // ['a', 'b', 'c']
 *   splitTokens('hello',    [','])                 // ['hello']
 *   splitTokens('',         [','])                 // []
 */
export function splitTokens(input: string, splitOn: ReadonlyArray<string> | RegExp): string[] {
  if (!input) return [];
  const pattern = splitOn instanceof RegExp ? splitOn : buildSeparatorRegex(splitOn);
  if (!pattern) return [input];
  return input.split(pattern).filter((token) => token.length > 0);
}

/**
 * Should `input` (the user's current typing buffer) be treated as containing at least one
 * complete separator? Used to decide whether a `commit` event should fire on the latest
 * keystroke.
 */
export function containsSeparator(
  input: string,
  splitOn: ReadonlyArray<string> | RegExp,
): boolean {
  if (!input) return false;
  if (splitOn instanceof RegExp) return splitOn.test(input);
  return splitOn.some((sep) => sep.length > 0 && input.includes(sep));
}

function buildSeparatorRegex(seps: ReadonlyArray<string>): RegExp | null {
  const escaped = seps
    .filter((s) => s.length > 0)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (escaped.length === 0) return null;
  return new RegExp(`(?:${escaped.join('|')})`, 'g');
}
