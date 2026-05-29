import { NumberInput } from 'apx-ds';

export default function Range() {
  return (
    <div className="space-y-3">
      <NumberInput aria-label="Percentage 0-100" defaultValue={50} min={0} max={100} />
      <NumberInput aria-label="Even tens" defaultValue={20} min={0} max={1000} step={10} />
      <NumberInput aria-label="Negative balance" defaultValue={-25} min={-100} max={100} />
    </div>
  );
}
