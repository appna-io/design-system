import { Slider } from '@apx-ui/ds';

const dollars = (v: number) => `$${v.toFixed(2)}`;
const percent = (v: number) => `${v}%`;
const time = (v: number) =>
  `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;

export default function FormattedValue() {
  return (
    <div className="w-72 flex flex-col gap-10 pt-10">
      <div>
        <div className="text-xs text-fg-muted mb-2">Currency</div>
        <Slider
          aria-label="Budget"
          defaultValue={49.99}
          min={0}
          max={199.99}
          step={0.01}
          showValueLabel="always"
          formatValue={dollars}
        />
      </div>
      <div>
        <div className="text-xs text-fg-muted mb-2">Percentage</div>
        <Slider
          aria-label="Opacity"
          defaultValue={62}
          showValueLabel="always"
          formatValue={percent}
        />
      </div>
      <div>
        <div className="text-xs text-fg-muted mb-2">Time (mm:ss)</div>
        <Slider
          aria-label="Track position"
          defaultValue={73}
          min={0}
          max={240}
          step={1}
          showValueLabel="always"
          formatValue={time}
        />
      </div>
    </div>
  );
}
