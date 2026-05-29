'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
} from 'react';

import { deriveErrors } from './deriveErrors';
import { formReducer, initialFormState, type FormAction } from './Form.reducer';
import { parseEventValue } from './parseEventValue';
import type {
  FieldValidator,
  FormApi,
  FormErrors,
  FormFlags,
  FormHelpers,
  FormState,
  UseFormOptions,
} from './Form.types';

/**
 * Headless form state engine. Pairs with `<Form>` + `<FormField>` for the JSX-friendly path,
 * but works standalone for consumers who prefer "I'll wire everything by hand."
 *
 * Architecture:
 *
 * - All state lives in a `useReducer` (see `Form.reducer.ts`). Reducer is pure → unit-testable.
 * - Per-field validators are registered into a `Map` via `registerFieldValidator(name, fn)` so
 *   `<FormField validate>` can attach + unregister on mount/unmount. The Map ref is captured at
 *   each `deriveErrors` call to snapshot the validator set.
 * - Async per-field validators (`<FormField validateAsync>`) live alongside the sync map. Each
 *   field gets its own AbortController so superseded calls are dropped; debounce window is per
 *   `<FormField>`.
 * - `handleSubmit` is intentionally `async`. It calls `validateForm`, sets `touched=all`, dispatches
 *   `SUBMIT_START` / `SUBMIT_END` around `onSubmit`, and triggers `focusOnError` when configured.
 * - `registerFieldId(name, id)` lets `<FormField>` publish its control's resolved id so
 *   `focusOnError` can target the right DOM node after a failed submit.
 */
export function useForm<Values extends Record<string, unknown>>(
  options: UseFormOptions<Values>,
): FormApi<Values> {
  const {
    initialValues,
    validate,
    validateOn = 'submit-and-blur',
    validateOnMount = false,
    enableReinitialize = false,
    onSubmit,
    onReset,
    focusOnError = true,
  } = options;

  const [state, dispatch] = useReducer(
    formReducer as (
      state: FormState<Values>,
      action: FormAction<Values>,
    ) => FormState<Values>,
    initialFormState<Values>(initialValues),
  );

  const validatorsRef = useRef(new Map<keyof Values, FieldValidator<unknown, Values>>());
  const fieldIdsRef = useRef(new Map<keyof Values, string>());
  const stateRef = useRef(state);
  stateRef.current = state;

  // ----- Helpers ---------------------------------------------------------------------------

  const setFieldValue = useCallback(<K extends keyof Values>(name: K, value: Values[K]) => {
    dispatch({ type: 'SET_FIELD_VALUE', name, value });
  }, []);

  const setValues = useCallback((values: Partial<Values>) => {
    dispatch({ type: 'SET_VALUES', values });
  }, []);

  const setFieldError = useCallback(
    <K extends keyof Values>(name: K, error: string | undefined) => {
      dispatch({ type: 'SET_FIELD_ERROR', name, error });
    },
    [],
  );

  const setErrors = useCallback((errors: FormErrors<Values>) => {
    dispatch({ type: 'SET_ERRORS', errors });
  }, []);

  const setFieldTouched = useCallback(
    <K extends keyof Values>(name: K, touched: boolean) => {
      dispatch({ type: 'SET_FIELD_TOUCHED', name, touched });
    },
    [],
  );

  const setTouched = useCallback((touched: FormFlags<Values>) => {
    dispatch({ type: 'SET_TOUCHED', touched });
  }, []);

  const validateForm = useCallback(async (): Promise<FormErrors<Values>> => {
    const errors = await deriveErrors<Values>({
      values: stateRef.current.values,
      centralValidate: validate,
      perFieldValidators: validatorsRef.current,
    });
    dispatch({ type: 'SET_ERRORS', errors });
    return errors;
  }, [validate]);

  const resetForm = useCallback(
    (next?: { values?: Values }) => {
      const nextValues = next?.values ?? initialValues;
      dispatch({ type: 'RESET', values: nextValues });
      onReset?.(nextValues);
    },
    [initialValues, onReset],
  );

  // ----- Submit ----------------------------------------------------------------------------

  const handleSubmit = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      if (event && typeof event.preventDefault === 'function') event.preventDefault();
      dispatch({ type: 'TOUCH_ALL' });
      dispatch({ type: 'SUBMIT_START' });
      try {
        const errors = await validateForm();
        if (hasErrors(errors)) {
          if (focusOnError) focusFirstInvalid(errors, fieldIdsRef.current, stateRef.current.values);
          return;
        }
        if (onSubmit) {
          // Build helpers lazily, using the live API closure.
          await onSubmit(stateRef.current.values, buildHelpers());
        }
      } finally {
        dispatch({ type: 'SUBMIT_END' });
      }
    },
    // `buildHelpers` is intentionally read via the closure (it's only called once per submit
    // and itself memoizes the helpers object). Including it in deps would force handleSubmit
    // to re-create on every setter-stability ripple without changing behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validateForm, onSubmit, focusOnError],
  );

  const submitForm = useCallback(async () => {
    await handleSubmit();
  }, [handleSubmit]);

  // ----- Native input handlers --------------------------------------------------------------

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const name = event.target.name as keyof Values;
      if (!name) return;
      const value = parseEventValue(event) as Values[keyof Values];
      dispatch({ type: 'SET_FIELD_VALUE', name, value });
      if (validateOn === 'change') {
        // Fire-and-forget; consumers don't await this.
        void validateForm();
      }
    },
    [validateForm, validateOn],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const name = event.target.name as keyof Values;
      if (!name) return;
      dispatch({ type: 'SET_FIELD_TOUCHED', name, touched: true });
      if (validateOn === 'blur' || validateOn === 'submit-and-blur') {
        void validateForm();
      }
    },
    [validateForm, validateOn],
  );

  // ----- Field registration -----------------------------------------------------------------

  const registerFieldValidator = useCallback(
    <K extends keyof Values>(name: K, validator: FieldValidator<Values[K], Values>) => {
      validatorsRef.current.set(name, validator as FieldValidator<unknown, Values>);
      return () => {
        validatorsRef.current.delete(name);
      };
    },
    [],
  );

  const registerFieldId = useCallback(<K extends keyof Values>(name: K, id: string) => {
    fieldIdsRef.current.set(name, id);
    return () => {
      // Only delete if the id still matches — handles same-name remount races.
      if (fieldIdsRef.current.get(name) === id) fieldIdsRef.current.delete(name);
    };
  }, []);

  // ----- Reinitialize ----------------------------------------------------------------------

  const lastInitialValuesRef = useRef(initialValues);
  useEffect(() => {
    if (!enableReinitialize) return;
    if (Object.is(lastInitialValuesRef.current, initialValues)) return;
    lastInitialValuesRef.current = initialValues;
    dispatch({ type: 'RESET', values: initialValues });
  }, [enableReinitialize, initialValues]);

  // ----- Validate-on-mount ------------------------------------------------------------------

  const mountRanRef = useRef(false);
  useEffect(() => {
    if (mountRanRef.current) return;
    mountRanRef.current = true;
    if (validateOnMount) void validateForm();
  }, [validateOnMount, validateForm]);

  // ----- Public API --------------------------------------------------------------------------

  const helpersRef = useRef<FormHelpers<Values> | null>(null);
  const buildHelpers = useCallback((): FormHelpers<Values> => {
    if (!helpersRef.current) {
      helpersRef.current = {
        setFieldValue,
        setFieldError,
        setFieldTouched,
        setErrors,
        setTouched,
        setValues,
        resetForm,
        validateForm,
        submitForm,
      };
    }
    return helpersRef.current;
  }, [
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setErrors,
    setTouched,
    setValues,
    resetForm,
    validateForm,
    submitForm,
  ]);

  return useMemo<FormApi<Values>>(
    () => ({
      ...state,
      validateOn,
      handleChange,
      handleBlur,
      handleSubmit,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      setErrors,
      setTouched,
      setValues,
      resetForm,
      validateForm,
      submitForm,
      registerFieldValidator,
      registerFieldId,
    }),
    [
      state,
      validateOn,
      handleChange,
      handleBlur,
      handleSubmit,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      setErrors,
      setTouched,
      setValues,
      resetForm,
      validateForm,
      submitForm,
      registerFieldValidator,
      registerFieldId,
    ],
  );
}

function hasErrors<Values>(errors: FormErrors<Values>): boolean {
  for (const v of Object.values(errors as object)) {
    if (v) return true;
  }
  return false;
}

function focusFirstInvalid<Values>(
  errors: FormErrors<Values>,
  fieldIds: Map<keyof Values, string>,
  values: Values,
) {
  if (typeof document === 'undefined') return;
  // Field order in `values` is the canonical "first → last" ordering.
  for (const key of Object.keys(values as object)) {
    if (!(errors as Record<string, string>)[key]) continue;
    const id = fieldIds.get(key as keyof Values);
    if (!id) continue;
    const el = document.getElementById(id) as HTMLElement | null;
    if (el && typeof el.focus === 'function') {
      el.focus();
      return;
    }
  }
}
