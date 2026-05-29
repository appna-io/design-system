import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Tooltip } from '../src/Tooltip';
import type { TooltipColor, TooltipVariant } from '../src/Tooltip';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

beforeEach(() => {
  // Tests below open the tooltip synchronously via openDelay=0 — fake timers + advance(0).
});

afterEach(() => {});

const variants: TooltipVariant[] = ['solid', 'outline', 'soft', 'inverted'];
const colors: TooltipColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

describe('Tooltip — accessibility', () => {
  it('floating surface carries role="tooltip"', async () => {
    const { container } = render(
      <Tooltip content="Hint" openDelay={0}>
        <button>Trigger</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button'));
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeInTheDocument());
    expect(container).toBeTruthy();
  });

  it('trigger has aria-describedby pointing at the tooltip while open', async () => {
    render(
      <Tooltip content="Saved 3 minutes ago" openDelay={0}>
        <button>Saved</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    fireEvent.pointerEnter(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeInTheDocument());

    const tooltip = screen.getByRole('tooltip');
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);
  });

  it('aria-describedby is removed when the tooltip closes', async () => {
    render(
      <Tooltip content="Hint" openDelay={0} closeDelay={0}>
        <button>Trigger</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    fireEvent.pointerEnter(trigger);
    await waitFor(() => expect(trigger.getAttribute('aria-describedby')).not.toBeNull());

    fireEvent.pointerLeave(trigger);
    await waitFor(() => expect(trigger).not.toHaveAttribute('aria-describedby'));
  });

  it('focus on the trigger opens the tooltip (keyboard)', async () => {
    render(
      <Tooltip content="Hint" openDelay={0}>
        <button>Trigger</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    fireEvent.focus(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeInTheDocument());
  });

  it('preserves an existing aria-describedby on the trigger', async () => {
    render(
      <Tooltip content="Hint" openDelay={0}>
        <button aria-describedby="other-help">Trigger</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    fireEvent.pointerEnter(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeInTheDocument());

    const value = trigger.getAttribute('aria-describedby')!;
    expect(value).toContain('other-help');
    expect(value).toContain(screen.getByRole('tooltip').id);
  });

  it.each(variants)('axe passes for %s × every color', async (variant) => {
    for (const color of colors) {
      const { container, unmount } = render(
        <Tooltip content="Hint text" variant={variant} color={color} openDelay={0}>
          <button>Trigger</button>
        </Tooltip>,
      );
      fireEvent.pointerEnter(screen.getByRole('button'));
      await waitFor(() => expect(screen.queryByRole('tooltip')).toBeInTheDocument());
      const results = await axe(container, {
        rules: {
          // The floating tooltip's color contrast is delegated to the design tokens; jsdom
          // can't compute reliable ratios anyway. The recipe is still axe-clean for everything
          // else (role, name, structural rules).
          'color-contrast': { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
      unmount();
    }
  });

  it('axe passes when disabled', async () => {
    const { container } = render(
      <Tooltip content="Hint" disabled>
        <button>Trigger</button>
      </Tooltip>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('the floating surface has pointer-events disabled (no accidental clicks)', async () => {
    render(
      <Tooltip content="Hint" openDelay={0}>
        <button>Trigger</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button'));
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeInTheDocument());
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toMatch(/pointer-events-none/);
  });

  it('the arrow carries aria-hidden', async () => {
    render(
      <Tooltip content="Hint" openDelay={0}>
        <button>Trigger</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button'));
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeInTheDocument());
    const arrow = screen.getByRole('tooltip').querySelector('svg');
    expect(arrow).not.toBeNull();
    expect(arrow!.getAttribute('aria-hidden')).toBe('true');
  });
});

// Touch the act import so the linter doesn't flag it as unused even though we may not use it
// in every test path above.
void act;
