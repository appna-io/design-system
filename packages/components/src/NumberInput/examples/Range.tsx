import { Div, NumberInput } from '@apx-ui/ds';

export default function Range() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <NumberInput aria-label="Percentage 0-100" defaultValue={50} min={0} max={100} />
      <NumberInput aria-label="Even tens" defaultValue={20} min={0} max={1000} step={10} />
      <NumberInput aria-label="Negative balance" defaultValue={-25} min={-100} max={100} />
    </Div>
  );
}