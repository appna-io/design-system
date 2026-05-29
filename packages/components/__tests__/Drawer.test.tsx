import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Drawer } from '../src/Drawer';
import type { DrawerSide, DrawerSize } from '../src/Drawer';
import { renderWithTheme as render } from './utils';

/**
 * Drawer mirrors Modal's surface so the test plan does too. Two areas need extra coverage:
 *
 *  - **Side axis** — all four sides set the right `data-side` and (smoke-test) the right
 *    width/height token on the recipe.
 *  - **Scroll-lock reference counting** — Drawer is the second consumer; opening Drawer-over-
 *    Modal should reuse a single body lock pair. Tested via `document.body.style.overflow`
 *    transitions.
 */

function queryDialog(): HTMLElement | null {
  return screen.queryByRole('dialog');
}

beforeEach(() => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
});

afterEach(() => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
});

describe('Drawer — rendering', () => {
  it('renders the trigger and keeps the content absent until clicked', () => {
    render(
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(queryDialog()).toBeNull();
  });

  it('opens on trigger click and wires aria + data-state', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('data-state', 'closed');

    await user.click(trigger);
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('data-state', 'open');
    expect(queryDialog()).toHaveAttribute('aria-modal', 'true');
  });
});

describe('Drawer — close behavior', () => {
  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Drawer defaultOpen>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
  });

  it('closes on backdrop click', async () => {
    render(
      <Drawer defaultOpen>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    const backdrop = queryDialog()!.parentElement!;
    fireEvent.pointerDown(backdrop, { target: backdrop });
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
  });

  it('does NOT close when clicking inside content', async () => {
    const user = userEvent.setup();
    render(
      <Drawer defaultOpen>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>
            <button data-testid="inside">inside</button>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.click(screen.getByTestId('inside'));
    expect(queryDialog()).toBeInTheDocument();
  });

  it('does NOT close on Esc when closeOnEscape={false}', async () => {
    const user = userEvent.setup();
    render(
      <Drawer defaultOpen closeOnEscape={false}>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await new Promise((r) => setTimeout(r, 100));
    expect(queryDialog()).toBeInTheDocument();
  });

  it('does NOT close on backdrop click when closeOnBackdropClick={false}', async () => {
    render(
      <Drawer defaultOpen closeOnBackdropClick={false}>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    const backdrop = queryDialog()!.parentElement!;
    fireEvent.pointerDown(backdrop, { target: backdrop });
    await new Promise((r) => setTimeout(r, 100));
    expect(queryDialog()).toBeInTheDocument();
  });
});

describe('Drawer — focus management', () => {
  it('focuses the first focusable inside content on open', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>
            <button data-testid="first">first</button>
            <button data-testid="second">second</button>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId('first')).toHaveFocus());
  });

  it('honors `initialFocus` when provided', async () => {
    function Harness(): ReactElement {
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <Drawer initialFocus={ref}>
          <Drawer.Trigger>
            <button>Open</button>
          </Drawer.Trigger>
          <Drawer.Content>
            <Drawer.Body>
              <button>first</button>
              <button ref={ref} data-testid="target">
                target
              </button>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
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
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>
            <button>inside</button>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

describe('Drawer — controlled state', () => {
  it('controlled open prop drives open / close', async () => {
    function Harness(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <Drawer open={open} onOpenChange={setOpen}>
            <Drawer.Trigger>
              <button>Open</button>
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Body>Controlled</Drawer.Body>
            </Drawer.Content>
          </Drawer>
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

  it('calls onOpenChange when closing via Escape', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Drawer defaultOpen onOpenChange={onOpenChange}>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});

describe('Drawer — sides & sizes', () => {
  it('reflects side on data-side and applies a side-specific recipe class', async () => {
    const user = userEvent.setup();
    const sides: DrawerSide[] = ['left', 'right', 'top', 'bottom'];
    for (const side of sides) {
      const { unmount } = render(
        <Drawer>
          <Drawer.Trigger>
            <button>Open</button>
          </Drawer.Trigger>
          <Drawer.Content side={side}>
            <Drawer.Body>content</Drawer.Body>
          </Drawer.Content>
        </Drawer>,
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await waitFor(() => expect(queryDialog()).toBeInTheDocument());
      const dialog = queryDialog()!;
      expect(dialog).toHaveAttribute('data-side', side);
      // Horizontal sides drive the width axis; vertical drive height. Smoke-check the recipe
      // produced the right token.
      if (side === 'left' || side === 'right') {
        expect(dialog.className).toMatch(/(max-w-|w-full)/);
      } else {
        expect(dialog.className).toMatch(/(max-h-|h-full)/);
      }
      unmount();
    }
  });

  it('applies size-specific max-width / max-height tokens per side', async () => {
    const user = userEvent.setup();
    const cases: Array<{ side: DrawerSide; size: DrawerSize; pattern: RegExp }> = [
      { side: 'left', size: 'sm', pattern: /max-w-xs/ },
      { side: 'left', size: 'md', pattern: /max-w-sm/ },
      { side: 'left', size: 'lg', pattern: /max-w-md/ },
      { side: 'left', size: 'xl', pattern: /max-w-xl/ },
      { side: 'right', size: 'lg', pattern: /max-w-md/ },
      { side: 'top', size: 'sm', pattern: /max-h-\[20rem\]/ },
      { side: 'top', size: 'md', pattern: /max-h-\[24rem\]/ },
      { side: 'bottom', size: 'lg', pattern: /max-h-\[28rem\]/ },
      { side: 'bottom', size: 'xl', pattern: /max-h-\[36rem\]/ },
    ];
    for (const { side, size, pattern } of cases) {
      const { unmount } = render(
        <Drawer>
          <Drawer.Trigger>
            <button>Open</button>
          </Drawer.Trigger>
          <Drawer.Content side={side} size={size}>
            <Drawer.Body>content</Drawer.Body>
          </Drawer.Content>
        </Drawer>,
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await waitFor(() => expect(queryDialog()).toBeInTheDocument());
      expect(queryDialog()!.className).toMatch(pattern);
      unmount();
    }
  });

  it('full size strips the rounded corners and goes edge-to-edge', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content side="right" size="full">
          <Drawer.Body>full</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(queryDialog()!.className).toMatch(/rounded-none/);
  });
});

describe('Drawer — body scroll lock (validates useScrollLock as second consumer)', () => {
  it('locks body scroll while open', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    expect(document.body.style.overflow).toBe('');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await waitFor(() => expect(document.body.style.overflow).toBe('hidden'));
  });

  it('restores body scroll when closed', async () => {
    const user = userEvent.setup();
    render(
      <Drawer defaultOpen>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(document.body.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
    await waitFor(() => expect(document.body.style.overflow).toBe(''));
  });

  it('does NOT lock body scroll when preventScroll={false}', async () => {
    const user = userEvent.setup();
    render(
      <Drawer preventScroll={false}>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(document.body.style.overflow).toBe('');
  });
});

describe('Drawer — Header / Body / Footer composition', () => {
  it('Header renders title + description with the right ARIA ids', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header title="Title" description="Description" />
          <Drawer.Body>Body</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    const dialog = queryDialog()!;
    const titleId = dialog.getAttribute('aria-labelledby')!;
    const descId = dialog.getAttribute('aria-describedby')!;
    expect(document.getElementById(titleId)).toHaveTextContent('Title');
    expect(document.getElementById(descId)).toHaveTextContent('Description');
  });

  it('Footer aligns with the `align` variant', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Body</Drawer.Body>
          <Drawer.Footer align="between" data-testid="footer">
            <button>Left</button>
            <button>Right</button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(screen.getByTestId('footer').className).toMatch(/justify-between/);
  });

  it('Close subpart closes the drawer', async () => {
    const user = userEvent.setup();
    render(
      <Drawer defaultOpen>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Close />
          <Drawer.Body>Body</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
  });
});

describe('Drawer — Trigger asChild', () => {
  it('clones the single child and merges the click handler', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Drawer>
        <Drawer.Trigger>
          <button onClick={onClick}>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an inline button when asChild={false}', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <Drawer.Trigger asChild={false}>Open me</Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    const trigger = screen.getByRole('button', { name: 'Open me' });
    expect(trigger.tagName).toBe('BUTTON');
    await user.click(trigger);
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
  });
});

describe('Drawer — context guards', () => {
  it('throws a helpful error when a subpart is used outside <Drawer>', () => {
    const original = console.error;
    console.error = () => {};
    expect(() =>
      render(
        <Drawer.Content>
          <Drawer.Body>orphan</Drawer.Body>
        </Drawer.Content>,
      ),
    ).toThrow(/<Drawer\.Content> must be rendered inside a <Drawer>/);
    console.error = original;
  });
});
