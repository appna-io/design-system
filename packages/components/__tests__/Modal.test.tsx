import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Modal } from '../src/Modal';
import type { ModalSize, ModalVariant } from '../src/Modal';
import { renderWithTheme as render } from './utils';

/**
 * Modal validates `useScrollLock`, the last unconsumed Phase 17 Core primitive. Tests cover the
 * compound API end-to-end: open / close, escape stack, backdrop click sentinel, focus trap +
 * return focus, controlled state, and the size / variant / placement axis.
 *
 * Same testing strategy Tooltip + Popover use: real timers + `await waitFor` for AnimatePresence
 * exits, `userEvent.setup()` for realistic event sequences.
 */

function queryDialog(): HTMLElement | null {
  return screen.queryByRole('dialog');
}

// `useScrollLock` writes to `document.body.style.overflow` and the lockCount module variable.
// Reset between tests so a leaked open Modal in one test doesn't poison the next one's body
// state assertions.
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

describe('Modal — rendering', () => {
  it('renders the trigger and keeps the content absent until clicked', () => {
    render(
      <Modal>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(queryDialog()).toBeNull();
  });

  it('opens on trigger click and wires aria-expanded / data-state / aria-haspopup', async () => {
    const user = userEvent.setup();
    render(
      <Modal>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
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

describe('Modal — close behavior', () => {
  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Modal defaultOpen>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
  });

  it('closes on backdrop click', async () => {
    render(
      <Modal defaultOpen>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    // Backdrop is the dialog's parent — click directly on it.
    const dialog = queryDialog()!;
    const backdrop = dialog.parentElement!;
    fireEvent.pointerDown(backdrop, { target: backdrop });
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
  });

  it('does NOT close when clicking inside content', async () => {
    const user = userEvent.setup();
    render(
      <Modal defaultOpen>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>
            <button data-testid="inside">inside</button>
          </Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.click(screen.getByTestId('inside'));
    expect(queryDialog()).toBeInTheDocument();
  });

  it('does NOT close on Esc when closeOnEscape={false}', async () => {
    const user = userEvent.setup();
    render(
      <Modal defaultOpen closeOnEscape={false}>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await new Promise((r) => setTimeout(r, 100));
    expect(queryDialog()).toBeInTheDocument();
  });

  it('does NOT close on backdrop click when closeOnBackdropClick={false}', async () => {
    render(
      <Modal defaultOpen closeOnBackdropClick={false}>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    const backdrop = queryDialog()!.parentElement!;
    fireEvent.pointerDown(backdrop, { target: backdrop });
    await new Promise((r) => setTimeout(r, 100));
    expect(queryDialog()).toBeInTheDocument();
  });
});

describe('Modal — focus management', () => {
  it('focuses the first focusable inside content on open', async () => {
    const user = userEvent.setup();
    render(
      <Modal>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>
            <button data-testid="first">first</button>
            <button data-testid="second">second</button>
          </Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId('first')).toHaveFocus());
  });

  it('honors `initialFocus` when provided', async () => {
    function Harness(): ReactElement {
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <Modal initialFocus={ref}>
          <Modal.Trigger>
            <button>Open</button>
          </Modal.Trigger>
          <Modal.Content>
            <Modal.Body>
              <button>first</button>
              <button ref={ref} data-testid="target">
                target
              </button>
            </Modal.Body>
          </Modal.Content>
        </Modal>
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
      <Modal>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>
            <button>inside</button>
          </Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

describe('Modal — controlled state', () => {
  it('controlled open prop drives open / close', async () => {
    function Harness(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <Modal open={open} onOpenChange={setOpen}>
            <Modal.Trigger>
              <button>Open</button>
            </Modal.Trigger>
            <Modal.Content>
              <Modal.Body>Controlled</Modal.Body>
            </Modal.Content>
          </Modal>
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
      <Modal defaultOpen onOpenChange={onOpenChange}>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});

describe('Modal — variants & sizes', () => {
  it('applies size + variant classes to the dialog surface', async () => {
    const user = userEvent.setup();
    const sizes: ModalSize[] = ['sm', 'md', 'lg', 'xl'];
    const variants: ModalVariant[] = ['solid', 'outline'];
    for (const size of sizes) {
      for (const variant of variants) {
        const { unmount } = render(
          <Modal>
            <Modal.Trigger>
              <button>Open</button>
            </Modal.Trigger>
            <Modal.Content size={size} variant={variant}>
              <Modal.Body>content</Modal.Body>
            </Modal.Content>
          </Modal>,
        );
        await user.click(screen.getByRole('button', { name: 'Open' }));
        await waitFor(() => expect(queryDialog()).toBeInTheDocument());
        const dialog = queryDialog()!;
        expect(dialog).toHaveAttribute('data-size', size);
        expect(dialog).toHaveAttribute('data-variant', variant);
        unmount();
      }
    }
  });

  it('reflects the requested placement on data-placement', async () => {
    const user = userEvent.setup();
    for (const placement of ['center', 'top'] as const) {
      const { unmount } = render(
        <Modal>
          <Modal.Trigger>
            <button>Open</button>
          </Modal.Trigger>
          <Modal.Content placement={placement}>
            <Modal.Body>content</Modal.Body>
          </Modal.Content>
        </Modal>,
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await waitFor(() => expect(queryDialog()).toBeInTheDocument());
      expect(queryDialog()).toHaveAttribute('data-placement', placement);
      unmount();
    }
  });
});

describe('Modal — body scroll lock (validates useScrollLock)', () => {
  it('locks body scroll while open', async () => {
    const user = userEvent.setup();
    render(
      <Modal>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await waitFor(() => expect(document.body.style.overflow).toBe('hidden'));
  });

  it('restores body scroll when closed', async () => {
    const user = userEvent.setup();
    render(
      <Modal defaultOpen>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
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
      <Modal preventScroll={false}>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(document.body.style.overflow).toBe('');
  });
});

describe('Modal — Header / Body / Footer composition', () => {
  it('Header renders title + description with the right ARIA ids', async () => {
    const user = userEvent.setup();
    render(
      <Modal>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Header title="Title" description="Description" />
          <Modal.Body>Body</Modal.Body>
        </Modal.Content>
      </Modal>,
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
      <Modal>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Body</Modal.Body>
          <Modal.Footer align="between" data-testid="footer">
            <button>Left</button>
            <button>Right</button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(screen.getByTestId('footer').className).toMatch(/justify-between/);
  });

  it('Close subpart closes the modal', async () => {
    const user = userEvent.setup();
    render(
      <Modal defaultOpen>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Close />
          <Modal.Body>Body</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(queryDialog()).toBeNull(), { timeout: 2000 });
  });
});

describe('Modal — Trigger asChild', () => {
  it('clones the single child and merges the click handler', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal>
        <Modal.Trigger>
          <button onClick={onClick}>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an inline button when asChild={false}', async () => {
    const user = userEvent.setup();
    render(
      <Modal>
        <Modal.Trigger asChild={false}>Open me</Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    const trigger = screen.getByRole('button', { name: 'Open me' });
    expect(trigger.tagName).toBe('BUTTON');
    await user.click(trigger);
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
  });
});

describe('Modal — context guards', () => {
  it('throws a helpful error when a subpart is used outside <Modal>', () => {
    const original = console.error;
    console.error = () => {};
    expect(() =>
      render(
        <Modal.Content>
          <Modal.Body>orphan</Modal.Body>
        </Modal.Content>,
      ),
    ).toThrow(/<Modal\.Content> must be rendered inside a <Modal>/);
    console.error = original;
  });
});
