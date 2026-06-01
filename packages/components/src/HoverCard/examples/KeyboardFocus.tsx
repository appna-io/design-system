import { Button, Div, HoverCard, Typography } from '@apx-ui/ds';

/**
 * Demonstrates the `trigger="hover-focus"` (default) vs `trigger="hover"` axis. Tab from the
 * "Start tab" button — the first card opens on focus (keyboard-accessible), the second doesn't
 * (mouse-only — discouraged because it locks out keyboard users).
 */
export default function KeyboardFocus() {
  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="4">
      <Typography variant="bodySmall" color="fg.muted">
        Tab through the controls. The first card opens on focus; the second one only opens on
        hover and is unreachable by keyboard alone.
      </Typography>
      <Button variant="ghost" size="sm">
        Start tab here
      </Button>
      <Div display="flex" alignItems="center" gap="6" className="flex-wrap">
        <HoverCard openDelay={200} closeDelay={200}>
          <HoverCard.Trigger>
            <a href="#focusable" className="text-primary underline">
              hover-focus (default)
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content variant="soft" color="success">
            <strong className="text-sm">Keyboard-accessible</strong>
            <Typography variant="caption" className="mt-1">
              Opens on focus too — Tab brings the cursor here and the card surfaces.
            </Typography>
          </HoverCard.Content>
        </HoverCard>

        <HoverCard trigger="hover" openDelay={200} closeDelay={200}>
          <HoverCard.Trigger>
            <a href="#hover-only" className="text-primary underline">
              hover only (discouraged)
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content variant="soft" color="warning">
            <strong className="text-sm">Mouse-only</strong>
            <Typography variant="caption" className="mt-1">
              Won&rsquo;t open on focus. Use this only when the card content is reachable elsewhere.
            </Typography>
          </HoverCard.Content>
        </HoverCard>
      </Div>
    </Div>
  );
}