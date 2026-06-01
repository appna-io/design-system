'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { tabsRecipes } from './Tabs.recipe';
import { useTabsContext } from './TabsContext';
import type { TabsPanelProps } from './Tabs.types';

/**
 * The content panel paired with a `<Tabs.Trigger>` of matching `value`. Carries
 * `role="tabpanel"` + `aria-labelledby` (pointing at the trigger) + `tabIndex={0}` so screen
 * readers can land inside the panel after the user activates the corresponding tab.
 *
 * By default, inactive panels are not mounted (DOM-cheap; subtrees can drop their resources).
 * Pass `forceMount` to keep the panel mounted — the recipe's `data-[state=inactive]:hidden`
 * combined with the `hidden` attribute keeps inactive `forceMount` panels visually + a11y-tree
 * invisible without sacrificing the subtree (useful for video players, complex form state).
 */
export const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(props, ref) {
  const ctx = useTabsContext('Tabs.Panel');
  const { value, forceMount = false, className, style, sx, children, ...rest } = props;

  const active = ctx.value === value;

  // Call the hook unconditionally (rules-of-hooks) and gate the render afterwards. The cost is
  // one extra recipe resolution for inactive non-forceMount panels — negligible (the recipe is
  // memoized by `cv`) and worth the static-analysis cleanliness.
  const { className: panelClass, style: panelStyle } = useThemedClasses({
    recipe: tabsRecipes.panel,
    componentName: 'Tabs',
    slot: 'panel',
    props: { orientation: ctx.orientation, className, sx, style },
  });

  if (!active && !forceMount) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-trigger-${value}`}
      tabIndex={0}
      data-state={active ? 'active' : 'inactive'}
      data-orientation={ctx.orientation}
      hidden={!active}
      className={panelClass}
      style={panelStyle ?? undefined}
      {...rest}
    >
      {children}
    </div>
  );
}, 'Tabs.Panel');