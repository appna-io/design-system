import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useForm } from '../src/Form';

interface V extends Record<string, unknown> {
  email: string;
  age: number;
}

const initial: V = { email: '', age: 0 };

describe('useForm — initialization', () => {
  it('seeds values + everything else empty', () => {
    const { result } = renderHook(() => useForm<V>({ initialValues: initial }));
    expect(result.current.values).toEqual(initial);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitCount).toBe(0);
  });
});

describe('useForm — setters', () => {
  it('setFieldValue updates + dirty', () => {
    const { result } = renderHook(() => useForm<V>({ initialValues: initial }));
    act(() => result.current.setFieldValue('email', 'a@x.com'));
    expect(result.current.values.email).toBe('a@x.com');
    expect(result.current.isDirty).toBe(true);
  });

  it('setFieldTouched flips the flag', () => {
    const { result } = renderHook(() => useForm<V>({ initialValues: initial }));
    act(() => result.current.setFieldTouched('email', true));
    expect(result.current.touched.email).toBe(true);
  });

  it('setFieldError + setErrors', () => {
    const { result } = renderHook(() => useForm<V>({ initialValues: initial }));
    act(() => result.current.setFieldError('email', 'bad'));
    expect(result.current.errors.email).toBe('bad');
    expect(result.current.isValid).toBe(false);
    act(() => result.current.setErrors({}));
    expect(result.current.isValid).toBe(true);
  });
});

describe('useForm — handleSubmit', () => {
  it('runs validate; if no errors, calls onSubmit', async () => {
    const onSubmit = vi.fn(async () => undefined);
    const { result } = renderHook(() =>
      useForm<V>({
        initialValues: initial,
        validate: () => ({}),
        onSubmit,
      }),
    );
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const firstCall = onSubmit.mock.calls[0] as unknown as [V, unknown];
    expect(firstCall?.[0]).toEqual(initial);
    expect(result.current.submitCount).toBe(1);
  });

  it('on validation errors, touches all keys + does NOT call onSubmit', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm<V>({
        initialValues: initial,
        validate: () => ({ email: 'Required' }),
        onSubmit,
      }),
    );
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.touched.email).toBe(true);
    expect(result.current.touched.age).toBe(true);
    expect(result.current.errors.email).toBe('Required');
  });

  it('isSubmitting flips true during onSubmit', async () => {
    let resolveSubmit: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useForm<V>({ initialValues: initial, onSubmit }),
    );
    let submitDone: Promise<void> | undefined;
    await act(async () => {
      submitDone = result.current.handleSubmit();
      // yield so the start dispatch + onSubmit call run
      await Promise.resolve();
    });
    expect(result.current.isSubmitting).toBe(true);
    await act(async () => {
      resolveSubmit?.();
      await submitDone;
    });
    expect(result.current.isSubmitting).toBe(false);
  });
});

describe('useForm — handleChange / handleBlur', () => {
  it('handleChange writes value by name', () => {
    const { result } = renderHook(() => useForm<V>({ initialValues: initial }));
    const input = document.createElement('input');
    input.name = 'email';
    input.value = 'x@x.com';
    act(() => {
      result.current.handleChange({ target: input } as unknown as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.values.email).toBe('x@x.com');
  });

  it('handleBlur marks the field touched', () => {
    const { result } = renderHook(() => useForm<V>({ initialValues: initial }));
    const input = document.createElement('input');
    input.name = 'age';
    act(() => {
      result.current.handleBlur({ target: input } as unknown as React.FocusEvent<HTMLInputElement>);
    });
    expect(result.current.touched.age).toBe(true);
  });
});

describe('useForm — reset / reinitialize', () => {
  it('resetForm restores initialValues', () => {
    const { result } = renderHook(() => useForm<V>({ initialValues: initial }));
    act(() => result.current.setFieldValue('email', 'x'));
    act(() => result.current.resetForm());
    expect(result.current.values).toEqual(initial);
    expect(result.current.isDirty).toBe(false);
  });

  it('resetForm({ values }) overrides', () => {
    const { result } = renderHook(() => useForm<V>({ initialValues: initial }));
    act(() => result.current.resetForm({ values: { email: 'fresh@x.com', age: 99 } }));
    expect(result.current.values).toEqual({ email: 'fresh@x.com', age: 99 });
  });

  it('enableReinitialize=true resets when initialValues identity changes', () => {
    let iv: V = { email: 'a@x.com', age: 1 };
    const { result, rerender } = renderHook(
      ({ values }: { values: V }) =>
        useForm<V>({ initialValues: values, enableReinitialize: true }),
      { initialProps: { values: iv } },
    );
    expect(result.current.values.email).toBe('a@x.com');
    iv = { email: 'b@x.com', age: 2 };
    rerender({ values: iv });
    expect(result.current.values.email).toBe('b@x.com');
  });
});

describe('useForm — per-field validators', () => {
  it('registered per-field validator runs on validateForm', async () => {
    const { result } = renderHook(() => useForm<V>({ initialValues: initial }));
    let unregister: (() => void) | undefined;
    act(() => {
      unregister = result.current.registerFieldValidator('age', (value) =>
        Number(value) < 13 ? 'Too young' : null,
      );
    });
    let errors: Awaited<ReturnType<typeof result.current.validateForm>> = {};
    await act(async () => {
      errors = await result.current.validateForm();
    });
    expect(errors.age).toBe('Too young');
    act(() => unregister?.());
    await act(async () => {
      errors = await result.current.validateForm();
    });
    expect(errors.age).toBeUndefined();
  });
});