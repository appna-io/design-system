import { describe, expect, it } from 'vitest';

import { deriveErrors } from '../src/Form/deriveErrors';
import type { FieldValidator } from '../src/Form/Form.types';

interface V extends Record<string, unknown> {
  email: string;
  age: number;
}

describe('deriveErrors', () => {
  it('returns {} when no validators are provided', async () => {
    const errors = await deriveErrors<V>({
      values: { email: '', age: 0 },
      centralValidate: undefined,
      perFieldValidators: new Map(),
    });
    expect(errors).toEqual({});
  });

  it('runs the central validator', async () => {
    const errors = await deriveErrors<V>({
      values: { email: '', age: 0 },
      centralValidate: (v) => ({ email: v.email ? undefined : 'Required' }),
      perFieldValidators: new Map(),
    });
    expect(errors).toEqual({ email: 'Required' });
  });

  it('runs per-field validators', async () => {
    const map = new Map<keyof V, FieldValidator<unknown, V>>([
      ['age', (value) => (Number(value) < 13 ? 'Too young' : null)],
    ]);
    const errors = await deriveErrors<V>({
      values: { email: '', age: 12 },
      centralValidate: undefined,
      perFieldValidators: map,
    });
    expect(errors).toEqual({ age: 'Too young' });
  });

  it('per-field wins over central on the same key', async () => {
    const map = new Map<keyof V, FieldValidator<unknown, V>>([
      ['email', () => 'per-field wins'],
    ]);
    const errors = await deriveErrors<V>({
      values: { email: '', age: 0 },
      centralValidate: () => ({ email: 'central' }),
      perFieldValidators: map,
    });
    expect(errors.email).toBe('per-field wins');
  });

  it('per-field can clear a central error by returning null', async () => {
    const map = new Map<keyof V, FieldValidator<unknown, V>>([['email', () => null]]);
    const errors = await deriveErrors<V>({
      values: { email: 'ok@x.com', age: 0 },
      centralValidate: () => ({ email: 'central says no' }),
      perFieldValidators: map,
    });
    expect(errors.email).toBeUndefined();
  });

  it('async validators are awaited', async () => {
    const map = new Map<keyof V, FieldValidator<unknown, V>>([
      [
        'email',
        async (value) => {
          await new Promise((r) => setTimeout(r, 5));
          return value ? null : 'async required';
        },
      ],
    ]);
    const errors = await deriveErrors<V>({
      values: { email: '', age: 0 },
      centralValidate: undefined,
      perFieldValidators: map,
    });
    expect(errors.email).toBe('async required');
  });
});