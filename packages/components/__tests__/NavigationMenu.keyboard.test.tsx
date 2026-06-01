import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NavigationMenu } from '../src/NavigationMenu';
import { renderWithTheme as render } from './utils';

/**
 * W3C Menubar keyboard pattern. Top-level focus moves via ArrowLeft / ArrowRight
 * with wrap; ArrowDown opens a dropdown when present; Esc closes; Home / End
 * jump to extremes; type-to-search jumps by label prefix.
 */

/**
 * Setup deliberately omits `activeHref` — the active-state appends an
 * `sr-only` "current page" suffix to the matching link's accessible name,
 * which would force every test to match against a regex or a different
 * accessible name. Active-state matching is exercised in the main test file.
 */
function setup() {
  return render(
    <NavigationMenu>
      <NavigationMenu.Item value="features">
        <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
      </NavigationMenu.Item>
      <NavigationMenu.Item value="product">
        <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <NavigationMenu.Link href="/dev">Developers</NavigationMenu.Link>
          <NavigationMenu.Link href="/des">Designers</NavigationMenu.Link>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item value="pricing">
        <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
      </NavigationMenu.Item>
      <NavigationMenu.Item value="docs">
        <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
      </NavigationMenu.Item>
    </NavigationMenu>,
  );
}

describe('NavigationMenu — keyboard (W3C Menubar)', () => {
  it('ArrowRight / ArrowLeft move focus between top-level items with wrap', async () => {
    setup();

    const features = screen.getByRole('menuitem', { name: 'Features' });
    features.focus();
    expect(document.activeElement).toBe(features);

    fireEvent.keyDown(features, { key: 'ArrowRight' });
    const product = screen.getByRole('menuitem', { name: 'Product' });
    await waitFor(() => expect(document.activeElement).toBe(product));

    fireEvent.keyDown(product, { key: 'ArrowRight' });
    const pricing = screen.getByRole('menuitem', { name: 'Pricing' });
    await waitFor(() => expect(document.activeElement).toBe(pricing));

    // wrap from last → first
    fireEvent.keyDown(pricing, { key: 'ArrowRight' });
    const docs = screen.getByRole('menuitem', { name: 'Docs' });
    await waitFor(() => expect(document.activeElement).toBe(docs));

    fireEvent.keyDown(docs, { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement).toBe(features));

    fireEvent.keyDown(features, { key: 'ArrowLeft' });
    await waitFor(() => expect(document.activeElement).toBe(docs));
  });

  it('Home / End jump to first / last item', async () => {
    setup();
    const product = screen.getByRole('menuitem', { name: 'Product' });
    product.focus();
    fireEvent.keyDown(product, { key: 'End' });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Docs' })),
    );

    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Features' })),
    );
  });

  it('ArrowDown on a Trigger opens its dropdown', async () => {
    setup();
    const product = screen.getByRole('menuitem', { name: 'Product' });
    product.focus();
    fireEvent.keyDown(product, { key: 'ArrowDown' });
    await waitFor(() => expect(product.getAttribute('aria-expanded')).toBe('true'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('Esc closes the open dropdown', async () => {
    setup();
    const product = screen.getByRole('menuitem', { name: 'Product' });
    fireEvent.click(product);
    await waitFor(() => expect(product.getAttribute('aria-expanded')).toBe('true'));

    fireEvent.keyDown(product, { key: 'Escape' });
    await waitFor(() => expect(product.getAttribute('aria-expanded')).toBe('false'));
  });

  it('type-to-search jumps to a matching item', async () => {
    setup();
    const features = screen.getByRole('menuitem', { name: 'Features' });
    features.focus();
    fireEvent.keyDown(features, { key: 'd' });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Docs' })),
    );
  });
});