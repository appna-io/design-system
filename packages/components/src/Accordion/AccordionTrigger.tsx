'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, type MouseEvent } from 'react';

import { accordionChevronRecipe, accordionTriggerRecipe } from './Accordion.recipe';
import { useAccordionItemContext, useAccordionRootContext } from './AccordionContext';
import { useAccordionKeyboard } from './useAccordionKeyboard';
import type { AccordionTriggerProps } from './Accordion.types';

/**
 * The clickable header that toggles its parent `<Accordion.Item>` open / closed. A real
 * `<button type="button">` carries the native click + Enter/Space activation semantics for
 * free; we layer the ARIA accordion pattern (`aria-expanded` + `aria-controls`) and the
 * arrow-key navigation between sibling triggers via `useAccordionKeyboard`.
 *
 * The chevron is rendered inside this button — its `order-*` and `ms-auto` classes (from
 * the chevron recipe) handle the `iconPosition="start" | "end"` placement without any
 * conditional JSX. Optional `leftIcon` lands at the logical start, before the label.
 */
export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(props, ref) {
    const { leftIcon, className, style, sx, children, onClick, onKeyDown, ...rest } = props;

    const root = useAccordionRootContext('Accordion.Trigger');
    const item = useAccordionItemContext('Accordion.Trigger');

    // Local ref shared with the consumer-supplied ref via the callback. We need our own
    // handle so we can register the trigger with the root for keyboard nav + focus moves.
    const localRef = useRef<HTMLButtonElement | null>(null);

    const setRefs = useCallback(
      (el: HTMLButtonElement | null) => {
        localRef.current = el;
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        }
        // Register / unregister with the root keyboard registry. Calling with `null` on
        // unmount cleans the entry so stale refs don't leak into Arrow / Home / End nav.
        root.registerTrigger(item.value, el);
      },
      [ref, root, item.value],
    );

    // Re-register on every render so the disabled state stays accurate without scheduling
    // a separate effect (the registry reads `element.disabled` at keyboard time anyway, so
    // the only thing we need to keep in sync is the element identity).
    useEffect(() => {
      return () => {
        // On unmount, drop the registration. Mount/update registration happens in `setRefs`.
        root.registerTrigger(item.value, null);
      };
    }, [root, item.value]);

    const { className: triggerClass, style: triggerStyle } = useThemedClasses({
      recipe: accordionTriggerRecipe,
      componentName: 'Accordion',
      slot: 'trigger',
      props: { size: root.size, className, sx, style },
    });

    const { className: chevronClass } = useThemedClasses({
      recipe: accordionChevronRecipe,
      componentName: 'Accordion',
      slot: 'chevron',
      props: { size: root.size, iconPosition: root.iconPosition },
    });

    const toggle = useCallback(() => {
      if (item.disabled) return;
      if (root.type === 'multiple') {
        const current = Array.isArray(root.value) ? root.value : [];
        const next = item.isOpen ? current.filter((v) => v !== item.value) : [...current, item.value];
        root.setValue(next);
        return;
      }
      // Single mode. `collapsible=false` keeps the current item open if it's already open
      // (clicking does nothing); `collapsible=true` clears the value to close it.
      if (item.isOpen) {
        if (root.collapsible) root.setValue('');
      } else {
        root.setValue(item.value);
      }
    }, [item.disabled, item.isOpen, item.value, root]);

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        toggle();
      },
      [onClick, toggle],
    );

    const handleAccordionKeys = useAccordionKeyboard(root, item.value);

    return (
      <button
        ref={setRefs}
        type="button"
        id={item.triggerId}
        aria-expanded={item.isOpen}
        aria-controls={item.contentId}
        aria-disabled={item.disabled || undefined}
        disabled={item.disabled}
        data-state={item.isOpen ? 'open' : 'closed'}
        data-accordion-trigger=""
        className={triggerClass}
        style={triggerStyle ?? undefined}
        onClick={handleClick}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          handleAccordionKeys(event);
        }}
        {...rest}
      >
        {leftIcon != null ? (
          <span aria-hidden="true" className="inline-flex shrink-0 items-center">
            {leftIcon}
          </span>
        ) : null}
        <span className="flex-1 truncate text-start">{children}</span>
        <ChevronDown
          aria-hidden="true"
          data-state={item.isOpen ? 'open' : 'closed'}
          className={chevronClass}
        />
      </button>
    );
  },
  'Accordion.Trigger',
);
