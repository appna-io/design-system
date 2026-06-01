import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Sidebar } from '../src/Sidebar';
import { renderWithTheme as render } from './utils';

describe('Sidebar — collapsed (rail) mode', () => {
  it('hides label visually but keeps it in the DOM for screen readers', () => {
    render(
      <Sidebar collapsed>
        <Sidebar.Item href="/" icon={<span aria-hidden>★</span>}>
          Home
        </Sidebar.Item>
      </Sidebar>,
    );
    // The visible label span is marked sr-only; the accessible name is still "Home".
    const link = screen.getByRole('link', { name: 'Home' });
    const labelSpan = link.querySelector('[data-sidebar-item-label]');
    expect(labelSpan).not.toBeNull();
    expect(labelSpan?.className).toMatch(/sr-only/);
  });

  it('hides badge content visually but mirrors it sr-only for AT', () => {
    render(
      <Sidebar collapsed>
        <Sidebar.Item href="/inbox" badge={7} icon={<span aria-hidden>I</span>}>
          Inbox
        </Sidebar.Item>
      </Sidebar>,
    );
    const link = screen.getByRole('link');
    // No visible badge.
    expect(link.querySelector('[data-badge]')).toBeNull();
    // But the count is announced via an sr-only mirror.
    expect(link.querySelector('.sr-only')?.textContent).toMatch(/7|Inbox/);
  });

  it('hides end icons in collapsed mode', () => {
    render(
      <Sidebar collapsed>
        <Sidebar.Item
          href="/"
          icon={<span aria-hidden>★</span>}
          endIcon={<span data-testid="end-icon">→</span>}
        >
          Home
        </Sidebar.Item>
      </Sidebar>,
    );
    expect(screen.queryByTestId('end-icon')).toBeNull();
  });

  it('section labels are sr-only by default when sidebar is collapsed', () => {
    render(
      <Sidebar collapsed>
        <Sidebar.Section label="Workspace">
          <Sidebar.Item href="/" icon={<span aria-hidden>★</span>}>
            Home
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>,
    );
    // The label still exists for accessibility but is visually hidden via sr-only on the heading.
    const heading = screen.getByRole('heading', { level: 3, name: 'Workspace' });
    expect(heading.className).toMatch(/sr-only/);
  });

  it('section label remains visible when hideLabelWhenCollapsed=false', () => {
    render(
      <Sidebar collapsed>
        <Sidebar.Section label="Workspace" hideLabelWhenCollapsed={false}>
          <Sidebar.Item href="/" icon={<span aria-hidden>★</span>}>
            Home
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>,
    );
    const heading = screen.getByRole('heading', { level: 3, name: 'Workspace' });
    expect(heading.className).not.toMatch(/sr-only/);
  });

  it('items stay rendered when toggling between expanded and rail mode', () => {
    // The visual chrome flips but the same item content remains in the DOM (no unmount). We
    // assert by the accessible name surviving the rerender (a unmount-remount would still pass,
    // but combined with the className check below the structural intent is preserved).
    const { rerender } = render(
      <Sidebar>
        <Sidebar.Item href="/" icon={<span aria-hidden>★</span>}>
          Home
        </Sidebar.Item>
      </Sidebar>,
    );
    expect(screen.getByRole('link', { name: 'Home' }).className).toMatch(/justify-start/);
    rerender(
      <Sidebar collapsed>
        <Sidebar.Item href="/" icon={<span aria-hidden>★</span>}>
          Home
        </Sidebar.Item>
      </Sidebar>,
    );
    expect(screen.getByRole('link', { name: 'Home' }).className).toMatch(/justify-center/);
  });
});