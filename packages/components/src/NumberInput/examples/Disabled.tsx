import { NumberInput } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <div className="space-y-3">
      <NumberInput aria-label="Disabled" defaultValue={42} disabled />
      <NumberInput aria-label="Read only" defaultValue={42} readOnly />
    </div>
  );
}
