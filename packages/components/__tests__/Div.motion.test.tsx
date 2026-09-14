/**
 * Scroll-reveal / stagger tests for `<Div>`.
 *
 * Two environment facts shape everything here:
 *
 *  1. **jsdom ships no `IntersectionObserver`.** Motion's `whileInView` needs one, so we install a
 *     minimal stub that records its observed nodes and lets a test fire an intersection manually.
 *     Without it Motion silently never triggers and every reveal assertion would pass vacuously.
 *  2. **Motion writes its animated values asynchronously.** Asserting on committed opacity is a
 *     race, so the DOM-level assertions here check what is *structurally* true at render time
 *     (element identity, children, styles surviving the motion wrapper) and the orchestration
 *     contract is verified through the context a parent publishes — which is the actual mechanism
 *     the cascade depends on.
 */
import { __resetWarnCache } from '@apx-ui/engine';
import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Div, useDivOrchestrated } from '../src/Div';
import { renderWithTheme as render } from './utils';

type MediaListener = (event: { matches: boolean }) => void;

/** Stubs `prefers-reduced-motion` (and every other query) to the given value. */
function stubReducedMotion(matches: boolean) {
  const impl = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: (_evt: string, _cb: MediaListener) => {},
    removeEventListener: (_evt: string, _cb: MediaListener) => {},
    addListener: (_cb: MediaListener) => {},
    removeListener: (_cb: MediaListener) => {},
    dispatchEvent: () => false,
  }));
  vi.stubGlobal('matchMedia', impl);
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: impl,
  });
}

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

/** Probe that reports whether an orchestrating ancestor is present. */
function OrchestrationProbe({ id }: { id: string }) {
  const orchestrated = useDivOrchestrated();
  return <span data-testid={id} data-orchestrated={String(orchestrated)} />;
}

beforeEach(() => {
  stubIntersectionObserver();
  stubReducedMotion(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Div — animateOnView', () => {
  it('renders content and preserves style props through the motion wrapper', () => {
    render(
      <Div data-testid="d" animation="riseIn" animateOnView p={4} className="ds-reveal">
        <span data-testid="child">x</span>
      </Div>,
    );
    const node = screen.getByTestId('d');
    expect(node.tagName).toBe('DIV');
    expect(node.style.padding).toBe('4px');
    expect(node.className).toContain('ds-reveal');
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('accepts a viewport options object without discarding the element', () => {
    render(
      <Div data-testid="d" animation="fadeIn" animateOnView={{ once: false, amount: 0.5 }}>
        x
      </Div>,
    );
    expect(screen.getByTestId('d')).toBeInTheDocument();
  });

  it('honours the polymorphic `as` prop while revealing', () => {
    render(
      <Div data-testid="d" as="section" animation="blurIn" animateOnView>
        x
      </Div>,
    );
    expect(screen.getByTestId('d').tagName).toBe('SECTION');
  });
});

describe('Div — stagger orchestration', () => {
  it('publishes orchestration context to descendants', () => {
    render(
      <Div stagger={0.08}>
        <OrchestrationProbe id="p" />
      </Div>,
    );
    expect(screen.getByTestId('p').dataset['orchestrated']).toBe('true');
  });

  it('reaches descendants through non-animated wrapper markup', () => {
    render(
      <Div stagger={0.08}>
        <div>
          <section>
            <OrchestrationProbe id="deep" />
          </section>
        </div>
      </Div>,
    );
    expect(screen.getByTestId('deep').dataset['orchestrated']).toBe('true');
  });

  it('does not publish orchestration context without `stagger`', () => {
    render(
      <Div animation="fadeIn">
        <OrchestrationProbe id="p" />
      </Div>,
    );
    expect(screen.getByTestId('p').dataset['orchestrated']).toBe('false');
  });

  it('renders every staggered child', () => {
    render(
      <Div stagger={0.05} animateOnView>
        {['a', 'b', 'c'].map((k) => (
          <Div key={k} data-testid={`item-${k}`} animation="riseIn">
            {k}
          </Div>
        ))}
      </Div>,
    );
    expect(screen.getByTestId('item-a')).toBeInTheDocument();
    expect(screen.getByTestId('item-b')).toBeInTheDocument();
    expect(screen.getByTestId('item-c')).toBeInTheDocument();
  });

  it('supports nested stagger groups', () => {
    render(
      <Div stagger={0.1}>
        <Div data-testid="inner" stagger={0.05} animation="fadeIn">
          <OrchestrationProbe id="leaf" />
        </Div>
      </Div>,
    );
    expect(screen.getByTestId('inner')).toBeInTheDocument();
    expect(screen.getByTestId('leaf').dataset['orchestrated']).toBe('true');
  });

  it('orchestrates without an animation preset of its own', () => {
    render(
      <Div data-testid="group" stagger={0.06}>
        <Div data-testid="child" animation="fadeIn">
          x
        </Div>
      </Div>,
    );
    expect(screen.getByTestId('group')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

describe('Div — reduced motion', () => {
  beforeEach(() => {
    stubReducedMotion(true);
  });

  it('renders a plain element with no inline opacity, so content is never stuck hidden', () => {
    render(
      <Div data-testid="d" animation="riseIn" animateOnView>
        visible please
      </Div>,
    );
    const node = screen.getByTestId('d');
    expect(node.textContent).toBe('visible please');
    // The reveal's `initial` is `opacity: 0`; under reduced motion it must never be applied.
    expect(node.style.opacity).toBe('');
    expect(node.style.transform).toBe('');
  });

  it('does not open the orchestration context, so children stay plain too', () => {
    render(
      <Div stagger={0.08} animateOnView>
        <OrchestrationProbe id="p" />
      </Div>,
    );
    expect(screen.getByTestId('p').dataset['orchestrated']).toBe('false');
  });

  it('still renders staggered children fully', () => {
    render(
      <Div stagger={0.05} animateOnView>
        <Div data-testid="c" animation="riseIn">
          hello
        </Div>
      </Div>,
    );
    const child = screen.getByTestId('c');
    expect(child.textContent).toBe('hello');
    expect(child.style.opacity).toBe('');
  });
});

describe('Div — motion dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetWarnCache();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when `stagger` is combined with `asChild`', () => {
    render(
      <Div asChild stagger={0.1}>
        <a href="/x">x</a>
      </Div>,
    );
    expect(warnSpy.mock.calls.flat().join(' ')).toMatch(/DIV_STAGGER_ASCHILD/);
  });

  it('warns when `animateOnView` has nothing to trigger', () => {
    render(<Div animateOnView>x</Div>);
    expect(warnSpy.mock.calls.flat().join(' ')).toMatch(/DIV_ONVIEW_NO_ANIM/);
  });

  it('warns when `staggerDelay` is used without `stagger`', () => {
    render(
      <Div animation="fadeIn" staggerDelay={0.2}>
        x
      </Div>,
    );
    expect(warnSpy.mock.calls.flat().join(' ')).toMatch(/DIV_STAGGERDELAY_NO_STAGGER/);
  });

  it('does not warn for a well-formed stagger group', () => {
    render(
      <Div stagger={0.08} staggerDelay={0.1} animateOnView>
        <Div animation="riseIn">x</Div>
      </Div>,
    );
    const all = warnSpy.mock.calls.flat().join(' ');
    expect(all).not.toMatch(/DIV_STAGGER_ASCHILD|DIV_ONVIEW_NO_ANIM|DIV_STAGGERDELAY_NO_STAGGER/);
  });
});
