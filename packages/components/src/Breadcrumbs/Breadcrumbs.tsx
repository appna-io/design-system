'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useMemo,
  type ReactElement,
  type ReactNode,
} from 'react';

import { breadcrumbsRecipes } from './Breadcrumbs.recipe';
import { BreadcrumbsContext } from './BreadcrumbsContext';
import { BreadcrumbsItem } from './BreadcrumbsItem';
import { BreadcrumbsOverflow } from './BreadcrumbsOverflow';
import { BreadcrumbsSeparator } from './BreadcrumbsSeparator';
import { computeVisibleItems } from './computeVisibleItems';
import type {
  BreadcrumbsColor,
  BreadcrumbsItem as BreadcrumbsItemData,
  BreadcrumbsProps,
  BreadcrumbsSize,
  BreadcrumbsVariant,
} from './Breadcrumbs.types';

const DEFAULT_OVERFLOW_LABEL = 'Show hidden navigation items';
const DEFAULT_ARIA_LABEL = 'Breadcrumb';

/**
 * The compound root. Renders `<nav><ol>…</ol></nav>` and provides every subpart the resolved
 * variant / size / color / separator so they can compose without re-reading props.
 *
 * Two APIs share the same root:
 *  - **Array API** (`items={…}`) — root reads the array, renders `<Breadcrumbs.Item>` per crumb,
 *    interleaves separators, and handles `maxItems` overflow via `<Menu>`.
 *  - **Compound API** (`<Breadcrumbs.Item>` children) — root walks the children, auto-inserts
 *    a separator between every two non-separator items, and lets the consumer skip the manual
 *    `<Breadcrumbs.Separator>` boilerplate (consumers who DO include their own separators get
 *    them passed through unchanged).
 *
 * Both paths land on the same `<ol>` shape, so screen readers see one consistent navigation
 * structure regardless of which API the consumer chose.
 */
export const BreadcrumbsRoot = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  props,
  ref,
) {
  const {
    items,
    separator = '/',
    maxItems,
    itemsBeforeCollapse = 1,
    itemsAfterCollapse = 1,
    variant,
    size,
    color,
    separatorColor = 'muted',
    renderItem,
    overflowAriaLabel = DEFAULT_OVERFLOW_LABEL,
    children,
    className,
    style,
    sx,
    'aria-label': ariaLabel = DEFAULT_ARIA_LABEL,
    ...rest
  } = props;

  const resolvedVariant = resolveVariant(variant);
  const resolvedSize = resolveSize(size);
  const resolvedColor: BreadcrumbsColor = color ?? 'neutral';

  const { className: rootCls, style: rootStyle } = useThemedClasses({
    recipe: breadcrumbsRecipes.root,
    componentName: 'Breadcrumbs',
    slot: 'root',
    props: { size, className, sx, style },
  });

  const { className: listCls } = useThemedClasses({
    recipe: breadcrumbsRecipes.list,
    componentName: 'Breadcrumbs',
    slot: 'list',
    props: { size },
  });

  const ctxValue = useMemo(
    () => ({
      variant: resolvedVariant,
      size: resolvedSize,
      color: resolvedColor,
      separatorColor,
      separator,
    }),
    [resolvedVariant, resolvedSize, resolvedColor, separatorColor, separator],
  );

  const content = items
    ? renderArrayApi({
        items,
        maxItems,
        itemsBeforeCollapse,
        itemsAfterCollapse,
        overflowAriaLabel,
        renderItem,
        size: resolvedSize,
      })
    : renderCompoundApi(children, separator);

  return (
    <BreadcrumbsContext.Provider value={ctxValue}>
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={rootCls}
        style={rootStyle ?? undefined}
        {...rest}
      >
        <ol className={listCls}>{content}</ol>
      </nav>
    </BreadcrumbsContext.Provider>
  );
}, 'Breadcrumbs');

interface RenderArrayApiArgs {
  items: BreadcrumbsItemData[];
  maxItems?: number | undefined;
  itemsBeforeCollapse: number;
  itemsAfterCollapse: number;
  overflowAriaLabel: string;
  renderItem: BreadcrumbsProps['renderItem'];
  size: BreadcrumbsSize;
}

function renderArrayApi(args: RenderArrayApiArgs): ReactNode {
  const { items, maxItems, itemsBeforeCollapse, itemsAfterCollapse, overflowAriaLabel, renderItem, size } =
    args;

  const { before, after, hidden, collapsedAt } = computeVisibleItems({
    items,
    maxItems,
    itemsBeforeCollapse,
    itemsAfterCollapse,
  });

  const total = items.length;
  const visibleItems: Array<{ kind: 'item'; item: BreadcrumbsItemData; originalIndex: number }> = [];

  for (let i = 0; i < before.length; i++) {
    visibleItems.push({ kind: 'item', item: before[i] as BreadcrumbsItemData, originalIndex: i });
  }
  for (let j = 0; j < after.length; j++) {
    const originalIndex = total - after.length + j;
    visibleItems.push({ kind: 'item', item: after[j] as BreadcrumbsItemData, originalIndex });
  }

  const nodes: ReactNode[] = [];
  let needsSeparator = false;

  // Walk the visible items and weave in (separator → item) pairs. The overflow trigger is
  // injected at the boundary between `before` and `after` when collapsedAt !== null.
  let inserted = 0;
  for (const v of visibleItems) {
    if (collapsedAt !== null && inserted === collapsedAt && hidden.length > 0) {
      // Separator before the overflow trigger so visual rhythm matches the non-collapsed case.
      if (needsSeparator) {
        nodes.push(<BreadcrumbsSeparator key={`sep-overflow`} />);
      }
      nodes.push(
        <BreadcrumbsOverflow
          key="overflow"
          hidden={hidden}
          size={size}
          ariaLabel={overflowAriaLabel}
          {...(renderItem
            ? {
                renderItem: (item: BreadcrumbsItemData, idx: number) =>
                  renderItem({
                    item,
                    index: idx + itemsBeforeCollapse,
                    isCurrent: false,
                    defaultClassName: '',
                  }),
              }
            : {})}
        />,
      );
      needsSeparator = true;
    }

    if (needsSeparator) {
      nodes.push(<BreadcrumbsSeparator key={`sep-${v.originalIndex}`} />);
    }

    const isCurrent =
      v.item.current === true ||
      (v.item.current === undefined &&
        v.originalIndex === total - 1 &&
        !v.item.href &&
        !v.item.to);

    nodes.push(renderItemNode(v.item, v.originalIndex, isCurrent, renderItem));
    needsSeparator = true;
    inserted++;
  }

  return nodes;
}

function renderItemNode(
  item: BreadcrumbsItemData,
  index: number,
  isCurrent: boolean,
  renderItem: BreadcrumbsProps['renderItem'],
): ReactNode {
  const key = item.key ?? `item-${index}`;
  const href = item.href ?? item.to;

  if (renderItem) {
    // Consumer takes over rendering — wrap in `<li>` so the outer `<ol>` stays valid HTML.
    return (
      <li key={key} data-breadcrumbs-item="" data-current={isCurrent || undefined}>
        {renderItem({ item, index, isCurrent, defaultClassName: '' })}
      </li>
    );
  }

  // Default array-API rendering: link items get a real `<a>` via `asChild`; current / text-only
  // items render as a `<span>` inside the BreadcrumbsItem.
  if (href && !isCurrent) {
    return (
      <BreadcrumbsItem key={key} asChild icon={item.icon}>
        <a href={href}>{item.label}</a>
      </BreadcrumbsItem>
    );
  }

  return (
    <BreadcrumbsItem key={key} current={isCurrent} icon={item.icon}>
      {item.label}
    </BreadcrumbsItem>
  );
}

function renderCompoundApi(children: ReactNode, separator: ReactNode): ReactNode {
  // Walk the children, auto-inserting a separator between every two adjacent non-separator,
  // non-overflow items. Consumers can pre-insert their own `<Breadcrumbs.Separator>` between
  // items if they want a different separator per slot — those slots pass through unchanged.
  const arr = Children.toArray(children);

  // If the consumer already inserted separators themselves, render as-is. We detect this by
  // checking whether any child element has `data-breadcrumbs-separator` (set via the element
  // type identity — we compare the type to `BreadcrumbsSeparator`).
  const hasManualSeparators = arr.some(
    (child) => isValidElement(child) && child.type === BreadcrumbsSeparator,
  );
  if (hasManualSeparators) return arr;

  // Auto-weave separators between item-shaped children. We use the resolved root `separator`
  // prop so the consumer's `separator="ChevronRight"` flows through to the auto-inserted slots.
  const result: ReactNode[] = [];
  arr.forEach((child, index) => {
    if (index > 0) {
      result.push(
        <BreadcrumbsSeparator key={`auto-sep-${index}`}>{separator}</BreadcrumbsSeparator>,
      );
    }
    // Preserve the child's key if present; React's reconciler doesn't need anything fancy here.
    result.push(
      isValidElement(child)
        ? cloneElement(child as ReactElement, { key: child.key ?? `auto-item-${index}` })
        : <Fragment key={`auto-frag-${index}`}>{child}</Fragment>,
    );
  });

  return result;
}

function resolveVariant(value: BreadcrumbsProps['variant']): BreadcrumbsVariant {
  if (value === undefined) return 'ghost';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, BreadcrumbsVariant>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'ghost';
  }
  return 'ghost';
}

function resolveSize(value: BreadcrumbsProps['size']): BreadcrumbsSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, BreadcrumbsSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}
