import type { ThemeShape } from '@apx-ui/engine';

/**
 * A deeply-recursive partial of `ThemeShape`. Lets consumers override just one nested role —
 * `{ palette: { light: { primary: { main: '#ff0' } } } }` — without restating the entire object.
 */
export type ThemeOverride = DeepPartial<ThemeShape>;

export type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * Recursively merge any number of partial themes onto `base`. Plain objects are merged key-by-key;
 * everything else (arrays, strings, numbers, booleans, functions) is replaced wholesale by the
 * **last** non-undefined override. Returns a brand new object — does not mutate inputs.
 *
 * @example
 *   mergeTheme(defaultTheme, { palette: { light: { primary: { main: '#ff0' } } } });
 *   // → all other palette roles are preserved
 */
export function mergeTheme<T extends ThemeShape>(
  base: T,
  ...overrides: Array<ThemeOverride | undefined>
): T {
  let result: unknown = clone(base);
  for (const override of overrides) {
    if (override === undefined) continue;
    result = deepMerge(result, override);
  }
  return result as T;
}

function clone<T>(value: T): T {
  if (Array.isArray(value)) return value.map(clone) as unknown as T;
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = clone(v);
    return out as T;
  }
  return value;
}

function deepMerge(base: unknown, override: unknown): unknown {
  if (override === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return clone(override);
  }
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    out[key] = key in base ? deepMerge(base[key], value) : clone(value);
  }
  return out;
}
