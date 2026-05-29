import { describe, expect, it } from 'vitest';

import { deriveDirty } from '../src/Form/deriveDirty';

describe('deriveDirty', () => {
  it('returns {} when values match initial', () => {
    expect(deriveDirty({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toEqual({});
  });

  it('marks changed keys', () => {
    expect(deriveDirty({ a: 2, b: 'x' }, { a: 1, b: 'x' })).toEqual({ a: true });
  });

  it('treats NaN equal to NaN (Object.is semantics)', () => {
    expect(deriveDirty({ a: NaN }, { a: NaN })).toEqual({});
  });

  it('considers new keys dirty', () => {
    expect(deriveDirty({ a: 1, b: 2 }, { a: 1 })).toEqual({ b: true });
  });

  it('considers removed keys dirty', () => {
    expect(deriveDirty({ a: 1 } as { a: number; b?: number }, { a: 1, b: 2 })).toEqual({
      b: true,
    });
  });

  it('returns {} for non-object inputs', () => {
    expect(deriveDirty(null as unknown as Record<string, unknown>, {} as Record<string, unknown>)).toEqual({});
    expect(deriveDirty({} as Record<string, unknown>, null as unknown as Record<string, unknown>)).toEqual({});
  });
});
