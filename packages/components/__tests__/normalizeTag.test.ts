import { describe, expect, it } from 'vitest';

import { normalizeTag } from '../src/TagsInput/normalizeTag';

describe('normalizeTag', () => {
  it('trims by default', () => {
    expect(normalizeTag('  hello  ')).toEqual({ value: 'hello', isValid: true });
  });

  it('honours trim=false', () => {
    expect(normalizeTag('  hello  ', { trim: false })).toEqual({
      value: '  hello  ',
      isValid: true,
    });
  });

  it('lowercases when asked', () => {
    expect(normalizeTag('Hello', { toLowerCase: true })).toEqual({
      value: 'hello',
      isValid: true,
    });
  });

  it('returns empty value for whitespace-only input', () => {
    expect(normalizeTag('   ')).toEqual({ value: '', isValid: true });
  });

  it('runs validate(true) without errors', () => {
    expect(normalizeTag('a@b.c', { validate: () => true })).toEqual({
      value: 'a@b.c',
      isValid: true,
    });
  });

  it('runs validate(false) with default error', () => {
    expect(
      normalizeTag('bad', { validate: () => false, defaultErrorMessage: 'Nope' }),
    ).toEqual({ value: 'bad', isValid: false, error: 'Nope' });
  });

  it('runs validate(string) with the returned message', () => {
    expect(normalizeTag('bad', { validate: () => 'must be email' })).toEqual({
      value: 'bad',
      isValid: false,
      error: 'must be email',
    });
  });

  it('skips validate when value is empty after trim', () => {
    let called = false;
    const result = normalizeTag('   ', {
      validate: () => {
        called = true;
        return false;
      },
    });
    expect(result.value).toBe('');
    expect(called).toBe(false);
  });
});