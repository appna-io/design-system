'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

import { Pagination } from '../../Pagination';
import type {
  PaginationColor,
  PaginationProps,
  PaginationShape,
  PaginationSize,
  PaginationTranslations,
  PaginationVariant,
} from '../../Pagination';
import { dataGridPaginationRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import type { CursorPagination, PaginationState } from '../DataGrid.types';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export interface DataGridPaginationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Page-size choices shown in the rows-per-page select. @default [10, 25, 50, 100] */
  pageSizeOptions?: number[];
  /** Hide the page-size select if the consumer wants a fixed page size. @default false */
  hidePageSize?: boolean;
  /** Visual variant forwarded to the underlying `<Pagination>`. @default 'ghost' */
  variant?: PaginationVariant;
  /** Size forwarded to the underlying `<Pagination>`. @default 'sm' */
  size?: PaginationSize;
  /** Color forwarded to the underlying `<Pagination>`. @default 'neutral' */
  color?: PaginationColor;
  /** Shape forwarded to the underlying `<Pagination>`. @default 'square' */
  shape?: PaginationShape;
  sx?: Sx;
}

function isCursorPagination(p: PaginationState): p is CursorPagination {
  return (p as CursorPagination).cursor !== undefined;
}

/**
 * `<DataGrid.Pagination>` — bottom-anchored row that delegates entirely to the
 * standalone `<Pagination>` primitive (Phase 31). The DataGrid wrapper's only
 * jobs are:
 *
 *   - bridge the DataGrid state shape onto Pagination's `mode='page'` /
 *     `mode='cursor'` props,
 *   - preserve the DataGrid recipe slot so `DataGrid.styleOverrides.pagination`
 *     keeps targeting the same DOM wrapper,
 *   - honour the DataGrid "show all" sentinel (`pageSize === 0` → render
 *     nothing).
 *
 * Every visible pixel — chevrons, page-list, ARIA wiring, RTL, page-size
 * Select, i18n — comes from `<Pagination>`. Fixing a bug there fixes it
 * here automatically. */
function DataGridPaginationImpl(
  props: DataGridPaginationProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement | null {
  const {
    className,
    sx,
    style,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    hidePageSize = false,
    variant = 'ghost',
    size = 'sm',
    color = 'neutral',
    shape = 'square',
    ...rest
  } = props;
  const ctx = useDataGridContext();
  const { grid, bordered, variant: gridVariant } = ctx;
  const pagination = grid.state.pagination;
  const cursorMode = isCursorPagination(pagination);

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: dataGridPaginationRecipe,
    componentName: 'DataGrid',
    slot: 'pagination',
    props: { bordered, variant: gridVariant, className, sx, style },
  });

  if (!cursorMode && pagination.pageSize === 0) return null;

  const { pageIndex, pageSize } = grid.paginationInfo;
  // DataGrid's `t` is a superset of `PaginationTranslations`. Keys Pagination
  // defines that DataGrid doesn't (paginationLabel / paginationPage /
  // paginationPageCurrent / paginationEllipsis) fall through to Pagination's
  // English defaults via the standard partial-merge precedence.
  const translations = grid.t as Partial<PaginationTranslations>;

  const sharedProps = {
    translations,
    variant,
    size,
    color,
    shape,
    responsive: false,
  } satisfies Partial<PaginationProps>;

  const paginationEl = cursorMode ? (
    <Pagination
      mode="cursor"
      hasPreviousPage
      hasNextPage
      onPrevious={() =>
        grid.setPagination({ cursor: null, pageSize: pagination.pageSize })
      }
      onNext={() =>
        grid.setPagination({ cursor: null, pageSize: pagination.pageSize })
      }
      {...sharedProps}
    />
  ) : (
    <Pagination
      totalCount={grid.totalRowCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      hidePageSize={hidePageSize}
      onChange={({ pageIndex: nextIndex, pageSize: nextSize }) => {
        if (nextSize !== pageSize) grid.setPageSize(nextSize);
        else grid.setPageIndex(nextIndex);
      }}
      {...sharedProps}
    />
  );

  return (
    <div
      ref={ref}
      className={rootClass}
      style={rootStyle ?? undefined}
      data-datagrid-pagination=""
      data-cursor-mode={cursorMode || undefined}
      {...rest}
    >
      {paginationEl}
    </div>
  );
}

export const DataGridPagination = forwardRef(
  DataGridPaginationImpl as (
    props: DataGridPaginationProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => ReactElement,
  'DataGrid.Pagination',
) as (
  props: DataGridPaginationProps & { ref?: Ref<HTMLDivElement> },
) => ReactElement;
