import { screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Text, Typography } from '../src';
import { renderWithTheme as render } from './utils';

describe('Typography — defaults', () => {
  it('renders a <p> by default (variant="body")', () => {
    render(<Typography data-testid="t">hello</Typography>);
    const node = screen.getByTestId('t');
    expect(node.tagName).toBe('P');
    expect(node.textContent).toBe('hello');
  });

  it('forwards ref to the rendered element', () => {
    const ref = createRef<HTMLElement>();
    render(<Typography ref={ref}>x</Typography>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });

  it('attaches the body variant class', () => {
    render(<Typography data-testid="t">x</Typography>);
    const cls = screen.getByTestId('t').className;
    expect(cls).toContain('text-base');
    expect(cls).toContain('font-normal');
  });

  it('Text is the exact same reference as Typography', () => {
    expect(Text).toBe(Typography);
  });
});

describe('Typography — variant → element mapping', () => {
  it.each([
    ['h1', 'H1'],
    ['h2', 'H2'],
    ['h3', 'H3'],
    ['h4', 'H4'],
    ['h5', 'H5'],
    ['h6', 'H6'],
  ] as const)('variant="%s" renders %s', (variant, tag) => {
    render(
      <Typography variant={variant} data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe(tag);
  });

  it('variant="display" still renders as H1 (semantic top-level)', () => {
    render(
      <Typography variant="display" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('H1');
  });

  it('variant="body" / "bodyLarge" / "bodySmall" all render as P', () => {
    const { rerender } = render(
      <Typography variant="body" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('P');
    rerender(
      <Typography variant="bodyLarge" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('P');
    rerender(
      <Typography variant="bodySmall" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('P');
  });

  it('variant="caption" / "overline" render as SPAN', () => {
    const { rerender } = render(
      <Typography variant="caption" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('SPAN');
    rerender(
      <Typography variant="overline" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('SPAN');
  });

  it('variant="code" renders as CODE', () => {
    render(
      <Typography variant="code" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('CODE');
  });
});

describe('Typography — polymorphism overrides variant default', () => {
  it('`as` overrides the variant-derived element', () => {
    render(
      <Typography variant="h2" as="h1" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('H1');
  });

  it('`actLike="a"` with href renders as an anchor', () => {
    render(
      <Typography variant="body" actLike="a" href="/docs" data-testid="t">
        link
      </Typography>,
    );
    const node = screen.getByTestId('t');
    expect(node.tagName).toBe('A');
    expect(node.getAttribute('href')).toBe('/docs');
  });
});

describe('Typography — token-aware shorthand', () => {
  it('fontSize="lg" resolves to var(--sds-font-size-lg)', () => {
    render(
      <Typography fontSize="lg" data-testid="t">
        x
      </Typography>,
    );
    const style = screen.getByTestId('t').getAttribute('style') ?? '';
    expect(style).toContain('font-size:');
    expect(style).toContain('var(--sds-font-size-lg)');
  });

  it('fontSize={14} bypasses the token table (passes through as a number)', () => {
    render(
      <Typography fontSize={14} data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').style.fontSize).toBe('14px');
  });

  it('fontSize="14px" passes through unchanged (raw escape hatch)', () => {
    render(
      <Typography fontSize="14px" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').style.fontSize).toBe('14px');
  });

  it('weight="semibold" resolves to var(--sds-font-weight-semibold)', () => {
    render(
      <Typography weight="semibold" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').getAttribute('style') ?? '').toContain(
      'var(--sds-font-weight-semibold)',
    );
  });

  it('weight wins over fontWeight when both are supplied', () => {
    render(
      <Typography weight="bold" fontWeight="normal" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').getAttribute('style') ?? '').toContain(
      'var(--sds-font-weight-bold)',
    );
  });

  it('lineHeight="tight" resolves to var(--sds-line-height-tight)', () => {
    render(
      <Typography lineHeight="tight" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').getAttribute('style') ?? '').toContain(
      'var(--sds-line-height-tight)',
    );
  });

  it('letterSpacing="wide" resolves to var(--sds-letter-spacing-wide)', () => {
    render(
      <Typography letterSpacing="wide" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').getAttribute('style') ?? '').toContain(
      'var(--sds-letter-spacing-wide)',
    );
  });

  it('fontFamily="mono" resolves to var(--sds-font-mono)', () => {
    render(
      <Typography fontFamily="mono" data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').getAttribute('style') ?? '').toContain('var(--sds-font-mono)');
  });
});

describe('Typography — text-friendly shortcuts', () => {
  it('italic={true} sets fontStyle: italic', () => {
    render(
      <Typography italic data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').style.fontStyle).toBe('italic');
  });

  it.each([
    ['left', 'left'],
    ['center', 'center'],
    ['right', 'right'],
    ['justify', 'justify'],
  ] as const)('align="%s" sets textAlign: %s', (align, expected) => {
    render(
      <Typography align={align} data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').style.textAlign).toBe(expected);
  });

  it.each([
    ['none', 'none'],
    ['upper', 'uppercase'],
    ['lower', 'lowercase'],
    ['capitalize', 'capitalize'],
  ] as const)('transform="%s" sets textTransform: %s', (transform, expected) => {
    render(
      <Typography transform={transform} data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').style.textTransform).toBe(expected);
  });

  it.each([
    ['none', 'none'],
    ['underline', 'underline'],
    ['line-through', 'line-through'],
  ] as const)('decoration="%s" sets textDecoration: %s', (decoration, expected) => {
    render(
      <Typography decoration={decoration} data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').style.textDecoration).toContain(expected);
  });

  it('truncate=true injects the three single-line ellipsis styles', () => {
    render(
      <Typography truncate data-testid="t">
        x
      </Typography>,
    );
    const node = screen.getByTestId('t');
    expect(node.style.overflow).toBe('hidden');
    expect(node.style.textOverflow).toBe('ellipsis');
    expect(node.style.whiteSpace).toBe('nowrap');
  });

  it('lineClamp={3} injects the four multi-line clamp styles (overrides truncate when both set)', () => {
    render(
      <Typography lineClamp={3} truncate data-testid="t">
        x
      </Typography>,
    );
    const node = screen.getByTestId('t');
    expect(node.style.display).toBe('-webkit-box');
    expect(node.style.overflow).toBe('hidden');
    expect((node.style as unknown as Record<string, string>).WebkitLineClamp).toBe('3');
    expect((node.style as unknown as Record<string, string>).WebkitBoxOrient).toBe('vertical');
    // truncate's white-space: nowrap should be absent (lineClamp wins, needs to wrap)
    expect(node.style.whiteSpace).not.toBe('nowrap');
  });
});

describe('Typography — Div pass-through (inherited surface)', () => {
  it('passes through Div CSS shorthand props (p, bg, radius)', () => {
    render(
      <Typography p={4} bg="primary.50" radius="md" data-testid="t">
        x
      </Typography>,
    );
    const node = screen.getByTestId('t');
    expect(node.style.padding).toBe('4px');
    expect(node.getAttribute('style') ?? '').toContain('--sds-palette-primary-50');
    expect(node.getAttribute('style') ?? '').toContain('--sds-radius-md');
  });

  it('passes through Div pseudo hooks (onHover → hover: prefix)', () => {
    render(
      <Typography onHover="text-primary underline" data-testid="t">
        x
      </Typography>,
    );
    const cls = screen.getByTestId('t').className;
    expect(cls).toContain('hover:text-primary');
    expect(cls).toContain('hover:underline');
  });

  it('passes through HTML attributes (id, role, aria-label, data-*, onClick)', () => {
    render(
      <Typography
        id="title"
        role="heading"
        aria-level={2}
        aria-label="Hello"
        data-foo="bar"
        data-testid="t"
      >
        x
      </Typography>,
    );
    const node = screen.getByTestId('t');
    expect(node.id).toBe('title');
    expect(node.getAttribute('role')).toBe('heading');
    expect(node.getAttribute('aria-level')).toBe('2');
    expect(node.getAttribute('aria-label')).toBe('Hello');
    expect(node.getAttribute('data-foo')).toBe('bar');
  });
});

describe('Typography — style cascade', () => {
  it('consumer `style` always wins over the Typography text-style chunk', () => {
    render(
      <Typography italic style={{ fontStyle: 'normal' }} data-testid="t">
        x
      </Typography>,
    );
    expect(screen.getByTestId('t').style.fontStyle).toBe('normal');
  });

  it('consumer className merges with the variant recipe class via tailwind-merge', () => {
    render(
      <Typography variant="body" className="text-primary" data-testid="t">
        x
      </Typography>,
    );
    const cls = screen.getByTestId('t').className;
    // recipe class is still there for the layout axis (min-w-0)
    expect(cls).toContain('min-w-0');
    // consumer className wins for color
    expect(cls).toContain('text-primary');
  });

  it('emits no inline style when no text or Div style props are supplied', () => {
    render(<Typography data-testid="t">x</Typography>);
    expect(screen.getByTestId('t').getAttribute('style')).toBeNull();
  });
});