'use client';

import { useEffect, useRef } from 'react';

import { matchesHotkey, parseHotkey, type ParsedHotkey } from './parseHotkey';

export interface UseGlobalHotkeyOptions {
  /** The hotkey string (e.g. `'$mod+K'`, `'Ctrl+Shift+P'`) or a pre-parsed `ParsedHotkey`. */
  hotkey: string | ParsedHotkey;
  /** Handler invoked when the hotkey matches. */
  onTrigger: (event: KeyboardEvent) => void;
  /** Default: `true`. When `false`, the listener is detached (no-op). */
  enabled?: boolean;
  /**
   * Skip the hotkey when focus is inside an editable element (input, textarea,
   * contenteditable). Default: `false` — `$mod+K` should typically open the palette even from
   * inside an input, but consumers can opt in to skip if they bind a non-modifier-only hotkey.
   */
  skipWhenEditable?: boolean;
  /**
   * Call `event.preventDefault()` on a match. Default: `true` — without it the browser's
   * default for `$mod+K` (search-in-page on some browsers) fires alongside the handler.
   */
  preventDefault?: boolean;
}

// ── Module-level singleton listener registry ────────────────────────────────────────────────
//
// Why a singleton? `$mod+K` is a global hotkey — there is only one keystroke, regardless of how
// many `<CommandPalette>` instances are mounted. The previous design installed one `keydown`
// listener per call site, which meant pressing the hotkey fired *every* registered handler at
// once. On documentation / playground pages that render multiple palette examples (the renderer
// hosts 14 on `/components/command-palette`), this opened every palette simultaneously — each
// one mounting its own Modal focus trap, and N traps fighting over `document.activeElement`
// drove the focusin recovery loop in `useFocusTrap` into a stack overflow that crashed the tab.
//
// The fix: keep exactly one DOM listener per (hotkey, skipWhenEditable, preventDefault) tuple
// and dispatch to the **most recently registered active subscriber**. "Most recent" matches the
// usual UX expectation that the latest-mounted palette is the foreground one (Modal stacking
// also uses last-mounted-on-top). When that subscriber unmounts, we fall back to the next in
// the stack so the hotkey stays live as long as any palette is enabled.
interface HotkeySubscriber {
  id: number;
  handlerRef: { current: (event: KeyboardEvent) => void };
}

interface HotkeyBucket {
  subscribers: HotkeySubscriber[];
  detach: () => void;
}

let subscriberIdCounter = 0;
const hotkeyBuckets = new Map<string, HotkeyBucket>();

function bucketKey(hotkeyKey: string, skipWhenEditable: boolean, preventDefault: boolean): string {
  return `${hotkeyKey}|${skipWhenEditable ? '1' : '0'}|${preventDefault ? '1' : '0'}`;
}

function subscribe(
  hotkeyKey: string,
  parsed: ParsedHotkey,
  skipWhenEditable: boolean,
  preventDefault: boolean,
  handlerRef: HotkeySubscriber['handlerRef'],
): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const key = bucketKey(hotkeyKey, skipWhenEditable, preventDefault);
  let bucket = hotkeyBuckets.get(key);
  if (!bucket) {
    const listener = (event: KeyboardEvent): void => {
      const current = hotkeyBuckets.get(key);
      if (!current || current.subscribers.length === 0) return;
      if (!matchesHotkey(event, parsed)) return;
      if (skipWhenEditable && isEventInEditable(event)) return;
      if (preventDefault) event.preventDefault();
      // Dispatch only to the most recently registered subscriber. This mirrors Modal/Popover
      // "topmost wins" semantics so the foreground palette responds and shadows the others.
      const top = current.subscribers[current.subscribers.length - 1];
      top?.handlerRef.current(event);
    };
    window.addEventListener('keydown', listener);
    bucket = {
      subscribers: [],
      detach: () => window.removeEventListener('keydown', listener),
    };
    hotkeyBuckets.set(key, bucket);
  }
  subscriberIdCounter += 1;
  const sub: HotkeySubscriber = { id: subscriberIdCounter, handlerRef };
  bucket.subscribers.push(sub);
  return () => {
    const current = hotkeyBuckets.get(key);
    if (!current) return;
    current.subscribers = current.subscribers.filter((s) => s.id !== sub.id);
    if (current.subscribers.length === 0) {
      current.detach();
      hotkeyBuckets.delete(key);
    }
  };
}

/**
 * Window-level keyboard listener that fires `onTrigger` when the hotkey matches. Auto-detaches
 * on unmount; safe in SSR (no-op until the effect runs client-side).
 *
 * Multiple call sites that register the **same** hotkey share a single DOM listener and only
 * the most recently mounted active subscriber receives the event — see the comment on
 * `hotkeyBuckets` above for why.
 *
 * Uses a ref for the handler so consumers can pass an inline function without forcing the
 * effect to re-bind every render (the listener registration is the expensive part, not the
 * handler invocation).
 */
export function useGlobalHotkey(opts: UseGlobalHotkeyOptions): void {
  const { hotkey, enabled = true, skipWhenEditable = false, preventDefault = true } = opts;

  // Ref the handler so we don't re-bind on every render.
  const handlerRef = useRef(opts.onTrigger);
  useEffect(() => {
    handlerRef.current = opts.onTrigger;
  }, [opts.onTrigger]);

  // Stable string fingerprint of the hotkey — avoids re-binding the global listener when a
  // consumer passes a fresh `ParsedHotkey` object every render. Serializing here keeps the
  // dependency list a plain primitive, satisfying `react-hooks/exhaustive-deps`.
  const hotkeyKey = typeof hotkey === 'string' ? hotkey : serializeParsedHotkey(hotkey);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    const parsed: ParsedHotkey = typeof hotkey === 'string' ? parseHotkey(hotkey) : hotkey;
    return subscribe(hotkeyKey, parsed, skipWhenEditable, preventDefault, handlerRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotkeyKey, enabled, skipWhenEditable, preventDefault]);
}

function serializeParsedHotkey(p: ParsedHotkey): string {
  return `${p.mod ? 'm' : ''}${p.meta ? 'M' : ''}${p.ctrl ? 'c' : ''}${p.alt ? 'a' : ''}${p.shift ? 's' : ''}|${p.key}`;
}

function isEventInEditable(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable === true;
}
