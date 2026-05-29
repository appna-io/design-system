'use client';

import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

import { Tooltip } from '../Tooltip';

/**
 * Heuristic for "this child is iconic (no visible text label)". A child counts as iconic when
 * either:
 *   - Its `children` prop is missing / empty / only contains element nodes (no string text).
 *   - It carries an `aria-label` (so it's already declared its accessible name elsewhere).
 *
 * We deliberately don't crack open Toggle / Button internals to inspect — the check is purely
 * based on the JSX props the consumer passed. Buttons with visible text are skipped because
 * doubling the visible text inside a tooltip is just noise.
 */
function hasVisibleText(node: ReactNode): boolean {
  if (typeof node === 'string') return node !== '';
  if (typeof node === 'number') return true;
  if (Array.isArray(node)) {
    return node.some((child) => hasVisibleText(child));
  }
  if (isValidElement(node)) {
    const childProps = node.props as { children?: ReactNode };
    return hasVisibleText(childProps.children);
  }
  return false;
}

interface ToolbarChildProps {
  'aria-label'?: string;
  children?: ReactNode;
  // Pass-through — applyTooltips never reads beyond aria-label + children.
}

/**
 * Wrap iconic children in `<Tooltip>` so the `aria-label` becomes a visible hint on hover /
 * focus. Non-iconic children, fragments, primitives, and non-element nodes are returned
 * unchanged. The wrapper is keyed off the original child's key (or its array index) so React
 * keeps stable reconciliation across renders.
 *
 * Tooltip placement is fixed at `bottom` for horizontal toolbars and `right` for vertical —
 * matches Notion / Linear / Figma convention. Consumers who want a different placement should
 * wrap their own `<Tooltip>` manually and disable `applyTooltips`.
 */
export function applyTooltipsToChildren(
  children: ReactNode,
  options: { placement: 'bottom' | 'right' },
): ReactNode {
  return Children.map(children, (child, index) => {
    if (!isValidElement<ToolbarChildProps>(child)) return child;
    const ariaLabel = child.props['aria-label'];
    if (!ariaLabel) return child;
    if (hasVisibleText(child.props.children)) return child;

    // Forwarding `asChild={true}` is the simplest contract — Tooltip will clone the inner
    // element and pass through ref / event handlers. The key forwarding keeps React's
    // reconciliation stable when the toolbar's child list changes (e.g. overflow recount).
    const key = child.key ?? `applied-tooltip-${index}`;
    return (
      <Fragment key={key}>
        <Tooltip content={ariaLabel} placement={options.placement}>
          {cloneElement(child as ReactElement)}
        </Tooltip>
      </Fragment>
    );
  });
}
