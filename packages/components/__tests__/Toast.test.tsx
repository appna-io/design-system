import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Toaster, toast } from '../src/Toast';
import { ToastStore } from '../src/Toast/ToastStore';
import { renderWithTheme as render } from './utils';

/**
 * Integration tests for `<Toaster />` + `toast()` end-to-end. Real timers are off by default
 * (vitest) but several tests use `vi.useFakeTimers()` to drive auto-dismiss / pause flows
 * deterministically. Each test resets the store to keep the singleton clean.
 */

function queryRegion(): HTMLElement | null {
  return screen.queryByRole('region', { name: 'Notifications' });
}

function queryToastLis(): HTMLElement[] {
  const region = queryRegion();
  if (!region) return [];
  return Array.from(region.querySelectorAll<HTMLElement>('[data-toast]'));
}

beforeEach(() => {
  ToastStore.__reset();
});

afterEach(() => {
  ToastStore.__reset();
  vi.useRealTimers();
});

describe('Toaster — rendering', () => {
  it('renders the live region even when the queue is empty', () => {
    render(<Toaster />);
    const region = queryRegion();
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('appends a toast `<li>` after toast()', async () => {
    render(<Toaster />);
    act(() => {
      toast('Hello');
    });
    await waitFor(() => {
      expect(within(queryRegion()!).getByText('Hello')).toBeInTheDocument();
    });
  });

  it('respects `max` and only renders the newest N toasts', async () => {
    render(<Toaster max={2} />);
    act(() => {
      toast('A');
      toast('B');
      toast('C');
    });
    await waitFor(() => {
      expect(queryToastLis()).toHaveLength(2);
    });
    // Newest two should be B and C (A is queued behind).
    expect(within(queryRegion()!).queryByText('A')).toBeNull();
    expect(within(queryRegion()!).getByText('B')).toBeInTheDocument();
    expect(within(queryRegion()!).getByText('C')).toBeInTheDocument();
  });

  it('uses `role="alert"` for error intent and `role="status"` for others', async () => {
    render(<Toaster />);
    act(() => {
      toast.success('ok');
      toast.error('broken');
    });
    await waitFor(() => {
      expect(within(queryRegion()!).getByText('ok')).toBeInTheDocument();
      expect(within(queryRegion()!).getByText('broken')).toBeInTheDocument();
    });
    expect(within(queryRegion()!).getByText('ok').closest('li')).toHaveAttribute('role', 'status');
    expect(within(queryRegion()!).getByText('broken').closest('li')).toHaveAttribute('role', 'alert');
  });
});

describe('Toaster — auto-dismiss', () => {
  it('removes a toast after its duration elapses', async () => {
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast('Auto', { duration: 1000 });
    });
    // Render commit happens via the store subscription; flush microtasks before advancing.
    await Promise.resolve();
    expect(ToastStore.getState().toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(ToastStore.getState().toasts).toHaveLength(0);
  });

  it('keeps the toast forever when duration is 0', async () => {
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast('Sticky', { duration: 0 });
    });
    await Promise.resolve();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(ToastStore.getState().toasts).toHaveLength(1);
  });

  it('keeps loading toasts persistent regardless of duration', async () => {
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast.loading('Working', { duration: 500 });
    });
    await Promise.resolve();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(ToastStore.getState().toasts).toHaveLength(1);
    expect(ToastStore.getState().toasts[0]!.intent).toBe('loading');
  });

  it('fires onAutoClose when the timer expires', async () => {
    vi.useFakeTimers();
    const onAutoClose = vi.fn();
    render(<Toaster />);
    act(() => {
      toast('A', { duration: 500, onAutoClose });
    });
    await Promise.resolve();
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(onAutoClose).toHaveBeenCalledTimes(1);
  });
});

describe('Toaster — pause behavior', () => {
  it('pauses timers while pointer hovers the region', async () => {
    vi.useFakeTimers();
    render(<Toaster pauseOnHover />);
    act(() => {
      toast('Read me', { duration: 1000 });
    });
    await Promise.resolve();

    // Hover: timer pauses partway through.
    act(() => {
      vi.advanceTimersByTime(400);
    });
    act(() => {
      fireEvent.pointerEnter(queryRegion()!);
    });
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    // Still present — we paused at 400ms of a 1000ms duration.
    expect(ToastStore.getState().toasts).toHaveLength(1);

    // Resume; the remaining ~600ms should now elapse.
    act(() => {
      fireEvent.pointerLeave(queryRegion()!);
    });
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(ToastStore.getState().toasts).toHaveLength(0);
  });
});

describe('Toaster — dismiss interactions', () => {
  it('close button dismisses the toast and fires onDismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Toaster closeButton />);
    act(() => {
      toast('Bye', { onDismiss });
    });
    await waitFor(() => {
      expect(within(queryRegion()!).getByText('Bye')).toBeInTheDocument();
    });
    const closeBtn = within(queryRegion()!).getByRole('button', { name: 'Dismiss notification' });
    await user.click(closeBtn);
    await waitFor(() => {
      expect(ToastStore.getState().toasts).toHaveLength(0);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('action button calls onClick and dismisses', async () => {
    const user = userEvent.setup();
    const handleUndo = vi.fn();
    render(<Toaster />);
    act(() => {
      toast('Email archived', {
        action: { label: 'Undo', onClick: handleUndo },
      });
    });
    await waitFor(() => {
      expect(within(queryRegion()!).getByText('Email archived')).toBeInTheDocument();
    });
    await user.click(within(queryRegion()!).getByRole('button', { name: 'Undo' }));
    expect(handleUndo).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(ToastStore.getState().toasts).toHaveLength(0);
    });
  });

  it('action button with dismissOnClick=false keeps the toast', async () => {
    const user = userEvent.setup();
    render(<Toaster />);
    act(() => {
      toast('Stay', {
        duration: 0,
        action: { label: 'Click', onClick: () => {}, dismissOnClick: false },
      });
    });
    await waitFor(() => {
      expect(within(queryRegion()!).getByText('Stay')).toBeInTheDocument();
    });
    await user.click(within(queryRegion()!).getByRole('button', { name: 'Click' }));
    expect(ToastStore.getState().toasts).toHaveLength(1);
  });

  it('toast.dismiss(id) removes the toast', async () => {
    render(<Toaster />);
    let id = '';
    act(() => {
      id = toast('Soon to be gone');
    });
    await waitFor(() => {
      expect(within(queryRegion()!).getByText('Soon to be gone')).toBeInTheDocument();
    });
    act(() => {
      toast.dismiss(id);
    });
    await waitFor(() => {
      expect(ToastStore.getState().toasts).toHaveLength(0);
    });
  });

  it('toast.dismiss() clears the queue', async () => {
    render(<Toaster />);
    act(() => {
      toast('A');
      toast('B');
      toast('C');
    });
    await waitFor(() => {
      expect(ToastStore.getState().toasts).toHaveLength(3);
    });
    act(() => {
      toast.dismiss();
    });
    await waitFor(() => {
      expect(ToastStore.getState().toasts).toHaveLength(0);
    });
  });
});

describe('Toaster — positions + variants', () => {
  it.each(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const)(
    'renders position=%s on the region',
    (position) => {
      render(<Toaster position={position} />);
      expect(queryRegion()).toHaveAttribute('data-position', position);
    },
  );

  it('uses soft variant by default when richColors is on', async () => {
    render(<Toaster richColors />);
    act(() => {
      toast.success('rich');
    });
    await waitFor(() => {
      expect(within(queryRegion()!).getByText('rich')).toBeInTheDocument();
    });
    const li = within(queryRegion()!).getByText('rich').closest('li');
    expect(li).toHaveAttribute('data-variant', 'soft');
  });

  it('per-toast variant overrides richColors', async () => {
    render(<Toaster richColors />);
    act(() => {
      toast('explicit', { variant: 'outline' });
    });
    await waitFor(() => {
      expect(within(queryRegion()!).getByText('explicit')).toBeInTheDocument();
    });
    const li = within(queryRegion()!).getByText('explicit').closest('li');
    expect(li).toHaveAttribute('data-variant', 'outline');
  });
});

describe('Toaster — keyboard', () => {
  it('F8 focuses the region', () => {
    render(<Toaster />);
    expect(queryRegion()).not.toBe(document.activeElement);
    act(() => {
      fireEvent.keyDown(window, { key: 'F8' });
    });
    expect(queryRegion()).toBe(document.activeElement);
  });

  it('Escape on focused toast dismisses it', async () => {
    render(<Toaster />);
    let id = '';
    act(() => {
      id = toast('Bye', { duration: 0 });
    });
    await waitFor(() => {
      expect(within(queryRegion()!).getByText('Bye')).toBeInTheDocument();
    });

    const region = queryRegion()!;
    const li = within(region).getByText('Bye').closest('li')!;
    act(() => {
      li.focus();
    });
    act(() => {
      fireEvent.keyDown(region, { key: 'Escape' });
    });
    await waitFor(() => {
      expect(ToastStore.getState().toasts.find((t) => t.id === id)).toBeUndefined();
    });
  });

  it('ArrowDown / ArrowUp cycle focus between toasts', async () => {
    render(<Toaster />);
    act(() => {
      toast('first', { duration: 0 });
      toast('second', { duration: 0 });
    });
    await waitFor(() => {
      expect(ToastStore.getState().toasts).toHaveLength(2);
    });
    const region = queryRegion()!;
    const lis = Array.from(region.querySelectorAll<HTMLLIElement>('[data-toast]'));
    expect(lis).toHaveLength(2);

    act(() => {
      lis[0]!.focus();
    });
    expect(document.activeElement).toBe(lis[0]);
    act(() => {
      fireEvent.keyDown(region, { key: 'ArrowDown' });
    });
    expect(document.activeElement).toBe(lis[1]);
    act(() => {
      fireEvent.keyDown(region, { key: 'ArrowUp' });
    });
    expect(document.activeElement).toBe(lis[0]);
  });
});

describe('Toaster — dedup', () => {
  it('updating a toast by id mutates in place without stacking', async () => {
    render(<Toaster />);
    act(() => {
      toast('Saving…', { id: 'save', duration: 0 });
    });
    await waitFor(() => {
      expect(within(queryRegion()!).getByText('Saving…')).toBeInTheDocument();
    });
    act(() => {
      toast('Saved!', { id: 'save', duration: 0 });
    });
    await waitFor(() => {
      expect(within(queryRegion()!).getByText('Saved!')).toBeInTheDocument();
    });
    expect(within(queryRegion()!).queryByText('Saving…')).toBeNull();
    expect(ToastStore.getState().toasts).toHaveLength(1);
  });
});
