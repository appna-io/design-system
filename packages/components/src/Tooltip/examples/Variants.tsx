import { Button, Tooltip, type TooltipVariant } from '@apx-ui/ds';

const VARIANTS: readonly TooltipVariant[] = ['solid', 'outline', 'soft', 'inverted'];

export default function Variants() {
  return (
    <div className="flex flex-wrap gap-4">
      {VARIANTS.map((variant) => (
        <Tooltip
          key={variant}
          content={`${variant} tooltip`}
          variant={variant}
          color="primary"
          openDelay={150}
        >
          <Button variant="soft">{variant}</Button>
        </Tooltip>
      ))}
    </div>
  );
}
