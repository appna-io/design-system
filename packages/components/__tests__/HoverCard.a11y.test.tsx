import { fireEvent, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { HoverCard } from '../src/HoverCard';
import type { HoverCardColor, HoverCardVariant } from '../src/HoverCard';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const variants: HoverCardVariant[] = ['solid', 'outline', 'soft'];
const colors: HoverCardColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

describe('HoverCard — accessibility', () => {
  it('trigger carries aria-describedby when open', async () => {
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link', { name: '@ahmad' });
    expect(trigger).not.toHaveAttribute('aria-describedby');

    fireEvent.pointerEnter(trigger);
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).toBeInTheDocument(),
    );
    expect(trigger).toHaveAttribute(
      'aria-describedby',
      screen.getByRole('tooltip').id,
    );
  });

  it('content has role=tooltip (not modal/dialog) — additive overlay semantics', async () => {
    render(
      <HoverCard openDelay={0} closeDelay={0} defaultOpen>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>Card body</HoverCard.Content>
      </HoverCard>,
    );
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).toBeInTheDocument(),
    );
    const content = screen.getByRole('tooltip');
    // HoverCard is additive — never carries aria-modal.
    expect(content).not.toHaveAttribute('aria-modal');
  });

  it('does not steal focus from the trigger (no focus trap)', async () => {
    render(
      <div>
        <HoverCard openDelay={0} closeDelay={0} defaultOpen>
          <HoverCard.Trigger>
            <a href="#user">@ahmad</a>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <button data-testid="inside">inside</button>
          </HoverCard.Content>
        </HoverCard>
        <button data-testid="after">after</button>
      </div>,
    );
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).toBeInTheDocument(),
    );
    // Without a focus trap, focus is wherever the consumer last left it (default body).
    // The crucial check: the inside button is NOT auto-focused.
    expect(document.activeElement).not.toBe(screen.getByTestId('inside'));
  });

  it('axe: passes for variant × representative color cells (default + soft + outline)', async () => {
    // Sample (not full 21-cell exhaustive sweep) — keeps the suite under 5s.
    const sampleCells: Array<{ variant: HoverCardVariant; color: HoverCardColor }> = [
      { variant: 'solid', color: 'neutral' },
      { variant: 'outline', color: 'primary' },
      { variant: 'outline', color: 'danger' },
      { variant: 'soft', color: 'success' },
      { variant: 'soft', color: 'warning' },
      { variant: 'soft', color: 'info' },
    ];

    for (const cell of sampleCells) {
      const { container, unmount } = render(
        <HoverCard openDelay={0} closeDelay={0} defaultOpen>
          <HoverCard.Trigger>
            <a href="#user">@ahmad</a>
          </HoverCard.Trigger>
          <HoverCard.Content variant={cell.variant} color={cell.color}>
            Card body for {cell.variant} / {cell.color}
          </HoverCard.Content>
        </HoverCard>,
      );
      await waitFor(() =>
        expect(screen.queryByRole('tooltip')).toBeInTheDocument(),
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      unmount();
    }
  });

  it('axe: passes across full variant matrix (smoke test on neutral color)', async () => {
    for (const variant of variants) {
      const { container, unmount } = render(
        <HoverCard openDelay={0} closeDelay={0} defaultOpen>
          <HoverCard.Trigger>
            <a href="#user">@ahmad</a>
          </HoverCard.Trigger>
          <HoverCard.Content variant={variant} color="neutral">
            <strong>@ahmad</strong>
            <p>Sample bio text. {variant} variant.</p>
          </HoverCard.Content>
        </HoverCard>,
      );
      await waitFor(() =>
        expect(screen.queryByRole('tooltip')).toBeInTheDocument(),
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      unmount();
    }
  });

  it('axe: passes when card carries interactive children (link + button)', async () => {
    const { container } = render(
      <HoverCard openDelay={0} closeDelay={0} defaultOpen>
        <HoverCard.Trigger>
          <a href="#user">@ahmad</a>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <strong>@ahmad</strong>
          <p>Software engineer building design systems.</p>
          <a href="#follow">Follow</a>
        </HoverCard.Content>
      </HoverCard>,
    );
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).toBeInTheDocument(),
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Smoke check that all 7 colors render — keeps Tailwind's literal scanner aware they're used in
// at least one runtime path even before axe sweeps. Not strictly a11y but lives here as a
// matrix-coverage guard like Popover/Tooltip use.
describe('HoverCard — variant × color matrix smoke', () => {
  it('renders all 7 colors in soft variant without crashing', async () => {
    for (const color of colors) {
      const { unmount } = render(
        <HoverCard openDelay={0} closeDelay={0} defaultOpen>
          <HoverCard.Trigger>
            <a href={`#${color}`}>{color}</a>
          </HoverCard.Trigger>
          <HoverCard.Content variant="soft" color={color}>
            {color}
          </HoverCard.Content>
        </HoverCard>,
      );
      await waitFor(() =>
        expect(screen.queryByRole('tooltip')).toBeInTheDocument(),
      );
      unmount();
    }
  });
});
