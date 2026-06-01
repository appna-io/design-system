import { describe, expect, it } from 'vitest';

import { formReducer, initialFormState } from '../src/Form/Form.reducer';

interface V extends Record<string, unknown> {
  a: string;
  b: number;
}

const initial: V = { a: '', b: 0 };

describe('formReducer', () => {
  it('initialFormState seeds empty errors/touched/dirty + isValid=true', () => {
    const s = initialFormState(initial);
    expect(s.values).toEqual(initial);
    expect(s.initialValues).toEqual(initial);
    expect(s.errors).toEqual({});
    expect(s.touched).toEqual({});
    expect(s.dirty).toEqual({});
    expect(s.isValid).toBe(true);
    expect(s.isDirty).toBe(false);
    expect(s.isSubmitting).toBe(false);
    expect(s.submitCount).toBe(0);
  });

  it('SET_FIELD_VALUE updates value + marks key dirty', () => {
    const s0 = initialFormState(initial);
    const s1 = formReducer<V>(s0, { type: 'SET_FIELD_VALUE', name: 'a', value: 'hi' });
    expect(s1.values.a).toBe('hi');
    expect(s1.dirty.a).toBe(true);
    expect(s1.isDirty).toBe(true);
  });

  it('SET_FIELD_VALUE back to initial clears dirty flag', () => {
    const s0 = initialFormState({ a: 'x', b: 0 } as V);
    const s1 = formReducer<V>(s0, { type: 'SET_FIELD_VALUE', name: 'a', value: 'y' });
    const s2 = formReducer<V>(s1, { type: 'SET_FIELD_VALUE', name: 'a', value: 'x' });
    expect(s2.dirty).toEqual({});
    expect(s2.isDirty).toBe(false);
  });

  it('SET_VALUES merges partial', () => {
    const s0 = initialFormState(initial);
    const s1 = formReducer<V>(s0, { type: 'SET_VALUES', values: { a: 'hi' } });
    expect(s1.values).toEqual({ a: 'hi', b: 0 });
  });

  it('SET_FIELD_ERROR sets + clears via undefined', () => {
    const s0 = initialFormState(initial);
    const s1 = formReducer<V>(s0, { type: 'SET_FIELD_ERROR', name: 'a', error: 'bad' });
    expect(s1.errors.a).toBe('bad');
    expect(s1.isValid).toBe(false);
    const s2 = formReducer<V>(s1, { type: 'SET_FIELD_ERROR', name: 'a', error: undefined });
    expect(s2.errors).toEqual({});
    expect(s2.isValid).toBe(true);
  });

  it('SET_ERRORS replaces the entire error map', () => {
    const s0 = formReducer<V>(initialFormState(initial), {
      type: 'SET_FIELD_ERROR',
      name: 'a',
      error: 'one',
    });
    const s1 = formReducer<V>(s0, { type: 'SET_ERRORS', errors: { b: 'two' } });
    expect(s1.errors).toEqual({ b: 'two' });
    expect(s1.isValid).toBe(false);
  });

  it('MERGE_ERRORS preserves untouched keys', () => {
    const s0 = formReducer<V>(initialFormState(initial), {
      type: 'SET_ERRORS',
      errors: { a: 'a-err', b: 'b-err' },
    });
    const s1 = formReducer<V>(s0, { type: 'MERGE_ERRORS', errors: { b: undefined } });
    expect(s1.errors).toEqual({ a: 'a-err' });
  });

  it('SET_FIELD_TOUCHED toggles a single key', () => {
    const s0 = initialFormState(initial);
    const s1 = formReducer<V>(s0, { type: 'SET_FIELD_TOUCHED', name: 'a', touched: true });
    expect(s1.touched.a).toBe(true);
    const s2 = formReducer<V>(s1, { type: 'SET_FIELD_TOUCHED', name: 'a', touched: false });
    expect(s2.touched).toEqual({});
  });

  it('TOUCH_ALL touches every key in values', () => {
    const s = formReducer<V>(initialFormState(initial), { type: 'TOUCH_ALL' });
    expect(s.touched).toEqual({ a: true, b: true });
  });

  it('SUBMIT_START / SUBMIT_END toggle isSubmitting + bump submitCount once', () => {
    const s0 = initialFormState(initial);
    const s1 = formReducer<V>(s0, { type: 'SUBMIT_START' });
    expect(s1.isSubmitting).toBe(true);
    expect(s1.submitCount).toBe(1);
    const s2 = formReducer<V>(s1, { type: 'SUBMIT_END' });
    expect(s2.isSubmitting).toBe(false);
    expect(s2.submitCount).toBe(1);
  });

  it('RESET clears every field', () => {
    let s = initialFormState(initial);
    s = formReducer<V>(s, { type: 'SET_FIELD_VALUE', name: 'a', value: 'x' });
    s = formReducer<V>(s, { type: 'SET_FIELD_ERROR', name: 'a', error: 'bad' });
    s = formReducer<V>(s, { type: 'SET_FIELD_TOUCHED', name: 'a', touched: true });
    s = formReducer<V>(s, { type: 'SUBMIT_START' });
    const s2 = formReducer<V>(s, { type: 'RESET', values: { a: 'reset', b: 0 } });
    expect(s2.values).toEqual({ a: 'reset', b: 0 });
    expect(s2.errors).toEqual({});
    expect(s2.touched).toEqual({});
    expect(s2.dirty).toEqual({});
    expect(s2.isSubmitting).toBe(false);
    expect(s2.submitCount).toBe(0);
    expect(s2.isValid).toBe(true);
    expect(s2.isDirty).toBe(false);
  });
});