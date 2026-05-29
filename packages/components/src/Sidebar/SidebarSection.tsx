'use client';

import { forwardRef, useId } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { Badge } from '../Badge/Badge';
import { useSidebarContext } from './Sidebar.context';
import {
  sidebarDisclosureRecipe,
  sidebarSectionBodyRecipe,
  sidebarSectionLabelRecipe,
} from './Sidebar.recipe';
import type { SidebarSectionProps } from './Sidebar.types';
import { useDisclosure } from './useDisclosure';

/**
 * `<Sidebar.Section>` — a labeled group of items inside the sidebar.
 *
 * Two flavors:
 *   1. **Static** (default): the label is a plain `<h3>` heading; all items are always visible.
 *   2. **Collapsible** (`collapsible={true}`): the label becomes a `<button aria-expanded>` that
 *      toggles a `grid-template-rows: 0fr → 1fr` disclosure transition on the body. Same
 *      mechanism Accordion uses internally; reimplemented locally because Accordion's API is
 *      tied to its own root context (extracting it would require an `_shared/` write that the
 *      room guardrails currently disallow).
 *
 * Rail mode (`collapsed` on root):
 *   - Static sections: the label visually hides (`sr-only`) so only the items show — sections
 *     degrade into pure visual groupings.
 *   - Collapsible sections: same — but the items remain expanded since the toggle is unreachable
 *     when the label is hidden. Consumers should generally avoid collapsible sections in rail
 *     mode; we don't crash, but the UX is "all items visible, no toggle".
 */
export const SidebarSection = forwardRef<HTMLDivElement, SidebarSectionProps>(
  function SidebarSection(props, ref) {
    const {
      label,
      collapsible = false,
      defaultOpen = true,
      open: openProp,
      onOpenChange,
      hideLabelWhenCollapsed = true,
      badge,
      badgeColor = 'neutral',
      children,
      className,
      style,
      ...rest
    } = props;

    const ctx = useSidebarContext('Sidebar.Section');
    const { open, toggle } = useDisclosure({
      open: openProp,
      defaultOpen,
      onOpenChange,
    });

    // Used to wire the `aria-expanded` button to the body region in collapsible mode.
    const bodyId = useId();

    // In rail mode, the section label is hidden by default (consumer opt-out via prop).
    const hideLabel = ctx.collapsed && hideLabelWhenCollapsed;

    // Static sections always show their body. Collapsible sections respect `open`.
    const bodyVisible = collapsible ? open : true;

    const { className: labelClass } = useThemedClasses({
      recipe: sidebarSectionLabelRecipe,
      componentName: 'Sidebar.Section.Label',
      props: { collapsed: hideLabel, collapsible },
    });

    const { className: bodyClass } = useThemedClasses({
      recipe: sidebarSectionBodyRecipe,
      componentName: 'Sidebar.Section.Body',
      props: { collapsed: ctx.collapsed },
    });

    const { className: disclosureClass } = useThemedClasses({
      recipe: sidebarDisclosureRecipe,
      componentName: 'Sidebar.Section.Disclosure',
      props: { open: bodyVisible },
    });

    const labelContent = (
      <>
        <span className="truncate">{label}</span>
        {badge !== undefined && badge !== null && badge !== false && (
          <Badge size="sm" color={badgeColor} variant="soft">
            {badge}
          </Badge>
        )}
      </>
    );

    return (
      <div
        ref={ref}
        className={className}
        style={style}
        data-sidebar-section=""
        data-collapsible={collapsible ? 'true' : undefined}
        data-open={bodyVisible ? 'true' : 'false'}
        {...rest}
      >
        {collapsible ? (
          <button
            type="button"
            className={labelClass}
            onClick={toggle}
            aria-expanded={open}
            aria-controls={bodyId}
          >
            {labelContent}
            <span
              aria-hidden="true"
              className={
                'ms-1 inline-flex h-3 w-3 items-center justify-center transition-transform duration-150 ' +
                (open ? 'rotate-90' : 'rotate-0')
              }
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06z" />
              </svg>
            </span>
          </button>
        ) : (
          // Static labels use h3 for semantic ranking inside the nav landmark.
          <h3 className={labelClass}>{labelContent}</h3>
        )}

        {/*
         * Disclosure wrapper. The body is always mounted (so React state in nested controlled
         * items doesn't reset on collapse), but the grid-template-rows trick clips it visually
         * and animates the transition cleanly. `aria-hidden` toggles per the open state to
         * keep screen readers in sync with the visual hide.
         */}
        <div
          id={bodyId}
          className={disclosureClass}
          aria-hidden={collapsible && !open ? 'true' : undefined}
        >
          <div className="min-h-0 overflow-hidden">
            <div className={bodyClass}>{children}</div>
          </div>
        </div>
      </div>
    );
  },
  'Sidebar.Section',
);
