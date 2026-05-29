import { detectHotkeyPlatform, type HotkeyPlatform } from './platformKey';

/**
 * The parsed hotkey shape. `mod` is the cross-platform shortcut for "Cmd on Mac, Ctrl
 * elsewhere" — matches the convention used by TanStack hotkeys / Linear / VS Code.
 *
 * `key` is normalized: single letters → uppercase, named keys → their `KeyboardEvent.key` form
 * with the first letter uppercased ('Enter', 'Escape', 'ArrowDown', etc.). Punctuation passes
 * through verbatim (`/`, `?`, `+`).
 */
export interface ParsedHotkey {
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

const TOKEN_SEPARATOR = /\s*\+\s*/;

const MODIFIER_ALIASES: Record<string, keyof Omit<ParsedHotkey, 'key'>> = {
  $mod: 'mod',
  mod: 'mod',
  cmd: 'meta',
  command: 'meta',
  meta: 'meta',
  win: 'meta',
  super: 'meta',
  ctrl: 'ctrl',
  control: 'ctrl',
  alt: 'alt',
  option: 'alt',
  opt: 'alt',
  shift: 'shift',
};

/** Normalize a non-modifier token to its `KeyboardEvent.key` form. */
function normalizeKey(token: string): string {
  const lower = token.toLowerCase();
  // Single-letter alphabetic → uppercase. Numeric / punctuation pass through.
  if (/^[a-z]$/.test(lower)) return lower.toUpperCase();
  // Common named-key aliases. We map to the W3C `KeyboardEvent.key` values so `matchesHotkey`
  // compares apples to apples without re-mapping at match time.
  const NAMED: Record<string, string> = {
    enter: 'Enter',
    return: 'Enter',
    escape: 'Escape',
    esc: 'Escape',
    space: ' ',
    spacebar: ' ',
    tab: 'Tab',
    backspace: 'Backspace',
    delete: 'Delete',
    del: 'Delete',
    up: 'ArrowUp',
    arrowup: 'ArrowUp',
    down: 'ArrowDown',
    arrowdown: 'ArrowDown',
    left: 'ArrowLeft',
    arrowleft: 'ArrowLeft',
    right: 'ArrowRight',
    arrowright: 'ArrowRight',
    home: 'Home',
    end: 'End',
    pageup: 'PageUp',
    pagedown: 'PageDown',
  };
  if (lower in NAMED) return NAMED[lower] as string;
  // Anything else is treated as a raw key string. `KeyboardEvent.key` for `/`, `+`, `?` etc.
  // is the character itself.
  return token;
}

/**
 * Parse a hotkey string like `'$mod+K'`, `'Ctrl+Shift+P'`, `'Cmd+/'` into a structured shape.
 *
 * Tokens are split on `+` with surrounding whitespace tolerated. Modifier tokens are aliased
 * via `MODIFIER_ALIASES`; the final non-modifier token is the `key`. Empty input throws — a
 * hotkey with no key is meaningless.
 */
export function parseHotkey(hotkey: string): ParsedHotkey {
  const tokens = hotkey.trim().split(TOKEN_SEPARATOR).filter(Boolean);
  if (tokens.length === 0) {
    throw new Error(`[apx-ds] parseHotkey: empty hotkey string.`);
  }

  const result: ParsedHotkey = {
    mod: false,
    ctrl: false,
    meta: false,
    alt: false,
    shift: false,
    key: '',
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i] as string;
    const lower = token.toLowerCase();
    const modifier = MODIFIER_ALIASES[lower];
    const isLast = i === tokens.length - 1;
    if (modifier && !isLast) {
      result[modifier] = true;
      continue;
    }
    // Last token (or first non-modifier) is the key.
    if (modifier && isLast) {
      // Edge case: `'Shift+'` or `'Cmd+'` with no key. Treat as invalid.
      throw new Error(`[apx-ds] parseHotkey: hotkey "${hotkey}" has no non-modifier key.`);
    }
    result.key = normalizeKey(token);
  }

  if (!result.key) {
    throw new Error(`[apx-ds] parseHotkey: hotkey "${hotkey}" has no non-modifier key.`);
  }

  return result;
}

/**
 * Resolve `$mod` to the platform-specific modifier on a `ParsedHotkey`. After calling, the
 * `mod` flag is gone and the appropriate `meta` (Mac) or `ctrl` (else) is set. Useful when
 * matching against a `KeyboardEvent` since events expose `event.metaKey` and `event.ctrlKey`
 * separately, never a unified `mod`.
 */
export function resolveMod(
  parsed: ParsedHotkey,
  platform: HotkeyPlatform = detectHotkeyPlatform(),
): ParsedHotkey {
  if (!parsed.mod) return parsed;
  const isMac = platform === 'mac';
  return {
    ...parsed,
    mod: false,
    meta: parsed.meta || isMac,
    ctrl: parsed.ctrl || !isMac,
  };
}

/**
 * Returns `true` when the keyboard event matches the parsed hotkey. Resolves `$mod` against
 * the runtime platform (or an injected `platform` for tests).
 *
 * Modifier semantics are **strict** — pressing `Ctrl+Shift+K` does NOT match a `Ctrl+K` hotkey
 * because the extra `Shift` is a different gesture (often bound to a different command).
 */
export function matchesHotkey(
  event: KeyboardEvent,
  hotkey: ParsedHotkey,
  platform: HotkeyPlatform = detectHotkeyPlatform(),
): boolean {
  const resolved = resolveMod(hotkey, platform);
  if (Boolean(event.metaKey) !== resolved.meta) return false;
  if (Boolean(event.ctrlKey) !== resolved.ctrl) return false;
  if (Boolean(event.altKey) !== resolved.alt) return false;
  if (Boolean(event.shiftKey) !== resolved.shift) return false;
  // Compare keys case-insensitively for letters; verbatim for everything else (named keys are
  // already canonical from normalizeKey, and punctuation is single-char).
  const a = resolved.key;
  const b = event.key;
  if (a.length === 1 && b.length === 1) {
    return a.toLowerCase() === b.toLowerCase();
  }
  return a === b;
}
