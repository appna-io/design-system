'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAutoplayOptions {
  /** Master enable flag from `<Carousel autoplay>`. */
  enabled: boolean;
  /** Tick interval in ms. */
  interval: number;
  /** Direction of autoplay advance. */
  direction: 'forward' | 'backward';
  /** Pause when the pointer hovers the viewport. */
  pauseOnHover: boolean;
  /** Pause when any element inside the viewport is focused. */
  pauseOnFocus: boolean;
  /** Pause when `prefers-reduced-motion: reduce`. */
  pauseOnReducedMotion: boolean;
  /** Ref to the element that should listen to hover + focus events (the viewport). */
  viewportRef: React.RefObject<HTMLElement | null>;
  /** Advance / retreat callbacks the autoplay timer fires. */
  next: () => void;
  prev: () => void;
}

export interface UseAutoplayReturn {
  /** True when the autoplay is currently running (not paused for any reason). */
  isPlaying: boolean;
  /** True specifically when the user has toggled pause via the AutoplayControl button. */
  isUserPaused: boolean;
  /** User-initiated pause (sticky until `userPlay`). */
  userPause: () => void;
  /** User-initiated play (clears all sticky pauses). */
  userPlay: () => void;
}

interface PauseState {
  user: boolean;
  hover: boolean;
  focus: boolean;
  reducedMotion: boolean;
  documentHidden: boolean;
}

const INITIAL_PAUSE_STATE: PauseState = {
  user: false,
  hover: false,
  focus: false,
  reducedMotion: false,
  documentHidden: false,
};

/**
 * Owns autoplay state for `<Carousel>`. Tracks five pause sources (user, hover, focus,
 * reduced-motion, document-hidden) and runs the interval only when none of them are active.
 *
 * Pause sources are deliberately independent — toggling reduced-motion in the OS doesn't undo a
 * user-initiated pause; un-hovering doesn't override a user-initiated pause. The user-pause
 * sticks until the user actively presses Play.
 */
export function useAutoplay(options: UseAutoplayOptions): UseAutoplayReturn {
  const {
    enabled,
    interval,
    direction,
    pauseOnHover,
    pauseOnFocus,
    pauseOnReducedMotion,
    viewportRef,
    next,
    prev,
  } = options;

  const [pauses, setPauses] = useState<PauseState>(INITIAL_PAUSE_STATE);

  // Keep latest next/prev in refs so the interval effect doesn't re-subscribe on every render.
  const nextRef = useRef(next);
  const prevRef = useRef(prev);
  useEffect(() => {
    nextRef.current = next;
    prevRef.current = prev;
  });

  // Reduced-motion: initialize from matchMedia and listen for live changes.
  useEffect(() => {
    if (!pauseOnReducedMotion) {
      setPauses((p) => ({ ...p, reducedMotion: false }));
      return undefined;
    }
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPauses((p) => ({ ...p, reducedMotion: mq.matches }));
    const onChange = (event: MediaQueryListEvent) => {
      setPauses((p) => ({ ...p, reducedMotion: event.matches }));
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pauseOnReducedMotion]);

  // Document visibility: pause when the tab is backgrounded.
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const onVis = () => {
      setPauses((p) => ({ ...p, documentHidden: document.hidden }));
    };
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Hover and focus listeners on the viewport element.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return undefined;
    const onEnter = () => {
      if (pauseOnHover) setPauses((p) => ({ ...p, hover: true }));
    };
    const onLeave = () => {
      if (pauseOnHover) setPauses((p) => ({ ...p, hover: false }));
    };
    const onFocusIn = () => {
      if (pauseOnFocus) setPauses((p) => ({ ...p, focus: true }));
    };
    const onFocusOut = () => {
      if (pauseOnFocus) setPauses((p) => ({ ...p, focus: false }));
    };
    node.addEventListener('mouseenter', onEnter);
    node.addEventListener('mouseleave', onLeave);
    node.addEventListener('focusin', onFocusIn);
    node.addEventListener('focusout', onFocusOut);
    return () => {
      node.removeEventListener('mouseenter', onEnter);
      node.removeEventListener('mouseleave', onLeave);
      node.removeEventListener('focusin', onFocusIn);
      node.removeEventListener('focusout', onFocusOut);
    };
  }, [viewportRef, pauseOnHover, pauseOnFocus]);

  // Whether ANY pause source is active.
  const anyPause =
    pauses.user || pauses.hover || pauses.focus || pauses.reducedMotion || pauses.documentHidden;
  const isPlaying = enabled && !anyPause;

  // The interval. Re-creates when enabled/interval/direction/playing flips.
  useEffect(() => {
    if (!isPlaying) return undefined;
    if (interval <= 0) return undefined;
    const id = setInterval(() => {
      if (direction === 'forward') {
        nextRef.current();
      } else {
        prevRef.current();
      }
    }, interval);
    return () => clearInterval(id);
  }, [isPlaying, interval, direction]);

  const userPause = useCallback(() => {
    setPauses((p) => ({ ...p, user: true }));
  }, []);

  const userPlay = useCallback(() => {
    // Clears user-pause specifically. Other pause sources (hover, focus, reduced-motion,
    // document hidden) still apply; once those clear, the interval resumes naturally.
    setPauses((p) => ({ ...p, user: false }));
  }, []);

  return {
    isPlaying,
    isUserPaused: pauses.user,
    userPause,
    userPlay,
  };
}
