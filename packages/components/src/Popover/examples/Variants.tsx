import { Button, Popover, type PopoverVariant } from '@apx-ui/ds';

const VARIANTS: readonly PopoverVariant[] = ['solid', 'outline', 'soft'];

export default function Variants() {
  return (
    <div className="flex flex-wrap gap-3">
      {VARIANTS.map((variant) => (
        <Popover key={variant}>
          <Popover.Trigger>
            <Button variant="outline">{variant}</Button>
          </Popover.Trigger>
          <Popover.Content variant={variant} color="primary">
            <p className="text-sm font-medium capitalize">{variant} popover</p>
            <p className="mt-1 text-xs opacity-80">
              {variant === 'solid' && 'Color-neutral, paper background, neutral border.'}
              {variant === 'outline' && 'Paper background, colored border accents the brand.'}
              {variant === 'soft' && 'Tinted background + low-opacity colored border.'}
            </p>
          </Popover.Content>
        </Popover>
      ))}
    </div>
  );
}
