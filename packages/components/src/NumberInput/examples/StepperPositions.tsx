import { NumberInput } from 'apx-ds';

export default function StepperPositions() {
  return (
    <div className="space-y-3">
      <NumberInput aria-label="Stepper position end (default)" defaultValue={5} stepperPosition="end" />
      <NumberInput aria-label="Stepper position start" defaultValue={5} stepperPosition="start" />
      <NumberInput aria-label="Stepper position split" defaultValue={5} stepperPosition="split" />
    </div>
  );
}
