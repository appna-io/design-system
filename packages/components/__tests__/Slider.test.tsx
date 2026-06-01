import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Slider } from '../src/Slider/Slider';
import { renderWithTheme as render } from './utils';

/**
 * jsdom's `PointerEvent` constructor accepts a `PointerEventInit` dict but doesn't propagate the
 * `MouseEventInit` superset properties (`clientX`, `clientY`, `button`, `pointerType`). The
 * recipe here builds a bubbling `Event`, pins the fields via `defineProperty`, and dispatches
 * via RTL's `fireEvent` so React state commits are wrapped in `act`.
 */
type PointerInit = {
  clientX?: number;
  clientY?: number;
  button?: number;
  pointerType?: string;
};
type PointerTarget = Element | Document | Window;
function makePointerEvent(type: string, init: PointerInit = {}): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  for (const [key, value] of Object.entries(init)) {
    Object.defineProperty(event, key, { configurable: true, get: () => value });
  }
  return event;
}
function pointerDown(target: PointerTarget, init: PointerInit): void {
  fireEvent(target, makePointerEvent('pointerdown', { button: 0, pointerType: 'mouse', ...init }));
}
function pointerMove(target: PointerTarget, init: PointerInit): void {
  fireEvent(target, makePointerEvent('pointermove', { pointerType: 'mouse', ...init }));
}
function pointerUp(target: PointerTarget, init: PointerInit = {}): void {
  fireEvent(target, makePointerEvent('pointerup', { button: 0, pointerType: 'mouse', ...init }));
}

/**
 * Focus an element inside `act` so the Slider's `onFocus` → `setFocusedIndex` commit happens
 * inside React's batched test scheduler instead of warning about un-acted state updates.
 */
function focusEl(el: HTMLElement | undefined | null): void {
  if (!el) return;
  act(() => {
    el.focus();
  });
}

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const VARIANTS = ['solid', 'outline', 'soft', 'minimal'] as const;

function getThumbs(): HTMLElement[] {
  return screen.getAllByRole('slider');
}

function getTrack(container: HTMLElement): HTMLElement {
  // First descendant span with onPointerDown handler — easier to grab by ARIA-hidden + structural
  // position: the track is the first child of the root div.
  const root = container.querySelector('[data-orientation]') as HTMLElement;
  return root.firstElementChild as HTMLElement;
}

function getFill(container: HTMLElement): HTMLElement {
  const track = getTrack(container);
  return track.firstElementChild as HTMLElement;
}

function trackRectStub(width = 200): DOMRect {
  return {
    left: 0,
    top: 0,
    right: width,
    bottom: 6,
    width,
    height: 6,
    x: 0,
    y: 0,
    toJSON: () => '',
  } as DOMRect;
}

describe('Slider — rendering', () => {
  it('renders a single thumb by default', () => {
    render(<Slider aria-label="Volume" defaultValue={50} />);
    expect(getThumbs()).toHaveLength(1);
  });

  it('renders two thumbs for range mode with array defaultValue', () => {
    render(<Slider mode="range" aria-label="Range" defaultValue={[20, 80]} />);
    expect(getThumbs()).toHaveLength(2);
  });

  it('renders N thumbs for an N-element array', () => {
    render(
      <Slider mode="range" aria-label="EQ" defaultValue={[10, 30, 60, 90]} />,
    );
    expect(getThumbs()).toHaveLength(4);
  });

  it('wraps the slider in role=group only in range mode', () => {
    const { rerender } = render(<Slider aria-label="x" defaultValue={50} />);
    expect(screen.queryByRole('group')).toBeNull();
    rerender(<Slider mode="range" aria-label="x" defaultValue={[20, 80]} />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('positions each thumb via inset-inline-start in horizontal mode', () => {
    render(<Slider aria-label="x" defaultValue={25} />);
    const thumb = getThumbs()[0]!;
    expect(thumb.style.insetInlineStart).toBe('25%');
  });

  it('positions thumbs via bottom in vertical mode', () => {
    render(<Slider aria-label="x" orientation="vertical" defaultValue={75} />);
    const thumb = getThumbs()[0]!;
    expect(thumb.style.bottom).toBe('75%');
  });

  it('paints the fill between 0% and the thumb in single mode', () => {
    const { container } = render(<Slider aria-label="x" defaultValue={30} />);
    const fill = getFill(container);
    expect(fill.style.insetInlineStart).toBe('0%');
    expect(fill.style.width).toBe('30%');
  });

  it('paints the fill between the lo and hi thumbs in range mode', () => {
    const { container } = render(
      <Slider mode="range" aria-label="x" defaultValue={[20, 70]} />,
    );
    const fill = getFill(container);
    expect(fill.style.insetInlineStart).toBe('20%');
    expect(fill.style.width).toBe('50%');
  });

  it('vertical fill uses bottom + height', () => {
    const { container } = render(
      <Slider aria-label="x" orientation="vertical" defaultValue={40} />,
    );
    const fill = getFill(container);
    expect(fill.style.bottom).toBe('0%');
    expect(fill.style.height).toBe('40%');
  });

  it('applies size classes to the track thickness', () => {
    for (const [size, cls] of [
      ['sm', 'h-1'],
      ['md', 'h-1.5'],
      ['lg', 'h-2'],
    ] as const) {
      const { container, unmount } = render(
        <Slider aria-label="x" size={size} defaultValue={50} />,
      );
      expect(getTrack(container).className).toContain(cls);
      unmount();
    }
  });

  it('paints `bg-<color>` on the fill for every color', () => {
    for (const color of COLORS) {
      const { container, unmount } = render(
        <Slider aria-label="x" color={color} defaultValue={60} />,
      );
      expect(getFill(container).className).toContain(`bg-${color}`);
      unmount();
    }
  });

  it('soft variant fill uses the -subtle tone', () => {
    for (const color of COLORS) {
      const { container, unmount } = render(
        <Slider aria-label="x" variant="soft" color={color} defaultValue={60} />,
      );
      expect(getFill(container).className).toContain(`bg-${color}-subtle`);
      unmount();
    }
  });

  it('minimal variant adds opacity-70 to the fill', () => {
    const { container } = render(
      <Slider aria-label="x" variant="minimal" defaultValue={60} />,
    );
    expect(getFill(container).className).toContain('opacity-70');
  });

  it('thumb gets the colored focus-visible ring for every color', () => {
    for (const color of COLORS) {
      const { unmount } = render(
        <Slider aria-label="x" color={color} defaultValue={50} />,
      );
      expect(getThumbs()[0]!.className).toContain(`focus-visible:ring-${color}`);
      unmount();
    }
  });

  it('outline / soft / minimal variants paint the thumb body with the active color', () => {
    // Implementation note: the recipe collapses 21 (variant × color) compound cells by setting
    // `text-<color>` on the thumb and switching to `bg-current` via `data-[variant=…]`. Visually
    // identical to a per-cell `bg-<color>` but ~1.5 KB gz smaller. Each non-solid thumb must
    // carry the `text-<color>` token AND `data-variant` so the bg inherits.
    for (const variant of ['outline', 'soft', 'minimal'] as const) {
      for (const color of COLORS) {
        const { unmount } = render(
          <Slider aria-label="x" variant={variant} color={color} defaultValue={50} />,
        );
        const thumb = getThumbs()[0]!;
        expect(thumb.className).toContain(`text-${color}`);
        expect(thumb.className).toContain('bg-current');
        expect(thumb).toHaveAttribute('data-variant', variant);
        unmount();
      }
    }
  });

  it('every variant × color combo renders thumbs without crashing', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        const { unmount } = render(
          <Slider aria-label="x" variant={variant} color={color} defaultValue={50} />,
        );
        expect(getThumbs()).toHaveLength(1);
        unmount();
      }
    }
  });

  it('renders marks at the supplied positions with optional labels', () => {
    const { container } = render(
      <Slider
        aria-label="x"
        defaultValue={50}
        marks={[
          { value: 0, label: '0' },
          { value: 50 },
          { value: 100, label: '100' },
        ]}
      />,
    );
    const labels = within(container).getAllByText(/^(0|100)$/);
    expect(labels.length).toBe(2);
  });

  it('uses motion-reduce variants on the thumb transitions', () => {
    render(<Slider aria-label="x" defaultValue={50} />);
    expect(getThumbs()[0]!.className).toContain('motion-reduce:transition-none');
  });

  it('uses CSS-var-mapped utilities so the Tailwind preset can flow theme variants through', () => {
    const { container } = render(
      <Slider aria-label="x" defaultValue={50} />,
    );
    const track = getTrack(container);
    expect(track.className).toMatch(/rounded-(none|xs|sm|md|lg|xl|2xl|3xl|full)/);
    expect(getThumbs()[0]!.className).toMatch(/rounded-(none|xs|sm|md|lg|xl|2xl|3xl|full)/);
  });
});

describe('Slider — keyboard', () => {
  it('ArrowRight increments by step', async () => {
    const onChange = vi.fn();
    render(<Slider aria-label="x" defaultValue={50} step={1} onChange={onChange} />);
    const thumb = getThumbs()[0]!;
    focusEl(thumb);
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(51);
  });

  it('ArrowLeft decrements by step', async () => {
    const onChange = vi.fn();
    render(<Slider aria-label="x" defaultValue={50} step={1} onChange={onChange} />);
    const thumb = getThumbs()[0]!;
    focusEl(thumb);
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith(49);
  });

  it('ArrowUp / ArrowDown nudge regardless of orientation', async () => {
    const onChange = vi.fn();
    render(<Slider aria-label="x" defaultValue={50} step={2} onChange={onChange} />);
    const thumb = getThumbs()[0]!;
    focusEl(thumb);
    await userEvent.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(52);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith(48);
  });

  it('Shift + ArrowRight jumps 10 steps', async () => {
    const onChange = vi.fn();
    render(<Slider aria-label="x" defaultValue={50} step={1} onChange={onChange} />);
    const thumb = getThumbs()[0]!;
    focusEl(thumb);
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(onChange).toHaveBeenLastCalledWith(60);
  });

  it('PageUp / PageDown jump 10 steps', async () => {
    const onChange = vi.fn();
    render(<Slider aria-label="x" defaultValue={50} step={1} onChange={onChange} />);
    const thumb = getThumbs()[0]!;
    focusEl(thumb);
    await userEvent.keyboard('{PageUp}');
    expect(onChange).toHaveBeenLastCalledWith(60);
    await userEvent.keyboard('{PageDown}{PageDown}');
    expect(onChange).toHaveBeenLastCalledWith(40);
  });

  it('Home jumps to min, End jumps to max', async () => {
    const onChange = vi.fn();
    render(<Slider aria-label="x" defaultValue={50} min={0} max={100} onChange={onChange} />);
    const thumb = getThumbs()[0]!;
    focusEl(thumb);
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(100);
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('range: Home clamps the upper thumb against the lower thumb', async () => {
    const onChange = vi.fn();
    render(
      <Slider
        mode="range"
        aria-label="x"
        defaultValue={[20, 80]}
        onChange={onChange}
      />,
    );
    const [, upper] = getThumbs();
    focusEl(upper);
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith([20, 21]);
  });

  it('range: End clamps the lower thumb against the upper thumb', async () => {
    const onChange = vi.fn();
    render(
      <Slider
        mode="range"
        aria-label="x"
        defaultValue={[20, 80]}
        onChange={onChange}
      />,
    );
    const [lower] = getThumbs();
    focusEl(lower);
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith([79, 80]);
  });

  it('keyboard nudges fire onChangeEnd on each commit', async () => {
    const onChangeEnd = vi.fn();
    render(<Slider aria-label="x" defaultValue={50} onChangeEnd={onChangeEnd} />);
    const thumb = getThumbs()[0]!;
    focusEl(thumb);
    await userEvent.keyboard('{ArrowRight}');
    expect(onChangeEnd).toHaveBeenCalledTimes(1);
    expect(onChangeEnd).toHaveBeenLastCalledWith(51);
  });

  it('disabled blocks keyboard interaction', async () => {
    const onChange = vi.fn();
    render(<Slider aria-label="x" disabled defaultValue={50} onChange={onChange} />);
    const thumb = getThumbs()[0]!;
    focusEl(thumb);
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Slider — pointer', () => {
  function patchTrackRect(container: HTMLElement, rect: DOMRect) {
    const track = getTrack(container);
    track.getBoundingClientRect = () => rect;
    return track;
  }

  it('pointerdown on the track jumps the nearest thumb', () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const { container } = render(
      <Slider
        aria-label="x"
        defaultValue={10}
        step={1}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />,
    );
    const track = patchTrackRect(container, trackRectStub(200));

    pointerDown(track, { clientX: 150, clientY: 0 });
    expect(onChange).toHaveBeenLastCalledWith(75);

    pointerUp(window, { clientX: 150, clientY: 0 });
    expect(onChangeEnd).toHaveBeenLastCalledWith(75);
  });

  it('dragging across the track commits intermediate values then onChangeEnd once', () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const { container } = render(
      <Slider
        aria-label="x"
        defaultValue={0}
        step={10}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />,
    );
    const track = patchTrackRect(container, trackRectStub(100));

    pointerDown(track, { clientX: 20, clientY: 0 });
    pointerMove(window, { clientX: 60, clientY: 0 });
    pointerMove(window, { clientX: 80, clientY: 0 });
    pointerUp(window, { clientX: 80, clientY: 0 });

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.map((c) => c[0])).toContain(60);
    expect(onChange.mock.calls.map((c) => c[0])).toContain(80);
    expect(onChangeEnd).toHaveBeenCalledTimes(1);
    expect(onChangeEnd).toHaveBeenLastCalledWith(80);
  });

  it('range: pointerdown picks the nearest of the two thumbs', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider
        mode="range"
        aria-label="x"
        defaultValue={[20, 80]}
        step={1}
        onChange={onChange}
      />,
    );
    const track = patchTrackRect(container, trackRectStub(100));

    // x=30 → near the lower thumb (20)
    pointerDown(track, { clientX: 30, clientY: 0 });
    expect(onChange).toHaveBeenLastCalledWith([30, 80]);
  });

  it('disabled blocks pointer interaction', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider aria-label="x" disabled defaultValue={50} onChange={onChange} />,
    );
    const track = patchTrackRect(container, trackRectStub(200));
    pointerDown(track, { clientX: 100, clientY: 0 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('right-click on the track does NOT start a drag', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider aria-label="x" defaultValue={50} onChange={onChange} />,
    );
    const track = patchTrackRect(container, trackRectStub(200));
    pointerDown(track, { clientX: 100, clientY: 0, button: 2 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sets data-dragging on the active thumb during a drag', () => {
    const { container } = render(<Slider aria-label="x" defaultValue={50} />);
    const track = patchTrackRect(container, trackRectStub(200));
    pointerDown(track, { clientX: 100, clientY: 0 });
    expect(getThumbs()[0]!).toHaveAttribute('data-dragging', 'true');
    pointerUp(window, { clientX: 100, clientY: 0 });
    expect(getThumbs()[0]!).not.toHaveAttribute('data-dragging');
  });
});

describe('Slider — controlled / uncontrolled', () => {
  it('uncontrolled defaults to defaultValue', () => {
    render(<Slider aria-label="x" defaultValue={37} />);
    expect(getThumbs()[0]!).toHaveAttribute('aria-valuenow', '37');
  });

  it('controlled value drives the thumb position', () => {
    const { rerender } = render(<Slider aria-label="x" value={20} onChange={() => {}} />);
    expect(getThumbs()[0]!).toHaveAttribute('aria-valuenow', '20');
    rerender(<Slider aria-label="x" value={80} onChange={() => {}} />);
    expect(getThumbs()[0]!).toHaveAttribute('aria-valuenow', '80');
  });

  it('controlled range value updates both thumbs', () => {
    const { rerender } = render(
      <Slider mode="range" aria-label="x" value={[10, 30]} onChange={() => {}} />,
    );
    const [a1, b1] = getThumbs();
    expect(a1).toHaveAttribute('aria-valuenow', '10');
    expect(b1).toHaveAttribute('aria-valuenow', '30');
    rerender(
      <Slider mode="range" aria-label="x" value={[20, 60]} onChange={() => {}} />,
    );
    const [a2, b2] = getThumbs();
    expect(a2).toHaveAttribute('aria-valuenow', '20');
    expect(b2).toHaveAttribute('aria-valuenow', '60');
  });

  it('continuous (step=null) does not snap', async () => {
    const onChange = vi.fn();
    render(
      <Slider
        aria-label="x"
        defaultValue={0.5}
        min={0}
        max={1}
        step={null}
        onChange={onChange}
      />,
    );
    const thumb = getThumbs()[0]!;
    focusEl(thumb);
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0]![0]).toBeGreaterThan(0.5);
  });
});

describe('Slider — value label', () => {
  it('does not render the label when showValueLabel="never"', () => {
    const { container } = render(<Slider aria-label="x" defaultValue={42} />);
    expect(container.querySelector('[data-visible]')).toBeNull();
  });

  it('always-visible label renders with data-visible=true', () => {
    const { container } = render(
      <Slider aria-label="x" defaultValue={42} showValueLabel="always" />,
    );
    expect(container.querySelector('[data-visible="true"]')).not.toBeNull();
  });

  it('formatValue customizes the displayed string', () => {
    render(
      <Slider
        aria-label="x"
        defaultValue={42}
        showValueLabel="always"
        formatValue={(v) => `${v}%`}
      />,
    );
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('renderValueLabel slot wraps the formatted text', () => {
    render(
      <Slider
        aria-label="x"
        defaultValue={42}
        showValueLabel="always"
        formatValue={(v) => `${v}%`}
        renderValueLabel={(formatted) => <span data-testid="custom">[{formatted}]</span>}
      />,
    );
    expect(screen.getByTestId('custom')).toHaveTextContent('[42%]');
  });
});

describe('Slider — form participation', () => {
  it('single mode: emits one hidden range input with the base name', () => {
    let captured: FormData | null = null;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          captured = new FormData(e.currentTarget);
        }}
      >
        <Slider aria-label="x" name="volume" defaultValue={70} />
        <button type="submit">Submit</button>
      </form>,
    );
    screen.getByRole('button', { name: 'Submit' }).click();
    expect(captured!.get('volume')).toBe('70');
  });

  it('range with 2 thumbs: emits -min and -max suffixed inputs', () => {
    let captured: FormData | null = null;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          captured = new FormData(e.currentTarget);
        }}
      >
        <Slider
          mode="range"
          aria-label="x"
          name="price"
          defaultValue={[10, 50]}
        />
        <button type="submit">Submit</button>
      </form>,
    );
    screen.getByRole('button', { name: 'Submit' }).click();
    expect(captured!.get('price-min')).toBe('10');
    expect(captured!.get('price-max')).toBe('50');
  });

  it('N-thumb (>=3): emits indexed inputs', () => {
    let captured: FormData | null = null;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          captured = new FormData(e.currentTarget);
        }}
      >
        <Slider
          mode="range"
          aria-label="x"
          name="band"
          defaultValue={[10, 30, 60]}
        />
        <button type="submit">Submit</button>
      </form>,
    );
    screen.getByRole('button', { name: 'Submit' }).click();
    expect(captured!.get('band-0')).toBe('10');
    expect(captured!.get('band-1')).toBe('30');
    expect(captured!.get('band-2')).toBe('60');
  });

  it('omits hidden inputs when no name is provided', () => {
    const { container } = render(<Slider aria-label="x" defaultValue={50} />);
    expect(container.querySelector('input[type="range"]')).toBeNull();
  });
});

describe('Slider — overrides + ref', () => {
  it('className wins on the root', () => {
    const { container } = render(
      <Slider aria-label="x" defaultValue={50} className="opacity-30" />,
    );
    const root = container.querySelector('[data-orientation]') as HTMLElement;
    expect(root.className).toContain('opacity-30');
  });

  it('forwards ref to the root <div>', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Slider ref={ref} aria-label="x" defaultValue={50} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('data-orientation attribute mirrors the orientation prop', () => {
    const { container, rerender } = render(<Slider aria-label="x" defaultValue={50} />);
    expect(container.querySelector('[data-orientation="horizontal"]')).not.toBeNull();
    rerender(<Slider aria-label="x" orientation="vertical" defaultValue={50} />);
    expect(container.querySelector('[data-orientation="vertical"]')).not.toBeNull();
  });

  it('invalid sets aria-invalid on every thumb', () => {
    render(<Slider mode="range" aria-label="x" invalid defaultValue={[20, 80]} />);
    for (const t of getThumbs()) {
      expect(t).toHaveAttribute('aria-invalid', 'true');
    }
  });
});