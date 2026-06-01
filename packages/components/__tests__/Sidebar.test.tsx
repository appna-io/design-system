import { fireEvent, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Sidebar } from '../src/Sidebar';
import { renderWithTheme as render } from './utils';

describe('Sidebar — root rendering', () => {
  it('renders as a <nav> landmark with default aria-label', () => {
    render(
      <Sidebar>
        <Sidebar.Item href="/">Home</Sidebar.Item>
      </Sidebar>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav.getAttribute('aria-label')).toBe('Sidebar');
    expect(nav.tagName).toBe('NAV');
  });

  it('accepts a custom ariaLabel', () => {
    render(
      <Sidebar ariaLabel="Workspace navigation">
        <Sidebar.Item href="/">Home</Sidebar.Item>
      </Sidebar>,
    );
    expect(screen.getByRole('navigation').getAttribute('aria-label')).toBe('Workspace navigation');
  });

  it('respects ariaLabelledBy in place of ariaLabel', () => {
    render(
      <>
        <h2 id="sidebar-heading">Main</h2>
        <Sidebar ariaLabelledBy="sidebar-heading">
          <Sidebar.Item href="/">Home</Sidebar.Item>
        </Sidebar>
      </>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav.getAttribute('aria-labelledby')).toBe('sidebar-heading');
    expect(nav.getAttribute('aria-label')).toBeNull();
  });

  it('forwards ref to the <nav> element', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Sidebar ref={ref}>
        <Sidebar.Item href="/">Home</Sidebar.Item>
      </Sidebar>,
    );
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('applies width / collapsedWidth inline styles based on collapsed state', () => {
    const { rerender } = render(
      <Sidebar width={260} collapsedWidth={64}>
        <Sidebar.Item href="/">Home</Sidebar.Item>
      </Sidebar>,
    );
    expect(screen.getByRole('navigation').style.width).toBe('260px');

    rerender(
      <Sidebar width={260} collapsedWidth={64} collapsed>
        <Sidebar.Item href="/">Home</Sidebar.Item>
      </Sidebar>,
    );
    expect(screen.getByRole('navigation').style.width).toBe('64px');
  });

  it('sets data attributes for variant / size / collapsed / position', () => {
    render(
      <Sidebar variant="bordered" size="lg" collapsed position="end">
        <Sidebar.Item icon={<span data-testid="icon">★</span>} href="/">
          Home
        </Sidebar.Item>
      </Sidebar>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav.getAttribute('data-variant')).toBe('bordered');
    expect(nav.getAttribute('data-size')).toBe('lg');
    expect(nav.getAttribute('data-position')).toBe('end');
    expect(nav.getAttribute('data-collapsed')).toBe('true');
  });
});

describe('Sidebar.Header / Sidebar.Footer / Sidebar.Spacer', () => {
  it('renders each subpart with its data marker', () => {
    render(
      <Sidebar>
        <Sidebar.Header>
          <span>logo</span>
        </Sidebar.Header>
        <Sidebar.Item href="/">Home</Sidebar.Item>
        <Sidebar.Spacer />
        <Sidebar.Footer>
          <span>profile</span>
        </Sidebar.Footer>
      </Sidebar>,
    );
    expect(document.querySelector('[data-sidebar-header]')).not.toBeNull();
    expect(document.querySelector('[data-sidebar-footer]')).not.toBeNull();
    expect(document.querySelector('[data-sidebar-spacer]')).not.toBeNull();
  });

  it('Sidebar.Header throws when used outside Sidebar', () => {
    // React logs the error; we silence it for the test.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <Sidebar.Header>
          <span>orphan</span>
        </Sidebar.Header>,
      ),
    ).toThrow(/must be used inside <Sidebar>/);
    spy.mockRestore();
  });

  it('Sidebar.Spacer renders as aria-hidden filler', () => {
    render(
      <Sidebar>
        <Sidebar.Item href="/">Home</Sidebar.Item>
        <Sidebar.Spacer data-testid="spacer" />
      </Sidebar>,
    );
    const spacer = screen.getByTestId('spacer');
    expect(spacer.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('Sidebar.Item — element shape selection', () => {
  it('renders as <a> when href is set', () => {
    render(
      <Sidebar>
        <Sidebar.Item href="/inbox">Inbox</Sidebar.Item>
      </Sidebar>,
    );
    const link = screen.getByRole('link', { name: 'Inbox' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/inbox');
  });

  it('renders as <button> when only onClick is set', () => {
    render(
      <Sidebar>
        <Sidebar.Item onClick={() => undefined}>Compose</Sidebar.Item>
      </Sidebar>,
    );
    const button = screen.getByRole('button', { name: 'Compose' });
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders the consumer element when asChild is used', () => {
    render(
      <Sidebar>
        <Sidebar.Item asChild>
          {/* This is a stand-in for a router Link */}
          <a href="/router-link" data-testid="router-link">
            Router target
          </a>
        </Sidebar.Item>
      </Sidebar>,
    );
    const link = screen.getByTestId('router-link');
    expect(link.getAttribute('href')).toBe('/router-link');
    expect(link.tagName).toBe('A');
  });

  it('expandable items render as <button aria-expanded>', () => {
    render(
      <Sidebar>
        <Sidebar.Item expandable>
          Documents
          <Sidebar.SubItems>
            <Sidebar.Item href="/docs/intro">Intro</Sidebar.Item>
          </Sidebar.SubItems>
        </Sidebar.Item>
      </Sidebar>,
    );
    const trigger = screen.getByRole('button', { name: /Documents/ });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('Sidebar.Item — badges, icons, end icons', () => {
  it('renders a Badge after the label when badge is set', () => {
    render(
      <Sidebar>
        <Sidebar.Item href="/inbox" badge={3}>
          Inbox
        </Sidebar.Item>
      </Sidebar>,
    );
    const link = screen.getByRole('link', { name: /Inbox/ });
    expect(within(link).getByText('3')).toBeInTheDocument();
  });

  it('renders leading icon and end icon', () => {
    render(
      <Sidebar>
        <Sidebar.Item
          href="/"
          icon={<span data-testid="lead-icon">L</span>}
          endIcon={<span data-testid="end-icon">E</span>}
        >
          Home
        </Sidebar.Item>
      </Sidebar>,
    );
    expect(screen.getByTestId('lead-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('disabled items get aria-disabled and tabIndex=-1', () => {
    render(
      <Sidebar>
        <Sidebar.Item href="/x" disabled>
          Disabled
        </Sidebar.Item>
      </Sidebar>,
    );
    const link = screen.getByRole('link', { name: 'Disabled' });
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
  });

  it('disabled items neutralize click handlers', () => {
    const onClick = vi.fn();
    render(
      <Sidebar>
        <Sidebar.Item href="/x" disabled onClick={onClick}>
          Disabled
        </Sidebar.Item>
      </Sidebar>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Disabled' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Sidebar.Item — context misuse', () => {
  it('throws when used outside <Sidebar>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Sidebar.Item href="/">orphan</Sidebar.Item>)).toThrow(
      /must be used inside <Sidebar>/,
    );
    spy.mockRestore();
  });
});

describe('Sidebar — slot composition', () => {
  it('renders a full sidebar with header, sections, items, spacer, footer in order', () => {
    render(
      <Sidebar ariaLabel="Full">
        <Sidebar.Header>
          <span data-testid="logo">Logo</span>
        </Sidebar.Header>
        <Sidebar.Section label="Workspace">
          <Sidebar.Item href="/">Home</Sidebar.Item>
          <Sidebar.Item href="/inbox" badge={5}>
            Inbox
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Spacer />
        <Sidebar.Footer>
          <span data-testid="profile">Profile</span>
        </Sidebar.Footer>
      </Sidebar>,
    );

    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inbox/ })).toBeInTheDocument();
    expect(screen.getByTestId('profile')).toBeInTheDocument();
  });
});