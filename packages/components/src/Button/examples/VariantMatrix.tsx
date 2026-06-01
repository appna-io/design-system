import { Button, Div, Typography, type ButtonColor, type ButtonVariant } from '@apx-ui/ds';

const VARIANTS: ButtonVariant[] = ['solid', 'outline', 'ghost'];
const COLORS: ButtonColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

/**
 * The full 3 × 7 grid — every variant × every color in one view. Use this to QA hover, focus,
 * and active states across the whole matrix while flipping mode / variant / platform / theme
 * overrides in the Studio.
 */
export default function VariantMatrix() {
  return (
    <Div className="space-y-3">
      {VARIANTS.map((variant) => (
        <Div key={variant} display="flex" flexWrap="wrap" alignItems="center" gap="2">
          <Typography
            as="span"
            variant="caption"
            color="fg.muted"
            className="w-20 font-mono uppercase tracking-wide"
          >
            {variant}
          </Typography>
          {COLORS.map((color) => (
            <Button key={color} variant={variant} color={color} size="sm">
              {color}
            </Button>
          ))}
        </Div>
      ))}
    </Div>
  );
}