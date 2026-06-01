import { useState } from 'react';

import { Div, Slider, Typography } from '@apx-ui/ds';

export default function Continuous() {
  const [value, setValue] = useState(0.5);
  return (
    <Div display="flex" flexDirection="column" gap="3" className="w-72 pt-10">
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
      <Typography variant="caption" color="fg.muted">
        step=null → continuous (no snapping). Useful for smooth scrub bars and analog feels.
      </Typography>
    </Div>
  );
}