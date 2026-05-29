import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NavigationMenu } from '../src/NavigationMenu';
import { renderWithTheme as render } from './utils';

/**
 * `useEscapeStack` and Floating UI's `whileElementsMounted` both schedule via
 * `requestAnimationFrame`; jsdom polyfills it but it doesn't tick on its own,
 * so we run pretend timers + a real `setTimeout` polyfill where the test
 * explicitly waits for an open or close to settle.
 */
beforeEach(() => {
  // Stub `ResizeObserver` so the indicator hook doesn't crash in jsdom.
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
  }
});

afterEach(() => {
  vi.clearAllTimers();
});

describe('NavigationMenu — root rendering', () => {
  it('renders as a <nav> landmark with default aria-label', () => {
    render(
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav.getAttribute('aria-label')).toBe('Main navigation');
    expect(nav.tagName).toBe('NAV');
  });

  it('contains a menubar with the right orientation', () => {
    render(
      <NavigationMenu orientation="vertical">
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const menubar = screen.getByRole('menubar');
    expect(menubar.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('forwards ref to the <nav>', () => {
    const ref = createRef<HTMLElement>();
    render(
      <NavigationMenu ref={ref}>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('accepts a custom ariaLabel', () => {
    render(
      <NavigationMenu ariaLabel="Marketing">
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    expect(screen.getByRole('navigation').getAttribute('aria-label')).toBe('Marketing');
  });
});

describe('NavigationMenu — links + active state', () => {
  it('renders top-level links with role="menuitem"', () => {
    render(
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(2);
    expect(items[0]?.textContent).toContain('Features');
    expect(items[1]?.textContent).toContain('Pricing');
  });

  it('marks the active link with aria-current="page"', () => {
    render(
      <NavigationMenu activeHref="/pricing">
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const pricing = screen.getByRole('menuitem', { name: /pricing/i });
    expect(pricing.getAttribute('aria-current')).toBe('page');
    const features = screen.getByRole('menuitem', { name: /features/i });
    expect(features.getAttribute('aria-current')).toBeNull();
  });

  it('matches active links by prefix when activeMatchStrategy="prefix"', () => {
    render(
      <NavigationMenu activeHref="/docs/components" activeMatchStrategy="prefix">
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    expect(screen.getByRole('menuitem', { name: /docs/i }).getAttribute('aria-current')).toBe(
      'page',
    );
  });
});

describe('NavigationMenu — dropdown trigger', () => {
  it('opens the panel on trigger click', async () => {
    render(
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
            <NavigationMenu.Link href="/integrations">Integrations</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );

    const trigger = screen.getByRole('menuitem', { name: /product/i });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));

    // Panel mounts as role="menu" with the trigger's id as labelledby.
    const panel = await screen.findByRole('menu');
    expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(within(panel).getByRole('menuitem', { name: /features/i })).toBeInTheDocument();
  });

  it('closes the panel when Esc is pressed', async () => {
    render(
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );

    const trigger = screen.getByRole('menuitem', { name: /product/i });
    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'));
  });

  it('toggles the panel back closed on a second click', async () => {
    render(
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const trigger = screen.getByRole('menuitem', { name: /product/i });
    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));
    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'));
  });
});

describe('NavigationMenu — keyboard (W3C Menubar pattern)', () => {
  it('moves focus between top-level items with ArrowRight / ArrowLeft', async () => {
    render(
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/a">Alpha</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/b">Bravo</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/c">Charlie</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const a = screen.getByRole('menuitem', { name: /alpha/i });
    const b = screen.getByRole('menuitem', { name: /bravo/i });
    const c = screen.getByRole('menuitem', { name: /charlie/i });

    a.focus();
    expect(document.activeElement).toBe(a);

    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(b);

    fireEvent.keyDown(b, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(c);

    // Wraps to first.
    fireEvent.keyDown(c, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(a);

    // Reverse direction.
    fireEvent.keyDown(a, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(c);
  });

  it('Home / End jump to first / last enabled item', () => {
    render(
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/a">Alpha</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/b">Bravo</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/c">Charlie</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const a = screen.getByRole('menuitem', { name: /alpha/i });
    const b = screen.getByRole('menuitem', { name: /bravo/i });
    const c = screen.getByRole('menuitem', { name: /charlie/i });

    b.focus();
    fireEvent.keyDown(b, { key: 'End' });
    expect(document.activeElement).toBe(c);

    fireEvent.keyDown(c, { key: 'Home' });
    expect(document.activeElement).toBe(a);
  });

  it('ArrowDown opens the panel and moves focus inside', async () => {
    render(
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
            <NavigationMenu.Link href="/changelog">Changelog</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const trigger = screen.getByRole('menuitem', { name: /product/i });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));

    const panel = await screen.findByRole('menu');
    const features = within(panel).getByRole('menuitem', { name: /features/i });
    await waitFor(() => expect(document.activeElement).toBe(features));
  });

  it('skips disabled items when arrow-navigating', () => {
    render(
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/a">Alpha</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item disabled>
          <NavigationMenu.Link href="/b">Bravo</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/c">Charlie</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const a = screen.getByRole('menuitem', { name: /alpha/i });
    const c = screen.getByRole('menuitem', { name: /charlie/i });
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(c);
  });

  it('type-to-search jumps to the first matching item', () => {
    render(
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/a">Apricot</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/b">Banana</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/c">Cherry</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const apricot = screen.getByRole('menuitem', { name: /apricot/i });
    const cherry = screen.getByRole('menuitem', { name: /cherry/i });
    apricot.focus();
    fireEvent.keyDown(apricot, { key: 'c' });
    expect(document.activeElement).toBe(cherry);
  });
});

describe('NavigationMenu — controlled value', () => {
  it('respects the controlled `value` prop', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <NavigationMenu value="product" onValueChange={onValueChange}>
        <NavigationMenu.Item value="product">
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    // Initial controlled state — open.
    const trigger = screen.getByRole('menuitem', { name: /product/i });
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));

    // Updating value=null externally closes the panel.
    rerender(
      <NavigationMenu value={null} onValueChange={onValueChange}>
        <NavigationMenu.Item value="product">
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'));
  });
});

describe('NavigationMenu — disabled items', () => {
  it('marks disabled triggers with aria-disabled', () => {
    render(
      <NavigationMenu>
        <NavigationMenu.Item disabled>
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu>,
    );
    const trigger = screen.getByRole('menuitem', { name: /product/i });
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
  });
});
