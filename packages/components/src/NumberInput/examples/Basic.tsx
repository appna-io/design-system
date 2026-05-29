import { NumberInput } from 'apx-ds';

export default function Basic() {
  return <NumberInput aria-label="Quantity" defaultValue={1} min={0} max={10} step={1} />;
}
