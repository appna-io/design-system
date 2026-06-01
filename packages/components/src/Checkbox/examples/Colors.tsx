import { Checkbox, Div, type CheckboxColor } from '@apx-ui/ds';

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
    <Div display="flex" flexDirection="column" gap="2">
      {COLORS.map((color) => (
        <Checkbox key={color} color={color} defaultChecked>
          {color.charAt(0).toUpperCase() + color.slice(1)}
        </Checkbox>
      ))}
    </Div>
  );
}