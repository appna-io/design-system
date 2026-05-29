'use client';

import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '../../Button/Button';
import { Input } from '../../Input/Input';
import { useSchedulerContext } from '../SchedulerContext';

export interface SchedulerSearchInputProps {
  /** Override the debounce window before pushing into `state.filters.search`. */
  debounceMs?: number;
  /** Placeholder override; defaults to `t.searchPlaceholder`. */
  placeholder?: string;
  /** Width override — pass any CSS length. @default `'14rem'` */
  width?: string | number;
}

/**
 * Debounced search field that writes into `state.filters.search`. Reads from the same key so
 * it stays in sync when filters are mutated elsewhere (e.g., `clearFilters()`).
 *
 * Composes the existing `<Input>` primitive — no custom field styling. The clear button
 * appears when the input is non-empty and immediately resets both the local + filter value.
 */
export function SchedulerSearchInput(props: SchedulerSearchInputProps) {
  const { debounceMs = 200, placeholder, width = '14rem' } = props;
  const ctx = useSchedulerContext();
  const { t, state, setFilters } = ctx;

  const filterValue = state.filters.search ?? '';
  const [local, setLocal] = useState(filterValue);

  /* Stay in sync when filters are cleared externally. */
  const lastFilterRef = useRef(filterValue);
  useEffect(() => {
    if (filterValue !== lastFilterRef.current && filterValue !== local) {
      setLocal(filterValue);
    }
    lastFilterRef.current = filterValue;
  }, [filterValue, local]);

  /* Debounced push back into filter state. */
  useEffect(() => {
    if (local === filterValue) return;
    const id = window.setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: local || undefined }));
    }, debounceMs);
    return () => window.clearTimeout(id);
  }, [local, filterValue, debounceMs, setFilters]);

  const handleClear = useCallback(() => {
    setLocal('');
    setFilters((prev) => ({ ...prev, search: undefined }));
  }, [setFilters]);

  return (
    <div style={{ width }}>
      <Input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder ?? t.searchPlaceholder}
        aria-label={t.search}
        size="sm"
        leftIcon={<Search aria-hidden size={14} />}
        rightIcon={
          local ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              aria-label="Clear search"
              style={{ height: 18, width: 18, padding: 0, minWidth: 0 }}
            >
              <X aria-hidden size={12} />
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}

SchedulerSearchInput.displayName = 'Scheduler.SearchInput';
