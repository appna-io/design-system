import { deriveDirty } from './deriveDirty';
import type { FormErrors, FormFlags, FormState } from './Form.types';

export type FormAction<Values> =
  | { type: 'SET_FIELD_VALUE'; name: keyof Values; value: Values[keyof Values] }
  | { type: 'SET_VALUES'; values: Partial<Values> }
  | { type: 'SET_FIELD_ERROR'; name: keyof Values; error: string | undefined }
  | { type: 'SET_ERRORS'; errors: FormErrors<Values> }
  | { type: 'MERGE_ERRORS'; errors: FormErrors<Values> }
  | { type: 'SET_FIELD_TOUCHED'; name: keyof Values; touched: boolean }
  | { type: 'SET_TOUCHED'; touched: FormFlags<Values> }
  | { type: 'TOUCH_ALL' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_END' }
  | { type: 'RESET'; values: Values };

/**
 * The single reducer driving every form state transition. Kept pure (no side effects, no
 * timers, no fetches) so it's trivially unit-testable in isolation and so React 18's strict
 * mode double-invocation behaves identically across renders.
 *
 * `isValid` / `isDirty` are derived on every reduce so consumers don't need to memo them at
 * the call site.
 */
export function formReducer<Values>(
  state: FormState<Values>,
  action: FormAction<Values>,
): FormState<Values> {
  switch (action.type) {
    case 'SET_FIELD_VALUE': {
      const values = {
        ...(state.values as Record<string, unknown>),
        [action.name as string]: action.value,
      } as Values;
      const dirty = deriveDirty(values, state.initialValues);
      return {
        ...state,
        values,
        dirty,
        isDirty: Object.keys(dirty).length > 0,
      };
    }
    case 'SET_VALUES': {
      const values = {
        ...(state.values as Record<string, unknown>),
        ...(action.values as Record<string, unknown>),
      } as Values;
      const dirty = deriveDirty(values, state.initialValues);
      return {
        ...state,
        values,
        dirty,
        isDirty: Object.keys(dirty).length > 0,
      };
    }
    case 'SET_FIELD_ERROR': {
      const errors = { ...state.errors };
      if (action.error) (errors as Record<string, string>)[action.name as string] = action.error;
      else delete (errors as Record<string, string>)[action.name as string];
      return { ...state, errors, isValid: hasNoErrors(errors) };
    }
    case 'SET_ERRORS': {
      return { ...state, errors: action.errors, isValid: hasNoErrors(action.errors) };
    }
    case 'MERGE_ERRORS': {
      const errors = { ...state.errors };
      for (const [k, v] of Object.entries(action.errors as object)) {
        if (v) (errors as Record<string, string>)[k] = v as string;
        else delete (errors as Record<string, string>)[k];
      }
      return { ...state, errors, isValid: hasNoErrors(errors) };
    }
    case 'SET_FIELD_TOUCHED': {
      const touched = { ...state.touched } as FormFlags<Values>;
      if (action.touched) (touched as Record<string, boolean>)[action.name as string] = true;
      else delete (touched as Record<string, boolean>)[action.name as string];
      return { ...state, touched };
    }
    case 'SET_TOUCHED': {
      return { ...state, touched: action.touched };
    }
    case 'TOUCH_ALL': {
      const touched: FormFlags<Values> = {};
      for (const key of Object.keys(state.values as object)) {
        (touched as Record<string, boolean>)[key] = true;
      }
      return { ...state, touched };
    }
    case 'SUBMIT_START': {
      return { ...state, isSubmitting: true, submitCount: state.submitCount + 1 };
    }
    case 'SUBMIT_END': {
      return { ...state, isSubmitting: false };
    }
    case 'RESET': {
      return {
        values: action.values,
        initialValues: action.values,
        errors: {},
        touched: {},
        dirty: {},
        isSubmitting: false,
        submitCount: 0,
        isValid: true,
        isDirty: false,
      };
    }
    default:
      return state;
  }
}

function hasNoErrors<Values>(errors: FormErrors<Values>): boolean {
  for (const v of Object.values(errors as object)) {
    if (v) return false;
  }
  return true;
}

export function initialFormState<Values>(initialValues: Values): FormState<Values> {
  return {
    values: initialValues,
    initialValues,
    errors: {},
    touched: {},
    dirty: {},
    isSubmitting: false,
    submitCount: 0,
    isValid: true,
    isDirty: false,
  };
}