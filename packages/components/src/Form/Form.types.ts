import type {
  ChangeEvent,
  FocusEvent,
  FormEvent,
  FormHTMLAttributes,
  ReactNode,
  Ref,
} from 'react';

import type { Sx } from '@apx-ui/engine';

import type { FieldProps } from '../Field/Field.types';

/**
 * The error map produced by validators. Keys mirror the form's `Values` shape; values are the
 * human-readable error strings rendered into `<Field error>` / live region. `undefined` clears
 * a key.
 */
export type FormErrors<Values> = Partial<Record<keyof Values, string | undefined>>;

/** Touched + dirty are the same shape — booleans keyed by field name. */
export type FormFlags<Values> = Partial<Record<keyof Values, boolean>>;

export type ValidateOn = 'submit' | 'blur' | 'change' | 'submit-and-blur';

/**
 * Pure validator — sync or async — returning a (possibly empty) error map. Falsy entries are
 * treated as "no error" so consumers can return `{ email: null }` from a switch statement
 * without re-keying.
 */
export type FormValidator<Values> = (
  values: Values,
) => FormErrors<Values> | Promise<FormErrors<Values>>;

/**
 * Per-field validator registered via `<FormField validate>` (or `<FormField validateAsync>`).
 * Returns the error string, `null`/`undefined` for "valid", or a `Promise` of either.
 */
export type FieldValidator<V = unknown, Values = Record<string, unknown>> = (
  value: V,
  values: Values,
) => string | null | undefined | Promise<string | null | undefined>;

export interface FormHelpers<Values> {
  setFieldValue<K extends keyof Values>(name: K, value: Values[K]): void;
  setFieldError<K extends keyof Values>(name: K, error: string | undefined): void;
  setFieldTouched<K extends keyof Values>(name: K, touched: boolean): void;
  setErrors(errors: FormErrors<Values>): void;
  setTouched(touched: FormFlags<Values>): void;
  setValues(values: Partial<Values>): void;
  resetForm(next?: { values?: Values }): void;
  validateForm(): Promise<FormErrors<Values>>;
  submitForm(): Promise<void>;
}

export interface FormState<Values> {
  values: Values;
  initialValues: Values;
  errors: FormErrors<Values>;
  touched: FormFlags<Values>;
  /** Derived: `values[k] !== initialValues[k]`. */
  dirty: FormFlags<Values>;
  /** `true` while `onSubmit` is in flight. */
  isSubmitting: boolean;
  /** Cumulative submit attempts since mount. */
  submitCount: number;
  /** Derived: `Object.values(errors).every(v => !v)`. */
  isValid: boolean;
  /** Derived: any key in `dirty` is true. */
  isDirty: boolean;
}

export interface FormApi<Values> extends FormState<Values>, FormHelpers<Values> {
  /** Resolved `validateOn` mode (echoed from `useForm` options). FormField consults this so its
   *  injected `onBlur` / `onChange` know whether to fire `validateForm()` themselves. */
  validateOn: ValidateOn;
  handleChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  handleBlur: (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  handleSubmit: (event?: FormEvent<HTMLFormElement>) => Promise<void>;
  /** Register a per-field validator. Returns an unregister function. */
  registerFieldValidator: <K extends keyof Values>(
    name: K,
    validator: FieldValidator<Values[K], Values>,
  ) => () => void;
  /** Register the resolved id of a field's control so `focusOnError` can target it. */
  registerFieldId: <K extends keyof Values>(name: K, id: string) => () => void;
}

export interface UseFormOptions<Values> {
  initialValues: Values;
  validate?: FormValidator<Values> | undefined;
  validateOn?: ValidateOn | undefined;
  validateOnMount?: boolean | undefined;
  enableReinitialize?: boolean | undefined;
  onSubmit?:
    | ((values: Values, helpers: FormHelpers<Values>) => void | Promise<void>)
    | undefined;
  onReset?: ((values: Values) => void) | undefined;
  /** After a failed submit, focus the first invalid field by `document.getElementById`. */
  focusOnError?: boolean | undefined;
}

export interface FormProps<Values>
  extends Omit<
    FormHTMLAttributes<HTMLFormElement>,
    'children' | 'onSubmit' | 'onReset' | 'noValidate'
  > {
  /** Initial form values. */
  initialValues: Values;
  /** Optional central validator. Field-level validators win on collision. */
  validate?: FormValidator<Values> | undefined;
  /** When validators fire. Default `'submit-and-blur'`. */
  validateOn?: ValidateOn | undefined;
  /** Run `validate` on mount. Default `false`. */
  validateOnMount?: boolean | undefined;
  /** Re-init the form when `initialValues` identity changes. Default `false` (footgun). */
  enableReinitialize?: boolean | undefined;
  /** Submit handler — receives `(values, helpers)`. Returning a promise sets `isSubmitting`. */
  onSubmit: (values: Values, helpers: FormHelpers<Values>) => void | Promise<void>;
  /** Optional reset hook. */
  onReset?: ((values: Values) => void) | undefined;
  /** After a failed submit, focus the first invalid control. Default `true`. */
  focusOnError?: boolean | undefined;
  /** Disable the browser's native HTML5 form validation (we own it). Default `true`. */
  noValidate?: boolean | undefined;
  /** React children OR a render-prop receiving the live `FormApi`. */
  children: ReactNode | ((form: FormApi<Values>) => ReactNode);
  ref?: Ref<HTMLFormElement>;
  sx?: Sx;
}

/**
 * Determines how `<FormField>` injects state into its child. Default is `'native'` for
 * native-event-shaped controls (`<Input>`, `<Textarea>`, plain `<input>`); pass `'checkbox'`
 * for boolean toggles (`<Checkbox>`, `<Switch>`), or `'value'` for value-callback controls
 * (`<Combobox>`, `<Select>`, `<Rating>`, `<TagsInput>`, `<Slider>`).
 */
export type FormFieldBinding = 'native' | 'checkbox' | 'value';

export interface FormFieldProps<K extends string = string>
  extends Omit<FieldProps, 'children' | 'error' | 'name' | 'htmlFor'> {
  /** The form key this Field binds to. Must exist on `initialValues`. */
  name: K;
  /**
   * How the child control accepts state. Default `'native'`.
   *
   *  - `'native'` — wires `value` + `onChange(event)` + `onBlur(event)`. Works with `<Input>`,
   *    `<Textarea>`, `<NumberInput>`, plain `<input>` / `<select>` / `<textarea>`.
   *  - `'checkbox'` — wires `checked` + `onCheckedChange(boolean)` (preferring `onCheckedChange`
   *    if the child has it, falling back to native `onChange`). Use for `<Checkbox>` / `<Switch>`.
   *  - `'value'` — wires `value` + `onChange(value)` (value-callback shape). Use for
   *    `<Combobox>` / `<Select>` / `<Rating>` / `<TagsInput>` / `<Slider>` / `<RadioGroup>`.
   */
  binding?: FormFieldBinding | undefined;
  /** Per-field sync validator. Returns error string, `null` for valid. */
  validate?: FieldValidator<unknown, Record<string, unknown>> | undefined;
  /** Per-field async validator. Aborted + debounced; latest call wins. */
  validateAsync?:
    | ((value: unknown, ctx: { signal: AbortSignal }) => Promise<string | null | undefined>)
    | undefined;
  /** Debounce window for `validateAsync`. Default `300`. */
  validateDebounceMs?: number | undefined;
  /** Single child — the inner form control. */
  children: ReactNode;
}
