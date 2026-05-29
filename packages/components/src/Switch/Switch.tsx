'use client';

import { forwardRef, useControllableState, useId, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, type ChangeEvent } from 'react';

import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import { switchRecipes } from './Switch.recipe';
import type { SwitchProps, SwitchSize } from './Switch.types';

/**
 * Binary on/off toggle. Same hidden-input + custom-painted-indicator technique as `<Checkbox />`
 * (Phase 9), but with a **sliding thumb** instead of a glyph. The visual language is
 * deliberately different from Checkbox so users learn the affordance:
 *   - Switch flips a setting **now** (often async).
 *   - Checkbox queues a value for **submission**.
 *
 * Slide is pure-CSS (`transition-transform`) and respects `prefers-reduced-motion` via
 * Tailwind's `motion-reduce` variant. No Motion-library cost is paid.
 *
 * `loading` blocks toggling, sets `aria-busy`, and renders an inline CSS-only spinner inside the
 * thumb — useful for "Connect to Slack"-style server-confirmed settings.
 *
 * Tri-slot recipe via `useThemedClasses({ slot })`: `root`, `track`, `thumb`, plus the optional
 * `label` slot when text is provided.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(props, ref) {
  const {
    variant,
    size,
    color,
    shape,
    labelPosition,
    checked: checkedProp,
    defaultChecked,
    loading = false,
    invalid = false,
    disabled = false,
    required = false,
    name,
    value,
    thumbIcon,
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

  const [checked = false, setChecked] = useControllableState<boolean>({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

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

  const state: 'checked' | 'unchecked' = checked ? 'checked' : 'unchecked';
  const isInert = disabled || loading;
  const effectiveSize = resolveBaseSize(size);

  warn(
    Boolean(children) || Boolean(ariaLabel) || Boolean(ariaLabelledBy),
    '<Switch> needs an accessible name. Pass children, `aria-label`, or `aria-labelledby`.',
    'SWITCH_NO_LABEL',
  );

  const { className: rootCls, style: rootStyle } = useThemedClasses({
    recipe: switchRecipes.root,
    componentName: 'Switch',
    slot: 'root',
    props: { size, labelPosition, className, sx, style },
  });
  const { className: trackCls } = useThemedClasses({
    recipe: switchRecipes.track,
    componentName: 'Switch',
    slot: 'track',
    props: { variant, size, color, shape },
  });
  const { className: thumbCls } = useThemedClasses({
    recipe: switchRecipes.thumb,
    componentName: 'Switch',
    slot: 'thumb',
    props: { variant, size, color },
  });
  const { className: labelCls } = useThemedClasses({
    recipe: switchRecipes.label,
    componentName: 'Switch',
    slot: 'label',
    props: { size },
  });

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      setChecked(event.target.checked);
    },
    [onChange, setChecked],
  );

  return (
    <label
      htmlFor={a11y.id}
      className={rootCls}
      style={rootStyle ?? undefined}
      data-disabled={isInert || undefined}
      data-state={state}
    >
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        disabled={isInert}
        name={name}
        value={value}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-checked={checked}
        aria-busy={loading || undefined}
        onChange={handleChange}
        {...rest}
        {...a11y}
      />
      <span
        aria-hidden="true"
        className={trackCls}
        data-state={state}
        data-invalid={invalid || undefined}
      >
        <span className={thumbCls} data-state={state}>
          {loading ? (
            <SwitchSpinner />
          ) : state === 'checked' ? (
            thumbIcon?.on ?? null
          ) : (
            thumbIcon?.off ?? null
          )}
        </span>
      </span>
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
}, 'Switch');

/**
 * Inline CSS-only spinner — Tailwind's `animate-spin` keyframe is enough, no Motion dependency
 * needed. The Button spinner uses Motion because its `loading` UI doubles as the press-feedback
 * canvas; Switch's spinner only ever renders inside the tiny thumb and benefits from the smaller
 * footprint. If a third consumer needs a shared spinner, extract to `_shared/Spinner.tsx`.
 */
function SwitchSpinner() {
  return (
    <span
      role="status"
      aria-label="Loading"
      className="inline-block size-[80%] rounded-full border-2 border-current border-r-transparent animate-spin motion-reduce:animate-none"
    />
  );
}

/**
 * Per-size wrapper around the label + description column.
 */
function textWrapperClass(_size: SwitchSize): string {
  return 'flex flex-col';
}

/**
 * Merge two `aria-describedby` strings (space-separated, dedup). Same helper used by Checkbox.
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

function resolveBaseSize(value: SwitchProps['size']): SwitchSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, SwitchSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}
