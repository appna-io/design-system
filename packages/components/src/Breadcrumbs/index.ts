/**
 * Compound assembly for `<Breadcrumbs>`. Same `Object.assign(root, { …subparts })` shape Card,
 * Tabs, Accordion, etc. use.
 */
import { BreadcrumbsRoot } from './Breadcrumbs';
import { BreadcrumbsItem } from './BreadcrumbsItem';
import { BreadcrumbsSeparator } from './BreadcrumbsSeparator';

export const Breadcrumbs = Object.assign(BreadcrumbsRoot, {
  Item: BreadcrumbsItem,
  Separator: BreadcrumbsSeparator,
});

export { useBreadcrumbsContext } from './BreadcrumbsContext';
export { computeVisibleItems } from './computeVisibleItems';

export type {
  BreadcrumbsColor,
  BreadcrumbsContextValue,
  BreadcrumbsItem as BreadcrumbsItemData,
  BreadcrumbsItemProps,
  BreadcrumbsProps,
  BreadcrumbsRenderItemContext,
  BreadcrumbsSeparatorColor,
  BreadcrumbsSeparatorProps,
  BreadcrumbsSize,
  BreadcrumbsVariant,
} from './Breadcrumbs.types';