'use client';

import { useThemedClasses } from '@apx-ui/theme';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

import { Skeleton } from '../../Skeleton/Skeleton';
import { Spinner } from '../../Spinner/Spinner';
import { dataGridLoadingOverlayRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';

export interface DataGridLoadingProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `'overlay'` (default) — covers the body with a translucent layer so existing
   * data stays visible underneath (useful for "loading new page" UX).
   *
   * `'inline'` — replaces the body with skeleton rows. Better for first-load when
   * there's nothing to show.
   */
  mode?: 'overlay' | 'inline';
  /** Number of skeleton rows in `inline` mode. Defaults to 5. */
  rowCount?: number;
  /** Custom children replace the default skeleton + spinner if supplied. */
  children?: ReactNode;
}

/**
 * `<DataGrid.Loading />` — pluggable loading indicator.
 *
 * The high-level `<DataGrid>` mounts this automatically when `loading={true}` is
 * passed; headless consumers can drop it into any layout themselves. Defaults to the
 * canonical "overlay + spinner" pattern (existing data dims, spinner centers above)
 * because that's the right call when paging/sorting an already-populated table.
 *
 * Accessibility: container is `role="status" aria-live="polite"` so SR users hear a
 * single "Loading" announcement when the indicator mounts.
 */
export function DataGridLoading(props: DataGridLoadingProps): ReactElement {
  const { mode = 'overlay', rowCount = 5, className, children, ...rest } = props;
  const ctx = useDataGridContext();
  const t = ctx.grid.t;

  const { className: overlayClass } = useThemedClasses({
    recipe: dataGridLoadingOverlayRecipe,
    componentName: 'DataGrid',
    slot: 'loadingOverlay',
    props: { className },
  });

  if (mode === 'inline') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={t.loading}
        data-datagrid-loading=""
        data-mode="inline"
        className={className ?? 'flex flex-col gap-2 p-2'}
        {...rest}
      >
        {children ?? (
          <>
            {Array.from({ length: rowCount }).map((_, i) => (
              <Skeleton key={i} height={32} width="100%" aria-hidden="true" />
            ))}
          </>
        )}
        <span className="sr-only">{t.loading}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t.loading}
      data-datagrid-loading=""
      data-mode="overlay"
      className={overlayClass}
      {...rest}
    >
      {children ?? (
        <div className="flex items-center gap-3 rounded-md bg-bg-paper px-4 py-2 shadow-md">
          <Spinner size="sm" />
          <span className="text-sm text-fg-default">{t.loading}</span>
        </div>
      )}
    </div>
  );
}
