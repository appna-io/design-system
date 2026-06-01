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
  modalBackdropMotion,
  modalContentMotion,
} from './Modal.motion';
import {
  modalBackdropRecipe,
  modalContentRecipe,
} from './Modal.recipe';
import { useModalContext } from './ModalContext';
import type {
  ModalContentProps,
  ModalPlacement,
} from './Modal.types';

/**
 * The Modal's portal-rendered, focus-trapped, animated dialog surface. This is where the engine's
 * full overlay surface (minus `usePosition` — Modal is centered, not anchored) comes together:
 *
 *  - `<Portal>` — SSR-safe; defaults to `document.body`. Override with `portalContainer` when
 *    nesting inside an in-page region (rare for Modal — usually you want body-level portaling).
 *  - **Backdrop** — fixed-position flex container. The `placement` axis (`center` / `top`)
 *    aligns Content vertically; the `overlay` axis (`dimmed` / `blur` / `transparent`) sets the
 *    backdrop's background.
 *  - **Backdrop click sentinel** — `onPointerDown` checks `target === currentTarget`. Clicks
 *    inside Content land on Content's tree, not on the backdrop, so the sentinel only fires for
 *    clicks on the backdrop itself.
 *  - `useFocusTrap(contentRef, { active: open && trapFocus, initialFocus, finalFocus })` —
 *    `active: open` (not `mounted`) so the trap detaches the moment we set `open=false`, even
 *    while AnimatePresence is still running the exit animation (the lesson Tooltip + Popover
 *    documented).
 *  - `<AnimatePresence>` + two `<motion.div>` layers — backdrop fades; content slides + scales.
 *  - ARIA — `role="dialog"`, `aria-modal="true"`, `aria-labelledby={titleId}`,
 *    `aria-describedby={descId}` (the latter two are conditionally set based on whether Header
 *    actually rendered title / description content; we still emit the ids unconditionally so
 *    references resolve cleanly).
 */
function ModalContentImpl(
  props: ModalContentProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    variant,
    size,
    placement: placementProp,
    overlay,
    portalContainer,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  const ctx = useModalContext('Modal.Content');

  // Resolve `placement` to a primitive — `useThemedClasses` still resolves the responsive value
  // for the recipe, but the motion config and backdrop click sentinel need a single value.
  const placement: ModalPlacement =
    typeof placementProp === 'string' ? (placementProp as ModalPlacement) : 'center';

  const localContentRef = useRef<HTMLDivElement | null>(null);

  // Focus trap. `active: ctx.open && ctx.trapFocus` is the declarative gate. `finalFocus`
  // defaults to whatever the consumer passed; if nothing was passed, the engine's default
  // (return-to-previously-focused) covers the trigger automatically because the trigger had
  // focus when we opened.
  useFocusTrap(localContentRef, {
    active: ctx.open && ctx.trapFocus,
    initialFocus: ctx.initialFocus,
    finalFocus: ctx.finalFocus ?? (() => ctx.triggerNodeRef.current),
    returnFocusOnDeactivate: true,
  });

  // Re-publish the content node into the root context so other subparts (none today, but Drawer
  // patterns will need it) can `contains()` against it.
  useEffect(() => {
    ctx.registerContent(localContentRef.current);
    return () => ctx.registerContent(null);
  }, [ctx]);

  const { className: backdropClass, style: backdropStyle } = useThemedClasses({
    recipe: modalBackdropRecipe,
    componentName: 'Modal',
    slot: 'backdrop',
    props: {
      overlay,
      placement: placementProp,
    },
  });

  const { className: contentClass, style: contentStyle } = useThemedClasses({
    recipe: modalContentRecipe,
    componentName: 'Modal',
    slot: 'content',
    props: {
      variant,
      size,
      className,
      sx,
      style,
    },
  });

  const handleBackdropPointerDown = (event: ReactMouseEvent<HTMLDivElement>): void => {
    if (!ctx.closeOnBackdropClick) return;
    // Sentinel: only react when the click landed on the backdrop itself, not when it bubbled
    // up from inside Content. Without this, clicks on inputs / buttons inside Content would
    // close the Modal.
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
            key="modal-backdrop"
            className={backdropClass}
            style={(backdropStyle as never) ?? undefined}
            onPointerDown={handleBackdropPointerDown}
            {...modalBackdropMotion}
          >
            <motion.div
              ref={composedContentRef}
              role="dialog"
              tabIndex={-1}
              aria-modal="true"
              aria-labelledby={ctx.titleId}
              aria-describedby={ctx.descId}
              data-state="open"
              data-placement={placement}
              data-variant={typeof variant === 'string' ? variant : 'solid'}
              data-size={typeof size === 'string' ? size : 'md'}
              className={contentClass}
              style={(contentStyle as never) ?? undefined}
              {...modalContentMotion(placement)}
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

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(ModalContentImpl);
ModalContent.displayName = 'Modal.Content';