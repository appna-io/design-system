import type { Direction } from '@apx-ui/engine';
import type { ModeSetting, PlatformSetting } from './context';
import { DETECT_PLATFORM_EXPR } from './platform';

export interface ThemeScriptProps {
  /** Must match the `storageKey` passed to `ThemeProvider`. */
  storageKey?: string | null;
  /** Mode to apply if nothing is persisted. Defaults to `'system'`. */
  defaultMode?: ModeSetting;
  /** Direction to apply if nothing is persisted. Defaults to `'ltr'`. */
  defaultDir?: Direction;
  /** Variant to apply if nothing is persisted. Defaults to `'default'`. */
  defaultVariant?: string;
  /**
   * Platform setting to apply if nothing is persisted. Defaults to `'auto'`. With `'auto'` the
   * script sniffs the browser (Safari → `apple`, everything else → `other`) and writes the
   * resolved value to `<html data-platform="…">` before paint.
   */
  defaultPlatform?: PlatformSetting;
}

/**
 * Inline script that runs **before hydration** to read the persisted theme settings from
 * `localStorage` and apply `data-mode`, `data-variant`, `data-platform`, and `dir` attributes to
 * `<html>`. Drop it in your `<head>` (or Next.js `app/layout.tsx`) to eliminate the dark-mode
 * flash and the platform-overlay flash on first paint.
 *
 * The platform detection logic is sourced from `DETECT_PLATFORM_EXPR` so SSR and CSR can't drift.
 *
 * The script is intentionally tiny and dependency-free — it's serialized verbatim into the DOM.
 */
export function ThemeScript({
  storageKey = 'sds-theme',
  defaultMode = 'system',
  defaultDir = 'ltr',
  defaultVariant = 'default',
  defaultPlatform = 'auto',
}: ThemeScriptProps) {
  const key = storageKey ?? '';
  const code = `(() => {
  try {
    var k = ${JSON.stringify(key)};
    var d = document.documentElement;
    var m = k ? localStorage.getItem(k + '-mode') : null;
    if (m !== 'light' && m !== 'dark' && m !== 'system') m = ${JSON.stringify(defaultMode)};
    var resolved = m === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : m;
    d.setAttribute('data-mode', resolved);
    var v = k ? localStorage.getItem(k + '-variant') : null;
    d.setAttribute('data-variant', v || ${JSON.stringify(defaultVariant)});
    var p = k ? localStorage.getItem(k + '-platform') : null;
    if (p !== 'apple' && p !== 'other' && p !== 'auto') p = ${JSON.stringify(defaultPlatform)};
    var resolvedPlatform = p === 'auto' ? ${DETECT_PLATFORM_EXPR} : p;
    d.setAttribute('data-platform', resolvedPlatform);
    var dir = k ? localStorage.getItem(k + '-dir') : null;
    if (dir !== 'ltr' && dir !== 'rtl') dir = ${JSON.stringify(defaultDir)};
    d.setAttribute('dir', dir);
  } catch (e) {}
})();`;
  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: code }} />;
}
ThemeScript.displayName = 'ThemeScript';
