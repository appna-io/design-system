import { screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { ThemeProvider } from '@apx-ui/theme';
import type { ReactNode, SVGProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  DS_ICON_NAMES,
  Icon,
  IconProvider,
  createIconRegistry,
  useIconRegistry,
} from '../src/Icon';
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
      <path d="M12 0l2 8h8l-7 5 3 9-6-5-6 5 3-9-7-5h8z" />
    </svg>
  );
}

describe('createIconRegistry', () => {
  it('resolves a registered name', () => {
    const r = createIconRegistry({ mail: MailGlyph });
    expect(r.resolve('mail')).toBe(MailGlyph);
    expect(r.has('mail')).toBe(true);
  });

  it('returns undefined / false for missing names', () => {
    const r = createIconRegistry({ mail: MailGlyph });
    expect(r.resolve('missing')).toBeUndefined();
    expect(r.has('missing')).toBe(false);
  });

  it('keys() returns insertion order', () => {
    const r = createIconRegistry({ mail: MailGlyph, star: StarGlyph });
    expect(r.keys()).toEqual(['mail', 'star']);
  });

  it('is decoupled from the source object after construction', () => {
    const source: Record<string, typeof MailGlyph> = { mail: MailGlyph };
    const r = createIconRegistry(source);
    // Mutating the input map must not affect the registry — we snapshot at construction.
    source.star = StarGlyph;
    expect(r.has('star')).toBe(false);
  });

  it('warns in dev when strict mode is missing DS names', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    // Provide a partial map and force the runtime strict branch (TS would normally guard this).
    createIconRegistry({ check: MailGlyph } as never, { strict: true });
    expect(warn).toHaveBeenCalled();
    const calls = warn.mock.calls.flat().join('\n');
    // Spot-check a couple of names that should be flagged.
    expect(calls).toContain('check-circle');
    expect(calls).toContain('chevron-down');
    warn.mockRestore();
  });
});

describe('DS_ICON_NAMES', () => {
  it('contains every name shipped components reference', () => {
    // Spot-check that the canonical set covers the cases the catalog promises.
    const set = new Set(DS_ICON_NAMES);
    [
      'check',
      'x',
      'chevron-down',
      'chevron-up',
      'chevron-left',
      'chevron-right',
      'search',
      'loader',
      'plus',
      'minus',
      'alert-triangle',
      'info',
    ].forEach((name) => expect(set.has(name as never)).toBe(true));
  });

  it('has no duplicate entries', () => {
    expect(new Set(DS_ICON_NAMES).size).toBe(DS_ICON_NAMES.length);
  });
});

describe('IconProvider + useIconRegistry', () => {
  function withProvider(registry: ReturnType<typeof createIconRegistry>, children: ReactNode) {
    return <IconProvider value={registry}>{children}</IconProvider>;
  }

  function ThemedProvider({ reg, children }: { reg: ReturnType<typeof createIconRegistry>; children: ReactNode }) {
    return (
      <ThemeProvider storageKey={null}>{withProvider(reg, children)}</ThemeProvider>
    );
  }

  it('useIconRegistry().resolve returns the registered component', () => {
    const reg = createIconRegistry({ mail: MailGlyph });
    const { result } = renderHook(() => useIconRegistry(), {
      wrapper: ({ children }) => <ThemedProvider reg={reg}>{children}</ThemedProvider>,
    });
    expect(result.current.resolve('mail')).toBe(MailGlyph);
    expect(result.current.has('mail')).toBe(true);
    expect(result.current.has('nope')).toBe(false);
  });

  it('useIconRegistry().resolveOrThrow throws for missing names', () => {
    const reg = createIconRegistry({ mail: MailGlyph });
    const { result } = renderHook(() => useIconRegistry(), {
      wrapper: ({ children }) => <ThemedProvider reg={reg}>{children}</ThemedProvider>,
    });
    expect(() => result.current.resolveOrThrow('missing')).toThrow(/no icon registered for/);
  });

  it('nested providers — innermost wins', () => {
    const outer = createIconRegistry({ mail: MailGlyph });
    const inner = createIconRegistry({ mail: StarGlyph });
    render(
      <IconProvider value={outer}>
        <IconProvider value={inner}>
          <Icon name="mail" />
        </IconProvider>
      </IconProvider>,
    );
    // Inner registry's StarGlyph wins.
    expect(screen.getByTestId('star')).toBeInTheDocument();
    expect(screen.queryByTestId('mail')).not.toBeInTheDocument();
  });

  it('without a provider — name lookup misses, renders empty placeholder', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = render(<Icon name="nonexistent-icon-name" />);
    expect(container.querySelector('[data-icon-missing="nonexistent-icon-name"]')).not.toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('onMissing fires for missing names; default warning is bypassed', () => {
    const onMissing = vi.fn();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const reg = createIconRegistry({ mail: MailGlyph });
    render(
      <IconProvider value={reg} onMissing={onMissing}>
        <Icon name="missing-name" />
      </IconProvider>,
    );
    expect(onMissing).toHaveBeenCalledWith('missing-name');
    // Custom onMissing takes over — default warn does not fire.
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('fallback component renders for missing names when provided', () => {
    function Fallback(props: SVGProps<SVGSVGElement>) {
      return <svg data-testid="fallback" {...props} />;
    }
    const reg = createIconRegistry({ mail: MailGlyph });
    render(
      <IconProvider value={reg} fallback={Fallback} onMissing={() => undefined}>
        <Icon name="missing-name" />
      </IconProvider>,
    );
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('provider defaultSize / defaultColor cascade into Icon when prop is omitted', () => {
    const reg = createIconRegistry({ mail: MailGlyph });
    const { container } = render(
      <IconProvider value={reg} defaultSize={24} defaultColor="#ff0000">
        <Icon name="mail" />
      </IconProvider>,
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    const style = (svg as SVGElement).getAttribute('style') ?? '';
    expect(style).toMatch(/width:\s*24px/);
    expect(style).toMatch(/color:\s*(#ff0000|rgb\(255,\s*0,\s*0\))/);
  });

  it('per-Icon props override provider defaults', () => {
    const reg = createIconRegistry({ mail: MailGlyph });
    const { container } = render(
      <IconProvider value={reg} defaultSize={24}>
        <Icon name="mail" size="xs" />
      </IconProvider>,
    );
    const svg = container.querySelector('svg');
    // Token path → no inline width style; recipe class handles it.
    expect((svg as SVGElement).getAttribute('style') ?? '').not.toMatch(/width:\s*24px/);
  });
});
