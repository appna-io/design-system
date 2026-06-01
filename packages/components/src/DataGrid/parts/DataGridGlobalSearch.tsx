'use client';

import { forwardRef, type Sx } from '@apx-ui/engine';
import { Search } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ForwardedRef,
  type ReactElement,
  type Ref,
} from 'react';

import { Input } from '../../Input/Input';
import type { InputProps } from '../../Input/Input.types';
import { useDataGridContext } from '../DataGridContext';

export interface DataGridGlobalSearchProps
  extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> {
  /**
   * Debounce window in ms — the consumer's keystrokes pile up locally and only commit
   * to `grid.setGlobalSearch` after this many ms of quiet. @default 200
   */
  debounceMs?: number;
  sx?: Sx;
}

/**
 * `<DataGrid.GlobalSearch>` — top-of-toolbar `<Input>` wired to `grid.setGlobalSearch`.
 *
 * Maintains an internal value mirror so the input feels responsive while the actual
 * filter only commits on the debounce edge (`200ms` by default). On unmount the
 * pending timer is cleared. Consumers who want zero debounce pass `debounceMs={0}`;
 * consumers building bespoke search UIs can ignore this part entirely and call
 * `grid.setGlobalSearch` directly.
 */
function DataGridGlobalSearchImpl(
  props: DataGridGlobalSearchProps,
  ref: ForwardedRef<HTMLInputElement>,
): ReactElement {
  const {
    debounceMs = 200,
    placeholder,
    'aria-label': ariaLabel,
    leftIcon,
    size = 'sm',
    ...rest
  } = props;
  const ctx = useDataGridContext();
  const { grid } = ctx;
  const t = grid.t;

  const [local, setLocal] = useState<string>(grid.state.globalSearch);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync when the consumer mutates `globalSearch` from outside
  // (e.g. a "Clear all filters" button calling `grid.setGlobalSearch('')`).
  useEffect(() => {
    setLocal(grid.state.globalSearch);
  }, [grid.state.globalSearch]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setLocal(next);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (debounceMs <= 0) {
        grid.setGlobalSearch(next);
        return;
      }
      timerRef.current = setTimeout(() => {
        grid.setGlobalSearch(next);
      }, debounceMs);
    },
    [grid, debounceMs],
  );

  return (
    <Input
      ref={ref}
      type="search"
      size={size}
      placeholder={placeholder ?? t.globalSearchPlaceholder}
      aria-label={ariaLabel ?? t.globalSearchAriaLabel}
      value={local}
      onChange={handleChange}
      leftIcon={leftIcon ?? <Search aria-hidden className="size-4" />}
      data-datagrid-global-search=""
      {...rest}
    />
  );
}

export const DataGridGlobalSearch = forwardRef(
  DataGridGlobalSearchImpl,
  'DataGrid.GlobalSearch',
) as (
  props: DataGridGlobalSearchProps & { ref?: Ref<HTMLInputElement> },
) => ReactElement;