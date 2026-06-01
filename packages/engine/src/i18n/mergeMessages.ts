import type { I18nMessages } from './types';

/**
 * Shallow-merge two message bags by top-level namespace key.
 *
 * Inner namespaces *replace* outer ones wholesale (we deliberately do **not** deep-merge
 * inside a namespace — each component owns its own translations shape and partial merges
 * are the consuming hook's responsibility, e.g. `useDataGridTranslations`).
 *
 * Always returns a fresh object so memoization stays correct.
 */
export function mergeMessages(
  outer: I18nMessages | undefined,
  inner: I18nMessages | undefined,
): I18nMessages {
  if (!outer && !inner) return {};
  if (!outer) return { ...inner };
  if (!inner) return { ...outer };
  return { ...outer, ...inner };
}