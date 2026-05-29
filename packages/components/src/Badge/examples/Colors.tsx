import { Badge, type BadgeColor, type BadgeVariant } from 'apx-ds';

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
    <div className="flex flex-col gap-3">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-fg-muted w-16">
            {variant}
          </span>
          {COLORS.map((color) => (
            <Badge key={color} variant={variant} color={color} withDot>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
}
