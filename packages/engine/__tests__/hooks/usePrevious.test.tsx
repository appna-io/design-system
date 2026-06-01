import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePrevious } from '../../src/hooks/usePrevious';

describe('usePrevious', () => {
  it('returns undefined on the first render', () => {
    const { result } = renderHook(({ v }) => usePrevious(v), { initialProps: { v: 'a' } });
    expect(result.current).toBeUndefined();
  });

  it('returns the previous value after a re-render', () => {
    const { result, rerender } = renderHook(({ v }) => usePrevious(v), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    expect(result.current).toBe('a');
    rerender({ v: 'c' });
    expect(result.current).toBe('b');
  });
});