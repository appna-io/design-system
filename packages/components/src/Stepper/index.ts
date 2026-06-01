/**
 * Compound assembly for `<Stepper>`. Same `Object.assign(root, { …subparts })` shape Card,
 * Tabs, Breadcrumbs, Menu, etc. use.
 */
import { StepperRoot } from './Stepper';
import { StepperStep } from './StepperStep';

export const Stepper = Object.assign(StepperRoot, {
  Step: StepperStep,
});

export { useStepperContext } from './StepperContext';
export { isStepClickable, resolveConnectorStatus, resolveStepStatus } from './stepStatus';

export type {
  StepData,
  StepperAlign,
  StepperClickable,
  StepperClickInfo,
  StepperContextValue,
  StepperOrientation,
  StepperProps,
  StepperSize,
  StepperStepProps,
  StepperVariant,
  StepStatus,
} from './Stepper.types';