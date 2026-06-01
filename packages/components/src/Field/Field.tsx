'use client';

import { forwardRef, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { Children, isValidElement, useMemo, type ReactElement, type ReactNode } from 'react';

import { FieldContext } from './FieldContext';
import { FieldDescription } from './FieldDescription';
import { FieldError } from './FieldError';
import { FieldHelper } from './FieldHelper';
import { FieldLabel } from './FieldLabel';
import { fieldRecipes } from './Field.recipe';
import type { FieldContextValue, FieldProps } from './Field.types';
import { useFieldIds } from './useFieldIds';

const REQUIRED_GLYPH = '*';
const OPTIONAL_TEXT_DEFAULT = '(optional)';

/**
 * `<Field>` — the canonical composition wrapper above every form control.
 *
 * Owns:
 *  - Label + addon + required/optional indicator + description + helper / error chrome.
 *  - `useFieldIds` for stable control / description / helper / error ids.
 *  - `FieldContext` so the inner control (Input, Textarea, Select, Checkbox, …) picks up
 *    `id`, `name`, `required`, `invalid`, `disabled`, `readOnly`, `size`, and `describedBy`
 *    via the shared `useFormFieldA11y` hook — zero source-code changes to any existing control.
 *  - Two label layouts: vertical stack (`top` / `floating` / `hidden`) and horizontal row
 *    (`start`, with optional `labelWidth`).
 *  - `as='fieldset'` swap that routes the label into a `<legend>` for multi-control groups.
 *
 * Field is **presentational** — it does not own form state. State lives in the consumer (or in
 * the eventual `<Form>` from Phase 50). Field reads from FormContext when present (additive,
 * no breaking change required when that lands).
 *
 * @example
 *   <Field label="Email" helperText="We'll never share">
 *     <Input type="email" name="email" />
 *   </Field>
 *
 *   <Field label="Email" error={errors.email}>
 *     <Input type="email" name="email" />
 *   </Field>
 *
 *   <Field label="Notifications" as="fieldset">
 *     <Stack gap={2}>
 *       <Checkbox name="notify-email">Email</Checkbox>
 *       <Checkbox name="notify-sms">SMS</Checkbox>
 *     </Stack>
 *   </Field>
 */
export const Field = forwardRef<HTMLElement, FieldProps>(function Field(props, ref) {
  const {
    label,
    labelPosition = 'top',
    labelWidth,
    labelAddon,
    required = false,
    optional = false,
    hideRequiredIndicator = false,
    description,
    helperText,
    error,
    htmlFor,
    name,
    as = 'div',
    size = 'md',
    disabled = false,
    readOnly = false,
    startAdornment,
    endAdornment,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  if (process.env.NODE_ENV !== 'production') {
    warn(
      !(required && optional),
      '<Field> received both `required` and `optional`. These are mutually exclusive; `required` will win and `optional` will be ignored.',
      'FIELD_REQUIRED_OPTIONAL_CONFLICT',
    );
  }

  const effectiveOptional = optional && !required;
  const errorFromProp = error != null && error !== false && error !== '';
  const hasDescription = description != null && description !== false && description !== '';
  const hasHelperFromProp = helperText != null && helperText !== false && helperText !== '';

  const { controlId, descriptionId, helperId, errorId } = useFieldIds({ htmlFor });

  // Subpart auto-discovery: when the consumer renders explicit `<Field.Description>` / `Helper`
  // / `Error`, the root suppresses its prop-driven counterpart so we don't render the same line
  // twice. We walk children once (cheap; flat) to figure out which subparts are present.
  const compoundFlags = useMemo(() => detectCompoundSubparts(children), [children]);
  const finalHasDescription = hasDescription || compoundFlags.hasDescription;
  const finalHasError = errorFromProp || compoundFlags.hasError;
  const finalHasHelper = (hasHelperFromProp || compoundFlags.hasHelper) && !finalHasError;
  // `invalid` drives `aria-invalid` on the inner control. It includes both the prop-driven
  // `error` *and* the presence of a `<Field.Error>` subpart so the compound API gets the same
  // wiring as the prop-driven path.
  const invalid = finalHasError;

  const describedBy =
    [
      finalHasDescription ? descriptionId : null,
      finalHasError ? errorId : finalHasHelper ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const groupMode = as === 'fieldset';

  const ctxValue = useMemo<FieldContextValue>(
    () => ({
      id: controlId,
      groupMode,
      name,
      required,
      invalid,
      disabled,
      readOnly,
      size,
      labelPosition,
      descriptionId,
      helperId,
      errorId,
      describedBy,
      hasDescription: finalHasDescription,
      hasHelper: finalHasHelper,
      hasError: finalHasError,
    }),
    [
      controlId,
      groupMode,
      name,
      required,
      invalid,
      disabled,
      readOnly,
      size,
      labelPosition,
      descriptionId,
      helperId,
      errorId,
      describedBy,
      finalHasDescription,
      finalHasHelper,
      finalHasError,
    ],
  );

  const { className: rootCls, style: rootStyle } = useThemedClasses({
    recipe: fieldRecipes.root,
    componentName: 'Field',
    props: {
      labelPosition,
      size,
      disabled,
      invalid,
      as,
      className,
      sx,
      style,
    },
  });

  const labelColumnStyle =
    labelPosition === 'start' && labelWidth ? { width: labelWidth, flexBasis: labelWidth } : undefined;

  const { className: labelColumnCls } = useThemedClasses({
    recipe: fieldRecipes.labelColumn,
    componentName: 'Field',
    slot: 'labelColumn',
    props: { labelPosition },
  });

  const { className: legendCls } = useThemedClasses({
    recipe: fieldRecipes.label,
    componentName: 'Field',
    slot: 'label',
    props: { size, invalid, disabled, hidden: labelPosition === 'hidden', floating: false },
  });

  const { className: requiredCls } = useThemedClasses({
    recipe: fieldRecipes.requiredIndicator,
    componentName: 'Field',
    slot: 'requiredIndicator',
    props: { size },
  });

  const { className: optionalCls } = useThemedClasses({
    recipe: fieldRecipes.optionalIndicator,
    componentName: 'Field',
    slot: 'optionalIndicator',
    props: { size },
  });

  const { className: controlRowCls } = useThemedClasses({
    recipe: fieldRecipes.controlRow,
    componentName: 'Field',
    slot: 'controlRow',
    props: {
      hasStartAdornment: Boolean(startAdornment),
      hasEndAdornment: Boolean(endAdornment),
    },
  });

  const { className: adornmentCls } = useThemedClasses({
    recipe: fieldRecipes.adornment,
    componentName: 'Field',
    slot: 'adornment',
    props: { side: 'start' },
  });

  // Build the label content: label text + (optional) required `*` / "(optional)" + addon.
  const labelInner: ReactNode =
    label != null ? (
      <>
        <span data-field-label-text="">{label}</span>
        {required && !hideRequiredIndicator ? (
          <span
            className={requiredCls}
            data-field-required-indicator=""
            aria-hidden="true"
          >
            {REQUIRED_GLYPH}
          </span>
        ) : null}
        {effectiveOptional ? (
          <span className={optionalCls} data-field-optional-indicator="">
            {OPTIONAL_TEXT_DEFAULT}
          </span>
        ) : null}
        {labelAddon ? (
          <span data-field-label-addon="" className="inline-flex items-center">
            {labelAddon}
          </span>
        ) : null}
      </>
    ) : null;

  // When `as='fieldset'`, the label routes into `<legend>` automatically. Otherwise it's a
  // proper `<label htmlFor>` rendered through `<Field.Label>`. In both cases, if the consumer
  // already rendered `<Field.Label>` via the compound API, the prop-driven label is suppressed.
  const shouldRenderPropLabel = !compoundFlags.hasLabel && label != null;

  // When the consumer rendered explicit `<Field.Description>` / `<Field.Helper>` /
  // `<Field.Error>` subparts via the compound API, we skip the prop-driven counterparts. The
  // consumer is responsible for ordering in that case (the compound API renders children inline,
  // matching the order they appear in JSX).
  const usingCompoundLayout = compoundFlags.hasAnySubpart;

  // Prop-driven layout: label → description → controlRow(start, control, end) → helper / error.
  const propLabel =
    shouldRenderPropLabel && as !== 'fieldset' ? (
      <FieldLabel>{labelInner}</FieldLabel>
    ) : null;

  const propDescription =
    !compoundFlags.hasDescription && hasDescription ? (
      <FieldDescription>{description}</FieldDescription>
    ) : null;

  const propHelper =
    !compoundFlags.hasHelper && !finalHasError && hasHelperFromProp ? (
      <FieldHelper>{helperText}</FieldHelper>
    ) : null;

  const propError =
    !compoundFlags.hasError && errorFromProp ? <FieldError>{error}</FieldError> : null;

  const controlRow: ReactNode = (
    <div
      data-field-control=""
      data-disabled={disabled ? 'true' : undefined}
      data-invalid={invalid ? 'true' : undefined}
      className={controlRowCls}
    >
      {startAdornment ? (
        <span
          className={adornmentCls}
          data-field-adornment="start"
          aria-hidden="true"
        >
          {startAdornment}
        </span>
      ) : null}
      {usingCompoundLayout ? children : extractControlChildren(children)}
      {endAdornment ? (
        <span
          className={adornmentCls}
          data-field-adornment="end"
          aria-hidden="true"
        >
          {endAdornment}
        </span>
      ) : null}
    </div>
  );

  const renderedChildren: ReactNode = usingCompoundLayout ? (
    children
  ) : (
    <>
      {propLabel}
      {propDescription}
      {controlRow}
      {propHelper}
      {propError}
    </>
  );

  // `start` layout wraps the label block in its own column so `labelWidth` can apply.
  const renderedWithLabelColumn: ReactNode =
    labelPosition === 'start' && shouldRenderPropLabel && as !== 'fieldset' && !usingCompoundLayout ? (
      <>
        <div className={labelColumnCls} style={labelColumnStyle}>
          <FieldLabel>{labelInner}</FieldLabel>
        </div>
        <div className="flex flex-col gap-1.5 grow min-w-0">
          {propDescription}
          {controlRow}
          {propHelper}
          {propError}
        </div>
      </>
    ) : (
      renderedChildren
    );

  // Build the `<fieldset>`/`<legend>` shell when grouped controls are in play. The legend
  // collapses to plain text inside `<legend>` (so screen-readers announce the group label) but
  // we keep the same composed `labelInner` (required asterisk, optional hint, addon).
  if (as === 'fieldset') {
    return (
      <FieldContext.Provider value={ctxValue}>
        <fieldset
          ref={ref as React.Ref<HTMLFieldSetElement>}
          data-field-root=""
          data-label-position={labelPosition}
          data-invalid={invalid ? 'true' : undefined}
          data-disabled={disabled ? 'true' : undefined}
          className={rootCls}
          style={rootStyle ?? undefined}
          disabled={disabled || undefined}
          {...(rest as React.FieldsetHTMLAttributes<HTMLFieldSetElement>)}
        >
          {label != null && !compoundFlags.hasLabel ? (
            <legend
              data-field-legend=""
              className={legendCls}
              data-invalid={invalid ? 'true' : undefined}
              data-disabled={disabled ? 'true' : undefined}
            >
              {labelInner}
            </legend>
          ) : null}
          {usingCompoundLayout ? (
            children
          ) : (
            <>
              {propDescription}
              {controlRow}
              {propHelper}
              {propError}
            </>
          )}
        </fieldset>
      </FieldContext.Provider>
    );
  }

  return (
    <FieldContext.Provider value={ctxValue}>
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        data-field-root=""
        data-label-position={labelPosition}
        data-invalid={invalid ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        className={rootCls}
        style={rootStyle ?? undefined}
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
      >
        {renderedWithLabelColumn}
      </div>
    </FieldContext.Provider>
  );
}, 'Field');

interface CompoundFlags {
  hasLabel: boolean;
  hasDescription: boolean;
  hasHelper: boolean;
  hasError: boolean;
  hasAnySubpart: boolean;
}

/**
 * Walks the immediate children once to discover which `<Field.*>` subparts the consumer used.
 * Cheap — flat children, identity comparison against the displayName. Memoized at the call site.
 */
function detectCompoundSubparts(children: ReactNode): CompoundFlags {
  const flags: CompoundFlags = {
    hasLabel: false,
    hasDescription: false,
    hasHelper: false,
    hasError: false,
    hasAnySubpart: false,
  };

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const displayName = getDisplayName(child);
    if (displayName === 'Field.Label') {
      flags.hasLabel = true;
      flags.hasAnySubpart = true;
    } else if (displayName === 'Field.Description') {
      flags.hasDescription = true;
      flags.hasAnySubpart = true;
    } else if (displayName === 'Field.Helper') {
      flags.hasHelper = true;
      flags.hasAnySubpart = true;
    } else if (displayName === 'Field.Error') {
      flags.hasError = true;
      flags.hasAnySubpart = true;
    }
  });

  return flags;
}

/**
 * Filters out `<Field.*>` subpart elements from children so the prop-driven control row only
 * contains the actual form control(s). When the consumer mixes a subpart with the prop-driven
 * API (e.g. passes `description` as a prop AND renders `<Field.Helper>` inline), the subpart
 * still renders inline at the JSX position it occupied; we only suppress *our* prop-driven
 * counterpart.
 */
function extractControlChildren(children: ReactNode): ReactNode {
  const filtered: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const displayName = getDisplayName(child);
      if (
        displayName === 'Field.Label' ||
        displayName === 'Field.Description' ||
        displayName === 'Field.Helper' ||
        displayName === 'Field.Error'
      ) {
        return;
      }
    }
    filtered.push(child);
  });
  return filtered;
}

function getDisplayName(element: ReactElement): string | undefined {
  const type = element.type as { displayName?: string; name?: string } | string | undefined;
  if (typeof type === 'string') return type;
  return type?.displayName ?? type?.name;
}