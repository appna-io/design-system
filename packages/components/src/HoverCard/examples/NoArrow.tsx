import { Div, HoverCard, Typography } from '@apx-ui/ds';

/**
 * `<HoverCard.Content showArrow={false}>` removes the SVG arrow. Useful for richer card layouts
 * where the arrow visually competes with the content (e.g. cards with their own header / image
 * region). Side-by-side comparison so Ahmad can see the visual delta.
 */
export default function NoArrow() {
  return (
    <Div display="flex" alignItems="center" gap="8">
      <HoverCard openDelay={200} closeDelay={200}>
        <HoverCard.Trigger>
          <a href="#with-arrow" className="text-primary underline">
            with arrow (default)
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <Typography variant="caption">
            Default card with arrow pointing back at the trigger.
          </Typography>
        </HoverCard.Content>
      </HoverCard>

      <HoverCard openDelay={200} closeDelay={200}>
        <HoverCard.Trigger>
          <a href="#no-arrow" className="text-primary underline">
            no arrow
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content showArrow={false}>
          <Typography variant="caption">
            Same card, no arrow. Cleaner for richer layouts.
          </Typography>
        </HoverCard.Content>
      </HoverCard>
    </Div>
  );
}