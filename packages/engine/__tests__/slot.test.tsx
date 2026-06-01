import { render, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Slot } from '../src/slot';

describe('Slot', () => {
  it('renders the child element merging className and style', () => {
    const { getByTestId } = render(
      <Slot className="slot-class" style={{ color: 'red' }}>
        <button data-testid="btn" className="child-class" type="button">
          Hi
        </button>
      </Slot>,
    );
    const el = getByTestId('btn');
    expect(el.tagName).toBe('BUTTON');
    expect(el.className).toContain('slot-class');
    expect(el.className).toContain('child-class');
    expect(el.style.color).toBe('red');
    expect(el.textContent).toBe('Hi');
  });

  it('forwards refs to the child element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Slot ref={ref}>
        <button data-testid="btn" type="button">
          Hi
        </button>
      </Slot>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('chains event handlers (slot fires first, child fires second)', () => {
    const order: string[] = [];
    const slotHandler = vi.fn(() => order.push('slot'));
    const childHandler = vi.fn(() => order.push('child'));

    const { getByTestId } = render(
      <Slot onClick={slotHandler}>
        <button data-testid="btn" type="button" onClick={childHandler}>
          Hi
        </button>
      </Slot>,
    );

    fireEvent.click(getByTestId('btn'));
    expect(slotHandler).toHaveBeenCalledOnce();
    expect(childHandler).toHaveBeenCalledOnce();
    expect(order).toEqual(['slot', 'child']);
  });

  it('child wins for non-event props (defined on child)', () => {
    const { getByTestId } = render(
      <Slot id="slot-id">
        <button data-testid="btn" type="button" id="child-id">
          Hi
        </button>
      </Slot>,
    );
    expect(getByTestId('btn').id).toBe('child-id');
  });

  it('falls back to slot prop when child does not define it', () => {
    const { getByTestId } = render(
      <Slot id="slot-id">
        <button data-testid="btn" type="button">
          Hi
        </button>
      </Slot>,
    );
    expect(getByTestId('btn').id).toBe('slot-id');
  });

  it('renders nothing when no valid child element is provided', () => {
    const { container } = render(<Slot>{null}</Slot>);
    expect(container.innerHTML).toBe('');
  });

  it('allows polymorphic usage via plain anchor child', () => {
    const { getByRole } = render(
      <Slot className="link">
        <a href="/about">About</a>
      </Slot>,
    );
    const link = getByRole('link');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/about');
    expect(link.className).toContain('link');
  });
});