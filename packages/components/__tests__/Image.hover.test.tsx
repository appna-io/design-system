import userEvent from '@testing-library/user-event';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Image } from '../src/Image';
import { renderWithTheme as render } from './utils';

/**
 * The hover treatments change the DOM — an opted-in Image is no longer a bare `<img>` — so these
 * cover both that the default path is untouched and that the frame carries the properties it took
 * over from the image.
 *
 * The two behaviours worth pinning hardest are the ones that fail *silently*:
 *
 *  - the touch guard, because on a phone a latched `:hover` leaves a card permanently zoomed and
 *    there is no gesture to release it; and
 *  - `hoverSrc` being fetched lazily, because eager-loading it is invisible in every test and in
 *    every review, and only shows up as a doubled image payload in production.
 */

describe('Image — hoverEffect="none" (default)', () => {
  it('renders a bare <img>, exactly as before', () => {
    const { container } = render(<Image src="/a.jpg" alt="A" radius="lg" shadow="md" />);

    expect(container.querySelector('[data-image-frame]')).toBeNull();
    const img = screen.getByAltText('A');
    expect(img.tagName).toBe('IMG');
    // The box properties stay on the image itself when there's no frame to hold them.
    expect(img.className).toContain('rounded-lg');
    expect(img.className).toContain('shadow-md');
  });
});

describe('Image — the frame', () => {
  it('wraps the image and takes over the box properties', () => {
    const { container } = render(
      <Image src="/a.jpg" alt="A" hoverEffect="zoom" radius="lg" shadow="md" aspectRatio="4/3" />,
    );

    const frame = container.querySelector<HTMLElement>('[data-image-frame]')!;
    const img = screen.getByAltText('A');

    expect(frame.contains(img)).toBe(true);
    expect(frame.className).toContain('rounded-lg');
    expect(frame.className).toContain('shadow-md');
    expect(frame.style.aspectRatio).toBe('4/3');

    // …and the image becomes a plain fill, so a zoom can't fight the reserved box.
    expect(img.className).toContain('h-full');
    expect(img.className).toContain('w-full');
    expect(img.style.aspectRatio).toBe('');
  });

  it('clips, so a scaled image cannot escape the rounded corners or reflow the page', () => {
    const { container } = render(<Image src="/a.jpg" alt="A" hoverEffect="zoom" />);
    const frame = container.querySelector<HTMLElement>('[data-image-frame]')!;

    expect(frame.className).toContain('overflow-hidden');
    expect(frame.className).toContain('relative');
  });

  it('scopes hover to a NAMED group so an outer group cannot drive it', () => {
    const { container } = render(<Image src="/a.jpg" alt="A" hoverEffect="zoom" />);
    const frame = container.querySelector<HTMLElement>('[data-image-frame]')!;
    expect(frame.className).toContain('group/image');
  });
});

describe('Image — zoom', () => {
  it('scales the IMAGE, not the frame, so neighbours never move', () => {
    const { container } = render(<Image src="/a.jpg" alt="A" hoverEffect="zoom" />);
    const frame = container.querySelector<HTMLElement>('[data-image-frame]')!;
    const img = screen.getByAltText('A');

    expect(img.className).toContain('group-hover/image:scale-[1.04]');
    expect(frame.className).not.toContain('scale-');
  });

  it('uses 1.04 — 1.1 reads as a stock-photo carousel, under 1.02 is invisible', () => {
    render(<Image src="/a.jpg" alt="A" hoverEffect="zoom" />);
    const img = screen.getByAltText('A');
    expect(img.className).toContain('scale-[1.04]');
    expect(img.className).not.toContain('scale-110');
  });

  it('runs at the fast duration — a micro-interaction, not a reveal', () => {
    render(<Image src="/a.jpg" alt="A" hoverEffect="zoom" />);
    const img = screen.getByAltText('A');
    expect(img.className).toContain('duration-fast');
    expect(img.className).toContain('ease-standard');
  });
});

describe('Image — lift', () => {
  it('moves the FRAME, so the whole tile rises together', () => {
    const { container } = render(<Image src="/a.jpg" alt="A" hoverEffect="lift" />);
    const frame = container.querySelector<HTMLElement>('[data-image-frame]')!;
    const img = screen.getByAltText('A');

    expect(frame.className).toContain('hover:-translate-y-1'); // 4px
    expect(frame.className).toContain('hover:shadow-ambient');
    expect(img.className).not.toContain('scale-[1.04]');
  });
});

describe('Image — touch guard', () => {
  // The guard is no longer per-component: `future.hoverOnlyWhenSupported` in the app's Tailwind
  // config wraps every `hover:` utility in `@media (hover: hover)`, which is what stops a tapped
  // card staying lifted for the rest of the session. So what this asserts is the *absence* of a
  // hand-rolled prefix — a re-introduced one would be a second, drifting mechanism, and it would
  // silently be stricter than the global one (it also required `pointer: fine`, which withholds
  // hover from a stylus).
  it('carries no hand-rolled pointer media query', () => {
    const { container } = render(
      <Image src="/a.jpg" alt="A" hoverEffect="zoom" hoverSrc="/b.jpg" />,
    );
    const frame = container.querySelector<HTMLElement>('[data-image-frame]')!;
    const img = screen.getByAltText('A');

    for (const el of [frame, img]) {
      expect(el.className).not.toContain('@media(hover:hover)');
      expect(el.className).not.toContain('pointer:fine');
    }
  });

  it('still emits the hover rules themselves', () => {
    const { container } = render(<Image src="/a.jpg" alt="A" hoverEffect="lift" />);
    const frame = container.querySelector<HTMLElement>('[data-image-frame]')!;
    expect(frame.className).toContain('hover:shadow-ambient');
    expect(frame.className).toContain('motion-safe:hover:-translate-y-1');
  });
});

describe('Image — reduced motion', () => {
  // Gated with `motion-safe:` (only emit the rule when motion is welcome), NOT with a
  // `motion-reduce:` rule that undoes it. An undo rule has the same specificity as the rule it's
  // beating, so the winner is decided by Tailwind's variant ordering — and it loses. That was a
  // real bug caught in the browser: a reduced-motion user got the full zoom while both classes sat
  // on the element looking exactly right. So these assert the ABSENCE of any ungated motion rule,
  // which is the property that actually failed.
  it('emits no ungated transform on the zoom', () => {
    render(<Image src="/a.jpg" alt="A" hoverEffect="zoom" />);
    const img = screen.getByAltText('A');

    const motionRules = img.className
      .split(/\s+/)
      .filter((c) => c.includes('scale-') || c.includes('transition-'));

    expect(motionRules.length).toBeGreaterThan(0);
    for (const rule of motionRules) {
      expect(rule.startsWith('motion-safe:')).toBe(true);
    }
  });

  it('emits no ungated transform on the lift', () => {
    const { container } = render(<Image src="/a.jpg" alt="A" hoverEffect="lift" />);
    const frame = container.querySelector<HTMLElement>('[data-image-frame]')!;

    const motionRules = frame.className
      .split(/\s+/)
      .filter((c) => c.includes('translate-y') || c.includes('transition-'));

    expect(motionRules.length).toBeGreaterThan(0);
    for (const rule of motionRules) {
      expect(rule.startsWith('motion-safe:')).toBe(true);
    }
  });

  it('keeps the elevation change — the hover still communicates, it just arrives instantly', () => {
    const { container } = render(<Image src="/a.jpg" alt="A" hoverEffect="lift" />);
    const frame = container.querySelector<HTMLElement>('[data-image-frame]')!;

    const shadowRule = frame.className.split(/\s+/).find((c) => c.includes('hover:shadow-ambient'))!;
    expect(shadowRule).toBeDefined();
    expect(shadowRule.startsWith('motion-safe:')).toBe(false);
  });

  it('keeps the hoverSrc swap — it carries information, so it cuts rather than fades', async () => {
    const user = userEvent.setup();
    const { container } = render(<Image src="/a.jpg" alt="A" hoverSrc="/b.jpg" />);
    await user.hover(container.querySelector<HTMLElement>('[data-image-frame]')!);

    const second = container.querySelector<HTMLImageElement>('[data-image-hover-src]')!;
    const opacityRule = second.className
      .split(/\s+/)
      .find((c) => c.includes('group-hover/image:opacity-100'))!;
    expect(opacityRule.startsWith('motion-safe:')).toBe(false);
    // …but the fade itself is gated.
    expect(second.className).toContain('motion-safe:transition-opacity');
  });
});

describe('Image — hoverSrc', () => {
  it('is NOT fetched on mount — a 24-item grid must not double its payload', () => {
    const { container } = render(<Image src="/a.jpg" alt="A" hoverSrc="/b.jpg" />);

    expect(container.querySelector('[data-image-hover-src]')).toBeNull();
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('mounts on the first pointer to arrive, and stays mounted after it leaves', async () => {
    const user = userEvent.setup();
    const { container } = render(<Image src="/a.jpg" alt="A" hoverSrc="/b.jpg" />);
    const frame = container.querySelector<HTMLElement>('[data-image-frame]')!;

    await user.hover(frame);

    const second = container.querySelector<HTMLImageElement>('[data-image-hover-src]')!;
    expect(second).not.toBeNull();
    expect(second.getAttribute('src')).toBe('/b.jpg');

    // Staying mounted is what makes every subsequent hover a fade rather than a fetch.
    await user.unhover(frame);
    expect(container.querySelector('[data-image-hover-src]')).not.toBeNull();
  });

  it('cross-fades rather than swapping src — a swap would flash the empty frame', async () => {
    const user = userEvent.setup();
    const { container } = render(<Image src="/a.jpg" alt="A" hoverSrc="/b.jpg" />);
    await user.hover(container.querySelector<HTMLElement>('[data-image-frame]')!);

    const primary = screen.getByAltText('A');
    const second = container.querySelector<HTMLImageElement>('[data-image-hover-src]')!;

    // Both sources are in the DOM at once, stacked.
    expect(primary.getAttribute('src')).toBe('/a.jpg');
    expect(second.className).toContain('absolute');
    expect(second.className).toContain('opacity-0');
    expect(second.className).toContain('group-hover/image:opacity-100');
  });

  it('keeps the second image out of the a11y tree — one subject, one announcement', async () => {
    const user = userEvent.setup();
    const { container } = render(<Image src="/a.jpg" alt="A red shirt" hoverSrc="/b.jpg" />);
    await user.hover(container.querySelector<HTMLElement>('[data-image-frame]')!);

    const second = container.querySelector<HTMLImageElement>('[data-image-hover-src]')!;
    expect(second).toHaveAttribute('aria-hidden', 'true');
    expect(second.getAttribute('alt')).toBe('');
    expect(screen.getAllByAltText('A red shirt')).toHaveLength(1);
  });

  it('creates a frame on its own, without a hoverEffect', () => {
    const { container } = render(<Image src="/a.jpg" alt="A" hoverSrc="/b.jpg" />);
    const frame = container.querySelector<HTMLElement>('[data-image-frame]')!;
    expect(frame).not.toBeNull();
    expect(frame).toHaveAttribute('data-hover-effect', 'none');
  });
});

describe('Image — fallback still wins', () => {
  it('a failed source shows the fallback even inside a frame', () => {
    const { container } = render(
      <Image src="/broken.jpg" alt="A" hoverEffect="zoom" fallback={<span>nope</span>} />,
    );
    fireEvent.error(screen.getByAltText('A'));

    expect(container.querySelector('[data-image-fallback]')).not.toBeNull();
  });
});
