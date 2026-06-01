import { Div, NumberInput } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <NumberInput aria-label="Outline (default)" defaultValue={42} variant="outline" />
      <NumberInput aria-label="Solid" defaultValue={42} variant="solid" />
      <NumberInput aria-label="Ghost" defaultValue={42} variant="ghost" />
      <NumberInput aria-label="Underline" defaultValue={42} variant="underline" />
    </Div>
  );
}