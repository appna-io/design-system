import { Div, ToggleGroup, Typography } from '@apx-ui/ds';
import type { ToggleColor } from '@apx-ui/ds';

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
    <Div display="flex" flexDirection="column" gap="3">
      {COLORS.map((color) => (
        <Div key={color} display="flex" alignItems="center" gap="4">
          <Typography variant="caption" weight="medium" color="fg.muted" className="w-20 capitalize">
            {color}
          </Typography>
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
        </Div>
      ))}
    </Div>
  );
}