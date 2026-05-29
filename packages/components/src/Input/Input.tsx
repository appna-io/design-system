'use client';

import { forwardRef, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { motion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';

import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import { inputAddonRecipe, inputInnerRecipe, inputRecipe } from './Input.recipe';
import type { InputProps, InputSize } from './Input.types';

const SPINNER_MOTION = {
  animate: { rotate: 360 },
  transition: {
    repeat: Infinity,
    duration: 1.2,
    ease: 'linear' as const,
  },
};

function Spinner() {
  return (
    <motion.span
      {...SPINNER_MOTION}
      role="status"
      aria-label="Loading"
      className="inline-block size-[1em] shrink-0 rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
    />
  );
}

/**
 * The canonical single-line text input — the **second reference component** after Button.
 *
 * Input's surface is intentionally rich (border, focus ring, addons, icons, invalid + busy state)
 * so it doubles as the proving ground for the **shared form-control recipe** and the
 * **`useFormFieldA11y` hook** that every later form control (Textarea, Select shell, …) reuses
 * without modification.
 *
 * The component never builds class strings itself; the styling is owned by three recipes:
 *
 *  - `inputRecipe` paints the bordered focus-ring frame on the wrapper.
 *  - `inputInnerRecipe` owns the bare `<input>`'s padding-X + per-size font.
 *  - `inputAddonRecipe` styles the optional left/right sibling `<span>` add-ons.
 *
 * Each recipe is fed through `useThemedClasses` so theme-level overrides (`theme.components.Input`),
 * instance-level `className`, and theme-aware `sx` all merge through the same precedence ladder.
 *
 * @example
 *   <Input placeholder="Email" type="email" />
 *   <Input variant="solid" leftIcon={<Mail />} rightIcon={<X />} />
 *   <Input leftAddon="https://" rightAddon=".com" />
 *   <Input invalid aria-describedby="email-error" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const {
    variant,
    size,
    color,
    fullWidth,
    leftIcon,
    rightIcon,
    leftAddon,
    rightAddon,
    invalid = false,
    disabled = false,
    loading = false,
    readOnly = false,
    required = false,
    htmlSize,
    className,
    style,
    sx,
    id: providedId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props;

  const a11y = useFormFieldA11y({
    id: providedId,
    invalid,
    required,
    'aria-describedby': ariaDescribedBy,
  });

  // Surfacing presence flags into the recipe lets compound variants react to "has icon" without
  // the component ever writing an `if (leftIcon)` branch.
  const hasLeftIcon = Boolean(leftIcon);
  const hasRightIcon = Boolean(rightIcon) || loading;
  const hasLeftAddon = Boolean(leftAddon);
  const hasRightAddon = Boolean(rightAddon);
  const isDisabled = disabled;
  const isReadOnly = readOnly || loading;
  const effectiveSize = resolveBaseSize(size);

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: inputRecipe,
    componentName: 'Input',
    props: { variant, size, color, fullWidth, className, sx, style },
  });

  const { className: innerClass } = useThemedClasses({
    recipe: inputInnerRecipe,
    componentName: 'Input',
    slot: 'input',
    props: { size, hasLeftIcon, hasRightIcon, hasLeftAddon, hasRightAddon },
  });

  const inputElRef = useRef<HTMLInputElement | null>(null);
  useLabelWarning(inputElRef, ariaLabel, ariaLabelledBy);

  return (
    <div
      className={rootClass}
      style={rootStyle ?? undefined}
      data-disabled={isDisabled ? 'true' : undefined}
      data-invalid={a11y['data-invalid']}
      aria-busy={loading || undefined}
    >
      {leftAddon ? (
        <Addon side="left" size={effectiveSize}>
          {leftAddon}
        </Addon>
      ) : null}
      {leftIcon ? (
        <span className="flex shrink-0 items-center ps-3 text-fg-muted [&_svg]:size-[1em]">
          {leftIcon}
        </span>
      ) : null}
      <input
        ref={mergeRefs(ref, inputElRef)}
        {...rest}
        id={a11y.id}
        size={htmlSize}
        disabled={isDisabled}
        readOnly={isReadOnly}
        required={required}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={a11y['aria-describedby']}
        aria-invalid={a11y['aria-invalid']}
        aria-required={a11y['aria-required']}
        aria-busy={loading || undefined}
        className={innerClass}
      />
      {loading ? (
        <span className="flex shrink-0 items-center pe-3 text-fg-muted [&_svg]:size-[1em]">
          <Spinner />
        </span>
      ) : rightIcon ? (
        <span className="flex shrink-0 items-center pe-3 text-fg-muted [&_svg]:size-[1em]">
          {rightIcon}
        </span>
      ) : null}
      {rightAddon ? (
        <Addon side="right" size={effectiveSize}>
          {rightAddon}
        </Addon>
      ) : null}
    </div>
  );
}, 'Input');

interface AddonProps {
  side: 'left' | 'right';
  size: InputSize;
  children: ReactNode;
}

function Addon({ side, size, children }: AddonProps) {
  const { className } = useThemedClasses({
    recipe: inputAddonRecipe,
    componentName: 'Input',
    slot: side === 'left' ? 'leftAddon' : 'rightAddon',
    props: { size, side },
  });
  return <span className={className}>{children}</span>;
}

/**
 * Returns the non-responsive `size` value used by the addon + spinner. Addons read this once on
 * each render — we don't need full responsive resolution because the wrapper recipe already
 * carries the per-size height, and the addon stretches to match via `self-stretch`.
 */
function resolveBaseSize(value: InputProps['size']): InputSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, InputSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}

/**
 * Post-mount, dev-only label check. Fires the engine `warn` once if the input has no accessible
 * name — meaning no `aria-label`, no `aria-labelledby`, no associated `<label for>`, and no
 * wrapping `<label>` ancestor. Runs in a layout-effect-equivalent useEffect so the DOM is settled
 * before we walk it.
 */
function useLabelWarning(
  ref: React.RefObject<HTMLInputElement | null>,
  ariaLabel: string | undefined,
  ariaLabelledBy: string | undefined,
): void {
  useEffect(() => {
    if (ariaLabel || ariaLabelledBy) return;
    const node = ref.current;
    if (!node) return;

    const id = node.id;
    const associated = id ? node.ownerDocument.querySelector(`label[for="${cssEscape(id)}"]`) : null;
    const wrapping = node.closest('label');

    warn(
      Boolean(associated) || Boolean(wrapping),
      '<Input /> needs an accessible name. Wrap with a <label htmlFor>, pass `aria-label`, or use a <Field> wrapper.',
      'INPUT_NO_LABEL',
    );
  }, [ref, ariaLabel, ariaLabelledBy]);
}

function cssEscape(value: string): string {
  // Modern browsers (and jsdom v22+) expose `CSS.escape`. Fall back to a paranoid escape for the
  // characters `useId` is known to emit (`:` is the typical one in React 18+ ids).
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
