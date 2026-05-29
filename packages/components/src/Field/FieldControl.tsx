'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { useFieldContext } from './FieldContext';
import { fieldRecipes } from './Field.recipe';
import type { FieldControlProps } from './Field.types';

/**
 * `<Field.Control>` — explicit slot marker for the control row. Useful when consumers want to
 * mix start / end adornments alongside the control inside the same horizontal row. When omitted,
 * Field renders the control inline; including it gives the consumer a stable hook to style or
 * decorate the row independently of the rest of the layout.
 *
 * Also carries the `data-field-control=""` attribute the floating-label CSS selector uses to
 * locate the control's input descendant.
 */
export const FieldControl = forwardRef<HTMLDivElement, FieldControlProps>(function FieldControl(
  props,
  ref,
) {
  const { className, style, sx, children, ...rest } = props;
  const ctx = useFieldContext();

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: fieldRecipes.controlRow,
    componentName: 'Field',
    slot: 'controlRow',
    props: { hasStartAdornment: false, hasEndAdornment: false, className, sx, style },
  });

  return (
    <div
      ref={ref}
      data-field-control=""
      data-disabled={ctx?.disabled ? 'true' : undefined}
      data-invalid={ctx?.invalid ? 'true' : undefined}
      className={cls}
      style={rootStyle ?? undefined}
      {...rest}
    >
      {children}
    </div>
  );
}, 'Field.Control');
