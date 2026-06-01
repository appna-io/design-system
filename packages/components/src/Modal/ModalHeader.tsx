'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { modalHeaderRecipe } from './Modal.recipe';
import { useModalContext } from './ModalContext';
import type { ModalHeaderProps } from './Modal.types';

/**
 * The Modal header. Three layout slots from start to end (logical, RTL-flippable):
 *
 *   [ avatar ] [ title + description ]                    [ action ]
 *
 * `title` and `description` are wired to the Modal's context-managed `titleId` / `descId`, which
 * Content carries on `aria-labelledby` / `aria-describedby`. Authors get correct dialog labelling
 * for free.
 *
 * Composing custom layouts: pass `children` instead of (or alongside) `title` / `description`.
 * When children are present they replace the default title/description block; pass the title in
 * a `<h2 id={`${ctx.titleId}`}>` (consumers won't usually need this — `title` prop covers 95% of
 * cases).
 */
function ModalHeaderImpl(
  props: ModalHeaderProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    title,
    description,
    avatar,
    action,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  const ctx = useModalContext('Modal.Header');

  const { className: headerClass, style: headerStyle } = useThemedClasses({
    recipe: modalHeaderRecipe,
    componentName: 'Modal',
    slot: 'header',
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
      className={headerClass}
      style={headerStyle ?? undefined}
      {...rest}
    >
      {avatar ? <div className="flex-none">{avatar}</div> : null}
      <div className="min-w-0 flex-1">
        {children ?? (
          <>
            {title ? (
              <h2 id={ctx.titleId} className="text-base font-semibold leading-tight text-fg-default">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p
                id={ctx.descId}
                className="mt-1 text-sm leading-snug text-fg-muted"
              >
                {description}
              </p>
            ) : null}
          </>
        )}
      </div>
      {action ? <div className="ms-auto flex-none">{action}</div> : null}
    </div>
  );
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(ModalHeaderImpl);
ModalHeader.displayName = 'Modal.Header';