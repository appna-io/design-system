import { Button, Popover, type PopoverColor } from 'apx-ds';

const COLORS: readonly PopoverColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

export default function Colors() {
  return (
    <div className="flex flex-wrap gap-3">
      {COLORS.map((color) => (
        <Popover key={color}>
          <Popover.Trigger>
            <Button variant="outline" size="sm">
              {color}
            </Button>
          </Popover.Trigger>
          <Popover.Content variant="outline" color={color}>
            <p className="text-sm font-medium capitalize">{color}</p>
            <p className="mt-1 text-xs opacity-80">
              Outline variant uses the colored border + arrow stroke.
            </p>
          </Popover.Content>
        </Popover>
      ))}
    </div>
  );
}
