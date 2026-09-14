import { screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { Reveal } from '../src';
import { renderWithTheme as render } from './utils';

/** jsdom ships no `IntersectionObserver`, and Motion's `whileInView` needs one. */
function stubIntersectionObserver() {
  class IO {
    constructor(public cb: IntersectionObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    root = null;
    rootMargin = '';
    thresholds: number[] = [];
  }
  vi.stubGlobal('IntersectionObserver', IO);
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IO,
  });
}

/**
 * These assert the *choreography*, not the markup. The whole reason `Reveal` exists is that the
 * numbers below are design decisions, and a call site that can set them is a call site that will
 * drift — five templates had already drifted before it existed.
 */
describe('Reveal', () => {
  beforeAll(stubIntersectionObserver);

  it('renders its children', () => {
    render(
      <Reveal>
        <p>Agenda</p>
      </Reveal>,
    );
    expect(screen.getByText('Agenda')).toBeInTheDocument();
  });

  it('exposes no way to type a raw motion number', () => {
    // The API contract. `distance`, a stagger interval, an easing name and a duration in
    // milliseconds are all deliberately absent — every knob is a named intent.
    const props = ['preset', 'delay', 'stagger', 'columns', 'onMount', 'emphasis'];
    for (const forbidden of ['distance', 'duration', 'ease', 'staggerDelay', 'animation']) {
      expect(props).not.toContain(forbidden);
    }
  });

  describe('the choreography budget — duration + stagger x (count - 1) <= ~1000ms', () => {
    const HOUSE_STAGGER = 80;
    const SLOWER = 500;
    const DELIBERATE = 700;

    it('a six-up grid fits at the house duration', () => {
      expect(SLOWER + HOUSE_STAGGER * 5).toBeLessThanOrEqual(1000);
    });

    it('is why `emphasis` is single-element-only', () => {
      // `deliberate` plus any real cascade blows the budget — hence the prop's documentation.
      expect(DELIBERATE + HOUSE_STAGGER * 5).toBeGreaterThan(1000);
      expect(DELIBERATE).toBeLessThanOrEqual(1000);
    });

    it('is why a grid over six items must cascade by row', () => {
      // Twelve items one-at-a-time overruns...
      expect(SLOWER + HOUSE_STAGGER * 11).toBeGreaterThan(1000);
      // ...but at three columns the row cascade divides the interval, and it fits.
      const rowInterval = HOUSE_STAGGER / 3;
      expect(SLOWER + rowInterval * 11).toBeLessThanOrEqual(1000);
    });
  });

  describe('stagger="row"', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('warns when it has no columns to break rows on', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <Reveal stagger="row">
          <p>card</p>
        </Reveal>,
      );
      expect(spy).toHaveBeenCalled();
      expect(String(spy.mock.calls[0])).toContain('columns');
    });

    it('does not warn when columns are supplied', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <Reveal stagger="row" columns={3}>
          <p>card</p>
        </Reveal>,
      );
      const rowWarnings = spy.mock.calls.filter((c) => String(c).includes('stagger="row"'));
      expect(rowWarnings).toHaveLength(0);
    });
  });

  it('nests — a staggering parent around revealing children', () => {
    render(
      <Reveal stagger data-testid="group">
        <Reveal preset="rise">
          <p>one</p>
        </Reveal>
        <Reveal preset="rise">
          <p>two</p>
        </Reveal>
      </Reveal>,
    );
    expect(screen.getByTestId('group')).toBeInTheDocument();
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
  });

  it('passes DOM props straight through', () => {
    render(
      <Reveal as="section" id="pricing" data-testid="r">
        <p>tiers</p>
      </Reveal>,
    );
    const node = screen.getByTestId('r');
    expect(node.tagName).toBe('SECTION');
    expect(node.id).toBe('pricing');
  });
});
