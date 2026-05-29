import { screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Carousel, type CarouselRef } from '../src/Carousel';
import { renderWithTheme as render } from './utils';

function basic(extra?: Partial<React.ComponentProps<typeof Carousel>>) {
  return (
    <Carousel ariaLabel="Test carousel" {...extra}>
      {[1, 2, 3, 4].map((n) => (
        <Carousel.Slide key={n}>
          <div style={{ height: 100 }}>Slide {n}</div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}

describe('Carousel — rendering', () => {
  it('renders a <section role="region"> with the supplied aria-label', () => {
    render(basic());
    const region = screen.getByRole('region', { name: 'Test carousel' });
    expect(region.tagName).toBe('SECTION');
    expect(region.getAttribute('aria-roledescription')).toBe('carousel');
  });

  it('falls back to a generic "Carousel" label when ariaLabel + ariaLabelledby are omitted', () => {
    render(
      <Carousel>
        <Carousel.Slide>
          <div>Only slide</div>
        </Carousel.Slide>
      </Carousel>,
    );
    expect(screen.getByRole('region', { name: 'Carousel' })).toBeInTheDocument();
  });

  it('auto-wraps bare <Slide> children with Viewport + Track + Controls + Indicators', () => {
    const { container } = render(basic());
    expect(container.querySelector('[data-carousel-viewport]')).not.toBeNull();
    expect(container.querySelector('[data-carousel-track]')).not.toBeNull();
    expect(container.querySelectorAll('[data-carousel-slide]')).toHaveLength(4);
    expect(container.querySelector('[data-carousel-prev]')).not.toBeNull();
    expect(container.querySelector('[data-carousel-next]')).not.toBeNull();
    expect(container.querySelector('[data-carousel-indicators]')).not.toBeNull();
  });

  it('respects compound API (explicit Viewport/Track) and does NOT auto-wrap', () => {
    const { container } = render(
      <Carousel ariaLabel="Compound">
        <Carousel.Viewport>
          <Carousel.Track>
            <Carousel.Slide>
              <div>A</div>
            </Carousel.Slide>
            <Carousel.Slide>
              <div>B</div>
            </Carousel.Slide>
          </Carousel.Track>
        </Carousel.Viewport>
      </Carousel>,
    );
    expect(container.querySelectorAll('[data-carousel-viewport]')).toHaveLength(1);
    expect(container.querySelector('[data-carousel-prev]')).toBeNull();
    expect(container.querySelector('[data-carousel-indicators]')).toBeNull();
  });

  it('labels each slide "Slide N of M" by default', () => {
    const { container } = render(basic());
    const slides = container.querySelectorAll('[data-carousel-slide]');
    expect(slides[0]?.getAttribute('aria-label')).toBe('Slide 1 of 4');
    expect(slides[3]?.getAttribute('aria-label')).toBe('Slide 4 of 4');
  });

  it('honors per-slide ariaLabel override', () => {
    const { container } = render(
      <Carousel ariaLabel="X">
        <Carousel.Slide ariaLabel="Hero">
          <div>1</div>
        </Carousel.Slide>
      </Carousel>,
    );
    expect(container.querySelector('[data-carousel-slide]')?.getAttribute('aria-label')).toBe('Hero');
  });

  it('marks the active slide with aria-current="true"', () => {
    const { container } = render(basic({ defaultIndex: 2 }));
    const slides = container.querySelectorAll('[data-carousel-slide]');
    expect(slides[2]?.getAttribute('aria-current')).toBe('true');
    expect(slides[0]?.getAttribute('aria-current')).toBeNull();
  });
});

describe('Carousel — Indicators', () => {
  it('renders n indicators for n slides', () => {
    render(basic());
    const indicators = screen.getAllByRole('tab');
    expect(indicators).toHaveLength(4);
  });

  it('marks the active indicator aria-selected="true"', () => {
    render(basic({ defaultIndex: 1 }));
    const tabs = screen.getAllByRole('tab');
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('false');
  });

  it('renders within a role="tablist"', () => {
    render(basic());
    const tablist = screen.getByRole('tablist', { name: 'Carousel slides' });
    expect(within(tablist).getAllByRole('tab')).toHaveLength(4);
  });

  it('hides indicators when showIndicators="never"', () => {
    const { container } = render(basic({ showIndicators: 'never' }));
    expect(container.querySelector('[data-carousel-indicators]')).toBeNull();
  });
});

describe('Carousel — Controls', () => {
  it('disables Prev at the start and Next at the end (loop=false)', () => {
    render(basic({ defaultIndex: 0 }));
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next slide' })).not.toBeDisabled();
  });

  it('does NOT disable when loop=true', () => {
    render(basic({ defaultIndex: 0, loop: true }));
    expect(screen.getByRole('button', { name: 'Previous slide' })).not.toBeDisabled();
  });

  it('hides controls when showControls="never"', () => {
    const { container } = render(basic({ showControls: 'never' }));
    expect(container.querySelector('[data-carousel-prev]')).toBeNull();
  });

  it('still renders the autoplay control with showAutoplayControl="always"', () => {
    render(basic({ showAutoplayControl: 'always' }));
    expect(screen.getByRole('button', { name: 'Play carousel' })).toBeInTheDocument();
  });
});

describe('Carousel — imperative ref', () => {
  it('exposes scrollTo / next / prev / getIndex / getSlideCount', () => {
    const ref = createRef<CarouselRef>();
    render(
      <Carousel ariaLabel="ref test" ref={ref}>
        {[1, 2, 3].map((n) => (
          <Carousel.Slide key={n}>
            <div>{n}</div>
          </Carousel.Slide>
        ))}
      </Carousel>,
    );
    expect(ref.current?.getSlideCount()).toBe(3);
    expect(ref.current?.getIndex()).toBe(0);
    expect(typeof ref.current?.scrollTo).toBe('function');
    expect(typeof ref.current?.next).toBe('function');
    expect(typeof ref.current?.prev).toBe('function');
    expect(typeof ref.current?.isAutoplaying).toBe('function');
    expect(typeof ref.current?.pauseAutoplay).toBe('function');
    expect(typeof ref.current?.playAutoplay).toBe('function');
  });
});

describe('Carousel — orientation', () => {
  it('paints data-orientation on the root and viewport', () => {
    const { container } = render(basic({ orientation: 'vertical' }));
    const root = container.querySelector('[data-carousel-root]');
    const viewport = container.querySelector('[data-carousel-viewport]');
    expect(root?.getAttribute('data-orientation')).toBe('vertical');
    expect(viewport?.getAttribute('data-orientation')).toBe('vertical');
  });
});

describe('Carousel — polymorphism', () => {
  it('renders <Carousel.Slide asChild> as the supplied element', () => {
    const { container } = render(
      <Carousel ariaLabel="poly">
        <Carousel.Slide asChild>
          <a href="#x">Link</a>
        </Carousel.Slide>
      </Carousel>,
    );
    const slide = container.querySelector('[data-carousel-slide]');
    expect(slide?.tagName).toBe('A');
    expect(slide?.getAttribute('href')).toBe('#x');
    expect(slide?.getAttribute('aria-label')).toBe('Slide 1 of 1');
  });
});
