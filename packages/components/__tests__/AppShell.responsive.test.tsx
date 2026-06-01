/**
 * Responsive / breakpoint tests for AppShell. These tests stub `window.matchMedia` so
 * `useMediaQuery` (and therefore the local `useBreakpointBelow`) reports the desired width
 * before render. We can't resize the JSDOM window after mount and have React pick it up via
 * the change listener path — but a "starts mobile / starts desktop" check is the high-value
 * scenario consumers actually care about anyway (the breakpoint flipping mid-session is
 * vanishingly rare in real product use).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from '../src/AppShell';
import { renderWithTheme as render } from './utils';

type MediaListener = (event: { matches: boolean }) => void;

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: (_evt: string, _cb: MediaListener) => {},
      removeEventListener: (_evt: string, _cb: MediaListener) => {},
      addListener: (_cb: MediaListener) => {},
      removeListener: (_cb: MediaListener) => {},
      dispatchEvent: () => false,
    })),
  );
  // Some environments check `window.matchMedia` rather than the global; stub both for safety.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: (_evt: string, _cb: MediaListener) => {},
      removeEventListener: (_evt: string, _cb: MediaListener) => {},
      addListener: (_cb: MediaListener) => {},
      removeListener: (_cb: MediaListener) => {},
      dispatchEvent: () => false,
    })),
  });
}

describe('AppShell — responsive sidebar', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders the sidebar inline on desktop (matchMedia max-width does not match)', () => {
    stubMatchMedia(false);
    const { container } = render(
      <AppShell sidebar={<nav aria-label="Side">side</nav>}>
        <div>content</div>
      </AppShell>,
    );
    // On desktop the sidebar is inside the grid as an <aside> with the configured label.
    const sidebar = container.querySelector('[data-appshell-sidebar]');
    expect(sidebar).not.toBeNull();
  });

  it('removes the inline sidebar on mobile and mounts it in a Drawer instead', () => {
    stubMatchMedia(true); // viewport IS below the breakpoint
    const { container } = render(
      <AppShell sidebar={<nav aria-label="Side">side</nav>}>
        <div>content</div>
      </AppShell>,
    );
    // On mobile the inline sidebar is removed from the grid. The Drawer node may or may not
    // be in the DOM depending on its own portal strategy when closed — we only assert the
    // inline sidebar is gone.
    const sidebar = container.querySelector('[data-appshell-sidebar]');
    expect(sidebar).toBeNull();
  });
});