import { describe, expect, it } from 'vitest';

import { resolveMessage } from '../../src/i18n/resolveMessage';

describe('resolveMessage', () => {
  const messages = {
    stepper: {
      previous: 'Previous',
      pluralized: { one: '{count} step', other: '{count} steps' },
    },
    nested: {
      a: { b: { c: 'deep' } },
    },
    Toast: { close: 'Close' },
  };

  it('returns a top-level string', () => {
    expect(resolveMessage(messages as never, 'stepper.previous')).toBe('Previous');
  });

  it('returns a nested object', () => {
    expect(resolveMessage(messages as never, 'stepper.pluralized')).toEqual({
      one: '{count} step',
      other: '{count} steps',
    });
  });

  it('walks deeply nested paths', () => {
    expect(resolveMessage(messages as never, 'nested.a.b.c')).toBe('deep');
  });

  it('returns undefined when the path is missing', () => {
    expect(resolveMessage(messages as never, 'stepper.not-there')).toBeUndefined();
    expect(resolveMessage(messages as never, 'missing')).toBeUndefined();
  });

  it('returns undefined for missing intermediate segments', () => {
    expect(resolveMessage(messages as never, 'nested.x.y.z')).toBeUndefined();
  });

  it('returns undefined for empty or malformed keys', () => {
    expect(resolveMessage(messages as never, '')).toBeUndefined();
    expect(resolveMessage(messages as never, '..')).toBeUndefined();
  });

  it('handles undefined messages gracefully', () => {
    expect(resolveMessage(undefined, 'stepper.previous')).toBeUndefined();
  });

  it('short-circuits on non-object intermediates', () => {
    expect(resolveMessage(messages as never, 'stepper.previous.something')).toBeUndefined();
  });
});