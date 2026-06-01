import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Modal } from '../src/Modal';
import type { ModalSize, ModalVariant } from '../src/Modal';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const variants: ModalVariant[] = ['solid', 'outline'];
const sizes: ModalSize[] = ['sm', 'md', 'lg'];

describe('Modal — accessibility', () => {
  it('trigger carries aria-haspopup="dialog" + aria-expanded', async () => {
    const user = userEvent.setup();
    render(
      <Modal>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
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
      <Modal>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('Header wires title via aria-labelledby and description via aria-describedby', async () => {
    const user = userEvent.setup();
    render(
      <Modal>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Header title="Settings" description="Tune your account" />
          <Modal.Body>Body</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
    const labelEl = document.getElementById(dialog.getAttribute('aria-labelledby')!);
    const descEl = document.getElementById(dialog.getAttribute('aria-describedby')!);
    expect(labelEl).toHaveTextContent('Settings');
    expect(descEl).toHaveTextContent('Tune your account');
  });

  it('Close button has aria-label="Close" by default', async () => {
    render(
      <Modal defaultOpen>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Close />
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it.each(variants)(
    'axe passes for variant=%s × every size (open state)',
    async (variant) => {
      const user = userEvent.setup();
      for (const size of sizes) {
        const { container, unmount } = render(
          <Modal>
            <Modal.Trigger>
              <button>Open</button>
            </Modal.Trigger>
            <Modal.Content variant={variant} size={size}>
              <Modal.Header title="Title" description="Description" />
              <Modal.Body>
                <p>Body content</p>
                <button>Inner action</button>
              </Modal.Body>
              <Modal.Footer>
                <button>Cancel</button>
                <button>Save</button>
              </Modal.Footer>
            </Modal.Content>
          </Modal>,
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
      <Modal>
        <Modal.Trigger>
          <button>Open</button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Body>Hello</Modal.Body>
        </Modal.Content>
      </Modal>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});