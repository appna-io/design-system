'use client';

import { useEffect, useRef, useState } from 'react';

import type { ComboboxLoadingState } from '../Combobox.types';

export interface UseDeferredFilterOptions<O> {
  /** The async fetcher. Receives the (debounced) query + an AbortSignal. */
  loadOptions: ((query: string, ctx: { signal: AbortSignal }) => Promise<O[]>) | undefined;
  /** Current query string (changes drive the debounced fetch). */
  query: string;
  /** Debounce window in ms. Default: `300`. */
  debounceMs?: number;
  /** When `false`, the hook is dormant — useful when the listbox is closed. Default: `true`. */
  enabled?: boolean;
}

export interface UseDeferredFilterReturn<O> {
  state: ComboboxLoadingState;
  results: O[];
  error: Error | undefined;
}

/**
 * Debounced + AbortController-aware async filter hook. Drives Combobox's loading/empty/error
 * states; consumers wanting to plug their own async layer can pass `loadingState` directly to
 * Combobox and bypass this entirely.
 *
 * Lifecycle:
 *
 *  1. The `query` changes. We wait `debounceMs` (default 300) before firing.
 *  2. On firing, we abort the previous AbortController (if any) and call `loadOptions(query,
 *     { signal })`. State becomes `'loading'`.
 *  3. On resolve: state becomes `'ready'` (`results.length > 0`) or `'empty'` (otherwise).
 *  4. On reject: if `signal.aborted` we ignore (we cancelled it ourselves). Else state becomes
 *     `'error'` with the rejected reason captured in `error`.
 *  5. On unmount: the in-flight controller is aborted so the promise resolution lands harmlessly.
 *
 * Exported publicly so future async-list components (CommandPalette, search dropdowns) can
 * reuse the exact lifecycle without re-deriving it.
 */
export function useDeferredFilter<O>(opts: UseDeferredFilterOptions<O>): UseDeferredFilterReturn<O> {
  const { loadOptions, query, debounceMs = 300, enabled = true } = opts;

  const [state, setState] = useState<ComboboxLoadingState>('idle');
  const [results, setResults] = useState<O[]>([]);
  const [error, setError] = useState<Error | undefined>(undefined);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      if (debounceTimerRef.current !== null) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // No fetcher provided → hook is a no-op (consumers can still inspect `state` safely).
    if (!loadOptions) {
      setState('idle');
      setResults([]);
      setError(undefined);
      return;
    }
    if (!enabled) return;

    // Cancel any in-flight debounce so the latest keystroke wins.
    if (debounceTimerRef.current !== null) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      // Abort the previous fetch — the user moved on; an in-flight result for a stale query
      // would race with our setState calls.
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setState('loading');
      setError(undefined);

      loadOptions(query, { signal: controller.signal })
        .then((next) => {
          // Guards: hook unmounted, or our controller was superseded by a newer call.
          if (!mountedRef.current) return;
          if (controller.signal.aborted) return;
          setResults(next);
          setState(next.length === 0 ? 'empty' : 'ready');
        })
        .catch((err: unknown) => {
          if (!mountedRef.current) return;
          if (controller.signal.aborted) return;
          const wrapped =
            err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Load failed');
          setError(wrapped);
          setState('error');
        });
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current !== null) clearTimeout(debounceTimerRef.current);
    };
  }, [loadOptions, query, debounceMs, enabled]);

  return { state, results, error };
}