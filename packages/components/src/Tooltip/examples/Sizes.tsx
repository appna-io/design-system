import { Button, Div, Tooltip, type TooltipSize } from '@apx-ui/ds';

const SIZES: readonly TooltipSize[] = ['sm', 'md', 'lg'];

export default function Sizes() {
  return (
    <Div display="flex" flexWrap="wrap" gap="4">
      {SIZES.map((size) => (
        <Tooltip
          key={size}
          content={`${size.toUpperCase()} hint`}
          size={size}
          openDelay={150}
        >
          <Button variant="soft" size={size}>
            {size}
          </Button>
        </Tooltip>
      ))}
    </Div>
  );
}