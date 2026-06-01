'use client';

import { mergeRefs, Portal, useFocusTrap, useScrollLock } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { AlertOctagon, AlertTriangle, CheckCircle2, Info, MessageCircle, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  createElement,
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useRef,
  type ForwardedRef,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { Button } from '../Button/Button';
import type { ButtonColor } from '../Button/Button.types';

import { confirmBackdropMotion, confirmContentMotion } from './Confirm.motion';
import {
  confirmBackdropRecipe,
  confirmContentRecipe,
  confirmDescriptionRecipe,
  confirmFooterRecipe,
  confirmIconWrapRecipe,
  confirmTitleRecipe,
} from './Confirm.recipe';
import type { ConfirmDisplayOptions, ConfirmVariant } from './Confirm.types';

/**
 * Default icon per variant. We keep this map local to the confirm surface (rather than reusing
 * `_shared/iconForColor`) because the variant axis here doesn't 1:1 match the StatusColor
 * union — `default` slots in for `neutral` and `error` slots in for `danger`, both of which
 * deserve their own keying so the recipe + button-color mappings stay readable.
 */
const ICON_BY_VARIANT: Record<ConfirmVariant, LucideIcon> = {
  default: MessageCircle,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertOctagon,
};

/**
 * Confirm-button color per variant. Mirrors the way the Alert / Toast families pick a status
 * color for their primary affordance. `default` uses the brand `primary` since a no-emphasis
 * confirm is asking for a plain "Yes" — `primary` is the unambiguous "go-ahead" color across
 * the DS.
 */
const BUTTON_COLOR_BY_VARIANT: Record<ConfirmVariant, ButtonColor> = {
  default: 'primary',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'danger',
};

export interface ConfirmSurfaceProps extends ConfirmDisplayOptions {
  /** Whether the dialog should be visible. The host gates this via `AnimatePresence`. */
  open: boolean;
  /** Fired when the user clicks the confirm button. */
  onConfirm: () => void;
  /** Fired when the user clicks cancel, presses Escape, or clicks the backdrop. */
  onCancel: () => void;
  /** Override the portal target. `null` falls back to `document.body`. */
  portalContainer?: HTMLElement | null | undefined;
}

/**
 * Pure rendering primitive for the confirm dialog. **Stateless** — the host (`ConfirmProvider`)
 * owns the active record and resolves the promise; the surface just forwards button clicks +
 * backdrop dismisses back to the host via `onConfirm` / `onCancel`.
 *
 * Owns the visual composition: portal + animated backdrop, focus-trapped dialog, leading icon
 * halo, title + description, cancel + confirm button row. ARIA wiring is automatic — the
 * dialog is a `role="alertdialog"` because confirms always demand a response, with
 * `aria-labelledby` pointing at the title and `aria-describedby` pointing at the description
 * when one is rendered.
 *
 * Exported from this module but **not** from the package's public surface — consumers should
 * reach for `confirm.display(...)`, not this primitive.
 */
function ConfirmSurfaceImpl(
  props: ConfirmSurfaceProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    open,
    variant = 'default',
    showIcon = true,
    icon,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    closeOnBackdropClick = true,
    className,
    style,
    sx,
    portalContainer,
    onConfirm,
    onCancel,
  } = props;

  const reactId = useId();
  const titleId = `sds-confirm-${reactId}-title`;
  const descId = `sds-confirm-${reactId}-desc`;

  const contentRef = useRef<HTMLDivElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  // Focus trap. Active while open — when the dialog closes we let Motion play its exit and the
  // trap deactivates immediately so the previously-focused element regains focus on the next
  // frame (the engine's `useFocusTrap` handles return-focus on deactivate). We point
  // `initialFocus` at the **confirm** button (not the first focusable) because Enter on a
  // freshly-opened confirm dialog should activate the primary action — the canonical desktop
  // dialog convention.
  useFocusTrap(contentRef, {
    active: open,
    initialFocus: () => confirmButtonRef.current,
    returnFocusOnDeactivate: true,
  });

  // Body-scroll lock. The engine reference-counts so a Confirm-over-Modal combo collapses to a
  // single lock + unlock pair.
  useScrollLock(open);

  const { className: backdropClass, style: backdropStyle } = useThemedClasses({
    recipe: confirmBackdropRecipe,
    componentName: 'Confirm',
    slot: 'backdrop',
    props: {},
  });

  const { className: contentClass, style: contentStyle } = useThemedClasses({
    recipe: confirmContentRecipe,
    componentName: 'Confirm',
    slot: 'content',
    props: { className, sx, style },
  });

  const { className: iconWrapClass } = useThemedClasses({
    recipe: confirmIconWrapRecipe,
    componentName: 'Confirm',
    slot: 'iconWrap',
    props: { variant },
  });

  const { className: titleClass } = useThemedClasses({
    recipe: confirmTitleRecipe,
    componentName: 'Confirm',
    slot: 'title',
    props: {},
  });

  const { className: descClass } = useThemedClasses({
    recipe: confirmDescriptionRecipe,
    componentName: 'Confirm',
    slot: 'description',
    props: {},
  });

  const { className: footerClass } = useThemedClasses({
    recipe: confirmFooterRecipe,
    componentName: 'Confirm',
    slot: 'footer',
    props: {},
  });

  const handleBackdropPointerDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!closeOnBackdropClick) return;
      // Sentinel: only react when the click landed on the backdrop itself, not when it
      // bubbled up from inside Content. Without this, clicks on the buttons inside Content
      // would also fire cancel.
      if (event.target === event.currentTarget) {
        onCancel();
      }
    },
    [closeOnBackdropClick, onCancel],
  );

  // Resolve the leading icon. Consumer override (`icon`) wins over the variant default; both
  // are suppressed when `showIcon === false`.
  const leadingIcon: ReactNode = useMemo(() => {
    if (!showIcon) return null;
    if (icon !== undefined) return icon;
    const IconComp = ICON_BY_VARIANT[variant];
    return IconComp ? createElement(IconComp) : null;
  }, [showIcon, icon, variant]);

  const confirmColor: ButtonColor = BUTTON_COLOR_BY_VARIANT[variant];

  const composedContentRef = mergeRefs<HTMLDivElement>(
    contentRef as Ref<HTMLDivElement>,
    forwardedRef as Ref<HTMLDivElement>,
  );

  return (
    <Portal container={portalContainer}>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="confirm-backdrop"
            className={backdropClass}
            style={(backdropStyle as never) ?? undefined}
            onPointerDown={handleBackdropPointerDown}
            {...confirmBackdropMotion}
          >
            <motion.div
              ref={composedContentRef}
              role="alertdialog"
              tabIndex={-1}
              aria-modal="true"
              aria-labelledby={title != null ? titleId : undefined}
              aria-describedby={description != null ? descId : undefined}
              data-state="open"
              data-variant={variant}
              className={contentClass}
              style={(contentStyle as never) ?? undefined}
              {...confirmContentMotion}
            >
              {leadingIcon != null ? (
                <span aria-hidden="true" className={iconWrapClass}>
                  {leadingIcon}
                </span>
              ) : null}

              {title != null ? (
                <h2 id={titleId} className={titleClass}>
                  {title}
                </h2>
              ) : null}

              {description != null ? (
                <p id={descId} className={descClass}>
                  {description}
                </p>
              ) : null}

              <div className={footerClass}>
                <Button variant="ghost" color="neutral" onClick={onCancel}>
                  {cancelText}
                </Button>
                <Button
                  ref={confirmButtonRef}
                  variant="solid"
                  color={confirmColor}
                  onClick={onConfirm}
                >
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}

export const ConfirmSurface = forwardRef<HTMLDivElement, ConfirmSurfaceProps>(ConfirmSurfaceImpl);
ConfirmSurface.displayName = 'ConfirmSurface';