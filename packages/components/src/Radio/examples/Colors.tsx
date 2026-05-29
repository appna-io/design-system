import { Radio, RadioGroup, type RadioColor } from '@apx-ui/ds';

const COLORS: readonly RadioColor[] = [
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
        <RadioGroup
          key={color}
          color={color}
          defaultValue="x"
          aria-label={`${color} radio`}
        >
          <Radio value="x">{color.charAt(0).toUpperCase() + color.slice(1)}</Radio>
        </RadioGroup>
      ))}
    </div>
  );
}
