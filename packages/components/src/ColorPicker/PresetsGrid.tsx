'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, useRef, type KeyboardEvent } from 'react';

import { formatColor, hsvaToRgba, parseColor, rgbaToHsva } from './_shared/color';
import { useColorPickerContext } from './ColorPicker.context';
import { colorPickerRecipes } from './ColorPicker.recipe';

export interface PresetsGridProps {
  /** Hex / rgb / hsl strings rendered as clickable swatches. */
  presets: ReadonlyArray<string>;
  /** When the user picks a preset, the parent may want to close the popover. */
  onPick?: (value: string) => void;
}

/**
 * Grid of preset color swatches. Arrow keys move focus row-by-row (the grid is `cols-8` so
 * Up/Down jump 8 indices); Enter or Space selects. Selecting commits the parsed value into the
 * picker context.
 *
 * The "currently selected" preset (one that matches the current value as hex) gets a focus
 * ring so users can see which preset they're previewing.
 */
export function PresetsGrid({ presets, onPick }: PresetsGridProps) {
  const ctx = useColorPickerContext('PresetsGrid');
  const { hsva, commitHsva, t, disabled, readOnly } = ctx;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentHex = formatColor(hsvaToRgba(hsva), 'hex');

  const { className: gridCls } = useThemedClasses({
    recipe: colorPickerRecipes.presetsGrid,
    componentName: 'ColorPicker',
    slot: 'presetsGrid',
    props: {},
  });
  const { className: btnCls } = useThemedClasses({
    recipe: colorPickerRecipes.preset,
    componentName: 'ColorPicker',
    slot: 'preset',
    props: {},
  });

  const pickAt = useCallback(
    (raw: string) => {
      if (disabled || readOnly) return;
      const rgba = parseColor(raw);
      const next = rgbaToHsva(rgba);
      if (next.s === 0) next.h = hsva.h;
      commitHsva(next, 'preset');
      onPick?.(raw);
    },
    [disabled, readOnly, hsva.h, commitHsva, onPick],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (!target?.dataset?.['presetIndex']) return;
      const index = Number(target.dataset['presetIndex']);
      const buttons = Array.from(
        containerRef.current?.querySelectorAll<HTMLButtonElement>('[data-preset-index]') ?? [],
      );
      const cols = 8;
      let next = index;
      switch (event.key) {
        case 'ArrowRight':
          next = Math.min(buttons.length - 1, index + 1);
          break;
        case 'ArrowLeft':
          next = Math.max(0, index - 1);
          break;
        case 'ArrowDown':
          next = Math.min(buttons.length - 1, index + cols);
          break;
        case 'ArrowUp':
          next = Math.max(0, index - cols);
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = buttons.length - 1;
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          pickAt(presets[index]!);
          return;
        default:
          return;
      }
      event.preventDefault();
      buttons[next]?.focus();
    },
    [presets, pickAt],
  );

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label={t.presets}
      className={gridCls}
      onKeyDown={onKeyDown}
    >
      {presets.map((value, index) => {
        const selected = value.toLowerCase() === currentHex.toLowerCase();
        return (
          <button
            key={`${value}-${index}`}
            type="button"
            role="option"
            aria-label={t.presetLabel(value)}
            aria-selected={selected}
            data-preset-index={index}
            data-selected={selected || undefined}
            className={btnCls}
            disabled={disabled}
            style={{ background: value }}
            onClick={() => pickAt(value)}
          />
        );
      })}
    </div>
  );
}