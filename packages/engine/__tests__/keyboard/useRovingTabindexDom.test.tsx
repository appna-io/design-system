import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { useRovingTabindexDom } from '../../src/keyboard';

function Harness({
  orientation = 'horizontal' as 'horizontal' | 'vertical' | 'both',
  loop = true,
  observe = true,
  rtl = false,
  children,
}: {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  observe?: boolean;
  rtl?: boolean;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { onKeyDownCapture } = useRovingTabindexDom({
    rootRef,
    orientation,
    loop,
    observe,
  });

  return (
    <div
      ref={rootRef}
      role="toolbar"
      data-testid="root"
      dir={rtl ? 'rtl' : 'ltr'}
      onKeyDownCapture={onKeyDownCapture}
    >
      {children}
    </div>
  );
}

describe('useRovingTabindexDom', () => {
  it('assigns tabindex=0 to the first focusable child and -1 to the rest', async () => {
    render(
      <Harness>
        <button data-testid="b1">one</button>
        <button data-testid="b2">two</button>
        <button data-testid="b3">three</button>
      </Harness>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('b1').getAttribute('tabindex')).toBe('0');
    });
    expect(screen.getByTestId('b2').getAttribute('tabindex')).toBe('-1');
    expect(screen.getByTestId('b3').getAttribute('tabindex')).toBe('-1');
  });

  it('ArrowRight moves focus forward (LTR)', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <button data-testid="b1">one</button>
        <button data-testid="b2">two</button>
        <button data-testid="b3">three</button>
      </Harness>,
    );
    screen.getByTestId('b1').focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('b2')).toHaveFocus();
  });

  it('ArrowRight under RTL moves focus backward', async () => {
    const user = userEvent.setup();
    render(
      <Harness rtl>
        <button data-testid="b1">one</button>
        <button data-testid="b2">two</button>
        <button data-testid="b3">three</button>
      </Harness>,
    );
    screen.getByTestId('b2').focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('b1')).toHaveFocus();
  });

  it('Home / End jump to first / last item', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <button data-testid="b1">one</button>
        <button data-testid="b2">two</button>
        <button data-testid="b3">three</button>
      </Harness>,
    );
    screen.getByTestId('b2').focus();
    await user.keyboard('{End}');
    expect(screen.getByTestId('b3')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByTestId('b1')).toHaveFocus();
  });

  it('skips disabled and aria-disabled children', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <button data-testid="b1">one</button>
        <button data-testid="b2" disabled>
          two
        </button>
        <button data-testid="b3" aria-disabled="true">
          three
        </button>
        <button data-testid="b4">four</button>
      </Harness>,
    );
    screen.getByTestId('b1').focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('b4')).toHaveFocus();
  });

  it('respects skipBoundarySelector default (data-toolbar-skip)', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <button data-testid="b1">one</button>
        <div data-toolbar-skip="true">
          <button data-testid="bskip">SKIP</button>
        </div>
        <button data-testid="b2">two</button>
      </Harness>,
    );
    screen.getByTestId('b1').focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('b2')).toHaveFocus();
  });

  it('does not navigate when a text input has focus', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <button data-testid="b1">one</button>
        <input data-testid="input" type="text" />
        <button data-testid="b2">two</button>
      </Harness>,
    );
    screen.getByTestId('input').focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('input')).toHaveFocus();
  });

  it('vertical orientation only responds to ArrowUp / ArrowDown', async () => {
    const user = userEvent.setup();
    render(
      <Harness orientation="vertical">
        <button data-testid="b1">one</button>
        <button data-testid="b2">two</button>
      </Harness>,
    );
    screen.getByTestId('b1').focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('b1')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('b2')).toHaveFocus();
  });

  it('focusin promotes the focused child to tabindex=0', async () => {
    render(
      <Harness>
        <button data-testid="b1">one</button>
        <button data-testid="b2">two</button>
      </Harness>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('b1').getAttribute('tabindex')).toBe('0');
    });
    screen.getByTestId('b2').focus();
    await waitFor(() => {
      expect(screen.getByTestId('b2').getAttribute('tabindex')).toBe('0');
    });
    expect(screen.getByTestId('b1').getAttribute('tabindex')).toBe('-1');
  });

  it('loop=false clamps at the boundary', async () => {
    const user = userEvent.setup();
    render(
      <Harness loop={false}>
        <button data-testid="b1">one</button>
        <button data-testid="b2">two</button>
      </Harness>,
    );
    screen.getByTestId('b1').focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('b1')).toHaveFocus();
  });

  it('MutationObserver re-asserts tabindex when a child rewrites it', async () => {
    render(
      <Harness>
        <button data-testid="b1">one</button>
        <button data-testid="b2">two</button>
      </Harness>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('b1').getAttribute('tabindex')).toBe('0');
    });
    // Simulate a child component (e.g. ToggleGroup) reclaiming tabindex=0.
    screen.getByTestId('b2').setAttribute('tabindex', '0');
    await waitFor(() => {
      // Only one item should have tabindex=0; b1 should still be the entry point because
      // focus hasn't moved.
      expect(screen.getByTestId('b1').getAttribute('tabindex')).toBe('0');
      expect(screen.getByTestId('b2').getAttribute('tabindex')).toBe('-1');
    });
  });
});