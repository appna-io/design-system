import { describe, expect, it } from 'vitest';

import { STYLE_PROP_KEYS, extractStyleProps } from '../src/Div';

describe('extractStyleProps — partitioning', () => {
  it('separates curated style keys from arbitrary HTML props', () => {
    const { styleObj, restProps } = extractStyleProps({
      display: 'flex',
      p: 4,
      id: 'hero',
      role: 'region',
      onClick: () => {},
    });
    expect(styleObj?.display).toBe('flex');
    expect(restProps).toMatchObject({ id: 'hero', role: 'region' });
    expect(restProps).toHaveProperty('onClick');
    expect(restProps).not.toHaveProperty('display');
    expect(restProps).not.toHaveProperty('p');
  });

  it('returns styleObj=undefined when no style props are supplied', () => {
    const { styleObj, restProps } = extractStyleProps({ id: 'x', role: 'main' });
    expect(styleObj).toBeUndefined();
    expect(restProps).toEqual({ id: 'x', role: 'main' });
  });

  it('drops `undefined` style values without polluting the style object', () => {
    const { styleObj } = extractStyleProps({
      p: 4,
      m: undefined,
      bg: undefined,
      display: 'flex',
    });
    expect(styleObj).toMatchObject({ padding: 4, display: 'flex' });
    expect(styleObj).not.toHaveProperty('margin');
    expect(styleObj).not.toHaveProperty('backgroundColor');
  });
});

describe('extractStyleProps — sxToStyle delegation', () => {
  it('expands the `m` / `p` / `bg` / `radius` / `shadow` / `z` aliases', () => {
    const { styleObj } = extractStyleProps({
      m: 8,
      p: 4,
      bg: '#fafafa',
      radius: 6,
      shadow: 'sm',
      z: 2,
    });
    expect(styleObj).toMatchObject({
      margin: 8,
      padding: 4,
      backgroundColor: '#fafafa',
      borderRadius: 6,
      zIndex: 2,
    });
  });

  it('resolves palette token strings to CSS vars (e.g. bg="primary.main")', () => {
    const { styleObj } = extractStyleProps({ bg: 'primary.main', fg: 'primary.contrast' });
    expect(styleObj?.backgroundColor).toContain('var(--sds-palette-primary-main');
    expect(styleObj?.color).toContain('var(--sds-palette-primary-contrast');
  });

  it('passes raw color values through untouched (no token wrap for #hex / rgb / var)', () => {
    const { styleObj } = extractStyleProps({ bg: '#ff0000', color: 'rgb(0,0,0)' });
    expect(styleObj?.backgroundColor).toBe('#ff0000');
    expect(styleObj?.color).toBe('rgb(0,0,0)');
  });

  it('flex/grid scalar values pass through (numbers and strings)', () => {
    const { styleObj } = extractStyleProps({
      flex: 1,
      flexDirection: 'column',
      gap: 12,
      gridTemplateColumns: 'repeat(3, 1fr)',
    });
    expect(styleObj).toMatchObject({
      flex: 1,
      flexDirection: 'column',
      gap: 12,
      gridTemplateColumns: 'repeat(3, 1fr)',
    });
  });

  it('typography + effects props flow through unchanged', () => {
    const { styleObj } = extractStyleProps({
      fontSize: 14,
      fontWeight: 600,
      textAlign: 'center',
      opacity: 0.8,
      cursor: 'pointer',
      transform: 'translateY(-2px)',
    });
    expect(styleObj).toMatchObject({
      fontSize: 14,
      fontWeight: 600,
      textAlign: 'center',
      opacity: 0.8,
      cursor: 'pointer',
      transform: 'translateY(-2px)',
    });
  });
});

describe('extractStyleProps — STYLE_PROP_KEYS surface', () => {
  it('includes every documented alias', () => {
    const aliases = [
      'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my',
      'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
      'w', 'h', 'radius', 'shadow', 'z', 'bg', 'fg',
    ];
    for (const a of aliases) {
      expect(STYLE_PROP_KEYS.has(a)).toBe(true);
    }
  });

  it('includes the common layout / flex / sizing canonical names', () => {
    const canonical = [
      'display', 'position', 'flex', 'flexDirection', 'alignItems', 'justifyContent',
      'width', 'height', 'minWidth', 'maxWidth', 'gap', 'rowGap', 'columnGap',
      'margin', 'padding', 'color', 'backgroundColor', 'borderRadius', 'boxShadow',
      'fontSize', 'fontWeight', 'opacity', 'cursor', 'transition', 'transform',
    ];
    for (const c of canonical) {
      expect(STYLE_PROP_KEYS.has(c)).toBe(true);
    }
  });

  it('does NOT capture HTML attribute names (id, role, aria-*, data-*, event handlers)', () => {
    expect(STYLE_PROP_KEYS.has('id')).toBe(false);
    expect(STYLE_PROP_KEYS.has('role')).toBe(false);
    expect(STYLE_PROP_KEYS.has('aria-label')).toBe(false);
    expect(STYLE_PROP_KEYS.has('data-testid')).toBe(false);
    expect(STYLE_PROP_KEYS.has('onClick')).toBe(false);
    expect(STYLE_PROP_KEYS.has('children')).toBe(false);
    expect(STYLE_PROP_KEYS.has('className')).toBe(false);
  });
});