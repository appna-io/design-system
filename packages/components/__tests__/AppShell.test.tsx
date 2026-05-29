import { fireEvent, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AppShell, useAppShell } from '../src/AppShell';
import { renderWithTheme as render } from './utils';

describe('AppShell — root rendering', () => {
  it('renders main landmark with tabIndex=-1', () => {
    render(
      <AppShell aria-label="Test shell">
        <div>page content</div>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main.getAttribute('tabindex')).toBe('-1');
    expect(main.textContent).toBe('page content');
  });

  it('renders the skip-to-content link by default', () => {
    render(
      <AppShell>
        <div>content</div>
      </AppShell>,
    );
    const link = screen.getByText('Skip to content');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toMatch(/^#/);
  });

  it('omits the skip-to-content link when skipToContent=false', () => {
    render(
      <AppShell skipToContent={false}>
        <div>content</div>
      </AppShell>,
    );
    expect(screen.queryByText('Skip to content')).toBeNull();
  });

  it('uses a custom skipToContentLabel', () => {
    render(
      <AppShell skipToContentLabel="Jump to body">
        <div>content</div>
      </AppShell>,
    );
    expect(screen.getByText('Jump to body')).toBeInTheDocument();
  });

  it('forwards ref to the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AppShell ref={ref}>
        <div>content</div>
      </AppShell>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders the header slot inside a <header> landmark', () => {
    render(
      <AppShell header={<span data-testid="hdr">Top bar</span>}>
        <div>content</div>
      </AppShell>,
    );
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
    expect(banner.querySelector('[data-testid="hdr"]')).not.toBeNull();
  });

  it('renders the sidebar slot inside an <aside> with the default label', () => {
    render(
      <AppShell sidebar={<nav>side</nav>}>
        <div>content</div>
      </AppShell>,
    );
    const side = screen.getByRole('complementary', { name: 'Primary navigation' });
    expect(side).toBeInTheDocument();
  });

  it('uses a custom sidebarLabel', () => {
    render(
      <AppShell sidebar={<nav>side</nav>} sidebarLabel="Main menu">
        <div>content</div>
      </AppShell>,
    );
    expect(screen.getByRole('complementary', { name: 'Main menu' })).toBeInTheDocument();
  });

  it('renders the aside slot when asideOpen is true', () => {
    render(
      <AppShell
        sidebar={<nav>side</nav>}
        aside={<div>details</div>}
        defaultAsideOpen={true}
      >
        <div>content</div>
      </AppShell>,
    );
    expect(screen.getByRole('complementary', { name: 'Details' })).toBeInTheDocument();
  });

  it('does NOT render the aside when asideOpen is false', () => {
    render(
      <AppShell
        sidebar={<nav>side</nav>}
        aside={<div>details</div>}
        defaultAsideOpen={false}
      >
        <div>content</div>
      </AppShell>,
    );
    expect(screen.queryByRole('complementary', { name: 'Details' })).toBeNull();
  });

  it('renders the footer slot inside a <footer> landmark', () => {
    render(
      <AppShell footer={<span>© 2026</span>}>
        <div>content</div>
      </AppShell>,
    );
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer.textContent).toContain('© 2026');
  });

  it('emits data-layout and data-sidebar-position attributes', () => {
    render(
      <AppShell
        layout="inset"
        sidebar={<nav>s</nav>}
        sidebarPosition="end"
        data-testid="root"
      >
        <div>c</div>
      </AppShell>,
    );
    const root = screen.getByTestId('root');
    expect(root.getAttribute('data-layout')).toBe('inset');
    expect(root.getAttribute('data-sidebar-position')).toBe('end');
  });
});

describe('AppShell — grid template', () => {
  it('applies a 1-column grid when no sidebar or aside is present', () => {
    render(
      <AppShell header={<span>h</span>} data-testid="root">
        <div>c</div>
      </AppShell>,
    );
    const root = screen.getByTestId('root');
    expect(root.style.gridTemplateColumns).toBe('1fr');
  });

  it('applies a 2-column grid when sidebar is present', () => {
    render(
      <AppShell sidebar={<nav>s</nav>} sidebarWidth={200} data-testid="root">
        <div>c</div>
      </AppShell>,
    );
    const root = screen.getByTestId('root');
    expect(root.style.gridTemplateColumns).toBe('200px 1fr');
  });

  it('applies a 3-column grid when both sidebar and aside are present', () => {
    render(
      <AppShell
        sidebar={<nav>s</nav>}
        aside={<div>a</div>}
        sidebarWidth={240}
        asideWidth={300}
        defaultAsideOpen
        data-testid="root"
      >
        <div>c</div>
      </AppShell>,
    );
    const root = screen.getByTestId('root');
    expect(root.style.gridTemplateColumns).toBe('240px 1fr 300px');
  });

  it('flips sidebar to the end column when sidebarPosition=end', () => {
    render(
      <AppShell sidebar={<nav>s</nav>} sidebarPosition="end" sidebarWidth={220} data-testid="root">
        <div>c</div>
      </AppShell>,
    );
    const root = screen.getByTestId('root');
    expect(root.style.gridTemplateColumns).toBe('1fr 220px');
  });

  it('applies rail-collapsed width when sidebarCollapsed is true', () => {
    render(
      <AppShell
        sidebar={<nav>s</nav>}
        sidebarWidth={260}
        sidebarCollapsedWidth={64}
        defaultSidebarCollapsed
        data-testid="root"
      >
        <div>c</div>
      </AppShell>,
    );
    const root = screen.getByTestId('root');
    expect(root.style.gridTemplateColumns).toBe('64px 1fr');
  });
});

describe('AppShell — main content config', () => {
  it('defaults to p-6 padding', () => {
    render(
      <AppShell>
        <div>content</div>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    expect(main.className).toContain('p-6');
  });

  it('applies a custom padding from main.padding', () => {
    render(
      <AppShell main={{ padding: 2 }}>
        <div>content</div>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    expect(main.className).toContain('p-2');
  });

  it('applies a custom maxWidth from main.maxWidth', () => {
    render(
      <AppShell main={{ maxWidth: '7xl' }}>
        <div>content</div>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    expect(main.className).toContain('max-w-7xl');
  });

  it('centers main when maxWidth != full and centered=true', () => {
    render(
      <AppShell main={{ maxWidth: '2xl', centered: true }}>
        <div>content</div>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    expect(main.className).toContain('mx-auto');
  });

  it('does NOT center main when maxWidth=full', () => {
    render(
      <AppShell main={{ maxWidth: 'full', centered: true }}>
        <div>content</div>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    expect(main.className).not.toContain('mx-auto');
  });
});

describe('AppShell — header config', () => {
  it('applies headerOffset as paddingTop on the root', () => {
    render(
      <AppShell header={<span>h</span>} headerOffset={28} data-testid="root">
        <div>c</div>
      </AppShell>,
    );
    const root = screen.getByTestId('root');
    expect(root.style.paddingTop).toBe('28px');
  });

  it('applies the floating header variant chrome', () => {
    render(
      <AppShell header={<span>h</span>} headerVariant="floating">
        <div>c</div>
      </AppShell>,
    );
    const header = screen.getByRole('banner');
    expect(header.className).toMatch(/shadow/);
    expect(header.className).toMatch(/rounded/);
  });

  it('applies headerSticky=false to remove sticky positioning', () => {
    render(
      <AppShell header={<span>h</span>} headerSticky={false}>
        <div>c</div>
      </AppShell>,
    );
    const header = screen.getByRole('banner');
    expect(header.className).not.toContain('sticky');
  });
});

describe('AppShell — useAppShell hook', () => {
  function HamburgerHeader() {
    const { toggleSidebar, isSidebarCollapsed, isMobile } = useAppShell();
    return (
      <button type="button" onClick={toggleSidebar} data-testid="hamburger">
        {isMobile ? 'mobile' : isSidebarCollapsed ? 'expand' : 'collapse'}
      </button>
    );
  }

  it('toggles desktop rail-collapse via toggleSidebar', () => {
    render(
      <AppShell header={<HamburgerHeader />} sidebar={<nav>s</nav>}>
        <div>c</div>
      </AppShell>,
    );
    const btn = screen.getByTestId('hamburger');
    expect(btn.textContent).toBe('collapse');
    fireEvent.click(btn);
    expect(btn.textContent).toBe('expand');
    fireEvent.click(btn);
    expect(btn.textContent).toBe('collapse');
  });

  it('throws when called outside an AppShell', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Solo() {
      useAppShell();
      return null;
    }
    expect(() => render(<Solo />)).toThrow(/useAppShell/);
    spy.mockRestore();
  });

  it('exposes openAside / closeAside / toggleAside helpers', () => {
    function Toggler() {
      const { isAsideOpen, toggleAside, openAside, closeAside } = useAppShell();
      return (
        <div>
          <span data-testid="state">{String(isAsideOpen)}</span>
          <button type="button" onClick={toggleAside} data-testid="toggle">t</button>
          <button type="button" onClick={openAside} data-testid="open">o</button>
          <button type="button" onClick={closeAside} data-testid="close">c</button>
        </div>
      );
    }
    render(
      <AppShell header={<Toggler />} sidebar={<nav>s</nav>} aside={<div>a</div>}>
        <div>c</div>
      </AppShell>,
    );
    expect(screen.getByTestId('state').textContent).toBe('true');
    fireEvent.click(screen.getByTestId('close'));
    expect(screen.getByTestId('state').textContent).toBe('false');
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('state').textContent).toBe('true');
  });
});

describe('AppShell — controlled state', () => {
  it('respects controlled sidebarCollapsed', () => {
    function Harness() {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <AppShell
          sidebar={<nav>s</nav>}
          sidebarWidth={200}
          sidebarCollapsedWidth={48}
          sidebarCollapsed={collapsed}
          onSidebarCollapsedChange={setCollapsed}
          data-testid="root"
        >
          <button
            type="button"
            data-testid="ext"
            onClick={() => setCollapsed((c) => !c)}
          >
            toggle
          </button>
        </AppShell>
      );
    }
    render(<Harness />);
    const root = screen.getByTestId('root');
    expect(root.style.gridTemplateColumns).toBe('200px 1fr');
    fireEvent.click(screen.getByTestId('ext'));
    expect(root.style.gridTemplateColumns).toBe('48px 1fr');
  });
});

describe('AppShell — skip-to-content link', () => {
  it('focuses the main landmark when clicked', () => {
    render(
      <AppShell>
        <div>content</div>
      </AppShell>,
    );
    const link = screen.getByText('Skip to content');
    fireEvent.click(link);
    expect(document.activeElement).toBe(screen.getByRole('main'));
  });
});
