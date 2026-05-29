'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { useFieldContext } from './FieldContext';
import { fieldRecipes } from './Field.recipe';
import type { FieldDescriptionProps } from './Field.types';

/**
 * `<Field.Description>` — long-form guidance shown between the label and the control.
 *
 * Auto-assigned `id` matches the FieldContext's `descriptionId`, so when the consumer renders
 * this subpart the inner control's `aria-describedby` already covers it. Renders as `<p>` so
 * assistive tech treats it as a paragraph.
 */
export const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  function FieldDescription(props, ref) {
    const { className, style, sx, id: idProp, children, ...rest } = props;
    const ctx = useFieldContext();

    const id = idProp ?? ctx?.descriptionId;
    const size = ctx?.size ?? 'md';

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: fieldRecipes.description,
      componentName: 'Field',
      slot: 'description',
      props: { size, className, sx, style },
    });

    return (
      <p
        ref={ref}
        id={id}
        data-field-description=""
        className={cls}
        style={rootStyle ?? undefined}
        {...rest}
      >
        {children}
      </p>
    );
  },
  'Field.Description',
);
