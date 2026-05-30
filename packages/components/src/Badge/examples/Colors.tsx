import { Badge, Div, Typography, type BadgeColor, type BadgeVariant } from '@apx-ui/ds';

const COLORS: readonly BadgeColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

const VARIANTS: readonly BadgeVariant[] = ['solid', 'outline', 'soft', 'subtle'];

export default function Colors() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      {VARIANTS.map((variant) => (
        <Div key={variant} display="flex" flexWrap="wrap" alignItems="center" gap="3">
          <Typography
            variant="caption"
            weight="medium"
            color="muted"
            sx={{ textTransform: 'uppercase', letterSpacing: 'wide', width: '4rem' }}
          >
            {variant}
          </Typography>
          {COLORS.map((color) => (
            <Badge key={color} variant={variant} color={color} withDot>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </Badge>
          ))}
        </Div>
      ))}
    </Div>
  );
}
