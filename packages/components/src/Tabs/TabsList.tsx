'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { tabsRecipes } from './Tabs.recipe';
import { useTabsContext } from './TabsContext';
import type { TabsListProps } from './Tabs.types';

/**
 * The trigger container. Carries `role="tablist"` + `aria-orientation` so screen readers
 * announce the navigation axis correctly. Every layout axis it cares about (orientation /
 * variant / size / alignment / fullWidth) comes from the `<Tabs>` context — the consumer only
 * passes style-neutral overrides via `className` / `sx`.
 *
 * Layout-axis defaults: horizontal → bottom divider via `border-b`; vertical → end divider via
 * `border-e`. The `solid` / `pills` / `enclosed` variants suppress that divider in the recipe
 * because they paint the active state inside the trigger itself.
 */
export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(props, ref) {
  const ctx = useTabsContext('Tabs.List');
  const { className, style, sx, children, ...rest } = props;

  const { className: listClass, style: listStyle } = useThemedClasses({
    recipe: tabsRecipes.list,
    componentName: 'Tabs',
    slot: 'list',
    props: {
      orientation: ctx.orientation,
      variant: ctx.variant,
      size: ctx.size,
      alignment: ctx.alignment,
      fullWidth: ctx.fullWidth,
      className,
      sx,
      style,
    },
  });

  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={ctx.orientation}
      data-orientation={ctx.orientation}
      className={listClass}
      style={listStyle ?? undefined}
      {...rest}
    >
      {children}
    </div>
  );
}, 'Tabs.List');