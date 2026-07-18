import { axe, toHaveNoViolations } from 'jest-axe';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Image } from '../src/Image';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const SRC = 'https://example.com/photo.jpg';

describe('Image — accessibility', () => {
  it('has no axe violations with a descriptive alt', async () => {
    const { container } = render(<Image src={SRC} alt="A stylist at work" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('decorative image (alt="") is removed from the accessibility tree', () => {
    const { container } = render(<Image src={SRC} alt="" />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('fallback box has no axe violations and keeps the name', async () => {
    const { container } = render(
      <Image src={SRC} alt="Team portrait" fallback={<span>unavailable</span>} />,
    );
    fireEvent.error(container.querySelector('img')!);
    expect(screen.getByRole('img', { name: 'Team portrait' })).toBeDefined();
    expect(await axe(container)).toHaveNoViolations();
  });
});
