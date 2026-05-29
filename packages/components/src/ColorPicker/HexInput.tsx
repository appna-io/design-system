'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from 'react';

import { formatColor, hsvaToRgba, parseColor, rgbaToHsva } from './_shared/color';
import { useColorPickerContext } from './ColorPicker.context';
import { colorPickerRecipes } from './ColorPicker.recipe';

/**
 * Hex input. Accepts `#RGB` / `#RGBA` / `#RRGGBB` / `#RRGGBBAA` with or without the leading `#`.
 * Commits on blur / Enter. While the user is typing, the field shows the raw text — only a
 * successfully-parsed value triggers an upstream HSVA update.
 *
 * On Escape we revert to the canonical formatted value (matches `NumberInput`'s contract).
 */
export function HexInput() {
  const ctx = useColorPickerContext('HexInput');
  const { hsva, commitHsva, enableAlpha, t, disabled, readOnly } = ctx;

  const canonical = formatColor(hsvaToRgba(hsva), 'hex');
  const [draft, setDraft] = useState<string>(canonical);

  useEffect(() => {
    setDraft(canonical);
  }, [canonical]);

  const { className: inputCls } = useThemedClasses({
    recipe: colorPickerRecipes.numericInput,
    componentName: 'ColorPicker',
    slot: 'numericInput',
    props: {},
  });
  const { className: fieldCls } = useThemedClasses({
    recipe: colorPickerRecipes.numericField,
    componentName: 'ColorPicker',
    slot: 'numericField',
    props: {},
  });
  const { className: labelCls } = useThemedClasses({
    recipe: colorPickerRecipes.numericLabel,
    componentName: 'ColorPicker',
    slot: 'numericLabel',
    props: {},
  });

  const handleCommit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(canonical);
      return;
    }
    const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    const rgba = parseColor(withHash);
    const next = rgbaToHsva(enableAlpha ? rgba : { ...rgba, a: 1 });
    // Preserve hue when the color collapses to greyscale — otherwise the saturation square
    // would snap visually as the cursor moves into the 0-saturation column.
    if (next.s === 0) next.h = hsva.h;
    commitHsva(next, 'input');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCommit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setDraft(canonical);
      event.currentTarget.blur();
    }
  };

  return (
    <label className={fieldCls} style={{ gridColumn: 'span 4' }}>
      <input
        type="text"
        autoComplete="off"
        spellCheck={false}
        className={inputCls}
        value={draft}
        disabled={disabled}
        readOnly={readOnly}
        aria-label={t.hex}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
        onBlur={handleCommit}
        onKeyDown={onKeyDown}
      />
      <span className={labelCls}>{t.formatHex}</span>
    </label>
  );
}
