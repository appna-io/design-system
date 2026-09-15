'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import {
  accordionContentClipRecipe,
  accordionContentInnerRecipe,
  accordionContentRecipe,
} from './Accordion.recipe';
import { useAccordionItemContext, useAccordionRootContext } from './AccordionContext';
import type { AccordionContentProps } from './Accordion.types';

/**
 * The collapsible body of an `<Accordion.Item>`. Three nested elements work together to make
 * the CSS-grid auto-height transition possible:
 *
 *  1. Outer `<div>` — gets `grid grid-rows-[0fr]` when closed, `grid-rows-[1fr]` when open,
 *     plus a transition on `grid-template-rows`. The track size animates between 0 and
 *     the content's intrinsic height with zero JS measurement.
 *  2. Clip `<div>` — the grid item. `min-h-0` lets the track shrink below the content's
 *     min-content height, and it carries NO padding: a padded grid item can't collapse past its
 *     padding, which leaves a visible band or needs a laggy `max-height` cap to hide it.
 *  3. Region `<div role="region">` — the padded panel, which takes the consumer's
 *     `className` / `sx` / `style` / `ref`.
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

    const { className: clipClass } = useThemedClasses({
      recipe: accordionContentClipRecipe,
      componentName: 'Accordion',
      slot: 'contentClip',
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
        <div className={clipClass}>
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
      </div>
    );
  },
  'Accordion.Content',
);