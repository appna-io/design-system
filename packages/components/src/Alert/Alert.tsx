'use client';

import { forwardRef, useControllableState } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { createElement, useMemo, type ReactNode } from 'react';

import { iconForColor, type StatusColor } from '../_shared/iconForColor';
import { alertMotion } from './Alert.motion';
import {
  alertActionRecipe,
  alertCloseRecipe,
  alertDescriptionRecipe,
  alertRootRecipe,
  alertTitleRecipe,
} from './Alert.recipe';
import type {
  AlertActionProps,
  AlertColor,
  AlertDescriptionProps,
  AlertProps,
  AlertSize,
  AlertTitleProps,
} from './Alert.types';

/**
 * Live-region role chosen automatically per color. The polite/assertive split mirrors the
 * ARIA spec: informational + success messages don't preempt the user; warning + danger should.
 */
const ROLE_BY_COLOR: Record<AlertColor, 'status' | 'alert'> = {
  info: 'status',
  success: 'status',
  neutral: 'status',
  warning: 'alert',
  danger: 'alert',
};

/**
 * The canonical inline status banner. Renders a feedback surface for `info` / `success` /
 * `warning` / `danger` / `neutral` messages, with optional title, leading icon (auto-selected
 * per color), action area, and a Motion-driven dismiss.
 *
 * Alert is the **first DS component with an exit animation** (`AnimatePresence`) and the
 * **first to consume `_shared/iconForColor`** — both patterns Toast and future status surfaces
 * will reuse without re-implementation.
 *
 * @example
 *   <Alert color="success">Saved.</Alert>
 *   <Alert closable onClose={() => setOpen(false)}>
 *     <Alert.Title>Heads up</Alert.Title>
 *     <Alert.Description>Your draft was saved.</Alert.Description>
 *   </Alert>
 */
const AlertRoot = forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  const {
    variant,
    color = 'info',
    size,
    icon,
    hideIcon = false,
    closable = false,
    onClose,
    open: openProp,
    defaultOpen = true,
    role,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  const [openRaw, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: (next) => {
      if (!next) onClose?.();
    },
  });
  // `useControllableState` widens the value to `T | undefined`; coerce to a concrete boolean so
  // `AnimatePresence`'s child-or-null branch reads cleanly.
  const open = openRaw ?? defaultOpen ?? true;

  const effectiveSize = resolveBaseSize(size);

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: alertRootRecipe,
    componentName: 'Alert',
    slot: 'root',
    props: { variant, color, size, className, sx, style },
  });

  const { className: closeClass } = useThemedClasses({
    recipe: alertCloseRecipe,
    componentName: 'Alert',
    slot: 'close',
    props: { size: effectiveSize },
  });

  const ariaRole = role ?? ROLE_BY_COLOR[color];
  const ariaLive = ariaRole === 'alert' ? 'assertive' : 'polite';

  // Pre-resolve the leading icon so the consumer can override with `icon` or skip with
  // `hideIcon`. The default icon is read from the shared map keyed by `color`.
  const leadingIcon: ReactNode = useMemo(() => {
    if (hideIcon) return null;
    if (icon !== undefined) return icon;
    const Icon = iconForColor[color as StatusColor];
    return Icon ? createElement(Icon) : null;
  }, [icon, hideIcon, color]);

  // Resolve the variant for the data-attribute (used by sub-part recipes via group selector).
  const variantAttr = typeof variant === 'string' ? variant : 'soft';

  // Motion's `MotionStyle` is incompatible with React's plain `CSSProperties` under
  // `exactOptionalPropertyTypes: true` because transforms like `x` reject the `undefined`
  // member that `CSSProperties` keys carry. We resolve via a cast on the spread.
  const motionExtraProps: Record<string, unknown> = {
    ...(rest as Record<string, unknown>),
    ...(rootStyle ? { style: rootStyle } : {}),
  };

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          ref={ref}
          {...alertMotion}
          className={rootClass}
          role={ariaRole}
          aria-live={ariaLive}
          data-variant={variantAttr}
          data-color={color}
          {...motionExtraProps}
        >
          {leadingIcon != null ? (
            <span aria-hidden="true" className="flex shrink-0 items-center pt-0.5">
              {leadingIcon}
            </span>
          ) : null}
          <div className="min-w-0 flex-1">{children}</div>
          {closable ? (
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setOpen(false)}
              className={closeClass}
            >
              <X />
            </button>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}, 'Alert');

const AlertTitle = forwardRef<HTMLDivElement, AlertTitleProps>(function AlertTitle(props, ref) {
  const { className, style, sx, children, ...rest } = props;
  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: alertTitleRecipe,
    componentName: 'Alert',
    slot: 'title',
    props: { className, sx, style },
  });
  return (
    <div ref={ref} className={cls} style={rootStyle ?? undefined} {...rest}>
      {children}
    </div>
  );
}, 'Alert.Title');

const AlertDescription = forwardRef<HTMLDivElement, AlertDescriptionProps>(
  function AlertDescription(props, ref) {
    const { className, style, sx, children, ...rest } = props;
    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: alertDescriptionRecipe,
      componentName: 'Alert',
      slot: 'description',
      props: { className, sx, style },
    });
    return (
      <div ref={ref} className={cls} style={rootStyle ?? undefined} {...rest}>
        {children}
      </div>
    );
  },
  'Alert.Description',
);

const AlertAction = forwardRef<HTMLDivElement, AlertActionProps>(function AlertAction(props, ref) {
  const { className, style, sx, children, ...rest } = props;
  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: alertActionRecipe,
    componentName: 'Alert',
    slot: 'action',
    props: { className, sx, style },
  });
  return (
    <div ref={ref} className={cls} style={rootStyle ?? undefined} {...rest}>
      {children}
    </div>
  );
}, 'Alert.Action');

/**
 * Compound export: `Alert` is a callable component **and** carries the three sub-parts as
 * properties. Matches the pattern Card uses; lets consumers reach for the parts via dot-syntax
 * (`<Alert.Title>`) without polluting the package's top-level export surface.
 */
export const Alert = Object.assign(AlertRoot, {
  Title: AlertTitle,
  Description: AlertDescription,
  Action: AlertAction,
});

/**
 * Single-pull resolver for the non-responsive `size` axis. The close button picks one size
 * (the `base`/scalar value) — responsive sizing is handled by the root recipe via Tailwind's
 * breakpoint prefixes; the button itself doesn't need to track responsive changes because its
 * size is derived from the root via the `group/alert` selector pattern.
 */
function resolveBaseSize(value: AlertProps['size']): AlertSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, AlertSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}
