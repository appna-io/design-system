import { Button, Div, Tooltip, Typography, type TooltipColor, type TooltipVariant } from '@apx-ui/ds';

const COLORS: readonly TooltipColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

const VARIANTS: readonly TooltipVariant[] = ['solid', 'outline', 'soft'];

export default function Colors() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      {VARIANTS.map((variant) => (
        <Div key={variant} display="flex" flexWrap="wrap" alignItems="center" gap="3">
          <Typography variant="caption" weight="medium" color="fg.muted" className="w-16 uppercase tracking-wide">
            {variant}
          </Typography>
          {COLORS.map((color) => (
            <Tooltip
              key={color}
              content={color.charAt(0).toUpperCase() + color.slice(1)}
              variant={variant}
              color={color}
              openDelay={150}
            >
              <Button variant="outline" size="sm">
                {color}
              </Button>
            </Tooltip>
          ))}
        </Div>
      ))}
    </Div>
  );
}