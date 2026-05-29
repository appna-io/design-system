/**
 * Tiny OS-detect helper used by the hotkey parser + `<Kbd platform="auto">`. We detect
 * via `navigator.platform` because it's the only synchronous-and-everywhere-supported source —
 * userAgent strings lie, `navigator.userAgentData` is Chromium-only, and CSS env vars require
 * a media query.
 *
 * Returns `'mac'` on macOS / iOS / iPadOS, `'win'` on Windows, `'linux'` on everything else
 * (including Android, ChromeOS, BSD — anywhere `$mod` should mean Ctrl rather than Cmd).
 *
 * **Naming note:** this answers "what OS are we on, for keyboard-glyph rendering?" and is
 * deliberately distinct from `@apx-ui/theme`'s `detectPlatform()` which answers
 * "is this Apple-WebKit, for the Cupertino theme variant?". The two helpers solve different
 * problems with different return types (`'mac' | 'win' | 'linux'` vs `'apple' | 'other'`);
 * they coexist on `apx-ds`'s public surface under disambiguated names.
 *
 * SSR-safe: returns `'linux'` (the broadest default) when `navigator` is unavailable.
 */

export type HotkeyPlatform = 'mac' | 'win' | 'linux';

export function detectHotkeyPlatform(): HotkeyPlatform {
  if (typeof navigator === 'undefined') return 'linux';
  // `navigator.platform` is deprecated but still ships in every browser; the proposed
  // `userAgentData.platform` is Chromium-only, so we'd need a fallback anyway. We use the
  // deprecated property and accept the cost.
  const p = String(navigator.platform || '').toLowerCase();
  if (p.startsWith('mac') || /iphone|ipad|ipod/.test(p)) return 'mac';
  if (p.startsWith('win')) return 'win';
  return 'linux';
}

/**
 * Glyph mapping for printable hotkey symbols. Returns the macOS glyph on Mac, the
 * Windows/Linux spelling everywhere else. Used by `<Kbd>` and the default footer hint text.
 *
 *  - `cmd`   → `⌘` on Mac, `Ctrl` elsewhere (this is the `$mod` cross-platform key)
 *  - `meta`  → `⌘` on Mac, `Win`/`Super` elsewhere (the literal Windows / Super key)
 *  - `ctrl`  → `⌃` (control caret) on Mac, `Ctrl` elsewhere
 *  - `alt`   → `⌥` (option) on Mac, `Alt` elsewhere
 *  - `shift` → `⇧` on Mac, `Shift` elsewhere
 *  - `enter` → `↵`
 *  - `return`→ `↵`
 *  - `esc`   → `Esc`
 *  - `up` / `down` / `left` / `right` → `↑` / `↓` / `←` / `→`
 *  - `backspace` → `⌫`
 *  - `delete`    → `⌦` on Mac, `Del` elsewhere
 *  - `tab`       → `⇥`
 *  - `space`     → `␣`
 *
 * Unknown names pass through unchanged (so `macKey('A')` returns `'A'`).
 */
export function macKey(name: string, platform: HotkeyPlatform = detectHotkeyPlatform()): string {
  const key = name.toLowerCase();
  const isMac = platform === 'mac';
  switch (key) {
    case 'cmd':
    case '$mod':
    case 'mod':
      return isMac ? '⌘' : 'Ctrl';
    case 'meta':
    case 'win':
    case 'super':
      return isMac ? '⌘' : 'Win';
    case 'ctrl':
    case 'control':
      return isMac ? '⌃' : 'Ctrl';
    case 'alt':
    case 'option':
    case 'opt':
      return isMac ? '⌥' : 'Alt';
    case 'shift':
      return isMac ? '⇧' : 'Shift';
    case 'enter':
    case 'return':
      return '↵';
    case 'esc':
    case 'escape':
      return 'Esc';
    case 'up':
    case 'arrowup':
      return '↑';
    case 'down':
    case 'arrowdown':
      return '↓';
    case 'left':
    case 'arrowleft':
      return '←';
    case 'right':
    case 'arrowright':
      return '→';
    case 'backspace':
      return '⌫';
    case 'delete':
    case 'del':
      return isMac ? '⌦' : 'Del';
    case 'tab':
      return '⇥';
    case 'space':
      return '␣';
    case 'plus':
      return '+';
    case 'minus':
      return '−';
    default:
      return name;
  }
}
