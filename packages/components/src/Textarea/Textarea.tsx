'use client';

import { forwardRef, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useEffect, useRef } from 'react';

import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import {
  textareaCountRecipe,
  textareaInnerRecipe,
  textareaRecipe,
} from './Textarea.recipe';
import type { TextareaProps } from './Textarea.types';
import { useAutoResize } from './useAutoResize';

/**
 * The canonical multi-line text input — Phase 8 of apx-ds and the **DRY proof of Phase 7**.
 *
 * Textarea shares the **shared form-control recipe** (`controlBase`), the **shared variant ×
 * color matrix** (`variantColorMatrix`), and the **shared a11y hook** (`useFormFieldA11y`) with
 * `<Input />` — zero copy-paste. The only Textarea-specific surface is auto-resize, the
 * character counter, and the `resize` knob. Everything else is inherited.
 *
 * Structurally Textarea mirrors Input's split: a wrapper `<div>` hosts the frame recipe (so the
 * focus ring wraps the counter footer too), and the inner `<textarea>` runs its own recipe for
 * padding / leading / `resize`. The counter floats absolute in the bottom-end corner with
 * `pointer-events-none` so the browser-rendered resize grip stays grabbable.
 *
 * @example
 *   <Textarea placeholder="Tell us about yourself…" />
 *   <Textarea variant="solid" autoResize minRows={2} maxRows={8} />
 *   <Textarea maxLength={500} showCount />
 *   <Textarea invalid aria-describedby="bio-error" />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  props,
  ref,
) {
  const {
    variant,
    size,
    color,
    fullWidth,
    invalid = false,
    disabled = false,
    readOnly = false,
    required = false,
    rows = 3,
    minRows,
    maxRows,
    autoResize = true,
    resize = 'vertical',
    showCount = false,
    maxLength,
    value,
    defaultValue,
    className,
    style,
    sx,
    id: providedId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    onChange,
    ...rest
  } = props;

  const a11y = useFormFieldA11y({
    id: providedId,
    invalid,
    required,
    'aria-describedby': ariaDescribedBy,
  });

  // Auto-resize subscription. `value` drives the layout-effect re-measure path (controlled
  // mode); the input listener inside the hook handles the uncontrolled keystroke path.
  const { textareaRef, currentLength } = useAutoResize({
    enabled: autoResize,
    minRows: minRows ?? rows,
    maxRows,
    value: value ?? defaultValue,
  });

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: textareaRecipe,
    componentName: 'Textarea',
    props: { variant, size, color, fullWidth, className, sx, style },
  });

  const { className: innerClass } = useThemedClasses({
    recipe: textareaInnerRecipe,
    componentName: 'Textarea',
    slot: 'textarea',
    props: { size, resize, autoResize, showCount },
  });

  const { className: countClass } = useThemedClasses({
    recipe: textareaCountRecipe,
    componentName: 'Textarea',
    slot: 'count',
    props: {},
  });

  const textareaElRef = useRef<HTMLTextAreaElement | null>(null);
  useLabelWarning(textareaElRef, ariaLabel, ariaLabelledBy);

  const showFooter = showCount || maxLength !== undefined;
  const atLimit = maxLength !== undefined && currentLength >= maxLength;

  return (
    <div
      className={rootClass}
      style={rootStyle ?? undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-invalid={a11y['data-invalid']}
    >
      <textarea
        ref={mergeRefs(ref, textareaElRef, textareaRef)}
        {...rest}
        id={a11y.id}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={a11y['aria-describedby']}
        aria-invalid={a11y['aria-invalid']}
        aria-required={a11y['aria-required']}
        className={innerClass}
      />
      {showFooter ? (
        <div
          className={countClass}
          aria-hidden="true"
          data-at-limit={atLimit ? 'true' : undefined}
        >
          {maxLength !== undefined ? `${currentLength} / ${maxLength}` : currentLength}
        </div>
      ) : null}
    </div>
  );
}, 'Textarea');

/**
 * Post-mount, dev-only label check. Mirrors `<Input />`'s `INPUT_NO_LABEL` story: fires once if
 * the textarea has no accessible name (no `aria-label`, no `aria-labelledby`, no `<label for>`,
 * no wrapping `<label>` ancestor). Production no-op via the `warn` helper.
 */
function useLabelWarning(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  ariaLabel: string | undefined,
  ariaLabelledBy: string | undefined,
): void {
  useEffect(() => {
    if (ariaLabel || ariaLabelledBy) return;
    const node = ref.current;
    if (!node) return;

    const id = node.id;
    const associated = id
      ? node.ownerDocument.querySelector(`label[for="${cssEscape(id)}"]`)
      : null;
    const wrapping = node.closest('label');

    warn(
      Boolean(associated) || Boolean(wrapping),
      '<Textarea /> needs an accessible name. Wrap with a <label htmlFor>, pass `aria-label`, or use a <Field> wrapper.',
      'TEXTAREA_NO_LABEL',
    );
  }, [ref, ariaLabel, ariaLabelledBy]);
}

function cssEscape(value: string): string {
  // Mirror of the Input helper. Modern browsers + jsdom v22+ ship `CSS.escape`; the manual
  // fallback covers React's `useId` output (`:` prefix) for older environments.
  type Globals = { CSS?: { escape?: (v: string) => string } };
  const g = globalThis as unknown as Globals;
  if (g.CSS?.escape) return g.CSS.escape(value);
  return value.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}

type AnyRef<T> = React.RefCallback<T> | React.MutableRefObject<T | null> | null | undefined;

function mergeRefs<T>(...refs: AnyRef<T>[]): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}