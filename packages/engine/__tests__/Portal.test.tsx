import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Portal } from '../src/Portal';

describe('Portal', () => {
  it('mounts children inside document.body by default', () => {
    render(
      <Portal>
        <span data-testid="portaled">hi</span>
      </Portal>,
    );
    const node = screen.getByTestId('portaled');
    // Walk up — every ancestor of a body-portaled element should reach <body>, not the test root.
    expect(node.closest('body')).toBe(document.body);
    expect(node.parentElement).not.toBeNull();
    expect(node.parentElement!.tagName).toBe('BODY');
  });

  it('mounts children inside a custom container when provided', () => {
    const container = document.createElement('div');
    container.id = 'custom-portal-target';
    document.body.appendChild(container);

    render(
      <Portal container={container}>
        <span data-testid="portaled">hi</span>
      </Portal>,
    );

    const node = screen.getByTestId('portaled');
    expect(node.parentElement).toBe(container);
    container.remove();
  });

  it('renders nothing when container is explicitly null', () => {
    const { container } = render(
      <Portal container={null}>
        <span data-testid="portaled">hi</span>
      </Portal>,
    );
    expect(screen.queryByTestId('portaled')).toBeNull();
    expect(container.innerHTML).toBe('');
  });

  it('renders inline (no portal) when disabled', () => {
    const { container } = render(
      <div data-testid="inline-host">
        <Portal disabled>
          <span data-testid="portaled">hi</span>
        </Portal>
      </div>,
    );
    const host = container.querySelector('[data-testid="inline-host"]');
    expect(host?.querySelector('[data-testid="portaled"]')).not.toBeNull();
  });

  it('cleans up the portal node on unmount', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const { unmount } = render(
      <Portal container={container}>
        <span data-testid="portaled">hi</span>
      </Portal>,
    );
    expect(container.children.length).toBe(1);
    unmount();
    expect(container.children.length).toBe(0);
    container.remove();
  });
});
