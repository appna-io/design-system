import type { StorageAdapter, StorageKind } from '../DataGrid.types';

/**
 * Resolve a `storage` prop into a concrete adapter.
 *
 * - `'local'`  → `window.localStorage` if available (no-op on the server).
 * - `'session'`→ `window.sessionStorage` if available.
 * - object     → the consumer-supplied adapter, returned as-is.
 *
 * The "no-op on server" path keeps the hook SSR-safe; persistence kicks in once the
 * component hydrates and a subsequent state mutation triggers a write.
 */
export function resolveStorageAdapter(kind: StorageKind | undefined): StorageAdapter | null {
  if (!kind) return null;
  if (kind === 'local') return webStorageAdapter('localStorage');
  if (kind === 'session') return webStorageAdapter('sessionStorage');
  return kind;
}

function webStorageAdapter(key: 'localStorage' | 'sessionStorage'): StorageAdapter | null {
  if (typeof window === 'undefined') return null;
  let storage: Storage | null = null;
  try {
    storage = window[key];
  } catch {
    return null;
  }
  if (!storage) return null;
  return {
    read(storageKey) {
      try {
        return storage!.getItem(storageKey);
      } catch {
        return null;
      }
    },
    write(storageKey, value) {
      try {
        storage!.setItem(storageKey, value);
      } catch {
        // Quota exceeded / disabled storage — swallow; persistence is best-effort.
      }
    },
    remove(storageKey) {
      try {
        storage!.removeItem(storageKey);
      } catch {
        // Same rationale as `write`.
      }
    },
  };
}

/**
 * Safely parse a stored value. Returns `null` on any malformed payload so a stale schema
 * never crashes the grid — consumers should bump `storageKey` when the persisted shape
 * changes.
 */
export function safeParse<T>(raw: string | null): T | null {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
