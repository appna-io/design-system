'use client';

import { useDirection } from '@apx-ui/engine';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import { clampThumb, clampToStep, nearestThumbIndex } from './clampValue';
import { computeValueFromPointer } from './computeValueFromPointer';
import type { SliderOrientation } from './Slider.types';

/**
 * Encapsulates all pointer + keyboard interaction for `<Slider />`. Returns:
 *
 *   - `getTrackProps()` — attach to the track `<span>`. Provides `onPointerDown` that picks the
 *     nearest thumb, jumps it to the pointer position, and starts a drag.
 *   - `getThumbProps(index)` — attach to each thumb `<span>`. Provides `onPointerDown` (starts a
 *     drag on this thumb), `onKeyDown` (W3C Slider pattern), and `data-dragging` / `data-focus`
 *     attributes used by the recipe.
 *   - `trackRef` — the track DOM ref the consumer renders.
 *   - `draggingIndex` — currently-dragging thumb index, or `null`.
 *   - `focusedIndex`  — currently-focused thumb index, or `null`. Used to gate the value bubble
 *     when `showValueLabel='focus'`.
 *
 * **State ownership.** Values live in the caller (Slider component) via `useControllableState`.
 * This hook is presentation-agnostic about value origin: it just calls `commit(nextValues)` on
 * every step change and `commitEnd(values)` on pointerup / keyup.
 *
 * **Listener hygiene.** Pointer move/up are bound to `window` (not the thumb) so a drag survives
 * the pointer leaving the track. Listeners are torn down on pointerup *and* on unmount.
 *
 * **W3C Slider keyboard.**
 *   ArrowRight / ArrowUp   → +step    (vertical: ArrowUp = +step; ArrowDown = -step)
 *   ArrowLeft  / ArrowDown → -step
 *   Shift + Arrow          → ±10 steps
 *   PageUp / PageDown      → ±10 steps (independent of Shift)
 *   Home / End             → min / max (clamped by neighbor thumbs in range mode)
 *
 * In horizontal RTL the left/right arrows are mirrored so "rightward" still means "toward max".
 * Up/Down keys are always direction-agnostic. (Per ARIA Slider authoring practices.)
 */
export interface UseSliderInteractionOptions {
  values: number[];
  min: number;
  max: number;
  step: number | null | undefined;
  minStepsBetweenThumbs: number;
  orientation: SliderOrientation;
  disabled: boolean;
  /** Called on every value change during drag / keyboard nudge. */
  commit: (next: number[]) => void;
  /** Called once on pointerup / keyup with the final values. */
  commitEnd: (final: number[]) => void;
}

export interface UseSliderInteractionReturn {
  trackRef: RefObject<HTMLElement | null>;
  draggingIndex: number | null;
  focusedIndex: number | null;
  hoveringTrack: boolean;
  getTrackProps: () => {
    ref: RefObject<HTMLElement | null>;
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
  };
  getThumbProps: (index: number) => {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
    'data-dragging': 'true' | undefined;
    'data-focus-visible': 'true' | undefined;
  };
}

export function useSliderInteraction(
  options: UseSliderInteractionOptions,
): UseSliderInteractionReturn {
  const {
    values,
    min,
    max,
    step,
    minStepsBetweenThumbs,
    orientation,
    disabled,
    commit,
    commitEnd,
  } = options;

  const dir = useDirection();

  // The track DOM node. Cached rect lives in `dragRef.current.rect` and is refreshed on
  // pointerdown, so a layout read happens at most once per drag rather than per pointermove.
  const trackRef = useRef<HTMLElement | null>(null);

  // `values`-by-ref so the global pointermove listener always sees the latest array without
  // re-binding on every commit.
  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  // Same trick for math params — keeps the global listeners stable across re-renders.
  const paramsRef = useRef({ min, max, step, minStepsBetweenThumbs, orientation, dir });
  useEffect(() => {
    paramsRef.current = { min, max, step, minStepsBetweenThumbs, orientation, dir };
  }, [min, max, step, minStepsBetweenThumbs, orientation, dir]);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [hoveringTrack, setHoveringTrack] = useState(false);

  // Latest committed snapshot, captured at drag start, so commitEnd fires with the final value
  // even when the last pointermove was a no-op (snap-to-step gates the React commit).
  const dragRef = useRef<{
    thumbIndex: number;
    rect: { left: number; top: number; width: number; height: number };
    lastValues: number[];
  } | null>(null);

  const applyCommit = useCallback(
    (next: number[]) => {
      if (next === valuesRef.current) return;
      commit(next);
      if (dragRef.current) dragRef.current.lastValues = next;
    },
    [commit],
  );

  const moveActiveThumbTo = useCallback(
    (rawValue: number) => {
      const drag = dragRef.current;
      if (!drag) return;
      const p = paramsRef.current;
      const next = clampThumb(
        valuesRef.current,
        drag.thumbIndex,
        rawValue,
        p.min,
        p.max,
        p.step,
        p.minStepsBetweenThumbs,
      );
      applyCommit(next);
    },
    [applyCommit],
  );

  const handleGlobalPointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const p = paramsRef.current;
      const v = computeValueFromPointer({
        clientX: event.clientX,
        clientY: event.clientY,
        trackRect: drag.rect,
        min: p.min,
        max: p.max,
        step: p.step,
        orientation: p.orientation,
        dir: p.dir,
      });
      moveActiveThumbTo(v);
    },
    [moveActiveThumbTo],
  );

  const handleGlobalPointerUp = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    window.removeEventListener('pointermove', handleGlobalPointerMove);
    window.removeEventListener('pointerup', handleGlobalPointerUp);
    window.removeEventListener('pointercancel', handleGlobalPointerUp);
    setDraggingIndex(null);
    commitEnd(drag.lastValues);
    dragRef.current = null;
  }, [commitEnd, handleGlobalPointerMove]);

  // Belt-and-suspenders cleanup if the component unmounts mid-drag.
  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [handleGlobalPointerMove, handleGlobalPointerUp]);

  const startDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>, thumbIndex: number, jumpToPointer: boolean) => {
      if (disabled) return;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const dragRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
      dragRef.current = {
        thumbIndex,
        rect: dragRect,
        lastValues: valuesRef.current,
      };
      setDraggingIndex(thumbIndex);

      if (jumpToPointer) {
        const p = paramsRef.current;
        const v = computeValueFromPointer({
          clientX: event.clientX,
          clientY: event.clientY,
          trackRect: dragRect,
          min: p.min,
          max: p.max,
          step: p.step,
          orientation: p.orientation,
          dir: p.dir,
        });
        moveActiveThumbTo(v);
      }

      window.addEventListener('pointermove', handleGlobalPointerMove);
      window.addEventListener('pointerup', handleGlobalPointerUp);
      window.addEventListener('pointercancel', handleGlobalPointerUp);
    },
    [disabled, handleGlobalPointerMove, handleGlobalPointerUp, moveActiveThumbTo],
  );

  const handleTrackPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return;
      // Ignore non-primary buttons (right-click etc.).
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const p = paramsRef.current;
      const target = computeValueFromPointer({
        clientX: event.clientX,
        clientY: event.clientY,
        trackRect: rect,
        min: p.min,
        max: p.max,
        step: p.step,
        orientation: p.orientation,
        dir: p.dir,
      });
      const index = nearestThumbIndex(valuesRef.current, target);
      // Focus the picked thumb so subsequent keyboard input lands there.
      requestAnimationFrame(() => {
        const thumbs = track.parentElement?.querySelectorAll<HTMLElement>('[role="slider"]');
        thumbs?.[index]?.focus();
      });
      startDrag(event, index, true);
    },
    [disabled, startDrag],
  );

  const handleThumbPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>, thumbIndex: number) => {
      if (disabled) return;
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      event.stopPropagation();
      event.currentTarget.focus();
      startDrag(event, thumbIndex, false);
    },
    [disabled, startDrag],
  );

  const handleThumbKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, thumbIndex: number) => {
      if (disabled) return;
      const p = paramsRef.current;
      const stepSize = p.step ?? 1;
      const tenStep = stepSize * 10;
      const current = valuesRef.current[thumbIndex]!;
      const horizontalRtl = p.orientation === 'horizontal' && p.dir === 'rtl';

      let delta: number | null = null;
      let absolute: number | null = null;
      const shift = event.shiftKey;

      switch (event.key) {
        case 'ArrowRight':
          delta = (horizontalRtl ? -1 : 1) * (shift ? tenStep : stepSize);
          break;
        case 'ArrowLeft':
          delta = (horizontalRtl ? 1 : -1) * (shift ? tenStep : stepSize);
          break;
        case 'ArrowUp':
          delta = shift ? tenStep : stepSize;
          break;
        case 'ArrowDown':
          delta = -(shift ? tenStep : stepSize);
          break;
        case 'PageUp':
          delta = tenStep;
          break;
        case 'PageDown':
          delta = -tenStep;
          break;
        case 'Home':
          absolute = p.min;
          break;
        case 'End':
          absolute = p.max;
          break;
        default:
          return;
      }

      event.preventDefault();
      const target = absolute != null ? absolute : current + (delta ?? 0);
      const snapped = clampToStep(target, p.min, p.max, p.step);
      const next = clampThumb(
        valuesRef.current,
        thumbIndex,
        snapped,
        p.min,
        p.max,
        p.step,
        p.minStepsBetweenThumbs,
      );
      if (next === valuesRef.current) return;
      commit(next);
      commitEnd(next);
    },
    [commit, commitEnd, disabled],
  );

  const trackProps = useMemo(
    () => ({
      ref: trackRef,
      onPointerDown: handleTrackPointerDown,
      onPointerEnter: () => setHoveringTrack(true),
      onPointerLeave: () => setHoveringTrack(false),
    }),
    [handleTrackPointerDown],
  );

  const getThumbProps = useCallback(
    (index: number) => ({
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) =>
        handleThumbPointerDown(event, index),
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleThumbKeyDown(event, index),
      onFocus: () => setFocusedIndex(index),
      onBlur: () => setFocusedIndex((prev) => (prev === index ? null : prev)),
      'data-dragging': draggingIndex === index ? ('true' as const) : undefined,
      'data-focus-visible': focusedIndex === index ? ('true' as const) : undefined,
    }),
    [draggingIndex, focusedIndex, handleThumbKeyDown, handleThumbPointerDown],
  );

  return {
    trackRef,
    draggingIndex,
    focusedIndex,
    hoveringTrack,
    getTrackProps: () => trackProps,
    getThumbProps,
  };
}
