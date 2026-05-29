'use client';

import { cn, forwardRef } from '@apx-ui/engine';

import { useSidebarContext } from './Sidebar.context';
import type { SidebarSpacerProps } from './Sidebar.types';

/**
 * `<Sidebar.Spacer>` — fills available vertical space inside the sidebar's flex column. Use it
 * to push `<Sidebar.Footer>` to the bottom of the rail, or to separate two visual groups.
 *
 * Implementation note: we don't reuse the Stack family's `<Spacer>` here because that component
 * inserts a marker into Stack's divider logic (`SPACER_MARKER`), which has no meaning in a
 * Sidebar context. The sidebar variant is a tiny `flex: 1 1 auto` div — same shape, simpler.
 */
export const SidebarSpacer = forwardRef<HTMLDivElement, SidebarSpacerProps>(
  function SidebarSpacer(props, ref) {
    const { className, style, ...rest } = props;

    // Throw early if used outside a Sidebar — the prop intent is sidebar-scoped.
    useSidebarContext('Sidebar.Spacer');

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn('flex-1 self-stretch', className)}
        style={style}
        data-sidebar-spacer=""
        {...rest}
      />
    );
  },
  'Sidebar.Spacer',
);
