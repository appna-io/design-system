'use client';

import { forwardRef, Portal, useControllableState, useEscapeStack } from '@apx-ui/engine';
import { useCallback, useEffect } from 'react';

import { SplashSurface } from './SplashSurface';
import type { SplashScreenProps } from './SplashScreen.types';

/**
 * **Declarative** splash primitive. Render this directly when you need a splash inline (e.g.
 * a documentation embed, a Storybook example, a `placement="inline"` preview tile). For the
 * canonical "show a fullscreen splash from anywhere in your app" use case, reach for the
 * imperative facade instead:
 *
 *     import { splash } from '@apx-ui/ds';
 *     splash.pulse({ logo: <MyLogo />, title: 'Syncing…' });
 *
 * The imperative `splash.show(…)` API is powered by `<SplashProvider>` (mounted once at the
 * app root, next to `<ThemeProvider>`) and the module-level `SplashStore` — see those files
 * for the architecture.
 *
 * @example
 *   // Inline embed (in an MDX example, a tile preview, etc.)
 *   <SplashScreen
 *     placement="inline"
 *     variant="pulse"
 *     logo={<MyLogo />}
 *     title="Syncing"
 *   />
 *
 *   // Controlled fullscreen — rare; prefer `splash.show()` for fullscreen use.
 *   <SplashScreen open={loading} onOpenChange={setLoading} variant="gradient" />
 */
export const SplashScreen = forwardRef<HTMLDivElement, SplashScreenProps>(function SplashScreen(
  props,
  ref,
) {
  const {
    open: openProp,
    defaultOpen = true,
    timeout,
    onTimeout,
    onOpenChange,

    placement = 'fullscreen',
    portal = true,
    portalContainer,

    closeOnEscape = false,

    ...surfaceProps
  } = props;

  const [openRaw, setOpenInternal] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange ?? undefined,
  });
  const open = openRaw ?? false;

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenInternal(next);
    },
    [setOpenInternal],
  );

  // Auto-dismiss timer. Runs only while `open && timeout > 0`. The cleanup unsubscribes when
  // the timeout changes mid-flight or when the splash flips closed by some other path
  // (controlled `open` change, `closeOnClick`, Escape).
  useEffect(() => {
    if (!open) return;
    if (!timeout || timeout <= 0) return;

    const handle = window.setTimeout(() => {
      onTimeout?.();
      setOpen(false);
    }, timeout);

    return () => {
      window.clearTimeout(handle);
    };
  }, [open, timeout, onTimeout, setOpen]);

  // Esc → close. Off by default for the declarative primitive because consumers may want
  // it as a forced first-paint. The imperative facade flips this default to `true`.
  const handleEscape = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  useEscapeStack({ active: open && closeOnEscape, onEscape: handleEscape });

  const handleRequestClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  if (!open) return null;

  const surface = (
    <SplashSurface ref={ref} {...surfaceProps} placement={placement} onRequestClose={handleRequestClose} />
  );

  if (placement === 'fullscreen' && portal) {
    return <Portal container={portalContainer}>{surface}</Portal>;
  }

  return surface;
}, 'SplashScreen');