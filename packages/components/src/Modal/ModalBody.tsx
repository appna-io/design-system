'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { modalBodyRecipe } from './Modal.recipe';
import { useModalContext } from './ModalContext';
import type { ModalBodyProps } from './Modal.types';

/**
 * The scrollable Body region. `flex-1 overflow-y-auto` (from the recipe) bounds it against
 * Content's `max-h-[calc(100vh-4rem)]`, so long content scrolls inside Body while Header and
 * Footer stay pinned. No JS measurement, no ResizeObserver — pure flex.
 */
function ModalBodyImpl(
  props: ModalBodyProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { className, style, sx, children, ...rest } = props;
  const ctx = useModalContext('Modal.Body');

  const { className: bodyClass, style: bodyStyle } = useThemedClasses({
    recipe: modalBodyRecipe,
    componentName: 'Modal',
    slot: 'body',
    props: {
      size: ctx.size,
      className,
      sx,
      style,
    },
  });

  return (
    <div
      ref={forwardedRef}
      className={bodyClass}
      style={bodyStyle ?? undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(ModalBodyImpl);
ModalBody.displayName = 'Modal.Body';
