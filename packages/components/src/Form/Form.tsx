'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useMemo, type ReactNode } from 'react';

import { FormContext } from './FormContext';
import { useForm } from './useForm';
import type { FormApi, FormProps } from './Form.types';
import { formRecipe } from './Form.recipe';

/**
 * `<Form>` — element-level convenience that owns a `useForm` instance and renders a native
 * `<form noValidate>` with `onSubmit` wired to `form.handleSubmit`. Publishes the live
 * `FormApi` on `FormContext` so `<FormField>` (and any consumer `useFormContext()`) can pick it
 * up without prop drilling.
 *
 * Two child shapes are accepted:
 *
 *   <Form initialValues={{...}} onSubmit={...}>
 *     <FormField name="email"><Input /></FormField>
 *     …
 *   </Form>
 *
 *   <Form initialValues={{...}} onSubmit={...}>
 *     {(form) => (
 *       <>
 *         <input value={form.values.email} onChange={form.handleChange} name="email" />
 *         <button disabled={form.isSubmitting}>Submit</button>
 *       </>
 *     )}
 *   </Form>
 *
 * The render-prop shape is the escape hatch for consumers who don't want `<FormField>`'s
 * cloneElement magic — they get the full `FormApi` and can spread `form.handleChange` etc.
 * manually.
 *
 * `<Form>` is intentionally **not** styled beyond a small `gap` rhythm — visual layout is
 * driven by the children (typically a stack of `<Field>` / `<FormField>` rows). The recipe is
 * exposed as `formRecipe` for consumers who want to opt into the spacing presets.
 */
export const FormImpl = forwardRef<HTMLFormElement, FormProps<Record<string, unknown>>>(
  function Form(props, ref) {
    const {
      initialValues,
      validate,
      validateOn,
      validateOnMount,
      enableReinitialize,
      onSubmit,
      onReset,
      focusOnError,
      noValidate = true,
      children,
      className,
      style,
      sx,
      ...rest
    } = props;

    const form = useForm<Record<string, unknown>>({
      initialValues,
      validate,
      validateOn,
      validateOnMount,
      enableReinitialize,
      onSubmit,
      onReset,
      focusOnError,
    });

    const { className: formClass, style: formStyle } = useThemedClasses({
      recipe: formRecipe,
      componentName: 'Form',
      slot: 'root',
      props: { className, sx, style },
    });

    const announcement = useMemo(
      () => buildErrorAnnouncement(form),
      // Re-derive only on observable transitions, not on the FormApi identity itself (which
      // is a fresh object every render).
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [form.errors, form.submitCount],
    );

    return (
      <FormContext.Provider value={form}>
        <form
          {...rest}
          ref={ref}
          noValidate={noValidate}
          onSubmit={form.handleSubmit}
          onReset={(event) => {
            event.preventDefault();
            form.resetForm();
          }}
          className={formClass}
          style={formStyle}
          data-submitting={form.isSubmitting || undefined}
          data-dirty={form.isDirty || undefined}
          data-invalid={!form.isValid || undefined}
        >
          {typeof children === 'function' ? (children as (form: FormApi<Record<string, unknown>>) => ReactNode)(form) : children}
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {announcement}
          </span>
        </form>
      </FormContext.Provider>
    );
  },
  'Form',
);

/**
 * Typed wrapper around `<FormImpl>` so consumers can write `<Form<MyValues>>` and get full
 * inference on `initialValues` / `onSubmit` / render-prop arg. The runtime implementation lives
 * in `FormImpl`; this is a typing-only re-cast (preserves the `displayName` and the ref-forwarding).
 */
export const Form = FormImpl as <Values extends Record<string, unknown>>(
  props: FormProps<Values> & { ref?: React.Ref<HTMLFormElement> },
) => React.ReactElement;

/** Re-exported under a friendlier name for consumers who pair `useForm` with their own `<form>`. */
export { FormContext as FormProvider } from './FormContext';

function buildErrorAnnouncement<Values>(form: FormApi<Values>): string {
  if (form.submitCount === 0) return '';
  const errorCount = Object.values(form.errors as object).filter(Boolean).length;
  if (errorCount === 0) return '';
  return errorCount === 1
    ? 'Form has 1 error. Please review the highlighted field.'
    : `Form has ${errorCount} errors. Please review the highlighted fields.`;
}
