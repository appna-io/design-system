'use client';

import { AlertTriangle } from 'lucide-react';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

import { Button } from '../../Button/Button';
import { EmptyState } from '../../EmptyState';
import { useDataGridContext } from '../DataGridContext';

export interface DataGridErrorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  /** Override the default `<AlertTriangle>` lucide icon. Pass `null` to render no icon. */
  icon?: ReactNode | null;
  /**
   * Called when the user presses the retry button. When omitted, the retry button is
   * not rendered — the failure is terminal from the grid's perspective and the
   * consumer hasn't given us a recovery path.
   */
  onRetry?: () => void;
}

/**
 * `<DataGrid.Error />` — shown by the high-level entry when the consumer's `errorState`
 * is set. Mirrors the empty-state UX but with `variant="error"` (which becomes
 * `role="alert"` on the underlying `<EmptyState>` so assistive tech gets a live
 * announcement).
 */
export function DataGridError(props: DataGridErrorProps): ReactElement {
  const { title, description, icon, onRetry, className, ...rest } = props;
  const ctx = useDataGridContext();
  const t = ctx.grid.t;

  const resolvedTitle = title ?? t.error;
  const resolvedDescription = description ?? null;
  const resolvedIcon =
    icon === null ? undefined : (icon ?? <AlertTriangle aria-hidden="true" className="size-6" />);

  return (
    <div
      className={className ?? 'flex w-full justify-center py-10'}
      data-datagrid-error=""
      role="alert"
      {...rest}
    >
      <EmptyState variant="error">
        {resolvedIcon !== undefined ? (
          <EmptyState.Icon>{resolvedIcon}</EmptyState.Icon>
        ) : null}
        <EmptyState.Title>{resolvedTitle}</EmptyState.Title>
        {resolvedDescription !== null ? (
          <EmptyState.Description>{resolvedDescription}</EmptyState.Description>
        ) : null}
        {onRetry !== undefined ? (
          <EmptyState.Actions>
            <Button onClick={onRetry} variant="solid" color="danger">
              {t.errorRetry}
            </Button>
          </EmptyState.Actions>
        ) : null}
      </EmptyState>
    </div>
  );
}