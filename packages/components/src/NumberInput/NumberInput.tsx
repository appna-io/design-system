'use client';

import {
  forwardRef,
  useControllableState,
  useId,
  warn,
} from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type WheelEvent,
} from 'react';

import { inputInnerRecipe, inputRecipe } from '../Input/Input.recipe';
import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import { clampToRange, roundToPrecision } from './clampToRange';
import { formatNumber } from './formatNumber';
import { stepperButtonRecipe, stepperGroupRecipe } from './NumberInput.recipe';
import type {
  NumberInputProps,
  NumberInputSize,
  StepperPosition,
} from './NumberInput.types';
import { parseLocalizedNumber } from './parseLocalizedNumber';
import { useStepperHold } from './useStepperHold';

const DEFAULT_LOCALE_FALLBACK = 'en-US';

/**
 * Numeric form control. Renders a text-mode `<input>` wearing Input's frame, with a typed
 * `number | null` value, locale-aware formatting and parsing (`Intl.NumberFormat` + a custom
 * locale-aware parser that also handles Arabic-Indic / Persian digits), clamping, precision
 * rounding, an accelerating mouse-hold stepper repeat, and full keyboard control (arrows,
 * Shift+arrow / PageUp / PageDown for `largeStep`, Home/End for min/max, Enter to commit, Esc to
 * revert).
 *
 * A hidden `<input type="hidden">` carries the canonical numeric string so HTML form submission
 * always sees the un-formatted value (no thousand separators, no currency glyphs).
 *
 * Why a separate component vs. `<Input type="number">`: native `type=number` accepts scientific
 * notation, silently rejects bad input on blur, has no thousand separator story, and renders the
 * ugly browser-vendored spinner — none of which we want. NumberInput owns all of that.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(props, ref) {
    const {
      value: valueProp,
      defaultValue,
      onChange,
      onChangeEnd,
      min,
      max,
      step = 1,
      largeStep,
      precision,
      clampOnBlur = true,
      allowNegative = true,
      allowDecimals = true,
      locale: localeProp,
      format,
      parse,
      hideStepperButtons = false,
      stepperPosition = 'end',
      enableScrollWheel = false,
      variant,
      size,
      color,
      fullWidth,
      invalid = false,
      disabled = false,
      readOnly = false,
      required = false,
      name,
      id: providedId,
      placeholder,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      incrementLabel = 'Increment',
      decrementLabel = 'Decrement',
      leftAddon,
      rightAddon,
      onFocus,
      onBlur,
      onKeyDown,
      className,
      style,
      sx,
    } = props;

    // Browser-default locale fallback. Reading once per render is fine — `Intl.Locale` lookups are
    // cached internally and we always pass the resolved string to the formatter cache anyway.
    const locale = localeProp ?? readBrowserLocale();
    const effectiveLargeStep = largeStep ?? step * 10;

    const [committedValue, setCommittedValue] = useControllableState<number | null>({
      value: valueProp,
      defaultValue: defaultValue ?? null,
      onChange,
    });
    const value: number | null = committedValue ?? null;

    // `displayValue` is what the user sees in the input. Diverges from `committedValue` only
    // while the user is actively typing — on blur / Enter we re-format from the committed value.
    const [displayValue, setDisplayValue] = useState<string>(() =>
      formatNumber(value, locale, format),
    );
    const [isEditing, setIsEditing] = useState(false);
    // The last committed value at the moment focus was acquired — used to revert on Esc.
    const focusedValueRef = useRef<number | null>(value);

    // Reformat the display when the committed value changes from outside (controlled flow) AND
    // the user isn't currently editing. Skipping the update during edit preserves typing in
    // progress (e.g. partial input like `1.` while typing `1.5`).
    useEffect(() => {
      if (!isEditing) {
        setDisplayValue(formatNumber(value, locale, format));
      }
    }, [value, locale, format, isEditing]);

    const a11y = useFormFieldA11y({
      id: providedId,
      invalid,
      required,
      'aria-describedby': ariaDescribedBy,
    });

    const reactId = useId();
    const hiddenId = `${reactId}-hidden`;

    const isAtMin = value !== null && typeof min === 'number' && value <= min;
    const isAtMax = value !== null && typeof max === 'number' && value >= max;

    // Apply the consumer's clamp + precision in one place so every entry path (typing, stepper,
    // keyboard, wheel) emits a value with the same shape.
    const finalize = useCallback(
      (next: number | null, opts: { clamp?: boolean } = {}): number | null => {
        if (next === null) return null;
        let result = next;
        if (opts.clamp ?? true) result = clampToRange(result, min, max);
        result = roundToPrecision(result, precision);
        return result;
      },
      [min, max, precision],
    );

    const commit = useCallback(
      (next: number | null, opts: { clamp?: boolean; emitEnd?: boolean } = {}) => {
        const finalized = finalize(next, opts.clamp === undefined ? {} : { clamp: opts.clamp });
        setCommittedValue(finalized);
        setDisplayValue(formatNumber(finalized, locale, format));
        if (opts.emitEnd) onChangeEnd?.(finalized);
      },
      [finalize, format, locale, onChangeEnd, setCommittedValue],
    );

    // Stepper helpers ─ never go past the consumer's bounds.
    const stepBy = useCallback(
      (delta: number) => {
        if (disabled || readOnly) return;
        const base = value ?? 0;
        const next = finalize(base + delta);
        setCommittedValue(next);
        setDisplayValue(formatNumber(next, locale, format));
      },
      [disabled, readOnly, value, finalize, format, locale, setCommittedValue],
    );

    const incrementHold = useStepperHold(() => stepBy(step), disabled || readOnly || isAtMax);
    const decrementHold = useStepperHold(() => stepBy(-step), disabled || readOnly || isAtMin);

    // ──────────────────────────────────────────────────────────────────────────────────────────
    // Event wiring
    // ──────────────────────────────────────────────────────────────────────────────────────────

    const handleChange = (event: { target: { value: string } }) => {
      const raw = event.target.value;
      setDisplayValue(raw);
      setIsEditing(true);
      if (raw.trim() === '') {
        setCommittedValue(null);
        return;
      }
      // Block forbidden characters defensively even though we don't actively prevent keydown.
      // `parseLocalizedNumber` returns null for anything it can't make sense of.
      const parser = parse ?? parseLocalizedNumber;
      const parsed = parser(raw, locale);
      if (parsed === null) return;
      if (!allowNegative && parsed < 0) return;
      if (!allowDecimals && !Number.isInteger(parsed)) return;
      // Don't clamp while typing — clamping mid-keystroke makes it impossible to type a value
      // that's temporarily out-of-range (e.g. `1` in a 10–100 field on the way to `100`).
      setCommittedValue(finalize(parsed, { clamp: false }));
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      focusedValueRef.current = value;
      onFocus?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsEditing(false);
      // On commit: re-parse the display string fresh (handles cases where the consumer's
      // controlled flow rejected an out-of-range value mid-edit and the input still shows the
      // original text), clamp if requested, then format the canonical value back in.
      const parser = parse ?? parseLocalizedNumber;
      const parsed = parser(displayValue, locale);
      commit(parsed, { clamp: clampOnBlur, emitEnd: true });
      onBlur?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (disabled || readOnly) return;
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          stepBy(event.shiftKey ? effectiveLargeStep : step);
          break;
        case 'ArrowDown':
          event.preventDefault();
          stepBy(-(event.shiftKey ? effectiveLargeStep : step));
          break;
        case 'PageUp':
          event.preventDefault();
          stepBy(effectiveLargeStep);
          break;
        case 'PageDown':
          event.preventDefault();
          stepBy(-effectiveLargeStep);
          break;
        case 'Home':
          if (typeof min === 'number') {
            event.preventDefault();
            commit(min);
          }
          break;
        case 'End':
          if (typeof max === 'number') {
            event.preventDefault();
            commit(max);
          }
          break;
        case 'Enter':
          event.preventDefault();
          {
            const parser = parse ?? parseLocalizedNumber;
            const parsed = parser(displayValue, locale);
            commit(parsed, { clamp: clampOnBlur, emitEnd: true });
            setIsEditing(false);
          }
          break;
        case 'Escape': {
          event.preventDefault();
          const reverted = focusedValueRef.current;
          setCommittedValue(reverted);
          setDisplayValue(formatNumber(reverted, locale, format));
          setIsEditing(false);
          break;
        }
        default:
          break;
      }
    };

    const handleWheel = (event: WheelEvent<HTMLInputElement>) => {
      if (!enableScrollWheel) return;
      if (disabled || readOnly) return;
      // Only act when the input is actually focused so a page-scroll over an unfocused
      // NumberInput doesn't surprise the user with a value change.
      if (document.activeElement !== event.currentTarget) return;
      event.preventDefault();
      const delta = event.shiftKey ? effectiveLargeStep : step;
      stepBy(event.deltaY < 0 ? delta : -delta);
    };

    // ──────────────────────────────────────────────────────────────────────────────────────────
    // Recipe class strings
    // ──────────────────────────────────────────────────────────────────────────────────────────

    const { className: rootClass, style: rootStyle } = useThemedClasses({
      recipe: inputRecipe,
      componentName: 'Input',
      props: { variant, size, color, fullWidth, className, sx, style },
    });

    const { className: innerClass } = useThemedClasses({
      recipe: inputInnerRecipe,
      componentName: 'Input',
      slot: 'input',
      props: {
        size,
        hasLeftIcon: false,
        hasRightIcon: false,
        hasLeftAddon: Boolean(leftAddon),
        hasRightAddon: Boolean(rightAddon) || (!hideStepperButtons && stepperPosition !== 'split'),
      },
    });

    // Dev-only: warn once if no accessible name is wired up. Mirrors Input.
    const inputElRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
      if (ariaLabel || ariaLabelledBy) return;
      const node = inputElRef.current;
      if (!node) return;
      const associated = node.ownerDocument.querySelector(
        `label[for="${cssEscape(node.id)}"]`,
      );
      const wrapping = node.closest('label');
      warn(
        Boolean(associated) || Boolean(wrapping),
        '<NumberInput /> needs an accessible name. Wrap with a <label htmlFor>, pass `aria-label`, or use a <Field> wrapper.',
        'NUMBER_INPUT_NO_LABEL',
      );
    }, [ariaLabel, ariaLabelledBy]);

    const effectiveSize = resolveBaseSize(size);

    return (
      <div
        className={rootClass}
        style={rootStyle ?? undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-invalid={a11y['data-invalid']}
      >
        {leftAddon ? <span className="flex shrink-0 items-center ps-3 text-fg-muted [&_svg]:size-[1em]">{leftAddon}</span> : null}
        {!hideStepperButtons && stepperPosition === 'split' ? (
          <StepperGroup
            position="start"
            size={effectiveSize}
            color={resolveColor(color)}
            decrementLabel={decrementLabel}
            disabledDecrement={disabled || readOnly || isAtMin}
            decrementHold={decrementHold}
          />
        ) : null}
        <input
          ref={mergeRefs(ref, inputElRef)}
          type="text"
          inputMode={allowDecimals ? 'decimal' : 'numeric'}
          autoComplete="off"
          spellCheck={false}
          id={a11y.id}
          name={name ? undefined : undefined /* hidden input owns submission */}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={a11y['aria-describedby']}
          aria-invalid={a11y['aria-invalid']}
          aria-required={a11y['aria-required']}
          role="spinbutton"
          aria-valuenow={value ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={displayValue || undefined}
          className={innerClass}
        />
        {rightAddon ? <span className="flex shrink-0 items-center pe-3 text-fg-muted [&_svg]:size-[1em]">{rightAddon}</span> : null}
        {!hideStepperButtons && stepperPosition !== 'split' ? (
          <StackedSteppers
            position={stepperPosition}
            size={effectiveSize}
            color={resolveColor(color)}
            incrementLabel={incrementLabel}
            decrementLabel={decrementLabel}
            disabledIncrement={disabled || readOnly || isAtMax}
            disabledDecrement={disabled || readOnly || isAtMin}
            incrementHold={incrementHold}
            decrementHold={decrementHold}
          />
        ) : null}
        {!hideStepperButtons && stepperPosition === 'split' ? (
          <StepperGroup
            position="end"
            size={effectiveSize}
            color={resolveColor(color)}
            incrementLabel={incrementLabel}
            disabledIncrement={disabled || readOnly || isAtMax}
            incrementHold={incrementHold}
          />
        ) : null}
        {name ? (
          <input id={hiddenId} type="hidden" name={name} value={value === null ? '' : String(value)} />
        ) : null}
      </div>
    );
  },
  'NumberInput',
);

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Subcomponents — kept private since they're trivial layout primitives bound to NumberInput's
// internal mode switching. Promoting them would re-introduce the prop drilling that motivated
// `useStepperHold` in the first place.
// ────────────────────────────────────────────────────────────────────────────────────────────────

interface StackedSteppersProps {
  position: Exclude<StepperPosition, 'split'>;
  size: NumberInputSize;
  color: NumberInputProps['color'];
  incrementLabel: string;
  decrementLabel: string;
  disabledIncrement: boolean;
  disabledDecrement: boolean;
  incrementHold: ReturnType<typeof useStepperHold>;
  decrementHold: ReturnType<typeof useStepperHold>;
}

function StackedSteppers(props: StackedSteppersProps) {
  const { position, size, color, incrementLabel, decrementLabel } = props;
  const groupClass = useStepperGroupClass(position, size);
  const upClass = useStepperButtonClass(size, 'top', color);
  const downClass = useStepperButtonClass(size, 'bottom', color);
  return (
    <div className={groupClass}>
      <button
        type="button"
        tabIndex={-1}
        aria-label={incrementLabel}
        disabled={props.disabledIncrement}
        className={upClass}
        onPointerDown={props.incrementHold.onPointerDown}
        onPointerUp={props.incrementHold.onPointerUp}
        onPointerLeave={props.incrementHold.onPointerUp}
        onPointerCancel={props.incrementHold.onPointerUp}
      >
        <ChevronUp />
      </button>
      <button
        type="button"
        tabIndex={-1}
        aria-label={decrementLabel}
        disabled={props.disabledDecrement}
        className={downClass}
        onPointerDown={props.decrementHold.onPointerDown}
        onPointerUp={props.decrementHold.onPointerUp}
        onPointerLeave={props.decrementHold.onPointerUp}
        onPointerCancel={props.decrementHold.onPointerUp}
      >
        <ChevronDown />
      </button>
    </div>
  );
}

interface StepperGroupProps {
  position: 'start' | 'end';
  size: NumberInputSize;
  color: NumberInputProps['color'];
  incrementLabel?: string;
  decrementLabel?: string;
  disabledIncrement?: boolean;
  disabledDecrement?: boolean;
  incrementHold?: ReturnType<typeof useStepperHold>;
  decrementHold?: ReturnType<typeof useStepperHold>;
}

function StepperGroup(props: StepperGroupProps) {
  const groupClass = useStepperGroupClass(props.position, props.size);
  const btnClass = useStepperButtonClass(props.size, 'none', props.color);
  // In split mode each side hosts exactly one button.
  if (props.position === 'start' && props.decrementHold && props.decrementLabel) {
    return (
      <div className={groupClass}>
        <button
          type="button"
          tabIndex={-1}
          aria-label={props.decrementLabel}
          disabled={props.disabledDecrement}
          className={btnClass}
          onPointerDown={props.decrementHold.onPointerDown}
          onPointerUp={props.decrementHold.onPointerUp}
          onPointerLeave={props.decrementHold.onPointerUp}
          onPointerCancel={props.decrementHold.onPointerUp}
        >
          <Minus />
        </button>
      </div>
    );
  }
  if (props.position === 'end' && props.incrementHold && props.incrementLabel) {
    return (
      <div className={groupClass}>
        <button
          type="button"
          tabIndex={-1}
          aria-label={props.incrementLabel}
          disabled={props.disabledIncrement}
          className={btnClass}
          onPointerDown={props.incrementHold.onPointerDown}
          onPointerUp={props.incrementHold.onPointerUp}
          onPointerLeave={props.incrementHold.onPointerUp}
          onPointerCancel={props.incrementHold.onPointerUp}
        >
          <Plus />
        </button>
      </div>
    );
  }
  return null;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────────────────────

function useStepperGroupClass(position: StepperPosition, size: NumberInputSize): string {
  const { className } = useThemedClasses({
    recipe: stepperGroupRecipe,
    componentName: 'NumberInput',
    slot: 'stepperGroup',
    props: { position, size },
  });
  return className;
}

function useStepperButtonClass(
  size: NumberInputSize,
  edge: 'top' | 'bottom' | 'none',
  color: NumberInputProps['color'],
): string {
  const { className } = useThemedClasses({
    recipe: stepperButtonRecipe,
    componentName: 'NumberInput',
    slot: 'stepperButton',
    props: { size, edge, color: resolveColor(color) },
  });
  return className;
}

function resolveColor(value: NumberInputProps['color']): NonNullable<NumberInputProps['color']> {
  if (value === undefined) return 'primary';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, NonNullable<NumberInputProps['color']>>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'primary';
  }
  return 'primary';
}

function resolveBaseSize(value: NumberInputProps['size']): NumberInputSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, NumberInputSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}

function readBrowserLocale(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.language || DEFAULT_LOCALE_FALLBACK;
  }
  return DEFAULT_LOCALE_FALLBACK;
}

function cssEscape(value: string): string {
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

// Tiny inline glyph SVGs — same approach as Avatar's user icon. No `lucide-react` import.

function ChevronUp() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="0.85em"
      height="0.85em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m3 7.5 3-3 3 3" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="0.85em"
      height="0.85em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m3 4.5 3 3 3-3" />
    </svg>
  );
}

function Plus() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="0.85em"
      height="0.85em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 2.5v7M2.5 6h7" />
    </svg>
  );
}

function Minus() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="0.85em"
      height="0.85em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M2.5 6h7" />
    </svg>
  );
}

// Keep this for tests / future composition; placed at the end so the file's top reads as the
// component body.
export { formatNumber, parseLocalizedNumber, clampToRange, roundToPrecision };
