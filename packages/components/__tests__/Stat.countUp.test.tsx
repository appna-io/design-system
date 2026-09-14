import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '@apx-ui/theme';

import { Stat } from '../src/Stat';
import { renderWithTheme as render } from './utils';

/**
 * jsdom has no `IntersectionObserver`, which is exactly the environment the hook's "no observer"
 * branch is written for — so most of these exercise the branch that matters most: what a stat
 * shows when the trigger never arrives.
 *
 * That branch has to fail to the FACT (the real number), never to the animation's start frame.
 * The alternative is a page of stats all reading `0`, which is the same class of bug #1 fixed for
 * reveals (content pinned at `opacity: 0` when the trigger never fires) and is worse here: `0` is
 * a plausible-looking number, so nothing about the page looks broken.
 */

describe('Stat — countUp, no IntersectionObserver', () => {
  it('shows the real value, not zero, when the trigger can never fire', () => {
    render(<Stat label="Revenue" value={12400} countUp />);
    expect(screen.getByText('12,400')).toBeInTheDocument();
    expect(screen.queryByText('0')).toBeNull();
  });

  it('still formats — the fallback goes through the formatter, not around it', () => {
    render(<Stat label="Revenue" value={12400} countUp format="currency" currency="USD" />);
    expect(screen.getByText('$12,400.00')).toBeInTheDocument();
  });
});

describe('Stat — countUp, with an IntersectionObserver', () => {
  let observed: Element[] = [];

  beforeEach(() => {
    observed = [];
    // A stub that observes but never intersects, so the element sits in its pre-trigger state.
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(_cb: unknown) {}
        observe(el: Element) {
          observed.push(el);
        }
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
        root = null;
        rootMargin = '';
        thresholds = [];
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts at zero and observes the VALUE element, not the whole tile', async () => {
    const { container } = render(<Stat label="Revenue" value={12400} countUp />);

    // Pre-trigger, the number has not counted yet.
    await waitFor(() => expect(screen.getByText('0')).toBeInTheDocument());

    const valueEl = container.querySelector('[data-stat-value]')!;
    expect(observed).toContain(valueEl);
  });

  it('marks the counting element so it can be targeted', () => {
    const { container } = render(<Stat label="Revenue" value={12400} countUp />);
    expect(container.querySelector('[data-counting]')).not.toBeNull();
  });

  it('announces the FINAL value while the digits are still at zero', async () => {
    const { container } = render(<Stat label="Revenue" value={12400} countUp />);
    await waitFor(() => expect(screen.getByText('0')).toBeInTheDocument());

    // The accessible name is built from the fact, not from the frame — assistive tech must not
    // narrate the animation.
    const labelled = container.querySelector('[aria-label]')!;
    expect(labelled.getAttribute('aria-label')).toContain('12,400');
    expect(labelled.getAttribute('aria-label')).not.toBe('Revenue, 0');
  });
});

describe('Stat — countUp fires exactly once', () => {
  // Caught in a real browser, invisible to jsdom: `inView` fires its callback on EVERY entry, so
  // scrolling away and back restarted the count. Worse, the on-exit cleanup cancelled a tween
  // mid-flight, freezing the stat on an arbitrary number ($11,084.55 of a $12,400 target) that
  // then never corrected, because the "already started" flag was set.
  let trigger: (() => void) | undefined;
  let disconnected = 0;

  beforeEach(() => {
    disconnected = 0;
    trigger = undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        private cb: (entries: unknown[]) => void;
        private el: Element | null = null;
        constructor(cb: (entries: unknown[]) => void) {
          this.cb = cb;
        }
        observe(el: Element) {
          this.el = el;
          // Expose a way to simulate entering the viewport, repeatedly.
          trigger = () => {
            this.cb([{ target: this.el, isIntersecting: true, intersectionRatio: 1 }]);
          };
        }
        unobserve() {}
        disconnect() {
          disconnected += 1;
        }
        takeRecords() {
          return [];
        }
        root = null;
        rootMargin = '';
        thresholds = [];
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stops observing as soon as it has fired, so re-entry cannot restart it', async () => {
    render(<Stat label="Revenue" value={12400} countUp />);
    await waitFor(() => expect(trigger).toBeTypeOf('function'));

    trigger!();
    await waitFor(() => expect(disconnected).toBeGreaterThan(0));

    // Re-entering must be a no-op — the observer is already gone, and the guard holds even if a
    // stray callback arrives.
    const before = disconnected;
    trigger!();
    expect(disconnected).toBe(before);
  });
});

describe('Stat — countUp renders the fact on the server', () => {
  // The bug this pins: seeding the hook at zero meant the SSR'd HTML said "0". A crawler indexed
  // a zero, a reader with JS disabled saw a zero permanently, and everyone else got a flash of
  // zeros above the fold. A count-up is decoration on top of a fact — the markup must carry the
  // fact, and the client adds the decoration.
  it('server-rendered markup contains the real value, never zero', () => {
    const html = renderToString(
      <ThemeProvider storageKey={null}>
        <Stat label="Talks" value={48} countUp />
      </ThemeProvider>,
    );
    expect(html).toContain('48');
    expect(html).not.toMatch(/>0</);
  });

  it('the VISIBLE value is formatted on the server, not just the aria-label', () => {
    const html = renderToString(
      <ThemeProvider storageKey={null}>
        <Stat label="Revenue" value={12400} countUp format="currency" currency="USD" />
      </ThemeProvider>,
    );

    // Scoped to the value element on purpose. A whole-document `toContain('$12,400.00')` passes
    // even when the visible number is zero, because the accessible name always carried the real
    // value — so that assertion would have missed the bug entirely.
    const valueContent = /<span[^>]*data-stat-value[^>]*>(.*?)<\/span>/s.exec(html)?.[1] ?? '';
    expect(valueContent).toContain('$12,400.00');
    expect(valueContent).not.toContain('$0.00');
  });

  it('the accessible name on the server is the real value', () => {
    const html = renderToString(
      <ThemeProvider storageKey={null}>
        <Stat label="Talks" value={48} countUp />
      </ThemeProvider>,
    );
    expect(html).toContain('aria-label="Talks, 48"');
  });
});

describe('Stat — countUp is ignored where it makes no sense', () => {
  it('a loading tile shows the spinner, not a counter', () => {
    const { container } = render(<Stat label="Revenue" value={12400} countUp loading />);
    expect(container.querySelector('[data-loading="true"]')).not.toBeNull();
    expect(container.querySelector('[data-counting]')).toBeNull();
  });

  it('an errored tile shows the error, not a counter', () => {
    const { container } = render(<Stat label="Revenue" value={12400} countUp error="Failed" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
    expect(container.querySelector('[data-counting]')).toBeNull();
  });

  it('a non-numeric value renders untouched', () => {
    const { container } = render(<Stat label="Status" value="Healthy" countUp />);
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(container.querySelector('[data-counting]')).toBeNull();
  });

  it('off by default', () => {
    const { container } = render(<Stat label="Revenue" value={12400} />);
    expect(screen.getByText('12,400')).toBeInTheDocument();
    expect(container.querySelector('[data-counting]')).toBeNull();
  });
});

describe('Stat — the value slot keeps tabular figures', () => {
  // Without them the number's width changes on nearly every frame of a count-up and the whole
  // tile jitters. Already true of `Stat`, asserted here because `countUp` is what makes it
  // load-bearing rather than merely nice.
  it('renders the value with tabular-nums', () => {
    const { container } = render(<Stat label="Revenue" value={12400} countUp />);
    const valueEl = container.querySelector('[data-stat-value]')!;
    expect(valueEl.className).toContain('tabular-nums');
  });
});
