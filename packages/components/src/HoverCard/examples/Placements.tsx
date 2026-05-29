import { HoverCard } from '@apx-ui/ds';
import type { HoverCardPlacement } from '@apx-ui/ds';

/**
 * Six placements arranged in a 3×2 grid so Ahmad can see each anchor side. Floating UI's `flip`
 * middleware is on by default — if a card would overflow the viewport edge, it'll auto-swap to
 * the opposite side. Hover any of the cells to see its anchored placement.
 */
const placements: HoverCardPlacement[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'right',
  'left',
];

export default function Placements() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-fg-muted">Hover each cell to see its placement.</p>
      <div className="grid grid-cols-3 gap-3 max-w-md">
        {placements.map((placement) => (
          <HoverCard key={placement} openDelay={150} closeDelay={150}>
            <HoverCard.Trigger asChild>
              <button
                type="button"
                className="rounded-md border border-border-default bg-bg-paper px-3 py-2 text-sm hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {placement}
              </button>
            </HoverCard.Trigger>
            <HoverCard.Content placement={placement} size="sm">
              <strong className="text-sm">{placement}</strong>
              <p className="mt-1 text-xs text-fg-muted">Anchored to the trigger above.</p>
            </HoverCard.Content>
          </HoverCard>
        ))}
      </div>
    </div>
  );
}
