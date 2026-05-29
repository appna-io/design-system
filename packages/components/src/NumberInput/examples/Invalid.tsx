import { NumberInput } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <div className="space-y-2">
      <NumberInput aria-label="Quantity" defaultValue={9999} min={0} max={100} invalid />
      <p className="text-xs text-danger">Value exceeds the allowed maximum (100).</p>
    </div>
  );
}
