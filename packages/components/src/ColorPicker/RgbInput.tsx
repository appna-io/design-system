'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from 'react';

import { hsvaToRgba, rgbaToHsva } from './_shared/color';
import { useColorPickerContext } from './ColorPicker.context';
import { colorPickerRecipes } from './ColorPicker.recipe';

/**
 * RGB(A) input row. Each channel is its own clamped numeric field — Enter commits the row,
 * Esc reverts to the upstream value. Channels are clamped to `[0, 255]` for r/g/b and
 * `[0, 1]` (rendered as `[0, 100]`) for alpha.
 */
export function RgbInput() {
  const ctx = useColorPickerContext('RgbInput');
  const { hsva, commitHsva, enableAlpha, t, disabled, readOnly } = ctx;

  const rgba = hsvaToRgba(hsva);

  const [r, setR] = useState(String(Math.round(rgba.r)));
  const [g, setG] = useState(String(Math.round(rgba.g)));
  const [b, setB] = useState(String(Math.round(rgba.b)));
  const [a, setA] = useState(String(Math.round(rgba.a * 100)));

  // Keep local drafts in sync with the upstream HSVA whenever something else moves the value
  // (e.g. saturation square drag, preset click, eyedropper). The deps below are the canonical
  // values, not the drafts — so user typing isn't overwritten mid-edit, only after a commit.
  useEffect(() => {
    setR(String(Math.round(rgba.r)));
    setG(String(Math.round(rgba.g)));
    setB(String(Math.round(rgba.b)));
    setA(String(Math.round(rgba.a * 100)));
  }, [rgba.r, rgba.g, rgba.b, rgba.a]);

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
    const nextR = clampInt(r, 0, 255, rgba.r);
    const nextG = clampInt(g, 0, 255, rgba.g);
    const nextB = clampInt(b, 0, 255, rgba.b);
    const nextA = enableAlpha ? clampFloat(a, 0, 100, rgba.a * 100) / 100 : 1;
    const nextHsva = rgbaToHsva({ r: nextR, g: nextG, b: nextB, a: nextA });
    if (nextHsva.s === 0) nextHsva.h = hsva.h;
    commitHsva(nextHsva, 'input');
  };

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setR(String(Math.round(rgba.r)));
      setG(String(Math.round(rgba.g)));
      setB(String(Math.round(rgba.b)));
      setA(String(Math.round(rgba.a * 100)));
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
      {renderField(r, setR, t.red, t.red)}
      {renderField(g, setG, t.green, t.green)}
      {renderField(b, setB, t.blue, t.blue)}
      {enableAlpha ? renderField(a, setA, t.alphaShort, t.alpha) : <span aria-hidden="true" />}
    </>
  );
}

function clampInt(raw: string, min: number, max: number, fallback: number): number {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return Math.round(fallback);
  return Math.min(max, Math.max(min, Math.round(n)));
}

function clampFloat(raw: string, min: number, max: number, fallback: number): number {
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}