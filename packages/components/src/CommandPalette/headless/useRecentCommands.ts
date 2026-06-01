'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * In-memory recently-used command tracker. Returns the current list (most-recent first) and a
 * `push(id)` to record a selection. When `controlled` is supplied (a non-undefined array),
 * the hook returns it verbatim and `push` becomes a no-op — consumers can persist recents in
 * whatever store they prefer and feed the prop in.
 *
 * Storage-backed persistence (localStorage / IndexedDB) is intentionally deferred — most apps
 * already have a state store and would rather plug it in via the `recentCommandIds` prop than
 * carry a DS opinion about persistence backends.
 */
export function useRecentCommands(opts: {
  max: number;
  controlled?: string[];
  enabled?: boolean;
}): { recents: string[]; push: (id: string) => void } {
  const { max, controlled, enabled = true } = opts;
  const [internal, setInternal] = useState<string[]>([]);

  const controlledRef = useRef(controlled);
  useEffect(() => {
    controlledRef.current = controlled;
  }, [controlled]);

  const push = useCallback(
    (id: string) => {
      if (!enabled) return;
      if (controlledRef.current !== undefined) return;
      setInternal((prev) => {
        const without = prev.filter((x) => x !== id);
        const next = [id, ...without];
        return next.length > max ? next.slice(0, max) : next;
      });
    },
    [enabled, max],
  );

  const recents = controlled !== undefined ? controlled.slice(0, max) : internal;
  return { recents, push };
}