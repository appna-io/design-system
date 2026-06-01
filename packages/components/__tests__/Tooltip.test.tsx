import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Tooltip } from '../src/Tooltip';
import type { TooltipPlacement, TooltipVariant } from '../src/Tooltip';
import { renderWithTheme as render } from './utils';

/**
 * Tests use **real timers** + `openDelay={0}` for the open path — `setTimeout(fn, 0)` still
 * defers to the next macrotask but `waitFor` flushes through it without time mocks. We avoid
 * `vi.useFakeTimers` because Motion's `<AnimatePresence>` exit animation depends on real
 * `requestAnimationFrame` ticks; pinning the clock makes the floating element linger forever.
 */

function queryTooltip(): HTMLElement | null {
  return screen.queryByRole('tooltip');
}

describe('Tooltip — rendering', () => {
  it('renders the trigger and keeps the tooltip absent until hover', () => {
    render(
      <Tooltip content="Hint">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    expect(queryTooltip()).toBeNull();
  });

  it('opens on pointerenter and sets aria-describedby', async () => {
    render(
      <Tooltip content="Hint" openDelay={0}>
        <button>Hover</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    expect(trigger).not.toHaveAttribute('aria-describedby');

    fireEvent.pointerEnter(trigger);
    await waitFor(() => expect(queryTooltip()).toBeInTheDocument());

    const tooltipId = queryTooltip()!.id;
    expect(trigger).toHaveAttribute('aria-describedby', tooltipId);
  });

  it('closes on pointerleave', async () => {
    render(
      <Tooltip content="Hint" openDelay={0} closeDelay={0}>
        <button>Hover</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    fireEvent.pointerEnter(trigger);
    await waitFor(() => expect(queryTooltip()).toBeInTheDocument());

    fireEvent.pointerLeave(trigger);
    await waitFor(() => expect(queryTooltip()).toBeNull(), { timeout: 2000 });
  });

  it('cancels the close timer when the cursor enters the surface', async () => {
    render(
      <Tooltip content="Hint" openDelay={0} closeDelay={50}>
        <button>Hover</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    fireEvent.pointerEnter(trigger);
    await waitFor(() => expect(queryTooltip()).toBeInTheDocument());

    fireEvent.pointerLeave(trigger);
    // Move into the surface BEFORE the 50ms close timer can fire.
    fireEvent.pointerEnter(queryTooltip()!);

    // After the close-delay elapses the tooltip is still there.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(queryTooltip()).toBeInTheDocument();
  });

  it('opens on focus and closes on blur', async () => {
    render(
      <Tooltip content="Hint" openDelay={0} closeDelay={0}>
        <button>Focus</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    fireEvent.focus(trigger);
    await waitFor(() => expect(queryTooltip()).toBeInTheDocument());

    fireEvent.blur(trigger);
    await waitFor(() => expect(queryTooltip()).toBeNull(), { timeout: 2000 });
  });

  it('Esc closes when open', async () => {
    render(
      <Tooltip content="Hint" openDelay={0}>
        <button>Hover</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    fireEvent.pointerEnter(trigger);
    await waitFor(() => expect(queryTooltip()).toBeInTheDocument());

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(queryTooltip()).toBeNull(), { timeout: 2000 });
  });

  it('respects controlled `open`', async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button data-testid="ext-toggle" onClick={() => setOpen((v) => !v)}>
            toggle
          </button>
          <Tooltip content="Hint" open={open} onOpenChange={() => {}}>
            <span>trigger</span>
          </Tooltip>
        </>
      );
    }
    render(<Controlled />);
    expect(queryTooltip()).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('ext-toggle'));
    await waitFor(() => expect(queryTooltip()).toBeNull(), { timeout: 2000 });
  });

  it('disabled={true} prevents any opening', async () => {
    render(
      <Tooltip content="Hint" disabled openDelay={0}>
        <button>Hover</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    fireEvent.pointerEnter(trigger);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(queryTooltip()).toBeNull();
  });

  it('showArrow={false} hides the arrow node', async () => {
    render(
      <Tooltip content="Hint" openDelay={0} showArrow={false}>
        <button>Hover</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button'));
    await waitFor(() => expect(queryTooltip()).toBeInTheDocument());
    expect(queryTooltip()!.querySelector('svg')).toBeNull();
  });

  it('showArrow defaults to true', async () => {
    render(
      <Tooltip content="Hint" openDelay={0}>
        <button>Hover</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button'));
    await waitFor(() => expect(queryTooltip()).toBeInTheDocument());
    expect(queryTooltip()!.querySelector('svg')).not.toBeNull();
  });

  it('applies variant + color + size compound classes on the surface', async () => {
    render(
      <Tooltip content="Hint" variant="solid" color="success" size="lg" openDelay={0}>
        <button>Hover</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button'));
    await waitFor(() => expect(queryTooltip()).toBeInTheDocument());
    const cls = queryTooltip()!.className;
    expect(cls).toMatch(/bg-success/);
    expect(cls).toMatch(/text-success-contrast/);
    expect(cls).toMatch(/text-base/);
  });

  it('inverted variant ignores color', async () => {
    render(
      <Tooltip content="Hint" variant="inverted" color="danger" openDelay={0}>
        <button>Hover</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button'));
    await waitFor(() => expect(queryTooltip()).toBeInTheDocument());
    const cls = queryTooltip()!.className;
    expect(cls).toMatch(/bg-fg-default/);
    expect(cls).toMatch(/text-bg-paper/);
    expect(cls).not.toMatch(/bg-danger\b/);
  });

  it('renders into a custom portalContainer', async () => {
    const container = document.createElement('div');
    container.setAttribute('data-testid', 'custom-portal');
    document.body.appendChild(container);

    render(
      <Tooltip content="Hint" openDelay={0} portalContainer={container}>
        <button>Hover</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button'));
    await waitFor(() => expect(queryTooltip()).toBeInTheDocument());

    const tooltip = queryTooltip()!;
    expect(container.contains(tooltip)).toBe(true);

    container.remove();
  });

  it('reports placement on data-placement attribute', async () => {
    const placements: TooltipPlacement[] = ['top', 'bottom', 'left', 'right'];
    for (const placement of placements) {
      const { unmount } = render(
        <Tooltip content="Hint" openDelay={0} placement={placement}>
          <button>Hover</button>
        </Tooltip>,
      );
      fireEvent.pointerEnter(screen.getByRole('button'));
      await waitFor(() => {
        const tip = queryTooltip();
        expect(tip).not.toBeNull();
        expect(tip!.getAttribute('data-placement')).toBe(placement);
      });
      unmount();
    }
  });

  it('forwards extra HTML props onto the floating surface', async () => {
    render(
      <Tooltip content="Hint" openDelay={0} data-testid="tip">
        <button>Hover</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByTestId('tip')).toBe(queryTooltip());
    });
  });

  it("preserves the trigger child's existing onPointerEnter handler", () => {
    const onPointerEnter = vi.fn();
    render(
      <Tooltip content="Hint" openDelay={0}>
        <button onPointerEnter={onPointerEnter}>Hover</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button'));
    expect(onPointerEnter).toHaveBeenCalledTimes(1);
  });

  it('throws on multi-element children at runtime (Children.only)', () => {
    // The `children: ReactElement` prop type forbids multi-child usage at compile time, but
    // someone could still pass an array via spread or `cloneElement`. We construct that case
    // dynamically to verify the runtime guard still fires.
    const original = console.error;
    console.error = () => {};
    const a = <span key="a">one</span>;
    const b = <span key="b">two</span>;
    const props = { content: 'Hint', children: [a, b] } as unknown as Parameters<typeof Tooltip>[0];
    expect(() => render(<Tooltip {...props} />)).toThrow();
    console.error = original;
  });

  it.each<TooltipVariant>(['solid', 'outline', 'soft', 'inverted'])(
    'renders %s variant without throwing for every color',
    async (variant) => {
      const colors = [
        'primary',
        'secondary',
        'success',
        'warning',
        'danger',
        'info',
        'neutral',
      ] as const;
      for (const color of colors) {
        const { unmount } = render(
          <Tooltip content="Hint" variant={variant} color={color} openDelay={0}>
            <button>Hover</button>
          </Tooltip>,
        );
        fireEvent.pointerEnter(screen.getByRole('button'));
        await waitFor(() => expect(queryTooltip()).toBeInTheDocument());
        unmount();
      }
    },
  );
});