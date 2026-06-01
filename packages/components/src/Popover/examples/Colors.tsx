import { Button, Div, Popover, Typography, type PopoverColor } from '@apx-ui/ds';

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
    <Div display="flex" className="flex-wrap gap-3">
      {COLORS.map((color) => (
        <Popover key={color}>
          <Popover.Trigger>
            <Button variant="outline" size="sm">
              {color}
            </Button>
          </Popover.Trigger>
          <Popover.Content variant="outline" color={color}>
            <Typography variant="bodySmall" weight="medium" className="capitalize">
              {color}
            </Typography>
            <Typography variant="caption" className="mt-1 opacity-80">
              Outline variant uses the colored border + arrow stroke.
            </Typography>
          </Popover.Content>
        </Popover>
      ))}
    </Div>
  );
}