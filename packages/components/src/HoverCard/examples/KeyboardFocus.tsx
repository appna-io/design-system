import { Button, HoverCard } from '@apx-ui/ds';

/**
 * Demonstrates the `trigger="hover-focus"` (default) vs `trigger="hover"` axis. Tab from the
 * "Start tab" button — the first card opens on focus (keyboard-accessible), the second doesn't
 * (mouse-only — discouraged because it locks out keyboard users).
 *
 * The visible label on each trigger states the mode so Ahmad doesn't have to inspect the JSX.
 */
export default function KeyboardFocus() {
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-sm text-fg-muted">
        Tab through the controls. The first card opens on focus; the second one only opens on
        hover and is unreachable by keyboard alone.
      </p>
      <Button variant="ghost" size="sm">
        Start tab here
      </Button>
      <div className="flex flex-wrap items-center gap-6">
        <HoverCard openDelay={200} closeDelay={200}>
          <HoverCard.Trigger>
            <a href="#focusable" className="text-primary underline">
              hover-focus (default)
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content variant="soft" color="success">
            <strong className="text-sm">Keyboard-accessible</strong>
            <p className="mt-1 text-xs">
              Opens on focus too — Tab brings the cursor here and the card surfaces.
            </p>
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
            <p className="mt-1 text-xs">
              Won&rsquo;t open on focus. Use this only when the card content is reachable elsewhere.
            </p>
          </HoverCard.Content>
        </HoverCard>
      </div>
    </div>
  );
}
