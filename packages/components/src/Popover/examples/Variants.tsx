import { Button, Div, Popover, Typography, type PopoverVariant } from '@apx-ui/ds';

const VARIANTS: readonly PopoverVariant[] = ['solid', 'outline', 'soft'];

export default function Variants() {
  return (
    <Div display="flex" className="flex-wrap gap-3">
      {VARIANTS.map((variant) => (
        <Popover key={variant}>
          <Popover.Trigger>
            <Button variant="outline">{variant}</Button>
          </Popover.Trigger>
          <Popover.Content variant={variant} color="primary">
            <Typography variant="bodySmall" weight="medium" className="capitalize">
              {variant} popover
            </Typography>
            <Typography variant="caption" className="mt-1 opacity-80">
              {variant === 'solid' && 'Color-neutral, paper background, neutral border.'}
              {variant === 'outline' && 'Paper background, colored border accents the brand.'}
              {variant === 'soft' && 'Tinted background + low-opacity colored border.'}
            </Typography>
          </Popover.Content>
        </Popover>
      ))}
    </Div>
  );
}