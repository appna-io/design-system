import { describe, expect, it } from 'vitest';

import { buildGradientBackground } from '../src/Div';

describe('buildGradientBackground — falsy inputs', () => {
  it('returns undefined for `undefined`', () => {
    expect(buildGradientBackground(undefined)).toBeUndefined();
  });

  it('returns undefined for `false`', () => {
    expect(buildGradientBackground(false)).toBeUndefined();
  });
});

describe('buildGradientBackground — boolean default', () => {
  it('emits a theme-aware radial gradient when `gradient={true}`', () => {
    const out = buildGradientBackground(true);
    expect(out).toBe(
      'radial-gradient(80% 80% at 0% 0%, var(--sds-palette-primary-subtle) 0%, transparent 70%)',
    );
  });
});

describe('buildGradientBackground — string passthrough', () => {
  it('returns custom strings verbatim', () => {
    const custom = 'radial-gradient(red, blue)';
    expect(buildGradientBackground(custom)).toBe(custom);
  });

  it('passes a `linear-gradient(...)` string through untouched', () => {
    const custom = 'linear-gradient(to bottom, #abc 0%, #def 100%)';
    expect(buildGradientBackground(custom)).toBe(custom);
  });
});

describe('buildGradientBackground — radial config', () => {
  it('resolves palette token strings to var(--sds-palette-...)', () => {
    const out = buildGradientBackground({ from: 'success.subtle', position: 'top' });
    expect(out).toContain('var(--sds-palette-success-subtle)');
    expect(out).toContain('at 50% 0%');
  });

  it('keeps `transparent` and raw CSS colors untouched', () => {
    const out = buildGradientBackground({ from: '#abc', to: 'rgba(0,0,0,0.5)' });
    expect(out).toContain('#abc');
    expect(out).toContain('rgba(0,0,0,0.5)');
  });

  it('lets callers override size, position, and stops', () => {
    const out = buildGradientBackground({
      position: 'left',
      size: '60% 60%',
      fromStop: '5%',
      toStop: '90%',
    });
    expect(out).toBe(
      'radial-gradient(60% 60% at 0% 50%, var(--sds-palette-primary-subtle) 5%, transparent 90%)',
    );
  });
});

describe('buildGradientBackground — linear config', () => {
  it('emits a linear gradient with the resolved direction + token color', () => {
    const out = buildGradientBackground({ type: 'linear', position: 'right', from: 'primary.main' });
    expect(out).toContain('linear-gradient(to right,');
    expect(out).toContain('var(--sds-palette-primary-main)');
    expect(out).toContain('transparent 100%');
  });

  it('defaults the linear direction to `to bottom` when no position is provided', () => {
    const out = buildGradientBackground({ type: 'linear', from: 'info.main', to: 'info.subtle' });
    expect(out).toBe(
      'linear-gradient(to bottom, var(--sds-palette-info-main) 0%, var(--sds-palette-info-subtle) 100%)',
    );
  });
});