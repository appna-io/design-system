import { Stepper } from '@apx-ui/ds';

const STEPS = [
  { id: 'a', label: 'Account' },
  { id: 'b', label: 'Profile' },
  { id: 'c', label: 'Plan' },
];

export default function Sizes() {
  return (
    <div className="flex flex-col gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-fg-muted">{size}</span>
          <Stepper active={1} steps={STEPS} size={size} />
        </div>
      ))}
    </div>
  );
}
