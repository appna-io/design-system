import { Button, Popover, type PopoverPlacement } from '@apx-ui/ds';

const PLACEMENTS: readonly PopoverPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'right-start',
  'right',
  'right-end',
  'bottom-start',
  'bottom',
  'bottom-end',
  'left-start',
  'left',
  'left-end',
];

export default function Placements() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {PLACEMENTS.map((placement) => (
        <Popover key={placement}>
          <Popover.Trigger>
            <Button variant="outline" size="sm" className="w-full">
              {placement}
            </Button>
          </Popover.Trigger>
          <Popover.Content placement={placement} showArrow>
            <p className="text-sm font-medium">{placement}</p>
            <p className="mt-1 text-xs opacity-80">
              Floating UI flips to the opposite side at viewport edges.
            </p>
          </Popover.Content>
        </Popover>
      ))}
    </div>
  );
}
