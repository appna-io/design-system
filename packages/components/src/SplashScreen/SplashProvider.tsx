'use client';

import { Portal, useEscapeStack } from '@apx-ui/engine';
import { useCallback, useEffect, useMemo, type ReactElement } from 'react';

import { SplashStore } from './SplashStore';
import { SplashSurface } from './SplashSurface';
import { useSplashState } from './useSplashState';
import type {
  SplashProviderProps,
  SplashScreenItem,
  SplashScreenVisualProps,
} from './SplashScreen.types';

/**
 * **Singleton root** for the imperative `splash(…)` API. Mount **once** at the app root next
 * to `<ThemeProvider>` — every `splash.show(…)` call across the app feeds into this instance
 * via the module-level `SplashStore`.
 *
 * The provider owns the lifecycle concerns that don't make sense at call-site level:
 *
 *  - **Portal** — defaults to `document.body`; consumer can override via `portalContainer`.
 *  - **Auto-dismiss timer** — driven by the active record's `timeout` field. The timer
 *    re-arms whenever the active record changes (different id, or same id with a different
 *    `createdAt` after a `splash.show({ id })` update).
 *  - **Escape stack** — registered when the active record has `closeOnEscape !== false`
 *    (imperative splashes default to dismissible). Nested overlays unwind in the right order.
 *  - **Default options** — `defaultOptions` is shallow-merged into every active record so
 *    consumers can pin a brand `color` / `variant` once per app instead of repeating it on
 *    every call site.
 *
 * @example
 *   // app/layout.tsx (Next.js) — mount once
 *   import { ThemeProvider, SplashProvider } from '@apx-ui/ds';
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html lang="en">
 *         <body>
 *           <ThemeProvider>
 *             <SplashProvider defaultOptions={{ color: 'primary' }} />
 *             {children}
 *           </ThemeProvider>
 *         </body>
 *       </html>
 *     );
 *   }
 *
 *   // anywhere else — call the imperative API
 *   import { splash } from '@apx-ui/ds';
 *   splash.gradient({ logo: <MyLogo />, title: 'Welcome' });
 */
export function SplashProvider(props: SplashProviderProps = {}): ReactElement | null {
  const { defaultOptions, portalContainer } = props;
  const { current } = useSplashState();

  // Merge `defaultOptions` (shallow) onto the active record. The active record's own values
  // win over defaults so call-site overrides always take precedence.
  const merged: (SplashScreenItem & SplashScreenVisualProps) | null = useMemo(() => {
    if (!current) return null;
    if (!defaultOptions) return current;
    return { ...defaultOptions, ...stripUndefined(current) } as SplashScreenItem & SplashScreenVisualProps;
  }, [current, defaultOptions]);

  // Auto-dismiss timer. Re-armed whenever the active record's id or createdAt changes (which
  // covers both "new splash" and "same splash, updated by .show({ id })" cases — the latter
  // resets createdAt). Setting `timeout: 0` (or omitting it) disables the timer entirely so
  // splashes can stay visible until the caller explicitly hides them.
  useEffect(() => {
    if (!current) return undefined;
    if (!current.timeout || current.timeout <= 0) return undefined;

    const id = current.id;
    const handle = window.setTimeout(() => {
      // Fire the timeout callback first, then dismiss. The store also invokes `onHide` on
      // dismiss so callers don't need to wire both.
      try {
        current.onTimeout?.(id);
      } catch {
        /* swallow — host shouldn't crash because a callback threw */
      }
      SplashStore.hide(id);
    }, current.timeout);

    return () => {
      window.clearTimeout(handle);
    };
    // We intentionally re-arm on createdAt — a `splash.show({ id })` update with the same id
    // refreshes createdAt, which restarts the timer. That's the canonical "extend the
    // splash" pattern.
  }, [current?.id, current?.createdAt, current?.timeout, current?.onTimeout, current]);

  // Esc → hide. Defaults to enabled — the imperative API is for dismissible splashes; the
  // declarative `<SplashScreen>` keeps the forced-first-paint default.
  const closeOnEscape = current?.closeOnEscape !== false;
  const handleEscape = useCallback(() => {
    if (current) SplashStore.hide(current.id);
  }, [current]);
  useEscapeStack({ active: current != null && closeOnEscape, onEscape: handleEscape });

  const handleRequestClose = useCallback(() => {
    if (current) SplashStore.hide(current.id);
  }, [current]);

  if (!merged) return null;

  return (
    <Portal container={portalContainer}>
      <SplashSurface
        variant={merged.variant}
        color={merged.color}
        backdrop={merged.backdrop}
        gradient={merged.gradient}
        logo={merged.logo}
        showLogo={merged.showLogo}
        title={merged.title}
        subtitle={merged.subtitle}
        footer={merged.footer}
        indicator={merged.indicator}
        showSpinner={merged.showSpinner}
        showProgress={merged.showProgress}
        progress={merged.progress}
        loadingLabel={merged.loadingLabel}
        closeOnClick={merged.closeOnClick}
        sx={merged.sx}
        style={merged.style}
        className={merged.className}
        placement="fullscreen"
        onRequestClose={handleRequestClose}
      />
    </Portal>
  );
}

SplashProvider.displayName = 'SplashProvider';

/**
 * Drop entries whose value is `undefined` so they don't clobber `defaultOptions` during the
 * shallow merge. (Active record fields are `T | undefined`; we want "undefined means missing"
 * semantics in the merge step.)
 */
function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) (out as Record<string, unknown>)[key] = value;
  }
  return out;
}