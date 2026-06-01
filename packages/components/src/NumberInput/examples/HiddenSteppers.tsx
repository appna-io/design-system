import { Div, NumberInput, Typography } from '@apx-ui/ds';

export default function HiddenSteppers() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <NumberInput aria-label="No stepper buttons" defaultValue={42} hideStepperButtons />
      <Typography variant="caption" color="fg.muted">
        Stepper buttons hidden — arrows / PageUp / PageDown / Home / End still work on the input
        itself.
      </Typography>
    </Div>
  );
}