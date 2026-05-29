import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

export type BreadcrumbsVariant = 'ghost' | 'soft' | 'underline';
export type BreadcrumbsSize = 'sm' | 'md' | 'lg';
export type BreadcrumbsColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type BreadcrumbsSeparatorColor = 'muted' | 'subtle' | 'inherit';

/**
 * Data shape for the array API. The most common case (`href` defined → link; `href` missing on
 * the **last** item → current page) lets consumers express path data without per-item flags.
 * Either `href` or `to` is accepted (the latter is the convention for router libraries that
 * use a different prop name). Items with neither and not the last position are rendered as
 * plain text spans.
 */
export interface BreadcrumbsItem {
  /** Visible label. Required. */
  label: ReactNode;
  /** Native anchor href; rendered as `<a href>` when present. */
  href?: string | undefined;
  /** Router-flavored href (e.g. React Router / TanStack Router); aliases `href` if `href` absent. */
  to?: string | undefined;
  /** Optional leading icon node. */
  icon?: ReactNode | undefined;
  /** Force-flag this item as the current page. Defaults to the last item when no `href`/`to`. */
  current?: boolean | undefined;
  /** Opaque key used by React's reconciler; defaults to the item's index. */
  key?: string | number | undefined;
}

/**
 * Render context handed to `renderItem` so consumers can wire a router link, swap the element,
 * or paint a custom-styled crumb while still getting the recipe's class string.
 */
export interface BreadcrumbsRenderItemContext {
  item: BreadcrumbsItem;
  index: number;
  isCurrent: boolean;
  /** The recipe-resolved class string the default renderer would have used. */
  defaultClassName: string;
}

export interface BreadcrumbsProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'color'> {
  /** Array of crumb items. If omitted, consumers must supply compound `<Breadcrumbs.Item>` children. */
  items?: BreadcrumbsItem[] | undefined;
  /** Separator node between items. String or React element. @default '/' */
  separator?: ReactNode | undefined;
  /** Maximum number of items to display before collapsing the middle into an overflow menu. */
  maxItems?: number | undefined;
  /** Items at the start to keep when collapsing. @default 1 */
  itemsBeforeCollapse?: number | undefined;
  /** Items at the end to keep when collapsing. @default 1 */
  itemsAfterCollapse?: number | undefined;
  variant?: ResponsiveValue<BreadcrumbsVariant> | undefined;
  size?: ResponsiveValue<BreadcrumbsSize> | undefined;
  color?: BreadcrumbsColor | undefined;
  /** Separator paint role. @default 'muted' */
  separatorColor?: BreadcrumbsSeparatorColor | undefined;
  /** Custom render fn for every item; overrides default link/span rendering. */
  renderItem?: ((ctx: BreadcrumbsRenderItemContext) => ReactNode) | undefined;
  /** Children — compound API form. Ignored when `items` is provided. */
  children?: ReactNode;
  /**
   * Accessible label for the overflow menu trigger. Defaults to "Show hidden navigation items".
   * Will be replaced by `<I18nProvider>` translations once the i18n primitive ships.
   */
  overflowAriaLabel?: string | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface BreadcrumbsItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'color'> {
  /** Render the item as the passed child element (typically a router `<Link>`). */
  asChild?: boolean | undefined;
  /** Mark this item as the current page (paints differently, gets `aria-current="page"`). */
  current?: boolean | undefined;
  /** Optional leading icon node. */
  icon?: ReactNode | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface BreadcrumbsSeparatorProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'color'> {
  /** Overrides the root's separator content for this single slot. */
  children?: ReactNode;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

/**
 * Resolved context that flows from `<Breadcrumbs>` to its compound subparts. The variant /
 * size / color axes are pre-resolved so children don't re-run responsive resolution.
 */
export interface BreadcrumbsContextValue {
  variant: BreadcrumbsVariant;
  size: BreadcrumbsSize;
  color: BreadcrumbsColor;
  separatorColor: BreadcrumbsSeparatorColor;
  separator: ReactNode;
}
