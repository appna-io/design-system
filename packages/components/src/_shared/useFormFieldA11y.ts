'use client';

import { useId, warn } from '@apx-ui/engine';
import { useMemo } from 'react';

import { useFieldContext } from '../Field/FieldContext';

export interface UseFormFieldA11yOptions {
  /** Consumer-provided id. When omitted a stable SSR-safe id is generated. */
  id?: string | undefined;
  /** Visual + a11y invalid state. Drives `aria-invalid` and `data-invalid`. */
  invalid?: boolean | undefined;
  /** Mirrors the native `required` attribute. Adds `aria-required` for non-input descendants. */
  required?: boolean | undefined;
  /** Existing `aria-describedby` value to preserve / merge with future ids (helper, error). */
  'aria-describedby'?: string | undefined;
  /**
   * Optional component name used in dev warnings when both the control's own a11y prop and the
   * wrapping `<Field>` set the same value (e.g. `invalid`). Pass `componentName: 'Input'` for
   * clearer diagnostics.
   */
  componentName?: string | undefined;
}

export interface UseFormFieldA11yReturn {
  /** Stable id for the form control (echoed from `options.id` or generated). */
  id: string;
  /** `aria-invalid` value, `true` when invalid, omitted otherwise. */
  'aria-invalid'?: 'true' | undefined;
  /** `aria-required` value, `true` when required, omitted otherwise. */
  'aria-required'?: 'true' | undefined;
  /** Pass-through `aria-describedby` — preserved so the consumer can wire helper / error text. */
  'aria-describedby'?: string | undefined;
  /** `data-invalid` attribute, useful for CSS hooks on the *wrapper* (not the native input). */
  'data-invalid'?: 'true' | undefined;
}

/**
 * Canonical a11y wiring for every form-control component (Input, Textarea, Select, Checkbox,
 * Switch, Radio, Combobox, NumberInput, Rating). One hook centralizes:
 *
 *  - id generation (uses `useId` so SSR + hydration are stable).
 *  - `aria-invalid` ↔ `invalid` prop bridge.
 *  - `aria-required` ↔ `required` prop bridge.
 *  - `aria-describedby` pass-through (Field appends helper / error ids here).
 *  - `data-invalid` attribute mirror so wrapper recipes can hook off attribute selectors.
 *  - **FieldContext integration** — when the control is wrapped in `<Field>`, the Field's
 *    values win (id, required, invalid, describedBy) and propagate to the control with zero
 *    source-code changes to that control. This is the single integration point that powers
 *    Phase 49 across all 13 form controls.
 *
 * Spreading the return onto the native `<input>` is intentional: every attribute is either valid
 * HTML or an ARIA attribute that the platform understands without polyfill.
 *
 * @example Standalone
 *   const a11y = useFormFieldA11y({ id, invalid: hasError, required: isRequired });
 *   <input {...a11y} />
 *
 * @example Inside `<Field>` (no code change required)
 *   // The same call site picks up FieldContext automatically; Field's `id` replaces the
 *   // control's generated id, Field's `error`/`required` win, and `aria-describedby` already
 *   // includes the description / helper / error ids Field owns.
 */
export function useFormFieldA11y(options: UseFormFieldA11yOptions): UseFormFieldA11yReturn {
  const { id: providedId, invalid, required, componentName } = options;
  const describedBy = options['aria-describedby'];
  const fallbackId = useId(providedId);

  const fieldCtx = useFieldContext();

  if (process.env.NODE_ENV !== 'production' && fieldCtx) {
    // Help consumers spot redundant prop assignments. The Field's values WIN, so passing the same
    // prop on the inner control is just dead code. Warn once per render so the source becomes
    // discoverable in the console.
    warn(
      !(invalid === true && fieldCtx.invalid === true) || invalid === fieldCtx.invalid,
      `<${componentName ?? 'FormControl'}> set \`invalid\` while wrapped in <Field error=…>. <Field> wins; drop the prop on the inner control.`,
      'FIELD_DUPLICATE_INVALID',
    );
    warn(
      !(required === true && fieldCtx.required === true) || required === fieldCtx.required,
      `<${componentName ?? 'FormControl'}> set \`required\` while wrapped in <Field required>. <Field> wins; drop the prop on the inner control.`,
      'FIELD_DUPLICATE_REQUIRED',
    );
  }

  return useMemo<UseFormFieldA11yReturn>(() => {
    // Field-aware code path: Field wins, but the control's own props still apply when Field
    // didn't set the same axis (e.g. control marks itself invalid while Field has no error).
    //
    // **Group-mode carve-out**: when Field is `as='fieldset'`, multiple controls share the
    // wrapper. Propagating id + describedBy from FieldContext would collide across siblings
    // (every Checkbox / Radio would inherit the same id). In that mode we keep `required` and
    // `invalid` (whole-group axes) but let each control auto-generate its own id, and we skip
    // describedBy (legend + each control's own label carry the labeling).
    const inGroupMode = fieldCtx?.groupMode ?? false;
    const effectiveId = !inGroupMode && fieldCtx?.id ? fieldCtx.id : fallbackId;
    const effectiveInvalid = fieldCtx?.invalid || Boolean(invalid);
    const effectiveRequired = fieldCtx?.required || Boolean(required);
    const effectiveDescribedBy = inGroupMode
      ? describedBy
      : mergeDescribedBy(describedBy, fieldCtx?.describedBy);

    const result: UseFormFieldA11yReturn = { id: effectiveId };
    if (effectiveInvalid) {
      result['aria-invalid'] = 'true';
      result['data-invalid'] = 'true';
    }
    if (effectiveRequired) {
      result['aria-required'] = 'true';
    }
    if (effectiveDescribedBy) {
      result['aria-describedby'] = effectiveDescribedBy;
    }
    return result;
  }, [
    fallbackId,
    invalid,
    required,
    describedBy,
    fieldCtx?.id,
    fieldCtx?.invalid,
    fieldCtx?.required,
    fieldCtx?.describedBy,
    fieldCtx?.groupMode,
  ]);
}

/**
 * Merges the consumer-provided `aria-describedby` (set on the control directly) with the Field's
 * pre-composed `describedBy` (description + helper + error ids). Order: consumer ids first so
 * the control's own existing descriptions are announced before Field's chrome.
 */
function mergeDescribedBy(
  fromProps: string | undefined,
  fromField: string | undefined,
): string | undefined {
  if (fromProps && fromField) return `${fromProps} ${fromField}`;
  return fromProps ?? fromField ?? undefined;
}
