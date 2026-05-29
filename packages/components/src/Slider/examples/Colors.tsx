import { Slider } from '@apx-ui/ds';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

export default function Colors() {
  return (
    <div className="w-72 flex flex-col gap-5">
      {COLORS.map((color) => (
        <div key={color}>
          <div className="text-xs text-fg-muted mb-2">{color}</div>
          <Slider aria-label={color} color={color} defaultValue={60} />
        </div>
      ))}
    </div>
  );
}
