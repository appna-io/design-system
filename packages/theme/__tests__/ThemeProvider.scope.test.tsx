/**
 * `<ThemeProvider scope>` — the subtree-confined theme (Option B on #5).
 *
 * The contract has four parts, and each one is a way the feature could silently half-work:
 *
 *   1. The attributes go on the wrapper, NOT on `<html>` — otherwise a scoped provider repaints
 *      the host app, which is the entire bug it exists to fix.
 *   2. The emitted CSS is scoped in *all four* layers (base, dark, variant, platform). Getting
 *      base + dark right while variant blocks still say `:root` is the easy failure, so it is
 *      asserted explicitly.
 *   3. Persistence is off unless asked for — a scoped theme must not overwrite the root
 *      instance's `localStorage` keys.
 *   4. The root provider is untouched by any of it (regression guard for the default path).
 *
 * JSDOM applies no stylesheets, so we assert the generated CSS text and the DOM attributes it is
 * keyed on, not computed colors.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useState } from 'react';

import { defineTheme } from '../src/defineTheme';
import { ThemeProvider } from '../src/ThemeProvider';
import { useMode } from '../src/hooks/useMode';
import { useThemeDirection } from '../src/hooks/useDirectionWithSetter';
import { useThemeOverrides } from '../src/hooks/useThemeOverrides';
import type { ThemeOverride } from '../src/mergeTheme';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  localStorage.clear();
  for (const attr of ['data-mode', 'data-variant', 'data-platform', 'dir']) {
    document.documentElement.removeAttribute(attr);
  }
});

afterEach(() => {
  localStorage.clear();
  for (const attr of ['data-mode', 'data-variant', 'data-platform', 'dir']) {
    document.documentElement.removeAttribute(attr);
  }
});

function scopeEl(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-apx-theme-scope]');
  if (!el) throw new Error('no scope wrapper rendered');
  return el;
}

function styleText(container: HTMLElement): string {
  return container.querySelector('style[data-apx-ds-theme]')?.textContent ?? '';
}

describe('ThemeProvider scope — where the attributes land', () => {
  it('writes mode / variant / platform / dir onto its wrapper, never onto <html>', async () => {
    const { container } = render(
      <ThemeProvider scope defaultMode="dark" defaultVariant="origami" defaultDir="rtl">
        <span>scoped</span>
      </ThemeProvider>,
    );

    const el = scopeEl(container);
    await waitFor(() => expect(el.getAttribute('data-mode')).toBe('dark'));
    expect(el.getAttribute('data-variant')).toBe('origami');
    expect(el.getAttribute('dir')).toBe('rtl');
    expect(el.getAttribute('data-platform')).toBeTruthy();

    // The whole point: the document is untouched.
    expect(document.documentElement.getAttribute('data-mode')).toBeNull();
    expect(document.documentElement.getAttribute('data-variant')).toBeNull();
    expect(document.documentElement.getAttribute('dir')).toBeNull();
  });

  it('keeps the wrapper out of layout so it cannot break a flex/grid parent', () => {
    const { container } = render(
      <ThemeProvider scope>
        <span>scoped</span>
      </ThemeProvider>,
    );
    expect(scopeEl(container).style.display).toBe('contents');
  });

  it('renders no wrapper at all when unscoped', () => {
    const { container } = render(
      <ThemeProvider>
        <span>plain</span>
      </ThemeProvider>,
    );
    expect(container.querySelector('[data-apx-theme-scope]')).toBeNull();
  });
});

describe('ThemeProvider scope — the emitted CSS', () => {
  it('scopes every layer, leaving no :root rule behind', () => {
    const { container } = render(
      <ThemeProvider scope>
        <span>scoped</span>
      </ThemeProvider>,
    );

    const id = scopeEl(container).getAttribute('data-apx-theme-scope')!;
    const css = styleText(container);
    const selector = `[data-apx-theme-scope='${id}']`;

    expect(css).toContain(`${selector} {`);
    expect(css).toContain(`${selector}[data-mode='dark'] {`);
    // Layer 3 / 4 — the ones that used to be hard-coded to `:root`. The platform overlay is
    // keyed on both attributes, so it only matches if the variant selector was scoped too.
    expect(css).toContain(`${selector}[data-variant='tetsu'] {`);
    expect(css).toMatch(
      new RegExp(`\\[data-apx-theme-scope='${id}'\\]\\[data-variant='[^']+'\\]\\[data-platform=`),
    );

    // No rule may escape the scope. `:root` appearing anywhere means a layer leaked.
    expect(css).not.toContain(':root');
  });

  it('generates a selector-safe id (useId emits colons, which selectors reject)', () => {
    const { container } = render(
      <ThemeProvider scope>
        <span>scoped</span>
      </ThemeProvider>,
    );
    const id = scopeEl(container).getAttribute('data-apx-theme-scope')!;
    expect(id).toMatch(/^[a-zA-Z0-9_-]+$/);
    // Proves the generated CSS and the rendered attribute agree — a mismatch here would style
    // nothing at all, silently.
    expect(() => container.querySelector(`[data-apx-theme-scope='${id}']`)).not.toThrow();
    expect(container.querySelector(`[data-apx-theme-scope='${id}']`)).not.toBeNull();
  });

  it('gives two sibling scopes different ids so they cannot cross-style', () => {
    const { container } = render(
      <>
        <ThemeProvider scope>
          <span>a</span>
        </ThemeProvider>
        <ThemeProvider scope>
          <span>b</span>
        </ThemeProvider>
      </>,
    );
    const ids = Array.from(container.querySelectorAll('[data-apx-theme-scope]')).map((el) =>
      el.getAttribute('data-apx-theme-scope'),
    );
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('carries the whole theme, not just the palette — this is what Option A cannot do', () => {
    const branded = defineTheme({
      typography: { fontFamily: { sans: '"Playfair Display", serif' } },
    } as never);

    const { container } = render(
      <ThemeProvider scope theme={branded}>
        <span>scoped</span>
      </ThemeProvider>,
    );

    const css = styleText(container);
    expect(css).toContain('--sds-font-sans: "Playfair Display", serif;');
    expect(css).toMatch(/--sds-radius-/);
    expect(css).toMatch(/--sds-shadows-/);
  });
});

describe('ThemeProvider scope — persistence', () => {
  it('persists nothing by default', async () => {
    const { container } = render(
      <ThemeProvider scope defaultMode="dark">
        <span>scoped</span>
      </ThemeProvider>,
    );
    await waitFor(() => expect(scopeEl(container).getAttribute('data-mode')).toBe('dark'));
    expect(localStorage.length).toBe(0);
  });

  it('does not read the root instance’s persisted mode', async () => {
    localStorage.setItem('sds-theme-mode', 'dark');
    const { container } = render(
      <ThemeProvider scope defaultMode="light">
        <span>scoped</span>
      </ThemeProvider>,
    );
    await waitFor(() => expect(scopeEl(container).getAttribute('data-mode')).toBe('light'));
  });

  it('still persists under an explicit storageKey', async () => {
    const { container } = render(
      <ThemeProvider scope storageKey="template-theme" defaultMode="dark">
        <span>scoped</span>
      </ThemeProvider>,
    );
    await waitFor(() => expect(scopeEl(container).getAttribute('data-mode')).toBe('dark'));
    // Nothing is written until a setter runs, but the root's keys must stay clean regardless.
    expect(localStorage.getItem('sds-theme-mode')).toBeNull();
  });
});

describe('ThemeProvider — the unscoped path is unchanged', () => {
  it('still writes to <html> and still emits :root rules', async () => {
    const { container } = render(
      <ThemeProvider defaultMode="dark" defaultVariant="origami">
        <span>plain</span>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(document.documentElement.getAttribute('data-mode')).toBe('dark'),
    );
    expect(document.documentElement.getAttribute('data-variant')).toBe('origami');
    expect(styleText(container)).toContain(':root {');
  });
});

/**
 * A scope is about tokens. Light/dark and reading direction belong to the app, so a branded
 * region must keep answering to the app's toggles — the alternative (owning them) means a
 * template preview freezes at whatever mode it mounted with, and the consumer's only workaround
 * is remounting the whole subtree on every toggle.
 */
function OuterModeToggle() {
  const { resolvedMode, setMode } = useMode();
  return (
    <button type="button" data-testid="outer-mode" onClick={() => setMode('dark')}>
      {resolvedMode}
    </button>
  );
}

function InnerDirToggle() {
  const { dir, toggleDir } = useThemeDirection();
  return (
    <button type="button" data-testid="inner-dir" onClick={toggleDir}>
      {dir}
    </button>
  );
}

describe('ThemeProvider scope — axes follow the app', () => {
  it("follows the outer provider's mode when it mounts", async () => {
    const { container } = render(
      <ThemeProvider defaultMode="dark">
        <ThemeProvider scope>
          <span>scoped</span>
        </ThemeProvider>
      </ThemeProvider>,
    );
    await waitFor(() => expect(scopeEl(container).getAttribute('data-mode')).toBe('dark'));
  });

  it("keeps following after the app's toggle fires — no remount needed", async () => {
    const { container } = render(
      <ThemeProvider defaultMode="light">
        <OuterModeToggle />
        <ThemeProvider scope>
          <span>scoped</span>
        </ThemeProvider>
      </ThemeProvider>,
    );
    await waitFor(() => expect(scopeEl(container).getAttribute('data-mode')).toBe('light'));

    fireEvent.click(screen.getByTestId('outer-mode'));
    await waitFor(() => expect(scopeEl(container).getAttribute('data-mode')).toBe('dark'));
  });

  it('follows direction too, and a setter inside the scope reaches the app', async () => {
    const { container } = render(
      <ThemeProvider defaultDir="ltr">
        <ThemeProvider scope>
          <InnerDirToggle />
        </ThemeProvider>
      </ThemeProvider>,
    );
    await waitFor(() => expect(scopeEl(container).getAttribute('dir')).toBe('ltr'));

    // Delegation: without it this sets state nobody reads and the toggle appears inert.
    fireEvent.click(screen.getByTestId('inner-dir'));
    await waitFor(() => expect(scopeEl(container).getAttribute('dir')).toBe('rtl'));
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });

  it('pins the axis when it is passed explicitly — a light-only region in a dark app', async () => {
    const { container } = render(
      <ThemeProvider defaultMode="light">
        <OuterModeToggle />
        <ThemeProvider scope defaultMode="light">
          <span>scoped</span>
        </ThemeProvider>
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByTestId('outer-mode'));
    await waitFor(() => expect(document.documentElement.getAttribute('data-mode')).toBe('dark'));
    // Pinned: the app went dark, the scope did not.
    expect(scopeEl(container).getAttribute('data-mode')).toBe('light');
  });

  it('owns all four axes when there is no provider above it', async () => {
    const { container } = render(
      <ThemeProvider scope defaultMode="dark" defaultDir="rtl">
        <span>scoped</span>
      </ThemeProvider>,
    );
    const el = scopeEl(container);
    await waitFor(() => expect(el.getAttribute('data-mode')).toBe('dark'));
    expect(el.getAttribute('dir')).toBe('rtl');
  });
});

describe('ThemeProvider scope — the body face', () => {
  it('applies --sds-font-sans on the wrapper', () => {
    // `reset.css` puts the body face on `<body>`, which is outside every scope. Without this a
    // scoped theme emits a correct `--sds-font-sans` that nothing in its subtree ever reads, and
    // body copy silently keeps the host page\'s font.
    const { container } = render(
      <ThemeProvider scope>
        <span>scoped</span>
      </ThemeProvider>,
    );
    expect(scopeEl(container).style.fontFamily).toBe('var(--sds-font-sans)');
  });
});

/**
 * Controlled overrides exist for one shape: a control that lives OUTSIDE the scope it drives.
 * Anything inside a scope already reaches its nearest provider via `useThemeOverrides()`; a
 * preview toolbar rendered as a *sibling* of the themed subtree resolves to the root provider
 * instead and would repaint the whole app.
 */
function OverridesProbe() {
  const { overrides, patchOverrides, resetOverrides } = useThemeOverrides();
  return (
    <>
      <span data-testid="probe">{JSON.stringify(overrides)}</span>
      <button
        type="button"
        data-testid="patch"
        onClick={() => patchOverrides({ palette: { light: { primary: { main: '#abcdef' } } } })}
      />
      <button type="button" data-testid="reset" onClick={resetOverrides} />
    </>
  );
}

describe('ThemeProvider — controlled overrides', () => {
  it('an outside control drives one scope, and the scope keeps no state of its own', () => {
    function Host() {
      const [overrides, setOverrides] = useState<ThemeOverride>({});
      return (
        <>
          {/* The "toolbar": outside the scope, holding the value. */}
          <button
            type="button"
            data-testid="outside"
            onClick={() => setOverrides({ palette: { light: { primary: { main: '#123456' } } } })}
          />
          <ThemeProvider scope overrides={overrides} onOverridesChange={setOverrides}>
            <OverridesProbe />
          </ThemeProvider>
        </>
      );
    }

    const { container } = render(<Host />);
    expect(styleText(container)).toContain('--sds-palette-primary-main: #4f46e5;');

    fireEvent.click(screen.getByTestId('outside'));
    expect(styleText(container)).toContain('--sds-palette-primary-main: #123456;');
  });

  it('reports upward instead of self-updating when controlled', () => {
    const onOverridesChange = vi.fn();
    render(
      <ThemeProvider scope overrides={{}} onOverridesChange={onOverridesChange}>
        <OverridesProbe />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('patch'));
    expect(onOverridesChange).toHaveBeenCalledWith({
      palette: { light: { primary: { main: '#abcdef' } } },
    });
    // Controlled means controlled: the provider did not move on its own.
    expect(screen.getByTestId('probe').textContent).toBe('{}');
  });

  it('still owns its overrides when uncontrolled', () => {
    render(
      <ThemeProvider scope>
        <OverridesProbe />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByTestId('patch'));
    expect(screen.getByTestId('probe').textContent).toContain('#abcdef');

    fireEvent.click(screen.getByTestId('reset'));
    expect(screen.getByTestId('probe').textContent).toBe('{}');
  });

  it('does not write a controlled value to storage', () => {
    const onOverridesChange = vi.fn();
    render(
      <ThemeProvider storageKey="ctl" overrides={{}} onOverridesChange={onOverridesChange}>
        <OverridesProbe />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByTestId('patch'));
    // The parent owns the value; persisting it here would resurrect a stale override on remount.
    expect(localStorage.getItem('ctl-overrides')).toBeNull();
  });
});
