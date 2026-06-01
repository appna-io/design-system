import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Avatar } from '../src/Avatar/Avatar';
import { AvatarGroup } from '../src/Avatar/AvatarGroup';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const VARIANTS = ['solid', 'outline', 'soft'] as const;
const COLORS = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
] as const;

describe('Avatar — accessibility', () => {
  it('passes axe-core for a default fallback render', async () => {
    const { container } = render(<Avatar name="Ada Lovelace" delayMs={0} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for every variant × color cell', async () => {
    const { container } = render(
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {VARIANTS.flatMap((variant) =>
          COLORS.map((color) => (
            <li key={`${variant}-${color}`}>
              <Avatar variant={variant} color={color} name="X" delayMs={0} />
            </li>
          )),
        )}
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for status + ring + asChild combinations', async () => {
    const { container } = render(
      <div>
        <Avatar name="Ada Lovelace" status="online" delayMs={0} />
        <Avatar name="Bren Park" status="busy" statusPlacement="top-left" delayMs={0} />
        <Avatar name="Cleo" ring="primary" delayMs={0} />
        <Avatar asChild name="Dax">
          {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- Slot injects content. */}
          <a href="#x" />
        </Avatar>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for an AvatarGroup with overflow', async () => {
    const { container } = render(
      <AvatarGroup max={2}>
        <Avatar name="Ada" delayMs={0} />
        <Avatar name="Bren" delayMs={0} />
        <Avatar name="Cleo" delayMs={0} />
        <Avatar name="Dax" delayMs={0} />
      </AvatarGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('the fallback initials are aria-hidden', () => {
    const { container } = render(<Avatar name="Ada Lovelace" delayMs={0} />);
    const fallback = container.querySelector('span[aria-hidden="true"]');
    expect(fallback).not.toBeNull();
    expect(fallback?.textContent).toBe('AL');
  });

  it('the default user-icon fallback is aria-hidden', () => {
    const { container } = render(<Avatar delayMs={0} />);
    const fallback = container.querySelector('span[aria-hidden="true"]');
    expect(fallback?.querySelector('svg')).not.toBeNull();
  });
});