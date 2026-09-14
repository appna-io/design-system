import { act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { AppShell } from '../src/AppShell';
import { renderWithTheme as render } from './utils';

/**
 * jsdom doesn't scroll, so these drive `window.scrollY` directly and fire the event the hook
 * listens to. `requestAnimationFrame` is stubbed to run synchronously — the hook coalesces every
 * scroll event into one frame, so without that the state never lands within the test.
 */

function scrollTo(y: number) {
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true });
    window.dispatchEvent(new Event('scroll'));
  });
}

function header(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-appshell-header]')!;
}

const shell = (props: Record<string, unknown> = {}) => (
  <AppShell header={<div>Brand</div>} {...props}>
    <div style={{ height: 4000 }}>content</div>
  </AppShell>
);

describe('AppShell — headerScroll', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is inert by default — a shell header is chrome, not a marketing surface', () => {
    const { container } = render(shell());
    scrollTo(500);
    expect(header(container)).not.toHaveAttribute('data-scrolled');
    expect(header(container)).not.toHaveAttribute('data-hidden');
  });

  it('condense marks the header once past the threshold', () => {
    const { container } = render(shell({ headerScroll: 'condense' }));
    expect(header(container)).not.toHaveAttribute('data-scrolled');

    scrollTo(400);
    expect(header(container)).toHaveAttribute('data-scrolled');

    scrollTo(0);
    expect(header(container)).not.toHaveAttribute('data-scrolled');
  });

  it('ignores the first few pixels, so overscroll and one wheel notch do not flip it', () => {
    // At a zero threshold the header twitches on the very first movement, and trackpad
    // rubber-banding at the top of the page toggles it while the user isn't really scrolling.
    const { container } = render(shell({ headerScroll: 'condense' }));
    scrollTo(12);
    expect(header(container)).not.toHaveAttribute('data-scrolled');
  });

  it('condense never hides the header', () => {
    const { container } = render(shell({ headerScroll: 'condense' }));
    scrollTo(900);
    expect(header(container)).toHaveAttribute('data-scrolled');
    expect(header(container)).not.toHaveAttribute('data-hidden');
  });
});

describe('AppShell — headerScroll="reveal"', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('hides after a committed scroll down', () => {
    const { container } = render(shell({ headerScroll: 'reveal', headerReduceMotion: false }));
    scrollTo(60);
    scrollTo(400);
    expect(header(container)).toHaveAttribute('data-hidden');
  });

  it('comes back immediately on scroll up — the user is reaching for the nav', () => {
    const { container } = render(shell({ headerScroll: 'reveal', headerReduceMotion: false }));
    scrollTo(60);
    scrollTo(400);
    expect(header(container)).toHaveAttribute('data-hidden');

    // A small upward movement is enough. Requiring as much travel to show as to hide would leave
    // the nav missing exactly when it was asked for.
    scrollTo(380);
    expect(header(container)).not.toHaveAttribute('data-hidden');
  });

  it('does not hide near the top of the page', () => {
    const { container } = render(shell({ headerScroll: 'reveal', headerReduceMotion: false }));
    scrollTo(10);
    expect(header(container)).not.toHaveAttribute('data-hidden');
  });
});

describe('AppShell — headerScroll under reduced motion', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reveal degrades to condense — the header never moves itself off-screen', () => {
    const { container } = render(shell({ headerScroll: 'reveal', headerReduceMotion: true }));
    scrollTo(60);
    scrollTo(600);

    // Chrome that hides itself is the unrequested motion the preference is about…
    expect(header(container)).not.toHaveAttribute('data-hidden');
    // …but the legibility fix is NOT motion, and is kept.
    expect(header(container)).toHaveAttribute('data-scrolled');
  });

  it('condense still runs — a transparent header over content is a legibility bug, not a courtesy', () => {
    const { container } = render(shell({ headerScroll: 'condense', headerReduceMotion: true }));
    scrollTo(600);
    expect(header(container)).toHaveAttribute('data-scrolled');
  });
});

describe('AppShell — headerScroll stays responsive across many events', () => {
  // Regression: the "already scheduled" guard used to be the frame id returned by
  // `requestAnimationFrame`. That depends on the assignment landing before the callback runs —
  // true in a browser, false under any synchronous rAF. In that case the first measurement
  // cleared the id, the assignment put it back, and every later scroll event early-returned:
  // the header froze after exactly one update while the listener was still attached.
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps updating after the first frame, not just once', () => {
    const { container } = render(shell({ headerScroll: 'condense' }));

    scrollTo(400);
    expect(header(container)).toHaveAttribute('data-scrolled');

    // The third, fourth, fifth event must still be heard.
    scrollTo(0);
    expect(header(container)).not.toHaveAttribute('data-scrolled');
    scrollTo(500);
    expect(header(container)).toHaveAttribute('data-scrolled');
    scrollTo(0);
    expect(header(container)).not.toHaveAttribute('data-scrolled');
  });
});

describe('AppShell — headerScroll inside a scroll container', () => {
  // Listening on `window` unconditionally is the obvious implementation and it is wrong for a
  // whole class of layout: an AppShell in a pane — a docs preview, a split view, a desktop app
  // whose content scrolls independently of its chrome — never moves the window, so the header
  // would sit inert while content scrolled past it. Nothing errors; it just never condenses.
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('listens on the scrolling ancestor, not on window', () => {
    // jsdom gives everything zero dimensions, so declare the overflow AND the overflowing size —
    // the hook requires both, since a wrapper that declares `overflow-y: auto` but never overflows
    // emits no scroll events and would be the wrong thing to latch onto.
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { value: 400, configurable: true });

    const { container } = render(
      <div style={{ overflowY: 'auto', height: 400 }} data-pane>
        {shell({ headerScroll: 'condense' })}
      </div>,
    );

    const pane = container.querySelector<HTMLElement>('[data-pane]')!;
    const head = header(container);
    expect(head).not.toHaveAttribute('data-scrolled');

    // Scrolling the WINDOW must do nothing — this header doesn't live there.
    scrollTo(600);
    expect(head).not.toHaveAttribute('data-scrolled');

    // Scrolling the pane must.
    act(() => {
      Object.defineProperty(pane, 'scrollTop', { value: 300, configurable: true, writable: true });
      pane.dispatchEvent(new Event('scroll'));
    });
    expect(head).toHaveAttribute('data-scrolled');
  });
});

describe('AppShell — headerScroll listeners', () => {
  it('attaches no scroll listener when inert', () => {
    const add = vi.spyOn(window, 'addEventListener');
    render(shell());
    expect(add.mock.calls.filter(([t]) => t === 'scroll')).toHaveLength(0);
    add.mockRestore();
  });

  it('removes its listener on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(shell({ headerScroll: 'condense' }));
    unmount();
    expect(remove.mock.calls.filter(([t]) => t === 'scroll').length).toBeGreaterThan(0);
    remove.mockRestore();
  });
});
