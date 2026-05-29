import type { FieldValidator, FormErrors, FormValidator } from './Form.types';

export interface DeriveErrorsArgs<Values> {
  values: Values;
  centralValidate?: FormValidator<Values> | undefined;
  perFieldValidators: ReadonlyMap<keyof Values, FieldValidator<unknown, Values>>;
}

/**
 * Composes errors from two sources:
 *   1. The central validator (if any) runs first and seeds the error map.
 *   2. Per-field validators (registered via `<FormField validate>`) run after and **override**
 *      central entries for the same key. Per-field wins because it's the more specific signal.
 *
 * Both validators may be async; this returns a single `Promise<FormErrors<Values>>` whose
 * resolved value is the merged map. Falsy returns (`null` / `undefined` / `''`) clear the key.
 *
 * Pure (modulo the validator callbacks themselves). Unit-tested across central-only,
 * per-field-only, both, and async paths.
 */
export async function deriveErrors<Values>({
  values,
  centralValidate,
  perFieldValidators,
}: DeriveErrorsArgs<Values>): Promise<FormErrors<Values>> {
  const out: FormErrors<Values> = {};

  if (centralValidate) {
    const central = await centralValidate(values);
    if (central) {
      for (const [k, v] of Object.entries(central as object)) {
        if (v) (out as Record<string, string>)[k] = v as string;
      }
    }
  }

  if (perFieldValidators.size > 0) {
    const tasks: Array<Promise<readonly [keyof Values, string | null | undefined]>> = [];
    for (const [name, validator] of perFieldValidators) {
      const value = (values as Record<string, unknown>)[name as string];
      const result = validator(value, values);
      tasks.push(Promise.resolve(result).then((r) => [name, r] as const));
    }
    const settled = await Promise.all(tasks);
    for (const [name, err] of settled) {
      if (err) (out as Record<string, string>)[name as string] = err;
      else delete (out as Record<string, string>)[name as string];
    }
  }

  return out;
}
