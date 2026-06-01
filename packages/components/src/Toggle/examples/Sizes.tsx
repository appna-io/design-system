import { Div, ToggleGroup, Typography } from '@apx-ui/ds';

const SIZES = ['sm', 'md', 'lg'] as const;

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      {SIZES.map((size) => (
        <Div key={size} display="flex" alignItems="center" gap="4">
          <Typography variant="caption" weight="medium" color="fg.muted" className="w-10 uppercase">
            {size}
          </Typography>
          <ToggleGroup
            type="single"
            aria-label={`${size} group`}
            defaultValue="b"
            size={size}
            variant="outline"
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