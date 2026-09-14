import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { Parallax } from '../src/Parallax';
import { renderWithTheme as render } from './utils';

/**
 * The two properties that matter here are both *bounds*, not behaviours:
 *
 *  1. drift can never exceed a tenth of the travel, however a template asks; and
 *  2. reduced motion parks the layer at its NEUTRAL position, not at an end of its range.
 *
 * (2) is the subtle one. A hook that froze at `0` would leave every backdrop at maximum
 * displacement forever — which reads as a layout bug, not as motion being switched off.
 */

describe('Parallax — the speed ceiling', () => {
  beforeEach(() => {
    // jsdom reports 0×0 and never scrolls, so progress sits at its initial midpoint (0.5) and the
    // offset resolves to 0. To observe the clamp we need a non-midpoint progress, so drive the
    // geometry directly.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 0, bottom: 400, left: 0, right: 400, width: 400, height: 400, x: 0, y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    vi.stubGlobal('innerHeight', 800);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('clamps an over-large speed instead of trusting the caller', () => {
    // progress = (800 - 0) / (800 + 400) = 0.667 → (0.667 - 0.5) = 0.167 of the range.
    const { container: capped } = render(
      <Parallax speed={0.1} reduceMotion={false}>
        <span>x</span>
      </Parallax>,
    );
    const { container: absurd } = render(
      <Parallax speed={5} reduceMotion={false}>
        <span>x</span>
      </Parallax>,
    );

    const at = (c: HTMLElement) =>
      c.querySelector<HTMLElement>('[data-parallax]')!.style.transform;

    // An absurd request produces exactly the same transform as the maximum — the ceiling holds.
    expect(at(absurd)).toBe(at(capped));
    expect(at(capped)).not.toBe('');
  });

  it('clamps in the negative direction too', () => {
    const at = (speed: number) => {
      const { container } = render(
        <Parallax speed={speed} reduceMotion={false}>
          <span>x</span>
        </Parallax>,
      );
      return container.querySelector<HTMLElement>('[data-parallax]')!.style.transform;
    };
    expect(at(-9)).toBe(at(-0.1));
  });

  it('warns in development when a speed above the ceiling is passed', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Parallax speed={0.5} reduceMotion={false}>
        <span>x</span>
      </Parallax>,
    );
    expect(spy).toHaveBeenCalled();
    expect(String(spy.mock.calls[0])).toContain('clamped');
  });

  it('does not warn at or below the ceiling', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Parallax speed={0.1} reduceMotion={false}>
        <span>x</span>
      </Parallax>,
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('a non-finite speed is treated as no drift rather than NaN-ing the transform', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(
      <Parallax speed={Number.NaN} reduceMotion={false}>
        <span>x</span>
      </Parallax>,
    );
    const el = container.querySelector<HTMLElement>('[data-parallax]')!;
    expect(el.style.transform).toBe('');
    expect(el.style.transform).not.toContain('NaN');

    // …and it says the value was invalid, not that it was "clamped to ±0.1", which would send the
    // author hunting for a range problem they don't have.
    const messages = spy.mock.calls.map(String).join(' ');
    expect(messages).toContain('must be a finite number');
    expect(messages).not.toContain('clamped');
  });
});

describe('Parallax — reduced motion', () => {
  it('renders at the NEUTRAL position, not at an end of the range', () => {
    const { container } = render(
      <Parallax speed={0.1} reduceMotion>
        <span>x</span>
      </Parallax>,
    );
    const el = container.querySelector<HTMLElement>('[data-parallax]')!;

    // No transform at all — the layer sits exactly where it was authored.
    expect(el.style.transform).toBe('');
    expect(el.style.willChange).toBe('');
  });

  it('attaches no scroll listener', () => {
    const add = vi.spyOn(window, 'addEventListener');
    render(
      <Parallax reduceMotion>
        <span>x</span>
      </Parallax>,
    );
    const scrollCalls = add.mock.calls.filter(([type]) => type === 'scroll');
    expect(scrollCalls).toHaveLength(0);
    add.mockRestore();
  });
});

describe('Parallax — passthrough', () => {
  it('renders children and forwards attributes', () => {
    const { container } = render(
      <Parallax as="span" aria-hidden="true" data-testid="layer">
        <span>backdrop</span>
      </Parallax>,
    );
    const el = container.querySelector<HTMLElement>('[data-parallax]')!;
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveTextContent('backdrop');
  });

  it('cleans up its listeners on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(
      <Parallax reduceMotion={false}>
        <span>x</span>
      </Parallax>,
    );
    unmount();
    const types = remove.mock.calls.map(([type]) => type);
    expect(types).toContain('scroll');
    expect(types).toContain('resize');
    remove.mockRestore();
  });
});
