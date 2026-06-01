'use client';

import { useCallback } from 'react';

import { GradientSlider } from './GradientSlider';
import { useColorPickerContext } from './ColorPicker.context';

const HUE_GRADIENT =
  'linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))';

/**
 * Hue slider. Driven by `GradientSlider` — a thin custom track that paints the canonical
 * rainbow gradient and exposes the W3C Slider keyboard pattern (Arrow ±1°, Shift+Arrow ±10°,
 * Home/End to 0/360, PageUp/PageDown ±15°).
 *
 * **Gradient stays canonical even in RTL.** The hue wheel is universal (red → red); RTL only
 * affects value semantics inside `GradientSlider`. Documented in the MDX.
 */
export function HueSlider() {
  const ctx = useColorPickerContext('HueSlider');
  const { hsva, commitHsva, t, disabled, readOnly } = ctx;

  const handleChange = useCallback(
    (value: number) => commitHsva({ ...hsva, h: value }, 'hue'),
    [commitHsva, hsva],
  );

  return (
    <GradientSlider
      aria-label={t.hue}
      min={0}
      max={360}
      step={1}
      value={hsva.h}
      onChange={handleChange}
      disabled={disabled || readOnly}
      trackBackground={HUE_GRADIENT}
      pageStep={15}
      formatAriaValueText={(v) => `${t.hue} ${Math.round(v)}°`}
    />
  );
}