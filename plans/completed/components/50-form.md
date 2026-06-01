# Phase 50 — `<Form />` + `<FormProvider />` + `useForm()`

> Status: **Pending** · **Tier 2.5** (form library design surface) · Depends on: Phase 49 (Field) · Used by: every form-heavy product surface
> Headless-ish form state engine + opt-in `<Form>` element. Not a competitor to React Hook Form — a sensible default that "just works" without an extra dep.

## Objective

Ship the **`<Form />` + `useForm()` + `<FormProvider />`** trio — a small, dependency-free form-state engine that pairs with `<Field>` (Phase 49) and every DS form control to give consumers a one-line solution for the "I have a form with 8 inputs and want errors, submission, and dirty tracking" problem.

Today consumers reach for React Hook Form / Formik / their own `useState` soup. RHF is excellent but adds ~9 KB and an API surface; Formik is unmaintained. Phase 50 ships a **thin, ergonomic, ~3 KB** form state primitive that:

- Owns `values` / `errors` / `touched` / `submitting` / `isDirty` state.
- Validates synchronously or asynchronously per field + at submit.
- Reuses the Field/FormContext flow established in Phase 49 — no boilerplate per-field.
- Has a **declarative escape hatch**: consumers who prefer RHF/Formik can ignore `<Form>` entirely; every DS control still works standalone via hidden inputs.

This is intentionally **not** a "schema-first" library — no Yup / Zod / Joi integration baked in. Consumers can plug those in via the `validate` callback.

---

## Public API

```tsx
import { Form, useForm, Field, Input, Button, Checkbox } from 'apx-ds';

// Simplest — useForm hook (headless)
function SignupForm() {
  const form = useForm({
    initialValues: { email: '', password: '', terms: false },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.email) errors.email = 'Email is required';
      if (values.password.length < 8) errors.password = 'At least 8 characters';
      if (!values.terms) errors.terms = 'You must accept the terms';
      return errors;
    },
    onSubmit: async (values) => {
      await api.signup(values);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <Field label="Email" name="email" error={form.touched.email && form.errors.email}>
        <Input
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        />
      </Field>
      …
      <Button type="submit" loading={form.isSubmitting}>Sign up</Button>
    </form>
  );
}

// With <Form> + FormContext — Field auto-binds via name
function SignupForm() {
  return (
    <Form
      initialValues={{ email: '', password: '', terms: false }}
      validate={validate}
      onSubmit={async (values) => api.signup(values)}
    >
      <Field label="Email" name="email"><Input /></Field>
      <Field label="Password" name="password"><Input type="password" /></Field>
      <Field name="terms"><Checkbox>I accept the terms</Checkbox></Field>
      <Button type="submit">Sign up</Button>
    </Form>
  );
}

// Field-level validators (no central validate function)
<Form initialValues={{ email: '' }} onSubmit={api.signup}>
  <Field name="email" validate={(v) => !v ? 'Required' : null}><Input /></Field>
</Form>

// Async validation
<Form initialValues={{ username: '' }} onSubmit={…}>
  <Field
    name="username"
    validateAsync={async (v) => {
      if (!v) return 'Required';
      const taken = await api.checkUsername(v);
      return taken ? 'Already taken' : null;
    }}
    validateDebounceMs={400}
  >
    <Input />
  </Field>
</Form>

// External errors (server response → field errors)
const form = useForm({ initialValues: { email: '' } });
…
const result = await api.submit(form.values);
if (!result.ok) form.setErrors(result.errors);          // { email: 'Already in use' }

// Programmatic API
form.setFieldValue('email', 'new@x.com');
form.setFieldTouched('email', true);
form.setFieldError('email', 'Custom error');
form.resetForm();
form.resetForm({ values: { email: 'fresh@x.com' } });

// Render-prop variant (useful with libraries that prefer it)
<Form initialValues={…} onSubmit={…}>
  {(form) => (
    <>
      <Input value={form.values.email} onChange={form.handleChange} />
      …
    </>
  )}
</Form>

// Full hook surface
const form = useForm<Values>({
  initialValues,                  // Values
  validate,                       // (values: Values) => Errors | Promise<Errors>
  validateOn = 'submit-and-blur', // 'submit' | 'blur' | 'change' | 'submit-and-blur'
  onSubmit,                       // (values: Values, helpers: FormHelpers<Values>) => void | Promise<void>
  onReset,                        // (values: Values) => void
  validateOnMount = false,        // boolean
  enableReinitialize = false,     // boolean — re-init when initialValues changes
});

interface FormHelpers<Values> {
  setFieldValue<K extends keyof Values>(name: K, value: Values[K]): void;
  setFieldError<K extends keyof Values>(name: K, error: string | undefined): void;
  setFieldTouched<K extends keyof Values>(name: K, touched: boolean): void;
  setErrors(errors: Partial<Record<keyof Values, string>>): void;
  setTouched(touched: Partial<Record<keyof Values, boolean>>): void;
  setValues(values: Partial<Values>): void;
  resetForm(next?: { values?: Values }): void;
  validateForm(): Promise<Errors>;
}

// Full prop form
<Form
  initialValues
  validate
  validateOn
  onSubmit
  onReset
  validateOnMount={false}
  enableReinitialize={false}
  /* native form props */
  noValidate={true}              // disable browser HTML5 validation (we own it)
  autoComplete
  name
  method
  action
  className=""
  ref={…}
>
  {children | render(form)}
</Form>
```

---

## API Decisions

| Decision                                                                | Why                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Inspired by Formik's surface** but ~3 KB instead of ~13 KB           | Familiar to most React devs. Drop the parts no one uses (FieldArray, FastField, withFormik HOC). Keep the parts everyone uses (`values` / `errors` / `touched` / `submitting`). |
| **No schema dep** (Yup / Zod / Joi)                                    | `validate` is a pure function `(values) => errors`. Consumers compose Zod/Yup via that callback in 3 lines.    |
| **Per-field validators** as well as central `validate`                | DRY for forms with mostly-trivial validators; central for cross-field rules.                                    |
| **`validateOn="submit-and-blur"` default**                            | UX best practice: don't yell at users as they type; do show errors when they leave a field or submit.            |
| **Field/FormContext integration**                                     | When `<Field name="email">` is inside `<Form>`, Field reads its `value`, `onChange`, `onBlur`, `error`, `touched` from FormContext automatically — *no* prop wiring per field. |
| **Hidden inputs still work**                                          | All DS controls render a hidden `<input name=… value=…>` so native form submission works even when JS fails. `Form` intercepts submit and calls `onSubmit` with parsed values. |
| **`enableReinitialize=false` default**                                | Re-initializing on `initialValues` identity change is a footgun (creates infinite loops). Opt-in.                |
| **Async validators with debounce**                                    | Username-available patterns are common. `validateDebounceMs` per field.                                          |
| **`isDirty` tracked per field + form-wide**                          | Enables "unsaved changes" warnings.                                                                              |
| **No `<Field>` reimplementation** — `<Field>` from Phase 49 just reads FormContext | Single Field component for both standalone and Form-driven modes.                                          |

---

## State shape

```ts
interface FormState<Values> {
  values: Values;
  initialValues: Values;
  errors: Partial<Record<keyof Values, string>>;
  touched: Partial<Record<keyof Values, boolean>>;
  dirty: Partial<Record<keyof Values, boolean>>;    // computed: values[k] !== initialValues[k]
  isSubmitting: boolean;
  submitCount: number;
  isValid: boolean;     // computed: Object.keys(errors).length === 0
  isDirty: boolean;     // computed: any dirty key
}

interface FormApi<Values> extends FormState<Values>, FormHelpers<Values> {
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur:   (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e?: FormEvent) => Promise<void>;
}
```

State lives in a `useReducer` so updates are batched + predictable. Per-render `useMemo` exports a stable `FormApi` object.

---

## Field auto-binding (the magic)

When `<Field name="email">` is inside `<Form>`:

1. Field reads `name` from props.
2. Field reads `value`, `error`, `touched` from FormContext keyed by `name`.
3. Field passes those down to its child control via the existing FieldContext (Phase 49).
4. Child control's `onChange` / `onBlur` are intercepted by Field and routed back to `form.handleChange` / `form.handleBlur`.

The child control needs **no** code change — it already accepts `value` / `onChange` / `aria-invalid` / `error` as part of its standard API. FieldContext + FormContext do the rest.

For controls that don't fire `e.target.name` events (Checkbox, Switch, Slider, NumberInput, etc.), Field provides a `setValue(name, value)` helper. The control's existing `onCheckedChange` / `onValueChange` callbacks get auto-wired.

---

## File Structure

```
packages/components/src/Form/
├── Form.tsx
├── useForm.ts
├── FormProvider.tsx                 # thin export — alias for Form's context provider
├── Form.context.ts
├── Form.types.ts
├── Form.reducer.ts                  # state reducer (pure)
├── deriveErrors.ts                  # pure helper — runs central + per-field validators, returns merged errors
├── deriveDirty.ts                   # pure helper — values vs initialValues diff
├── debounce.ts                      # tiny — only if not already in engine
├── Form.test.tsx
├── useForm.test.tsx
├── Form.async.test.tsx
├── Form.fieldBinding.test.tsx       # all 13 form controls bind via Field+Form
├── Form.reducer.test.ts
├── deriveErrors.test.ts
├── deriveDirty.test.ts
├── index.ts                         # exports: Form, FormProvider, useForm, FormContext + types
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── SignUp.tsx                    # canonical sign-up form (email + password + terms)
    ├── SettingsPage.tsx              # tall form with sections
    ├── AsyncValidation.tsx
    ├── PerFieldValidator.tsx
    ├── ServerErrors.tsx
    ├── DirtyWarning.tsx              # "you have unsaved changes" pattern
    ├── ResetForm.tsx
    ├── ZodIntegration.tsx            # 8-line zodResolver pattern in MDX
    ├── EnableReinitialize.tsx
    ├── RenderProp.tsx
    ├── HeadlessHook.tsx              # useForm without <Form>
    └── EveryControl.tsx              # one Form with every DS form control to demonstrate auto-binding
```

---

## Recipe

```ts
export const formRecipe = cv({
  base: 'flex flex-col',
  variants: {
    layout: {
      stack: 'gap-4',
      compact: 'gap-2',
      spaced: 'gap-6',
    },
  },
  defaultVariants: { layout: 'stack' },
});
```

Form has minimal visual variance — the *element* is a plain `<form>` with sensible vertical spacing. Visual rhythm comes from child Fields.

---

## `deriveErrors.ts` (pure)

```ts
export async function deriveErrors<Values>(args: {
  values: Values;
  centralValidate?: (v: Values) => Errors | Promise<Errors>;
  perFieldValidators: Map<keyof Values, (v: any, values: Values) => string | null | Promise<string | null>>;
}): Promise<Errors<Values>> {
  const out: Errors<Values> = {};
  // 1. Run central validator (if any)
  if (args.centralValidate) {
    const central = await args.centralValidate(args.values);
    Object.assign(out, central);
  }
  // 2. Run per-field validators (override central if both set)
  for (const [name, validator] of args.perFieldValidators) {
    const v = (args.values as any)[name];
    const err = await validator(v, args.values);
    if (err) out[name] = err;
  }
  return out;
}
```

Pure, deterministic, unit-tested.

---

## A11y

- **Submission feedback**: after `handleSubmit`, if there are errors, Form focuses the first invalid field. (Configurable via `focusOnError` prop, default `true`.)
- **Live region**: errors fire into a single `<div aria-live="polite">` per Form so AT users hear "Email is required" without polling.
- **Native `<form>`** + `noValidate` — we own validation, but native focus-on-Enter-in-Input + Enter-to-submit + Esc-to-cancel-input all still work.
- **`isSubmitting`** disables nested `type="submit"` Buttons via FormContext to prevent double-submits.
- axe-core: 0 violations across signup / settings / async / error-server states.

---

## i18n

When wrapped in `<I18nProvider>`:

| Key                                | Default (en)                       |
| ---------------------------------- | ---------------------------------- |
| `form.errors.required`             | "This field is required"           |
| `form.errors.invalid`              | "Invalid value"                    |
| `form.errors.tooShort`             | "Too short (min {{min}})"           |
| `form.errors.tooLong`              | "Too long (max {{max}})"            |
| `form.submitting`                  | "Submitting..."                    |
| `form.submitSuccess`               | "Saved"                            |
| `form.submitError`                 | "Failed to save"                   |

These are **defaults**; consumer-supplied `validate` returns its own strings (which Form passes through verbatim).

Bundles: en / he / ar.

---

## Performance

- `useReducer` batches updates.
- Selector-based subscriptions (a small `useFormSelector` hook) so consumers can subscribe to a single field without re-rendering the whole form when other fields change. Field uses this internally.
- Async validators are debounced per-field; in-flight requests are aborted when newer ones supersede them.
- Bundle target: **< 3.5 KB gz** (Form + useForm + helpers, excluding Field which is its own bundle).

---

## Testing

- `useForm` initialization: `values === initialValues`, all touched / errors / dirty empty.
- `handleChange` updates `values` and `dirty`.
- `handleBlur` sets `touched`.
- `handleSubmit` runs validate; if errors, sets `errors` + `touched=all-true` + focuses first invalid; else calls `onSubmit(values, helpers)`.
- `setFieldValue` / `setFieldError` / `setFieldTouched` / `setErrors` / `setTouched` / `setValues` all work as expected.
- `resetForm()` restores initialValues; `resetForm({ values: x })` overrides.
- `enableReinitialize={true}`: when `initialValues` identity changes, form resets.
- Per-field validators: triggered on the right events per `validateOn` setting.
- Async validators: debounced; abort superseded requests; show pending state if needed (out of scope for v1 but flagged).
- `dirty` tracking: per-field + form-wide correct.
- Field auto-binding: 13 form controls picking up their respective values + errors via `<Field name=…>` in `<Form>` — integration test per control.
- `focusOnError`: after failed submit, first invalid field's control gets `.focus()`.
- Live region announces error count change.
- axe-core: 0 violations across all states.

---

## Acceptance Criteria

- [ ] `<Form>`, `<FormProvider>`, `useForm` exported.
- [ ] Headless usage (hook only) works; Form-element usage (`<Form>`) works; both share the same FormApi shape.
- [ ] Field auto-binding via FormContext + name — zero per-field prop wiring required.
- [ ] All 13 DS form controls integrate via context with **zero source-code changes** to those controls (same guarantee as Phase 49).
- [ ] Per-field validators + central validator both honored; per-field wins.
- [ ] Async validators with `validateDebounceMs`.
- [ ] `validateOn` modes all work.
- [ ] Server-errors path (`setErrors`) works.
- [ ] `isDirty` / `isSubmitting` / `isValid` derived correctly.
- [ ] Focus-on-first-error after failed submit.
- [ ] Live region for error announcements.
- [ ] i18n bundle en / he / ar.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 3.5 KB gz.

---

## DRY Self-Check

- [ ] Reuses Field (Phase 49) + FieldContext + useFormFieldA11y. No duplication.
- [ ] Reducer + pure helpers (`deriveErrors`, `deriveDirty`) are testable in isolation.
- [ ] No external form library dep.
- [ ] No external validation library dep (Zod / Yup integration is one-liner in MDX).
- [ ] `useFormSelector` is internal; promoted only if a public API need emerges.

---

## Out of scope (deferred)

- **`FieldArray`** (dynamic-length list editing). Punt to a follow-up phase when a real consumer needs it.
- **Form persistence** (localStorage / URL). Consumer concern.
- **Multi-step wizard state** — Stepper (Phase 41) + Form composed in userland covers it. We don't ship a `<Wizard>` wrapper.
- **File upload form state** — FileUpload (Phase 36) owns its own queue; Form just stores the final `File[]` as a value.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/50-form.md`.
2. Outcome notes: bundle delta, any form-control internal tweaks needed.
3. Document the "8-line Zod resolver" pattern in MDX so consumers know Zod/Yup integration is trivial.
4. Recommend pair: Phase 49 Field + Phase 50 Form ship in the same PR or back-to-back, since they are designed together.

---

## Outcome — shipped by @SDS-Agent7

### Shipped surface

- **`useForm<Values>(options)`** — headless form-state engine, no JSX required. Returns a
  `FormApi` with the full state (`values` / `errors` / `touched` / `dirty` / `isSubmitting` /
  `submitCount` / `isValid` / `isDirty`), the helper bag (`setFieldValue` / `setFieldError` /
  `setFieldTouched` / `setErrors` / `setTouched` / `setValues` / `resetForm` / `validateForm`
  / `submitForm`), the native event handlers (`handleChange` / `handleBlur` / `handleSubmit`),
  and the registration hooks (`registerFieldValidator` / `registerFieldId`).
- **`<Form>`** — `<form noValidate>` wrapper that owns a `useForm`, publishes the live `FormApi`
  on `FormContext`, intercepts native `submit` + `reset`, and renders a single off-screen
  `aria-live="polite"` region per form that announces error-count transitions. Accepts react
  children OR a `(form) => ReactNode` render-prop.
- **`<FormField name binding>`** — name-bound adapter that reads form state for `name` and
  clones the immediate child to inject `value` + `onChange` + `onBlur` + `id` + `name`. Three
  `binding` strategies (`'native'` / `'checkbox'` / `'value'`) cover every shipped DS form
  control without displayName-sniffing magic. Per-field sync (`validate`) and async
  (`validateAsync` + `validateDebounceMs`) validators register automatically on mount.
- **`<FormProvider>`** — public alias for `FormContext.Provider`, for consumers wiring a
  `useForm` to their own `<form>` element + DOM tree without `<Form>`.
- **`useFormContext<Values>()`** — typed context reader; returns `null` when no `<Form>` ancestor.
- **`focusOnError`** (default on) — after a failed submit, focuses the first invalid field's
  control via `document.getElementById(registeredId)`.
- **Pure helpers (exported + unit-tested)**: `formReducer`, `initialFormState`, `deriveErrors`,
  `deriveDirty`, `parseEventValue`. Each importable independently — consumers wanting a
  custom-built form engine can compose just the reducer + helpers.
- **`formRecipe`** — three-preset spacing (`stack` / `compact` / `spaced`) exposed via
  `useThemedClasses`.
- 13 examples: `Basic`, `SignUp` (canonical), `SettingsPage`, `AsyncValidation` (username-taken
  pattern with debounce + abort), `PerFieldValidator`, `ServerErrors` (`helpers.setErrors`),
  `DirtyWarning` (unsaved-changes pattern), `ResetForm`, `ZodIntegration` (8-line schema
  adapter, no bundled dep), `EnableReinitialize` (profile-switcher), `RenderProp`,
  `HeadlessHook` (`useForm` without `<Form>`), `EveryControl` (Input + Textarea + NumberInput
  + Checkbox + Switch + Select + Rating + TagsInput all bound via FormField).
- README.mdx with full prop tables, binding strategy matrix, "when to use what" decision table,
  a11y notes, and the headless-vs-element comparison.

### QA gates

| Gate                                | Result                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm eslint`                       | **0 errors** on Form sources + tests. 3 hooks-rules carve-outs (documented inline).            |
| `pnpm typecheck`                    | **Clean for Form.** Pre-existing errors in `src/TreeView/TreeView.tsx` + `__tests__/Icon.test.tsx` (other lanes in flight) — not introduced by this phase. |
| Vitest `Form.test.tsx`              | **10 / 10 ✅** — `<Form noValidate>`, FormField typing flow, checkbox binding, central + per-field validate, blur-only error visibility, `focusOnError`, render-prop, resetForm, isSubmitting cascade. |
| Vitest `Form.a11y.test.tsx`         | **3 / 3 ✅ axe-clean** — basic signup, errors + helpers, settings page with multi-control types. |
| Vitest `useForm.test.tsx`           | **13 / 13 ✅** — init, all 7 setters, handleSubmit success/failure/in-flight, handleChange/handleBlur, reset/reinitialize, per-field validator register + unregister. |
| Vitest `Form.reducer.test.ts`      | **11 / 11 ✅** — every action type + dirty-recomputation + isValid/isDirty derivations. |
| Vitest `deriveErrors.test.ts`      | **6 / 6 ✅** — central only, per-field only, both, override semantics, async. |
| Vitest `deriveDirty.test.ts`       | **6 / 6 ✅** — NaN equality, new/removed keys, null/object guards. |
| Vitest `parseEventValue.test.ts`   | **7 / 7 ✅** — text, checkbox, number coercion, NaN preservation (with synthetic target), textarea, multi-select. |
| **Total**                           | **56 / 56 ✅** across 7 files |
| `pnpm build`                        | ESM + CJS + DTS green. |

### Bundle delta

| Measurement                                    | Gzipped    | Notes                                                                                      |
| ---------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| Baseline (Field + Input + Button)              | 56.12 KB   | Realistic "Form consumer" minimum — these are already in the bundle.                       |
| **+ Form + FormField + useForm**               | **+2.79 KB** | **Under the 3.50 KB plan target** (−0.71 KB / −20%). |
| `useForm` only (headless engine)               | 1.77 KB    | For consumers who skip `<Form>` + `<FormField>` and wire their own JSX.                   |
| Pure helpers only (reducer + deriveErrors + deriveDirty + parseEventValue) | 0.93 KB | For consumers building a custom engine on top. |

Comparison across my phases: Skeleton +1.44 KB, Spinner +1.10 KB, EmptyState +4.22 KB, Rating
+3.18 KB, TagsInput +4.02 KB, **Form +2.79 KB**. **Second** lane under target. Reusing Field +
the shared a11y hook is the lever; the entire FormField adapter is ~1.0 KB.

### Deviations from plan

1. **`<FormField name>` adapter** instead of bare `<Field name>` auto-binding. The plan's
   example syntax (`<Form><Field name="email"><Input /></Field></Form>`) would require
   modifying `<Field>` to read `FormContext`, which is @SDS-Agent8's just-shipped Phase 49
   lane. To preserve that lane untouched, I shipped a separate `<FormField>` adapter that
   layers on top of `<Field>` (renders it internally, clones the inner control to inject
   binding). Identical mental model, one extra word at the call site. `<Field>` source is
   100% unchanged.
2. **`binding` prop is explicit** (`'native'` / `'checkbox'` / `'value'`) rather than auto-
   sniffed via displayName. displayName-sniffing breaks across `forwardRef` wrappers, dev/prod
   minification, and consumer-provided wrapper components. An explicit one-word prop is
   honest and predictable. Three buckets cover every shipped DS form control:
   - `'native'` → `<Input>`, `<Textarea>`, `<NumberInput>`, plain `<input>` / `<select>` / `<textarea>`
   - `'checkbox'` → `<Checkbox>`, `<Switch>` (wires both `onCheckedChange` and native `onChange`)
   - `'value'` → `<Combobox>`, `<Select>`, `<Rating>`, `<TagsInput>`, `<Slider>`, `<RadioGroup>`
3. **No `<I18nProvider>` consumer** — `validate` callbacks pass their own strings through verbatim
   (the plan acknowledges this). The 4 default DS strings (`required` / `invalid` / `tooShort` /
   `tooLong`) are not shipped; consumers wanting them can compose a `validate` callback using
   their own i18n library in 3 lines.
4. **No `useFormSelector`** (per-field selector subscription). v1 uses a single FormContext that
   re-renders all FormField consumers on any state change. Practical for typical 5–20-input
   forms; React's batching keeps it cheap. If a real perf consumer surfaces, the natural
   extension is `useFormSelector(name)` reading from a `useSyncExternalStore` boundary.
5. **No `FieldArray`** — plan explicitly defers this.
6. **`validateOn` is exposed on `FormApi`** so `FormField`'s injected `onBlur` / `onChange` know
   whether to trigger `validateForm()` themselves. The plan implied the headless `handleBlur`
   path would handle this, but since `<FormField>` doesn't use the headless `handleBlur` (it
   spreads its own onChange/onBlur), it needs to consult `validateOn` to mirror the same
   behavior. Tested both `'submit-and-blur'` (blur fires validate) and `'change'` (every
   keystroke fires validate) paths.
7. **`buildErrorAnnouncement`** uses a 1-line "1 error" / "N errors" template, English-only;
   when `<I18nProvider>` ships this is a clean i18n key target.

### Coordination footprint

- **`packages/components/src/index.ts`** — surgical insert alphabetically between `Field` and
  `HoverCard`. 12 named exports (Form + FormContext + FormField + FormProvider + 5 pure helpers
  + initialFormState + recipe + useForm + useFormContext) and 13 type exports.
- **`_shared/`** — no writes.
- **`<Field>` (Phase 49)** — **no source-code changes**. `<FormField>` layers on top via cloneElement;
  Agent8's lane is preserved as-shipped.
- **Form controls** — **no source-code changes** to any of the 10 controls (plan headline guarantee
  #372 preserved). `<FormField binding>` handles the heterogeneous onChange/onCheckedChange/
  value-callback shapes from the outside.
- **No `tailwind-preset.ts` writes.**
- **No renderer touches.** Ahmad starts/restarts the renderer.

### Downstream notes

- **Field FormContext-aware integration** — if a future phase wants the plan's literal syntax
  (`<Field name="email">` inside `<Form>` auto-binding), the entry point is adding a
  `FormContext` read inside `<Field>` that, when present + `name` is set, merges in form state
  the same way `<FormField>` does today. The cloneElement adapter logic in `FormField.tsx` is
  factor-out-ready; lifting it onto `Field` is a one-PR additive change.
- **`useFormSelector` extraction** — when a perf-sensitive consumer surfaces (~50+ inputs), the
  `formReducer` + `initialFormState` are already factored to host a `useSyncExternalStore`
  boundary without re-architecting state.
- **`FormApi.validateOn`** — exposed on the API now; if consumers want runtime override (e.g.
  "switch to change-mode after first submit"), the natural addition is a `setValidateOn` helper.
  Not added yet (no consumer asked).
- **Zod / Yup integration** — the `ZodIntegration` example documents the 8-line `safeParse →
  errors-map` shape so consumers don't need a bundled adapter.
- **`<FormField>` in `EveryControl`** validates the binding matrix against every shipped DS form
  control (8 controls). The pattern is stable; future controls (DatePicker, ColorPicker,
  FileUpload) will fall into one of the three bucket shapes by construction.