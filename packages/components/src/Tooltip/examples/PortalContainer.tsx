import { useRef } from 'react';
import { Button, Div, Tooltip, Typography } from '@apx-ui/ds';

/**
 * `portalContainer` lets you mount the tooltip inside a specific element instead of
 * `document.body`. Useful when nesting tooltips inside a modal/drawer that has its own
 * stacking context — without this override, a body-portaled tooltip would render above the
 * modal's overlay.
 */
export default function PortalContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Tooltip mounts inside the bordered container below (inspect the DOM to verify).
      </Typography>
      <Div
        ref={containerRef}
        className="relative isolate min-h-[80px] rounded-md border border-border-default p-4"
      >
        <Tooltip content="I'm portaled into the bordered host" portalContainer={containerRef.current}>
          <Button variant="soft">Hover</Button>
        </Tooltip>
      </Div>
    </Div>
  );
}