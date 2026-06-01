import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Alert } from '../src/Alert';
import type { AlertColor, AlertVariant } from '../src/Alert';
import { renderWithTheme as render } from './utils';

/** Grab the alert element regardless of which live-region role it carries. */
function alertOf(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[role="status"], [role="alert"]');
  if (!el) throw new Error('Alert element not found in container');
  return el;
}

describe('Alert — rendering', () => {
  it('renders children inside a status-role region by default (info color)', () => {
    render(<Alert>Hello world</Alert>);
    const alert = screen.getByRole('status');
    expect(alert).toHaveTextContent('Hello world');
    expect(alert).toHaveAttribute('data-variant', 'soft');
    expect(alert).toHaveAttribute('data-color', 'info');
  });

  it('switches to role="alert" for warning + danger colors', () => {
    const { rerender } = render(<Alert color="warning">x</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Alert color="danger">x</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('honors an explicit role prop over the auto-selection', () => {
    render(
      <Alert color="danger" role="status">
        x
      </Alert>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('applies the variant + color compound classes', () => {
    const { container } = render(
      <Alert variant="solid" color="success">
        x
      </Alert>,
    );
    const cls = alertOf(container).className;
    expect(cls).toContain('bg-success');
    expect(cls).toContain('text-success-contrast');
  });

  it('applies one size variant per token', () => {
    const { container, rerender } = render(<Alert size="sm">x</Alert>);
    expect(alertOf(container).className).toContain('p-2.5');
    rerender(<Alert size="lg">x</Alert>);
    expect(alertOf(container).className).toContain('p-4');
  });

  it('inline variant uses logical-start border bar and no full border', () => {
    const { container } = render(<Alert variant="inline">x</Alert>);
    const cls = alertOf(container).className;
    expect(cls).toContain('border-s-4');
    expect(cls).toContain('border-0');
    expect(cls).toContain('bg-transparent');
  });
});

describe('Alert — icon', () => {
  it('renders the auto-icon for the active color', () => {
    const { container } = render(<Alert color="success">x</Alert>);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('hideIcon removes the leading icon', () => {
    const { container } = render(
      <Alert color="success" hideIcon>
        x
      </Alert>,
    );
    expect(container.querySelector('svg')).toBeNull();
  });

  it('icon prop overrides the auto-selected icon', () => {
    const { container } = render(
      <Alert color="info" icon={<svg data-testid="custom" />}>
        x
      </Alert>,
    );
    expect(container.querySelector('[data-testid="custom"]')).not.toBeNull();
  });
});

describe('Alert — closable + onClose', () => {
  it('renders a Dismiss button when closable={true}', () => {
    render(<Alert closable>x</Alert>);
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
  });

  it('clicking the close button fires onClose and unmounts (uncontrolled)', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Alert closable onClose={onClose}>
        x
      </Alert>,
    );
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });

  it('controlled: open=false hides the alert', async () => {
    function Wrap() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <Alert open={open} onClose={() => setOpen(false)} closable>
            x
          </Alert>
          <button type="button" onClick={() => setOpen((v) => !v)}>
            toggle
          </button>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Wrap />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });

  it('does not render close button when closable is false (the default)', () => {
    render(<Alert>x</Alert>);
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });
});

describe('Alert — variant × color matrix smoke', () => {
  const VARIANTS: readonly AlertVariant[] = ['solid', 'outline', 'soft', 'inline'];
  const COLORS: readonly AlertColor[] = ['info', 'success', 'warning', 'danger', 'neutral'];

  it('every variant × color cell mounts and carries the right data-attributes', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        const { container, unmount } = render(
          <Alert variant={variant} color={color} aria-label={`${variant}-${color}`}>
            x
          </Alert>,
        );
        const el = alertOf(container);
        expect(el).toHaveAttribute('data-variant', variant);
        expect(el).toHaveAttribute('data-color', color);
        unmount();
      }
    }
  });
});

describe('Alert — sub-parts', () => {
  it('renders Alert.Title, Alert.Description, Alert.Action with their recipe classes', () => {
    render(
      <Alert>
        <Alert.Title data-testid="title">Title</Alert.Title>
        <Alert.Description data-testid="desc">Body</Alert.Description>
        <Alert.Action data-testid="action">btn</Alert.Action>
      </Alert>,
    );
    expect(screen.getByTestId('title').className).toContain('font-semibold');
    expect(screen.getByTestId('desc').className).toContain('leading-relaxed');
    expect(screen.getByTestId('action').className).toContain('mt-2');
  });
});

describe('Alert — ref + overrides', () => {
  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Alert ref={ref}>x</Alert>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges a consumer-supplied className with the recipe classes', () => {
    const { container } = render(<Alert className="custom-flag">x</Alert>);
    expect(alertOf(container).className).toContain('custom-flag');
  });
});