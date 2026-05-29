import { HoverCard } from 'apx-ds';

/**
 * `<HoverCard.Content showArrow={false}>` removes the SVG arrow. Useful for richer card layouts
 * where the arrow visually competes with the content (e.g. cards with their own header / image
 * region). Side-by-side comparison so Ahmad can see the visual delta.
 */
export default function NoArrow() {
  return (
    <div className="flex items-center gap-8">
      <HoverCard openDelay={200} closeDelay={200}>
        <HoverCard.Trigger>
          <a href="#with-arrow" className="text-primary underline">
            with arrow (default)
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <p className="text-xs">Default card with arrow pointing back at the trigger.</p>
        </HoverCard.Content>
      </HoverCard>

      <HoverCard openDelay={200} closeDelay={200}>
        <HoverCard.Trigger>
          <a href="#no-arrow" className="text-primary underline">
            no arrow
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content showArrow={false}>
          <p className="text-xs">Same card, no arrow. Cleaner for richer layouts.</p>
        </HoverCard.Content>
      </HoverCard>
    </div>
  );
}
