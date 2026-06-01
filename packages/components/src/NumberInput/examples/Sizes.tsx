import { Div, NumberInput } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <NumberInput aria-label="Small" defaultValue={1} size="sm" />
      <NumberInput aria-label="Medium" defaultValue={1} size="md" />
      <NumberInput aria-label="Large" defaultValue={1} size="lg" />
    </Div>
  );
}