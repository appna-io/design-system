import { Slider } from '@apx-ui/ds';

export default function Invalid() {
  return (
    <div className="w-72 flex flex-col gap-3">
      <Slider aria-label="Out of range" invalid defaultValue={95} />
      <p className="text-xs text-danger">Value exceeds the recommended threshold.</p>
    </div>
  );
}
