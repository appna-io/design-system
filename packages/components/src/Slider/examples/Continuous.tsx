import { useState } from 'react';
import { Slider } from 'apx-ds';

export default function Continuous() {
  const [value, setValue] = useState(0.5);
  return (
    <div className="w-72 flex flex-col gap-3 pt-10">
      <Slider
        aria-label="Continuous"
        value={value}
        onChange={(v) => setValue(v as number)}
        min={0}
        max={1}
        step={null}
        showValueLabel="always"
        formatValue={(v) => v.toFixed(3)}
      />
      <p className="text-xs text-fg-muted">
        step=null → continuous (no snapping). Useful for smooth scrub bars and analog feels.
      </p>
    </div>
  );
}
