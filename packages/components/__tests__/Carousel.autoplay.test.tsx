import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Carousel } from '../src/Carousel';
import { renderWithTheme as render } from './utils';

function tree(extra?: Partial<React.ComponentProps<typeof Carousel>>) {
  return (
    <Carousel ariaLabel="Autoplay test" {...extra}>
      {[1, 2, 3].map((n) => (
        <Carousel.Slide key={n}>
          <div style={{ height: 50 }}>S {n}</div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}

describe('Carousel — autoplay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the AutoplayControl when autoplay=true (showAutoplayControl default "auto")', () => {
    render(tree({ autoplay: true, autoplayInterval: 1000 }));
    expect(screen.getByRole('button', { name: /Pause carousel|Play carousel/ })).toBeInTheDocument();
  });

  it('does NOT render the AutoplayControl when autoplay=false', () => {
    render(tree({ autoplay: false }));
    expect(screen.queryByRole('button', { name: /Pause carousel|Play carousel/ })).toBeNull();
  });

  it('advances after the interval elapses', () => {
    const onChange = vi.fn();
    render(tree({ autoplay: true, autoplayInterval: 1000, onIndexChange: onChange }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onChange).toHaveBeenCalledWith(1, 'autoplay');
  });

  it('user pause via button stops the interval', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(tree({ autoplay: true, autoplayInterval: 1000, onIndexChange: onChange }));
    const btn = screen.getByRole('button', { name: 'Pause carousel' });
    vi.useRealTimers();
    await user.click(btn);
    vi.useFakeTimers();
    onChange.mockClear();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('autoplay control toggles aria-label between Pause and Play', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(tree({ autoplay: true, autoplayInterval: 9999 }));
    const btn = screen.getByRole('button', { name: 'Pause carousel' });
    await user.click(btn);
    expect(screen.getByRole('button', { name: 'Play carousel' })).toBeInTheDocument();
  });

  it('does not render an autoplay control when showAutoplayControl="never"', () => {
    render(tree({ autoplay: true, showAutoplayControl: 'never' }));
    expect(screen.queryByRole('button', { name: /Pause carousel|Play carousel/ })).toBeNull();
  });
});