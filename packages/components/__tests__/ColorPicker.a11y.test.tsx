import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { beforeAll, describe, expect, it } from 'vitest';

import { ColorInput } from '../src/ColorPicker/ColorInput';
import { ColorPicker } from '../src/ColorPicker/ColorPicker';
import { ColorSwatch } from '../src/ColorPicker/ColorSwatch';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

beforeAll(() => {
  if (!Element.prototype.setPointerCapture) {
    (Element.prototype as Element & { setPointerCapture?: (id: number) => void }).setPointerCapture =
      () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    (Element.prototype as Element & { releasePointerCapture?: (id: number) => void }).releasePointerCapture =
      () => {};
  }
});

describe('ColorPicker — accessibility', () => {
  it('passes axe-core for the default closed render', async () => {
    const { container } = render(<ColorPicker defaultValue="#6c5ce7" ariaLabel="Brand color" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core when open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ColorPicker defaultValue="#6c5ce7" enableAlpha ariaLabel="Brand color" />,
    );
    const trigger = container.querySelector('[data-trigger-variant]') as HTMLElement;
    await user.click(trigger);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core in presetsOnly mode', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ColorPicker
        defaultValue="#000000"
        presets={['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF']}
        presetsOnly
        ariaLabel="Brand"
      />,
    );
    const trigger = container.querySelector('[data-trigger-variant]') as HTMLElement;
    await user.click(trigger);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for triggerVariant=input', async () => {
    const { container } = render(
      <ColorPicker defaultValue="#6c5ce7" triggerVariant="input" ariaLabel="x" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core with a label + helper', async () => {
    const { container } = render(
      <ColorPicker defaultValue="#000" label="Brand" helperText="Used for primary buttons" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for the standalone ColorSwatch', async () => {
    const { container } = render(<ColorSwatch value="#6c5ce7" showLabel="Indigo" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for the standalone ColorInput', async () => {
    const { container } = render(
      <ColorInput defaultValue="#6c5ce7" label="Color" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});