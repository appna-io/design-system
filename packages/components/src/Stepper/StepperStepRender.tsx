'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { AlertCircle, Check } from 'lucide-react';
import { type KeyboardEvent, type ReactNode } from 'react';

import { Spinner } from '../Spinner/Spinner';
import { stepperRecipes } from './Stepper.recipe';
import type { StepStatus, StepperOrientation, StepperSize, StepperVariant } from './Stepper.types';

/**
 * Shared step renderer used by both the array API and the compound API. Pulled out so the two
 * code paths agree on a single visual contract — when we tweak the indicator markup, the
 * connector wiring, or the click affordance, only this file changes.
 *
 * Why a function instead of a component? The array API needs to interleave `<li>` step nodes
 * with `<li>` connector nodes inside an `<ol>`, and `Children.map` over fragments makes the
 * mounting order brittle. Treating step rendering as a pure "produce a `<li>`" function keeps
 * the parent's `<ol>` flat and obvious.
 */

export interface RenderStepArgs {
  /**
   * Reconciliation key used by the parent renderer when this step is part of a list. We accept
   * it on the args object for ergonomic call sites; the StepLi component doesn't read it (React
   * strips `key` from props automatically).
   */
  key: string;
  id: string;
  index: number;
  totalSteps: number;
  label: ReactNode;
  description?: ReactNode | undefined;
  icon?: ReactNode | undefined;
  disabled: boolean;
  content?: ReactNode | undefined;
  status: StepStatus;
  variant: StepperVariant;
  size: StepperSize;
  orientation: StepperOrientation;
  align: 'start' | 'center' | 'end';
  showLabels: boolean;
  showDescriptions: boolean;
  /** Whether the step should render inside a `<button>` shell (clickable-API mode). */
  interactive: boolean;
  /** Whether the button is currently allowed to fire `onStepClick`. False → disabled. */
  clickable: boolean;
  onStepClick: ((info: { id: string; index: number }) => void) | undefined;
  completedIcon: ReactNode | undefined;
  errorIcon: ReactNode | undefined;
  loadingIcon: ReactNode | undefined;
}

export function renderStep(args: RenderStepArgs): ReactNode {
  // Destructure `key` out so the JSX spread doesn't carry it as a prop (React warns when `key`
  // arrives via spread instead of being passed directly).
  const { key: stepKey, ...rest } = args;
  return <StepLi key={stepKey} {...rest} />;
}

function StepLi(args: RenderStepArgs) {
  const {
    // `key` is part of `args` for call-site ergonomics but React filters it out of `props`, so
    // it never lands here at runtime. We don't destructure it (would always be undefined).
    id,
    index,
    totalSteps,
    label,
    description,
    icon,
    disabled,
    content,
    status,
    variant,
    size,
    orientation,
    align,
    showLabels,
    showDescriptions,
    interactive,
    clickable,
    onStepClick,
    completedIcon,
    errorIcon,
    loadingIcon,
  } = args;

  const { className: itemCls } = useThemedClasses({
    recipe: stepperRecipes.item,
    componentName: 'Stepper',
    slot: 'item',
    props: { orientation, align },
  });

  const { className: interactiveCls } = useThemedClasses({
    recipe: stepperRecipes.interactive,
    componentName: 'Stepper',
    slot: 'interactive',
    props: { orientation },
  });

  const { className: indicatorCls } = useThemedClasses({
    recipe: stepperRecipes.indicator,
    componentName: 'Stepper',
    slot: 'indicator',
    props: { variant, size, status },
  });

  const { className: labelCls } = useThemedClasses({
    recipe: stepperRecipes.label,
    componentName: 'Stepper',
    slot: 'label',
    props: { size, status, orientation },
  });

  const { className: descriptionCls } = useThemedClasses({
    recipe: stepperRecipes.description,
    componentName: 'Stepper',
    slot: 'description',
    props: { size },
  });

  const { className: contentCls } = useThemedClasses({
    recipe: stepperRecipes.content,
    componentName: 'Stepper',
    slot: 'content',
    props: { size },
  });

  const stepNumber = index + 1;
  const indicatorContent = renderIndicatorContent({
    status,
    icon,
    stepNumber,
    variant,
    completedIcon,
    errorIcon,
    loadingIcon,
    size,
  });

  // Compose an `aria-label` that screen readers announce in one pass: "Step 2 of 4: Profile,
  // complete." Lives on the interactive shell when interactive (the button takes the focus, so
  // it needs the full label) and on the `<li>` itself otherwise — the `<li>` is `data-stepper-item`
  // and inherits its accessible name from this label without needing an extra explicit role
  // (axe rejects `aria-label` on a `<span>` without role; the `<li>` is an implicit list-item).
  const ariaLabel = composeStepAriaLabel({ stepNumber, totalSteps, label, status });
  const isCurrent = status === 'active';
  const ariaCurrentAttr = isCurrent ? ('step' as const) : undefined;

  // Showing label / description rules:
  //  - `showLabels=false` mutes both label + description blocks entirely (compact indicator-only
  //    horizontal strip). Doesn't affect screen-reader announcements; the indicator still carries
  //    the accessible name through `ariaLabel`.
  //  - `showDescriptions=false` keeps the label visible but mutes the secondary line.
  const labelBlock = showLabels ? (
    <span className="flex flex-col gap-0.5">
      <span className={labelCls}>{label}</span>
      {showDescriptions && description ? (
        <span className={descriptionCls}>{description}</span>
      ) : null}
    </span>
  ) : null;

  // When `interactive=true`, every step renders inside a real `<button type="button">` — the
  // button shell is always present so screen-reader users can Tab through the full list. Linear
  // or per-step `disabled` flips the native `disabled` attribute (which both blocks click and
  // removes the step from the focus order) plus `aria-disabled` for SR clarity.
  //
  // When `interactive=false` (the default, non-clickable stepper), the indicator + label render
  // as plain DOM with no role / no aria-label — the `<li>` carries the data-status + label text
  // natively and SR walks the list as a normal `<ol>`.
  const buttonDisabled = !clickable;
  const handleClick = clickable && onStepClick ? () => onStepClick({ id, index }) : undefined;
  const handleKeyDown = interactive
    ? (e: KeyboardEvent<HTMLButtonElement>) => {
        // Browsers natively handle Enter / Space on buttons; the explicit handler is here so a
        // wrapping consumer that swallows the event still works as expected. No-op for now.
        if (e.key === 'Enter' || e.key === ' ') {
          // Native click fires.
        }
      }
    : undefined;

  return (
    <li
      data-stepper-item=""
      data-status={status}
      data-step-id={id}
      data-disabled={disabled || undefined}
      aria-current={ariaCurrentAttr}
      className={itemCls}
    >
      {interactive ? (
        <button
          type="button"
          aria-label={ariaLabel}
          aria-current={ariaCurrentAttr}
          aria-disabled={buttonDisabled || undefined}
          disabled={buttonDisabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={interactiveCls}
        >
          <span className={indicatorCls} aria-hidden="true">
            {indicatorContent}
          </span>
          {labelBlock}
        </button>
      ) : (
        <>
          <span className={indicatorCls} aria-hidden="true">
            {indicatorContent}
          </span>
          {labelBlock}
        </>
      )}

      {/* Vertical "expanded content" slot: rendered only when the step is active so the body
          stays compact in the inactive state. Consumers can use this for inline forms / error
          messages / sub-task lists that should only appear while the user is on that step. */}
      {orientation === 'vertical' && content && status === 'active' ? (
        <div className={contentCls}>{content}</div>
      ) : null}
    </li>
  );
}

interface IndicatorContentArgs {
  status: StepStatus;
  icon: ReactNode | undefined;
  stepNumber: number;
  variant: StepperVariant;
  completedIcon: ReactNode | undefined;
  errorIcon: ReactNode | undefined;
  loadingIcon: ReactNode | undefined;
  size: StepperSize;
}

/**
 * Resolve the glyph that sits inside the indicator circle.
 *
 * Precedence:
 *  1. Consumer-supplied per-step `icon` always wins (e.g. a brand icon for the "Profile" step).
 *  2. Status-specific overrides (`completedIcon` / `errorIcon` / `loadingIcon` props) win next —
 *     consumers customize once at the root and every applicable step picks it up.
 *  3. Default glyphs: ✓ for complete, ⚠ for error, `<Spinner />` for loading, step number
 *     otherwise. `dots` and `progress` variants suppress the number (the indicator is too
 *     small for digits) — they render `null` and let the indicator paint itself as the marker.
 */
export function renderIndicatorContent(args: IndicatorContentArgs): ReactNode {
  const { status, icon, stepNumber, variant, completedIcon, errorIcon, loadingIcon, size } = args;

  if (icon !== undefined) return icon;

  if (status === 'complete') {
    if (completedIcon !== undefined) return completedIcon;
    return <Check aria-hidden="true" className={defaultIconClass(size)} />;
  }
  if (status === 'error') {
    if (errorIcon !== undefined) return errorIcon;
    return <AlertCircle aria-hidden="true" className={defaultIconClass(size)} />;
  }
  if (status === 'loading') {
    if (loadingIcon !== undefined) return loadingIcon;
    return (
      <Spinner
        size={size === 'lg' ? 'sm' : 'xs'}
        variant="ring"
        thickness={2}
        label="Loading step"
        labelPlacement="hidden"
      />
    );
  }

  if (variant !== 'numbered') return null;
  return stepNumber;
}

function defaultIconClass(size: StepperSize): string {
  if (size === 'sm') return 'h-3 w-3';
  if (size === 'lg') return 'h-5 w-5';
  return 'h-4 w-4';
}

function composeStepAriaLabel(args: {
  stepNumber: number;
  totalSteps: number;
  label: ReactNode;
  status: StepStatus;
}): string {
  const { stepNumber, totalSteps, label, status } = args;
  const labelText = typeof label === 'string' ? label : `Step ${stepNumber}`;
  const statusText = statusToText(status);
  return `Step ${stepNumber} of ${totalSteps}: ${labelText}, ${statusText}`;
}

function statusToText(status: StepStatus): string {
  switch (status) {
    case 'complete':
      return 'complete';
    case 'active':
      return 'in progress';
    case 'error':
      return 'has errors';
    case 'loading':
      return 'loading';
    case 'pending':
    default:
      return 'not started';
  }
}