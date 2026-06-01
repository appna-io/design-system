import { describe, expect, it } from 'vitest';
import { token, tokenName, tokens, TOKEN_PREFIX } from '../src/token';

describe('token', () => {
  it('produces a CSS variable reference', () => {
    expect(token('palette.primary.main')).toBe('var(--sds-palette-primary-main)');
  });

  it('supports a fallback', () => {
    expect(token('radius.md', '0.5rem')).toBe('var(--sds-radius-md, 0.5rem)');
  });

  it('handles single-segment paths', () => {
    expect(token('focusRing')).toBe('var(--sds-focusRing)');
  });

  it('uses the configured TOKEN_PREFIX', () => {
    expect(TOKEN_PREFIX).toBe('--sds');
  });
});

describe('tokenName', () => {
  it('returns the variable name without var() wrapper', () => {
    expect(tokenName('palette.primary.main')).toBe('--sds-palette-primary-main');
  });
});

describe('tokens', () => {
  it('preserves the literal types of values', () => {
    const t = tokens({ bg: 'palette.primary.main', radius: 'radius.md' });
    expect(t.bg).toBe('palette.primary.main');
    expect(t.radius).toBe('radius.md');
  });
});