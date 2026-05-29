import type { StorageAdapter, StorageKind } from '../Scheduler.types';

/**
 * Resolve a `storage` prop into a concrete adapter. Mirrors `DataGrid`'s shape so a
 * consumer who already passes `localStorage` to one component can pass the same adapter
 * here. SSR-safe — server passes return `null` and persistence becomes a no-op.
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
    get(storageKey) {
      try {
        return storage!.getItem(storageKey);
      } catch {
        return null;
      }
    },
    set(storageKey, value) {
      try {
        storage!.setItem(storageKey, value);
      } catch {
        // Quota / disabled — persistence is best-effort.
      }
    },
    remove(storageKey) {
      try {
        storage!.removeItem(storageKey);
      } catch {
        // Same rationale as `set`.
      }
    },
  };
}

export function safeParse<T>(raw: string | null): T | null {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
