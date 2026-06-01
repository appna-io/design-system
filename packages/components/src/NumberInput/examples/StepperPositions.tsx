import { Div, NumberInput } from '@apx-ui/ds';

export default function StepperPositions() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <NumberInput aria-label="Stepper position end (default)" defaultValue={5} stepperPosition="end" />
      <NumberInput aria-label="Stepper position start" defaultValue={5} stepperPosition="start" />
      <NumberInput aria-label="Stepper position split" defaultValue={5} stepperPosition="split" />
    </Div>
  );
}