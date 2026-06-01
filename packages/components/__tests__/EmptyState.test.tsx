import { fireEvent, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../src/Button/Button';
import { EmptyState } from '../src/EmptyState';
import { renderWithTheme as render } from './utils';

const VARIANTS = ['default', 'error', 'loading', 'success'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

describe('EmptyState — prop-driven API', () => {
  it('renders a <section> with the title text and default region role', () => {
    render(
      <EmptyState
        data-testid="root"
        title="No users yet"
        description="Invite teammates to get started."
      />,
    );
    const root = screen.getByTestId('root');
    expect(root.tagName).toBe('SECTION');
    expect(root).toHaveAttribute('role', 'region');
    expect(screen.getByText('No users yet')).toBeInTheDocument();
    expect(screen.getByText('Invite teammates to get started.')).toBeInTheDocument();
  });

  it('wires aria-labelledby + aria-describedby to the auto-rendered Title/Description', () => {
    render(
      <EmptyState
        data-testid="root"
        title="Inbox zero"
        description="Take a break."
      />,
    );
    const root = screen.getByTestId('root');
    const labelledBy = root.getAttribute('aria-labelledby');
    const describedBy = root.getAttribute('aria-describedby');
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    const title = root.querySelector(`#${CSS.escape(labelledBy!)}`);
    const desc = root.querySelector(`#${CSS.escape(describedBy!)}`);
    expect(title?.textContent).toBe('Inbox zero');
    expect(desc?.textContent).toBe('Take a break.');
  });

  it('renders title as <h3> by default', () => {
    render(<EmptyState data-testid="root" title="No data" />);
    const root = screen.getByTestId('root');
    expect(root.querySelector('h3')?.textContent).toBe('No data');
  });

  it('renders description as <p> by default', () => {
    render(<EmptyState data-testid="root" title="X" description="A short paragraph." />);
    const root = screen.getByTestId('root');
    expect(root.querySelector('p')?.textContent).toBe('A short paragraph.');
  });

  it('renders the icon inside an aria-hidden circular container', () => {
    render(
      <EmptyState
        data-testid="root"
        icon={<svg data-testid="icon-svg" />}
        title="Test"
      />,
    );
    const iconSvg = screen.getByTestId('icon-svg');
    const iconContainer = iconSvg.parentElement!;
    expect(iconContainer.getAttribute('aria-hidden')).toBe('true');
    expect(iconContainer.className).toContain('rounded-full');
  });

  it('illustration wins when both icon and illustration are set', () => {
    render(
      <EmptyState
        data-testid="root"
        icon={<svg data-testid="icon-svg" />}
        illustration={<svg data-testid="illus-svg" />}
        title="Test"
      />,
    );
    expect(screen.queryByTestId('icon-svg')).toBeNull();
    expect(screen.getByTestId('illus-svg')).toBeInTheDocument();
  });

  it('forwards a ref to the root element', () => {
    const ref = createRef<HTMLElement>();
    render(<EmptyState ref={ref} data-testid="root" title="Ref test" />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('SECTION');
  });

  it('respects the `as` prop for the root element', () => {
    render(<EmptyState as="div" data-testid="root" title="Custom root" />);
    expect(screen.getByTestId('root').tagName).toBe('DIV');
  });

  it('emits stable data-variant + data-size attributes', () => {
    for (const variant of VARIANTS) {
      for (const size of SIZES) {
        const { unmount } = render(
          <EmptyState data-testid="root" variant={variant} size={size} title="x" />,
        );
        const root = screen.getByTestId('root');
        expect(root.getAttribute('data-variant')).toBe(variant);
        expect(root.getAttribute('data-size')).toBe(size);
        unmount();
      }
    }
  });

  it('bordered=true wraps the root in a dashed border', () => {
    render(<EmptyState data-testid="root" bordered title="x" />);
    const root = screen.getByTestId('root');
    expect(root.className).toContain('border-dashed');
    expect(root.className).toContain('rounded-lg');
  });

  it('padded=false removes vertical padding', () => {
    render(<EmptyState data-testid="root" padded={false} title="x" />);
    const root = screen.getByTestId('root');
    expect(root.className).toContain('p-0');
  });
});

describe('EmptyState — variant ARIA mapping', () => {
  it('default variant uses role=region (no aria-busy/aria-live)', () => {
    render(<EmptyState data-testid="root" title="X" />);
    const root = screen.getByTestId('root');
    expect(root.getAttribute('role')).toBe('region');
    expect(root).not.toHaveAttribute('aria-busy');
    expect(root).not.toHaveAttribute('aria-live');
  });

  it('error variant uses role=alert', () => {
    render(<EmptyState data-testid="root" variant="error" title="Boom" />);
    const root = screen.getByTestId('root');
    expect(root.getAttribute('role')).toBe('alert');
  });

  it('loading variant uses role=status + aria-busy + aria-live', () => {
    render(<EmptyState data-testid="root" variant="loading" title="Wait" />);
    const root = screen.getByTestId('root');
    expect(root.getAttribute('role')).toBe('status');
    expect(root.getAttribute('aria-busy')).toBe('true');
    expect(root.getAttribute('aria-live')).toBe('polite');
  });

  it('success variant uses role=region', () => {
    render(<EmptyState data-testid="root" variant="success" title="Done" />);
    const root = screen.getByTestId('root');
    expect(root.getAttribute('role')).toBe('region');
  });

  it('loading variant auto-injects a Spinner when no icon/illustration is provided', () => {
    render(<EmptyState data-testid="root" variant="loading" title="Loading" />);
    const root = screen.getByTestId('root');
    // querySelectorAll inspects descendants only — the wrapper's own `role=status` isn't
    // counted, so exactly one descendant with `role=status` proves the Spinner injected.
    const innerStatus = root.querySelectorAll('[role="status"]');
    expect(innerStatus.length).toBe(1);
  });

  it('loading variant does NOT auto-inject Spinner when an icon is provided', () => {
    render(
      <EmptyState
        data-testid="root"
        variant="loading"
        icon={<svg data-testid="custom-icon" />}
        title="Loading"
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    // No Spinner descendant. (The wrapper's own role=status isn't counted by querySelectorAll.)
    expect(screen.getByTestId('root').querySelectorAll('[role="status"]').length).toBe(0);
  });
});

describe('EmptyState — action shortcuts', () => {
  it('primaryAction renders a <button> and invokes onClick', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        data-testid="root"
        title="x"
        primaryAction={{ label: 'Go', onClick }}
      />,
    );
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn.tagName).toBe('BUTTON');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('primaryAction with href renders an <a> with the right href', () => {
    render(
      <EmptyState
        data-testid="root"
        title="x"
        primaryAction={{ label: 'Docs', href: '/docs' }}
      />,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/docs');
  });

  it('href + target=_blank auto-injects rel=noopener noreferrer', () => {
    render(
      <EmptyState
        data-testid="root"
        title="x"
        primaryAction={{ label: 'External', href: 'https://example.com', target: '_blank' }}
      />,
    );
    const link = screen.getByRole('link', { name: 'External' });
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('explicit rel always wins over the auto-injected one', () => {
    render(
      <EmptyState
        data-testid="root"
        title="x"
        primaryAction={{
          label: 'External',
          href: 'https://example.com',
          target: '_blank',
          rel: 'me',
        }}
      />,
    );
    const link = screen.getByRole('link', { name: 'External' });
    expect(link.getAttribute('rel')).toBe('me');
  });

  it('both actions render in the Actions row', () => {
    render(
      <EmptyState
        data-testid="root"
        title="x"
        primaryAction={{ label: 'Primary', onClick: () => {} }}
        secondaryAction={{ label: 'Secondary', href: '/x' }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Secondary' })).toBeInTheDocument();
  });
});

describe('EmptyState — compound API', () => {
  it('renders compound subparts and ignores prop-driven shortcuts in that mode', () => {
    render(
      <EmptyState
        data-testid="root"
        title="ignored-title"
        description="ignored-desc"
        icon={<svg data-testid="ignored-icon" />}
        primaryAction={{ label: 'ignored-action', onClick: () => {} }}
      >
        <EmptyState.Icon>
          <svg data-testid="compound-icon" />
        </EmptyState.Icon>
        <EmptyState.Title>Compound title</EmptyState.Title>
        <EmptyState.Description>Compound description</EmptyState.Description>
        <EmptyState.Actions>
          <Button>Compound action</Button>
        </EmptyState.Actions>
      </EmptyState>,
    );
    expect(screen.queryByText('ignored-title')).toBeNull();
    expect(screen.queryByText('ignored-desc')).toBeNull();
    expect(screen.queryByTestId('ignored-icon')).toBeNull();
    expect(screen.queryByRole('button', { name: 'ignored-action' })).toBeNull();
    expect(screen.getByText('Compound title')).toBeInTheDocument();
    expect(screen.getByText('Compound description')).toBeInTheDocument();
    expect(screen.getByTestId('compound-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compound action' })).toBeInTheDocument();
  });

  it('EmptyState.Title supports the `as` override', () => {
    render(
      <EmptyState data-testid="root">
        <EmptyState.Title as="h2">Big title</EmptyState.Title>
      </EmptyState>,
    );
    const root = screen.getByTestId('root');
    expect(root.querySelector('h2')?.textContent).toBe('Big title');
  });

  it('EmptyState.Icon container picks up the variant tint via context', () => {
    render(
      <EmptyState data-testid="root" variant="error">
        <EmptyState.Icon data-testid="icon">
          <svg />
        </EmptyState.Icon>
        <EmptyState.Title>x</EmptyState.Title>
      </EmptyState>,
    );
    const iconContainer = screen.getByTestId('icon');
    expect(iconContainer.className).toContain('bg-danger-subtle');
    expect(iconContainer.className).toContain('text-danger');
  });

  it('EmptyState.Title picks up the size tint via context', () => {
    render(
      <EmptyState data-testid="root" size="lg">
        <EmptyState.Title data-testid="title">x</EmptyState.Title>
      </EmptyState>,
    );
    expect(screen.getByTestId('title').className).toContain('text-xl');
  });

  it('subparts render correctly OUTSIDE an EmptyState (default context kicks in)', () => {
    render(<EmptyState.Title data-testid="orphan-title">Orphan</EmptyState.Title>);
    const node = screen.getByTestId('orphan-title');
    expect(node.tagName).toBe('H3');
    expect(node.className).toContain('text-lg');
  });
});

describe('EmptyState — consumer ARIA overrides', () => {
  it('consumer aria-label wins over auto-labelledby', () => {
    render(
      <EmptyState
        data-testid="root"
        aria-label="Custom region label"
        title="auto-title"
      />,
    );
    const root = screen.getByTestId('root');
    expect(root.getAttribute('aria-label')).toBe('Custom region label');
    expect(root).not.toHaveAttribute('aria-labelledby');
  });

  it('consumer aria-describedby wins over auto-described', () => {
    render(
      <EmptyState
        data-testid="root"
        title="x"
        description="auto-desc"
        aria-describedby="custom-desc-id"
      />,
    );
    const root = screen.getByTestId('root');
    expect(root.getAttribute('aria-describedby')).toBe('custom-desc-id');
  });
});