import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar } from '../src/Avatar/Avatar';
import { AvatarGroup } from '../src/Avatar/AvatarGroup';
import { renderWithTheme as render } from './utils';

describe('AvatarGroup — basics', () => {
  it('renders all children when count <= max', () => {
    render(
      <AvatarGroup max={4}>
        <Avatar name="Ada" />
        <Avatar name="Bren" />
        <Avatar name="Cleo" />
      </AvatarGroup>,
    );
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('renders every child when max is omitted', () => {
    render(
      <AvatarGroup>
        <Avatar name="Ada" />
        <Avatar name="Bren" />
        <Avatar name="Cleo" />
        <Avatar name="Dax" />
        <Avatar name="Eli" />
      </AvatarGroup>,
    );
    expect(screen.getAllByRole('img')).toHaveLength(5);
  });
});

describe('AvatarGroup — overflow', () => {
  it('renders max children + a "+N" overflow Avatar when count > max', () => {
    render(
      <AvatarGroup max={3}>
        <Avatar name="Ada" />
        <Avatar name="Bren" />
        <Avatar name="Cleo" />
        <Avatar name="Dax" />
        <Avatar name="Eli" />
      </AvatarGroup>,
    );
    // 3 visible + 1 overflow tile = 4 total.
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('the overflow tile has aria-label="N more"', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="Ada" />
        <Avatar name="Bren" />
        <Avatar name="Cleo" />
        <Avatar name="Dax" />
      </AvatarGroup>,
    );
    expect(screen.getByRole('img', { name: '2 more' })).toBeInTheDocument();
  });

  it('overflowMode="ellipsis" renders an … instead of the count', () => {
    render(
      <AvatarGroup max={2} overflowMode="ellipsis">
        <Avatar name="Ada" />
        <Avatar name="Bren" />
        <Avatar name="Cleo" />
        <Avatar name="Dax" />
      </AvatarGroup>,
    );
    expect(screen.queryByText('+2')).not.toBeInTheDocument();
    expect(screen.getByText('…')).toBeInTheDocument();
  });

  it('renderOverflow takes complete control of the overflow tile', () => {
    render(
      <AvatarGroup
        max={1}
        renderOverflow={(n) => <span data-testid="custom-overflow">{`${n}!!`}</span>}
      >
        <Avatar name="Ada" />
        <Avatar name="Bren" />
        <Avatar name="Cleo" />
      </AvatarGroup>,
    );
    expect(screen.getByTestId('custom-overflow')).toHaveTextContent('2!!');
    // Only one Avatar is rendered (the rest was replaced by the custom render).
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });
});

describe('AvatarGroup — propagation', () => {
  it('propagates size to nested Avatars that don\'t set their own', () => {
    render(
      <AvatarGroup size="lg">
        <Avatar name="Ada" />
        <Avatar name="Bren" size="xs" />
      </AvatarGroup>,
    );
    const [first, second] = screen.getAllByRole('img');
    expect(first?.className).toContain('size-12'); // lg → size-12
    expect(second?.className).toContain('size-6'); // explicit override wins
  });

  it('propagates variant to nested Avatars', () => {
    render(
      <AvatarGroup variant="soft">
        <Avatar name="Ada" color="primary" />
      </AvatarGroup>,
    );
    const node = screen.getByRole('img', { name: 'Ada' });
    expect(node.className).toContain('bg-primary-subtle');
  });

  it('propagates shape to nested Avatars', () => {
    render(
      <AvatarGroup shape="square">
        <Avatar name="Ada" />
      </AvatarGroup>,
    );
    expect(screen.getByRole('img', { name: 'Ada' }).className).toContain('rounded-none');
  });
});

describe('AvatarGroup — spacing', () => {
  it('applies negative marginInlineStart for overlap on every tile after the first', () => {
    const { container } = render(
      <AvatarGroup spacing={-2}>
        <Avatar name="Ada" />
        <Avatar name="Bren" />
        <Avatar name="Cleo" />
      </AvatarGroup>,
    );
    const tiles = container.querySelectorAll(':scope > div > span');
    expect(tiles.length).toBe(3);
    // First tile has no margin.
    expect((tiles[0] as HTMLElement).style.marginInlineStart).toBe('');
    // Subsequent tiles overlap by -8 px (spacing -2 × 4 px/unit).
    expect((tiles[1] as HTMLElement).style.marginInlineStart).toBe('-8px');
    expect((tiles[2] as HTMLElement).style.marginInlineStart).toBe('-8px');
  });

  it('positive spacing creates a gap instead of overlapping', () => {
    const { container } = render(
      <AvatarGroup spacing={3}>
        <Avatar name="Ada" />
        <Avatar name="Bren" />
      </AvatarGroup>,
    );
    const tiles = container.querySelectorAll(':scope > div > span');
    expect((tiles[1] as HTMLElement).style.marginInlineStart).toBe('12px');
  });
});
