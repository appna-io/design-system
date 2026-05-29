'use client';

import {
  forwardRef,
  isResponsiveObject,
  useDirection,
  useMediaQuery,
  type Sx,
} from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useId, useMemo, type CSSProperties, type ReactElement } from 'react';

import { Select } from '../Select';
import {
  paginationButtonRecipe,
  paginationEllipsisRecipe,
  paginationListRecipe,
  paginationRangeLabelRecipe,
  paginationRootRecipe,
  paginationSizePickerRecipe,
} from './Pagination.recipe';
import type {
  PageItem,
  PaginationColor,
  PaginationLayout,
  PaginationProps,
  PaginationShape,
  PaginationSize,
  PaginationTranslations,
  PaginationVariant,
  UsePaginationReturn,
} from './Pagination.types';
import { usePagination } from './usePagination';
import { usePaginationTranslations } from './i18n/usePaginationTranslations';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_LABEL = 'Pagination';
const COMPACT_BREAKPOINT_QUERY = '(max-width: 639px)';

/**
 * `<Pagination />` — standalone primitive used directly on lists / gallery
 * grids / search results, and re-used by `<DataGrid.Pagination />` so the
 * two surfaces never drift apart.
 *
 * The component is a thin presentation layer on top of `usePagination()`:
 * the hook owns all state derivation (window computation, cursor handling,
 * row range math) and this file owns the DOM + recipe + i18n wiring.
 *
 * Layouts (see `PaginationLayout`):
 *
 *   - `full`       — first · prev · page list · next · last · range · size picker
 *   - `compact`    — prev · "Page X of Y" · next
 *   - `pages-only` — page list
 *   - `simple`     — prev · next
 *
 * When `responsive` is `true` (the default), `full` auto-degrades to
 * `compact` below the `sm` breakpoint so mobile consumers don't get a
 * truncated/wrapping row.
 *
 * Cursor mode (`mode="cursor"`) hides everything except prev / next +
 * disables them via the consumer's `hasPreviousPage` / `hasNextPage` flags
 * regardless of the layout enum — there's no concept of "page 3 of 12" on a
 * server that doesn't expose a total.
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(props, ref): ReactElement {
    const {
      mode = 'page',
      totalCount,
      pageIndex,
      defaultPageIndex,
      pageSize,
      defaultPageSize,
      onChange,
      hasPreviousPage,
      hasNextPage,
      onPrevious,
      onNext,
      pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
      hidePageSize = false,
      siblingCount,
      boundaryCount,
      layout,
      responsive = true,
      variant,
      size,
      color,
      shape,
      showRangeLabel = true,
      showFirstLast = true,
      translations: translationsProp,
      className,
      style,
      sx,
      'aria-label': ariaLabel,
      children: _children,
      ...rest
    } = props;

    /* ------------------------------------------------------------------ */
    /*  Resolve responsive visual axes                                     */
    /* ------------------------------------------------------------------ */

    const resolvedVariant = resolveResponsiveScalar<PaginationVariant>(variant, 'ghost');
    const resolvedSize = resolveResponsiveScalar<PaginationSize>(size, 'md');
    const resolvedColor = resolveResponsiveScalar<PaginationColor>(color, 'primary');
    const resolvedShape = resolveResponsiveScalar<PaginationShape>(shape, 'square');
    const requestedLayout = resolveResponsiveScalar<PaginationLayout>(layout, 'full');

    /* ------------------------------------------------------------------ */
    /*  Responsive auto-degrade — `full` → `compact` below sm              */
    /* ------------------------------------------------------------------ */
    /* We always call the hook (rules of hooks) but only honour its value
     * when responsive is true AND the requested layout is `full`. The
     * SSR-safe default is `false` (the desktop layout), so first paint
     * matches the server.                                                */
    const isBelowSm = useMediaQuery(COMPACT_BREAKPOINT_QUERY);
    const effectiveLayout: PaginationLayout =
      responsive && requestedLayout === 'full' && isBelowSm ? 'compact' : requestedLayout;

    /* ------------------------------------------------------------------ */
    /*  Headless state                                                     */
    /* ------------------------------------------------------------------ */

    const grid = usePagination({
      mode,
      totalCount,
      pageIndex,
      defaultPageIndex,
      pageSize,
      defaultPageSize,
      onChange,
      hasPreviousPage,
      hasNextPage,
      onPrevious,
      onNext,
      siblingCount,
      boundaryCount,
    });

    const t = usePaginationTranslations(translationsProp);
    const direction = useDirection();
    const isRtl = direction === 'rtl';

    /* ------------------------------------------------------------------ */
    /*  Root recipe                                                        */
    /* ------------------------------------------------------------------ */

    const { className: rootClass, style: rootStyle } = useThemedClasses({
      recipe: paginationRootRecipe,
      componentName: 'Pagination',
      slot: 'root',
      props: {
        size: resolvedSize,
        layout: effectiveLayout,
        justify: effectiveLayout === 'full' ? 'between' : 'center',
        className,
        sx,
        style,
      },
    });

    /* ------------------------------------------------------------------ */
    /*  Slot trees per layout                                              */
    /* ------------------------------------------------------------------ */

    const cursorMode = grid.mode === 'cursor';

    const navContent = useMemo(() => {
      switch (effectiveLayout) {
        case 'simple':
          return renderSimple({ grid, isRtl, resolvedVariant, resolvedColor, resolvedSize, resolvedShape, t });
        case 'compact':
          return renderCompact({ grid, isRtl, resolvedVariant, resolvedColor, resolvedSize, resolvedShape, t });
        case 'pages-only':
          return renderPagesOnly({
            grid,
            isRtl,
            resolvedVariant,
            resolvedColor,
            resolvedSize,
            resolvedShape,
            t,
          });
        case 'full':
        default:
          return renderFull({
            grid,
            isRtl,
            cursorMode,
            resolvedVariant,
            resolvedColor,
            resolvedSize,
            resolvedShape,
            showFirstLast,
            showRangeLabel,
            hidePageSize,
            pageSizeOptions,
            t,
          });
      }
    }, [
      effectiveLayout,
      grid,
      isRtl,
      cursorMode,
      resolvedVariant,
      resolvedColor,
      resolvedSize,
      resolvedShape,
      showFirstLast,
      showRangeLabel,
      hidePageSize,
      pageSizeOptions,
      t,
    ]);

    /* ------------------------------------------------------------------ */
    /*  ARIA                                                               */
    /* ------------------------------------------------------------------ */

    const resolvedAriaLabel = ariaLabel ?? t.paginationLabel ?? DEFAULT_LABEL;

    return (
      <nav
        ref={ref}
        aria-label={resolvedAriaLabel}
        data-pagination=""
        data-mode={grid.mode}
        data-layout={effectiveLayout}
        data-variant={resolvedVariant}
        data-color={resolvedColor}
        data-size={resolvedSize}
        data-shape={resolvedShape}
        data-dir={direction}
        className={rootClass}
        style={rootStyle ?? undefined}
        {...rest}
      >
        {navContent}
      </nav>
    );
  },
  'Pagination',
);

/* -------------------------------------------------------------------------- */
/*  Layout renderers                                                           */
/* -------------------------------------------------------------------------- */

interface SharedRenderArgs {
  grid: UsePaginationReturn;
  isRtl: boolean;
  resolvedVariant: PaginationVariant;
  resolvedColor: PaginationColor;
  resolvedSize: PaginationSize;
  resolvedShape: PaginationShape;
  t: PaginationTranslations;
}

interface FullRenderArgs extends SharedRenderArgs {
  cursorMode: boolean;
  showFirstLast: boolean;
  showRangeLabel: boolean;
  hidePageSize: boolean;
  pageSizeOptions: number[];
}

/* -------------- full -------------- */

function renderFull(args: FullRenderArgs): ReactElement {
  const {
    grid,
    isRtl,
    cursorMode,
    resolvedVariant,
    resolvedColor,
    resolvedSize,
    resolvedShape,
    showFirstLast,
    showRangeLabel,
    hidePageSize,
    pageSizeOptions,
    t,
  } = args;

  const totalRows = grid.totalCount ?? 0;

  return (
    <>
      {/* Logical START group: size picker (or empty placeholder to preserve flex spacing). */}
      {hidePageSize || cursorMode ? (
        <span data-pagination-spacer="" />
      ) : (
        <SizePicker
          value={grid.pageSize}
          options={pageSizeOptions}
          onChange={grid.setPageSize}
          size={resolvedSize}
          label={t.paginationRowsPerPage}
        />
      )}

      {/* Logical MIDDLE group: range label. */}
      {showRangeLabel && !cursorMode ? (
        <RangeLabel
          fromRow={grid.fromRow}
          toRow={grid.toRow}
          totalRows={totalRows}
          size={resolvedSize}
          format={t.paginationOfTotal}
        />
      ) : (
        <span data-pagination-spacer="" />
      )}

      {/* Logical END group: nav chevrons + page list. */}
      <PageNav
        grid={grid}
        isRtl={isRtl}
        cursorMode={cursorMode}
        resolvedVariant={resolvedVariant}
        resolvedColor={resolvedColor}
        resolvedSize={resolvedSize}
        resolvedShape={resolvedShape}
        showFirstLast={showFirstLast}
        showPageList={!cursorMode}
        t={t}
      />
    </>
  );
}

/* -------------- compact -------------- */

function renderCompact(args: SharedRenderArgs): ReactElement {
  const { grid, isRtl, resolvedVariant, resolvedColor, resolvedSize, resolvedShape, t } = args;
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const label =
    grid.mode === 'cursor'
      ? t.paginationPageOfPages(grid.pageIndex + 1, 1)
      : t.paginationPageOfPages(grid.pageIndex + 1, Math.max(grid.pageCount, 1));

  return (
    <div className="flex items-center gap-2" data-pagination-compact="">
      <PagButton
        variant={resolvedVariant}
        color={resolvedColor}
        size={resolvedSize}
        shape={resolvedShape}
        iconOnly
        ariaLabel={t.paginationPreviousPage}
        disabled={grid.atFirstPage}
        onClick={grid.goPrevious}
        data-pagination-prev=""
      >
        <PrevIcon aria-hidden />
      </PagButton>

      <span className="text-fg-muted text-sm tabular-nums px-1" data-pagination-status="">
        {label}
      </span>

      <PagButton
        variant={resolvedVariant}
        color={resolvedColor}
        size={resolvedSize}
        shape={resolvedShape}
        iconOnly
        ariaLabel={t.paginationNextPage}
        disabled={grid.atLastPage}
        onClick={grid.goNext}
        data-pagination-next=""
      >
        <NextIcon aria-hidden />
      </PagButton>
    </div>
  );
}

/* -------------- pages-only -------------- */

function renderPagesOnly(args: SharedRenderArgs): ReactElement {
  const { grid, resolvedVariant, resolvedColor, resolvedSize, resolvedShape, t } = args;
  return (
    <PageList
      items={grid.pageItems}
      currentPageIndex={grid.pageIndex}
      onPick={grid.setPageIndex}
      resolvedVariant={resolvedVariant}
      resolvedColor={resolvedColor}
      resolvedSize={resolvedSize}
      resolvedShape={resolvedShape}
      t={t}
    />
  );
}

/* -------------- simple -------------- */

function renderSimple(args: SharedRenderArgs): ReactElement {
  const { grid, isRtl, resolvedVariant, resolvedColor, resolvedSize, resolvedShape, t } = args;
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="flex items-center gap-1" data-pagination-simple="">
      <PagButton
        variant={resolvedVariant}
        color={resolvedColor}
        size={resolvedSize}
        shape={resolvedShape}
        iconOnly
        ariaLabel={t.paginationPreviousPage}
        disabled={grid.atFirstPage}
        onClick={grid.goPrevious}
        data-pagination-prev=""
      >
        <PrevIcon aria-hidden />
      </PagButton>
      <PagButton
        variant={resolvedVariant}
        color={resolvedColor}
        size={resolvedSize}
        shape={resolvedShape}
        iconOnly
        ariaLabel={t.paginationNextPage}
        disabled={grid.atLastPage}
        onClick={grid.goNext}
        data-pagination-next=""
      >
        <NextIcon aria-hidden />
      </PagButton>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared subparts                                                            */
/* -------------------------------------------------------------------------- */

interface PageNavProps extends SharedRenderArgs {
  cursorMode: boolean;
  showFirstLast: boolean;
  showPageList: boolean;
}

function PageNav(props: PageNavProps): ReactElement {
  const {
    grid,
    isRtl,
    cursorMode,
    resolvedVariant,
    resolvedColor,
    resolvedSize,
    resolvedShape,
    showFirstLast,
    showPageList,
    t,
  } = props;

  const FirstIcon = isRtl ? ChevronsRight : ChevronsLeft;
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const LastIcon = isRtl ? ChevronsLeft : ChevronsRight;

  return (
    <div className="flex items-center gap-1" data-pagination-nav="">
      {showFirstLast && !cursorMode && (
        <PagButton
          variant={resolvedVariant}
          color={resolvedColor}
          size={resolvedSize}
          shape={resolvedShape}
          iconOnly
          ariaLabel={t.paginationFirstPage}
          disabled={grid.atFirstPage}
          onClick={grid.goFirst}
          data-pagination-first=""
        >
          <FirstIcon aria-hidden />
        </PagButton>
      )}

      <PagButton
        variant={resolvedVariant}
        color={resolvedColor}
        size={resolvedSize}
        shape={resolvedShape}
        iconOnly
        ariaLabel={t.paginationPreviousPage}
        disabled={grid.atFirstPage}
        onClick={grid.goPrevious}
        data-pagination-prev=""
      >
        <PrevIcon aria-hidden />
      </PagButton>

      {showPageList && (
        <PageList
          items={grid.pageItems}
          currentPageIndex={grid.pageIndex}
          onPick={grid.setPageIndex}
          resolvedVariant={resolvedVariant}
          resolvedColor={resolvedColor}
          resolvedSize={resolvedSize}
          resolvedShape={resolvedShape}
          t={t}
        />
      )}

      <PagButton
        variant={resolvedVariant}
        color={resolvedColor}
        size={resolvedSize}
        shape={resolvedShape}
        iconOnly
        ariaLabel={t.paginationNextPage}
        disabled={grid.atLastPage}
        onClick={grid.goNext}
        data-pagination-next=""
      >
        <NextIcon aria-hidden />
      </PagButton>

      {showFirstLast && !cursorMode && (
        <PagButton
          variant={resolvedVariant}
          color={resolvedColor}
          size={resolvedSize}
          shape={resolvedShape}
          iconOnly
          ariaLabel={t.paginationLastPage}
          disabled={grid.atLastPage}
          onClick={grid.goLast}
          data-pagination-last=""
        >
          <LastIcon aria-hidden />
        </PagButton>
      )}
    </div>
  );
}

/* -------------- PageList -------------- */

interface PageListProps {
  items: PageItem[];
  currentPageIndex: number;
  onPick: (next: number) => void;
  resolvedVariant: PaginationVariant;
  resolvedColor: PaginationColor;
  resolvedSize: PaginationSize;
  resolvedShape: PaginationShape;
  t: PaginationTranslations;
}

function PageList(props: PageListProps): ReactElement {
  const {
    items,
    currentPageIndex,
    onPick,
    resolvedVariant,
    resolvedColor,
    resolvedSize,
    resolvedShape,
    t,
  } = props;

  const { className: listClass } = useThemedClasses({
    recipe: paginationListRecipe,
    componentName: 'Pagination',
    slot: 'list',
    props: {},
  });

  return (
    <ol className={listClass} data-pagination-list="">
      {items.map((item, idx) => {
        if (item === 'ellipsis-start' || item === 'ellipsis-end') {
          return (
            <li key={`${item}-${idx}`} data-pagination-item="ellipsis">
              <Ellipsis size={resolvedSize} ariaLabel={t.paginationEllipsis} side={item} />
            </li>
          );
        }
        const pageNumber = item;
        const isCurrent = pageNumber - 1 === currentPageIndex;
        const label = isCurrent
          ? t.paginationPageCurrent(pageNumber)
          : t.paginationPage(pageNumber);
        return (
          <li key={pageNumber} data-pagination-item="page">
            <PagButton
              variant={resolvedVariant}
              color={resolvedColor}
              size={resolvedSize}
              shape={resolvedShape}
              current={isCurrent}
              ariaLabel={label}
              ariaCurrent={isCurrent ? 'page' : undefined}
              onClick={() => onPick(pageNumber - 1)}
              data-pagination-page={pageNumber}
            >
              {pageNumber}
            </PagButton>
          </li>
        );
      })}
    </ol>
  );
}

/* -------------- PagButton -------------- */

interface PagButtonProps {
  variant: PaginationVariant;
  color: PaginationColor;
  size: PaginationSize;
  shape: PaginationShape;
  current?: boolean;
  iconOnly?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  ariaCurrent?: 'page' | undefined;
  onClick?: () => void;
  children: ReactElement | number | string;
  className?: string;
  sx?: Sx;
  style?: CSSProperties;
  [dataAttr: `data-${string}`]: unknown;
}

function PagButton(props: PagButtonProps): ReactElement {
  const {
    variant,
    color,
    size,
    shape,
    current = false,
    iconOnly = false,
    disabled = false,
    ariaLabel,
    ariaCurrent,
    onClick,
    children,
    className,
    sx,
    style,
    ...dataAttrs
  } = props;

  const { className: btnClass, style: btnStyle } = useThemedClasses({
    recipe: paginationButtonRecipe,
    componentName: 'Pagination',
    slot: 'button',
    props: { variant, color, size, shape, current, iconOnly, className, sx, style },
  });

  return (
    <button
      type="button"
      className={btnClass}
      style={btnStyle ?? undefined}
      aria-label={ariaLabel}
      {...(ariaCurrent ? { 'aria-current': ariaCurrent } : {})}
      disabled={disabled}
      onClick={onClick}
      {...dataAttrs}
    >
      {children}
    </button>
  );
}

/* -------------- Ellipsis -------------- */

interface EllipsisProps {
  size: PaginationSize;
  ariaLabel: string;
  side: 'ellipsis-start' | 'ellipsis-end';
}

function Ellipsis(props: EllipsisProps): ReactElement {
  const { size, ariaLabel, side } = props;
  const { className } = useThemedClasses({
    recipe: paginationEllipsisRecipe,
    componentName: 'Pagination',
    slot: 'ellipsis',
    props: { size },
  });
  return (
    <span
      className={className}
      aria-hidden="true"
      data-pagination-ellipsis={side === 'ellipsis-start' ? 'start' : 'end'}
      title={ariaLabel}
    >
      …
    </span>
  );
}

/* -------------- RangeLabel -------------- */

interface RangeLabelProps {
  fromRow: number;
  toRow: number;
  totalRows: number;
  size: PaginationSize;
  format: PaginationTranslations['paginationOfTotal'];
}

function RangeLabel(props: RangeLabelProps): ReactElement {
  const { fromRow, toRow, totalRows, size, format } = props;
  const { className } = useThemedClasses({
    recipe: paginationRangeLabelRecipe,
    componentName: 'Pagination',
    slot: 'rangeLabel',
    props: { size },
  });
  return (
    <span className={className} data-pagination-range="">
      {format(fromRow, toRow, totalRows)}
    </span>
  );
}

/* -------------- SizePicker -------------- */

interface SizePickerProps {
  value: number;
  options: number[];
  onChange: (next: number) => void;
  size: PaginationSize;
  label: string;
}

function SizePicker(props: SizePickerProps): ReactElement {
  const { value, options, onChange, size, label } = props;
  const labelId = useId();
  const { className: wrapClass } = useThemedClasses({
    recipe: paginationSizePickerRecipe,
    componentName: 'Pagination',
    slot: 'sizePicker',
    props: { size },
  });
  return (
    <div className={wrapClass} data-pagination-size-picker="">
      <label htmlFor={labelId} className="text-fg-muted">
        {label}
      </label>
      <Select
        value={String(value)}
        onValueChange={(next) => onChange(Number(next))}
        size={size}
        fullWidth={false}
      >
        <Select.Trigger id={labelId} aria-label={label} />
        <Select.Content>
          {options.map((opt) => (
            <Select.Item key={opt} value={String(opt)}>
              {opt}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Resolve a `ResponsiveValue<T>` down to its initial-paint scalar. Mirrors the
 * approach Breadcrumbs / Tabs use for non-Tailwind-driven axes: the recipe's
 * own `cv()` already handles per-breakpoint class strings; this resolver picks
 * the value used by the recipe + the JS render paths (icon flipping, ARIA
 * labels, etc.) that don't go through CSS media queries.
 *
 * Order of preference matches the breakpoint scale: base → sm → md → lg.
 */
function resolveResponsiveScalar<T extends string>(
  value: T | Partial<Record<string, T>> | undefined,
  fallback: T,
): T {
  if (value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (isResponsiveObject(value as Partial<Record<string, T>>)) {
    const obj = value as Partial<Record<'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', T>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? obj.xl ?? obj['2xl'] ?? fallback;
  }
  return fallback;
}
