'use client';

import { useControllableState } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useMemo, type ReactNode } from 'react';

import { radioRecipes } from './Radio.recipe';
import { RadioGroupContext, type RadioGroupContextValue } from './RadioGroupContext';
import type { RadioGroupOrientation, RadioGroupProps } from './Radio.types';

/**
 * The canonical entrypoint for radio selection. Wraps any number of `<Radio>` children, hosts
 * the single source of truth for the selected value, and propagates shared defaults (name,
 * variant, size, color, disabled, invalid) down through context so consumers don't repeat them
 * on every child.
 *
 * Controlled or uncontrolled via the engine's `useControllableState` (Phase 2). The two
 * matching event handlers exist on purpose:
 *   - `onValueChange(value)` is the canonical group handler — gives you the new selected string.
 *   - Each child's `onCheckedChange(boolean)` still fires for the radio that just turned ON.
 *
 * The container styling lives in `radioRecipes.group` so theme consumers can override it via
 * `defineTheme({ components: { RadioGroup: { styleOverrides: { root: '…' } } } })` the same
 * way every other component in the DS supports.
 *
 * Phase 58 RFC #1 note: RadioGroup deliberately does **not** use `useRovingTabindexRegistry`.
 * Each `<Radio>` renders a native `<input type="radio">` with the shared `name`, which means
 * the browser already implements the entire roving-tabindex + arrow-key navigation pattern
 * for us. Layering our engine hook on top would duplicate (and could subtly fight) native
 * semantics around RTL, label-click activation, and form reset. Migration is intentionally
 * skipped — confirmed in the Phase 58 RFC review.
 */
export function RadioGroup(props: RadioGroupProps): ReactNode {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    name,
    required,
    disabled = false,
    invalid = false,
    orientation = 'vertical',
    variant,
    size,
    color,
    className,
    style,
    sx,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props;

  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });

  const baseOrientation = resolveBaseOrientation(orientation);

  const contextValue = useMemo<RadioGroupContextValue>(
    () => ({
      value,
      setValue,
      name,
      disabled,
      invalid,
      variant,
      size,
      color,
      orientation: baseOrientation,
    }),
    [value, setValue, name, disabled, invalid, variant, size, color, baseOrientation],
  );

  const { className: rootCls, style: rootStyle } = useThemedClasses({
    recipe: radioRecipes.group,
    componentName: 'RadioGroup',
    slot: 'root',
    props: { orientation: baseOrientation, className, sx, style },
  });

  // `exactOptionalPropertyTypes` refuses to spread `string | undefined` keys directly. Gather
  // aria-* keys explicitly so undefined entries never leak onto the DOM.
  const ariaProps: { 'aria-label'?: string; 'aria-labelledby'?: string } = {};
  if (ariaLabel) ariaProps['aria-label'] = ariaLabel;
  if (ariaLabelledBy) ariaProps['aria-labelledby'] = ariaLabelledBy;

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        role="radiogroup"
        aria-orientation={baseOrientation}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-disabled={disabled || undefined}
        data-orientation={baseOrientation}
        className={rootCls}
        style={rootStyle ?? undefined}
        {...ariaProps}
        {...rest}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

RadioGroup.displayName = 'RadioGroup';

/**
 * Collapse a (possibly responsive) `orientation` value down to the base axis used by the layout
 * recipe + the `data-orientation` / `aria-orientation` attributes. Responsive variants of the
 * orientation are a future extension — for v1 we honor the base entry and document the
 * `{ base, md, … }` shape so consumers can opt in once the recipe matrix is wired for it.
 */
function resolveBaseOrientation(
  value: RadioGroupProps['orientation'],
): RadioGroupOrientation {
  if (value === undefined) return 'vertical';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, RadioGroupOrientation>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'vertical';
  }
  return 'vertical';
}