import { __resetWarnCache } from '@apx-ui/engine';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NumberInput } from '../src/NumberInput';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('NumberInput — accessibility', () => {
  it('passes axe-core for the default render', async () => {
    const { container } = render(<NumberInput aria-label="qty" defaultValue={1} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core with min/max/step + invalid + paired label', async () => {
    const { container } = render(
      <div>
        <label htmlFor="ax-qty">Quantity</label>
        <NumberInput id="ax-qty" defaultValue={150} min={0} max={100} step={1} invalid />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for every stepperPosition', async () => {
    const { container } = render(
      <div>
        <NumberInput aria-label="A" defaultValue={1} stepperPosition="start" />
        <NumberInput aria-label="B" defaultValue={1} stepperPosition="end" />
        <NumberInput aria-label="C" defaultValue={1} stepperPosition="split" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core with hidden stepper buttons', async () => {
    const { container } = render(
      <NumberInput aria-label="qty" defaultValue={1} hideStepperButtons />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core when disabled + readOnly cells', async () => {
    const { container } = render(
      <div>
        <NumberInput aria-label="d" defaultValue={1} disabled />
        <NumberInput aria-label="r" defaultValue={1} readOnly />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('NumberInput — dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetWarnCache();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when no accessible name is provided', () => {
    render(<NumberInput defaultValue={1} />);
    expect(warnSpy).toHaveBeenCalled();
    const message = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(message).toMatch(/accessible name/i);
  });

  it('does NOT warn when aria-label is provided', () => {
    render(<NumberInput aria-label="qty" defaultValue={1} />);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when a paired <label htmlFor> exists', () => {
    render(
      <div>
        <label htmlFor="warn-qty">Quantity</label>
        <NumberInput id="warn-qty" defaultValue={1} />
      </div>,
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });
});