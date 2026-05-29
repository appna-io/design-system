import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Carousel } from '../src/Carousel';
import { renderWithTheme as render } from './utils';

function basic(extra?: Partial<React.ComponentProps<typeof Carousel>>) {
  return (
    <Carousel ariaLabel="Interaction carousel" {...extra}>
      {[1, 2, 3, 4].map((n) => (
        <Carousel.Slide key={n}>
          <div style={{ height: 80 }}>Slide {n}</div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}

describe('Carousel — Next/Prev clicks', () => {
  it('clicking Next advances the index and fires onIndexChange with source="control"', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(basic({ onIndexChange: onChange }));
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(onChange).toHaveBeenCalledWith(1, 'control');
  });

  it('clicking Prev when not at the start decrements', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(basic({ defaultIndex: 2, onIndexChange: onChange }));
    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(onChange).toHaveBeenCalledWith(1, 'control');
  });

  it('clicking an Indicator jumps to that slide with source="indicator"', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(basic({ onIndexChange: onChange }));
    const tabs = screen.getAllByRole('tab');
    await user.click(tabs[3]!);
    expect(onChange).toHaveBeenCalledWith(3, 'indicator');
  });
});

describe('Carousel — keyboard', () => {
  it('ArrowRight on the viewport fires source="keyboard" and advances', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(basic({ onIndexChange: onChange }));
    const viewport = container.querySelector('[data-carousel-viewport]') as HTMLElement;
    viewport.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(1, 'keyboard');
  });

  it('ArrowLeft decrements', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(basic({ defaultIndex: 2, onIndexChange: onChange }));
    (container.querySelector('[data-carousel-viewport]') as HTMLElement).focus();
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenCalledWith(1, 'keyboard');
  });

  it('Home jumps to first, End jumps to last', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(basic({ defaultIndex: 2, onIndexChange: onChange }));
    const viewport = container.querySelector('[data-carousel-viewport]') as HTMLElement;
    viewport.focus();
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(0, 'keyboard');
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(3, 'keyboard');
  });

  it('PageUp / PageDown step the index', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(basic({ onIndexChange: onChange }));
    (container.querySelector('[data-carousel-viewport]') as HTMLElement).focus();
    await user.keyboard('{PageDown}');
    expect(onChange).toHaveBeenLastCalledWith(1, 'keyboard');
    await user.keyboard('{PageUp}');
    expect(onChange).toHaveBeenLastCalledWith(0, 'keyboard');
  });

  it('ArrowUp / ArrowDown control a vertical carousel', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(basic({ orientation: 'vertical', onIndexChange: onChange }));
    (container.querySelector('[data-carousel-viewport]') as HTMLElement).focus();
    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith(1, 'keyboard');
  });

  it('Space on the viewport toggles autoplay (when autoplay is enabled)', async () => {
    const user = userEvent.setup();
    const { container } = render(basic({ autoplay: true, autoplayInterval: 99999 }));
    const viewport = container.querySelector('[data-carousel-viewport]') as HTMLElement;
    viewport.focus();

    const playPause = screen.getByRole('button', { name: /Pause carousel|Play carousel/ });
    const initialLabel = playPause.getAttribute('aria-label');
    await user.keyboard(' ');
    const nextLabel = screen.getByRole('button', { name: /Pause carousel|Play carousel/ }).getAttribute('aria-label');
    expect(nextLabel).not.toBe(initialLabel);
  });
});

describe('Carousel — loop wrap-around', () => {
  it('Next from the last slide wraps to 0 when loop=true', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(basic({ loop: true, defaultIndex: 3, onIndexChange: onChange }));
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(onChange).toHaveBeenLastCalledWith(0, 'control');
  });

  it('Prev from the first slide wraps to last when loop=true', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(basic({ loop: true, defaultIndex: 0, onIndexChange: onChange }));
    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(onChange).toHaveBeenLastCalledWith(3, 'control');
  });
});

describe('Carousel — controlled', () => {
  it('does not move when index prop is controlled and unchanged', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <Carousel ariaLabel="ctl" index={2} onIndexChange={onChange}>
        {[1, 2, 3, 4].map((n) => (
          <Carousel.Slide key={n}>
            <div>Slide {n}</div>
          </Carousel.Slide>
        ))}
      </Carousel>,
    );
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(onChange).toHaveBeenCalledWith(3, 'control');
    const slides = container.querySelectorAll('[data-carousel-slide]');
    expect(slides[2]?.getAttribute('aria-current')).toBe('true');
  });
});
