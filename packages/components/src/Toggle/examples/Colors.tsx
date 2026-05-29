import { ToggleGroup } from 'apx-ds';
import type { ToggleColor } from 'apx-ds';
const COLORS: ToggleColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

export default function Colors() {
  return (
    <div className="flex flex-col gap-3">
      {COLORS.map((color) => (
        <div key={color} className="flex items-center gap-4">
          <span className="w-20 text-xs font-medium text-fg-muted capitalize">{color}</span>
          <ToggleGroup
            type="single"
            aria-label={`${color} group`}
            defaultValue="b"
            color={color}
            variant="solid"
          >
            <ToggleGroup.Item value="a" aria-label="A">A</ToggleGroup.Item>
            <ToggleGroup.Item value="b" aria-label="B">B</ToggleGroup.Item>
            <ToggleGroup.Item value="c" aria-label="C">C</ToggleGroup.Item>
          </ToggleGroup>
        </div>
      ))}
    </div>
  );
}
