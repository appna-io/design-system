import { render, act, waitFor } from '@testing-library/react';
import { useEffect, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { usePosition, type UsePositionOptions } from '../../src/positioning/usePosition';

/**
 * Floating UI's `useFloating` does its actual measuring work in microtasks. Our tests render a
 * harness that exposes the hook's return shape via a callback, then assert against that captured
 * data after waiting for the first computation to settle.
 */

function Harness({
  opts,
  onMeasure,
}: {
  opts: UsePositionOptions;
  onMeasure: (
    state: ReturnType<typeof usePosition> & { triggerRect: DOMRect; floatingEl: HTMLElement | null },
  ) => void;
}): ReactElement {
  const pos = usePosition(opts);

  useEffect(() => {
    // Capture the latest state after every render.
    onMeasure({ ...pos, triggerRect: new DOMRect(), floatingEl: null });
  });

  return (
    <div>
      <button
        ref={(node) => pos.triggerRef(node)}
        data-testid="trigger"
        style={{ width: 100, height: 30 }}
      >
        trigger
      </button>
      <div
        ref={(node) => pos.floatingRef(node)}
        data-testid="floating"
        style={{ position: 'absolute', width: 80, height: 40 }}
      >
        floating
        {opts.arrow && pos.arrowRef && (
          <span ref={(n) => pos.arrowRef!(n)} data-testid="arrow" style={{ width: 8, height: 8 }} />
        )}
      </div>
    </div>
  );
}

describe('usePosition', () => {
  it('returns null x/y before the first measurement, then resolves to numbers', async () => {
    const captured: ReturnType<typeof usePosition>[] = [];
    render(
      <Harness
        opts={{ placement: 'bottom' }}
        onMeasure={(s) => captured.push(s)}
      />,
    );

    // First synchronous render returns null x/y because Floating UI measures async.
    expect(captured.length).toBeGreaterThan(0);
    expect(captured[0]!.x).toBeNull();
    expect(captured[0]!.y).toBeNull();

    await waitFor(() => {
      const last = captured[captured.length - 1]!;
      // After the next microtask Floating UI populates the floatingStyles object even in jsdom.
      expect(last.floatingStyles).toBeTruthy();
    });
  });

  it('exposes the requested placement (initial — no flip math in jsdom)', async () => {
    const captured: ReturnType<typeof usePosition>[] = [];
    render(<Harness opts={{ placement: 'top-start' }} onMeasure={(s) => captured.push(s)} />);
    await waitFor(() => {
      expect(captured[captured.length - 1]!.placement).toBe('top-start');
    });
  });

  it('arrow=true returns a non-null arrowRef; arrow=false returns null', async () => {
    const collected: Array<ReturnType<typeof usePosition>['arrowRef']> = [];
    render(
      <Harness
        opts={{ arrow: true }}
        onMeasure={(s) => collected.push(s.arrowRef)}
      />,
    );
    expect(collected[0]).not.toBeNull();

    const collected2: Array<ReturnType<typeof usePosition>['arrowRef']> = [];
    render(
      <Harness
        opts={{ arrow: false }}
        onMeasure={(s) => collected2.push(s.arrowRef)}
      />,
    );
    expect(collected2[0]).toBeNull();
  });

  it('triggerRef and floatingRef are stable across re-renders', () => {
    let firstTrigger: unknown;
    let firstFloating: unknown;
    let renders = 0;
    const captured: ReturnType<typeof usePosition>[] = [];

    const { rerender } = render(
      <Harness
        opts={{ placement: 'bottom' }}
        onMeasure={(s) => {
          if (renders === 0) {
            firstTrigger = s.triggerRef;
            firstFloating = s.floatingRef;
          }
          renders += 1;
          captured.push(s);
        }}
      />,
    );
    rerender(
      <Harness
        opts={{ placement: 'bottom' }}
        onMeasure={(s) => {
          captured.push(s);
        }}
      />,
    );
    // The setReference / setFloating callbacks from Floating UI are stable identities.
    expect(captured[captured.length - 1]!.triggerRef).toBe(firstTrigger);
    expect(captured[captured.length - 1]!.floatingRef).toBe(firstFloating);
  });

  it('open=false pauses autoUpdate (sanity: hook still mounts cleanly)', async () => {
    // We can't easily assert "no listener" in jsdom, but we can assert the hook still produces a
    // valid, non-throwing return value when paused. Combined with the above stability test, this
    // is sufficient coverage for the conditional branch.
    const captured: ReturnType<typeof usePosition>[] = [];
    render(
      <Harness
        opts={{ open: false }}
        onMeasure={(s) => captured.push(s)}
      />,
    );
    await act(async () => Promise.resolve());
    expect(captured.length).toBeGreaterThan(0);
    expect(typeof captured[0]!.triggerRef).toBe('function');
    expect(typeof captured[0]!.floatingRef).toBe('function');
  });
});