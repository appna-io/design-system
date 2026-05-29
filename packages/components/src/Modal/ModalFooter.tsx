'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { modalFooterRecipe } from './Modal.recipe';
import { useModalContext } from './ModalContext';
import type { ModalFooterProps } from './Modal.types';

/**
 * Footer slot for primary / secondary action buttons. The `align` variant maps to flex
 * justification:
 *
 *   - `end` (default) — right-aligned (or left in RTL); the typical "Cancel | Confirm" pattern.
 *   - `start` — left-aligned; useful for help / cancel links in admin flows.
 *   - `between` — split; "Cancel" on one side, "Confirm" on the other.
 *
 * Footer never grows — it sits below the scrollable Body. Content's max-height keeps both
 * Header + Footer fully visible at all times.
 */
function ModalFooterImpl(
  props: ModalFooterProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { align = 'end', className, style, sx, children, ...rest } = props;
  const ctx = useModalContext('Modal.Footer');

  const { className: footerClass, style: footerStyle } = useThemedClasses({
    recipe: modalFooterRecipe,
    componentName: 'Modal',
    slot: 'footer',
    props: {
      size: ctx.size,
      align,
      className,
      sx,
      style,
    },
  });

  return (
    <div
      ref={forwardedRef}
      className={footerClass}
      style={footerStyle ?? undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(ModalFooterImpl);
ModalFooter.displayName = 'Modal.Footer';
