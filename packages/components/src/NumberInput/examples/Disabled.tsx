import { Div, NumberInput } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <NumberInput aria-label="Disabled" defaultValue={42} disabled />
      <NumberInput aria-label="Read only" defaultValue={42} readOnly />
    </Div>
  );
}