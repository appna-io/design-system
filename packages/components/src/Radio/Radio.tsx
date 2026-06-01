'use client';

import { forwardRef, useControllableState, useId, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, type ChangeEvent } from 'react';

import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import { radioRecipes } from './Radio.recipe';
import type { RadioProps, RadioSize } from './Radio.types';
import { useRadioGroup } from './RadioGroupContext';

/**
 * Single-of-many selection control. Same hidden-input + custom-indicator pattern as
 * `<Checkbox />` (Phase 9) and `<Switch />` (Phase 10) — the visible affordance is the outer
 * ring + inner dot, but a real `<input type="radio">` lives inside the `<label>` doing all the
 * work for focus, form submission, and screen-reader announcements.
 *
 * The inner filled dot is the control's `::before` pseudo-element (see `Radio.recipe.ts` for
 * the rationale). One fewer DOM node per radio, the scale-in animation is a single CSS
 * transform, and `prefers-reduced-motion` collapses it via Tailwind's `motion-reduce` variant.
 *
 * Inside a `<RadioGroup>`, the group owns the selection state and `<Radio>` is purely
 * presentational — `checked` is derived from `group.value === value`. Outside a group, a
 * standalone Radio falls back to `useControllableState` and behaves like a single-option
 * picker. The standalone path exists mostly for tests and the documented escape hatch; the
 * canonical entry is `<RadioGroup>`.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(props, ref) {
  const group = useRadioGroup();
  const {
    value,
    variant = group?.variant,
    size = group?.size,
    color = group?.color,
    labelPosition,
    checked: checkedProp,
    defaultChecked,
    invalid = group?.invalid ?? false,
    disabled = group?.disabled ?? false,
    required = false,
    name = group?.name,
    description,
    children,
    onCheckedChange,
    onChange,
    className,
    style,
    sx,
    id: providedId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props;

  warn(
    typeof value === 'string' && value.length > 0,
    '<Radio> requires a non-empty `value` prop. Without one the radio cannot participate in form submission or be selected from a <RadioGroup>.',
    'RADIO_NO_VALUE',
  );

  warn(
    Boolean(children) || Boolean(ariaLabel) || Boolean(ariaLabelledBy),
    '<Radio> needs an accessible name. Pass children, `aria-label`, or `aria-labelledby`.',
    'RADIO_NO_LABEL',
  );

  // Standalone state. Only used when there's no group; inside a group the group owns state.
  // We deliberately do **not** pass `onCheckedChange` through to `useControllableState` because
  // `handleChange` below already invokes it once with the canonical boolean — wiring it here
  // too would double-fire the callback on every click of an uncontrolled standalone Radio.
  const [standaloneChecked = false, setStandaloneChecked] = useControllableState<boolean>({
    value: checkedProp,
    defaultValue: defaultChecked,
  });

  const checked = group ? group.value === value : standaloneChecked;
  const state: 'checked' | 'unchecked' = checked ? 'checked' : 'unchecked';

  const internalId = useId(providedId);
  const descriptionAutoId = useId();
  const hasDescription = description != null && description !== false && description !== '';
  const composedDescribedBy = mergeDescribedBy(
    ariaDescribedBy,
    hasDescription ? descriptionAutoId : undefined,
  );

  const a11y = useFormFieldA11y({
    id: internalId,
    invalid,
    required,
    'aria-describedby': composedDescribedBy,
  });

  const effectiveSize = resolveBaseSize(size);

  const { className: rootCls, style: rootStyle } = useThemedClasses({
    recipe: radioRecipes.root,
    componentName: 'Radio',
    slot: 'root',
    props: { size, labelPosition, className, sx, style },
  });
  const { className: controlCls } = useThemedClasses({
    recipe: radioRecipes.control,
    componentName: 'Radio',
    slot: 'control',
    props: { variant, size, color },
  });
  const { className: labelCls } = useThemedClasses({
    recipe: radioRecipes.label,
    componentName: 'Radio',
    slot: 'label',
    props: { size },
  });

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      const next = event.target.checked;
      // Notify the consumer first — they may set state synchronously.
      onCheckedChange?.(next);
      if (group) {
        // Inside a group, "off → on" is the only meaningful transition (native radios never
        // self-uncheck via a click). Tell the group so it can promote this option to selected.
        if (next) group.setValue(value);
      } else {
        setStandaloneChecked(next);
      }
    },
    [group, onChange, onCheckedChange, setStandaloneChecked, value],
  );

  return (
    <label
      htmlFor={a11y.id}
      className={rootCls}
      style={rootStyle ?? undefined}
      data-disabled={disabled || undefined}
      data-state={state}
    >
      <input
        ref={ref}
        type="radio"
        className="peer sr-only"
        value={value}
        // Inside a group: derived `checked` is the canonical state — explicitly setting both
        // `checked` and `defaultChecked` would make React warn. Outside a group, honor the
        // consumer's defaultChecked exactly once.
        checked={group ? checked : checkedProp ?? undefined}
        defaultChecked={group ? undefined : defaultChecked}
        disabled={disabled}
        name={name}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onChange={handleChange}
        {...rest}
        {...a11y}
      />
      <span
        aria-hidden="true"
        className={controlCls}
        data-state={state}
        data-invalid={invalid || undefined}
      />
      {hasDescription || children ? (
        <span className={textWrapperClass(effectiveSize)}>
          {children ? <span className={labelCls}>{children}</span> : null}
          {hasDescription ? (
            <span
              id={descriptionAutoId}
              className="text-xs text-fg-muted leading-snug mt-0.5"
            >
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}, 'Radio');

/**
 * Per-size wrapper around the label + description column. Same pattern Checkbox/Switch use —
 * extracted locally on purpose: each form control has its own baseline alignment vs the
 * indicator box, and turning this into a shared helper would couple three components on one
 * detail that legitimately differs between them.
 */
function textWrapperClass(_size: RadioSize): string {
  return 'flex flex-col';
}

/**
 * Merge two `aria-describedby` strings (space-separated, dedup). Same helper Checkbox + Switch
 * inline locally. Promotion to `_shared/` is a documented follow-up — three consumers now share
 * this exact behavior, which is the DS's "extract on third consumer" threshold.
 */
function mergeDescribedBy(a: string | undefined, b: string | undefined): string | undefined {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  const tokens = new Set<string>();
  for (const t of `${a} ${b}`.split(/\s+/)) {
    if (t) tokens.add(t);
  }
  return Array.from(tokens).join(' ') || undefined;
}

/**
 * Collapse a (possibly responsive) `size` value down to the base entry. Used only for the text
 * wrapper class; the recipe itself handles responsive resolution for the visible slots.
 */
function resolveBaseSize(value: RadioProps['size']): RadioSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, RadioSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}