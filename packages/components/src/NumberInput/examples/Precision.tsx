import { Div, NumberInput } from '@apx-ui/ds';

export default function Precision() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <NumberInput aria-label="0 decimal places" defaultValue={3.456} step={0.1} precision={0} />
      <NumberInput aria-label="2 decimal places" defaultValue={3.456} step={0.001} precision={2} />
      <NumberInput aria-label="4 decimal places" defaultValue={3.45678} step={0.0001} precision={4} />
    </Div>
  );
}