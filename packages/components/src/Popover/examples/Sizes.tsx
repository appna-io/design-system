import { Button, Div, Popover, Typography, type PopoverSize } from '@apx-ui/ds';

const SIZES: readonly PopoverSize[] = ['sm', 'md', 'lg'];

export default function Sizes() {
  return (
    <Div display="flex" className="flex-wrap gap-3">
      {SIZES.map((size) => (
        <Popover key={size}>
          <Popover.Trigger>
            <Button variant="outline" size={size}>
              {size}
            </Button>
          </Popover.Trigger>
          <Popover.Content size={size}>
            <Typography variant="bodySmall">
              Size <code className="font-mono">{size}</code> drives padding + min/max width.
            </Typography>
          </Popover.Content>
        </Popover>
      ))}
    </Div>
  );
}