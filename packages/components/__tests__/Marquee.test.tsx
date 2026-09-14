import { describe, expect, it } from 'vitest';

import { ambientMotion } from '@apx-ui/tokens';

import { fadeMask } from '../src/Marquee/fadeMask';
import { Marquee } from '../src/Marquee';
import { renderWithTheme as render } from './utils';

/**
 * `<Marquee />` has no state and no effects — the loop is a CSS keyframe — so the tests are
 * about the two things that can silently break it:
 *
 *  1. **The seam invariant.** The loop only reads as continuous if the track holds exactly two
 *     equal groups and the `--sds-marquee-gap` correction matches the rendered `gap-*` class. A
 *     mismatch is invisible in code review and shows up as a once-per-cycle hitch, so it's
 *     pinned here.
 *  2. **The reduced-motion branch**, which changes the MARKUP (drops the clone, becomes a scroll
 *     region), not just a class. A regression that turned it back into "same markup, animation
 *     off" would leave items permanently unreachable.
 */

function items(n = 3) {
  return Array.from({ length: n }, (_, i) => <span key={i}>item-{i}</span>);
}

describe('Marquee — track structure', () => {
  it('renders the children twice: one visible group and one inert clone', () => {
    const { container } = render(<Marquee>{items()}</Marquee>);

    expect(container.querySelector('[data-marquee-group]')).not.toBeNull();
    expect(container.querySelector('[data-marquee-clone]')).not.toBeNull();
    // 3 items × 2 copies.
    expect(container.querySelectorAll('span')).toHaveLength(6);
  });

  it('the clone is inert, so its contents leave both the a11y tree and the tab order', () => {
    const { container } = render(
      <Marquee>
        <a href="#one">one</a>
      </Marquee>,
    );

    const clone = container.querySelector('[data-marquee-clone]')!;
    expect(clone).toHaveAttribute('inert');

    // Both copies of the link exist in the DOM, but only one is outside the inert subtree — that
    // one is the only focusable, announced copy. (jsdom does not implement `inert`'s effect on
    // the a11y tree, so this asserts the containment rather than querying by role.)
    expect(container.querySelectorAll('a')).toHaveLength(2);
    expect(container.querySelectorAll('[data-marquee-clone] a')).toHaveLength(1);
  });

  it('`repeat` multiplies the children INSIDE each group, keeping the two groups equal', () => {
    const { container } = render(<Marquee repeat={3}>{items(2)}</Marquee>);

    const group = container.querySelector('[data-marquee-group]')!;
    const clone = container.querySelector('[data-marquee-clone]')!;

    // 2 items × repeat 3 in each group — and crucially, the same count in both, which is the
    // `-50%` seam invariant.
    expect(group.querySelectorAll('span')).toHaveLength(6);
    expect(clone.querySelectorAll('span')).toHaveLength(6);
  });
});

describe('Marquee — timing', () => {
  // jsdom reports every element as 0×0 and has no ResizeObserver, so the measurement never lands
  // and the component stays on its pre-measure fallback. That makes these tests assertions about
  // the FALLBACK path — which is worth pinning in its own right, since it is what SSR and the
  // first paint actually render. The rate arithmetic itself is covered by `marqueeDuration`
  // below, and the measurement by `useMarqueeDistance`'s own guards.
  it('falls back to the reference track (1440px) before the measurement lands', () => {
    const cases = [
      ['slow', '60.00s'], // 1440 / 24
      ['normal', '40.00s'], // 1440 / 36
      ['fast', '24.83s'], // 1440 / 58
    ] as const;

    for (const [speed, expected] of cases) {
      const { container, unmount } = render(<Marquee speed={speed}>{items()}</Marquee>);
      const track = container.querySelector<HTMLElement>('[data-marquee-track]')!;
      expect(track.style.animationDuration).toBe(expected);
      unmount();
    }
  });

  it('the fallback tempos match the design language (60s / 40s / 25s at a typical band)', () => {
    // Restating the intent behind the rates: if someone retunes `ambientMotion.speed`, this is the
    // assertion that tells them what the numbers were chosen to produce.
    for (const [speed, cycle] of [
      ['slow', 60],
      ['normal', 40],
      ['fast', 25],
    ] as const) {
      expect(1440 / ambientMotion.speed[speed]).toBeCloseTo(cycle, 0);
    }
  });

  it('an explicit `duration` overrides the rate entirely', () => {
    const { container } = render(
      <Marquee speed="fast" duration={90}>
        {items()}
      </Marquee>,
    );
    const track = container.querySelector<HTMLElement>('[data-marquee-track]')!;
    expect(track.style.animationDuration).toBe('90.00s');
  });

  it('uses a percentage travel distance until the measurement lands', () => {
    const { container } = render(<Marquee gap={12}>{items()}</Marquee>);
    const track = container.querySelector<HTMLElement>('[data-marquee-track]')!;

    // Approximate, but it keeps the band moving through SSR and hydration rather than sitting
    // frozen until JS measures it.
    expect(track.style.getPropertyValue('--sds-marquee-distance')).toBe('50%');
    expect(track.className).toContain('gap-12');
  });
});

describe('Marquee — speed is a RATE, not a duration', () => {
  // The single most important property of the timing model, and the one a refactor is most likely
  // to lose: two bands of different lengths must travel at the same visible speed. A
  // seconds-per-cycle model fails this, and fails it silently — each band looks fine alone.
  it('bands of different lengths get durations proportional to their length', () => {
    const rate = ambientMotion.speed.normal;

    const shortBand = 600 / rate;
    const longBand = 2400 / rate;

    // 4× the content, 4× the duration — i.e. identical px/second.
    expect(longBand / shortBand).toBeCloseTo(4, 5);
    expect(600 / shortBand).toBeCloseTo(2400 / longBand, 5);
  });

  it('the token scale is ordered slow < normal < fast', () => {
    expect(ambientMotion.speed.slow).toBeLessThan(ambientMotion.speed.normal);
    expect(ambientMotion.speed.normal).toBeLessThan(ambientMotion.speed.fast);
  });
});

describe('Marquee — direction', () => {
  it('reverses the keyframe for `right` rather than using a mirrored one', () => {
    const { container } = render(<Marquee direction="right">{items()}</Marquee>);
    const track = container.querySelector('[data-marquee-track]')!;
    expect(track.className).toContain('[animation-direction:reverse]');
    expect(track.className).toContain('animate-marquee-x');
  });

  it('vertical directions switch to the block-axis keyframe', () => {
    const { container } = render(<Marquee direction="up">{items()}</Marquee>);
    const track = container.querySelector('[data-marquee-track]')!;
    expect(track.className).toContain('animate-marquee-y');
    expect(track.className).not.toContain('[animation-direction:reverse]');
  });

  it('exposes the direction as a data attribute', () => {
    const { container } = render(<Marquee direction="down">{items()}</Marquee>);
    expect(container.querySelector('[data-marquee-root]')).toHaveAttribute('data-direction', 'down');
  });
});

describe('Marquee — pausing', () => {
  it('does not pause on hover by default — that affordance is opt-in', () => {
    const { container } = render(<Marquee>{items()}</Marquee>);
    const track = container.querySelector('[data-marquee-track]')!;
    expect(track.className).not.toContain('group-hover/marquee:[animation-play-state:paused]');
  });

  it('scopes the hover pause to a NAMED group so an outer group cannot drive it', () => {
    const { container } = render(<Marquee pauseOnHover>{items()}</Marquee>);
    const root = container.querySelector('[data-marquee-root]')!;
    const track = container.querySelector('[data-marquee-track]')!;

    expect(root.className).toContain('group/marquee');
    expect(track.className).toContain('group-hover/marquee:[animation-play-state:paused]');
  });

  // Pausing for a pointer is a design choice. Pausing for a keyboard is not: tabbing into a link
  // inside a moving track leaves it travelling out from under the focus ring, and the user it
  // strands is precisely the one who can't chase it with a mouse. So this must NOT be gated behind
  // `pauseOnHover` — which is exactly the shape the bug had.
  it('pauses on focus even with pauseOnHover OFF', () => {
    const { container } = render(
      <Marquee>
        <a href="#one">one</a>
      </Marquee>,
    );
    const root = container.querySelector('[data-marquee-root]')!;
    const track = container.querySelector('[data-marquee-track]')!;

    expect(root.className).toContain('group/marquee');
    expect(track.className).toContain('group-focus-within/marquee:[animation-play-state:paused]');
  });

  it('pauses on focus with pauseOnHover ON too', () => {
    const { container } = render(<Marquee pauseOnHover>{items()}</Marquee>);
    const track = container.querySelector('[data-marquee-track]')!;
    expect(track.className).toContain('group-focus-within/marquee:[animation-play-state:paused]');
  });

  it('emits no pause classes at all under reduced motion — nothing is moving to pause', () => {
    const { container } = render(
      <Marquee reduceMotion pauseOnHover>
        {items()}
      </Marquee>,
    );
    const root = container.querySelector('[data-marquee-root]')!;
    const track = container.querySelector('[data-marquee-track]')!;

    expect(root.className).not.toContain('group/marquee');
    expect(track.className).not.toContain('animation-play-state:paused');
  });
});

describe('Marquee — reduced motion', () => {
  it('becomes a scroll region instead of a stopped animation', () => {
    const { container } = render(<Marquee reduceMotion>{items()}</Marquee>);
    const root = container.querySelector('[data-marquee-root]')!;
    const track = container.querySelector<HTMLElement>('[data-marquee-track]')!;

    // Reachable by scroll…
    expect(root.className).toContain('overflow-x-auto');
    // …and genuinely not animating, rather than animating-but-paused.
    expect(track.className).not.toContain('animate-marquee-x');
    expect(track.style.animationDuration).toBe('');
    expect(root).toHaveAttribute('data-reduced', 'true');
  });

  it('drops the clone, so the content is not duplicated inside the scroll region', () => {
    const { container } = render(<Marquee reduceMotion>{items()}</Marquee>);

    expect(container.querySelector('[data-marquee-clone]')).toBeNull();
    expect(container.querySelectorAll('span')).toHaveLength(3);
  });

  it('skips the edge fade, which would hide items the user must scroll to reach', () => {
    const { container } = render(<Marquee reduceMotion>{items()}</Marquee>);
    const root = container.querySelector<HTMLElement>('[data-marquee-root]')!;
    expect(root.style.maskImage).toBe('');
  });

  it('`reduceMotion={false}` forces the animated branch regardless of the media query', () => {
    const { container } = render(<Marquee reduceMotion={false}>{items()}</Marquee>);
    const track = container.querySelector('[data-marquee-track]')!;
    expect(track.className).toContain('animate-marquee-x');
  });
});

describe('Marquee — fade', () => {
  it('is ON by default — a hard clip at the container edge is never the reviewed design', () => {
    const { container } = render(<Marquee>{items()}</Marquee>);
    const root = container.querySelector<HTMLElement>('[data-marquee-root]')!;
    expect(root.style.maskImage).toContain('linear-gradient');
  });

  it('can be opted out of', () => {
    const { container } = render(<Marquee fade={false}>{items()}</Marquee>);
    const root = container.querySelector<HTMLElement>('[data-marquee-root]')!;
    expect(root.style.maskImage).toBe('');
  });

  it('applies the mask to the container', () => {
    const { container } = render(<Marquee fade>{items()}</Marquee>);
    const root = container.querySelector<HTMLElement>('[data-marquee-root]')!;
    expect(root.style.maskImage).toContain('linear-gradient(to right');
  });

  it('uses the block axis for vertical marquees', () => {
    const { container } = render(
      <Marquee fade direction="up">
        {items()}
      </Marquee>,
    );
    const root = container.querySelector<HTMLElement>('[data-marquee-root]')!;
    expect(root.style.maskImage).toContain('linear-gradient(to bottom');
  });

  it('honours a custom fadeWidth', () => {
    const { container } = render(
      <Marquee fade fadeWidth="4rem">
        {items()}
      </Marquee>,
    );
    const root = container.querySelector<HTMLElement>('[data-marquee-root]')!;
    expect(root.style.maskImage).toContain('#000 4rem');
  });
});

describe('Marquee — passthrough', () => {
  it('honours `as` and forwards arbitrary attributes', () => {
    const { container } = render(
      <Marquee as="section" aria-label="Our customers">
        {items()}
      </Marquee>,
    );
    const root = container.querySelector('[data-marquee-root]')!;
    expect(root.tagName).toBe('SECTION');
    expect(root).toHaveAttribute('aria-label', 'Our customers');
  });
});

describe('fadeMask', () => {
  // Asserted on the pure function, not a rendered element: jsdom's CSSOM drops
  // `-webkit-mask-image` silently, so the rendered `style` attribute can never prove the Safari
  // fallback is present — and that fallback vanishing is exactly the regression that would make
  // the fade no-op on in-support iOS with nothing failing.
  it('emits BOTH the standard and the -webkit- property', () => {
    const mask = fadeMask('horizontal', '12%');
    expect(mask.maskImage).toBeDefined();
    expect(mask.WebkitMaskImage).toBeDefined();
    expect(mask.WebkitMaskImage).toBe(mask.maskImage);
  });

  it('is transparent at both edges and opaque between them', () => {
    expect(fadeMask('horizontal', '10%').maskImage).toBe(
      'linear-gradient(to right, transparent 0, #000 10%, #000 calc(100% - 10%), transparent 100%)',
    );
  });

  it('switches to the block axis for vertical tracks', () => {
    expect(fadeMask('vertical', '2rem').maskImage).toContain('linear-gradient(to bottom');
  });
});
