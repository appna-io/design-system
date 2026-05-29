import { NumberInput } from '@apx-ui/ds';

export default function HiddenSteppers() {
  return (
    <div className="space-y-2">
      <NumberInput aria-label="No stepper buttons" defaultValue={42} hideStepperButtons />
      <p className="text-xs text-fg-muted">
        Stepper buttons hidden — arrows / PageUp / PageDown / Home / End still work on the input
        itself.
      </p>
    </div>
  );
}
