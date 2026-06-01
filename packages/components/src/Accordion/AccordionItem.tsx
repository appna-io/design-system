'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useMemo } from 'react';

import { accordionItemRecipe } from './Accordion.recipe';
import { AccordionItemContext, useAccordionRootContext } from './AccordionContext';
import type { AccordionItemContextValue, AccordionItemProps } from './Accordion.types';

/**
 * One disclosure row inside an `<Accordion>`. The Item owns the per-item context
 * (`value` / `isOpen` / `disabled` / `triggerId` / `contentId`) consumed by its Trigger
 * and Content children.
 *
 * The item itself has no interactive role — its `<button>` child carries the click and
 * keyboard semantics. The wrapper is a plain `<div>` so consumers can drop in arbitrary
 * surrounding markup (a leading badge, a trailing avatar, a thumbnail strip) without
 * fighting button-inside-button accessibility rules.
 *
 * The `data-state="open" | "closed"` attribute is the contract the recipes (and any
 * consumer style overrides) hook into for state-dependent styling.
 */
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  props,
  ref,
) {
  const {
    value,
    disabled: itemDisabled = false,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  const root = useAccordionRootContext('Accordion.Item');

  // Derive open state from the root's value. Single mode compares against the string;
  // multiple mode compares against the array (`.includes`).
  const isOpen =
    root.type === 'multiple'
      ? Array.isArray(root.value) && root.value.includes(value)
      : root.value === value;

  // Disabled cascades: root disabled disables every item; a per-item `disabled` overrides
  // upward (a single item can opt out of a fully-disabled accordion via `disabled={false}`).
  const resolvedDisabled = itemDisabled || root.disabled;

  // Stable per-item ids tied to the root's `baseId`. The Trigger reads `triggerId` for its
  // own `id`; the Content reads `contentId` for its `id`, and both cross-reference via
  // `aria-controls` / `aria-labelledby`.
  const triggerId = `${root.baseId}-trigger-${value}`;
  const contentId = `${root.baseId}-content-${value}`;

  const { className: itemClass, style: itemStyle } = useThemedClasses({
    recipe: accordionItemRecipe,
    componentName: 'Accordion',
    slot: 'item',
    props: { variant: root.variant, color: root.color, className, sx, style },
  });

  const ctxValue: AccordionItemContextValue = useMemo(
    () => ({ value, isOpen, disabled: resolvedDisabled, triggerId, contentId }),
    [value, isOpen, resolvedDisabled, triggerId, contentId],
  );

  return (
    <AccordionItemContext.Provider value={ctxValue}>
      <div
        ref={ref}
        className={itemClass}
        style={itemStyle ?? undefined}
        data-state={isOpen ? 'open' : 'closed'}
        data-disabled={resolvedDisabled ? 'true' : undefined}
        data-value={value}
        {...rest}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}, 'Accordion.Item');