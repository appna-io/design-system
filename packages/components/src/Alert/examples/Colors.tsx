import { Alert, Div, Typography, type AlertColor, type AlertVariant } from '@apx-ui/ds';

const COLORS: readonly AlertColor[] = ['info', 'success', 'warning', 'danger', 'neutral'];
const VARIANTS: readonly AlertVariant[] = ['solid', 'outline', 'soft', 'inline'];

export default function Colors() {
  return (
    <Div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {VARIANTS.flatMap((variant) =>
        COLORS.map((color) => (
          <Alert key={`${variant}-${color}`} variant={variant} color={color}>
            <strong className="capitalize">{color}</strong> on{' '}
            <Typography as="span" className="capitalize">
              {variant}
            </Typography>
            .
          </Alert>
        )),
      )}
    </Div>
  );
}