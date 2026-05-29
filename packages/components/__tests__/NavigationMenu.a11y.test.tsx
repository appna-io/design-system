import { screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { beforeEach, describe, expect, it } from 'vitest';

import { NavigationMenu } from '../src/NavigationMenu';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

beforeEach(() => {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  }
});

describe('NavigationMenu — axe-core', () => {
  it('basic links — 0 violations', async () => {
    const { container } = render(
      <NavigationMenu activeHref="/pricing">
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('with closed dropdown — 0 violations', async () => {
    const { container } = render(
      <NavigationMenu activeHref="/pricing">
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
            <NavigationMenu.Link href="/integrations">Integrations</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('with open dropdown — 0 violations', async () => {
    const { baseElement } = render(
      <NavigationMenu defaultValue="product" activeHref="/pricing">
        <NavigationMenu.Item value="product">
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
            <NavigationMenu.Link href="/integrations">Integrations</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    // Wait for the panel to mount.
    await waitFor(() => expect(screen.queryByRole('menu')).toBeInTheDocument());
    // Run axe on the full baseElement so the portalled panel is included.
    // Disable "region" — portalled overlays are intentionally rendered outside
    // the nav landmark for z-index isolation; their semantic relationship is
    // expressed via `aria-labelledby` pointing at the trigger inside the nav.
    const results = await axe(baseElement, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('mega-menu open — 0 violations', async () => {
    const { baseElement } = render(
      <NavigationMenu defaultValue="solutions">
        <NavigationMenu.Item value="solutions">
          <NavigationMenu.Trigger>Solutions</NavigationMenu.Trigger>
          <NavigationMenu.Content variant="mega" columns={2}>
            <NavigationMenu.Group label="By role">
              <NavigationMenu.Link href="/devs">For developers</NavigationMenu.Link>
              <NavigationMenu.Link href="/designers">For designers</NavigationMenu.Link>
            </NavigationMenu.Group>
            <NavigationMenu.Group label="By size">
              <NavigationMenu.Link href="/startups">Startups</NavigationMenu.Link>
              <NavigationMenu.Link href="/enterprise">Enterprise</NavigationMenu.Link>
            </NavigationMenu.Group>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    // Mega-menu uses `role="group"` (NOT `role="menu"`) — same `aria-labelledby`
    // pairing but freer children (h3 headings + group columns).
    await waitFor(() =>
      expect(screen.queryByRole('group', { name: 'Solutions' })).toBeInTheDocument(),
    );
    const results = await axe(baseElement, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('vertical orientation — 0 violations', async () => {
    const { container } = render(
      <NavigationMenu orientation="vertical" activeHref="/docs">
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('with indicator — 0 violations', async () => {
    const { container } = render(
      <NavigationMenu indicator activeHref="/pricing">
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
