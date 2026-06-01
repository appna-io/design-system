import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Divider } from '../src/Divider';
import type {
  DividerColor,
  DividerOrientation,
  DividerThickness,
  DividerVariant,
} from '../src/Divider';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Divider — accessibility', () => {
  it('default <hr> has implicit role=separator (no aria-orientation in horizontal)', () => {
    const { container } = render(<Divider />);
    const el = container.querySelector('hr')!;
    expect(el).not.toHaveAttribute('aria-orientation');
  });

  it('vertical orientation announces aria-orientation', () => {
    const { container } = render(<Divider orientation="vertical" />);
    const el = container.querySelector('hr')!;
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('labeled divider exposes its label as accessible name', () => {
    const { container, getByRole } = render(<Divider>Section heading</Divider>);
    const el = getByRole('separator');
    expect(el).toHaveAccessibleName('Section heading');
    // Flank rules must not contribute to the accessible name (aria-hidden).
    container.querySelectorAll('[data-divider-line]').forEach((line) => {
      expect(line).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('decorative divider is hidden from AT', () => {
    const { container } = render(<Divider decorative />);
    const el = container.querySelector('hr')!;
    expect(el).toHaveAttribute('role', 'presentation');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Divider — axe', () => {
  const variants: DividerVariant[] = ['solid', 'dashed', 'dotted'];
  const thicknesses: DividerThickness[] = [1, 2, 4];
  const colors: DividerColor[] = ['subtle', 'default', 'strong'];
  const orientations: DividerOrientation[] = ['horizontal', 'vertical'];

  it.each(orientations)('no violations for %s orientation', async (orientation) => {
    const { container } = render(<Divider orientation={orientation} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it.each(variants)('no violations for variant=%s', async (variant) => {
    const { container } = render(<Divider variant={variant} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it.each(thicknesses)('no violations for thickness=%i', async (thickness) => {
    const { container } = render(<Divider thickness={thickness} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it.each(colors)('no violations for color=%s', async (color) => {
    const { container } = render(<Divider color={color} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('labeled divider has no violations', async () => {
    const { container } = render(<Divider>OR</Divider>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('decorative divider has no violations', async () => {
    const { container } = render(<Divider decorative thickness={2} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});