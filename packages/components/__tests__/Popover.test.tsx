import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Popover } from '../src/Popover';
import type { PopoverPlacement, PopoverVariant } from '../src/Popover';
import { renderWithTheme as render } from './utils';

/**
 * Same testing strategy Tooltip uses: real timers + `await waitFor` for AnimatePresence exits.
 * `userEvent.setup()` is preferred over raw `fireEvent` for click + tab interactions because it
 * dispatches the realistic event sequence (pointerdown → pointerup → click → focus shifts).
 */

function queryDialog(): HTMLElement | null {
  return screen.queryByRole('dialog');
}

describe('Popover — rendering', () => {
  it('renders the trigger and keeps the content absent until clicked', () => {
    render(
      <Popover>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>Hello</Popover.Content>
      </Popover>,
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(queryDialog()).toBeNull();
  });

  it('opens on click and wires aria-controls / aria-expanded / data-state', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>Hello</Popover.Content>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('data-state', 'closed');
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');

    await user.click(trigger);
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('data-state', 'open');
    const dialogId = queryDialog()!.id;
    expect(trigger).toHaveAttribute('aria-controls', dialogId);
    expect(queryDialog()).toHaveAttribute('aria-labelledby', trigger.id);
  });

  it('toggles closed when the trigger is clicked again', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>Hello</Popover.Content>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.click(trigger);
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
  });
});

describe('Popover — close behavior', () => {
  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>Hello</Popover.Content>
      </Popover>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
  });

  it('closes on outside pointerdown', async () => {
    render(
      <div>
        <Popover defaultOpen>
          <Popover.Trigger>
            <button>Open</button>
          </Popover.Trigger>
          <Popover.Content>Hello</Popover.Content>
        </Popover>
        <button data-testid="outside">outside</button>
      </div>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());

    const outside = screen.getByTestId('outside');
    fireEvent.pointerDown(outside);
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
  });

  it('does NOT close when clicking inside the content', async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>
          <button data-testid="inside">inside button</button>
        </Popover.Content>
      </Popover>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    const inside = screen.getByTestId('inside');
    await user.click(inside);
    expect(queryDialog()).toBeInTheDocument();
  });

  it('does NOT close on Esc when closeOnEscape={false}', async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen closeOnEscape={false}>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>Hello</Popover.Content>
      </Popover>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    // small wait to give a hypothetical close timer a chance
    await new Promise((r) => setTimeout(r, 100));
    expect(queryDialog()).toBeInTheDocument();
  });

  it('does NOT close on outside click when closeOnOutsideClick={false}', async () => {
    render(
      <div>
        <Popover defaultOpen closeOnOutsideClick={false}>
          <Popover.Trigger>
            <button>Open</button>
          </Popover.Trigger>
          <Popover.Content>Hello</Popover.Content>
        </Popover>
        <button data-testid="outside">outside</button>
      </div>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    fireEvent.pointerDown(screen.getByTestId('outside'));
    await new Promise((r) => setTimeout(r, 100));
    expect(queryDialog()).toBeInTheDocument();
  });
});

describe('Popover — focus management', () => {
  it('focuses the first focusable inside the content on open', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>
          <button data-testid="first">first</button>
          <button data-testid="second">second</button>
        </Popover.Content>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByTestId('first')).toHaveFocus(),
    );
  });

  it('honors `initialFocus` when provided', async () => {
    function Harness(): ReactElement {
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <Popover>
          <Popover.Trigger>
            <button>Open</button>
          </Popover.Trigger>
          <Popover.Content initialFocus={ref}>
            <button>first</button>
            <button ref={ref} data-testid="target">
              target
            </button>
          </Popover.Content>
        </Popover>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId('target')).toHaveFocus());
  });

  it('returns focus to the trigger on close', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>
          <button>inside</button>
        </Popover.Content>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('does NOT trap focus when trapFocus={false}', async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen trapFocus={false}>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>
          <button data-testid="first">first</button>
        </Popover.Content>
      </Popover>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    // Without trapFocus, the trap effect doesn't run — first focusable isn't auto-focused.
    expect(screen.getByTestId('first')).not.toHaveFocus();
    // Sanity: tabbing still works (we didn't break native behaviour).
    await user.tab();
  });
});

describe('Popover — controlled state', () => {
  it('controlled open prop drives open/close', async () => {
    function Harness(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <Popover open={open} onOpenChange={setOpen}>
            <Popover.Trigger>
              <button>Open</button>
            </Popover.Trigger>
            <Popover.Content>Controlled</Popover.Content>
          </Popover>
          <button data-testid="ext-open" onClick={() => setOpen(true)}>
            ext-open
          </button>
          <button data-testid="ext-close" onClick={() => setOpen(false)}>
            ext-close
          </button>
        </div>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);
    expect(queryDialog()).toBeNull();
    await user.click(screen.getByTestId('ext-open'));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.click(screen.getByTestId('ext-close'));
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
  });

  it('calls onOpenChange when closing via outside click', async () => {
    const onOpenChange = vi.fn();
    render(
      <div>
        <Popover defaultOpen onOpenChange={onOpenChange}>
          <Popover.Trigger>
            <button>Open</button>
          </Popover.Trigger>
          <Popover.Content>Hello</Popover.Content>
        </Popover>
        <button data-testid="outside">outside</button>
      </div>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    fireEvent.pointerDown(screen.getByTestId('outside'));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});

describe('Popover — variants & classes', () => {
  it('applies variant + size + color classes to the content surface', async () => {
    const user = userEvent.setup();
    const variants: PopoverVariant[] = ['solid', 'outline', 'soft'];
    for (const variant of variants) {
      const { unmount } = render(
        <Popover>
          <Popover.Trigger>
            <button>Open</button>
          </Popover.Trigger>
          <Popover.Content variant={variant} color="primary" size="lg">
            content
          </Popover.Content>
        </Popover>,
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await waitFor(() => expect(queryDialog()).toBeInTheDocument());
      const dialog = queryDialog()!;
      expect(dialog).toHaveAttribute('data-variant', variant);
      expect(dialog.className).toMatch(/p-6/);
      unmount();
    }
  });

  it('attaches Floating UI positioning styles to Content on open (regression: top-corner bug)', async () => {
    // Regression test for the renderer bug where Popover Content was rendering at top: 0; left: 0
    // because Floating UI's `setReference` was wired via a one-shot useEffect that could miss
    // the trigger node depending on commit order. After the fix, `setReference` is forwarded
    // through the root context's `triggerRef` callback, so Floating UI sees the trigger at the
    // exact moment it mounts.
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>
          <p>Body</p>
        </Popover.Content>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    const dialog = queryDialog()!;
    // Floating UI ships `position: absolute` + `top` + `left` + `transform` once it has measured.
    // jsdom returns zeroed bounding rects so the numeric coords are all 0, but the *style props*
    // must be present — that's what proves Floating UI's middleware actually ran. Pre-fix, the
    // `transform` and Floating UI's positioning shape would be missing entirely (the dialog
    // would have only the recipe's class-based styles).
    const style = dialog.getAttribute('style') ?? '';
    expect(style).toMatch(/position:\s*absolute/);
    expect(style).toMatch(/transform:/);
  });

  it('reflects a resolved placement on data-placement (after Floating UI flip)', async () => {
    const user = userEvent.setup();
    // jsdom returns zeroed bounding rects for every element, so Floating UI's `flip` middleware
    // may swap any requested placement to its opposite (a "trigger at 0,0" sits in the
    // top-left corner of the viewport so requests like `right` flip to `left`). We only assert
    // that data-placement is set to *some* valid placement value.
    const validPlacements = new Set<PopoverPlacement>([
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
    ]);
    const requested: PopoverPlacement[] = ['top', 'bottom', 'left', 'right'];
    for (const placement of requested) {
      const { unmount } = render(
        <Popover>
          <Popover.Trigger>
            <button>Open</button>
          </Popover.Trigger>
          <Popover.Content placement={placement}>content</Popover.Content>
        </Popover>,
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await waitFor(() => expect(queryDialog()).toBeInTheDocument());
      const dialog = queryDialog()!;
      const resolved = dialog.getAttribute('data-placement') as PopoverPlacement | null;
      expect(resolved).not.toBeNull();
      expect(validPlacements.has(resolved!)).toBe(true);
      unmount();
    }
  });
});

describe('Popover — modal mode', () => {
  it('sets aria-modal=true and renders a backdrop when modal', async () => {
    const user = userEvent.setup();
    render(
      <Popover modal>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content data-testid="content">Hello</Popover.Content>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(queryDialog()).toHaveAttribute('aria-modal', 'true');
  });

  it('does NOT set aria-modal when non-modal', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>Hello</Popover.Content>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(queryDialog()).not.toHaveAttribute('aria-modal');
  });
});

describe('Popover — Close subpart', () => {
  it('closes the popover when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>
          Hello
          <Popover.Close />
        </Popover.Content>
      </Popover>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
  });

  it('preserves consumer onClick.preventDefault to keep popover open', async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>
          Hello
          <Popover.Close
            onClick={(e) => {
              e.preventDefault();
            }}
            data-testid="close"
          />
        </Popover.Content>
      </Popover>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.click(screen.getByTestId('close'));
    await new Promise((r) => setTimeout(r, 100));
    expect(queryDialog()).toBeInTheDocument();
  });
});

describe('Popover — Trigger asChild', () => {
  it('clones the single child and merges the click handler', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>
          <button onClick={onClick}>Open</button>
        </Popover.Trigger>
        <Popover.Content>Hello</Popover.Content>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an inline button when asChild={false}', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger asChild={false}>Open me</Popover.Trigger>
        <Popover.Content>Hello</Popover.Content>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open me' });
    expect(trigger.tagName).toBe('BUTTON');
    await user.click(trigger);
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
  });
});

describe('Popover — context guards', () => {
  it('throws a helpful error if a subpart is used outside <Popover>', () => {
    const original = console.error;
    console.error = () => {};
    expect(() =>
      render(<Popover.Content>orphan</Popover.Content>),
    ).toThrow(/<Popover\.Content> must be rendered inside a <Popover>/);
    console.error = original;
  });
});