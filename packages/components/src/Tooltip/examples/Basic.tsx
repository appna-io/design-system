import { Button, Tooltip } from 'apx-ds';

/**
 * Tooltip is hover/focus driven, not click driven — the button below is the test control. Hover
 * it (or Tab to it from the keyboard) and the tooltip surfaces after a short delay.
 */
export default function Basic() {
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm text-fg-muted">
        Hover the button (or focus it with Tab) to see the tooltip.
      </p>
      <Tooltip content="Saved 3 minutes ago">
        <Button variant="soft">Hover me — Saved</Button>
      </Tooltip>
    </div>
  );
}
