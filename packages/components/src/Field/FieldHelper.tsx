'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { useFieldContext } from './FieldContext';
import { fieldRecipes } from './Field.recipe';
import type { FieldHelperProps } from './Field.types';

/**
 * `<Field.Helper>` — short hint below the control. Hidden by the root when `error` is non-falsy
 * so the error message takes its place. Auto-assigned `id` matches FieldContext's `helperId`.
 */
export const FieldHelper = forwardRef<HTMLParagraphElement, FieldHelperProps>(function FieldHelper(
  props,
  ref,
) {
  const { className, style, sx, id: idProp, children, ...rest } = props;
  const ctx = useFieldContext();

  const id = idProp ?? ctx?.helperId;
  const size = ctx?.size ?? 'md';

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: fieldRecipes.helper,
    componentName: 'Field',
    slot: 'helper',
    props: { size, className, sx, style },
  });

  return (
    <p
      ref={ref}
      id={id}
      data-field-helper=""
      className={cls}
      style={rootStyle ?? undefined}
      {...rest}
    >
      {children}
    </p>
  );
}, 'Field.Helper');