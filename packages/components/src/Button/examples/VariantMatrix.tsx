import { Button, type ButtonColor, type ButtonVariant } from 'apx-ds';

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
    <div className="space-y-3">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-2">
          <span className="w-20 text-xs font-mono uppercase tracking-wide text-fg-muted">
            {variant}
          </span>
          {COLORS.map((color) => (
            <Button key={color} variant={variant} color={color} size="sm">
              {color}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
