'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { Button } from '../../Button/Button';
import { Input } from '../../Input/Input';
import { Select } from '../../Select';
import { dataGridFilterPanelRecipe } from '../DataGrid.recipe';
import { useDataGridContext } from '../DataGridContext';
import {
  FILTER_OPERATORS,
  VALUELESS_OPERATORS,
  type ColumnDef,
  type ColumnType,
  type FilterContext,
  type FilterOperator,
  type FilterValue,
} from '../DataGrid.types';

export interface DataGridFilterPanelProps<T = unknown>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  /** Column being filtered. Must be a non-structural column with `filterable: true`. */
  column: ColumnDef<T>;
  /** Called when the user applies or clears the filter — used by the parent Popover to close. */
  onClose: () => void;
  sx?: Sx;
}

function operatorsFor(column: ColumnDef<unknown>): FilterOperator[] {
  const type = column.type as ColumnType | undefined;
  if (type === 'text' || type === 'number' || type === 'date' || type === 'select' || type === 'boolean') {
    return FILTER_OPERATORS[type] ?? [];
  }
  // `custom` columns supply their own renderer; we still expose an empty list so the
  // panel can fall back to the renderer without crashing.
  return [];
}

/**
 * Renders the value control for a given operator + column type. Returns `null` for
 * valueless operators (`isEmpty`, `isTrue`, …) — the operator alone is the predicate.
 */
function ValueControl<T>(props: {
  column: ColumnDef<T>;
  operator: FilterOperator;
  value: FilterValue | undefined;
  onChange: (next: FilterValue | undefined) => void;
}): ReactElement | null {
  const { column, operator, value, onChange } = props;
  const ctx = useDataGridContext();
  const t = ctx.grid.t;

  if (VALUELESS_OPERATORS.has(operator)) return null;

  const type = (column.type as ColumnType | undefined) ?? 'text';

  if (type === 'number') {
    if (operator === 'between') {
      const tuple = Array.isArray(value) ? (value as [unknown, unknown]) : [undefined, undefined];
      const [a, b] = tuple as [number | string | undefined, number | string | undefined];
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            size="sm"
            placeholder="From"
            value={a === undefined || a === null ? '' : String(a)}
            onChange={(e) =>
              onChange([
                e.target.value === '' ? undefined : Number(e.target.value),
                b,
              ])
            }
          />
          <Input
            type="number"
            size="sm"
            placeholder="To"
            value={b === undefined || b === null ? '' : String(b)}
            onChange={(e) =>
              onChange([
                a,
                e.target.value === '' ? undefined : Number(e.target.value),
              ])
            }
          />
        </div>
      );
    }
    return (
      <Input
        type="number"
        size="sm"
        placeholder={t.filterPlaceholder}
        value={value === undefined || value === null ? '' : String(value)}
        onChange={(e) =>
          onChange(e.target.value === '' ? undefined : Number(e.target.value))
        }
      />
    );
  }

  if (type === 'date') {
    if (operator === 'between') {
      const tuple = Array.isArray(value) ? (value as [unknown, unknown]) : [undefined, undefined];
      const [a, b] = tuple as [string | undefined, string | undefined];
      return (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            size="sm"
            value={a ?? ''}
            onChange={(e) => onChange([e.target.value || undefined, b])}
          />
          <Input
            type="date"
            size="sm"
            value={b ?? ''}
            onChange={(e) => onChange([a, e.target.value || undefined])}
          />
        </div>
      );
    }
    return (
      <Input
        type="date"
        size="sm"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value || undefined)}
      />
    );
  }

  if (type === 'select') {
    const options =
      (column as { options?: { value: string; label: ReactNode }[] }).options ?? [];
    if (operator === 'in' || operator === 'notIn') {
      const current = Array.isArray(value) ? (value as unknown[]) : [];
      return (
        <div className="flex flex-col gap-1">
          {options.map((opt) => {
            const checked = current.some((v) => v === opt.value);
            return (
              <label key={String(opt.value)} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...current, opt.value]
                      : current.filter((v) => v !== opt.value);
                    onChange(next.length > 0 ? next : undefined);
                  }}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      );
    }
    return (
      <Select
        value={value === undefined ? '' : String(value)}
        onValueChange={(next) => onChange(next === '' ? undefined : next)}
        size="sm"
        placeholder={t.filterPlaceholder}
      >
        <Select.Trigger />
        <Select.Content>
          {options.map((opt) => (
            <Select.Item key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  if (type === 'boolean') {
    // Boolean is fully covered by valueless operators (`isTrue`, `isFalse`); guard here.
    return null;
  }

  // text / fallback
  return (
    <Input
      type="text"
      size="sm"
      placeholder={t.filterPlaceholder}
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      // eslint-disable-next-line jsx-a11y/no-autofocus -- the filter input is only mounted while the popover is open, in response to an explicit user click on the filter button; focusing it on mount is the expected popover-form UX
      autoFocus
    />
  );
}

/**
 * `<DataGrid.FilterPanel>` — the form inside a header-cell `<Popover>`.
 *
 * - Operator `<Select>` listing the operators valid for the column's `type`.
 * - Value control matching `(type × operator)` — handled by `<ValueControl>`.
 * - Apply / Clear footer; Enter submits.
 *
 * Operates on local state and only commits on **Apply** so the user can experiment
 * without filtering the grid on every keystroke. The current filter is hydrated from
 * `state.columnFilters[column.id]` on mount.
 */
function DataGridFilterPanelImpl<T>(
  props: DataGridFilterPanelProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { column, onClose, className, sx, style, ...rest } = props;
  const ctx = useDataGridContext<T>();
  const { grid } = ctx;
  const t = grid.t;

  const operators = useMemo(() => operatorsFor(column as unknown as ColumnDef<unknown>), [column]);
  const current = grid.state.filters[column.id];
  const defaultOperator = operators[0] ?? ('contains' as FilterOperator);

  const [operator, setOperator] = useState<FilterOperator>(current?.operator ?? defaultOperator);
  const [value, setValue] = useState<FilterValue | undefined>(current?.value);

  // If the underlying filter mutates externally (e.g. "Clear all filters"), refresh.
  useEffect(() => {
    if (current === undefined) {
      setOperator(defaultOperator);
      setValue(undefined);
    } else {
      setOperator(current.operator);
      setValue(current.value);
    }
  }, [current, defaultOperator]);

  const { className: panelClass, style: panelStyle } = useThemedClasses({
    recipe: dataGridFilterPanelRecipe,
    componentName: 'DataGrid',
    slot: 'filterPanel',
    props: { className, sx, style },
  });

  const apply = useCallback(() => {
    const valueless = VALUELESS_OPERATORS.has(operator);
    if (valueless) {
      grid.setFilter(column.id, { operator, value: null });
    } else if (value === undefined || value === '' || value === null) {
      grid.setFilter(column.id, undefined);
    } else {
      grid.setFilter(column.id, { operator, value });
    }
    onClose();
  }, [grid, column.id, operator, value, onClose]);

  const clear = useCallback(() => {
    grid.setFilter(column.id, undefined);
    setValue(undefined);
    setOperator(defaultOperator);
    onClose();
  }, [grid, column.id, defaultOperator, onClose]);

  // Custom-render escape hatch — `type: 'custom'` columns supply their own renderer.
  const renderFilter = (column as { renderFilter?: (ctx: FilterContext<T>) => ReactNode }).renderFilter;
  if (renderFilter) {
    return (
      <div
        ref={ref}
        className={panelClass}
        style={panelStyle ?? undefined}
        data-datagrid-filter-panel=""
        {...rest}
      >
        {renderFilter({
          value,
          operator,
          onChange: (next) => setValue(next),
          onOperatorChange: (next) => setOperator(next),
          column,
          close: onClose,
        })}
        <div className="flex justify-end gap-2 border-t border-border pt-2">
          <Button variant="ghost" size="sm" color="neutral" onClick={clear}>
            {t.filterClear}
          </Button>
          <Button variant="solid" size="sm" color="primary" onClick={apply}>
            {t.filterApply}
          </Button>
        </div>
      </div>
    );
  }

  return (
    // The panel is a form-like wrapper; all real input lives in the nested Select /
    // Input controls. We only listen for Enter to submit. Marking the wrapper itself
    // as interactive would over-promise the contract.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={ref}
      className={panelClass}
      style={panelStyle ?? undefined}
      data-datagrid-filter-panel=""
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          apply();
        }
      }}
      {...rest}
    >
      {operators.length > 1 ? (
        <Select
          value={operator}
          onValueChange={(next) => setOperator(next as FilterOperator)}
          size="sm"
        >
          <Select.Trigger aria-label="Filter operator" />
          <Select.Content>
            {operators.map((op) => (
              <Select.Item key={op} value={op}>
                {t.operators[op] ?? op}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      ) : null}
      <ValueControl column={column} operator={operator} value={value} onChange={setValue} />
      <div className="flex justify-end gap-2 border-t border-border pt-2">
        <Button variant="ghost" size="sm" color="neutral" onClick={clear}>
          {t.filterClear}
        </Button>
        <Button variant="solid" size="sm" color="primary" onClick={apply}>
          {t.filterApply}
        </Button>
      </div>
    </div>
  );
}

export const DataGridFilterPanel = forwardRef(
  DataGridFilterPanelImpl as (
    props: DataGridFilterPanelProps<unknown>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => ReactElement,
  'DataGrid.FilterPanel',
) as <T = unknown>(
  props: DataGridFilterPanelProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;
