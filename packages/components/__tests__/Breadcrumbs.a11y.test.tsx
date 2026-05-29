import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import {
  Breadcrumbs,
  type BreadcrumbsColor,
  type BreadcrumbsItemData,
  type BreadcrumbsVariant,
} from '../src/Breadcrumbs';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const SIMPLE: BreadcrumbsItemData[] = [
  { label: 'Home', href: '#home' },
  { label: 'Library', href: '#library' },
  { label: 'Album' },
];

const LONG: BreadcrumbsItemData[] = [
  { label: 'Home', href: '#home' },
  { label: 'A', href: '#a' },
  { label: 'B', href: '#b' },
  { label: 'C', href: '#c' },
  { label: 'D', href: '#d' },
  { label: 'Now' },
];

const VARIANTS: BreadcrumbsVariant[] = ['ghost', 'soft', 'underline'];
const COLORS: BreadcrumbsColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

describe('Breadcrumbs — a11y axe', () => {
  it('default ghost passes axe', async () => {
    const { container } = render(<Breadcrumbs items={SIMPLE} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('compound API passes axe', async () => {
    const { container } = render(
      <Breadcrumbs aria-label="Manual">
        <Breadcrumbs.Item asChild>
          <a href="#home">Home</a>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item asChild>
          <a href="#docs">Docs</a>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item current>Page</Breadcrumbs.Item>
      </Breadcrumbs>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('with custom separator element passes axe', async () => {
    const { container } = render(
      <Breadcrumbs
        items={SIMPLE}
        separator={<span data-testid="chev">→</span>}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('overflow / collapsed crumbs pass axe', async () => {
    const { container } = render(<Breadcrumbs items={LONG} maxItems={4} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`variant=${variant} color=${color} passes axe`, async () => {
        const { container } = render(
          <Breadcrumbs items={SIMPLE} variant={variant} color={color} />,
        );
        expect(await axe(container)).toHaveNoViolations();
      });
    }
  }
});

describe('Breadcrumbs — semantic structure', () => {
  it('uses <nav> + <ol> + <li> for assistive tech', () => {
    const { container } = render(<Breadcrumbs items={SIMPLE} />);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb');

    const ol = nav?.querySelector('ol');
    expect(ol).not.toBeNull();

    const items = ol?.querySelectorAll('li[data-breadcrumbs-item]');
    expect(items?.length).toBe(3);

    const seps = ol?.querySelectorAll('li[data-breadcrumbs-separator]');
    expect(seps?.length).toBe(2);
    seps?.forEach((sep) => {
      expect(sep.getAttribute('role')).toBe('presentation');
      expect(sep.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('paints aria-current="page" on the current item', () => {
    const { container } = render(<Breadcrumbs items={SIMPLE} />);
    const current = container.querySelector('[aria-current="page"]');
    expect(current).not.toBeNull();
    expect(current?.textContent).toContain('Album');

    const allCurrents = container.querySelectorAll('[aria-current="page"]');
    expect(allCurrents.length).toBe(1);
  });

  it('does NOT paint aria-current on link items', () => {
    const { container } = render(<Breadcrumbs items={SIMPLE} />);
    const links = container.querySelectorAll('a');
    links.forEach((link) => {
      expect(link.hasAttribute('aria-current')).toBe(false);
    });
  });
});
