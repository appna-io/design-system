import type { FormFlags } from './Form.types';

/**
 * Computes `{ [k]: true }` for every key whose current value differs from the initial value via
 * `Object.is`. Pure + O(n). Returned object only contains the dirty keys (no `false` entries) so
 * `Object.keys(dirty).length` is a quick "is the form dirty?" probe.
 *
 * Used after every `setFieldValue` / `setValues` to keep `state.dirty` + `state.isDirty` in sync.
 */
export function deriveDirty<Values>(
  values: Values,
  initialValues: Values,
): FormFlags<Values> {
  const out: FormFlags<Values> = {};
  if (!values || !initialValues || typeof values !== 'object' || typeof initialValues !== 'object') {
    return out;
  }
  const all = new Set<string>([
    ...Object.keys(values as object),
    ...Object.keys(initialValues as object),
  ]);
  for (const key of all) {
    const a = (values as Record<string, unknown>)[key];
    const b = (initialValues as Record<string, unknown>)[key];
    if (!Object.is(a, b)) {
      (out as Record<string, boolean>)[key] = true;
    }
  }
  return out;
}