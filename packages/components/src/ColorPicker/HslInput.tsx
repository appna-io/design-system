'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from 'react';

import { hslaToRgba, hsvaToRgba, rgbaToHsla, rgbaToHsva } from './_shared/color';
import { useColorPickerContext } from './ColorPicker.context';
import { colorPickerRecipes } from './ColorPicker.recipe';

/**
 * HSL(A) input row. Hue is `[0, 360)`, S + L are percentages `[0, 100]`, alpha is `[0, 100]`
 * (stored internally as `[0, 1]`). Commits on Enter / blur. Out-of-range values clamp; non-
 * numeric input reverts.
 *
 * **Note**: this surface intentionally uses HSL semantics rather than HSV — that's what
 * consumers expect from CSS's `hsl()`. The picker's *internal* model stays HSV (better for
 * the saturation-square interaction); we convert at this I/O boundary.
 */
export function HslInput() {
  const ctx = useColorPickerContext('HslInput');
  const { hsva, commitHsva, enableAlpha, t, disabled, readOnly } = ctx;

  const rgba = hsvaToRgba(hsva);
  const hsla = rgbaToHsla(rgba);

  const [h, setH] = useState(String(Math.round(hsla.h)));
  const [s, setS] = useState(String(Math.round(hsla.s * 100)));
  const [l, setL] = useState(String(Math.round(hsla.l * 100)));
  const [a, setA] = useState(String(Math.round(hsla.a * 100)));

  useEffect(() => {
    setH(String(Math.round(hsla.h)));
    setS(String(Math.round(hsla.s * 100)));
    setL(String(Math.round(hsla.l * 100)));
    setA(String(Math.round(hsla.a * 100)));
  }, [hsla.h, hsla.s, hsla.l, hsla.a]);

  const { className: fieldCls } = useThemedClasses({
    recipe: colorPickerRecipes.numericField,
    componentName: 'ColorPicker',
    slot: 'numericField',
    props: {},
  });
  const { className: inputCls } = useThemedClasses({
    recipe: colorPickerRecipes.numericInput,
    componentName: 'ColorPicker',
    slot: 'numericInput',
    props: {},
  });
  const { className: labelCls } = useThemedClasses({
    recipe: colorPickerRecipes.numericLabel,
    componentName: 'ColorPicker',
    slot: 'numericLabel',
    props: {},
  });

  const commit = () => {
    const nextH = ((clampInt(h, -360, 360, hsla.h) % 360) + 360) % 360;
    const nextS = clampInt(s, 0, 100, hsla.s * 100) / 100;
    const nextL = clampInt(l, 0, 100, hsla.l * 100) / 100;
    const nextA = enableAlpha ? clampInt(a, 0, 100, hsla.a * 100) / 100 : 1;
    const nextRgba = hslaToRgba({ h: nextH, s: nextS, l: nextL, a: nextA });
    const nextHsva = rgbaToHsva(nextRgba);
    if (nextHsva.s === 0) nextHsva.h = nextH;
    commitHsva(nextHsva, 'input');
  };

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setH(String(Math.round(hsla.h)));
      setS(String(Math.round(hsla.s * 100)));
      setL(String(Math.round(hsla.l * 100)));
      setA(String(Math.round(hsla.a * 100)));
      event.currentTarget.blur();
    }
  };

  function renderField(
    value: string,
    setValue: (v: string) => void,
    label: string,
    ariaLabel: string,
  ) {
    return (
      <label className={fieldCls}>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          className={inputCls}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
        />
        <span className={labelCls}>{label}</span>
      </label>
    );
  }

  return (
    <>
      {renderField(h, setH, 'H', t.hue)}
      {renderField(s, setS, t.saturationShort, t.saturation)}
      {renderField(l, setL, t.lightness, t.brightness)}
      {enableAlpha ? renderField(a, setA, t.alphaShort, t.alpha) : <span aria-hidden="true" />}
    </>
  );
}

function clampInt(raw: string, min: number, max: number, fallback: number): number {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return Math.round(fallback);
  return Math.min(max, Math.max(min, Math.round(n)));
}
