import { Div, Spinner, Typography } from '@apx-ui/ds';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export default function AllVariants() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      {(['ring', 'dots', 'pulse'] as const).map((variant) => (
        <Div key={variant} display="flex" flexDirection="column" gap="2">
          <Typography variant="caption" color="fg.muted" weight="semibold">
            {variant}
          </Typography>
          <Div display="flex" alignItems="center" gap="6">
            {SIZES.map((size) => (
              <Spinner key={size} variant={variant} size={size} color="primary" />
            ))}
          </Div>
        </Div>
      ))}
    </Div>
  );
}