/**
 * `<ConfirmProvider>` end to end (#13) — the imperative `confirm.display(…)` call, the rendered
 * dialog, and the promise the caller is awaiting, tested as one thing.
 *
 * That last part is the point. Every other overlay in the DS can be checked by looking at the
 * DOM; Confirm's contract is that a **promise settles with the user's answer**, so a dialog that
 * renders and dismisses perfectly while resolving the wrong value — or never resolving — looks
 * completely healthy on screen and hangs the caller's `await`. Each case here asserts the DOM
 * *and* the awaited value.
 */

import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { ConfirmProvider } from '../src/Confirm';
import { confirm } from '../src/Confirm';
import { ConfirmStore } from '../src/Confirm/ConfirmStore';
import { renderWithTheme as render } from './utils';

afterEach(() => {
  ConfirmStore.__reset();
});

function queryDialog(): HTMLElement | null {
  return screen.queryByRole('alertdialog');
}

describe('ConfirmProvider — rendering', () => {
  it('renders nothing until a confirm is displayed', () => {
    render(<ConfirmProvider />);
    expect(queryDialog()).toBeNull();
  });

  it('renders the dialog with title, description and both buttons', async () => {
    render(<ConfirmProvider />);
    void confirm.display({
      title: 'Delete project?',
      description: 'This action cannot be undone.',
      confirmText: 'Yes, delete',
      cancelText: 'Keep it',
    });

    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(screen.getByText('Delete project?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument();
  });

  it('tags the surface with its variant', async () => {
    render(<ConfirmProvider />);
    void confirm.error({ title: 'Boom' });
    await waitFor(() => expect(queryDialog()).toHaveAttribute('data-variant', 'error'));
  });

  it('unmounts the dialog once it settles', async () => {
    render(<ConfirmProvider />);
    const promise = confirm.display({ title: 'Sure?' });
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());

    confirm.cancel();
    await promise;
    await waitFor(() => expect(queryDialog()).toBeNull());
  });
});

describe('ConfirmProvider — the awaited answer', () => {
  it('resolves true when the confirm button is pressed', async () => {
    const user = userEvent.setup();
    render(<ConfirmProvider />);
    const promise = confirm.display({ title: 'Sure?', confirmText: 'Do it' });

    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Do it' }));

    await expect(promise).resolves.toBe(true);
  });

  it('resolves false when the cancel button is pressed', async () => {
    const user = userEvent.setup();
    render(<ConfirmProvider />);
    const promise = confirm.display({ title: 'Sure?', cancelText: 'Nope' });

    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Nope' }));

    await expect(promise).resolves.toBe(false);
  });

  it('resolves false on Escape', async () => {
    render(<ConfirmProvider />);
    const promise = confirm.display({ title: 'Sure?' });
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());

    fireEvent.keyDown(document, { key: 'Escape' });
    await expect(promise).resolves.toBe(false);
  });

  it('stays open on Escape when closeOnEscape is false', async () => {
    render(<ConfirmProvider />);
    void confirm.display({ title: 'Destructive', closeOnEscape: false });
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());

    fireEvent.keyDown(document, { key: 'Escape' });
    // A dialog whose whole purpose is to prevent an accidental action must not be dismissible
    // by a stray keypress.
    await new Promise((r) => setTimeout(r, 0));
    expect(queryDialog()).toBeInTheDocument();
    expect(confirm.isOpen()).toBe(true);
  });

  it('resolves false on a backdrop click, and ignores clicks inside the dialog', async () => {
    const user = userEvent.setup();
    render(<ConfirmProvider />);
    const promise = confirm.display({ title: 'Sure?', closeOnBackdropClick: true });
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());

    // Inside first — the sentinel must reject a bubbled event, or clicking the title would cancel.
    await user.click(screen.getByText('Sure?'));
    expect(queryDialog()).toBeInTheDocument();

    fireEvent.pointerDown(queryDialog()!.parentElement!);
    await expect(promise).resolves.toBe(false);
  });

  it('ignores the backdrop when closeOnBackdropClick is false', async () => {
    render(<ConfirmProvider />);
    void confirm.display({ title: 'Sure?', closeOnBackdropClick: false });
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());

    fireEvent.pointerDown(queryDialog()!.parentElement!);
    await new Promise((r) => setTimeout(r, 0));
    expect(queryDialog()).toBeInTheDocument();
  });
});

describe('ConfirmProvider — accessibility', () => {
  it('is an alertdialog, modal, and labelled by its own title and description', async () => {
    render(<ConfirmProvider />);
    void confirm.display({ title: 'Delete project?', description: 'Permanent.' });
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());

    const dialog = queryDialog()!;
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const labelId = dialog.getAttribute('aria-labelledby')!;
    const descId = dialog.getAttribute('aria-describedby')!;
    expect(document.getElementById(labelId)?.textContent).toBe('Delete project?');
    expect(document.getElementById(descId)?.textContent).toBe('Permanent.');
  });

  it('omits the aria references it has no content for', async () => {
    // Pointing `aria-labelledby` at an element that was never rendered leaves screen-reader
    // users with a dialog that announces nothing.
    render(<ConfirmProvider />);
    void confirm.display({});
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());

    const dialog = queryDialog()!;
    expect(dialog).not.toHaveAttribute('aria-labelledby');
    expect(dialog).not.toHaveAttribute('aria-describedby');
  });

  it('hides the decorative variant icon from assistive tech', async () => {
    render(<ConfirmProvider />);
    void confirm.warning({ title: 'Careful' });
    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(queryDialog()!.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });
});

describe('ConfirmProvider — defaultOptions', () => {
  it('applies app-level defaults', async () => {
    render(<ConfirmProvider defaultOptions={{ confirmText: 'OK', cancelText: 'Dismiss' }} />);
    void confirm.display({ title: 'Sure?' });

    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('lets a call site override a default', async () => {
    render(<ConfirmProvider defaultOptions={{ confirmText: 'OK' }} />);
    void confirm.display({ title: 'Sure?', confirmText: 'Yes, delete' });

    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'OK' })).toBeNull();
  });

  it('does not let an unset call-site field clobber a default', async () => {
    // The active record carries `confirmText: undefined` for anything the caller omitted; a
    // naive spread would overwrite the default with it and the button would fall back to its
    // built-in label, silently ignoring app policy.
    render(<ConfirmProvider defaultOptions={{ confirmText: 'OK' }} />);
    void confirm.display({ title: 'Sure?', description: 'no confirmText here' });

    await waitFor(() => expect(queryDialog()).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });
});

describe('ConfirmProvider — displacement', () => {
  it('shows the newer dialog and settles the displaced caller with false', async () => {
    const user = userEvent.setup();
    render(<ConfirmProvider />);

    const first = confirm.display({ title: 'first', confirmText: 'A' });
    const second = confirm.display({ title: 'second', confirmText: 'B' });

    await waitFor(() => expect(screen.getByText('second')).toBeInTheDocument());
    expect(screen.queryByText('first')).toBeNull();
    await expect(first).resolves.toBe(false);

    await user.click(screen.getByRole('button', { name: 'B' }));
    await expect(second).resolves.toBe(true);
  });
});
