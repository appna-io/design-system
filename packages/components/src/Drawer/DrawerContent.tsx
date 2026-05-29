'use client';

import { mergeRefs, Portal, useFocusTrap } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { AnimatePresence, motion } from 'motion/react';
import {
  forwardRef,
  useEffect,
  useRef,
  type ForwardedRef,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type Ref,
} from 'react';

import {
  drawerBackdropMotion,
  drawerContentMotion,
} from './Drawer.motion';
import {
  drawerBackdropRecipe,
  drawerContentRecipe,
} from './Drawer.recipe';
import { useDrawerContext } from './DrawerContext';
import type {
  DrawerContentProps,
  DrawerSide,
} from './Drawer.types';

/**
 * Drawer's portal-rendered, focus-trapped, animated dialog surface. Same engine-primitive surface
 * as Modal, with two structural differences:
 *
 *  - **Backdrop alignment** — `side` drives the backdrop's flex axis + justify direction so
 *    Content anchors at the requested edge (left → flush left; right → flush right; etc.).
 *  - **Slide motion** — `drawerContentMotion(side)` translates Content fully off the anchored
 *    edge in the hidden state (`xPercent: -100` for left, `+100` for right, etc.).
 *
 * Other engine wiring (Portal, AnimatePresence, FocusTrap, scroll-lock via root, escape-stack via
 * root, backdrop sentinel) is identical to Modal.
 */
function DrawerContentImpl(
  props: DrawerContentProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    side: sideProp,
    size,
    overlay,
    portalContainer,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  const ctx = useDrawerContext('Drawer.Content');

  // Resolve `side` to a primitive — `useThemedClasses` still resolves the responsive value for
  // the recipe, but motion + the backdrop click sentinel both need a single primitive value.
  // jsdom + responsive value composition gives us a string at this point in 99% of cases; the
  // fallback is `'left'` (the recipe's default).
  const side: DrawerSide =
    typeof sideProp === 'string' ? (sideProp as DrawerSide) : 'left';

  const localContentRef = useRef<HTMLDivElement | null>(null);

  // Focus trap. `active: ctx.open && ctx.trapFocus` is the declarative gate. `finalFocus`
  // defaults to whatever the consumer passed; if nothing was passed, the engine's default
  // (return-to-previously-focused) covers the trigger automatically.
  useFocusTrap(localContentRef, {
    active: ctx.open && ctx.trapFocus,
    initialFocus: ctx.initialFocus,
    finalFocus: ctx.finalFocus ?? (() => ctx.triggerNodeRef.current),
    returnFocusOnDeactivate: true,
  });

  // Re-publish the content node into the root context so other subparts (none today) can
  // `contains()` against it.
  useEffect(() => {
    ctx.registerContent(localContentRef.current);
    return () => ctx.registerContent(null);
  }, [ctx]);

  const { className: backdropClass, style: backdropStyle } = useThemedClasses({
    recipe: drawerBackdropRecipe,
    componentName: 'Drawer',
    slot: 'backdrop',
    props: {
      overlay,
      side: sideProp,
    },
  });

  const { className: contentClass, style: contentStyle } = useThemedClasses({
    recipe: drawerContentRecipe,
    componentName: 'Drawer',
    slot: 'content',
    props: {
      side: sideProp,
      size,
      className,
      sx,
      style,
    },
  });

  const handleBackdropPointerDown = (event: ReactMouseEvent<HTMLDivElement>): void => {
    if (!ctx.closeOnBackdropClick) return;
    // Sentinel: only react when the click landed on the backdrop itself, not when it bubbled
    // up from inside Content.
    if (event.target === event.currentTarget) {
      ctx.setOpen(false);
    }
  };

  const composedContentRef = mergeRefs<HTMLDivElement>(
    localContentRef as Ref<HTMLDivElement>,
    forwardedRef as Ref<HTMLDivElement>,
  );

  const motionExtraProps: Record<string, unknown> = { ...rest };

  return (
    <Portal container={portalContainer}>
      <AnimatePresence>
        {ctx.open ? (
          <motion.div
            key="drawer-backdrop"
            className={backdropClass}
            style={(backdropStyle as never) ?? undefined}
            onPointerDown={handleBackdropPointerDown}
            {...drawerBackdropMotion}
          >
            <motion.div
              ref={composedContentRef}
              role="dialog"
              tabIndex={-1}
              aria-modal="true"
              aria-labelledby={ctx.titleId}
              aria-describedby={ctx.descId}
              data-state="open"
              data-side={side}
              data-size={typeof size === 'string' ? size : 'md'}
              className={contentClass}
              style={(contentStyle as never) ?? undefined}
              {...drawerContentMotion(side)}
              {...motionExtraProps}
            >
              {children}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(DrawerContentImpl);
DrawerContent.displayName = 'Drawer.Content';
