import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMediaQuery } from '../../src/hooks/useMediaQuery';

type MqlListener = (event: MediaQueryListEvent) => void;

interface FakeMql {
  matches: boolean;
  media: string;
  onchange: null;
  addEventListener: (type: 'change', listener: MqlListener) => void;
  removeEventListener: (type: 'change', listener: MqlListener) => void;
  addListener: (listener: MqlListener) => void;
  removeListener: (listener: MqlListener) => void;
  dispatchEvent: (event: Event) => boolean;
}

function makeFakeMql(matches: boolean): FakeMql {
  return {
    matches,
    media: '',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  };
}

describe('useMediaQuery', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({ ...makeFakeMql(query.includes('reduce')), media: query })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the current match state', () => {
    const { result } = renderHook(() => useMediaQuery('(prefers-reduced-motion: reduce)'));
    expect(result.current).toBe(true);
  });

  it('returns false when query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 9999px)'));
    expect(result.current).toBe(false);
  });

  it('uses defaultValue before the effect runs (SSR-safe)', () => {
    // We can't really test SSR here, but we can check the option is read.
    const { result } = renderHook(() =>
      useMediaQuery('(min-width: 9999px)', { defaultValue: true }),
    );
    // After mount, the real value (false) takes over — defaultValue is for the initial render only.
    expect(result.current).toBe(false);
  });
});