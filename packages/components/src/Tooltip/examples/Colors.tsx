import { Button, Tooltip, type TooltipColor, type TooltipVariant } from 'apx-ds';

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
    <div className="flex flex-col gap-3">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-3">
          <span className="w-16 text-xs font-medium uppercase tracking-wide text-fg-muted">
            {variant}
          </span>
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
        </div>
      ))}
    </div>
  );
}
