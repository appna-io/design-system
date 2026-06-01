/**
 * Public surface for `<ConfirmProvider>` + `confirm.display(...)`.
 *
 * The trio splits responsibilities cleanly (mirrors `SplashProvider` + `splash(...)` and the
 * Toast family):
 *
 *   `ConfirmProvider` — singleton root mounted once at the app shell.
 *   `confirm`         — imperative facade callable from anywhere. Returns `Promise<boolean>`.
 *   `ConfirmSurface`  — low-level visual primitive. Power users only — most consumers should
 *                       reach for `confirm.display(...)`.
 */
export { ConfirmProvider } from './ConfirmProvider';
export { confirm } from './confirmApi';

// Lower-level building blocks. Power users may reach for these to compose custom hosts /
// tests / SSR snapshots.
export { ConfirmStore } from './ConfirmStore';
export { ConfirmSurface } from './ConfirmSurface';
export { useConfirmState } from './useConfirmState';
export {
  confirmBackdropRecipe,
  confirmContentRecipe,
  confirmDescriptionRecipe,
  confirmFooterRecipe,
  confirmIconWrapRecipe,
  confirmTitleRecipe,
} from './Confirm.recipe';

export type {
  ConfirmApi,
  ConfirmDisplayOptions,
  ConfirmItem,
  ConfirmProviderProps,
  ConfirmVariant,
} from './Confirm.types';

export type { ConfirmState } from './ConfirmStore';
export type { ConfirmSurfaceProps } from './ConfirmSurface';