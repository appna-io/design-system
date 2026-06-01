import { describe, expect, it } from 'vitest';

import { typographyRecipe, TYPOGRAPHY_VARIANT_TO_ELEMENT } from '../src';

describe('typographyRecipe — variant axis', () => {
  it('every shipped variant has a non-empty class string', () => {
    const variants = [
      'display',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'body',
      'bodyLarge',
      'bodySmall',
      'caption',
      'overline',
      'code',
    ] as const;

    for (const v of variants) {
      const cls = typographyRecipe({ variant: v });
      expect(cls).toBeTypeOf('string');
      expect(cls.length).toBeGreaterThan(0);
    }
  });

  it('default variant is "body" when none is provided', () => {
    const explicit = typographyRecipe({ variant: 'body' });
    const implicit = typographyRecipe({});
    expect(implicit).toBe(explicit);
  });

  it('base class "min-w-0" is included on every variant', () => {
    expect(typographyRecipe({ variant: 'h1' })).toContain('min-w-0');
    expect(typographyRecipe({ variant: 'caption' })).toContain('min-w-0');
    expect(typographyRecipe({ variant: 'code' })).toContain('min-w-0');
  });

  it('display variant has the largest text utility (text-5xl)', () => {
    expect(typographyRecipe({ variant: 'display' })).toContain('text-5xl');
  });

  it('h1 is text-4xl + semibold + tracking-tight', () => {
    const cls = typographyRecipe({ variant: 'h1' });
    expect(cls).toContain('text-4xl');
    expect(cls).toContain('font-semibold');
    expect(cls).toContain('tracking-tight');
  });

  it('caption is muted by default', () => {
    expect(typographyRecipe({ variant: 'caption' })).toContain('text-fg-muted');
  });

  it('overline is uppercase with wider tracking', () => {
    const cls = typographyRecipe({ variant: 'overline' });
    expect(cls).toContain('uppercase');
    expect(cls).toContain('tracking-wider');
  });

  it('code uses the mono font + bg-subtle background + rounded-sm', () => {
    const cls = typographyRecipe({ variant: 'code' });
    expect(cls).toContain('font-mono');
    expect(cls).toContain('bg-bg-subtle');
    expect(cls).toContain('rounded-sm');
  });
});

describe('TYPOGRAPHY_VARIANT_TO_ELEMENT', () => {
  it('maps each heading variant to its semantic counterpart', () => {
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.h1).toBe('h1');
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.h2).toBe('h2');
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.h3).toBe('h3');
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.h4).toBe('h4');
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.h5).toBe('h5');
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.h6).toBe('h6');
  });

  it('display still maps to h1 (oversize hero, top-level semantically)', () => {
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.display).toBe('h1');
  });

  it('every body variant renders as <p>', () => {
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.body).toBe('p');
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.bodyLarge).toBe('p');
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.bodySmall).toBe('p');
  });

  it('caption / overline are inline <span>', () => {
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.caption).toBe('span');
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.overline).toBe('span');
  });

  it('code renders as the semantic <code> element', () => {
    expect(TYPOGRAPHY_VARIANT_TO_ELEMENT.code).toBe('code');
  });
});