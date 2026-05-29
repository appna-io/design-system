export interface NormalizeOptions {
  trim?: boolean;
  toLowerCase?: boolean;
  /**
   * Per-tag validator. Returns `true` for a valid tag, `false` for invalid (with the default
   * error message), or a `string` for invalid with a custom inline error.
   */
  validate?: ((value: string) => boolean | string) | undefined;
  /** Default error message when `validate` returns `false`. */
  defaultErrorMessage?: string;
}

export interface NormalizedTag {
  /** Final tag string after trim / case folding. Empty string means "drop this token". */
  value: string;
  isValid: boolean;
  /** Present when `isValid === false`. */
  error?: string;
}

/**
 * The shared normalization pipeline for every incoming tag — whether typed, pasted, or picked
 * from the suggestion list. Three independent passes:
 *
 *  1. **Trim** (default on) — strips leading/trailing whitespace.
 *  2. **Case fold** (default off) — lowercases the value when `toLowerCase` is on.
 *  3. **Validate** — if a `validate` callback is provided, captures its result + error string.
 *
 * Returns `{ value: '', isValid: true }` for tokens that collapse to empty after trim — callers
 * should drop those silently (the user typed a separator with nothing in front of it).
 *
 * Pure. Unit-tested across each pass + validator return shapes.
 */
export function normalizeTag(raw: string, opts: NormalizeOptions = {}): NormalizedTag {
  const { trim = true, toLowerCase = false, validate, defaultErrorMessage = 'Invalid tag' } = opts;

  let value = raw;
  if (trim) value = value.trim();
  if (toLowerCase) value = value.toLowerCase();

  if (value.length === 0) {
    return { value: '', isValid: true };
  }

  if (!validate) return { value, isValid: true };

  const result = validate(value);
  if (result === true) return { value, isValid: true };
  if (result === false) return { value, isValid: false, error: defaultErrorMessage };
  // String return → custom error message.
  return { value, isValid: false, error: result };
}
