import { Checkbox, type CheckboxColor } from '@apx-ui/ds';

const COLORS: readonly CheckboxColor[] = [
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
    <div className="flex flex-col gap-2">
      {COLORS.map((color) => (
        <Checkbox key={color} color={color} defaultChecked>
          {color.charAt(0).toUpperCase() + color.slice(1)}
        </Checkbox>
      ))}
    </div>
  );
}
