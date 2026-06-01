'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { useToolbarContext } from './Toolbar.context';
import { toolbarGroupRecipe, TOOLBAR_GROUP_GAP_CLASSES } from './Toolbar.recipe';
import type { ToolbarGroupProps } from './Toolbar.types';

/**
 * Logical grouping inside a toolbar. Renders an inline flex region with optional `role="group"`
 * + `aria-label` so screen readers announce a labeled section. Functionally identical to a bare
 * `<>...</>` wrapper but contributes:
 *
 *   - **Spacing override** via the optional `gap` prop (defaults to the toolbar's `size`-driven
 *     gap; the override is useful when you want a tighter cluster inside an otherwise spacious
 *     toolbar).
 *   - **Optional labelled region** for sub-sections (`aria-label="Text alignment"`).
 *   - **Roving-tabindex transparency** — Toolbar.Group does NOT participate in the toolbar's
 *     roving order itself. Its CHILDREN do. This is correct: the toolbar treats every
 *     focusable descendant as an item, regardless of whether it sits inside a Group wrapper.
 */
export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(
  function ToolbarGroup(props, ref) {
    const { gap, className, style, sx, children, ...rest } = props;
    const ariaLabel = props['aria-label'];
    const ariaLabelledBy = props['aria-labelledby'];

    const ctx = useToolbarContext('Toolbar.Group');

    const { className: groupCls, style: groupStyle } = useThemedClasses({
      recipe: toolbarGroupRecipe,
      componentName: 'Toolbar',
      slot: 'group',
      props: {
        orientation: ctx.orientation,
        className,
        sx,
        style,
      },
    });

    // Optional gap override — appended literally so Tailwind's JIT scanner picks it up. When
    // `gap` is omitted, the group inherits the toolbar's gap rhythm (no extra class).
    const gapCls = gap !== undefined ? TOOLBAR_GROUP_GAP_CLASSES[String(gap) as keyof typeof TOOLBAR_GROUP_GAP_CLASSES] ?? '' : '';
    const finalClassName = gapCls ? `${groupCls} ${gapCls}` : groupCls;

    // Only emit `role="group"` when there's a label — an unlabelled group has no semantic
    // value and would just clutter the AT tree.
    const hasLabel = Boolean(ariaLabel) || Boolean(ariaLabelledBy);
    const role = hasLabel ? 'group' : undefined;

    return (
      <div
        ref={ref}
        role={role}
        data-toolbar-group=""
        className={finalClassName}
        style={groupStyle ?? undefined}
        {...rest}
      >
        {children}
      </div>
    );
  },
  'Toolbar.Group',
);