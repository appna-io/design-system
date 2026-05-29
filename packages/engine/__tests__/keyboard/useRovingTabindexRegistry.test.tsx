import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCallback, useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  useRovingTabindexRegistry,
  type RovingItem,
} from '../../src/keyboard';

/**
 * A small "tabs-shaped" harness so we can exercise the registry hook with realistic DOM and
 * keyboard interactions. The harness owns a `(value → ref)` map and the focused value, and
 * passes both to the engine hook.
 */
function Harness({
  values = ['a', 'b', 'c'],
  disabled = [] as string[],
  activation = 'automatic' as 'automatic' | 'manual',
  orientation = 'horizontal' as 'horizontal' | 'vertical' | 'both',
  rtl = false,
  loop = true,
  onActivate = vi.fn(),
}: {
  values?: string[];
  disabled?: string[];
  activation?: 'automatic' | 'manual';
  orientation?: 'horizontal' | 'vertical' | 'both';
  rtl?: boolean;
  loop?: boolean;
  onActivate?: (id: string | HTMLElement) => void;
}) {
  const refs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [focused, setFocused] = useState<string>(values[0] ?? '');
  // Tracks externally-observed activations so tests can read them via DOM.
  const [activated, setActivated] = useState<string>('');

  const getItems = useCallback((): RovingItem[] => {
    return values.map((v) => ({ id: v, disabled: disabled.includes(v) }));
  }, [values, disabled]);
  const getFocusedId = useCallback(() => focused, [focused]);
  const focusItem = useCallback((id: string | HTMLElement) => {
    if (typeof id !== 'string') return;
    setFocused(id);
    refs.current.get(id)?.focus();
  }, []);
  const handleActivate = useCallback(
    (id: string | HTMLElement) => {
      onActivate(id);
      if (typeof id === 'string') setActivated(id);
    },
    [onActivate],
  );

  const { onKeyDown, getTabIndex } = useRovingTabindexRegistry({
    orientation,
    activation,
    loop,
    getItems,
    getFocusedId,
    focusItem,
    onActivate: handleActivate,
  });

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} data-testid="root">
      {values.map((v) => (
        <button
          key={v}
          ref={(el) => {
            if (el) refs.current.set(v, el);
            else refs.current.delete(v);
          }}
          data-testid={`item-${v}`}
          aria-disabled={disabled.includes(v) || undefined}
          disabled={disabled.includes(v)}
          tabIndex={getTabIndex(v)}
          onKeyDown={onKeyDown}
        >
          {v}
        </button>
      ))}
      <div data-testid="focused">{focused}</div>
      <div data-testid="activated">{activated}</div>
    </div>
  );
}

describe('useRovingTabindexRegistry', () => {
  it('assigns tabIndex=0 to the focused item and -1 to the rest', () => {
    render(<Harness />);
    expect(screen.getByTestId('item-a').tabIndex).toBe(0);
    expect(screen.getByTestId('item-b').tabIndex).toBe(-1);
    expect(screen.getByTestId('item-c').tabIndex).toBe(-1);
  });

  it('ArrowRight moves focus forward (LTR)', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByTestId('item-a'));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('focused')).toHaveTextContent('b');
    expect(screen.getByTestId('item-b')).toHaveFocus();
  });

  it('ArrowRight under RTL moves focus backward (wrap)', async () => {
    const user = userEvent.setup();
    render(<Harness rtl />);
    await user.click(screen.getByTestId('item-a'));
    await user.keyboard('{ArrowRight}');
    // RTL: right = backward; from index 0 wraps to last.
    expect(screen.getByTestId('focused')).toHaveTextContent('c');
  });

  it('ArrowLeft under RTL moves focus forward', async () => {
    const user = userEvent.setup();
    render(<Harness rtl />);
    await user.click(screen.getByTestId('item-a'));
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('focused')).toHaveTextContent('b');
  });

  it('Home / End jump to first / last', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByTestId('item-b'));
    await user.keyboard('{End}');
    expect(screen.getByTestId('focused')).toHaveTextContent('c');
    await user.keyboard('{Home}');
    expect(screen.getByTestId('focused')).toHaveTextContent('a');
  });

  it('automatic activation fires onActivate on focus move', async () => {
    const onActivate = vi.fn();
    const user = userEvent.setup();
    render(<Harness onActivate={onActivate} />);
    await user.click(screen.getByTestId('item-a'));
    await user.keyboard('{ArrowRight}');
    expect(onActivate).toHaveBeenCalledWith('b');
  });

  it('manual activation does NOT fire onActivate until Enter/Space', async () => {
    const onActivate = vi.fn();
    const user = userEvent.setup();
    render(<Harness activation="manual" onActivate={onActivate} />);
    await user.click(screen.getByTestId('item-a'));
    await user.keyboard('{ArrowRight}');
    expect(onActivate).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledWith('b');
  });

  it('Space activates in manual mode', async () => {
    const onActivate = vi.fn();
    const user = userEvent.setup();
    render(<Harness activation="manual" onActivate={onActivate} />);
    await user.click(screen.getByTestId('item-a'));
    await user.keyboard('{ArrowRight}');
    await user.keyboard(' ');
    expect(onActivate).toHaveBeenCalledWith('b');
  });

  it('skips disabled items when stepping', async () => {
    const user = userEvent.setup();
    render(<Harness disabled={['b']} />);
    await user.click(screen.getByTestId('item-a'));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('focused')).toHaveTextContent('c');
  });

  it('loop=false clamps at the boundary', async () => {
    const user = userEvent.setup();
    render(<Harness loop={false} />);
    await user.click(screen.getByTestId('item-a'));
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('focused')).toHaveTextContent('a');
  });

  it('vertical orientation only responds to ArrowUp / ArrowDown', async () => {
    const user = userEvent.setup();
    render(<Harness orientation="vertical" />);
    await user.click(screen.getByTestId('item-a'));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('focused')).toHaveTextContent('a');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('focused')).toHaveTextContent('b');
  });

  it('orientation=both accepts both axes', async () => {
    const user = userEvent.setup();
    render(<Harness orientation="both" />);
    await user.click(screen.getByTestId('item-a'));
    await user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('focused')).toHaveTextContent('b');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('focused')).toHaveTextContent('c');
  });

  it('does nothing for keys it does not own', async () => {
    const onActivate = vi.fn();
    const user = userEvent.setup();
    render(<Harness onActivate={onActivate} />);
    await user.click(screen.getByTestId('item-a'));
    await user.keyboard('q');
    expect(screen.getByTestId('focused')).toHaveTextContent('a');
  });
});
