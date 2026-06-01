import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Drawer } from '../src/Drawer';
import type { DrawerSide, DrawerSize } from '../src/Drawer';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const sides: DrawerSide[] = ['left', 'right', 'top', 'bottom'];
const sizes: DrawerSize[] = ['sm', 'md', 'lg'];

beforeEach(() => {
  document.body.style.overflow = '';
});

afterEach(() => {
  document.body.style.overflow = '';
});

describe('Drawer — accessibility', () => {
  it('trigger carries aria-haspopup="dialog" + aria-expanded', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('content carries role="dialog" + aria-modal="true"', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('Header wires title via aria-labelledby and description via aria-describedby', async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header title="Settings" description="Tune your preferences" />
          <Drawer.Body>Body</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
    const dialog = screen.getByRole('dialog');
    const labelEl = document.getElementById(dialog.getAttribute('aria-labelledby')!);
    const descEl = document.getElementById(dialog.getAttribute('aria-describedby')!);
    expect(labelEl).toHaveTextContent('Settings');
    expect(descEl).toHaveTextContent('Tune your preferences');
  });

  it('Close button has aria-label="Close" by default', async () => {
    render(
      <Drawer defaultOpen>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Close />
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it.each(sides)('axe passes for side=%s × every size (open state)', async (side) => {
    const user = userEvent.setup();
    for (const size of sizes) {
      const { container, unmount } = render(
        <Drawer>
          <Drawer.Trigger>
            <button>Open</button>
          </Drawer.Trigger>
          <Drawer.Content side={side} size={size}>
            <Drawer.Header title="Title" description="Description" />
            <Drawer.Body>
              <p>Body content</p>
              <button>Inner action</button>
            </Drawer.Body>
            <Drawer.Footer>
              <button>Cancel</button>
              <button>Save</button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>,
      );
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
      const results = await axe(container, {
        rules: {
          // jsdom can't compute color contrast reliably; tokens guarantee AA in the recipe.
          'color-contrast': { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
      unmount();
    }
  });

  it('axe passes for the closed state', async () => {
    const { container } = render(
      <Drawer>
        <Drawer.Trigger>
          <button>Open</button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Body>Hello</Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});