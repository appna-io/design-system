import { NumberInput } from '@apx-ui/ds';

export default function WithLabel() {
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <label htmlFor="number-input-with-label" className="font-medium text-fg-default">
        Quantity
      </label>
      <NumberInput id="number-input-with-label" defaultValue={1} min={1} max={99} step={1} />
      <span className="text-xs text-fg-muted">Between 1 and 99.</span>
    </div>
  );
}
