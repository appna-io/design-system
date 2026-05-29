import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { HoverCard } from '../src/HoverCard';
import { renderWithTheme as render } from './utils';

/**
 * Same testing strategy as Tooltip: real timers + `openDelay={0}` / `closeDelay={0}` for fast
 * paths. We avoid `vi.useFakeTimers` because Motion's `<AnimatePresence>` exit needs real
 * `requestAnimationFrame` ticks; pinning the clock makes the floating element linger forever.
 *
 * HoverCard's content uses `role="tooltip"` (per the W3C HoverCard guidance — it's a
 * description-of-trigger overlay, not a button-disclosed panel). We query through `role` and
 * fall back to `data-state` for the few cases where role is hidden during the exit animation.
 */
function queryCard(): HTMLElement | null {
  return screen.queryByRole('tooltip');
}

describe('HoverCard — rendering', () => {
  it('renders the trigger and keeps the content absent until hovered', () => {
    render(
      <HoverCard>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    expect(screen.getByRole('link', { name: '@ahmad' })).toBeInTheDocument();
    expect(queryCard()).toBeNull();
  });

  it('opens on pointerenter after openDelay and wires aria-describedby', async () => {
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link', { name: '@ahmad' });
    expect(trigger).not.toHaveAttribute('aria-describedby');

    fireEvent.pointerEnter(trigger);
    await waitFor(() => expect(queryCard()).toBeInTheDocument());

    const cardId = queryCard()!.id;
    expect(trigger).toHaveAttribute('aria-describedby', cardId);
    expect(trigger).toHaveAttribute('data-state', 'open');
  });

  it('closes on pointerleave from the trigger', async () => {
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link');
    fireEvent.pointerEnter(trigger);
    await waitFor(() => expect(queryCard()).toBeInTheDocument());

    fireEvent.pointerLeave(trigger);
    await waitFor(() => expect(queryCard()).toBeNull(), { timeout: 2000 });
  });

  it('does not open while still inside the open delay', async () => {
    render(
      <HoverCard openDelay={150} closeDelay={0}>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link');
    fireEvent.pointerEnter(trigger);
    // Immediately leave — open delay should be cancelled, no card.
    fireEvent.pointerLeave(trigger);

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(queryCard()).toBeNull();
  });
});

describe('HoverCard — bridge pattern', () => {
  it('cancels the close timer when the cursor enters the content surface', async () => {
    render(
      <HoverCard openDelay={0} closeDelay={50}>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link');
    fireEvent.pointerEnter(trigger);
    await waitFor(() => expect(queryCard()).toBeInTheDocument());

    // Trigger the close timer, then enter the surface before it fires.
    fireEvent.pointerLeave(trigger);
    fireEvent.pointerEnter(queryCard()!);

    // After the 50ms close timer would have fired, card is still there.
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(queryCard()).toBeInTheDocument();
  });

  it('re-arms the close timer when the cursor leaves the surface', async () => {
    render(
      <HoverCard openDelay={0} closeDelay={20}>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link');
    fireEvent.pointerEnter(trigger);
    await waitFor(() => expect(queryCard()).toBeInTheDocument());

    fireEvent.pointerLeave(trigger);
    fireEvent.pointerEnter(queryCard()!);
    fireEvent.pointerLeave(queryCard()!);

    await waitFor(() => expect(queryCard()).toBeNull(), { timeout: 2000 });
  });
});

describe('HoverCard — keyboard / focus', () => {
  it('opens on focus when trigger="hover-focus" (default)', async () => {
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link');
    fireEvent.focus(trigger);
    await waitFor(() => expect(queryCard()).toBeInTheDocument());
  });

  it('closes immediately on blur (focus path)', async () => {
    render(
      <HoverCard openDelay={0} closeDelay={500}>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link');
    fireEvent.focus(trigger);
    await waitFor(() => expect(queryCard()).toBeInTheDocument());

    fireEvent.blur(trigger);
    // Blur path closes immediately (regardless of closeDelay).
    await waitFor(() => expect(queryCard()).toBeNull(), { timeout: 2000 });
  });

  it('does NOT open on focus when trigger="hover"', async () => {
    render(
      <HoverCard trigger="hover" openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link');
    fireEvent.focus(trigger);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(queryCard()).toBeNull();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard openDelay={0} closeDelay={0} defaultOpen>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    await waitFor(() => expect(queryCard()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(queryCard()).toBeNull(), { timeout: 2000 });
  });
});

describe('HoverCard — controlled state', () => {
  it('controlled open + onOpenChange', async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)} data-testid="manual-open">
            manual open
          </button>
          <HoverCard open={open} onOpenChange={setOpen} openDelay={0} closeDelay={0}>
            <HoverCard.Trigger>
              <a href="#user">@ahmad</a>
            </HoverCard.Trigger>
            <HoverCard.Content>Card body</HoverCard.Content>
          </HoverCard>
        </>
      );
    }
    render(<Controlled />);

    expect(queryCard()).toBeNull();
    fireEvent.click(screen.getByTestId('manual-open'));
    await waitFor(() => expect(queryCard()).toBeInTheDocument());
  });

  it('fires onOpenChange when hover schedules an open', async () => {
    const onOpenChange = vi.fn();
    render(
      <HoverCard openDelay={0} closeDelay={0} onOpenChange={onOpenChange}>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    fireEvent.pointerEnter(screen.getByRole('link'));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
  });
});

describe('HoverCard — positioning', () => {
  it('attaches Floating UI positioning styles to Content on open (regression: top-corner bug)', async () => {
    // Same regression test added for Popover — Floating UI's `setReference` must wire through
    // the registerPositionReference path so the card never opens at top-left of the viewport.
    render(
      <HoverCard openDelay={0} closeDelay={0} defaultOpen>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    await waitFor(() => expect(queryCard()).toBeInTheDocument());
    const card = queryCard()!;
    const inlineStyle = card.getAttribute('style') ?? '';
    expect(inlineStyle).toContain('position: absolute');
    // Floating UI emits `transform: translate(...)` on the floating element.
    expect(inlineStyle).toContain('transform:');
  });
});

describe('HoverCard — Trigger asChild & validation', () => {
  it('throws when asChild has more than one element', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <HoverCard>
          <HoverCard.Trigger asChild>
            <a href="#a">a</a>
            <a href="#b">b</a>
          </HoverCard.Trigger>
          <HoverCard.Content>x</HoverCard.Content>
        </HoverCard>,
      ),
    ).toThrow();
    spy.mockRestore();
  });

  it('renders an inline button when asChild={false}', () => {
    render(
      <HoverCard>
        <HoverCard.Trigger asChild={false}>plain text trigger</HoverCard.Trigger>
        <HoverCard.Content>x</HoverCard.Content>
      </HoverCard>,
    );
    const btn = screen.getByRole('button', { name: 'plain text trigger' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('type', 'button');
  });
});

describe('HoverCard — arrow', () => {
  it('renders the arrow by default', async () => {
    render(
      <HoverCard openDelay={0} closeDelay={0} defaultOpen>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content data-testid="card">Card body</HoverCard.Content>
      </HoverCard>,
    );
    await waitFor(() => expect(queryCard()).toBeInTheDocument());
    expect(queryCard()!.querySelector('svg')).toBeTruthy();
  });

  it('omits the arrow when showArrow={false}', async () => {
    render(
      <HoverCard openDelay={0} closeDelay={0} defaultOpen>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content showArrow={false}>Card body</HoverCard.Content>
      </HoverCard>,
    );
    await waitFor(() => expect(queryCard()).toBeInTheDocument());
    expect(queryCard()!.querySelector('svg')).toBeNull();
  });
});
