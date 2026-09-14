import type { ThemeShape } from '@apx-ui/engine';

import { deriveDarkPalette } from './deriveDarkPalette';

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
    result = deepMerge(result, withDerivedDark(override));
  }
  return result as T;
}

/**
 * A brand that overrides `palette.light` and says nothing about `palette.dark` gets a derived
 * dark palette rather than the design system's default one.
 *
 * Without this, the merge does exactly what it is told and dark mode silently keeps the DS
 * indigo — so a deep-green brand renders green in light mode and generic indigo in dark, with no
 * error, on half the sessions. It is invisible to the author (light mode is perfect) and
 * invisible to every grep, because nothing is wrong; something is merely absent.
 *
 * This only ever fills a gap. An override that authors its own `palette.dark` is untouched, and
 * a partial dark override still wins key-by-key over the derived values — so a brand can derive
 * most of its dark mode and hand-tune the two roles it cares about.
 */
function withDerivedDark(override: ThemeOverride): ThemeOverride {
  const palette = (override as { palette?: Record<string, unknown> }).palette;
  if (!palette || !isPlainObject(palette)) return override;
  if (!isPlainObject(palette['light'])) return override;

  const derived = deriveDarkPalette(palette['light'] as Record<string, unknown>);
  if (!derived) return override;

  return {
    ...override,
    palette: {
      ...palette,
      // Authored dark values win — this fills in what the brand did not say.
      dark: deepMerge(derived, palette['dark']) as Record<string, unknown>,
    },
  } as ThemeOverride;
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