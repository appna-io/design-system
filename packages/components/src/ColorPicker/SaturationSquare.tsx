'use client';

import { useThemedClasses } from '@apx-ui/theme';
import {
  useCallback,
  useId,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

import { hsvaToRgba } from './_shared/color';
import { useColorPickerContext } from './ColorPicker.context';
import { colorPickerRecipes } from './ColorPicker.recipe';

const STEP_SMALL = 0.01;
const STEP_LARGE = 0.1;

/**
 * The 2D saturation × value (brightness) square. The hue stays fixed (driven by the parent
 * `HueSlider`); dragging here only updates `s` and `v`.
 *
 * **A11y model.** Per the W3C ARIA practices, a 2D slider exposes a single `role="slider"`
 * with `aria-valuetext` describing both axes (e.g. "Saturation 75%, Brightness 60%"). Arrow
 * keys nudge by 1% (Shift+Arrow by 10%); Home / End jump to the extremes of whichever axis
 * is currently being used (we map Home/End to saturation since it's the dominant axis users
 * test against).
 *
 * **Pointer model.** A single `pointerdown` captures the pointer to the square (via
 * `setPointerCapture`) so the user can drag *outside* the square's bounds and still move the
 * cursor — the cursor clamps to `[0, 1]`. The same handler is used for the initial click +
 * subsequent `pointermove`, so click-to-set and drag-to-tune share one code path.
 */
export function SaturationSquare() {
  const ctx = useColorPickerContext('SaturationSquare');
  const { hsva, commitHsva, t, disabled, readOnly } = ctx;
  const elementId = useId();

  const ref = useRef<HTMLDivElement | null>(null);
  // Track the captured pointer id so we can release in `pointerup` / `pointercancel`. Stored
  // in a ref because it's only read inside event handlers — no need to re-render.
  const pointerIdRef = useRef<number | null>(null);

  const { className: squareCls } = useThemedClasses({
    recipe: colorPickerRecipes.saturationSquare,
    componentName: 'ColorPicker',
    slot: 'saturationSquare',
    props: {},
  });
  const { className: cursorCls } = useThemedClasses({
    recipe: colorPickerRecipes.saturationCursor,
    componentName: 'ColorPicker',
    slot: 'saturationCursor',
    props: {},
  });

  const baseColor = `hsl(${Math.round(hsva.h)} 100% 50%)`;
  const squareStyle: CSSProperties = {
    backgroundColor: baseColor,
    backgroundImage:
      'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
  };

  // Cursor color = current rgb so the dot stays roughly visible against both light and dark
  // regions of the gradient. The double ring (border-white + ring-black/30) handles the rest.
  const cursorRgba = hsvaToRgba({ ...hsva, a: 1 });
  const cursorStyle: CSSProperties = {
    left: `${hsva.s * 100}%`,
    top: `${(1 - hsva.v) * 100}%`,
    backgroundColor: `rgb(${cursorRgba.r}, ${cursorRgba.g}, ${cursorRgba.b})`,
  };

  const commitFromPointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = clamp01((event.clientX - rect.left) / rect.width);
      const y = clamp01((event.clientY - rect.top) / rect.height);
      commitHsva({ ...hsva, s: x, v: 1 - y }, 'sb');
    },
    [commitHsva, hsva],
  );

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled || readOnly) return;
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      event.preventDefault();
      const node = ref.current;
      if (!node) return;
      try {
        node.setPointerCapture(event.pointerId);
        pointerIdRef.current = event.pointerId;
      } catch {
        // jsdom / unsupported envs — pointer capture is a nice-to-have, not required.
      }
      node.focus({ preventScroll: true });
      commitFromPointer(event);
    },
    [disabled, readOnly, commitFromPointer],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled || readOnly) return;
      if (pointerIdRef.current == null) return;
      if (pointerIdRef.current !== event.pointerId) return;
      commitFromPointer(event);
    },
    [disabled, readOnly, commitFromPointer],
  );

  const releasePointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (node && pointerIdRef.current === event.pointerId) {
        try {
          node.releasePointerCapture(event.pointerId);
        } catch {
          // No-op; releasing an uncaptured pointer is fine to swallow.
        }
      }
      pointerIdRef.current = null;
    },
    [],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled || readOnly) return;
      const big = event.shiftKey;
      const step = big ? STEP_LARGE : STEP_SMALL;
      let { s, v } = hsva;
      switch (event.key) {
        case 'ArrowLeft':
          s = clamp01(s - step);
          break;
        case 'ArrowRight':
          s = clamp01(s + step);
          break;
        case 'ArrowUp':
          v = clamp01(v + step);
          break;
        case 'ArrowDown':
          v = clamp01(v - step);
          break;
        case 'Home':
          s = 0;
          break;
        case 'End':
          s = 1;
          break;
        case 'PageUp':
          v = 1;
          break;
        case 'PageDown':
          v = 0;
          break;
        default:
          return;
      }
      event.preventDefault();
      commitHsva({ ...hsva, s, v }, 'sb');
    },
    [disabled, readOnly, hsva, commitHsva],
  );

  const valueText = `${t.saturationShort} ${Math.round(hsva.s * 100)}%, ${t.lightness} ${Math.round(hsva.v * 100)}%`;

  return (
    <div
      ref={ref}
      id={elementId}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={t.saturation}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsva.s * 100)}
      aria-valuetext={valueText}
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      className={squareCls}
      style={squareStyle}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onKeyDown={onKeyDown}
    >
      <span aria-hidden="true" className={cursorCls} style={cursorStyle} />
    </div>
  );
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}