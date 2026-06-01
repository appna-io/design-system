import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Popover } from '../src/Popover';
import type { PopoverColor, PopoverVariant } from '../src/Popover';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const variants: PopoverVariant[] = ['solid', 'outline', 'soft'];
const colors: PopoverColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

describe('Popover — accessibility', () => {
  it('trigger carries aria-haspopup, aria-expanded, aria-controls', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>Hello</Popover.Content>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');

    await user.click(trigger);
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).toBeInTheDocument(),
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('dialog').id);
  });

  it('content carries role=dialog and is labelledby the trigger', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>Hello</Popover.Content>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', trigger.id);
  });

  it('non-modal popover does NOT carry aria-modal', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>non-modal</Popover.Content>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
    // aria-haspopup is `'true'` for non-modal (per the ARIA Popover pattern).
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-haspopup', 'true');
  });

  it('modal popover carries aria-modal=true and aria-haspopup="dialog"', async () => {
    const user = userEvent.setup();
    render(
      <Popover modal>
        <Popover.Trigger>
          <button>Open modal</button>
        </Popover.Trigger>
        <Popover.Content>modal</Popover.Content>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open modal' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await user.click(trigger);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it.each(variants)(
    'axe passes for variant=%s × every color (open state)',
    async (variant) => {
      const user = userEvent.setup();
      for (const color of colors) {
        const { container, unmount } = render(
          <Popover>
            <Popover.Trigger>
              <button>Open</button>
            </Popover.Trigger>
            <Popover.Content variant={variant} color={color}>
              <p>Hello</p>
              <button>Action</button>
            </Popover.Content>
          </Popover>,
        );
        await user.click(screen.getByRole('button', { name: 'Open' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
        const results = await axe(container, {
          rules: {
            // jsdom can't compute color contrast reliably; design tokens guarantee AA in the
            // recipe and we cover that visually in the renderer.
            'color-contrast': { enabled: false },
          },
        });
        expect(results).toHaveNoViolations();
        unmount();
      }
    },
  );

  it('axe passes for the closed state', async () => {
    const { container } = render(
      <Popover>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>Hello</Popover.Content>
      </Popover>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Close button has aria-label="Close" by default', async () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>
          <button>Open</button>
        </Popover.Trigger>
        <Popover.Content>
          Hello
          <Popover.Close />
        </Popover.Content>
      </Popover>,
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
    const close = screen.getByRole('button', { name: 'Close' });
    expect(close).toBeInTheDocument();
  });

  it('Trigger preserves an existing aria-describedby', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <Popover.Trigger>
          <button aria-describedby="other-help">Open</button>
        </Popover.Trigger>
        <Popover.Content>Hello</Popover.Content>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-describedby', 'other-help');
    await user.click(trigger);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
    // We don't add aria-describedby (Popover uses aria-labelledby on the content); the
    // existing aria-describedby on the trigger should be untouched.
    expect(trigger).toHaveAttribute('aria-describedby', 'other-help');
  });
});