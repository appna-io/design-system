'use client';

import { forwardRef, useControllableState, useId } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, useMemo, useRef } from 'react';

import { accordionRootRecipe } from './Accordion.recipe';
import { AccordionRootContext } from './AccordionContext';
import type {
  AccordionColor,
  AccordionProps,
  AccordionRootContextValue,
  AccordionSize,
  AccordionVariant,
} from './Accordion.types';

/**
 * The compound root. `<Accordion>` owns the state and the variant axes; its descendants
 * (`<Accordion.Item>` / `<Accordion.Trigger>` / `<Accordion.Content>`) read everything they
 * need from `AccordionRootContext`. The compound shape is assembled in `./index.ts`.
 *
 * Two modes via the discriminated `type` prop:
 *
 *  - `type="single"` (default) — `value` is a string. One item open at a time. The DS
 *    defaults `collapsible={true}` so clicking the open item closes it (modern FAQ UX);
 *    pass `collapsible={false}` to enforce "always one open".
 *  - `type="multiple"` — `value` is a `string[]`. Each item toggles independently;
 *    `collapsible` is ignored (multiple mode is inherently collapsible per-item).
 *
 * The CSS-only `grid-rows: 0fr → 1fr` open/close transition lives on the Content recipe;
 * there is **no JS height measurement** in this component (no ResizeObserver, no
 * `scrollHeight` reads). That is the modern, jank-free accordion pattern and the reason
 * Accordion ships without a Motion dependency.
 *
 * @example
 *   <Accordion type="single" defaultValue="q1">
 *     <Accordion.Item value="q1">
 *       <Accordion.Trigger>What is apx-ds?</Accordion.Trigger>
 *       <Accordion.Content>A modern design system.</Accordion.Content>
 *     </Accordion.Item>
 *   </Accordion>
 *
 *   <Accordion type="multiple" defaultValue={['a', 'c']}>…</Accordion>
 */
export const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  props,
  ref,
) {
  const {
    type = 'single',
    // Cast through `unknown` because the discriminated `value` / `defaultValue` /
    // `onValueChange` cannot be statically narrowed at this point — TS doesn't track which
    // branch the consumer picked once we destructure with a default for `type`. We narrow at
    // each call site below via the runtime `type` check.
    value: valueProp,
    defaultValue,
    onValueChange,
    collapsible: collapsibleProp,
    disabled = false,
    variant,
    size,
    color,
    iconPosition = 'end',
    className,
    style,
    sx,
    children,
    ...rest
  } = props as AccordionProps & {
    type?: 'single' | 'multiple';
    value?: string | string[];
    defaultValue?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    collapsible?: boolean;
  };

  // Empty default for the active mode. `useControllableState` only widens to `T | undefined`,
  // so we always know the concrete type at the use site below.
  const fallback: string | string[] = type === 'multiple' ? [] : '';
  const [valueRaw, setValueRaw] = useControllableState<string | string[]>({
    value: valueProp,
    defaultValue: defaultValue ?? fallback,
    onChange: onValueChange,
  });
  const value: string | string[] = valueRaw ?? fallback;

  // `collapsible` only applies in single mode. Multiple mode is per-item collapsible by
  // construction, so an explicit `collapsible` there is silently ignored — easier than
  // throwing during render.
  const collapsible = collapsibleProp ?? type === 'single';

  // Stable id prefix used for `triggerId` + `contentId` pairing inside each item. The
  // resolved value flows to every `<Accordion.Item>` via context.
  const baseId = useId();

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: accordionRootRecipe,
    componentName: 'Accordion',
    slot: 'root',
    props: { variant, className, sx, style },
  });

  // Registry of live triggers keyed by item value. Updated through callback refs in each
  // `<Accordion.Trigger>` — mutating a ref doesn't trigger re-renders, which is what we want
  // (the keyboard handler reads the current map at handle-time, not at render-time).
  const triggersRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  const registerTrigger = useCallback((itemValue: string, element: HTMLButtonElement | null) => {
    const map = triggersRef.current;
    if (element) {
      map.set(itemValue, element);
    } else {
      map.delete(itemValue);
    }
  }, []);

  // Iterate the registered triggers, drop disabled ones, sort by document order. Document
  // order is the only ordering that matches what the user sees on screen (a Map's iteration
  // order is insertion order, which can diverge from DOM order if items are reordered or
  // conditionally mounted).
  const getOrderedEnabledValues = useCallback((): string[] => {
    const entries: Array<[string, HTMLButtonElement]> = [];
    triggersRef.current.forEach((el, v) => {
      if (!el.disabled) entries.push([v, el]);
    });
    entries.sort(([, a], [, b]) => {
      const position = a.compareDocumentPosition(b);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    return entries.map(([v]) => v);
  }, []);

  const focusValue = useCallback((itemValue: string) => {
    const el = triggersRef.current.get(itemValue);
    el?.focus();
  }, []);

  // Resolve non-responsive defaults for the context — subparts use these to compute their
  // class names without re-running responsive resolution. The recipe still handles the full
  // responsive resolution for the root.
  const ctxValue: AccordionRootContextValue = useMemo(
    () => ({
      type,
      value,
      setValue: setValueRaw,
      collapsible,
      disabled,
      variant: resolveVariant(variant),
      size: resolveSize(size),
      color: resolveColor(color),
      iconPosition,
      baseId,
      registerTrigger,
      getOrderedEnabledValues,
      focusValue,
    }),
    [
      type,
      value,
      setValueRaw,
      collapsible,
      disabled,
      variant,
      size,
      color,
      iconPosition,
      baseId,
      registerTrigger,
      getOrderedEnabledValues,
      focusValue,
    ],
  );

  return (
    <AccordionRootContext.Provider value={ctxValue}>
      <div
        ref={ref}
        className={rootClass}
        style={rootStyle ?? undefined}
        data-orientation="vertical"
        data-variant={ctxValue.variant}
        {...rest}
      >
        {children}
      </div>
    </AccordionRootContext.Provider>
  );
}, 'Accordion');

function resolveVariant(value: AccordionProps['variant']): AccordionVariant {
  if (value === undefined) return 'solid';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, AccordionVariant>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'solid';
  }
  return 'solid';
}

function resolveSize(value: AccordionProps['size']): AccordionSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, AccordionSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}

function resolveColor(value: AccordionProps['color']): AccordionColor {
  if (value === undefined) return 'neutral';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, AccordionColor>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'neutral';
  }
  return 'neutral';
}

