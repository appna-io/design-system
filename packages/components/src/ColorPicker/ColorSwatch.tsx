'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { colorPickerRecipes } from './ColorPicker.recipe';
import type { ColorSwatchProps } from './ColorPicker.types';

/**
 * Read-only color chip. Pure visual primitive — no popover, no interaction. Useful for
 * displaying brand swatches, label colors, theme previews, etc.
 *
 * The chip renders a checkered transparency background under the chosen color so partial
 * alpha values read clearly. When `showLabel` is set we render the swatch + label as an
 * inline group; otherwise the swatch carries `aria-label={ariaLabel ?? value}` so screen
 * readers still announce a meaningful name.
 */
export const ColorSwatch = forwardRef<HTMLSpanElement, ColorSwatchProps>(function ColorSwatch(
  props,
  ref,
) {
  const { value, size = 'md', showLabel, ariaLabel, className, style, sx, ...rest } = props;

  const { className: cls, style: themedStyle } = useThemedClasses({
    recipe: colorPickerRecipes.swatch,
    componentName: 'ColorSwatch',
    slot: 'swatch',
    props: { size, className, sx, style },
  });

  // Layer the chosen color on top of the recipe's checker pattern by setting `background-image`
  // explicitly: two image layers, two sizes. The recipe's class would otherwise paint only the
  // checker — overriding `background-image` via the inline `style` lets the color show through
  // with the correct transparency over the checker.
  const swatchStyle: React.CSSProperties = {
    ...(themedStyle ?? {}),
    backgroundImage: `linear-gradient(${value}, ${value}), repeating-conic-gradient(var(--sds-palette-background-subtle) 0% 25%, transparent 0% 50%)`,
    backgroundSize: '100% 100%, 8px 8px',
  };

  if (showLabel != null) {
    return (
      <span
        ref={ref}
        className="inline-flex items-center gap-2 align-middle"
        {...rest}
      >
        <span
          aria-hidden="true"
          className={cls}
          style={swatchStyle}
        />
        <span className="text-sm text-fg-default">{showLabel}</span>
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={cls}
      style={swatchStyle}
      role="img"
      aria-label={ariaLabel ?? `Color ${value}`}
      {...rest}
    />
  );
}, 'ColorSwatch');
