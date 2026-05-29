'use client';

import { useDirection } from '@apx-ui/engine';
import { useCallback, useId, useRef, type KeyboardEvent, type PointerEvent } from 'react';

/**
 * The picker's own single-thumb slider. We can't reuse `<Slider />` directly because its track
 * background is locked to `bg-bg-subtle` — and the hue / alpha tracks need to paint their own
 * gradients. Rather than chase a deep override path (which would mean exposing track styling
 * APIs Slider doesn't currently need), we ship a ~80-line custom slider here.
 *
 * This component still follows the W3C Slider pattern: `role="slider"` with full arrow / page /
 * home / end keyboard, pointer capture for drag-outside-bounds, and RTL value semantics. The
 * only thing the picker-specific component owns is the painted track background; everything
 * else mirrors Slider's API surface.
 */
export interface GradientSliderProps {
  /** Accessible name (forwarded to `aria-label`). */
  'aria-label': string;
  /** Lower bound (inclusive). */
  min: number;
  /** Upper bound (inclusive). */
  max: number;
  /** Discrete step. */
  step: number;
  /** Current value (controlled). */
  value: number;
  /** Called on every committed change (pointer move tick + keyboard). */
  onChange: (value: number) => void;
  /** Mirrors `aria-disabled` + `data-disabled`; blocks all interaction when true. */
  disabled?: boolean;
  /** CSS `background-image` (single or comma-separated layers) painted on the track. */
  trackBackground: string;
  /** PageUp/PageDown step size. */
  pageStep?: number;
  /** Format the `aria-valuetext` string. */
  formatAriaValueText?: (value: number) => string;
}

const TRACK_BASE =
  'relative h-3 w-full rounded-full border border-border-subtle overflow-hidden cursor-pointer';
const TRACK_DISABLED = 'opacity-50 cursor-not-allowed';
const THUMB_CLS =
  'absolute top-1/2 h-4 w-4 rounded-full border-2 border-white bg-white shadow-md ring-1 ring-black/30 -translate-x-1/2 -translate-y-1/2 outline-none focus-visible:ring-2 focus-visible:ring-focus pointer-events-none';

export function GradientSlider(props: GradientSliderProps) {
  const {
    'aria-label': ariaLabel,
    min,
    max,
    step,
    value,
    onChange,
    disabled = false,
    trackBackground,
    pageStep,
    formatAriaValueText,
  } = props;

  const id = useId();
  const dir = useDirection();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const effectivePageStep = pageStep ?? Math.max(step, (max - min) / 10);

  const commit = useCallback(
    (next: number) => {
      const clamped = clamp(next, min, max);
      const snapped = step > 0 ? Math.round(clamped / step) * step : clamped;
      // Round to step's precision so we don't accumulate float drift across many keyboard taps.
      const precision = step > 0 ? decimalPlaces(step) : 6;
      const rounded = roundTo(snapped, precision);
      if (rounded === value) return;
      onChange(clamp(rounded, min, max));
    },
    [min, max, step, onChange, value],
  );

  const commitFromPointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const node = trackRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      if (rect.width === 0) return;
      let frac = (event.clientX - rect.left) / rect.width;
      if (dir === 'rtl') frac = 1 - frac;
      frac = clamp(frac, 0, 1);
      commit(min + frac * (max - min));
    },
    [commit, dir, min, max],
  );

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      const node = trackRef.current;
      if (!node) return;
      try {
        node.setPointerCapture(event.pointerId);
        pointerIdRef.current = event.pointerId;
      } catch {
        // jsdom — no-op.
      }
      node.focus({ preventScroll: true });
      commitFromPointer(event);
    },
    [disabled, commitFromPointer],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (pointerIdRef.current == null) return;
      if (pointerIdRef.current !== event.pointerId) return;
      commitFromPointer(event);
    },
    [disabled, commitFromPointer],
  );

  const releasePointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const node = trackRef.current;
      if (node && pointerIdRef.current === event.pointerId) {
        try {
          node.releasePointerCapture(event.pointerId);
        } catch {
          // No-op.
        }
      }
      pointerIdRef.current = null;
    },
    [],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const big = event.shiftKey ? effectivePageStep : step;
      const decreaseKey = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      const increaseKey = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      switch (event.key) {
        case increaseKey:
          event.preventDefault();
          commit(value + big);
          break;
        case decreaseKey:
          event.preventDefault();
          commit(value - big);
          break;
        case 'ArrowUp':
          event.preventDefault();
          commit(value + big);
          break;
        case 'ArrowDown':
          event.preventDefault();
          commit(value - big);
          break;
        case 'PageUp':
          event.preventDefault();
          commit(value + effectivePageStep);
          break;
        case 'PageDown':
          event.preventDefault();
          commit(value - effectivePageStep);
          break;
        case 'Home':
          event.preventDefault();
          commit(min);
          break;
        case 'End':
          event.preventDefault();
          commit(max);
          break;
        default:
          break;
      }
    },
    [disabled, effectivePageStep, step, dir, commit, value, min, max],
  );

  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const thumbStyle = {
    insetInlineStart: `${percent}%`,
  };
  const valueText = formatAriaValueText ? formatAriaValueText(value) : String(value);

  return (
    <div
      ref={trackRef}
      id={id}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Number(value.toFixed(2))}
      aria-valuetext={valueText}
      aria-orientation="horizontal"
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      className={joinClasses(TRACK_BASE, disabled ? TRACK_DISABLED : '')}
      style={{ backgroundImage: trackBackground, backgroundSize: '100% 100%, 8px 8px' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onKeyDown={onKeyDown}
    >
      <span aria-hidden="true" className={THUMB_CLS} style={thumbStyle} />
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function decimalPlaces(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const s = String(n);
  const idx = s.indexOf('.');
  return idx >= 0 ? s.length - idx - 1 : 0;
}

function roundTo(value: number, digits: number): number {
  if (digits <= 0) return Math.round(value);
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function joinClasses(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
