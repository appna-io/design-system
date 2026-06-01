import { Div, Progress, Typography, type ProgressVariant } from '@apx-ui/ds';

const VARIANTS: readonly ProgressVariant[] = ['solid', 'soft', 'striped'];

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="4" className="w-full max-w-sm">
      {VARIANTS.map((variant) => (
        <Div key={variant} display="flex" flexDirection="column" gap="1.5">
          <Typography
            as="span"
            variant="caption"
            weight="medium"
            color="fg.muted"
            className="uppercase tracking-wide"
          >
            {variant}
          </Typography>
          <Progress variant={variant} value={62} aria-label={`${variant} progress`} />
        </Div>
      ))}
    </Div>
  );
}