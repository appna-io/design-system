import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Breadcrumbs, type BreadcrumbsItemData } from '../src/Breadcrumbs';
import { renderWithTheme as render } from './utils';

const PATH_ITEMS: BreadcrumbsItemData[] = [
  { label: 'Home', href: '#home' },
  { label: 'Users', href: '#users' },
  { label: 'John Smith', href: '#users-123' },
  { label: 'Settings' },
];

describe('Breadcrumbs — rendering', () => {
  it('renders a nav with aria-label="Breadcrumb" by default', () => {
    render(<Breadcrumbs items={PATH_ITEMS} />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeInTheDocument();
  });

  it('supports overriding aria-label', () => {
    render(<Breadcrumbs items={PATH_ITEMS} aria-label="You are here" />);
    expect(screen.getByRole('navigation', { name: 'You are here' })).toBeInTheDocument();
  });

  it('wraps items in a single ordered list', () => {
    render(<Breadcrumbs items={PATH_ITEMS} />);
    const lists = screen.getAllByRole('list');
    expect(lists).toHaveLength(1);
    expect(lists[0]?.tagName).toBe('OL');
  });

  it('renders a link for each item with href', () => {
    render(<Breadcrumbs items={PATH_ITEMS} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#home');
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '#users');
    expect(screen.getByRole('link', { name: 'John Smith' })).toHaveAttribute('href', '#users-123');
  });

  it('renders the last item without href as the current page (no link, aria-current=page)', () => {
    render(<Breadcrumbs items={PATH_ITEMS} />);
    expect(screen.queryByRole('link', { name: 'Settings' })).toBeNull();
    const current = screen.getByText('Settings');
    expect(current.closest('[aria-current="page"]')).not.toBeNull();
  });

  it('accepts items that use `to` instead of `href` (router convention)', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/home' },
          { label: 'Now' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home');
  });

  it('flags an item as current via explicit `current: true` even with href', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '#home' },
          { label: 'Self', href: '#self', current: true },
        ]}
      />,
    );
    expect(screen.queryByRole('link', { name: 'Self' })).toBeNull();
    expect(screen.getByText('Self').closest('[aria-current="page"]')).not.toBeNull();
  });
});

describe('Breadcrumbs — separators', () => {
  it('renders the default "/" separator between items', () => {
    render(<Breadcrumbs items={PATH_ITEMS} />);
    const seps = document.querySelectorAll('[data-breadcrumbs-separator]');
    // 4 items → 3 separators
    expect(seps).toHaveLength(3);
    seps.forEach((sep) => {
      expect(sep.getAttribute('role')).toBe('presentation');
      expect(sep.getAttribute('aria-hidden')).toBe('true');
      expect(sep.textContent).toBe('/');
    });
  });

  it('supports a string separator override', () => {
    render(<Breadcrumbs items={PATH_ITEMS} separator="·" />);
    const seps = document.querySelectorAll('[data-breadcrumbs-separator]');
    seps.forEach((sep) => expect(sep.textContent).toBe('·'));
  });

  it('supports a React element separator', () => {
    render(
      <Breadcrumbs
        items={PATH_ITEMS}
        separator={<span data-testid="chev">→</span>}
      />,
    );
    expect(screen.getAllByTestId('chev')).toHaveLength(3);
  });
});

describe('Breadcrumbs — icons', () => {
  it('renders item icons next to the label', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '#home', icon: <span data-testid="home-icon">H</span> },
          { label: 'Now' },
        ]}
      />,
    );
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });
});

describe('Breadcrumbs — overflow / collapse', () => {
  const LONG_ITEMS: BreadcrumbsItemData[] = [
    { label: 'Home', href: '#home' },
    { label: 'Region', href: '#region' },
    { label: 'Country', href: '#country' },
    { label: 'City', href: '#city' },
    { label: 'District', href: '#district' },
    { label: 'Street', href: '#street' },
    { label: 'Address' },
  ];

  it('collapses the middle into an overflow trigger when maxItems is set', () => {
    render(<Breadcrumbs items={LONG_ITEMS} maxItems={4} />);

    // Default keeps 1 before + 1 after + overflow trigger; rest hidden.
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Region' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Country' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'City' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'District' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Street' })).toBeNull();

    // The current (last) item is still rendered as the current page.
    expect(screen.getByText('Address').closest('[aria-current="page"]')).not.toBeNull();

    // Overflow trigger is an ellipsis button with the documented aria-label.
    expect(
      screen.getByRole('button', { name: 'Show hidden navigation items' }),
    ).toBeInTheDocument();
  });

  it('reveals hidden items when the overflow menu opens', async () => {
    const user = userEvent.setup();
    render(<Breadcrumbs items={LONG_ITEMS} maxItems={4} />);

    await user.click(screen.getByRole('button', { name: 'Show hidden navigation items' }));

    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('Region')).toBeInTheDocument();
    expect(within(menu).getByText('Country')).toBeInTheDocument();
    expect(within(menu).getByText('City')).toBeInTheDocument();
    expect(within(menu).getByText('Street')).toBeInTheDocument();
  });

  it('renders no overflow when items fit', () => {
    render(<Breadcrumbs items={PATH_ITEMS} maxItems={10} />);
    expect(screen.queryByRole('button', { name: 'Show hidden navigation items' })).toBeNull();
  });

  it('supports a custom overflowAriaLabel', () => {
    render(
      <Breadcrumbs items={LONG_ITEMS} maxItems={4} overflowAriaLabel="More crumbs" />,
    );
    expect(screen.getByRole('button', { name: 'More crumbs' })).toBeInTheDocument();
  });

  it('honors itemsBeforeCollapse / itemsAfterCollapse', () => {
    render(
      <Breadcrumbs
        items={LONG_ITEMS}
        maxItems={5}
        itemsBeforeCollapse={2}
        itemsAfterCollapse={2}
      />,
    );

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Region' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Street' })).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();

    expect(screen.queryByRole('link', { name: 'Country' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'City' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'District' })).toBeNull();
  });
});

describe('Breadcrumbs — renderItem', () => {
  it('invokes renderItem for every visible crumb with the right context', () => {
    const calls: Array<{ label: string; isCurrent: boolean; index: number }> = [];
    render(
      <Breadcrumbs
        items={PATH_ITEMS}
        renderItem={({ item, isCurrent, index, defaultClassName }) => {
          calls.push({ label: String(item.label), isCurrent, index });
          return (
            <span data-classes={defaultClassName} data-current={isCurrent ? 'true' : 'false'}>
              {item.label}
            </span>
          );
        }}
      />,
    );

    expect(calls.map((c) => c.label)).toEqual(['Home', 'Users', 'John Smith', 'Settings']);
    expect(calls.map((c) => c.isCurrent)).toEqual([false, false, false, true]);
    expect(calls.map((c) => c.index)).toEqual([0, 1, 2, 3]);
  });
});

describe('Breadcrumbs — compound API', () => {
  it('renders nav + ol + items written as children', () => {
    render(
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

    expect(screen.getByRole('navigation', { name: 'Manual' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#home');
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '#docs');
    expect(screen.getByText('Page').closest('[aria-current="page"]')).not.toBeNull();
  });

  it('auto-inserts separators between compound items when none are present', () => {
    render(
      <Breadcrumbs separator="·">
        <Breadcrumbs.Item asChild>
          <a href="#a">A</a>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item asChild>
          <a href="#b">B</a>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item current>C</Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    const seps = document.querySelectorAll('[data-breadcrumbs-separator]');
    expect(seps).toHaveLength(2);
    seps.forEach((sep) => expect(sep.textContent).toBe('·'));
  });

  it('respects consumer-provided separators (no auto-weave when manual exists)', () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item asChild>
          <a href="#a">A</a>
        </Breadcrumbs.Item>
        <Breadcrumbs.Separator>→</Breadcrumbs.Separator>
        <Breadcrumbs.Item asChild>
          <a href="#b">B</a>
        </Breadcrumbs.Item>
        <Breadcrumbs.Separator>→</Breadcrumbs.Separator>
        <Breadcrumbs.Item current>C</Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    const seps = document.querySelectorAll('[data-breadcrumbs-separator]');
    expect(seps).toHaveLength(2);
    seps.forEach((sep) => expect(sep.textContent).toBe('→'));
  });
});

describe('Breadcrumbs — asChild polymorphism', () => {
  it('merges recipe className onto the child element', () => {
    render(
      <Breadcrumbs aria-label="poly">
        <Breadcrumbs.Item asChild>
          <a href="#foo" data-testid="anchor" className="my-custom-class">
            Foo
          </a>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item current>Bar</Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    const anchor = screen.getByTestId('anchor');
    expect(anchor.tagName).toBe('A');
    expect(anchor.className).toContain('my-custom-class');
    expect(anchor.className.length).toBeGreaterThan('my-custom-class'.length);
  });

  it('keeps user click handlers on the asChild element', () => {
    let clicked = 0;
    render(
      <Breadcrumbs aria-label="click">
        <Breadcrumbs.Item asChild>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              clicked++;
            }}
          >
            Click
          </a>
        </Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Click' }));
    expect(clicked).toBe(1);
  });
});

describe('Breadcrumbs — ref / DOM', () => {
  it('forwards ref to the underlying <nav>', () => {
    const ref = createRef<HTMLElement>();
    render(<Breadcrumbs ref={ref} items={PATH_ITEMS} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('forwards arbitrary HTML attributes onto the <nav>', () => {
    render(<Breadcrumbs items={PATH_ITEMS} data-testid="nav-root" />);
    expect(screen.getByTestId('nav-root').tagName).toBe('NAV');
  });
});