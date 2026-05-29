'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { useFieldContext } from './FieldContext';
import { fieldRecipes } from './Field.recipe';
import type { FieldLabelProps } from './Field.types';

/**
 * `<Field.Label>` — the visible label, auto-associated with the inner control.
 *
 * Behaviors:
 *  - Reads `htmlFor`, `size`, `invalid`, `disabled`, `labelPosition` from `FieldContext`.
 *  - Renders as `<label>` always. When `as='fieldset'` on the root, the root suppresses the
 *    automatic Label render and instead routes the label text into the `<legend>` it owns — so
 *    this subpart still works in both cases when consumers reach for the compound API.
 *  - Applies `sr-only` when `labelPosition='hidden'` (label remains associated and announced).
 *  - Applies the floating-label CSS when `labelPosition='floating'`.
 */
export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(function FieldLabel(
  props,
  ref,
) {
  const { htmlFor: htmlForProp, className, style, sx, children, ...rest } = props;
  const ctx = useFieldContext();

  const htmlFor = htmlForProp ?? ctx?.id;
  const size = ctx?.size ?? 'md';
  const invalid = ctx?.invalid ?? false;
  const disabled = ctx?.disabled ?? false;
  const hidden = ctx?.labelPosition === 'hidden';
  const floating = ctx?.labelPosition === 'floating';

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: fieldRecipes.label,
    componentName: 'Field',
    slot: 'label',
    props: { size, invalid, disabled, hidden, floating, className, sx, style },
  });

  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      data-field-label=""
      data-invalid={invalid ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      className={cls}
      style={rootStyle ?? undefined}
      {...rest}
    >
      {children}
    </label>
  );
}, 'Field.Label');
