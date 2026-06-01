'use client';

import { forwardRef } from '@apx-ui/engine';

import { useStepperContext } from './StepperContext';
import { renderStep } from './StepperStepRender';
import { isStepClickable, resolveStepStatus } from './stepStatus';
import type { StepperStepProps } from './Stepper.types';

/**
 * Internal prop the root injects via `cloneElement` so the subpart knows its position in the
 * compound children list. Not part of the public API — that's why it's a single underscored
 * prop instead of a documented field on `StepperStepProps`.
 */
export interface StepperStepInternalProps extends StepperStepProps {
  /** @internal — index assigned by the root's `Children.toArray` walk. */
  __stepperIndex?: number;
}

/**
 * Compound subpart. A `<Stepper.Step>` is roughly equivalent to one row of the array API,
 * except it owns its own JSX so consumers can:
 *   - Render rich label nodes (icons, badges, links) without serializing to `ReactNode` in data.
 *   - Place inline expanded content (`<form>` / `<ErrorMessage>` / etc.) under the active step.
 *   - Mix-and-match per-step props without rewriting an entire `steps={…}` array on every change.
 *
 * The root walks its children once per render and injects `__stepperIndex` via `cloneElement` so
 * the subpart knows its 0-based position without a registry round-trip. Index is the only
 * piece the subpart can't derive locally — variant / size / orientation / clickable rules all
 * flow through `<StepperContext>`.
 *
 * The subpart **does not** render its own `<li>` — `renderStep` (shared with the array API)
 * does that. This keeps the visual contract identical across both APIs; if we tweak the
 * indicator markup in `StepperStepRender.tsx`, both APIs pick it up for free.
 */
export const StepperStep = forwardRef<HTMLLIElement, StepperStepProps>(
  function StepperStep(props, _ref) {
    const ctx = useStepperContext('Stepper.Step');
    const {
      id,
      label,
      description,
      status: explicitStatus,
      icon,
      disabled = false,
      children,
      __stepperIndex,
    } = props as StepperStepInternalProps;

    // The root always injects __stepperIndex; the `?? 0` fallback only fires if a consumer
    // hand-rolls a `<Stepper.Step>` outside `<Stepper>` (which throws from useStepperContext
    // before this line is reached anyway).
    const index = __stepperIndex ?? 0;

    const status = resolveStepStatus({
      index,
      activeIndex: ctx.activeIndex,
      explicit: explicitStatus,
    });

    const clickable = isStepClickable({
      index,
      activeIndex: ctx.activeIndex,
      status,
      clickable: ctx.clickable,
      linear: ctx.linear,
      disabled,
    });
    const interactive = ctx.clickable !== false;

    return (
      <>
        {renderStep({
          key: id,
          id,
          index,
          totalSteps: ctx.totalSteps,
          label,
          description,
          icon,
          disabled,
          content: children,
          status,
          variant: ctx.variant,
          size: ctx.size,
          orientation: ctx.orientation,
          align: ctx.align,
          showLabels: ctx.showLabels,
          showDescriptions: ctx.showDescriptions,
          interactive,
          clickable,
          onStepClick: ctx.onStepClick,
          completedIcon: ctx.completedIcon,
          errorIcon: ctx.errorIcon,
          loadingIcon: ctx.loadingIcon,
        })}
      </>
    );
  },
  'Stepper.Step',
);