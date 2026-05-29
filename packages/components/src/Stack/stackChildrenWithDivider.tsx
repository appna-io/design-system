import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

/**
 * Marker attached to the `Spacer` component so the divider inserter can identify Spacer children
 * without an `instanceof` check (which doesn't work across React.lazy / minified bundles). Each
 * Spacer-family component (currently just `<Spacer>`) sets `__sds_spacer = true` on its function
 * value. The marker is on the React component type, not on the rendered element, so this stays
 * tree-shake-safe.
 */
export const SPACER_MARKER = '__sds_spacer' as const;

interface MaybeSpacer {
  [SPACER_MARKER]?: boolean;
}

/**
 * Pure transform: walks `children`, inserting `divider` between every adjacent pair of
 * non-Spacer siblings. Returns the original `children` untouched when `divider` is undefined.
 *
 * Rules:
 *  - Spacer edges are skipped (a Spacer already creates separation; a divider on top of one
 *    looks broken).
 *  - `divider` may be a React element (cloned with a stable key per insertion) or a primitive
 *    (wrapped in a keyed `<Fragment>`).
 *  - Falsy children (`false`, `null`, `undefined`) are filtered before counting siblings, so
 *    conditional rendering doesn't produce orphan dividers.
 *  - Keys are `divider-${index}` where `index` is the position of the *preceding* child in the
 *    filtered array. Stable across re-renders unless the children list changes.
 *
 * The transform is `O(n)` over children and has no React-internal side effects — it's safe to
 * call during render without `useMemo` (children identity already memoizes structurally).
 */
export function stackChildrenWithDivider(
  children: ReactNode,
  divider: ReactNode | undefined,
): ReactNode {
  if (divider === undefined || divider === null || divider === false) return children;

  // `Children.toArray` already strips `false` / `null` / `undefined` per the React docs, so the
  // resulting array never holds the falsy values that conditional rendering would emit. That
  // makes the n−1 divider count match the visible child count without any extra filtering.
  const arr = Children.toArray(children);

  if (arr.length <= 1) return arr;

  const out: ReactNode[] = [];
  arr.forEach((child, i) => {
    out.push(child);
    if (i >= arr.length - 1) return;
    const next = arr[i + 1];
    if (isSpacer(child) || isSpacer(next)) return;
    out.push(renderDivider(divider, i));
  });

  return out;
}

/**
 * Returns true when `node` is a React element whose component type carries the `__sds_spacer`
 * marker. Function components (the only kind Spacer uses) carry the marker as a plain
 * own-property on the function value. Non-element nodes (strings, numbers, fragments, etc.) are
 * never Spacers — they don't have a component type to mark.
 */
export function isSpacer(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  const type = (node as ReactElement).type as MaybeSpacer | string | undefined;
  if (typeof type !== 'function' && typeof type !== 'object') return false;
  return (type as MaybeSpacer)[SPACER_MARKER] === true;
}

function renderDivider(divider: ReactNode, index: number): ReactNode {
  const key = `__sds-divider-${index}`;
  if (isValidElement(divider)) {
    return cloneElement(divider as ReactElement, { key });
  }
  return <Fragment key={key}>{divider}</Fragment>;
}
