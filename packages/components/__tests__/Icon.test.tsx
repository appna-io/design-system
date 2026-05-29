import { screen } from '@testing-library/react';
import { createRef, type SVGProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Icon, IconProvider, createIconRegistry } from '../src/Icon';
import { renderWithTheme as render } from './utils';

function MailGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg data-testid="mail" {...props}>
      <path d="M0 0h24v24H0z" />
    </svg>
  );
}

function StarGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg data-testid="star" {...props}>
      <path d="M0 0h24v24H0z" />
    </svg>
  );
}

describe('Icon — render-source precedence', () => {
  it('children wins over as and name', () => {
    render(
      <IconProvider value={createIconRegistry({ mail: MailGlyph })}>
        <Icon as={StarGlyph} name="mail">
          <svg data-testid="inline" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </Icon>
      </IconProvider>,
    );
    expect(screen.getByTestId('inline')).toBeInTheDocument();
    expect(screen.queryByTestId('star')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mail')).not.toBeInTheDocument();
  });

  it('as wins over name when children is omitted', () => {
    render(
      <IconProvider value={createIconRegistry({ mail: MailGlyph })}>
        <Icon as={StarGlyph} name="mail" />
      </IconProvider>,
    );
    expect(screen.getByTestId('star')).toBeInTheDocument();
    expect(screen.queryByTestId('mail')).not.toBeInTheDocument();
  });

  it('name resolves via the registry', () => {
    render(
      <IconProvider value={createIconRegistry({ mail: MailGlyph })}>
        <Icon name="mail" />
      </IconProvider>,
    );
    expect(screen.getByTestId('mail')).toBeInTheDocument();
  });

  it('warns in dev when no source is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = render(
      <div data-testid="wrap">
        <Icon />
      </div>,
    );
    expect(container.querySelector('[data-testid="wrap"]')?.children.length).toBe(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('Icon — size', () => {
  it('applies the size token recipe class for tokens', () => {
    const { container } = render(<Icon as={MailGlyph} size="lg" />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('class') ?? '').toMatch(/h-5|w-5/);
    // Token path → no inline width override.
    expect(svg.getAttribute('style') ?? '').not.toMatch(/width:\s*\d/);
  });

  it('applies inline width/height for numeric sizes', () => {
    const { container } = render(<Icon as={MailGlyph} size={32} />);
    const svg = container.querySelector('svg') as SVGElement;
    const style = svg.getAttribute('style') ?? '';
    expect(style).toMatch(/width:\s*32px/);
    expect(style).toMatch(/height:\s*32px/);
    expect(style).toMatch(/font-size:\s*32px/);
  });

  it('passes through arbitrary CSS lengths', () => {
    const { container } = render(<Icon as={MailGlyph} size="1.5rem" />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('style') ?? '').toMatch(/width:\s*1\.5rem/);
  });
});

describe('Icon — color', () => {
  it('applies the color token recipe class for tokens', () => {
    const { container } = render(<Icon as={MailGlyph} color="danger" />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('class') ?? '').toMatch(/text-danger/);
    expect(svg.getAttribute('style') ?? '').not.toMatch(/color:\s*[^;]+;/);
  });

  it('applies inline color for arbitrary CSS values', () => {
    const { container } = render(<Icon as={MailGlyph} color="#abcdef" />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('style') ?? '').toMatch(/color:\s*(?:#abcdef|rgb\()/);
  });
});

describe('Icon — children mode', () => {
  it('clones the single child and merges class + ARIA', () => {
    render(
      <Icon label="My logo">
        <svg data-testid="logo" viewBox="0 0 24 24" className="custom-class">
          <path d="M0 0h24v24H0z" />
        </svg>
      </Icon>,
    );
    const svg = screen.getByTestId('logo');
    expect(svg.getAttribute('aria-label')).toBe('My logo');
    expect(svg.getAttribute('role')).toBe('img');
    // Child's own className is preserved.
    expect(svg.getAttribute('class') ?? '').toMatch(/custom-class/);
  });

  it('wraps multi-node children in a span', () => {
    const { container } = render(
      <div data-testid="wrap">
        <Icon>
          <span>a</span>
          <span>b</span>
        </Icon>
      </div>,
    );
    const wrap = container.querySelector('[data-testid="wrap"]') as HTMLElement;
    expect(wrap.firstChild?.nodeName.toLowerCase()).toBe('span');
  });
});

describe('Icon — asChild', () => {
  it('renders via Slot, passing merged props to the child', () => {
    render(
      <Icon asChild label="Wrapped">
        <button type="button" data-testid="btn">
          <svg viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" />
          </svg>
        </button>
      </Icon>,
    );
    const btn = screen.getByTestId('btn');
    expect(btn.getAttribute('aria-label')).toBe('Wrapped');
    expect(btn.getAttribute('role')).toBe('img');
  });

  it('warns in dev and renders nothing when child is not a valid element', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = render(
      <div data-testid="wrap">
        <Icon asChild>plain text</Icon>
      </div>,
    );
    expect(container.querySelector('[data-testid="wrap"]')?.textContent).toBe('');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('Icon — ref forwarding', () => {
  it('forwards ref to the rendered SVG when using `as`', () => {
    const ref = createRef<SVGSVGElement>();
    render(<Icon as={MailGlyph} ref={ref as never} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName.toLowerCase()).toBe('svg');
  });
});

describe('Icon — passes through extra props', () => {
  it('forwards data-* attributes and onClick', () => {
    const onClick = vi.fn();
    render(
      <Icon
        as={MailGlyph}
        data-testid="clickable"
        onClick={onClick as never}
      />,
    );
    const svg = screen.getByTestId('clickable');
    svg.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClick).toHaveBeenCalled();
  });
});
