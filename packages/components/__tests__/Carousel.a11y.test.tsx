import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Carousel } from '../src/Carousel';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

function basic(extra?: Partial<React.ComponentProps<typeof Carousel>>) {
  return (
    <Carousel ariaLabel="A11y carousel" {...extra}>
      {[1, 2, 3].map((n) => (
        <Carousel.Slide key={n} ariaLabel={`Slide ${n}`}>
          <div style={{ height: 60 }}>Slide {n}</div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}

describe('Carousel — axe matrix', () => {
  it('default horizontal passes axe', async () => {
    const { container } = render(basic());
    expect(await axe(container)).toHaveNoViolations();
  });

  it('vertical passes axe', async () => {
    const { container } = render(basic({ orientation: 'vertical' }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('autoplay (with visible pause/play control) passes axe', async () => {
    const { container } = render(basic({ autoplay: true, autoplayInterval: 99999 }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('loop passes axe', async () => {
    const { container } = render(basic({ loop: true }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('numbers-indicators passes axe', async () => {
    const { container } = render(
      <Carousel ariaLabel="numbers" showIndicators="never">
        <Carousel.Viewport>
          <Carousel.Track>
            {[1, 2, 3].map((n) => (
              <Carousel.Slide key={n}>
                <div>{n}</div>
              </Carousel.Slide>
            ))}
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.Indicators variant="numbers" />
      </Carousel>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shadows + responsive slidesPerView passes axe', async () => {
    const { container } = render(
      basic({ showShadows: true, slidesPerView: { base: 1, md: 2 }, gap: 3 }),
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('size variants pass axe', async () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { container } = render(basic({ size }));
      expect(await axe(container)).toHaveNoViolations();
    }
  });

  it('card variant passes axe', async () => {
    const { container } = render(basic({ variant: 'card' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});