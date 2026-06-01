import { ConfirmStore } from './ConfirmStore';
import type { ConfirmApi, ConfirmDisplayOptions, ConfirmVariant } from './Confirm.types';

/**
 * Public imperative facade. Mirrors `splash(…)` / `toast(…)` from sibling component families,
 * but returns a `Promise<boolean>` that resolves on user action — `true` for confirm, `false`
 * for cancel / Escape / backdrop click. The promise never rejects.
 *
 * The shape is intentionally `Object.assign(facade, { …aliases })` rather than a class so
 * tree-shaking can drop unused aliases (a consumer that only calls `confirm.error` won't pay
 * for `confirm.success`, etc.).
 *
 * @example
 *   // Anywhere in the app — a button handler, an interceptor, a saga.
 *   import { confirm } from '@apx-ui/ds';
 *
 *   async function onDelete() {
 *     const ok = await confirm.display({
 *       variant: 'error',
 *       title: 'Delete project?',
 *       description: 'This action cannot be undone.',
 *       confirmText: 'Yes, delete',
 *     });
 *     if (!ok) return;
 *     await deleteProject();
 *   }
 */
function display(options: ConfirmDisplayOptions = {}): Promise<boolean> {
  return ConfirmStore.open(options).promise;
}

function withVariant(variant: ConfirmVariant) {
  return (options: Omit<ConfirmDisplayOptions, 'variant'> = {}): Promise<boolean> =>
    ConfirmStore.open({ ...options, variant }).promise;
}

export const confirm: ConfirmApi = {
  display,
  info: withVariant('info'),
  success: withVariant('success'),
  warning: withVariant('warning'),
  error: withVariant('error'),
  cancel: (): void => ConfirmStore.close(false),
  isOpen: (): boolean => ConfirmStore.isOpen(),
};