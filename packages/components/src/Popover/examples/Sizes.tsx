import { Button, Popover, type PopoverSize } from '@apx-ui/ds';

const SIZES: readonly PopoverSize[] = ['sm', 'md', 'lg'];

export default function Sizes() {
  return (
    <div className="flex flex-wrap gap-3">
      {SIZES.map((size) => (
        <Popover key={size}>
          <Popover.Trigger>
            <Button variant="outline" size={size}>
              {size}
            </Button>
          </Popover.Trigger>
          <Popover.Content size={size}>
            <p className="text-sm">
              Size <code className="font-mono">{size}</code> drives padding + min/max width.
            </p>
          </Popover.Content>
        </Popover>
      ))}
    </div>
  );
}
