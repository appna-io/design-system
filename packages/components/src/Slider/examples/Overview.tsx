import { useState } from 'react';

import { Div, Slider, Typography } from '@apx-ui/ds';

export default function Overview() {
  const [opacity, setOpacity] = useState(0.65);

  return (
    <Div display="flex" flexDirection="column" gap="10" className="w-72 pt-6">
      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" color="fg.muted">
          Price range
        </Typography>
        <Slider
          mode="range"
          aria-label="Price range"
          defaultValue={[25, 75]}
          min={0}
          max={100}
          step={25}
          showValueLabel="always"
          formatValue={(v) => `$${v}`}
          marks={[
            { value: 0, label: '$0' },
            { value: 25, label: '$25' },
            { value: 50, label: '$50' },
            { value: 75, label: '$75' },
            { value: 100, label: '$100' },
          ]}
        />
      </Div>

      <Div display="flex" flexDirection="column" gap="2">
        <Typography variant="caption" color="fg.muted">
          Opacity (continuous)
        </Typography>
        <Slider
          aria-label="Opacity"
          value={opacity}
          onChange={(v) => setOpacity(v as number)}
          min={0}
          max={1}
          step={null}
          showValueLabel="always"
          formatValue={(v) => `${Math.round(v * 100)}%`}
        />
      </Div>
    </Div>
  );
}