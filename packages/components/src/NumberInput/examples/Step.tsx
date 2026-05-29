import { NumberInput } from 'apx-ds';

export default function Step() {
  return (
    <div className="space-y-3">
      <NumberInput
        aria-label="Step 0.5, Shift+Arrow jumps by 5"
        defaultValue={2.5}
        min={0}
        max={100}
        step={0.5}
        largeStep={5}
      />
      <p className="text-xs text-fg-muted">
        Arrow Up/Down steps by 0.5. Hold Shift (or use PageUp/PageDown) to jump by 5. Home → min,
        End → max.
      </p>
    </div>
  );
}
