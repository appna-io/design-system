'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { useToolbarContext } from './Toolbar.context';
import { toolbarSeparatorRecipe } from './Toolbar.recipe';
import type { ToolbarSeparatorProps } from './Toolbar.types';

/**
 * Visual + semantic divider between toolbar items. The separator's orientation is the
 * **perpendicular** of the toolbar's orientation:
 *
 *   - Horizontal toolbar → vertical separator (a column rule between items).
 *   - Vertical toolbar → horizontal separator (a row rule between items).
 *
 * Roving-tabindex transparency: the separator is marked `data-toolbar-skip` so the toolbar's
 * keyboard handler doesn't try to focus it. It's also `aria-orientation`'d for screen readers
 * that announce divider direction.
 *
 * We do NOT wrap the shipped `<Divider>` here because Divider's recipe assumes block-level
 * layout (`<hr>` semantics) — for a toolbar item we want a `<div role="separator">` with
 * `self-stretch` cross-axis sizing instead. Re-implementing in 8 lines keeps the perpendicular
 * orientation logic + sizing local without an extra Divider dep dance.
 */
export const ToolbarSeparator = forwardRef<HTMLDivElement, ToolbarSeparatorProps>(
  function ToolbarSeparator(props, ref) {
    const { thickness = 1, color = 'subtle', className, style, sx } = props;

    const ctx = useToolbarContext('Toolbar.Separator');
    // Perpendicular: a horizontal toolbar wants a vertical separator and vice versa.
    const separatorOrientation = ctx.orientation === 'horizontal' ? 'vertical' : 'horizontal';

    const { className: cls, style: recipeStyle } = useThemedClasses({
      recipe: toolbarSeparatorRecipe,
      componentName: 'Toolbar',
      slot: 'separator',
      props: {
        orientation: separatorOrientation,
        thickness: String(thickness) as '1' | '2',
        color,
        className,
        sx,
        style,
      },
    });

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={separatorOrientation}
        data-toolbar-skip="true"
        data-toolbar-separator=""
        className={cls}
        style={recipeStyle ?? undefined}
      />
    );
  },
  'Toolbar.Separator',
);