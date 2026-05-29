import { Select } from 'apx-ds';
import type { SelectColor } from 'apx-ds';
const colors: SelectColor[] = [
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
    <div className="grid grid-cols-2 gap-3 max-w-2xl">
      {colors.map((color) => (
        <Select
          key={color}
          color={color}
          placeholder={`${color[0]?.toUpperCase()}${color.slice(1)}`}
          aria-label={color}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">Option A</Select.Item>
            <Select.Item value="b">Option B</Select.Item>
          </Select.Content>
        </Select>
      ))}
    </div>
  );
}
