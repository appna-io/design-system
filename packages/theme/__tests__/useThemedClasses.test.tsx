import { cv } from '@apx-ui/engine';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../src/ThemeProvider';
import { defineTheme } from '../src/defineTheme';
import { useThemedClasses } from '../src/hooks/useThemedClasses';

const recipe = cv({
  base: 'inline-flex items-center rounded-md',
  variants: {
    size: { sm: 'h-8 px-3', md: 'h-10 px-4', lg: 'h-12 px-6' },
    color: { primary: 'bg-blue-500', danger: 'bg-red-500' },
  },
  defaultVariants: { size: 'md', color: 'primary' },
});

const variantRecipe = cv({
  base: 'inline-flex',
  variants: {
    variant: { solid: 'border-0', outline: 'border-2', ghost: 'border' },
    disabled: { true: 'opacity-50', false: 'opacity-100' },
  },
  defaultVariants: { variant: 'solid', disabled: false },
});

function makeWrapper(theme?: Parameters<typeof defineTheme>[0]) {
  const resolved = theme ? defineTheme(theme) : undefined;
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) =>
    resolved ? (
      <ThemeProvider theme={resolved} storageKey={null}>
        {children}
      </ThemeProvider>
    ) : (
      <ThemeProvider storageKey={null}>{children}</ThemeProvider>
    );
}

describe('useThemedClasses', () => {
  it('returns the recipe class string by default', () => {
    const { result } = renderHook(
      () => useThemedClasses({ recipe, props: { size: 'sm', color: 'primary' } }),
      { wrapper: makeWrapper() },
    );
    expect(result.current.className).toContain('inline-flex');
    expect(result.current.className).toContain('h-8');
    expect(result.current.className).toContain('bg-blue-500');
  });

  it('appends theme.components.<Name>.styleOverrides.<slot>', () => {
    const { result } = renderHook(
      () =>
        useThemedClasses({
          recipe,
          componentName: 'Button',
          props: { size: 'md', color: 'primary' },
        }),
      {
        wrapper: makeWrapper({
          components: {
            Button: { styleOverrides: { root: 'tracking-widest uppercase' } },
          },
        }),
      },
    );
    expect(result.current.className).toContain('tracking-widest');
    expect(result.current.className).toContain('uppercase');
  });

  it('user className wins over recipe (tailwind-merge resolves conflicts)', () => {
    const { result } = renderHook(
      () =>
        useThemedClasses({
          recipe,
          props: { size: 'md', className: 'h-20' },
        }),
      { wrapper: makeWrapper() },
    );
    expect(result.current.className).toContain('h-20');
    expect(result.current.className).not.toContain('h-10');
  });

  it('user className also wins over theme styleOverrides', () => {
    const { result } = renderHook(
      () =>
        useThemedClasses({
          recipe,
          componentName: 'Button',
          props: { size: 'md', className: 'h-32' },
        }),
      {
        wrapper: makeWrapper({
          components: { Button: { styleOverrides: { root: 'h-24' } } },
        }),
      },
    );
    expect(result.current.className).toContain('h-32');
    expect(result.current.className).not.toContain('h-24');
  });

  it('merges sx into inline style and resolves palette tokens', () => {
    const { result } = renderHook(
      () => useThemedClasses({ recipe, props: { sx: { bg: 'primary.main' } } }),
      { wrapper: makeWrapper() },
    );
    expect(result.current.style?.backgroundColor).toBe('var(--sds-palette-primary-main)');
  });

  it('style prop wins over sx for the same key', () => {
    const { result } = renderHook(
      () =>
        useThemedClasses({
          recipe,
          props: { sx: { bg: 'primary.main' }, style: { backgroundColor: 'pink' } },
        }),
      { wrapper: makeWrapper() },
    );
    expect(result.current.style?.backgroundColor).toBe('pink');
  });

  it('returns no style when neither sx nor style is provided', () => {
    const { result } = renderHook(() => useThemedClasses({ recipe, props: {} }), {
      wrapper: makeWrapper(),
    });
    expect(result.current.style).toBeUndefined();
  });
});

describe('useThemedClasses — theme.components.<Name>.defaultProps', () => {
  // Each test exercises one cell of the documented precedence chain:
  //   recipe defaultVariants → theme defaultProps → consumer prop
  //
  // The hot-button semantic is that `undefined` is treated as "not provided" by the consumer
  // and falls through to the theme default. Without this, README examples shipped on every
  // component lie: setting `theme.components.Foo.defaultProps.variant = 'outline'` had no
  // effect because the engine recipe always saw the recipe's own `defaultVariants` instead.

  it('falls through to theme defaultProps when consumer omits the prop', () => {
    const { result } = renderHook(
      () =>
        useThemedClasses({
          recipe: variantRecipe,
          componentName: 'Button',
          props: {},
        }),
      {
        wrapper: makeWrapper({
          components: { Button: { defaultProps: { variant: 'outline' } } },
        }),
      },
    );
    // outline → border-2; without the wiring this would emit border-0 (solid recipe default)
    expect(result.current.className).toContain('border-2');
    expect(result.current.className).not.toContain('border-0');
  });

  it('consumer prop wins over theme defaultProps when defined', () => {
    const { result } = renderHook(
      () =>
        useThemedClasses({
          recipe: variantRecipe,
          componentName: 'Button',
          props: { variant: 'ghost' },
        }),
      {
        wrapper: makeWrapper({
          components: { Button: { defaultProps: { variant: 'outline' } } },
        }),
      },
    );
    // ghost → `border` (no -N suffix); both theme and recipe lose to the consumer
    expect(result.current.className).toMatch(/\bborder\b/);
    expect(result.current.className).not.toContain('border-2');
    expect(result.current.className).not.toContain('border-0');
  });

  it('explicit `undefined` consumer prop falls through to theme defaultProps', () => {
    // React passes `undefined` for omitted destructured props. We honor that — consumers who
    // forward props through a wrapper component shouldn't accidentally clobber theme defaults
    // just because the wrapper destructures everything.
    const { result } = renderHook(
      () =>
        useThemedClasses({
          recipe: variantRecipe,
          componentName: 'Button',
          props: { variant: undefined },
        }),
      {
        wrapper: makeWrapper({
          components: { Button: { defaultProps: { variant: 'outline' } } },
        }),
      },
    );
    expect(result.current.className).toContain('border-2');
  });

  it('defined falsy consumer value (false) still wins over theme defaultProps', () => {
    // `disabled={false}` is a real authoring intent ("explicitly enable this") and must NOT be
    // overridden by a theme that sets `disabled: true`. Only `undefined` falls through.
    const { result } = renderHook(
      () =>
        useThemedClasses({
          recipe: variantRecipe,
          componentName: 'Button',
          props: { disabled: false },
        }),
      {
        wrapper: makeWrapper({
          components: { Button: { defaultProps: { disabled: true } } },
        }),
      },
    );
    expect(result.current.className).toContain('opacity-100');
    expect(result.current.className).not.toContain('opacity-50');
  });

  it('per-component defaults are isolated — Button gets its set, Checkbox gets theirs', () => {
    // Same ThemeProvider, two different components — each one's defaultProps slot is consulted
    // independently. Catches a bug where defaults could be globally applied to every recipe.
    const wrapper = makeWrapper({
      components: {
        Button: { defaultProps: { variant: 'outline' } },
        Checkbox: { defaultProps: { variant: 'ghost' } },
      },
    });
    const { result: btn } = renderHook(
      () => useThemedClasses({ recipe: variantRecipe, componentName: 'Button', props: {} }),
      { wrapper },
    );
    const { result: chk } = renderHook(
      () => useThemedClasses({ recipe: variantRecipe, componentName: 'Checkbox', props: {} }),
      { wrapper },
    );
    expect(btn.current.className).toContain('border-2'); // outline
    expect(chk.current.className).toMatch(/\bborder\b/); // ghost
    expect(chk.current.className).not.toContain('border-2');
  });

  it('skips the merge entirely when componentName is omitted (ad-hoc recipes)', () => {
    // Ad-hoc recipes that don't pass a componentName never touch the theme — including the
    // new defaultProps step. Verified by a recipe spy that should receive the props the
    // consumer passed, unchanged.
    const spy = vi.fn(variantRecipe);
    const { result } = renderHook(
      () =>
        useThemedClasses({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recipe: spy as any,
          props: { variant: 'ghost' },
        }),
      {
        wrapper: makeWrapper({
          components: { Button: { defaultProps: { variant: 'outline' } } },
        }),
      },
    );
    expect(result.current.className).toMatch(/\bborder\b/);
    // The recipe is called with consumer props directly; no theme defaults leak in.
    expect(spy.mock.calls[0]?.[0]).toEqual({ variant: 'ghost' });
  });

  it('defaultProps + styleOverrides compose cleanly on the same component', () => {
    // Belt-and-suspenders test: when a theme touches both slots, the variant axis is resolved
    // first (engine recipe sees outline) AND the styleOverrides class is appended afterwards.
    const { result } = renderHook(
      () =>
        useThemedClasses({
          recipe: variantRecipe,
          componentName: 'Button',
          props: {},
        }),
      {
        wrapper: makeWrapper({
          components: {
            Button: {
              defaultProps: { variant: 'outline' },
              styleOverrides: { root: 'tracking-widest' },
            },
          },
        }),
      },
    );
    expect(result.current.className).toContain('border-2');
    expect(result.current.className).toContain('tracking-widest');
  });
});