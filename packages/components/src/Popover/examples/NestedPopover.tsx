import { Button, Popover } from 'apx-ds';

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
        <p className="text-sm font-medium">Outer</p>
        <p className="mt-1 text-xs text-fg-muted">
          The inner popover sits on top of this one. Esc closes only the topmost.
        </p>
        <div className="mt-3">
          <Popover>
            <Popover.Trigger>
              <Button variant="outline" size="sm">
                Open inner
              </Button>
            </Popover.Trigger>
            <Popover.Content size="sm" variant="outline" color="primary">
              <p className="text-sm">I am the inner popover.</p>
            </Popover.Content>
          </Popover>
        </div>
      </Popover.Content>
    </Popover>
  );
}
