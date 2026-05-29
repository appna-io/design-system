'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { useFieldContext } from './FieldContext';
import { fieldRecipes } from './Field.recipe';
import type { FieldErrorProps } from './Field.types';

/**
 * `<Field.Error>` — error message rendered in place of helper text when the field is invalid.
 *
 * Carries `role="alert"` so the message is announced when it appears mid-flow (e.g. after a
 * blur-triggered validation). Auto-assigned `id` matches FieldContext's `errorId` so the inner
 * control's `aria-describedby` already includes it.
 */
export const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(function FieldError(
  props,
  ref,
) {
  const { className, style, sx, id: idProp, children, ...rest } = props;
  const ctx = useFieldContext();

  const id = idProp ?? ctx?.errorId;
  const size = ctx?.size ?? 'md';

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: fieldRecipes.error,
    componentName: 'Field',
    slot: 'error',
    props: { size, className, sx, style },
  });

  return (
    <p
      ref={ref}
      id={id}
      role="alert"
      data-field-error=""
      className={cls}
      style={rootStyle ?? undefined}
      {...rest}
    >
      {children}
    </p>
  );
}, 'Field.Error');
