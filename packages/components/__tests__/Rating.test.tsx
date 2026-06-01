import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Rating } from '../src/Rating';
import { renderWithTheme as render } from './utils';

function getTrack(): HTMLElement {
  return screen.getByRole('slider');
}

/**
 * jsdom's `PointerEvent` shim doesn't propagate `MouseEventInit` superset fields (`clientX`,
 * `pointerType`, `button`). The Slider suite hit the same wall — copy its recipe so coordinate
 * math actually runs.
 */
type PointerInit = {
  clientX?: number;
  clientY?: number;
  button?: number;
  pointerType?: string;
};
function makePointerEvent(type: string, init: PointerInit = {}): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  for (const [key, value] of Object.entries(init)) {
    Object.defineProperty(event, key, { configurable: true, get: () => value });
  }
  return event;
}
function dispatchPointer(target: Element, type: string, init: PointerInit) {
  fireEvent(target, makePointerEvent(type, { pointerType: 'mouse', button: 0, ...init }));
}

describe('Rating — rendering & defaults', () => {
  it('renders `role="slider"` on the track with default ARIA values', () => {
    render(<Rating />);
    const track = getTrack();
    expect(track).toHaveAttribute('aria-valuemin', '0');
    expect(track).toHaveAttribute('aria-valuemax', '5');
    expect(track).toHaveAttribute('aria-valuenow', '0');
    expect(track).toHaveAttribute('aria-valuetext', '0 out of 5 stars');
    expect(track).toHaveAttribute('tabindex', '0');
  });

  it('renders `max` stars by default', () => {
    render(<Rating />);
    const stars = document.querySelectorAll('[data-star]');
    expect(stars).toHaveLength(5);
  });

  it('honours a custom `max`', () => {
    render(<Rating max={10} />);
    expect(document.querySelectorAll('[data-star]')).toHaveLength(10);
    expect(getTrack()).toHaveAttribute('aria-valuemax', '10');
  });

  it('renders the default ARIA label when no visible label is provided', () => {
    render(<Rating />);
    expect(getTrack()).toHaveAttribute('aria-label', 'Rating');
  });

  it('forwards a ref to the wrapper', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Rating ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('emits `data-precision` for each precision value', () => {
    const { unmount } = render(<Rating precision={1} />);
    expect(getTrack()).toHaveAttribute('data-precision', '1');
    unmount();
    render(<Rating precision={0.5} />);
    expect(getTrack()).toHaveAttribute('data-precision', '0.5');
  });
});

describe('Rating — controlled / uncontrolled', () => {
  it('uncontrolled `defaultValue` paints initial fill', () => {
    render(<Rating defaultValue={3} />);
    const track = getTrack();
    expect(track).toHaveAttribute('aria-valuenow', '3');
    expect(track).toHaveAttribute('aria-valuetext', '3 out of 5 stars');
  });

  it('controlled `value` reflects the prop', () => {
    function Wrapper() {
      const [v, setV] = useState(2);
      return (
        <>
          <Rating value={v} onChange={(next) => setV(next)} />
          <button onClick={() => setV(4)}>set-4</button>
        </>
      );
    }
    render(<Wrapper />);
    expect(getTrack()).toHaveAttribute('aria-valuenow', '2');
    fireEvent.click(screen.getByText('set-4'));
    expect(getTrack()).toHaveAttribute('aria-valuenow', '4');
  });

  it('clamps the displayed value to [0, max]', () => {
    render(<Rating value={42} max={5} />);
    expect(getTrack()).toHaveAttribute('aria-valuenow', '5');
  });
});

describe('Rating — fill rendering', () => {
  it('whole-step precision paints stars as 0 or 1', () => {
    render(<Rating value={3} />);
    const stars = Array.from(document.querySelectorAll('[data-star]'));
    expect(stars[0]?.getAttribute('data-fill')).toBe('1');
    expect(stars[1]?.getAttribute('data-fill')).toBe('1');
    expect(stars[2]?.getAttribute('data-fill')).toBe('1');
    expect(stars[3]?.getAttribute('data-fill')).toBe('0');
    expect(stars[4]?.getAttribute('data-fill')).toBe('0');
  });

  it('half-step precision paints the half-filled star at 0.5', () => {
    render(<Rating value={3.5} precision={0.5} />);
    const stars = Array.from(document.querySelectorAll('[data-star]'));
    expect(stars[3]?.getAttribute('data-fill')).toBe('0.5');
    expect(stars[4]?.getAttribute('data-fill')).toBe('0');
  });

  it('exact precision paints fractional fills (read-only)', () => {
    render(<Rating value={3.71} readOnly precision="exact" />);
    const stars = Array.from(document.querySelectorAll('[data-star]'));
    expect(Number(stars[3]?.getAttribute('data-fill'))).toBeCloseTo(0.71, 5);
  });
});

describe('Rating — keyboard', () => {
  it('ArrowRight increases value', async () => {
    const onChange = vi.fn();
    render(<Rating defaultValue={2} onChange={onChange} />);
    const track = getTrack();
    track.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(3, { source: 'keyboard' });
  });

  it('End jumps to max', async () => {
    const onChange = vi.fn();
    render(<Rating defaultValue={1} max={10} onChange={onChange} />);
    getTrack().focus();
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenCalledWith(10, { source: 'keyboard' });
  });

  it('digit shortcut jumps to value', async () => {
    const onChange = vi.fn();
    render(<Rating defaultValue={1} onChange={onChange} />);
    getTrack().focus();
    await userEvent.keyboard('4');
    expect(onChange).toHaveBeenCalledWith(4, { source: 'keyboard' });
  });

  it('disabled blocks keyboard', async () => {
    const onChange = vi.fn();
    render(<Rating defaultValue={2} disabled onChange={onChange} />);
    const track = getTrack();
    expect(track).toHaveAttribute('aria-disabled', 'true');
    expect(track).toHaveAttribute('tabindex', '-1');
    track.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Rating — pointer (mouse)', () => {
  function stubRect(node: HTMLElement, left: number, width: number) {
    vi.spyOn(node, 'getBoundingClientRect').mockReturnValue({
      left,
      width,
      top: 0,
      right: left + width,
      bottom: 0,
      height: 0,
      x: left,
      y: 0,
      toJSON() {
        return {};
      },
    });
  }

  it('pointerup commits the picked value with source=click', () => {
    const onChange = vi.fn();
    render(<Rating defaultValue={0} onChange={onChange} />);
    const track = getTrack();
    stubRect(track, 0, 200);
    dispatchPointer(track, 'pointerup', { clientX: 80 });
    expect(onChange).toHaveBeenCalledWith(2, { source: 'click' });
  });

  it('readOnly does not commit on click', () => {
    const onChange = vi.fn();
    render(<Rating value={3} readOnly onChange={onChange} />);
    const track = getTrack();
    stubRect(track, 0, 200);
    dispatchPointer(track, 'pointerup', { clientX: 80 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('allowClear: clicking the current value commits 0 with source=clear', () => {
    const onChange = vi.fn();
    render(<Rating defaultValue={2} allowClear onChange={onChange} />);
    const track = getTrack();
    stubRect(track, 0, 200);
    // 80px on a 200px / max=5 rect → value 2 (Math.ceil(0.4*5))
    dispatchPointer(track, 'pointerup', { clientX: 80 });
    expect(onChange).toHaveBeenCalledWith(0, { source: 'clear' });
  });

  it('touch / pen pointer types still commit on pointerup (no hover gating)', () => {
    const onChange = vi.fn();
    render(<Rating defaultValue={0} onChange={onChange} />);
    const track = getTrack();
    stubRect(track, 0, 200);
    dispatchPointer(track, 'pointerup', { pointerType: 'touch', clientX: 199 });
    expect(onChange).toHaveBeenCalledWith(5, { source: 'click' });
  });

  it('hover preview does not update aria-valuenow', () => {
    render(<Rating defaultValue={0} />);
    const track = getTrack();
    stubRect(track, 0, 200);
    dispatchPointer(track, 'pointermove', { clientX: 80 });
    expect(track).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('Rating — form integration', () => {
  it('renders a hidden input mirroring the value when `name` is set', () => {
    render(<Rating defaultValue={3} name="quality" />);
    const hidden = document.querySelector<HTMLInputElement>('input[type="hidden"]')!;
    expect(hidden).not.toBeNull();
    expect(hidden.getAttribute('name')).toBe('quality');
    expect(hidden.value).toBe('3');
  });

  it('hidden input value is empty string when value=0 (so `required` triggers)', () => {
    render(<Rating defaultValue={0} name="quality" required />);
    const hidden = document.querySelector<HTMLInputElement>('input[type="hidden"]')!;
    expect(hidden.value).toBe('');
    expect(hidden.hasAttribute('required')).toBe(true);
  });

  it('omits the hidden input when no `name` is provided', () => {
    render(<Rating defaultValue={3} />);
    expect(document.querySelector('input[type="hidden"]')).toBeNull();
  });
});

describe('Rating — label / description / helper / error wiring', () => {
  it('label gets associated via aria-labelledby', () => {
    render(<Rating label="Pick a rating" />);
    const track = getTrack();
    const labelledBy = track.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)?.textContent).toContain('Pick a rating');
    // When a visible label is present, aria-label is omitted.
    expect(track).not.toHaveAttribute('aria-label');
  });

  it('description id is included in aria-describedby', () => {
    render(<Rating label="Rating" description="Tap to rate" />);
    const track = getTrack();
    const describedBy = track.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const ids = describedBy!.split(' ');
    const descNode = ids.map((id) => document.getElementById(id)).find((n) => n?.textContent === 'Tap to rate');
    expect(descNode).toBeTruthy();
  });

  it('error sets aria-invalid + renders alert region', () => {
    render(<Rating label="Rating" error="Required" />);
    const track = getTrack();
    expect(track).toHaveAttribute('aria-invalid', 'true');
    expect(track).toHaveAttribute('data-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('required surfaces through the hidden input + label marker + data-required', () => {
    render(<Rating label="Rating" name="quality" required />);
    // `aria-required` isn't valid on role="slider" — required-ness rides on the hidden input
    // and the visual asterisk. We expose `data-required` for CSS hooks.
    expect(getTrack()).toHaveAttribute('data-required', 'true');
    expect(getTrack()).not.toHaveAttribute('aria-required');
    expect(screen.getByText('*')).toBeInTheDocument();
    const hidden = document.querySelector<HTMLInputElement>('input[type="hidden"]')!;
    expect(hidden.hasAttribute('required')).toBe(true);
  });

  it('hideLabel keeps the label as sr-only', () => {
    render(<Rating label="Pick a rating" hideLabel />);
    const label = document.querySelector('label');
    expect(label?.className).toMatch(/sr-only/);
  });

  it('helperText renders when no error is set', () => {
    render(<Rating label="Rating" helperText="optional" />);
    expect(screen.getByText('optional')).toBeInTheDocument();
  });

  it('helperText is hidden when error is set', () => {
    render(<Rating label="Rating" helperText="optional" error="Required" />);
    expect(screen.queryByText('optional')).not.toBeInTheDocument();
  });
});

describe('Rating — formatValueText override', () => {
  it('uses the consumer formatter for aria-valuetext', () => {
    render(
      <Rating
        value={3}
        readOnly
        formatValueText={(v, max) => `${v} étoiles sur ${max}`}
      />,
    );
    expect(getTrack()).toHaveAttribute('aria-valuetext', '3 étoiles sur 5');
  });
});

describe('Rating — showValue', () => {
  it('renders the numeric value inline', () => {
    render(<Rating value={3.5} readOnly precision={0.5} showValue />);
    expect(screen.getByText('3.5 of 5')).toBeInTheDocument();
  });
});