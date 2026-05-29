'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { accordionContentInnerRecipe, accordionContentRecipe } from './Accordion.recipe';
import { useAccordionItemContext, useAccordionRootContext } from './AccordionContext';
import type { AccordionContentProps } from './Accordion.types';

/**
 * The collapsible body of an `<Accordion.Item>`. Two nested elements work together to make
 * the CSS-grid auto-height transition possible:
 *
 *  1. Outer `<div>` — gets `grid grid-rows-[0fr]` when closed, `grid-rows-[1fr]` when open,
 *     plus a transition on `grid-template-rows`. The track size animates between 0 and
 *     the inner's intrinsic height with zero JS measurement.
 *  2. Inner `<div role="region">` — declares `min-h-0` so the grid track can shrink below
 *     the content's intrinsic min-content height. Without `min-h-0` the track refuses to
 *     collapse to zero and the transition is a no-op.
 *
 * `role="region"` + `aria-labelledby={triggerId}` is the W3C ARIA Accordion pairing — it
 * announces the panel as a labelled region when expanded.
 *
 * Content stays mounted in both states so async data, expensive children, and ref-attached
 * descendants keep their identity across open/close. Consumers who need to drop content
 * entirely when closed can pass `aria-hidden={!isOpen}` and gate their own children.
 */
export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent(props, ref) {
    const { className, style, sx, children, ...rest } = props;

    const root = useAccordionRootContext('Accordion.Content');
    const item = useAccordionItemContext('Accordion.Content');

    const { className: outerClass } = useThemedClasses({
      recipe: accordionContentRecipe,
      componentName: 'Accordion',
      slot: 'content',
      props: {},
    });

    const { className: innerClass, style: innerStyle } = useThemedClasses({
      recipe: accordionContentInnerRecipe,
      componentName: 'Accordion',
      slot: 'contentInner',
      props: { size: root.size, className, sx, style },
    });

    return (
      <div
        className={outerClass}
        data-state={item.isOpen ? 'open' : 'closed'}
        aria-hidden={!item.isOpen}
      >
        <div
          ref={ref}
          id={item.contentId}
          role="region"
          aria-labelledby={item.triggerId}
          className={innerClass}
          style={innerStyle ?? undefined}
          {...rest}
        >
          {children}
        </div>
      </div>
    );
  },
  'Accordion.Content',
);
