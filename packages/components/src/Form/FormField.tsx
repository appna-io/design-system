'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ChangeEvent,
  type FocusEvent,
  type ReactElement,
} from 'react';

import { warn } from '@apx-ui/engine';

import { Field } from '../Field/Field';
import type { FieldProps } from '../Field/Field.types';

import { useFormContext } from './FormContext';
import { parseEventValue } from './parseEventValue';
import type { FieldValidator, FormFieldBinding, FormFieldProps } from './Form.types';

/**
 * `<FormField name>` — the name-bound adapter that pairs `<Form>` with `<Field>` without
 * touching the Field source. Three responsibilities:
 *
 * 1. **Read** the live FormContext for the given `name`: pulls `value`, `error`, `touched`.
 *    `error` is only forwarded to Field once the field is touched OR a submit has been attempted,
 *    so consumers don't see "Required" yelled at them mid-typing.
 * 2. **Inject** `value` / `onChange` / `onBlur` / `name` / `id` onto the single immediate child.
 *    Three injection strategies (`binding` prop):
 *      - `'native'` (default) — native-event shape; works with `<Input>` / `<Textarea>` /
 *        `<NumberInput>` / plain `<input>` / `<select>` / `<textarea>`.
 *      - `'checkbox'` — boolean shape; prefers `onCheckedChange` if the child accepts it,
 *        falls back to native `onChange`.
 *      - `'value'` — value-callback shape; for `<Combobox>` / `<Select>` / `<Rating>` /
 *        `<TagsInput>` / `<Slider>` / `<RadioGroup>`.
 * 3. **Register** the per-field validator + control id with the FormApi so async validation +
 *    `focusOnError` work.
 *
 * Why not auto-detect the binding via displayName? Because that's fragile across `forwardRef`
 * wrappers, dev/prod minification, and consumer-provided wrapper components. An explicit
 * `binding` prop is honest, predictable, and a one-line addition at the call site.
 */
export function FormField<K extends string = string>(props: FormFieldProps<K>): ReactElement {
  const {
    name,
    binding = 'native' as FormFieldBinding,
    validate,
    validateAsync,
    validateDebounceMs = 300,
    children,
    ...fieldProps
  } = props;

  const form = useFormContext<Record<string, unknown>>();
  const generatedId = useId();
  const idRef = useRef(generatedId);

  if (process.env.NODE_ENV !== 'production') {
    warn(
      form != null,
      `<FormField name="${name}"> rendered outside <Form>. Wrap your form in <Form> or use <Field> directly with manual wiring.`,
      'FORM_FIELD_NO_CONTEXT',
    );
  }

  // ----- Per-field validator registration ---------------------------------------------------

  useEffect(() => {
    if (!form || !validate) return undefined;
    return form.registerFieldValidator(name, validate as FieldValidator<unknown, Record<string, unknown>>);
  }, [form, name, validate]);

  // ----- Per-field async validator (debounced + abortable) ---------------------------------

  const asyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const asyncControllerRef = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      if (asyncTimerRef.current !== null) clearTimeout(asyncTimerRef.current);
      asyncControllerRef.current?.abort();
    },
    [],
  );

  const runAsyncValidator = useCallback(
    (nextValue: unknown) => {
      if (!form || !validateAsync) return;
      if (asyncTimerRef.current !== null) clearTimeout(asyncTimerRef.current);
      asyncTimerRef.current = setTimeout(() => {
        asyncControllerRef.current?.abort();
        const controller = new AbortController();
        asyncControllerRef.current = controller;
        Promise.resolve(validateAsync(nextValue, { signal: controller.signal }))
          .then((result) => {
            if (controller.signal.aborted) return;
            form.setFieldError(name, result ?? undefined);
          })
          .catch((err: unknown) => {
            if (controller.signal.aborted) return;
            const msg = err instanceof Error ? err.message : 'Validation failed';
            form.setFieldError(name, msg);
          });
      }, validateDebounceMs);
    },
    [form, name, validateAsync, validateDebounceMs],
  );

  // ----- Field id registration (drives focusOnError) ---------------------------------------

  useEffect(() => {
    if (!form) return undefined;
    return form.registerFieldId(name, idRef.current);
  }, [form, name]);

  // ----- Resolve current state ---------------------------------------------------------------

  const value = form ? (form.values as Record<string, unknown>)[name] : undefined;
  const touched = form ? (form.touched as Record<string, boolean>)[name] : false;
  const errorMsg = form ? (form.errors as Record<string, string>)[name] : undefined;
  const showError = Boolean(errorMsg && (touched || (form?.submitCount ?? 0) > 0));

  // ----- Clone the single child --------------------------------------------------------------

  const child = Children.only(children);
  const isElement = isValidElement(child);

  const cloned = useMemo(() => {
    if (!isElement || !form) return child;
    const existing = ((child as ReactElement).props ?? {}) as Record<string, unknown>;

    const shouldValidateOnChange = form.validateOn === 'change';
    const shouldValidateOnBlur =
      form.validateOn === 'blur' || form.validateOn === 'submit-and-blur';

    if (binding === 'checkbox') {
      const existingOnCheckedChange = existing.onCheckedChange as
        | ((checked: boolean) => void)
        | undefined;
      const existingOnChange = existing.onChange as
        | ((event: ChangeEvent<HTMLInputElement>) => void)
        | undefined;
      const onCheckedChange = (checked: boolean) => {
        form.setFieldValue(name, checked);
        existingOnCheckedChange?.(checked);
        if (validateAsync) runAsyncValidator(checked);
        if (shouldValidateOnChange) void form.validateForm();
      };
      const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        form.setFieldValue(name, checked);
        existingOnChange?.(event);
        if (validateAsync) runAsyncValidator(checked);
        if (shouldValidateOnChange) void form.validateForm();
      };
      const onBlur = (event: FocusEvent<HTMLInputElement>) => {
        form.setFieldTouched(name, true);
        (existing.onBlur as ((e: FocusEvent<HTMLInputElement>) => void) | undefined)?.(event);
        if (shouldValidateOnBlur) void form.validateForm();
      };
      return cloneElement(child, {
        ...existing,
        id: idRef.current,
        name,
        checked: Boolean(value),
        onCheckedChange,
        onChange,
        onBlur,
      } as Record<string, unknown>);
    }

    if (binding === 'value') {
      const existingOnChange = existing.onChange as ((next: unknown, ...rest: unknown[]) => void) | undefined;
      const onChange = (next: unknown, ...meta: unknown[]) => {
        form.setFieldValue(name, next);
        existingOnChange?.(next, ...meta);
        if (validateAsync) runAsyncValidator(next);
        if (shouldValidateOnChange) void form.validateForm();
      };
      const onBlur = (event: FocusEvent<HTMLElement>) => {
        form.setFieldTouched(name, true);
        (existing.onBlur as ((e: FocusEvent<HTMLElement>) => void) | undefined)?.(event);
        if (shouldValidateOnBlur) void form.validateForm();
      };
      return cloneElement(child, {
        ...existing,
        id: idRef.current,
        name,
        value,
        onChange,
        onBlur,
      } as Record<string, unknown>);
    }

    // 'native' binding.
    const existingOnChange = existing.onChange as
      | ((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void)
      | undefined;
    const onChange = (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      const next = parseEventValue(event);
      form.setFieldValue(name, next);
      existingOnChange?.(event);
      if (validateAsync) runAsyncValidator(next);
      if (shouldValidateOnChange) void form.validateForm();
    };
    const onBlur = (
      event: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      form.setFieldTouched(name, true);
      (
        existing.onBlur as
          | ((e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void)
          | undefined
      )?.(event);
      if (shouldValidateOnBlur) void form.validateForm();
    };
    return cloneElement(child, {
      ...existing,
      id: idRef.current,
      name,
      value: value ?? '',
      onChange,
      onBlur,
    } as Record<string, unknown>);
    // `isElement` is captured at the start of the memo; including it as a dep would force a
    // re-clone on every render even when the child element identity is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child, form, binding, name, value, validateAsync, runAsyncValidator]);

  return (
    <Field
      {...(fieldProps as FieldProps)}
      name={name}
      htmlFor={idRef.current}
      error={showError ? errorMsg : undefined}
    >
      {cloned}
    </Field>
  );
}

FormField.displayName = 'FormField';
