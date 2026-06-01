import { Button, Div, Popover, Typography } from '@apx-ui/ds';

/**
 * Stress-tests `useEscapeStack`: an inner Popover opens from inside an outer Popover. Pressing
 * Escape closes only the innermost (topmost) Popover, not both at once. Clicking the inner
 * trigger does not close the outer.
 *
 * This is the same pattern Menu / Combobox will use when they're built on Popover. The escape
 * stack lives at the engine level so every consumer gets ordering for free.
 */
export default function NestedPopover() {
  return (
    <Popover>
      <Popover.Trigger>
        <Button>Outer popover</Button>
      </Popover.Trigger>
      <Popover.Content size="md">
        <Typography variant="bodySmall" weight="medium">
          Outer
        </Typography>
        <Typography variant="caption" color="fg.muted" className="mt-1">
          The inner popover sits on top of this one. Esc closes only the topmost.
        </Typography>
        <Div mt="3">
          <Popover>
            <Popover.Trigger>
              <Button variant="outline" size="sm">
                Open inner
              </Button>
            </Popover.Trigger>
            <Popover.Content size="sm" variant="outline" color="primary">
              <Typography variant="bodySmall">I am the inner popover.</Typography>
            </Popover.Content>
          </Popover>
        </Div>
      </Popover.Content>
    </Popover>
  );
}