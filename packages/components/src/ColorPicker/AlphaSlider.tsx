'use client';

import { useCallback } from 'react';

import { hsvaToRgba } from './_shared/color';
import { GradientSlider } from './GradientSlider';
import { useColorPickerContext } from './ColorPicker.context';

const CHECKER =
  'repeating-conic-gradient(var(--sds-palette-background-subtle) 0% 25%, transparent 0% 50%)';

/**
 * Alpha slider. Paints the current color over a checkered transparency background; sliding
 * left → right lerps alpha from `0` to `1`. Reuses `GradientSlider` for the thumb / track /
 * keyboard story. Two `background-image` layers do the trick: the fade gradient on top, the
 * checker pattern underneath — both sized via the track's `backgroundSize` set in
 * `GradientSlider`.
 */
export function AlphaSlider() {
  const ctx = useColorPickerContext('AlphaSlider');
  const { hsva, commitHsva, t, disabled, readOnly } = ctx;

  const opaque = hsvaToRgba({ ...hsva, a: 1 });
  const fade = `linear-gradient(to right, rgba(${opaque.r},${opaque.g},${opaque.b},0), rgba(${opaque.r},${opaque.g},${opaque.b},1))`;
  const layered = `${fade}, ${CHECKER}`;

  const handleChange = useCallback(
    (value: number) => commitHsva({ ...hsva, a: value }, 'alpha'),
    [commitHsva, hsva],
  );

  return (
    <GradientSlider
      aria-label={t.alpha}
      min={0}
      max={1}
      step={0.01}
      value={hsva.a}
      onChange={handleChange}
      disabled={disabled || readOnly}
      trackBackground={layered}
      pageStep={0.1}
      formatAriaValueText={(v) => `${t.alpha} ${Math.round(v * 100)}%`}
    />
  );
}