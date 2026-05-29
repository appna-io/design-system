import { useState } from 'react';
import { Button, HoverCard } from '@apx-ui/ds';

/**
 * Programmatic open/close — drives the `open` state from a sibling button. Useful for tutorials,
 * onboarding flows, or any case where the consumer wants to surface the card on demand without
 * waiting for a real hover. The trigger still works for natural hover/focus on top of this.
 */
export default function Controlled() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-fg-muted">
        Click the button to open / close the card programmatically. Hover still works too.
      </p>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={() => setOpen((prev) => !prev)}>
          {open ? 'Close card' : 'Open card'}
        </Button>
        <HoverCard open={open} onOpenChange={setOpen}>
          <HoverCard.Trigger>
            <a href="#user-ahmad" className="text-primary underline">
              @ahmad
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <strong className="text-sm">Ahmad Igbaryya</strong>
            <p className="mt-1 text-xs text-fg-muted">
              State is driven by the button — `onOpenChange` fires for hover, focus, blur,
              outside-click, and Esc.
            </p>
          </HoverCard.Content>
        </HoverCard>
      </div>
    </div>
  );
}
