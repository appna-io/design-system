'use client';

import { Inbox } from 'lucide-react';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

import { EmptyState } from '../../EmptyState';
import { useDataGridContext } from '../DataGridContext';

export interface DataGridEmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  /** Override the default `<Inbox>` lucide icon. Set `null` to render no icon. */
  icon?: ReactNode | null;
  /** Optional CTA — rendered after the description (e.g. "Add your first row"). */
  action?: ReactNode;
}

/**
 * `<DataGrid.Empty />` — shown by the high-level entry when there are zero filtered
 * rows. Composed over the shared `<EmptyState>` primitive so the visual stays
 * consistent with empty list / empty drawer / etc. surfaces across the DS.
 *
 * Headless consumers can render it themselves wherever they want — typically as a
 * full-width `<tr><td colSpan={n}>` inside a custom body. The component itself is
 * structurally a `<div>` (not a `<tr>`), so the consumer owns the row scaffold.
 */
export function DataGridEmpty(props: DataGridEmptyProps): ReactElement {
  const { title, description, icon, action, className, ...rest } = props;
  const ctx = useDataGridContext();
  const t = ctx.grid.t;

  const resolvedTitle = title ?? t.empty;
  const resolvedDescription = description ?? t.emptyDescription;
  const resolvedIcon =
    icon === null ? undefined : (icon ?? <Inbox aria-hidden="true" className="size-6" />);

  return (
    <div
      className={className ?? 'flex w-full justify-center py-10'}
      data-datagrid-empty=""
      {...rest}
    >
      {action !== undefined ? (
        <EmptyState>
          {resolvedIcon !== undefined ? (
            <EmptyState.Icon>{resolvedIcon}</EmptyState.Icon>
          ) : null}
          <EmptyState.Title>{resolvedTitle}</EmptyState.Title>
          <EmptyState.Description>{resolvedDescription}</EmptyState.Description>
          <EmptyState.Actions>{action}</EmptyState.Actions>
        </EmptyState>
      ) : (
        <EmptyState
          icon={resolvedIcon}
          title={resolvedTitle}
          description={resolvedDescription}
        />
      )}
    </div>
  );
}
