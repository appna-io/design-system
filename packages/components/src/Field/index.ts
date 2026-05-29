/**
 * Compound assembly for `<Field>`. Same `Object.assign(root, { …subparts })` shape Card, Tabs,
 * Breadcrumbs, Stepper, Menu, etc. use.
 */
import { Field as FieldRoot } from './Field';
import { FieldControl } from './FieldControl';
import { FieldDescription } from './FieldDescription';
import { FieldError } from './FieldError';
import { FieldHelper } from './FieldHelper';
import { FieldLabel } from './FieldLabel';

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Description: FieldDescription,
  Helper: FieldHelper,
  Error: FieldError,
  Control: FieldControl,
});

export { FieldContext, useFieldContext } from './FieldContext';
export { useFieldIds, type UseFieldIdsOptions, type UseFieldIdsReturn } from './useFieldIds';

export type {
  FieldAs,
  FieldBaseProps,
  FieldContextValue,
  FieldControlProps,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldHelperProps,
  FieldLabelPosition,
  FieldLabelProps,
  FieldProps,
  FieldSize,
} from './Field.types';
