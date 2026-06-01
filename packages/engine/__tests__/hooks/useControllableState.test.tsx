import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useControllableState } from '../../src/hooks/useControllableState';

describe('useControllableState', () => {
  it('starts with the default value when uncontrolled', () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 'a' }));
    expect(result.current[0]).toBe('a');
  });

  it('updates internal state when uncontrolled and setter is called', () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 'a' }));
    act(() => result.current[1]('b'));
    expect(result.current[0]).toBe('b');
  });

  it('mirrors the controlled value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState({ value, onChange: () => {} }),
      { initialProps: { value: 'x' } },
    );
    expect(result.current[0]).toBe('x');
    rerender({ value: 'y' });
    expect(result.current[0]).toBe('y');
  });

  it('does not mutate internal state in controlled mode (parent owns state)', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ value: 'x', onChange }));
    act(() => result.current[1]('y'));
    // value did not change because parent never updated it
    expect(result.current[0]).toBe('x');
    expect(onChange).toHaveBeenCalledWith('y');
  });

  it('calls onChange in both controlled and uncontrolled modes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 'a', onChange }));
    act(() => result.current[1]('b'));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});