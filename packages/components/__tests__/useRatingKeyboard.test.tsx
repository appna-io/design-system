import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useRatingKeyboard } from '../src/Rating/useRatingKeyboard';
import { renderWithTheme as render } from './utils';

import type { ReactNode } from 'react';

function Harness(props: {
  value: number;
  max?: number;
  precision?: 1 | 0.5;
  allowClear?: boolean;
  dir?: 'ltr' | 'rtl';
  disabled?: boolean;
  readOnly?: boolean;
  onChange: (value: number, meta: { source: 'click' | 'keyboard' | 'clear' }) => void;
  children?: ReactNode;
}) {
  const onKeyDown = useRatingKeyboard({
    value: props.value,
    max: props.max ?? 5,
    precision: props.precision ?? 1,
    allowClear: props.allowClear ?? false,
    dir: props.dir ?? 'ltr',
    disabled: props.disabled ?? false,
    readOnly: props.readOnly ?? false,
    onChange: props.onChange,
  });
  return (
    <button type="button" data-testid="kbd" onKeyDown={onKeyDown}>
      {props.children}
    </button>
  );
}

function pressKey(testid: string, key: string) {
  fireEvent.keyDown(document.querySelector(`[data-testid="${testid}"]`)!, { key });
}

describe('useRatingKeyboard — arrows (LTR)', () => {
  it('ArrowRight increases by precision', () => {
    const onChange = vi.fn();
    render(<Harness value={2} precision={1} onChange={onChange} />);
    pressKey('kbd', 'ArrowRight');
    expect(onChange).toHaveBeenCalledWith(3, { source: 'keyboard' });
  });

  it('ArrowRight at half-step increases by 0.5', () => {
    const onChange = vi.fn();
    render(<Harness value={2} precision={0.5} onChange={onChange} />);
    pressKey('kbd', 'ArrowRight');
    expect(onChange).toHaveBeenCalledWith(2.5, { source: 'keyboard' });
  });

  it('ArrowLeft decreases', () => {
    const onChange = vi.fn();
    render(<Harness value={3} precision={1} onChange={onChange} />);
    pressKey('kbd', 'ArrowLeft');
    expect(onChange).toHaveBeenCalledWith(2, { source: 'keyboard' });
  });

  it('ArrowUp / ArrowDown are direction-agnostic', () => {
    const onChange = vi.fn();
    render(<Harness value={2} onChange={onChange} />);
    pressKey('kbd', 'ArrowUp');
    expect(onChange).toHaveBeenCalledWith(3, { source: 'keyboard' });

    onChange.mockClear();
    render(<Harness value={3} onChange={onChange} />);
    pressKey('kbd', 'ArrowDown');
  });

  it('clamps to [0, max]', () => {
    const onChange = vi.fn();
    render(<Harness value={5} max={5} onChange={onChange} />);
    pressKey('kbd', 'ArrowRight');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('useRatingKeyboard — arrows (RTL)', () => {
  it('ArrowRight decreases in RTL', () => {
    const onChange = vi.fn();
    render(<Harness value={3} dir="rtl" onChange={onChange} />);
    pressKey('kbd', 'ArrowRight');
    expect(onChange).toHaveBeenCalledWith(2, { source: 'keyboard' });
  });

  it('ArrowLeft increases in RTL', () => {
    const onChange = vi.fn();
    render(<Harness value={3} dir="rtl" onChange={onChange} />);
    pressKey('kbd', 'ArrowLeft');
    expect(onChange).toHaveBeenCalledWith(4, { source: 'keyboard' });
  });
});

describe('useRatingKeyboard — Home / End / PageUp / PageDown', () => {
  it('Home with allowClear sets to 0 with source=clear', () => {
    const onChange = vi.fn();
    render(<Harness value={3} allowClear onChange={onChange} />);
    pressKey('kbd', 'Home');
    expect(onChange).toHaveBeenCalledWith(0, { source: 'clear' });
  });

  it('Home without allowClear sets to precision (smallest selectable)', () => {
    const onChange = vi.fn();
    render(<Harness value={3} precision={0.5} onChange={onChange} />);
    pressKey('kbd', 'Home');
    expect(onChange).toHaveBeenCalledWith(0.5, { source: 'keyboard' });
  });

  it('End sets to max', () => {
    const onChange = vi.fn();
    render(<Harness value={2} max={10} onChange={onChange} />);
    pressKey('kbd', 'End');
    expect(onChange).toHaveBeenCalledWith(10, { source: 'keyboard' });
  });

  it('PageUp jumps by 1 even at half-precision', () => {
    const onChange = vi.fn();
    render(<Harness value={2} precision={0.5} onChange={onChange} />);
    pressKey('kbd', 'PageUp');
    expect(onChange).toHaveBeenCalledWith(3, { source: 'keyboard' });
  });

  it('PageDown jumps by 1 even at half-precision', () => {
    const onChange = vi.fn();
    render(<Harness value={3} precision={0.5} onChange={onChange} />);
    pressKey('kbd', 'PageDown');
    expect(onChange).toHaveBeenCalledWith(2, { source: 'keyboard' });
  });
});

describe('useRatingKeyboard — digit shortcuts', () => {
  it('digit jumps to value', () => {
    const onChange = vi.fn();
    render(<Harness value={2} max={5} onChange={onChange} />);
    pressKey('kbd', '4');
    expect(onChange).toHaveBeenCalledWith(4, { source: 'keyboard' });
  });

  it('0 fires only with allowClear', () => {
    const onChange = vi.fn();
    render(<Harness value={3} onChange={onChange} />);
    pressKey('kbd', '0');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('0 fires with source=clear when allowClear is on', () => {
    const onChange = vi.fn();
    render(<Harness value={3} allowClear onChange={onChange} />);
    pressKey('kbd', '0');
    expect(onChange).toHaveBeenCalledWith(0, { source: 'clear' });
  });

  it('digit > max is ignored', () => {
    const onChange = vi.fn();
    render(<Harness value={2} max={5} onChange={onChange} />);
    pressKey('kbd', '9');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('useRatingKeyboard — disabled / readOnly', () => {
  it('disabled blocks every key', () => {
    const onChange = vi.fn();
    render(<Harness value={2} disabled onChange={onChange} />);
    pressKey('kbd', 'ArrowRight');
    pressKey('kbd', 'End');
    pressKey('kbd', '4');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('readOnly blocks every key', () => {
    const onChange = vi.fn();
    render(<Harness value={2} readOnly onChange={onChange} />);
    pressKey('kbd', 'ArrowRight');
    expect(onChange).not.toHaveBeenCalled();
  });
});