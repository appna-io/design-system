'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { useMemo } from 'react';

import { contrastRatio, hsvaToRgba, parseColor, wcagLevel, type WcagLevel } from './_shared/color';
import { useColorPickerContext } from './ColorPicker.context';
import { colorPickerRecipes } from './ColorPicker.recipe';

export interface ContrastChipProps {
  /** Background to check the picker's current color against. */
  against: string;
}

/**
 * Live WCAG contrast chip. Computes the ratio between the picker's current color and `against`
 * (defaults to white). Shows the ratio and the WCAG conformance level (`AAA` / `AA` / `fail`).
 *
 * The chip recolors itself via the recipe's `level` variant — green-tinted for AA/AAA, red for
 * fail — and announces via `aria-label` rather than relying on color alone.
 */
export function ContrastChip({ against }: ContrastChipProps) {
  const ctx = useColorPickerContext('ContrastChip');
  const { hsva, t } = ctx;

  const { ratio, level } = useMemo(() => {
    const fg = hsvaToRgba(hsva);
    const bg = parseColor(against);
    const r = contrastRatio(fg, bg);
    return { ratio: r, level: wcagLevel(r) };
  }, [hsva, against]);

  const { className: chipCls } = useThemedClasses({
    recipe: colorPickerRecipes.contrastChip,
    componentName: 'ColorPicker',
    slot: 'contrastChip',
    props: { level },
  });

  const ratioText = ratio.toFixed(2);
  const levelText = level === 'fail' ? t.contrastFail : `${level} ${t.contrastPass}`;
  const aria = t.contrast(ratioText, levelText);

  return (
    <span className={chipCls} role="status" aria-label={aria} data-level={level} data-ratio={ratioText}>
      {symbol(level)}
      <span aria-hidden="true">{ratioText}:1 · {level === 'fail' ? 'Fail' : level}</span>
    </span>
  );
}

function symbol(level: WcagLevel): string {
  if (level === 'fail') return '✕';
  return '✓';
}
