import { describe, expect, it } from 'vitest';
import { defineTheme } from '../src/defineTheme';
import { themeToCssVars } from '../src/themeToCssVars';

describe('themeToCssVars', () => {
  const css = themeToCssVars(defineTheme());

  it('emits a :root block with palette + scale variables', () => {
    expect(css).toContain(':root {');
    expect(css).toContain('--sds-palette-primary-main: #4f46e5;');
    expect(css).toContain('--sds-radius-md: 0.375rem;');
    expect(css).toContain('--sds-font-sans:');
    expect(css).toContain('--sds-duration-normal: 200ms;');
  });

  it("emits a dark-mode block via [data-mode='dark']", () => {
    expect(css).toContain(":root[data-mode='dark'] {");
    expect(css).toContain('--sds-palette-primary-main: #6366f1;');
  });

  it('emits variant blocks for tetsu, origami, and katana', () => {
    expect(css).toContain(":root[data-variant='tetsu'] {");
    expect(css).toContain(":root[data-variant='origami'] {");
    expect(css).toContain(":root[data-variant='katana'] {");
  });

  it('katana variant emits the two-value diagonal radius shorthand', () => {
    expect(css).toMatch(/data-variant='katana'][\s\S]*--sds-radius-md: 8px 0px/);
  });

  it('omits the default variant block (no top-level overrides)', () => {
    expect(css).not.toContain(":root[data-variant='default'] {");
  });

  it("emits the adaptive default variant's Cupertino overlay under [data-platform='apple']", () => {
    expect(css).toContain(":root[data-variant='default'][data-platform='apple'] {");
    expect(css).toMatch(/data-platform='apple'][\s\S]*--sds-font-sans: -apple-system/);
    expect(css).toMatch(/data-platform='apple'][\s\S]*--sds-radius-md: 0\.625rem/);
  });

  it("does not emit an empty default [data-platform='other'] block", () => {
    expect(css).not.toContain(":root[data-variant='default'][data-platform='other'] {");
  });

  it('output is sorted (stable) — repeated calls produce identical output', () => {
    const a = themeToCssVars(defineTheme());
    const b = themeToCssVars(defineTheme());
    expect(a).toBe(b);
  });

  it('honors emitVariants:false', () => {
    const plain = themeToCssVars(defineTheme(), { emitVariants: false });
    expect(plain).not.toContain("data-variant='tetsu'");
    expect(plain).not.toContain("data-variant='origami'");
    expect(plain).not.toContain("data-variant='katana'");
    expect(plain).not.toContain("data-platform='apple'");
  });

  it('snapshot of :root block stays stable', () => {
    const rootBlock = css.split('\n\n')[0];
    expect(rootBlock).toMatchSnapshot();
  });
});