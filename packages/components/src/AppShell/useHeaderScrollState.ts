'use client';

import { useReducedMotion } from '@apx-ui/engine';
import { useEffect, useRef, useState, type RefObject } from 'react';

import type { AppShellHeaderScroll } from './AppShell.types';

/**
 * How far the page must scroll before the header is considered "scrolled", in px.
 *
 * Not zero. At zero the header changes state on the very first wheel notch, which reads as the
 * chrome twitching rather than as a deliberate transition — and on a trackpad, rubber-band
 * overscroll at the top of the page toggles it repeatedly while the user is not really scrolling.
 * A short threshold means the change coincides with the hero starting to leave.
 */
const SCROLLED_AFTER = 24;

/**
 * How far the user must scroll *down* before a `reveal` header hides, and how far *up* before it
 * comes back. Asymmetric on purpose: hiding needs commitment, showing must feel instant, because
 * the user scrolling up is usually reaching for the nav.
 */
const HIDE_AFTER = 96;
const SHOW_AFTER = 8;

export interface HeaderScrollState {
  /** Past the threshold — the header should condense. */
  scrolled: boolean;
  /** `reveal` only: the header is currently hidden because the user is scrolling down. */
  hidden: boolean;
  /** Attach to the header element. It's the anchor used to find which thing actually scrolls. */
  ref: RefObject<HTMLElement | null>;
}

/**
 * Finds the element the header actually scrolls within, or `null` for the page itself.
 *
 * Listening on `window` unconditionally is the obvious implementation and it is wrong for a whole
 * class of layout: an `AppShell` embedded in a pane — a docs preview, a split view, a desktop app
 * whose content region scrolls independently of the chrome — never moves the window at all, so the
 * header would sit inert forever while the content scrolled past it. That is silent: nothing
 * errors, the header simply never condenses.
 *
 * The walk stops at the first ancestor that both *can* scroll (`overflow-y` is auto/scroll) and
 * currently *does* (its content overflows). Requiring both matters — plenty of wrappers declare
 * `overflow-y: auto` defensively without ever overflowing, and latching onto one of those would
 * pick a container that never emits a scroll event.
 */
function findScrollParent(element: HTMLElement): HTMLElement | null {
  let node = element.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    const overflowY = getComputedStyle(node).overflowY;
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * Tracks the page scroll to drive the header's condensed / hidden state.
 *
 * ## Why this belongs in the DS
 *
 * A pinned header that never changes on scroll reads as unfinished on a marketing page, so every
 * template writes this listener. Three templates means three thresholds, three rAF loops, and
 * three chances to forget the reduced-motion path. It's one listener's worth of code and exactly
 * the kind of thing that should exist once.
 *
 * ## Reduced motion
 *
 * `condense` still runs: it's a *state* change (a border, a background) that happens to be
 * animated by CSS, and suppressing it would leave the header transparent over content it no
 * longer sits on — a legibility bug, not a courtesy.
 *
 * `reveal` does **not** run. Chrome that moves itself off-screen is precisely the kind of
 * unrequested motion the preference is about, and the fallback — a header that stays put — is
 * strictly more usable.
 */
export function useHeaderScrollState(
  behavior: AppShellHeaderScroll,
  reduceMotion?: boolean,
): HeaderScrollState {
  const reduced = useReducedMotion(reduceMotion);
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<{ scrolled: boolean; hidden: boolean }>({
    scrolled: false,
    hidden: false,
  });

  const lastY = useRef(0);
  /** Where the current run of scrolling in one direction began. */
  const anchor = useRef(0);
  const direction = useRef<'up' | 'down'>('down');
  const frame = useRef<number | null>(null);
  const pending = useRef(false);

  useEffect(() => {
    if (behavior === 'none' || typeof window === 'undefined') {
      setState({ scrolled: false, hidden: false });
      return;
    }

    // `reveal` degrades to `condense` rather than to nothing: the user still gets the legibility
    // fix, they just don't get chrome that moves on its own.
    const allowReveal = behavior === 'reveal' && !reduced;

    // Resolved once per effect run, after layout, so the header is mounted and its ancestors have
    // their real dimensions.
    const container = ref.current ? findScrollParent(ref.current) : null;
    const target: HTMLElement | Window = container ?? window;
    const readY = () => (container ? container.scrollTop : window.scrollY);

    const measure = () => {
      const y = readY();
      const scrolled = y > SCROLLED_AFTER;

      if (!allowReveal) {
        lastY.current = y;
        setState((prev) =>
          prev.scrolled === scrolled && !prev.hidden ? prev : { scrolled, hidden: false },
        );
        return;
      }

      // Direction is sticky across a frame where nothing moved, so a momentum tail that stalls
      // for a frame doesn't read as a reversal.
      const next: 'up' | 'down' =
        y === lastY.current ? direction.current : y > lastY.current ? 'down' : 'up';

      // A new run resets the anchor. Measuring travel from the anchor rather than from the last
      // frame is what stops a few jittery pixels — a trackpad, a momentum tail — from flipping the
      // header: the user has to commit real distance in one direction.
      if (next !== direction.current) {
        direction.current = next;
        anchor.current = lastY.current;
      }

      const travelled = Math.abs(y - anchor.current);
      lastY.current = y;

      setState((prev) => {
        const hidden =
          next === 'down'
            ? y > SCROLLED_AFTER && travelled > HIDE_AFTER
            : travelled > SHOW_AFTER
              ? false
              : prev.hidden;
        return prev.scrolled === scrolled && prev.hidden === hidden ? prev : { scrolled, hidden };
      });
    };

    // The "already scheduled" guard is a boolean set BEFORE the rAF call, not the frame id
    // returned by it. With the id, the guard depends on `frame.current = requestAnimationFrame(…)`
    // assigning before the callback runs — true in a browser, where rAF is async, and false the
    // moment anything runs it synchronously. In that case `measure` clears the id first and the
    // assignment then puts it back, so every later `schedule()` early-returns and the listener
    // goes permanently deaf. A flag cleared by the callback is correct either way.
    const schedule = () => {
      if (pending.current) return;
      pending.current = true;
      frame.current = requestAnimationFrame(() => {
        pending.current = false;
        measure();
      });
    };

    lastY.current = readY();
    anchor.current = lastY.current;
    direction.current = 'down';
    measure();

    target.addEventListener('scroll', schedule, { passive: true });
    return () => {
      target.removeEventListener('scroll', schedule);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      pending.current = false;
    };
  }, [behavior, reduced]);

  return { ...state, ref };
}
