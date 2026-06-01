'use client';

import { forwardRef, useControllableState, useId } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, useMemo, useRef } from 'react';

import { tabsRecipes } from './Tabs.recipe';
import { TabsContext } from './TabsContext';
import type {
  TabsColor,
  TabsContextValue,
  TabsOrientation,
  TabsProps,
  TabsSize,
  TabsVariant,
} from './Tabs.types';

/**
 * The compound root. `<Tabs>` owns the active value and the axes (`variant` / `size` / `color`
 * / `orientation` / `alignment` / `activation`); its descendants
 * (`<Tabs.List>` / `<Tabs.Trigger>` / `<Tabs.Panel>`) read everything they need from
 * `TabsContext`. The compound shape is assembled in `./index.ts`.
 *
 * The active panel is **not** auto-selected if no `defaultValue` is provided — focus lands on
 * the first trigger via roving-tabindex, but no panel becomes active until the user clicks or
 * presses Enter/Space. This matches Radix's behavior and avoids hijacking the visible content
 * on mount when the consumer hasn't expressed an intent.
 *
 * @example
 *   <Tabs defaultValue="overview">
 *     <Tabs.List>
 *       <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
 *       <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
 *     </Tabs.List>
 *     <Tabs.Panel value="overview">…</Tabs.Panel>
 *     <Tabs.Panel value="settings">…</Tabs.Panel>
 *   </Tabs>
 */
export const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(function Tabs(props, ref) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    variant,
    size,
    color,
    orientation = 'horizontal',
    alignment = 'start',
    activation = 'automatic',
    fullWidth = false,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });

  const baseId = useId();

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: tabsRecipes.root,
    componentName: 'Tabs',
    slot: 'root',
    props: { orientation, className, sx, style },
  });

  // Registry of live trigger elements keyed by `value`. Updated via the trigger's callback ref
  // (no setState — mutating a ref doesn't re-render, which is the right call here since the
  // keyboard handler reads at handle-time and the active-state visuals are driven by
  // `data-state` on each trigger, not by the registry).
  const triggersRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  const registerTrigger = useCallback((triggerValue: string, element: HTMLButtonElement | null) => {
    const map = triggersRef.current;
    if (element) {
      map.set(triggerValue, element);
    } else {
      map.delete(triggerValue);
    }
  }, []);

  // Return enabled trigger values in document order. Document order matches the visible
  // sequence, which is the only ordering that satisfies the ARIA pattern when triggers are
  // reordered, conditionally mounted, or rendered out of source order.
  const getOrderedEnabledValues = useCallback((): string[] => {
    const entries: Array<[string, HTMLButtonElement]> = [];
    triggersRef.current.forEach((el, v) => {
      if (!el.disabled && el.getAttribute('data-disabled') !== 'true') entries.push([v, el]);
    });
    entries.sort(([, a], [, b]) => {
      const position = a.compareDocumentPosition(b);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    return entries.map(([v]) => v);
  }, []);

  const focusValue = useCallback((triggerValue: string) => {
    const el = triggersRef.current.get(triggerValue);
    el?.focus();
  }, []);

  // Resolve responsive axes once for the context. Subparts read the resolved values to build
  // their class names without re-running responsive resolution. The recipe itself still does
  // the full responsive resolution at its own call sites (List / Trigger / Panel) so that
  // breakpoint-driven variants reach the DOM.
  const ctxValue: TabsContextValue = useMemo(
    () => ({
      value,
      setValue,
      variant: resolveVariant(variant),
      size: resolveSize(size),
      color: color ?? 'primary',
      orientation,
      alignment,
      activation,
      fullWidth,
      baseId,
      registerTrigger,
      getOrderedEnabledValues,
      focusValue,
    }),
    [
      value,
      setValue,
      variant,
      size,
      color,
      orientation,
      alignment,
      activation,
      fullWidth,
      baseId,
      registerTrigger,
      getOrderedEnabledValues,
      focusValue,
    ],
  );

  return (
    <TabsContext.Provider value={ctxValue}>
      <div
        ref={ref}
        className={rootClass}
        style={rootStyle ?? undefined}
        data-orientation={orientation}
        data-variant={ctxValue.variant}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}, 'Tabs');

function resolveVariant(value: TabsProps['variant']): TabsVariant {
  if (value === undefined) return 'underline';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, TabsVariant>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'underline';
  }
  return 'underline';
}

function resolveSize(value: TabsProps['size']): TabsSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, TabsSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}

// `color` and `orientation` aren't responsive at the API level — keeping them simple keeps the
// keyboard handler's branching deterministic and keeps the recipe surface manageable. If a real
// consumer demands responsive `color` we can widen later without breaking changes.
export type { TabsColor, TabsOrientation };