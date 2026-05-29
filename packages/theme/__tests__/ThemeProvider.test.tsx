import { useDirection } from '@apx-ui/engine';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../src/ThemeProvider';
import { useMode } from '../src/hooks/useMode';
import { usePlatform } from '../src/hooks/usePlatform';
import { useTheme } from '../src/hooks/useTheme';
import { useThemeDirection } from '../src/hooks/useDirectionWithSetter';
import { useThemeOverrides } from '../src/hooks/useThemeOverrides';
import { useVariant } from '../src/hooks/useVariant';

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
  document.documentElement.removeAttribute('data-mode');
  document.documentElement.removeAttribute('data-variant');
  document.documentElement.removeAttribute('data-platform');
  document.documentElement.removeAttribute('dir');
  document.documentElement.style.transition = '';
});

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-mode');
  document.documentElement.removeAttribute('data-variant');
  document.documentElement.removeAttribute('data-platform');
  document.documentElement.removeAttribute('dir');
  document.documentElement.style.transition = '';
});

function ModeToggle() {
  const { resolvedMode, setMode } = useMode();
  return (
    <button
      type="button"
      data-testid="mode"
      onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
    >
      {resolvedMode}
    </button>
  );
}

function VariantToggle() {
  const { variant, setVariant } = useVariant();
  return (
    <button type="button" data-testid="variant" onClick={() => setVariant('origami')}>
      {variant}
    </button>
  );
}

function DirToggle() {
  const { dir, setDir } = useThemeDirection();
  return (
    <button type="button" data-testid="dir" onClick={() => setDir(dir === 'rtl' ? 'ltr' : 'rtl')}>
      {dir}
    </button>
  );
}

function EngineDirReader() {
  const dir = useDirection();
  return <span data-testid="engine-dir">{dir}</span>;
}

describe('ThemeProvider', () => {
  it('renders children and injects a <style> tag', () => {
    const { container } = render(
      <ThemeProvider>
        <p>hi</p>
      </ThemeProvider>,
    );
    const style = container.querySelector('style[data-apx-ds-theme]');
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain('--sds-palette-primary-main');
  });

  it('sets data-mode/data-variant/dir on <html> on mount', async () => {
    render(
      <ThemeProvider defaultMode="dark" defaultVariant="tetsu" defaultDir="rtl">
        <p>hi</p>
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
      expect(document.documentElement.getAttribute('data-variant')).toBe('tetsu');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });
  });

  it('switching mode updates data-mode and persists to localStorage', async () => {
    const { getByTestId } = render(
      <ThemeProvider defaultMode="light">
        <ModeToggle />
      </ThemeProvider>,
    );
    expect(getByTestId('mode').textContent).toBe('light');
    fireEvent.click(getByTestId('mode'));
    await waitFor(() => {
      expect(getByTestId('mode').textContent).toBe('dark');
      expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
      expect(localStorage.getItem('sds-theme-mode')).toBe('dark');
    });
  });

  it('switching variant updates data-variant', async () => {
    const { getByTestId } = render(
      <ThemeProvider defaultVariant="default">
        <VariantToggle />
      </ThemeProvider>,
    );
    expect(getByTestId('variant').textContent).toBe('default');
    fireEvent.click(getByTestId('variant'));
    await waitFor(() => {
      expect(getByTestId('variant').textContent).toBe('origami');
      expect(document.documentElement.getAttribute('data-variant')).toBe('origami');
      expect(localStorage.getItem('sds-theme-variant')).toBe('origami');
    });
  });

  it('switching dir updates the dir attribute and engine useDirection sees it', async () => {
    const { getByTestId } = render(
      <ThemeProvider defaultDir="ltr">
        <DirToggle />
        <EngineDirReader />
      </ThemeProvider>,
    );
    expect(getByTestId('engine-dir').textContent).toBe('ltr');
    fireEvent.click(getByTestId('dir'));
    await waitFor(() => {
      expect(getByTestId('dir').textContent).toBe('rtl');
      expect(getByTestId('engine-dir').textContent).toBe('rtl');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });
  });

  it('reads persisted mode/variant/dir from localStorage on mount', async () => {
    localStorage.setItem('sds-theme-mode', 'dark');
    localStorage.setItem('sds-theme-variant', 'tetsu');
    localStorage.setItem('sds-theme-dir', 'rtl');

    const { getByTestId } = render(
      <ThemeProvider>
        <ModeToggle />
        <VariantToggle />
        <DirToggle />
      </ThemeProvider>,
    );
    expect(getByTestId('mode').textContent).toBe('dark');
    expect(getByTestId('variant').textContent).toBe('tetsu');
    expect(getByTestId('dir').textContent).toBe('rtl');
  });

  it('disables persistence when storageKey is null', () => {
    function Inner() {
      const { setMode } = useTheme();
      return (
        <button type="button" onClick={() => setMode('dark')}>
          go
        </button>
      );
    }
    const { container } = render(
      <ThemeProvider storageKey={null}>
        <Inner />
      </ThemeProvider>,
    );
    act(() => {
      container.querySelector('button')!.click();
    });
    expect(localStorage.getItem('sds-theme-mode')).toBeNull();
  });

  it('useTheme throws when called outside the provider', () => {
    function Inner() {
      useTheme();
      return null;
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Inner />)).toThrow(/<ThemeProvider>/);
    spy.mockRestore();
  });

  it("writes data-platform from runtime detection when defaultPlatform is 'auto'", async () => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
        vendor: 'Apple Computer, Inc.',
      },
    });
    render(
      <ThemeProvider>
        <p>hi</p>
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-platform')).toBe('apple');
    });
  });

  it("respects an explicit defaultPlatform='other' override", async () => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
        vendor: 'Apple Computer, Inc.',
      },
    });
    render(
      <ThemeProvider defaultPlatform="other">
        <p>hi</p>
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-platform')).toBe('other');
    });
  });

  function PlatformProbe() {
    const { platform, setting, setPlatform, isApple } = usePlatform();
    return (
      <div>
        <span data-testid="platform">{platform}</span>
        <span data-testid="setting">{setting}</span>
        <span data-testid="is-apple">{String(isApple)}</span>
        <button type="button" data-testid="pin-apple" onClick={() => setPlatform('apple')}>
          pin
        </button>
        <button type="button" data-testid="pin-auto" onClick={() => setPlatform('auto')}>
          auto
        </button>
      </div>
    );
  }

  function OverrideProbe() {
    const { theme } = useTheme();
    const { overrides, patchOverrides, setOverrides, resetOverrides, hasOverrides } =
      useThemeOverrides();
    return (
      <div>
        <span data-testid="primary-main">{theme.palette.light.primary.main}</span>
        <span data-testid="radius-md">{theme.radius.md}</span>
        <span data-testid="has-overrides">{String(hasOverrides)}</span>
        <span data-testid="overrides-json">{JSON.stringify(overrides)}</span>
        <button
          type="button"
          data-testid="patch-primary"
          onClick={() =>
            patchOverrides({ palette: { light: { primary: { main: '#ff5722' } } } })
          }
        >
          patch
        </button>
        <button
          type="button"
          data-testid="patch-radius"
          onClick={() => patchOverrides({ radius: { md: '999px' } })}
        >
          patch radius
        </button>
        <button
          type="button"
          data-testid="set"
          onClick={() => setOverrides({ palette: { light: { primary: { main: '#000000' } } } })}
        >
          set
        </button>
        <button type="button" data-testid="reset" onClick={resetOverrides}>
          reset
        </button>
      </div>
    );
  }

  it('patchOverrides deep-merges and re-renders effectiveTheme', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <OverrideProbe />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('has-overrides').textContent).toBe('false');
    });

    fireEvent.click(getByTestId('patch-primary'));
    await waitFor(() => {
      expect(getByTestId('primary-main').textContent).toBe('#ff5722');
      expect(getByTestId('has-overrides').textContent).toBe('true');
    });

    fireEvent.click(getByTestId('patch-radius'));
    await waitFor(() => {
      expect(getByTestId('primary-main').textContent).toBe('#ff5722');
      expect(getByTestId('radius-md').textContent).toBe('999px');
    });
  });

  it('setOverrides replaces the whole override object wholesale', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <OverrideProbe />
      </ThemeProvider>,
    );

    fireEvent.click(getByTestId('patch-radius'));
    await waitFor(() => {
      expect(getByTestId('radius-md').textContent).toBe('999px');
    });

    fireEvent.click(getByTestId('set'));
    await waitFor(() => {
      expect(getByTestId('primary-main').textContent).toBe('#000000');
      // patch-radius override was wiped because setOverrides replaces wholesale
      expect(getByTestId('radius-md').textContent).not.toBe('999px');
    });
  });

  it('resetOverrides clears all overrides and returns to defaults', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <OverrideProbe />
      </ThemeProvider>,
    );

    const original = getByTestId('primary-main').textContent;
    fireEvent.click(getByTestId('patch-primary'));
    await waitFor(() => {
      expect(getByTestId('primary-main').textContent).toBe('#ff5722');
    });

    fireEvent.click(getByTestId('reset'));
    await waitFor(() => {
      expect(getByTestId('primary-main').textContent).toBe(original);
      expect(getByTestId('has-overrides').textContent).toBe('false');
    });
  });

  it('persists overrides to localStorage and clears them on reset', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <OverrideProbe />
      </ThemeProvider>,
    );

    fireEvent.click(getByTestId('patch-primary'));
    await waitFor(() => {
      const raw = localStorage.getItem('sds-theme-overrides');
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual({
        palette: { light: { primary: { main: '#ff5722' } } },
      });
    });

    fireEvent.click(getByTestId('reset'));
    await waitFor(() => {
      expect(localStorage.getItem('sds-theme-overrides')).toBeNull();
    });
  });

  it('reads persisted overrides from localStorage on mount', async () => {
    localStorage.setItem(
      'sds-theme-overrides',
      JSON.stringify({ palette: { light: { primary: { main: '#abcdef' } } } }),
    );

    const { getByTestId } = render(
      <ThemeProvider>
        <OverrideProbe />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('primary-main').textContent).toBe('#abcdef');
      expect(getByTestId('has-overrides').textContent).toBe('true');
    });
  });

  it('accepts defaultOverrides when nothing is persisted yet', async () => {
    const { getByTestId } = render(
      <ThemeProvider
        defaultOverrides={{ palette: { light: { primary: { main: '#16a34a' } } } }}
      >
        <OverrideProbe />
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(getByTestId('primary-main').textContent).toBe('#16a34a');
    });
  });

  it('setPlatform pins the platform and persists; auto re-enables detection', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { userAgent: 'Mozilla/5.0 Firefox/124.0', vendor: '' },
    });

    const { getByTestId } = render(
      <ThemeProvider>
        <PlatformProbe />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('platform').textContent).toBe('other');
      expect(getByTestId('setting').textContent).toBe('auto');
    });

    fireEvent.click(getByTestId('pin-apple'));
    await waitFor(() => {
      expect(getByTestId('platform').textContent).toBe('apple');
      expect(getByTestId('setting').textContent).toBe('apple');
      expect(getByTestId('is-apple').textContent).toBe('true');
      expect(document.documentElement.getAttribute('data-platform')).toBe('apple');
      expect(localStorage.getItem('sds-theme-platform')).toBe('apple');
    });

    fireEvent.click(getByTestId('pin-auto'));
    await waitFor(() => {
      expect(getByTestId('platform').textContent).toBe('other');
      expect(getByTestId('setting').textContent).toBe('auto');
      expect(document.documentElement.getAttribute('data-platform')).toBe('other');
    });
  });
});
