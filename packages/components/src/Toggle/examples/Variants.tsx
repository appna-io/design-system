import { Div, ToggleGroup, Typography } from '@apx-ui/ds';

const VARIANTS = ['solid', 'outline', 'ghost'] as const;

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      {VARIANTS.map((variant) => (
        <Div key={variant} display="flex" alignItems="center" gap="4">
          <Typography variant="caption" weight="medium" color="fg.muted" className="w-20 capitalize">
            {variant}
          </Typography>
          <ToggleGroup
            type="single"
            aria-label={`${variant} group`}
            defaultValue="b"
            variant={variant}
            color="primary"
          >
            <ToggleGroup.Item value="a" aria-label="Option A">A</ToggleGroup.Item>
            <ToggleGroup.Item value="b" aria-label="Option B">B</ToggleGroup.Item>
            <ToggleGroup.Item value="c" aria-label="Option C">C</ToggleGroup.Item>
          </ToggleGroup>
        </Div>
      ))}
    </Div>
  );
}