/**
 * `<SplashProvider>` end to end (#13) — the imperative `splash(…)` call, the rendered overlay,
 * and the auto-dismiss timer.
 *
 * The timer is the part worth testing carefully. A splash is a full-screen blocker: if its
 * dismissal misfires the user is left staring at an overlay with no way out, and the failure is
 * time-dependent so it never shows up in a snapshot. The provider re-arms the timer from an
 * effect whose dependencies include the active record, so "does an update restart the clock?" is
 * a real question with a user-visible answer — see the `timeout` block.
 */

import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SplashProvider } from '../src/SplashScreen';
import { splash } from '../src/SplashScreen';
import { SplashStore } from '../src/SplashScreen/SplashStore';
import { renderWithTheme as render } from './utils';

afterEach(() => {
  SplashStore.__reset();
  vi.useRealTimers();
});

describe('SplashProvider — rendering', () => {
  it('renders nothing until a splash is shown', () => {
    render(<SplashProvider />);
    expect(screen.queryByText('Loading workspace…')).toBeNull();
  });

  it('renders the title and subtitle of the active splash', async () => {
    render(<SplashProvider />);
    act(() => {
      splash({ title: 'Loading workspace…', subtitle: 'Fetching your projects' });
    });

    await waitFor(() => expect(screen.getByText('Loading workspace…')).toBeInTheDocument());
    expect(screen.getByText('Fetching your projects')).toBeInTheDocument();
  });

  it('unmounts when hidden', async () => {
    render(<SplashProvider />);
    act(() => {
      splash({ title: 'Booting' });
    });
    await waitFor(() => expect(screen.getByText('Booting')).toBeInTheDocument());

    act(() => {
      splash.hide();
    });
    await waitFor(() => expect(screen.queryByText('Booting')).toBeNull());
  });

  it('swaps content in place when the same id is updated', async () => {
    // The determinate-progress pattern: one overlay, repeatedly patched. It must not flicker
    // through an unmount, and the untouched fields must survive.
    render(<SplashProvider />);
    let id = '';
    act(() => {
      id = splash({ title: 'Uploading', subtitle: '0%' });
    });
    await waitFor(() => expect(screen.getByText('Uploading')).toBeInTheDocument());

    act(() => {
      splash.update(id, { subtitle: '50%' });
    });
    await waitFor(() => expect(screen.getByText('50%')).toBeInTheDocument());
    expect(screen.getByText('Uploading')).toBeInTheDocument();
  });

  it('replaces the visible splash when a different one is shown', async () => {
    render(<SplashProvider />);
    act(() => {
      splash({ title: 'first' });
    });
    await waitFor(() => expect(screen.getByText('first')).toBeInTheDocument());

    act(() => {
      splash({ title: 'second' });
    });
    await waitFor(() => expect(screen.getByText('second')).toBeInTheDocument());
    expect(screen.queryByText('first')).toBeNull();
  });
});

describe('SplashProvider — dismissal', () => {
  it('hides on Escape by default', async () => {
    render(<SplashProvider />);
    act(() => {
      splash({ title: 'Dismissible' });
    });
    await waitFor(() => expect(screen.getByText('Dismissible')).toBeInTheDocument());

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByText('Dismissible')).toBeNull());
  });

  it('stays put on Escape when closeOnEscape is false', async () => {
    // A boot splash that guards a not-yet-ready app must not be dismissible by a stray keypress.
    render(<SplashProvider />);
    act(() => {
      splash({ title: 'Booting', closeOnEscape: false });
    });
    await waitFor(() => expect(screen.getByText('Booting')).toBeInTheDocument());

    fireEvent.keyDown(document, { key: 'Escape' });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('Booting')).toBeInTheDocument();
    expect(splash.isActive()).toBe(true);
  });

  it('fires onHide exactly once when dismissed', async () => {
    const onHide = vi.fn();
    render(<SplashProvider />);
    let id = '';
    act(() => {
      id = splash({ title: 'x', onHide });
    });
    await waitFor(() => expect(screen.getByText('x')).toBeInTheDocument());

    act(() => {
      splash.hide(id);
    });
    expect(onHide).toHaveBeenCalledTimes(1);
    expect(onHide).toHaveBeenCalledWith(id);
  });
});

describe('SplashProvider — auto-dismiss timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('dismisses after `timeout` and fires onTimeout first', () => {
    const onTimeout = vi.fn();
    const onHide = vi.fn();
    render(<SplashProvider />);

    let id = '';
    act(() => {
      id = splash({ title: 'Auto', timeout: 3000, onTimeout, onHide });
    });
    expect(splash.isActive()).toBe(true);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onTimeout).toHaveBeenCalledWith(id);
    expect(onHide).toHaveBeenCalledWith(id);
    expect(splash.isActive()).toBe(false);
  });

  it('does not dismiss before the timeout elapses', () => {
    render(<SplashProvider />);
    act(() => {
      splash({ title: 'Auto', timeout: 3000 });
    });

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(splash.isActive()).toBe(true);
  });

  it('never dismisses without a timeout, or with timeout 0', () => {
    // The default: a splash blocks until the caller explicitly hides it.
    render(<SplashProvider />);
    act(() => {
      splash({ title: 'Indefinite' });
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(splash.isActive()).toBe(true);

    act(() => {
      splash.hide();
      splash({ title: 'Zero', timeout: 0 });
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(splash.isActive()).toBe(true);
  });

  it('survives an onTimeout that throws and still dismisses', () => {
    render(<SplashProvider />);
    act(() => {
      splash({
        title: 'x',
        timeout: 1000,
        onTimeout: () => {
          throw new Error('consumer blew up');
        },
      });
    });

    expect(() =>
      act(() => {
        vi.advanceTimersByTime(1000);
      }),
    ).not.toThrow();
    // The overlay is a full-screen blocker — a throwing callback must never strand the user.
    expect(splash.isActive()).toBe(false);
  });

  it('restarts the clock on update — a progress splash will not time out mid-upload', () => {
    // Documents the behaviour as it actually is. The provider re-arms its effect on the active
    // record's identity, and every `update()` produces a new object, so each progress tick
    // resets the countdown. Reasonable for "still working", but it means a stalled upload that
    // keeps emitting ticks never auto-dismisses — see the note on #13.
    render(<SplashProvider />);
    let id = '';
    act(() => {
      id = splash({ title: 'Uploading', timeout: 1000, progress: 0 });
    });

    for (const percent of [25, 50, 75]) {
      act(() => {
        vi.advanceTimersByTime(900);
      });
      act(() => {
        splash.update(id, { progress: percent });
      });
    }
    // 2700ms of wall clock against a 1000ms timeout — still up.
    expect(splash.isActive()).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(splash.isActive()).toBe(false);
  });

  it('clears its timer on unmount rather than firing into a dead tree', () => {
    const onTimeout = vi.fn();
    const { unmount } = render(<SplashProvider />);
    act(() => {
      splash({ title: 'x', timeout: 1000, onTimeout });
    });

    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onTimeout).not.toHaveBeenCalled();
  });
});

describe('SplashProvider — defaultOptions', () => {
  it('applies app-level defaults', async () => {
    render(<SplashProvider defaultOptions={{ title: 'Please wait…' }} />);
    act(() => {
      splash({});
    });
    await waitFor(() => expect(screen.getByText('Please wait…')).toBeInTheDocument());
  });

  it('lets a call site override a default', async () => {
    render(<SplashProvider defaultOptions={{ title: 'Please wait…' }} />);
    act(() => {
      splash({ title: 'Uploading' });
    });
    await waitFor(() => expect(screen.getByText('Uploading')).toBeInTheDocument());
    expect(screen.queryByText('Please wait…')).toBeNull();
  });

  it('does not let an unset call-site field clobber a default', async () => {
    // The active record carries `title: undefined` for anything the caller omitted; a naive
    // spread would overwrite the default with it and app policy would silently vanish.
    render(<SplashProvider defaultOptions={{ title: 'Please wait…' }} />);
    act(() => {
      splash({ subtitle: 'no title here' });
    });
    await waitFor(() => expect(screen.getByText('Please wait…')).toBeInTheDocument());
    expect(screen.getByText('no title here')).toBeInTheDocument();
  });
});

describe('splash facade — through the provider', () => {
  it('renders whichever variant alias was called', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SplashProvider />);
    act(() => {
      splash.pulse({ title: 'Pulsing' });
    });
    await waitFor(() => expect(screen.getByText('Pulsing')).toBeInTheDocument());
    expect(SplashStore.getState().current!.variant).toBe('pulse');
    void user;
  });
});
