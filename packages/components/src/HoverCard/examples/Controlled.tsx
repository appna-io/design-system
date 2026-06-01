import { useState } from 'react';
import { Button, Div, HoverCard, Typography } from '@apx-ui/ds';

/**
 * Programmatic open/close — drives the `open` state from a sibling button. Useful for tutorials,
 * onboarding flows, or any case where the consumer wants to surface the card on demand without
 * waiting for a real hover. The trigger still works for natural hover/focus on top of this.
 */
export default function Controlled() {
  const [open, setOpen] = useState(false);

  return (
    <Div display="flex" flexDirection="column" alignItems="flex-start" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Click the button to open / close the card programmatically. Hover still works too.
      </Typography>
      <Div display="flex" alignItems="center" gap="3">
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
            <Typography variant="caption" color="fg.muted" className="mt-1">
              State is driven by the button — `onOpenChange` fires for hover, focus, blur,
              outside-click, and Esc.
            </Typography>
          </HoverCard.Content>
        </HoverCard>
      </Div>
    </Div>
  );
}