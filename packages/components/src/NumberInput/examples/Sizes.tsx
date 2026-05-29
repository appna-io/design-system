import { NumberInput } from 'apx-ds';

export default function Sizes() {
  return (
    <div className="space-y-3">
      <NumberInput aria-label="Small" defaultValue={1} size="sm" />
      <NumberInput aria-label="Medium" defaultValue={1} size="md" />
      <NumberInput aria-label="Large" defaultValue={1} size="lg" />
    </div>
  );
}
