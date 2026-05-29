import { renderHook, act } from '@testing-library/react';
import { useRef, type RefObject } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useOutsideClick } from '../src/useOutsideClick';

/**
 * Set up two elements (`inside` and `outside`) on the document body, then mount the hook with
 * the `inside` ref pre-populated. Returns refs to the elements + the spy + a cleanup helper.
 */
function setupTwoElements(): {
  inside: HTMLElement;
  outside: HTMLElement;
  onOutside: ReturnType<typeof vi.fn>;
  rerender: (active: boolean) => void;
  unmount: () => void;
} {
  const inside = document.createElement('div');
  const outside = document.createElement('div');
  document.body.append(inside, outside);

  const onOutside = vi.fn();

  const { rerender, unmount } = renderHook(
    ({ active }: { active: boolean }) => {
      const ref = useRef<HTMLElement>(inside);
      useOutsideClick({ active, refs: [ref], onOutside });
    },
    { initialProps: { active: true } },
  );

  return {
    inside,
    outside,
    onOutside,
    rerender: (active: boolean) => rerender({ active }),
    unmount: () => {
      unmount();
      inside.remove();
      outside.remove();
    },
  };
}

function fireOutside(target: HTMLElement): void {
  // jsdom does not implement `PointerEvent`. Our hook only uses `event.target`, so a basic
  // bubbling Event of type 'pointerdown' exercises the same code path as a real PointerEvent.
  const event = new Event('pointerdown', { bubbles: true });
  target.dispatchEvent(event);
}

describe('useOutsideClick', () => {
  it('fires onOutside for pointerdown outside the refs', () => {
    const { outside, onOutside, unmount } = setupTwoElements();
    act(() => fireOutside(outside));
    expect(onOutside).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('does not fire when the pointerdown lands inside the ref', () => {
    const { inside, onOutside, unmount } = setupTwoElements();
    act(() => fireOutside(inside));
    expect(onOutside).toHaveBeenCalledTimes(0);
    unmount();
  });

  it('treats descendants of the ref as inside', () => {
    const { inside, onOutside, unmount } = setupTwoElements();
    const child = document.createElement('button');
    inside.appendChild(child);
    act(() => fireOutside(child));
    expect(onOutside).toHaveBeenCalledTimes(0);
    unmount();
  });

  it('supports multiple "inside" refs (trigger + portalled floating element)', () => {
    const trigger = document.createElement('button');
    const floating = document.createElement('div');
    const outside = document.createElement('div');
    document.body.append(trigger, floating, outside);
    const onOutside = vi.fn();

    renderHook(() => {
      const a = useRef<HTMLElement>(trigger);
      const b = useRef<HTMLElement>(floating);
      useOutsideClick({ active: true, refs: [a, b], onOutside });
    });

    act(() => fireOutside(trigger));
    act(() => fireOutside(floating));
    expect(onOutside).toHaveBeenCalledTimes(0);

    act(() => fireOutside(outside));
    expect(onOutside).toHaveBeenCalledTimes(1);

    trigger.remove();
    floating.remove();
    outside.remove();
  });

  it('active=false ignores all events', () => {
    const { outside, onOutside, rerender, unmount } = setupTwoElements();
    rerender(false);
    act(() => fireOutside(outside));
    expect(onOutside).toHaveBeenCalledTimes(0);
    unmount();
  });

  it('cleans up the listener on unmount', () => {
    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.append(inside, outside);
    const onOutside = vi.fn();

    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLElement>(inside);
      useOutsideClick({ active: true, refs: [ref], onOutside });
    });
    unmount();
    act(() => fireOutside(outside));
    expect(onOutside).toHaveBeenCalledTimes(0);

    inside.remove();
    outside.remove();
  });

  it('reads the latest onOutside callback on every event', () => {
    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.append(inside, outside);
    const first = vi.fn();
    const second = vi.fn();

    const { rerender, unmount } = renderHook(
      ({ cb }: { cb: () => void }) => {
        const ref = useRef<HTMLElement>(inside);
        useOutsideClick({ active: true, refs: [ref as RefObject<HTMLElement | null>], onOutside: cb });
      },
      { initialProps: { cb: first } },
    );
    rerender({ cb: second });
    act(() => fireOutside(outside));
    expect(first).toHaveBeenCalledTimes(0);
    expect(second).toHaveBeenCalledTimes(1);

    unmount();
    inside.remove();
    outside.remove();
  });
});
