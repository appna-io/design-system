'use client';

import { useEscapeStack } from '@apx-ui/engine';
import { useCallback, useMemo, type ReactElement } from 'react';

import { ConfirmStore } from './ConfirmStore';
import { ConfirmSurface } from './ConfirmSurface';
import { useConfirmState } from './useConfirmState';
import type { ConfirmDisplayOptions, ConfirmProviderProps } from './Confirm.types';

/**
 * **Singleton root** for the imperative `confirm.display(...)` API. Mount **once** at the app
 * root next to `<ThemeProvider>` — every `confirm.display(...)` call across the app feeds
 * into this instance via the module-level `ConfirmStore`.
 *
 * The provider owns the lifecycle concerns that don't make sense at call-site level:
 *
 *  - **Surface mount** — renders `<ConfirmSurface>` only while a dialog is active; the surface
 *    itself owns the Portal + focus trap + scroll lock so this host stays purely a "router"
 *    between the store and the visual primitive.
 *  - **Escape stack** — registered when the active record has `closeOnEscape !== false`. The
 *    engine's escape stack ensures only the topmost overlay closes per press, so a Confirm
 *    nested above a Modal unwinds one layer at a time.
 *  - **Default options** — `defaultOptions` is shallow-merged into every active record so
 *    consumers can pin a `confirmText: 'OK'` / `closeOnBackdropClick: false` policy once per
 *    app instead of repeating it on every call site.
 *
 * @example
 *   // app/layout.tsx (Next.js) — mount once next to ThemeProvider
 *   import { ThemeProvider, ConfirmProvider } from '@apx-ui/ds';
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html lang="en">
 *         <body>
 *           <ThemeProvider>
 *             <ConfirmProvider defaultOptions={{ confirmText: 'OK' }} />
 *             {children}
 *           </ThemeProvider>
 *         </body>
 *       </html>
 *     );
 *   }
 *
 *   // anywhere else — call the imperative API
 *   import { confirm } from '@apx-ui/ds';
 *
 *   const ok = await confirm.display({
 *     variant: 'error',
 *     title: 'Delete account?',
 *     description: 'This is permanent.',
 *   });
 *   if (ok) deleteAccount();
 */
export function ConfirmProvider(props: ConfirmProviderProps = {}): ReactElement | null {
  const { defaultOptions, portalContainer } = props;
  const { current } = useConfirmState();

  // Shallow-merge `defaultOptions` onto the active record. The active record's own values win
  // over defaults so call-site overrides always take precedence; we strip `undefined` from the
  // active record first so a missing field doesn't accidentally clobber a default.
  const merged: ConfirmDisplayOptions | null = useMemo(() => {
    if (!current) return null;
    if (!defaultOptions) return current;
    return { ...defaultOptions, ...stripUndefined(current) };
  }, [current, defaultOptions]);

  const handleConfirm = useCallback(() => {
    if (current) ConfirmStore.close(true, current.id);
  }, [current]);

  const handleCancel = useCallback(() => {
    if (current) ConfirmStore.close(false, current.id);
  }, [current]);

  // Esc → cancel. Defaults to enabled — confirm dialogs are dismissible unless the caller
  // explicitly opts out. The engine's escape stack handles ordering between nested overlays.
  const closeOnEscape = current?.closeOnEscape !== false;
  useEscapeStack({
    active: current != null && closeOnEscape,
    onEscape: handleCancel,
  });

  if (!merged || !current) return null;

  return (
    <ConfirmSurface
      open
      variant={merged.variant}
      showIcon={merged.showIcon}
      icon={merged.icon}
      title={merged.title}
      description={merged.description}
      confirmText={merged.confirmText}
      cancelText={merged.cancelText}
      closeOnBackdropClick={merged.closeOnBackdropClick}
      className={merged.className}
      style={merged.style}
      sx={merged.sx}
      portalContainer={portalContainer}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}

ConfirmProvider.displayName = 'ConfirmProvider';

/**
 * Drop entries whose value is `undefined` so they don't clobber `defaultOptions` during the
 * shallow merge. (Active-record fields are `T | undefined`; we want "undefined means missing"
 * semantics in the merge step.)
 */
function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) (out as Record<string, unknown>)[key] = value;
  }
  return out;
}