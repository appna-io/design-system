import { Button, Div, Tooltip, type TooltipPlacement } from '@apx-ui/ds';

const PLACEMENTS: readonly TooltipPlacement[] = [
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
    <Div className="grid grid-cols-3 gap-3">
      {PLACEMENTS.map((placement) => (
        <Tooltip key={placement} content={placement} placement={placement} openDelay={100}>
          <Button variant="outline" size="sm" className="w-full">
            {placement}
          </Button>
        </Tooltip>
      ))}
    </Div>
  );
}