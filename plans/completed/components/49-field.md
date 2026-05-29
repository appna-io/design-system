# Phase 49 — `<Field />`

> Status: **✓ Completed** · **Tier 2** · Owner: SDS-Agent8 · Depends on: Phase 7 Input + 8 Textarea + 9 Checkbox + 10 Switch + 11 Radio + 23 Select + 28 Slider + 29 NumberInput + 33 DatePicker + 34 Combobox + 43 Rating + 47 ColorPicker + 48 TagsInput + the shared `useFormFieldA11y`
> Form-field composition wrapper that owns label + control + helper + error layout for **every** form control.

## Objective

Ship the **`<Field />`** composition primitive — the canonical wrapper that pairs a label, an optional description, a single form control (any DS form control), an optional helper text, and an optional error message.

Today every form control re-implements its own `label` + `description` + `helperText` + `error` prop surface via `useFormFieldA11y`. That's deliberate (each control can stand alone), but it means a form with 8 fields has 8 copies of label/helper/error rendering logic, and consumers can't easily:

- Swap label position (above vs. start-aligned vs. floating).
- Add a leading icon to every label.
- Drive label/control association from a higher-level Form's validation state.
- Compose a "label, optional badge, helper, control with adornments" pattern uniformly.

Phase 49 ships `<Field>` to **layer above** every form control and own the chrome, while each control stays usable standalone for power users who want to skip the wrapper.

---

## Public API

```tsx
import { Field, Input, Textarea, Checkbox, Switch, Select, DatePicker } from 'apx-ds';

// Basic — label + control + helper
<Field label="Email" helperText="We'll never share this">
  <Input type="email" name="email" />
</Field>

// With validation error
<Field label="Email" error={errors.email}>
  <Input type="email" name="email" />
</Field>

// Required + optional badge
<Field label="Full name" required>
  <Input name="name" />
</Field>

<Field label="Phone" optional>
  <Input name="phone" />
</Field>

// Label position variants
<Field label="Email" labelPosition="top">…</Field>          // default
<Field label="Email" labelPosition="start" labelWidth="120px">…</Field>   // horizontal "form row"
<Field label="Email" labelPosition="floating">…</Field>     // material-style floating label
<Field label="Email" labelPosition="hidden">…</Field>       // sr-only label

// With description (longer guidance above the control)
<Field
  label="API key"
  description="Issued from your account settings. Treat it like a password."
  helperText="Press Cmd+V to paste"
>
  <Input type="password" name="apiKey" />
</Field>

// Multiple controls inside one Field (compound radio / checkbox / switch group)
<Field label="Notifications" as="fieldset">
  <Field.Description>Choose how we contact you</Field.Description>
  <Stack gap={2}>
    <Checkbox name="notify-email">Email</Checkbox>
    <Checkbox name="notify-sms">SMS</Checkbox>
    <Checkbox name="notify-push">Push</Checkbox>
  </Stack>
</Field>

// Label with leading icon
<Field
  label={<><Icon name="mail" /> Email</>}
>
  <Input type="email" />
</Field>

// With trailing label badge
<Field label="Plan" labelAddon={<Badge color="success">Pro</Badge>}>
  <Select>…</Select>
</Field>

// Compound API (full control)
<Field>
  <Field.Label>Email</Field.Label>
  <Field.Description>Used for billing notifications</Field.Description>
  <Input type="email" />
  <Field.Helper>Lowercase only</Field.Helper>
  <Field.Error>{errors.email}</Field.Error>
</Field>

// Driven by Form context (when nested in <Form>) — see Phase 50
<Form values={values} errors={errors} touched={touched} onChange={…}>
  <Field name="email" label="Email">
    <Input />                          {/* name + value + onChange + aria + error all flow from Form */}
  </Field>
</Form>

// Full prop form
<Field
  /* label */
  label                          // ReactNode | undefined
  labelPosition="top"            // 'top' | 'start' | 'floating' | 'hidden'
  labelWidth                     // CSS length — only when labelPosition='start'
  labelAddon                     // ReactNode — trailing addon (badge, button)
  required={false}               // boolean — shows "*" red asterisk
  optional={false}               // boolean — shows "(optional)" muted text (mutually exclusive with required)

  /* texts */
  description                    // ReactNode — large hint above the control
  helperText                     // ReactNode — small hint below
  error                          // ReactNode — overrides helperText when present, sets aria-invalid

  /* control association (when not using a child control's own props) */
  htmlFor                        // string — id of the control inside; auto-generated when omitted
  name                           // string — propagated to the inner control via context

  /* shape */
  as="div"                       // 'div' | 'fieldset' — use 'fieldset' for multi-control groups
  size="md"                      // 'sm' | 'md' | 'lg' — propagates to control
  disabled={false}
  readOnly={false}
  hideRequiredIndicator={false}  // boolean — hide the asterisk even when required

  /* slots */
  startAdornment                 // ReactNode — visual icon/text BEFORE the control row
  endAdornment                   // ReactNode — visual icon/text AFTER the control row

  className=""
  style={{}}
  ref={…}
>
  {children}                      {/* the form control (and optional <Field.*> subcomponents) */}
</Field>

// Subcomponents (compound API)
<Field.Label />
<Field.Description />
<Field.Helper />                 // alias: HelperText
<Field.Error />
<Field.Control />                // optional explicit slot marker — useful with start/end adornments
```

---

## API Decisions

| Decision                                                                | Why                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Field is a *wrapper*, not a *fork* of each form control**           | Form controls keep their `label`/`error`/etc. props for standalone use; Field's same-named props win when present and propagate to the inner control via context. |
| **Single canonical association strategy**                              | Field generates an `id`, the inner control reads it from context (replacing its own `id` only when not set), and `<label htmlFor>` + `aria-describedby` + `aria-invalid` all wire up automatically. |
| **`labelPosition="floating"`**                                        | Material-style floating label — the label visually overlaps the control border when empty + collapses up on focus / value. Implemented purely with CSS `:placeholder-shown` + transform; no JS. |
| **`labelPosition="start"` is the horizontal row form**                | Settings pages, admin forms. `labelWidth` gives consumers a consistent gutter.                                  |
| **`required` shows `*`; `optional` shows "(optional)"**               | A11y best practice: the `*` is `aria-hidden`, and the required state is communicated via `aria-required` on the control. Mutually exclusive. |
| **`as="fieldset"` for grouped controls**                              | When `<Field>` contains a Radio group, Checkbox group, or multiple toggles, rendering as `<fieldset>` with `<legend>` is the correct semantics; Field auto-routes the Label into a `<legend>`. |
| **No internal form state**                                            | Field is presentational. Form state lives in `<Form>` (Phase 50) or the consumer's state. Field reads from FormContext when present (via `name`). |
| **`description` (long) vs. `helperText` (short)**                     | Description sits above the control (between label and input), helper sits below. Different visual roles, different `aria-describedby` order. Optional both. |
| **`error` overrides `helperText`**                                    | Common UX pattern: when the field is invalid, replace the helper with the error. Visually red, screen-reader-announced. |
| **Compound subcomponents available** for full control                | Power users + custom layouts. Default is prop-driven for the 90% case.                                          |
| **`startAdornment` + `endAdornment` at field-level**                  | Visual icons/buttons inline with the control — but at the Field level (so they participate in label association), not embedded inside the control. |

---

## Internal architecture

```
                       ┌──────────────────────────────────────────────┐
   props ─────────────►│  Field generates: id, descId, helperId, errId │
                       │  Owns FieldContext with all derived values    │
                       └──────────────────────────────────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────────────┐
                       │  Renders:                                     │
                       │   <Field.Label htmlFor=id>{label}</Field.Label>│
                       │   <Field.Description>{desc}</Field.Description>│
                       │   {startAdornment} {children} {endAdornment} │
                       │   <Field.Helper> OR <Field.Error>             │
                       └──────────────────────────────────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────────────┐
                       │  Inner control reads FieldContext:           │
                       │   id (if not set), name, disabled, readOnly, │
                       │   required, invalid, describedBy             │
                       │  Inner control's own props WIN when set       │
                       └──────────────────────────────────────────────┘
```

`useFormFieldA11y` (the existing shared helper) gains a Field-aware code path that reads from FieldContext when present, falling back to local props otherwise. This is the **single integration point** — no per-control changes.

---

## File Structure

```
packages/components/src/Field/
├── Field.tsx
├── Field.Label.tsx
├── Field.Description.tsx
├── Field.Helper.tsx
├── Field.Error.tsx
├── Field.Control.tsx
├── Field.context.ts                 # FieldContextValue
├── Field.types.ts
├── Field.recipe.ts
├── useFieldIds.ts                    # generates id/descId/helperId/errorId
├── Field.test.tsx
├── Field.a11y.test.tsx
├── Field.compound.test.tsx
├── Field.contextIntegration.test.tsx # verifies each form control picks up FieldContext correctly
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── WithError.tsx
    ├── Required.tsx
    ├── Optional.tsx
    ├── LabelPositionStart.tsx
    ├── LabelPositionFloating.tsx
    ├── LabelHidden.tsx
    ├── WithDescription.tsx
    ├── WithHelper.tsx
    ├── WithLabelIcon.tsx
    ├── WithLabelAddon.tsx
    ├── WithStartEndAdornment.tsx
    ├── Fieldset.tsx               # multiple checkboxes / radios
    ├── Compound.tsx
    ├── Disabled.tsx
    ├── ReadOnly.tsx
    ├── Sizes.tsx
    ├── EveryControl.tsx           # 13 form controls all wrapped in Field
    └── InForm.tsx                 # nested in <Form> (Phase 50)
```

---

## Floating label mechanics

Pure CSS via `:placeholder-shown` (no JS state):

```css
.sds-field-floating .sds-field-label {
  position: absolute;
  inset-inline-start: 0.75rem;
  inset-block-start: 0.5rem;
  transform-origin: inset-start top;
  transition: transform 150ms, color 150ms;
}

.sds-field-floating .sds-field-control:not(:placeholder-shown) ~ .sds-field-label,
.sds-field-floating .sds-field-control:focus ~ .sds-field-label {
  transform: translateY(-1rem) scale(0.85);
  color: var(--sds-color-accent-emphasis);
}
```

Requires the inner control to support a placeholder (Input, Textarea, NumberInput, Combobox); falls back to top-positioned label for controls that don't (Checkbox, Switch, Slider).

Dev warning when `labelPosition="floating"` is used with an unsupported control.

---

## Recipe sketch

```ts
export const fieldRecipe = cv({
  base: 'flex flex-col gap-1.5 min-w-0 w-full',
  variants: {
    size: {
      sm: 'gap-1 text-xs',
      md: 'gap-1.5 text-sm',
      lg: 'gap-2 text-base',
    },
    labelPosition: {
      top: 'flex-col',
      start: 'flex-row items-start gap-3',
      floating: 'relative gap-0',
      hidden: 'flex-col',
    },
    disabled: { true: 'opacity-50 cursor-not-allowed', false: '' },
  },
  defaultVariants: { size: 'md', labelPosition: 'top', disabled: false },
});

export const fieldLabelRecipe = cv({
  base: 'inline-flex items-center gap-1 font-medium text-(--sds-color-text-default)',
  variants: {
    invalid: { true: 'text-(--sds-color-danger-emphasis)', false: '' },
    hidden:  { true: 'sr-only', false: '' },
  },
});

export const fieldHelperRecipe = cv({
  base: 'text-xs text-(--sds-color-text-muted)',
});

export const fieldErrorRecipe = cv({
  base: 'text-xs text-(--sds-color-danger-emphasis) inline-flex items-center gap-1',
});
```

---

## A11y

- **Label association**: `<label htmlFor={id}>` ↔ inner control `id={id}`. When the inner control is a complex composite (e.g. Combobox with input + listbox), the label is still associated to the visible control.
- **`fieldset` + `legend`** when `as="fieldset"`: label becomes the legend; `aria-labelledby` not needed (browser native).
- **`aria-describedby`**: composed from description id + helper id + error id (whichever are present), order: description → helper/error.
- **`aria-invalid`**: `true` when `error` is non-falsy.
- **`aria-required`**: set on inner control via context.
- **`*`** (required indicator): `aria-hidden="true"`; the announce comes from `aria-required="true"`.
- **`(optional)`**: visible muted text, NOT announced separately (would create noisy AT output) — relies on the absence of required for the underlying announcement.
- **Floating label**: when collapsed (i.e. value present), label is still associated via `htmlFor`. When expanded (placeholder visible), label visually overlaps the placeholder but stays associated.
- axe-core: 0 violations across all label positions / required / optional / error / fieldset / floating modes.

---

## RTL

- All flex layouts use logical axes; horizontal "start" label uses `gap-3` which is direction-agnostic.
- Floating label uses `inset-inline-start` so it sits on the logical-leading edge.
- Required `*` and `(optional)` text use logical inline padding; they appear after the label text in both LTR and RTL (since text follows the document direction).
- `startAdornment` / `endAdornment` use `gap` + logical flex order — direction-aware.

---

## i18n

When wrapped in `<I18nProvider>`:

| Key                     | Default (en)    |
| ----------------------- | --------------- |
| `field.required`        | "required"      | (sr-only; from `aria-required`) |
| `field.optional`        | "(optional)"    |
| `field.errorPrefix`     | "Error:"        | (sr-only prefix to error text) |

Bundles: en / he / ar.

---

## Performance

- Stateless except for the generated id (`useId`).
- One context provider per field; trivial cost.
- Bundle target: **< 2 KB gz**.

---

## Integration plan with existing form controls

Phase 49 **does not** change any existing form control's source code. The integration mechanism is:

1. `useFormFieldA11y` (already shared across all form controls) is enhanced to read FieldContext first, then fall back to local props.
2. Each form control's own `label`/`description`/`helperText`/`error`/`required`/`disabled`/`readOnly`/`size`/`id`/`name` props continue to work standalone.
3. When wrapped in `<Field>`, the Field props **win**; the control's own props are ignored (with a dev warning if both are set).

Tests in `Field.contextIntegration.test.tsx` verify all 13 form controls light up correctly:

- Input, Textarea, Select, Combobox (text-like)
- Checkbox, Switch, Radio (boolean)
- Slider, NumberInput, Rating (numeric)
- DatePicker, ColorPicker, TagsInput, FileUpload (specialty)

---

## Testing

- Each label position renders correctly with correct DOM structure.
- `required` shows `*`; sets `aria-required="true"` on inner control.
- `optional` shows "(optional)"; does not set `aria-required`.
- `error` overrides `helperText`; sets `aria-invalid="true"`.
- `description` + `helperText` both populate `aria-describedby` in the right order.
- `as="fieldset"` renders `<fieldset><legend>{label}</legend>…</fieldset>` correctly.
- Floating label CSS class is applied to control when `labelPosition="floating"`.
- Floating label dev warning when used with Checkbox/Switch/Radio.
- Compound API renders identical DOM to prop-driven API.
- All 13 form controls pick up FieldContext correctly (integration tests).
- `labelWidth` applies inline `width` when `labelPosition="start"`.
- `startAdornment` / `endAdornment` render around the control row.
- axe-core: 0 violations in every mode.
- RTL snapshot.

---

## Acceptance Criteria

- [ ] `<Field>` + all 5 subcomponents exported.
- [ ] All 4 label positions work; floating label is CSS-only.
- [ ] `required` / `optional` / `error` / `helperText` / `description` all wire to ARIA correctly.
- [ ] `as="fieldset"` renders proper `<fieldset>`/`<legend>` semantics.
- [ ] All 13 form controls integrate via context with **zero source-code changes** to those controls.
- [ ] i18n bundle for en/he/ar.
- [ ] RTL correct.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 2 KB gz.

---

## DRY Self-Check

- [ ] Reuses `useFormFieldA11y`, `useId`, `useThemedClasses`, FormContext (when present).
- [ ] No duplication of label / helper / error rendering across form controls — they all delegate to Field when wrapped.
- [ ] `useFieldIds` is the single id-generation source.
- [ ] No new color tokens.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/49-field.md`.
2. Outcome notes: bundle delta, list of any form-control internal tweaks needed to read FieldContext.
3. Document the standard form-row patterns in docs Patterns page: vertical stack, horizontal row, settings table, multi-control fieldset.

---

## Outcome

Shipped `<Field />` as the canonical composition wrapper that pairs a label, optional description, a single form control, and helper / error text — and shipped it as a true *wrapper* that integrates with every form control via FieldContext, **with zero source-code changes to any existing form control**.

The integration mechanism is a single-file enhancement to `_shared/useFormFieldA11y` — the shared hook every form control already uses. The hook now consumes `useContext(FieldContext)` when present and prefers Field's `id` / `required` / `invalid` / `describedBy` over the control's own props (with a dev warning when both are set). Because Input / Textarea / Select / Combobox / Checkbox / Switch / Radio / NumberInput / Rating / TagsInput already route their a11y wiring through that hook, **all 10 of them light up under Field automatically**.

### Files shipped

- `packages/components/src/Field/Field.types.ts` — `FieldProps`, 5 subpart prop types, `FieldContextValue` (with `groupMode` for fieldset-mode id-collision avoidance), `FieldLabelPosition`, `FieldSize`, `FieldAs`, `FieldBaseProps`.
- `packages/components/src/Field/useFieldIds.ts` — single id-generation source (`controlId` + `descriptionId` + `helperId` + `errorId`). Reused by Field root and available for downstream tooling.
- `packages/components/src/Field/FieldContext.ts` — `createContext<FieldContextValue | null>(null)` + `useFieldContext()` hook (returns null when standalone).
- `packages/components/src/Field/Field.recipe.ts` — **nine-slot recipe** (`root`, `labelColumn`, `label`, `controlRow`, `description`, `helper`, `error`, `requiredIndicator`, `optionalIndicator`, `adornment`). Floating label is pure CSS via `has-[~_[data-field-control]_input:focus]` + `:not(:placeholder-shown)` sibling selectors.
- `packages/components/src/Field/Field.tsx` — root: prop-driven layout + compound-subpart auto-discovery + fieldset/legend semantics + start/end adornments + `aria-describedby` composition (description id → helper/error id) + dev warning on `required` + `optional` conflict.
- `packages/components/src/Field/FieldLabel.tsx` — `<label htmlFor>` subpart with `sr-only` hidden mode + floating-label class application.
- `packages/components/src/Field/FieldDescription.tsx` — `<p id={descriptionId}>` subpart.
- `packages/components/src/Field/FieldHelper.tsx` — `<p id={helperId}>` subpart.
- `packages/components/src/Field/FieldError.tsx` — `<p id={errorId} role="alert">` subpart (alert so blur-triggered validation is announced).
- `packages/components/src/Field/FieldControl.tsx` — `<div data-field-control>` explicit slot marker for floating-label CSS sibling targeting and adornment layouts.
- `packages/components/src/Field/index.ts` — `Object.assign(FieldRoot, { Label, Description, Helper, Error, Control })` compound + named exports for `FieldContext`, `useFieldContext`, `useFieldIds`, and the full type surface.
- `packages/components/src/Field/meta.ts` — renderer metadata.
- `packages/components/src/Field/examples/*.tsx` (19 examples): `Basic`, `WithError`, `Required`, `Optional`, `LabelPositionStart`, `LabelPositionFloating`, `LabelHidden`, `WithDescription`, `WithHelper`, `WithLabelIcon`, `WithLabelAddon`, `WithStartEndAdornment`, `Fieldset`, `Compound`, `Disabled`, `ReadOnly`, `Sizes`, `EveryControl` (10 form controls in one grid), `InForm` (full local-state mini-form until Phase 50's `<Form>` lands).
- `packages/components/src/Field/README.mdx` — overview / anatomy / examples / props / label positions / required-vs-optional / fieldset / compound API / adornments / a11y / RTL / i18n / theming / integration matrix per control / do-don't.
- `packages/components/__tests__/Field.test.tsx` — **18 tests** (prop→DOM rendering + label association + required/optional/hideRequiredIndicator + describedBy composition + error overrides helper + fieldset legend + adornments + labelWidth + sr-only + arbitrary attribute forwarding + dev warning).
- `packages/components/__tests__/Field.compound.test.tsx` — **8 tests** (compound subpart rendering + Field.Label association + prop-vs-subpart suppression + role="alert" on error + same DOM ids across both APIs).
- `packages/components/__tests__/Field.contextIntegration.test.tsx` — **9 tests** (Input / Textarea / Checkbox / Switch / Radio-fieldset / NumberInput / Rating / TagsInput integrations + standalone-without-Field regression).
- `packages/components/__tests__/Field.a11y.test.tsx` — **27 tests** (default / required / optional / description+helper / error / fieldset / floating / hidden-label / compound / Textarea / Select all pass axe; **12-cell matrix** across `labelPosition × size`; semantic structure assertions for label↔input, fieldset↔legend, required-indicator aria-hidden, describedBy ordering).
- `packages/components/src/_shared/useFormFieldA11y.ts` — **only existing-file edit**: enhanced to consume `useFieldContext()` and prefer Field's values over local props, plus a `groupMode` carve-out that skips id + describedBy propagation when `as="fieldset"` (avoids id collisions across grouped controls). Backward-compatible — standalone controls keep their existing id / required / invalid behavior identically.
- `packages/components/src/index.ts` — public exports inserted alphabetically between `EmptyState` and `HoverCard`: `Field`, `FieldContext`, `useFieldContext`, `useFieldIds` + 12 named types.
- `apps/renderer/src/generated/exampleRegistry.ts` — regenerated, 19 Field entries wired (total **508 registry entries**, up from 489 pre-Field).

### Test summary

- `pnpm vitest run __tests__/Field.test.tsx __tests__/Field.compound.test.tsx __tests__/Field.contextIntegration.test.tsx __tests__/Field.a11y.test.tsx` → **62 / 62 pass** (18 + 8 + 9 + 27).
- `pnpm vitest run __tests__/Input.test.tsx __tests__/Textarea.test.tsx __tests__/Checkbox.test.tsx __tests__/Switch.test.tsx __tests__/Radio.test.tsx __tests__/NumberInput.test.tsx __tests__/Rating.test.tsx __tests__/Combobox.test.tsx __tests__/Select.test.tsx __tests__/TagsInput.test.tsx` → **308 / 308 pass**. The shared-hook enhancement is fully backward-compatible — every existing form-control test continues to pass without modification.
- `pnpm lint` → **0 errors, 0 warnings** on Field files and on `useFormFieldA11y`.
- `pnpm typecheck` → **0 errors workspace-wide**.

### Ship-gate (functional-example rule)

- **Default `Basic` example** renders a labeled `<Input>` with a helper — clickable, paste-able, no auto-actions.
- **`WithError`** has a visible **Set valid value / Clear** button row that toggles between a invalid + valid state via real `useState`; the error message swaps in/out in real time as the consumer types.
- **`Required` / `Optional`** are static visual examples (no state) — clearly demonstrate the `*` indicator and the muted `(optional)` text in context.
- **`LabelPositionStart` / `LabelPositionFloating` / `LabelHidden`** all render real labeled controls; the floating-label example uses `placeholder=" "` so the CSS state transition is observable on focus.
- **`WithDescription` / `WithHelper` / `WithLabelIcon` / `WithLabelAddon` / `WithStartEndAdornment`** are clickable / type-able input demonstrations.
- **`Fieldset`** renders a real notifications group with 4 Checkboxes; toggleable.
- **`Compound`** demonstrates the full subpart API on a real Input.
- **`Disabled` / `ReadOnly`** each have a **Lock / Unlock** toggle button so the locked state can be exercised without a refresh.
- **`Sizes`** renders all three sizes side-by-side with real inputs.
- **`EveryControl`** wraps **10 form controls** in Field, all interactive: Input, Textarea, Select, Combobox, Checkbox (group), Switch, RadioGroup, NumberInput, Rating, TagsInput. Demonstrates the "zero source-code changes" promise visually.
- **`InForm`** is a full sign-in mini-form with email + password + Submit + Reset, real local validation, success message echoed on submit. Ready to plug straight into Phase 50's `<Form>` once that lands.
- Every example wraps in `<ExampleBlock />` via the README MDX; no hidden-only examples; no auto-actions on mount.

### Notable implementation decisions

1. **Single integration point** — the only existing file edited outside the new `Field/` folder is `_shared/useFormFieldA11y.ts`. Because that hook is the canonical a11y wiring for every form control (the codebase's deliberate design from Phase 7), enhancing it Field-aware ripples to all 10 consumers automatically. Zero per-control diffs.
2. **`groupMode` flag on FieldContext** — `as="fieldset"` sets `ctx.groupMode = true`, and the shared hook then *skips* id + describedBy propagation. Without this, every Checkbox / Radio inside a fieldset Field would inherit the same `id`, which is invalid HTML and breaks accessibility. We still propagate `required` / `invalid` / `size` / `disabled` / `readOnly` in group mode because those are whole-group axes.
3. **Compound subpart auto-discovery** — Field walks its immediate children once (cheap; flat) to detect which `<Field.*>` subparts the consumer rendered, then suppresses the corresponding prop-driven defaults to avoid double-rendering. Order in compound mode follows JSX order; prop-driven mode uses the canonical label → description → control → helper/error sequence.
4. **Nine-slot recipe** — beyond the four-slot baseline the plan called out, I split out `labelColumn` (so `start`-positioned layouts can apply `labelWidth` cleanly), `requiredIndicator` and `optionalIndicator` (so theme overrides can target the `*` / `(optional)` glyphs independently), and `adornment` (so consumers can theme start/end visual cues without overriding the controlRow). Each slot survives Tailwind's content scan because every variant value is a literal string.
5. **Floating label is CSS-only** — no JS state machine, no `useState`. Implemented with `has-[~_[data-field-control]_input:focus]` + `:not(:placeholder-shown)` sibling selectors on the label. Works with Input / Textarea / NumberInput / Combobox out of the box. Falls back to top-positioned for placeholder-less controls (Checkbox / Switch / Radio). The CSS targets the inner `input` / `textarea` directly via `data-field-control` — that's why `<Field.Control>` ships as an explicit slot.
6. **`role="alert"` on `<Field.Error>`** — ensures blur-triggered or async validation errors are announced when they appear. The `aria-describedby` link is the primary AT path; `role="alert"` is the redundant-but-correct belt for mid-flow announcements.
7. **`required` vs `optional` dev warning** — runtime check fires once via the engine's `warn` helper when both are passed. The `required` wins; `optional` is silently dropped.
8. **`useFormFieldA11y` duplicate-prop dev warnings** — when wrapped in Field, the hook warns if the control's own `invalid` or `required` prop is also set. Helps consumers discover dead code as soon as they reach for Field.

### Deviations from the plan

- **Plan listed 4 recipe slots (`root`, `label`, `helper`, `error`)** — shipped 9 slots (see decision #4). Same component-theming API surface; just finer-grained override targets.
- **Plan called for a `Field.Required` subpart** — not shipped. The required indicator is always inline with the label (whether rendered via prop or subpart) and not a standalone composable slot. Adding a subpart would create two ways to render the same thing without solving a real layout need.
- **Plan acceptance criteria included "all 13 form controls integrate via context"** — shipped integration for **10 controls** (Input, Textarea, Select, Combobox, Checkbox, Switch, Radio, NumberInput, Rating, TagsInput). The other 3 listed in the plan (DatePicker, ColorPicker, FileUpload) haven't been shipped yet (no source files in `packages/components/src/`). When they ship, they'll inherit Field integration for free as long as they consume `useFormFieldA11y` like the other 10. **Slider** is excluded by design — it uses `role="slider"` on each thumb, has no single `<input>` to associate a label with, and doesn't consume `useFormFieldA11y`. Slider can be wrapped in Field for visual purposes; the `<label htmlFor>` falls back to associating with the first thumb's id and the label / helper / error text still render correctly, but the per-thumb a11y is owned by Slider.
- **Rating describedBy** — Rating composes its own `aria-describedby` from its private `descriptionId` / `helperId` / `errorId` and doesn't merge the shared hook's `aria-describedby`. So when Rating is wrapped in Field, the Field's description / helper / error text **does** render around it and **does** get `id`s, but Rating's `role="slider"` doesn't currently include those ids in its own `aria-describedby` chain. `aria-invalid` / `id` / `required` flow correctly. Closing the describedBy gap on Rating is a one-line change in Rating's source — deferred to a Rating follow-up because the plan said no per-control code changes.
- **`<I18nProvider>` integration deferred** — same shape as Stepper / Breadcrumbs / Tabs. The `*` and `(optional)` strings are hardcoded English; `labelAddon` accepts any ReactNode, so consumers can substitute localized strings today. When `<I18nProvider>` lands, the same prop surface plugs into `t('field.optional')` etc. with no breaking change.
- **Bundle measurement** — no bundle-size guard exists in the components package yet. Field's source is small (one root + 5 subparts + 1 hook + 1 context + 1 recipe + 1 ids hook; ~700 LOC across all files). The shared-hook enhancement adds ~30 LOC and is shared across all form controls, so the marginal per-control cost is zero. A bundle gate can be added later without source changes.
- **`<Form>` (Phase 50) integration** — Field is forward-compatible: if/when a `FormContext` exists, Field can additionally consume it (read `name` → derive `value` / `onChange` / `error`). Today Field reads only from its own props, and the `InForm` example demonstrates the consumer-state pattern that mirrors Phase 50's planned semantics.

### Coordination notes

- **Single existing-file edit**: `packages/components/src/_shared/useFormFieldA11y.ts`. Backward-compatible — every existing form-control test still passes (308/308 verified).
- **No edits to any form control source file** — Input / Textarea / Select / Combobox / Checkbox / Switch / Radio / NumberInput / Rating / TagsInput / Slider all untouched. The integration is entirely upstream in the shared hook.
- **No `<Form>` (Phase 50) coupling** — `<Form>` will plug into Field via an optional `FormContext` read in a future PR; today Field is fully presentational.
- **No edits to `packages/theme/`, `packages/engine/`, `packages/tokens/`**.
- **`packages/components/src/index.ts`** — surgical insert alphabetically between `EmptyState` exports and `HoverCard` exports. 4 named exports + 12 named types.
- **Renderer**: example registry regenerated; **no renderer restart performed** (per Ahmad's standing rule).
- **Pre-existing failures unrelated to Field** — full workspace test run still shows the same Toast / Combobox-a11y / Alert / Select-a11y `act()` warnings as before Phase 41 Stepper. None overlap with Field; the broader form-control suite passes 308/308.

### Follow-ups suggested

- **Rating describedBy merge** — one-line change in `Rating.tsx` to merge `formField['aria-describedby']` into the slider's own describedBy chain, so Field-rendered description / helper / error text is announced for Rating too.
- **DatePicker / ColorPicker / FileUpload** — when these ship, ensure they consume `useFormFieldA11y` like the other 10 controls. They'll inherit Field integration for free.
- **`<Form>` (Phase 50)** — when shipped, add a `FormContext` read inside Field for `name` → `value` / `onChange` / `error` derivation. Field's API is already shaped to accept this without a breaking change.
- **Bundle-size guard** — add a global components-package bundle-size check (e.g. via `size-limit`) so future additions can't silently exceed the per-component bundle targets the plans call out.
