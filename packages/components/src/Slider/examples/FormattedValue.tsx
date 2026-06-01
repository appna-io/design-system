import { Div, Slider, Typography } from '@apx-ui/ds';

const dollars = (v: number) => `$${v.toFixed(2)}`;
const percent = (v: number) => `${v}%`;
const time = (v: number) =>
  `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;

export default function FormattedValue() {
  return (
    <Div display="flex" flexDirection="column" gap="10" className="w-72 pt-10">
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          Currency
        </Typography>
        <Slider
          aria-label="Budget"
          defaultValue={49.99}
          min={0}
          max={199.99}
          step={0.01}
          showValueLabel="always"
          formatValue={dollars}
        />
      </Div>
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          Percentage
        </Typography>
        <Slider
          aria-label="Opacity"
          defaultValue={62}
          showValueLabel="always"
          formatValue={percent}
        />
      </Div>
      <Div>
        <Typography variant="caption" color="fg.muted" className="mb-2">
          Time (mm:ss)
        </Typography>
        <Slider
          aria-label="Track position"
          defaultValue={73}
          min={0}
          max={240}
          step={1}
          showValueLabel="always"
          formatValue={time}
        />
      </Div>
    </Div>
  );
}